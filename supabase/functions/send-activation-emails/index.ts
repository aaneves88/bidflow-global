// Daily scheduled job: 48h activation nudge for new accounts.
//
// Finds profiles created ~48h ago (window: 48h–96h to tolerate missed runs),
// checks whether the user already created at least one proposal, and sends
// either the "progress" or the "stuck" activation email — once per account.
//
// Sending goes through send-transactional-email, so suppression list and
// unsubscribe handling are respected exactly like every other app email.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const WINDOW_START_HOURS = 48
const WINDOW_END_HOURS = 96

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Only the scheduler (service role) may trigger this job.
  const auth = req.headers.get('Authorization') || ''
  if (auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

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
      .from('activation_email_log')
      .insert({ user_id: profile.id, template_name: 'pending' })

    if (claimError) { skipped++; continue }

    const { count, error: countError } = await supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    if (countError) {
      console.error('Proposal count failed', { userId: profile.id, countError })
      await supabase.from('activation_email_log').delete().eq('user_id', profile.id)
      skipped++
      continue
    }

    const templateName = (count ?? 0) > 0 ? 'activation-progress' : 'activation-stuck'
    const firstName = (profile.full_name || '').trim().split(/\s+/)[0] || undefined

    const { error: sendError } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName,
        recipientEmail: profile.email,
        idempotencyKey: `activation-48h-${profile.id}`,
        templateData: { firstName, appUrl: 'https://orca-mento.app' },
      },
    })

    if (sendError) {
      console.error('Activation email failed', { userId: profile.id, sendError })
      await supabase.from('activation_email_log').delete().eq('user_id', profile.id)
      skipped++
      continue
    }

    await supabase
      .from('activation_email_log')
      .update({ template_name: templateName })
      .eq('user_id', profile.id)

    sent++
  }

  console.log('Activation run finished', { candidates: profiles?.length ?? 0, sent, skipped })

  return new Response(JSON.stringify({ success: true, sent, skipped }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
