// One-shot announcement email ("novidades-pagamento-ajuda") sent through the
// connected Brevo account. Admin-only.
//
// Modes:
//   { dryRun: true }  -> returns recipient count + the final rendered HTML.
//   { confirm: true } -> sends to every eligible profile, one message per
//                        recipient, logging each send in email_send_log.
//
// Eligible = profiles with email, not in suppressed_emails, and without a
// prior 'sent' log row for this template (safe to re-run after failures).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const TEMPLATE_NAME = 'novidades-pagamento-ajuda'
const APP_URL = 'https://orca-mento.app'
const LOGO_URL =
  'https://orca-mento.app/__l5e/assets-v1/a11affce-f92c-41ef-8ff0-03f3191be367/orca-mark.png'
const SENDER_NAME = 'Orca'
const SENDER_EMAIL = 'statematch@statematch.global'
const REPLY_TO = 'statematch@statematch.global'
const SUBJECT = 'Novidades no Orca: pagamento por link e central de ajuda'
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo/smtp/email'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

function renderHtml(unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;margin:0;padding:32px 0;">
  <div style="background-color:#ffffff;border-radius:16px;border:1px solid #E2E8F0;padding:0;margin:0 auto;max-width:560px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#06B6D4 0%,#0891B2 100%);padding:24px;text-align:center;">
      <img src="${LOGO_URL}" alt="Orca" width="56" height="56" style="display:inline-block;" />
    </div>
    <div style="padding:32px 28px;">
      <h1 style="color:#0F172A;font-size:22px;line-height:1.3;margin:0 0 16px;">Novidades no Orca 🐋</h1>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">Oi!</p>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">Duas novidades que podem facilitar seu dia a dia no Orca:</p>
      <div style="background-color:#F0FDFA;border:1px solid #CCFBF1;border-radius:12px;padding:16px 18px;margin:0 0 16px;">
        <p style="color:#0F172A;font-size:15px;font-weight:700;margin:0 0 6px;">💳 Pagamento por link direto na proposta</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">Agora é possível adicionar um link de pagamento (cartão de crédito) em qualquer proposta — ele aparece tanto na página pública da proposta quanto no PDF, ao lado do QR Code do PIX. Seu cliente escolhe como prefere pagar, sem sair da proposta.</p>
      </div>
      <div style="background-color:#F0FDFA;border:1px solid #CCFBF1;border-radius:12px;padding:16px 18px;margin:0 0 20px;">
        <p style="color:#0F172A;font-size:15px;font-weight:700;margin:0 0 6px;">📚 Central de Ajuda e Tutoriais</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">Criamos uma área com vídeos curtos mostrando como usar o Orca na prática: criar cliente, criar e gerenciar proposta, como abordar um cliente, precificação, dicas pra quem é MEI ou está no Simples. Está disponível direto no menu, em "Ajuda e tutoriais".</p>
      </div>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">Qualquer dúvida, só responder este e-mail.</p>
      <p style="color:#0F172A;font-size:15px;font-weight:600;margin:0;">Equipe Orca</p>
    </div>
    <div style="border-top:1px solid #E2E8F0;padding:16px 28px;text-align:center;">
      <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:0;">
        Você recebeu este e-mail porque tem uma conta no <a href="${APP_URL}" style="color:#0891B2;text-decoration:none;">Orca</a>.
        <br /><a href="${unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Descadastrar-se destes e-mails</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function renderText(unsubscribeUrl: string): string {
  return `Oi!

Duas novidades que podem facilitar seu dia a dia no Orca:

PAGAMENTO POR LINK DIRETO NA PROPOSTA
Agora é possível adicionar um link de pagamento (cartão de crédito) em qualquer proposta — ele aparece tanto na página pública da proposta quanto no PDF, ao lado do QR Code do PIX. Seu cliente escolhe como prefere pagar, sem sair da proposta.

CENTRAL DE AJUDA E TUTORIAIS
Criamos uma área com vídeos curtos mostrando como usar o Orca na prática: criar cliente, criar e gerenciar proposta, como abordar um cliente, precificação, dicas pra quem é MEI ou está no Simples. Está disponível direto no menu, em "Ajuda e tutoriais".

Qualquer dúvida, só responder este e-mail.

Equipe Orca

---
Para se descadastrar destes e-mails: ${unsubscribeUrl}`
}

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
  const dryRun = body.dryRun === true
  const confirm = body.confirm === true
  if (!dryRun && !confirm) return json({ error: 'dryRun_or_confirm_required' }, 400)

  // Eligible recipients
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, email')
    .not('email', 'is', null)
  if (profilesError) return json({ error: 'failed_to_load_profiles' }, 500)

  const { data: suppressed } = await admin.from('suppressed_emails').select('email')
  const suppressedSet = new Set((suppressed ?? []).map((r) => r.email.toLowerCase()))

  const { data: alreadySent } = await admin
    .from('email_send_log')
    .select('recipient_email')
    .eq('template_name', TEMPLATE_NAME)
    .eq('status', 'sent')
  const sentSet = new Set((alreadySent ?? []).map((r) => r.recipient_email.toLowerCase()))

  const recipients = (profiles ?? [])
    .map((p) => ({ id: p.id as string, email: (p.email as string).toLowerCase() }))
    .filter((p) => !suppressedSet.has(p.email) && !sentSet.has(p.email))

  if (dryRun) {
    return json({
      recipients: recipients.length,
      sampleHtml: renderHtml(`${APP_URL}/unsubscribe?token=EXEMPLO`),
      subject: SUBJECT,
      sender: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    })
  }

  let sent = 0
  let failed = 0
  const failures: Array<{ email: string; error: string }> = []

  for (const recipient of recipients) {
    const log = async (status: 'sent' | 'failed', error_message?: string) => {
      await admin.from('email_send_log').insert({
        message_id: null,
        template_name: TEMPLATE_NAME,
        recipient_email: recipient.email,
        status,
        error_message: error_message ?? null,
      })
    }

    try {
      // Reuse the existing unsubscribe-token mechanism: one unused token per email.
      let { data: tokenRow } = await admin
        .from('email_unsubscribe_tokens')
        .select('token')
        .eq('email', recipient.email)
        .is('used_at', null)
        .maybeSingle()
      if (!tokenRow) {
        const { data: created, error: tokenError } = await admin
          .from('email_unsubscribe_tokens')
          .insert({ email: recipient.email, token: crypto.randomUUID() })
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
          to: [{ email: recipient.email }],
          replyTo: { email: REPLY_TO },
          subject: SUBJECT,
          htmlContent: renderHtml(unsubscribeUrl),
          textContent: renderText(unsubscribeUrl),
          tags: [TEMPLATE_NAME],
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
      console.error('announcement send failed', { email: recipient.email, message })
      await log('failed', message)
      failures.push({ email: recipient.email, error: message })
      failed++
    }
  }

  return json({ success: true, sent, failed, failures })
})
