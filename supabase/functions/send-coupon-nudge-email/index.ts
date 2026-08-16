// Daily scheduled job: one-time coupon nudge for free-plan accounts.
//
// Eligible: account is still on the free plan (no active paid plan) AND either
// 10+ days old since profiles.created_at OR already used all free proposals
// (free plan max_proposals) — whichever comes first.
//
// Sending goes through send-transactional-email, so suppression list and
// unsubscribe handling are respected. coupon_email_log (unique user_id) makes
// sure each account receives this email exactly once, ever.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const COUPON_CODE = 'PROMOORCA20'
const DAYS_THRESHOLD = 10
const APP_URL = 'https://orca-mento.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const auth = req.headers.get('Authorization') || ''
  if (auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Free plan limit (fallback 3 if not configured)
  const { data: freePlan } = await supabase
    .from('plans')
    .select('id, max_proposals')
    .eq('is_starter', true)
    .maybeSingle()
  const freeLimit = freePlan?.max_proposals ?? 3

  // Candidates: accounts created in the last 180 days (bounded scan).
  const scanFrom = new Date(Date.now() - 180 * 86_400_000).toISOString()
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .gte('created_at', scanFrom)
    .order('created_at', { ascending: true })
    .limit(500)

  if (profilesError) {
    console.error('Failed to load profiles', profilesError)
    return new Response(JSON.stringify({ error: 'failed_to_load_profiles' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const tenDaysAgo = Date.now() - DAYS_THRESHOLD * 86_400_000
  let sent = 0
  let skipped = 0

  for (const profile of profiles ?? []) {
    if (!profile.email) { skipped++; continue }

    // Already converted? Any active plan that is not the starter plan.
    const { data: paidPlans, error: planError } = await supabase
      .from('user_plans')
      .select('id, plan_id, plans!inner(is_starter)')
      .eq('user_id', profile.id)
      .eq('status', 'active')

    if (planError) { skipped++; continue }
    const converted = (paidPlans ?? []).some(
      // deno-lint-ignore no-explicit-any
      (p: any) => p.plans && p.plans.is_starter === false,
    )
    if (converted) { skipped++; continue }

    const { count, error: countError } = await supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    if (countError) { skipped++; continue }

    const isOldEnough = new Date(profile.created_at).getTime() <= tenDaysAgo
    const hitLimit = freeLimit > 0 && (count ?? 0) >= freeLimit
    if (!isOldEnough && !hitLimit) { skipped++; continue }

    // Idempotency: claim first. Unique user_id prevents any duplicate send.
    const { error: claimError } = await supabase
      .from('coupon_email_log')
      .insert({ user_id: profile.id, coupon_code: COUPON_CODE, reason: hitLimit ? 'limit_reached' : 'ten_days' })

    if (claimError) { skipped++; continue }

    const firstName = (profile.full_name || '').trim().split(/\s+/)[0] || undefined

    const { error: sendError } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'coupon-offer',
        recipientEmail: profile.email,
        idempotencyKey: `coupon-nudge-${profile.id}`,
        templateData: { firstName, couponCode: COUPON_CODE, appUrl: APP_URL },
      },
    })

    if (sendError) {
      console.error('Coupon email failed', { userId: profile.id, sendError })
      await supabase.from('coupon_email_log').delete().eq('user_id', profile.id)
      skipped++
      continue
    }

    sent++
  }

  console.log('Coupon nudge run finished', { candidates: profiles?.length ?? 0, sent, skipped })

  return new Response(JSON.stringify({ success: true, sent, skipped }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
