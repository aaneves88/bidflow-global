// Daily scheduled job: 7-day feedback request for new accounts.
//
// Finds profiles created ~7 days ago (window: 7–9 days to tolerate missed
// runs), skips anyone who already sent feedback through the support system,
// and sends the "feedback-request" email — once per account. Replies go to
// the company support inbox via reply-to.
//
// Sending goes through the managed app-email helper; suppression and
// unsubscribe handling are respected exactly like every other app email.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAppEmail } from '../_shared/app-email.ts'

const WINDOW_START_HOURS = 7 * 24
const WINDOW_END_HOURS = 9 * 24
const SUPPORT_INBOX = 'statematch@statematch.global'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, serviceKey)

  // The scheduler authenticates with the internal cron token; direct calls
  // with the service role key are still accepted.
  const { data: tokenRow } = await supabase
    .from('internal_secrets')
    .select('value')
    .eq('key', 'email_queue_token')
    .maybeSingle()
  const validTokens = new Set(
    [`Bearer ${serviceKey}`, tokenRow?.value ? `Bearer ${tokenRow.value}` : null].filter(Boolean) as string[],
  )

  const auth = req.headers.get('Authorization') || ''
  if (!validTokens.has(auth)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const now = Date.now()
  const windowEnd = new Date(now - WINDOW_START_HOURS * 3600_000).toISOString()
  const windowStart = new Date(now - WINDOW_END_HOURS * 3600_000).toISOString()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .gte('created_at', windowStart)
    .lte('created_at', windowEnd)
    .limit(500)

  if (profilesError) {
    console.error('Failed to load profiles', profilesError)
    return new Response(JSON.stringify({ error: 'failed_to_load_profiles' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let sent = 0
  let skipped = 0

  for (const profile of profiles ?? []) {
    if (!profile.email) { skipped++; continue }

    // Idempotency: claim the send first. Unique index on user_id means a second
    // run (or a concurrent one) fails here and never duplicates the email.
    const { error: claimError } = await supabase
      .from('feedback_email_log')
      .insert({ user_id: profile.id })

    if (claimError) { skipped++; continue }

    // Skip users who already gave feedback on their own — no need to ask.
    const { count, error: countError } = await supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('category', 'feedback')

    if (countError) {
      console.error('Feedback ticket count failed', { userId: profile.id, countError })
      await supabase.from('feedback_email_log').delete().eq('user_id', profile.id)
      skipped++
      continue
    }

    if ((count ?? 0) > 0) { skipped++; continue }

    const firstName = (profile.full_name || '').trim().split(/\s+/)[0] || undefined

    const sendError = await sendAppEmail(supabase, 'feedback-request', profile.email, {
      idempotencyKey: `feedback-7d-${profile.id}`,
      replyTo: SUPPORT_INBOX,
      templateData: { firstName, appUrl: 'https://orca-mento.app' },
    }).then(() => null, (e: unknown) => e as Error)

    if (sendError) {
      console.error('Feedback email failed', { userId: profile.id, sendError })
      await supabase.from('feedback_email_log').delete().eq('user_id', profile.id)
      skipped++
      continue
    }

    sent++
  }

  console.log('Feedback run finished', { candidates: profiles?.length ?? 0, sent, skipped })

  return new Response(JSON.stringify({ success: true, sent, skipped }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
