// Admin "Envios" panel backend: lists recipients, previews templates and
// sends announcement emails through the connected Brevo account.
//
// Actions (POST JSON):
//   { action: 'recipients' } -> all profiles with email + suppressed flag.
//   { action: 'preview', templateId } or { action: 'preview', custom: { subject, body } }
//       -> rendered HTML sample.
//   { action: 'send', templateId | custom, emails: string[] }
//       -> sends one message per recipient, logging each in email_send_log.
//
// Rules: suppressed_emails are never emailed; fixed templates marked
// oncePerRecipient skip recipients with a prior 'sent' log row.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import {
  APP_URL,
  getTemplate,
  renderCustomHtml,
  renderCustomText,
} from './templates.ts'

const SENDER_NAME = 'Orca'
const SENDER_EMAIL = 'statematch@statematch.global'
const REPLY_TO = 'statematch@statematch.global'
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo/smtp/email'
const MAX_RECIPIENTS_PER_SEND = 200

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const brevoKey = Deno.env.get('BREVO_API_KEY')
  if (!lovableKey || !brevoKey) return json({ error: 'missing_gateway_credentials' }, 500)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Admin-only: the caller must be signed in and have the admin role.
  const auth = req.headers.get('Authorization') || ''
  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: auth } } },
  )
  const { data: userData } = await callerClient.auth.getUser()
  if (!userData.user) return json({ error: 'unauthorized' }, 401)
  const { data: isAdmin } = await admin.rpc('has_role', {
    _user_id: userData.user.id,
    _role: 'admin',
  })
  if (!isAdmin) return json({ error: 'forbidden' }, 403)

  const body = await req.json().catch(() => ({}))
  const action = typeof body.action === 'string' ? body.action : ''

  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .not('email', 'is', null)
  if (profilesError) return json({ error: 'failed_to_load_profiles' }, 500)

  const { data: suppressed } = await admin.from('suppressed_emails').select('email')
  const suppressedSet = new Set((suppressed ?? []).map((r) => r.email.toLowerCase()))

  if (action === 'recipients') {
    return json({
      recipients: (profiles ?? []).map((p) => ({
        id: p.id,
        email: (p.email as string).toLowerCase(),
        full_name: p.full_name ?? null,
        suppressed: suppressedSet.has((p.email as string).toLowerCase()),
      })),
    })
  }

  // Resolve the message content: fixed template or custom subject/body.
  let templateId: string
  let subject: string
  let oncePerRecipient: boolean
  let renderHtml: (unsubscribeUrl: string) => string
  let renderText: (unsubscribeUrl: string) => string

  if (typeof body.templateId === 'string' && body.templateId) {
    const template = getTemplate(body.templateId)
    if (!template) return json({ error: 'unknown_template' }, 400)
    templateId = template.id
    subject = template.subject
    oncePerRecipient = template.oncePerRecipient
    renderHtml = template.renderHtml
    renderText = template.renderText
  } else if (body.custom && typeof body.custom === 'object') {
    const customSubject = String(body.custom.subject ?? '').trim()
    const customBody = String(body.custom.body ?? '').trim()
    if (!customSubject || customSubject.length > 150) {
      return json({ error: 'invalid_custom_subject' }, 400)
    }
    if (!customBody || customBody.length > 5000) {
      return json({ error: 'invalid_custom_body' }, 400)
    }
    templateId = 'custom'
    subject = customSubject
    oncePerRecipient = false
    renderHtml = (url) => renderCustomHtml(customSubject, customBody, url)
    renderText = (url) => renderCustomText(customBody, url)
  } else {
    return json({ error: 'templateId_or_custom_required' }, 400)
  }

  if (action === 'preview') {
    return json({
      subject,
      sender: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      sampleHtml: renderHtml(`${APP_URL}/unsubscribe?token=EXEMPLO`),
    })
  }

  // Test send: only to the calling admin, ignores once-per-recipient,
  // logged as 'test' so it never blocks the real send.
  if (action === 'test') {
    const email = (userData.user.email ?? '').toLowerCase()
    if (!EMAIL_RE.test(email)) return json({ error: 'no_admin_email' }, 400)
    const unsubscribeUrl = `${APP_URL}/unsubscribe?token=TESTE`
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lovableKey}`,
        'X-Connection-Api-Key': brevoKey,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email }],
        replyTo: { email: REPLY_TO },
        subject: `[Teste] ${subject}`,
        htmlContent: renderHtml(unsubscribeUrl),
        textContent: renderText(unsubscribeUrl),
        tags: [templateId, 'test'],
      }),
    })
    const ok = response.ok
    const errText = ok ? null : `brevo ${response.status}: ${await response.text()}`
    await admin.from('email_send_log').insert({
      message_id: null,
      template_name: templateId,
      recipient_email: email,
      status: ok ? 'test' : 'failed',
      error_message: errText,
    })
    if (!ok) return json({ error: 'send_failed', details: errText }, 502)
    return json({ success: true, email })
  }

  if (action !== 'send') return json({ error: 'unknown_action' }, 400)

  if (!Array.isArray(body.emails) || body.emails.length === 0) {
    return json({ error: 'emails_required' }, 400)
  }
  const requested = [
    ...new Set(
      body.emails
        .map((e: unknown) => String(e).trim().toLowerCase())
        .filter((e: string) => EMAIL_RE.test(e)),
    ),
  ]
  if (requested.length === 0) return json({ error: 'emails_required' }, 400)
  if (requested.length > MAX_RECIPIENTS_PER_SEND) {
    return json({ error: 'too_many_recipients', max: MAX_RECIPIENTS_PER_SEND }, 400)
  }

  // Only send to real profiles, never to suppressed addresses.
  const knownEmails = new Set(
    (profiles ?? []).map((p) => (p.email as string).toLowerCase()),
  )
  let recipients = requested.filter((e) => knownEmails.has(e) && !suppressedSet.has(e))

  if (oncePerRecipient) {
    const { data: alreadySent } = await admin
      .from('email_send_log')
      .select('recipient_email')
      .eq('template_name', templateId)
      .eq('status', 'sent')
    const sentSet = new Set((alreadySent ?? []).map((r) => r.recipient_email.toLowerCase()))
    recipients = recipients.filter((e) => !sentSet.has(e))
  }

  let sent = 0
  let failed = 0
  const failures: Array<{ email: string; error: string }> = []

  for (const email of recipients) {
    const log = async (status: 'sent' | 'failed', error_message?: string) => {
      await admin.from('email_send_log').insert({
        message_id: null,
        template_name: templateId,
        recipient_email: email,
        status,
        error_message: error_message ?? null,
      })
    }

    try {
      // Reuse the existing unsubscribe-token mechanism: one unused token per email.
      let { data: tokenRow } = await admin
        .from('email_unsubscribe_tokens')
        .select('token')
        .eq('email', email)
        .is('used_at', null)
        .maybeSingle()
      if (!tokenRow) {
        const { data: created, error: tokenError } = await admin
          .from('email_unsubscribe_tokens')
          .insert({ email, token: crypto.randomUUID() })
          .select('token')
          .single()
        if (tokenError) throw new Error(`token: ${tokenError.message}`)
        tokenRow = created
      }

      const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${encodeURIComponent(tokenRow.token)}`

      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': brevoKey,
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email }],
          replyTo: { email: REPLY_TO },
          subject,
          htmlContent: renderHtml(unsubscribeUrl),
          textContent: renderText(unsubscribeUrl),
          tags: [templateId],
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`brevo ${response.status}: ${errorBody}`)
      }

      await log('sent')
      sent++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('broadcast send failed', { email, message })
      await log('failed', message)
      failures.push({ email, error: message })
      failed++
    }
  }

  return json({ success: true, sent, failed, skipped: requested.length - recipients.length, failures })
})
