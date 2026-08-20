// Daily scheduled job: nurture sequence for e-book leads that never signed up.
//
// Step day3_reinforce: leads created 72h–120h ago, still without an account →
//   'ebook-nurture-day3'.
// Step day7_coupon: leads created 7+ days ago → 'coupon-offer' (PROMOORCA20),
//   skipped when the lead already became an account AND already got the
//   standard coupon nudge.
//
// Same pattern as send-activation-emails / send-coupon-nudge-email:
// service-role only, claim-first idempotency, sends via
// send-transactional-email (suppression + unsubscribe respected).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const APP_URL = 'https://orca-mento.app'
const COUPON_CODE = 'PROMOORCA20'
const DAY3_START_HOURS = 72
const DAY3_END_HOURS = 120
const DAY7_HOURS = 7 * 24
const SCAN_LIMIT = 500

interface Lead {
  id: string
  email: string
  name: string | null
  created_at: string
}

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
  const now = Date.now()

  const firstName = (name: string | null) =>
    (name || '').trim().split(/\s+/)[0] || undefined

  // Returns the profile row for this email, or null when the lead never signed up.
  const profileFor = async (email: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle()
    return data ?? null
  }

  const claim = async (leadId: string, step: string) => {
    const { error } = await supabase
      .from('ebook_nurture_log')
      .insert({ ebook_lead_id: leadId, step })
    return !error
  }

  const release = async (leadId: string, step: string) => {
    await supabase
      .from('ebook_nurture_log')
      .delete()
      .eq('ebook_lead_id', leadId)
      .eq('step', step)
  }

  let sentDay3 = 0
  let sentDay7 = 0
  let skipped = 0

  // ---------- Step 1: day3_reinforce ----------
  const day3End = new Date(now - DAY3_START_HOURS * 3600_000).toISOString()
  const day3Start = new Date(now - DAY3_END_HOURS * 3600_000).toISOString()

  const { data: day3Leads, error: day3Error } = await supabase
    .from('ebook_leads')
    .select('id, email, name, created_at')
    .gte('created_at', day3Start)
    .lte('created_at', day3End)
    .limit(SCAN_LIMIT)

  if (day3Error) {
    console.error('Failed to load day3 leads', day3Error)
    return new Response(JSON.stringify({ error: 'failed_to_load_leads' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  for (const lead of (day3Leads ?? []) as Lead[]) {
    if (!lead.email) { skipped++; continue }

    // Already an account → covered by send-activation-emails.
    if (await profileFor(lead.email)) { skipped++; continue }

    if (!(await claim(lead.id, 'day3_reinforce'))) { skipped++; continue }

    const { error: sendError } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'ebook-nurture-day3',
        recipientEmail: lead.email,
        idempotencyKey: `ebook-nurture-day3-${lead.id}`,
        templateData: { firstName: firstName(lead.name), appUrl: APP_URL },
      },
    })

    if (sendError) {
      console.error('Day3 nurture email failed', { leadId: lead.id, sendError })
      await release(lead.id, 'day3_reinforce')
      skipped++
      continue
    }

    sentDay3++
  }

  // ---------- Step 2: day7_coupon ----------
  const day7End = new Date(now - DAY7_HOURS * 3600_000).toISOString()
  const scanFrom = new Date(now - 180 * 86_400_000).toISOString()

  const { data: day7Leads, error: day7Error } = await supabase
    .from('ebook_leads')
    .select('id, email, name, created_at')
    .gte('created_at', scanFrom)
    .lte('created_at', day7End)
    .order('created_at', { ascending: false })
    .limit(SCAN_LIMIT)

  if (day7Error) {
    console.error('Failed to load day7 leads', day7Error)
    return new Response(JSON.stringify({ error: 'failed_to_load_leads' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  for (const lead of (day7Leads ?? []) as Lead[]) {
    if (!lead.email) { skipped++; continue }

    const profile = await profileFor(lead.email)
    if (profile) {
      // Became an account: skip only if the standard coupon nudge already went out.
      const { data: couponLog } = await supabase
        .from('coupon_email_log')
        .select('user_id')
        .eq('user_id', profile.id)
        .maybeSingle()
      if (couponLog) { skipped++; continue }
    }

    if (!(await claim(lead.id, 'day7_coupon'))) { skipped++; continue }

    const { error: sendError } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'coupon-offer',
        recipientEmail: lead.email,
        idempotencyKey: `ebook-nurture-day7-${lead.id}`,
        templateData: {
          firstName: firstName(lead.name),
          couponCode: COUPON_CODE,
          appUrl: APP_URL,
        },
      },
    })

    if (sendError) {
      console.error('Day7 coupon email failed', { leadId: lead.id, sendError })
      await release(lead.id, 'day7_coupon')
      skipped++
      continue
    }

    sentDay7++
  }

  console.log('E-book nurture run finished', { sentDay3, sentDay7, skipped })

  return new Response(JSON.stringify({ success: true, sentDay3, sentDay7, skipped }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
