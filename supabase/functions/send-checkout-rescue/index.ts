// Daily scheduled job: one-time rescue email for accounts that opened checkout
// (product_events.checkout_started) 1–14 days ago and still have no paid plan.
// checkout_rescue_log (unique user_id) guarantees one email per account, ever.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAppEmail } from '../_shared/app-email.ts'

const APP_URL = 'https://orca-mento.app'
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

  const { data: tokenRow } = await supabase
    .from('internal_secrets').select('value').eq('key', 'email_queue_token').maybeSingle()
  const valid = new Set(
    [`Bearer ${serviceKey}`, tokenRow?.value ? `Bearer ${tokenRow.value}` : null].filter(Boolean) as string[],
  )
  if (!valid.has(req.headers.get('Authorization') || '')) return json({ error: 'unauthorized' }, 401)

  const now = Date.now()
  const { data: events, error } = await supabase
    .from('product_events')
    .select('user_id')
    .eq('event_name', 'checkout_started')
    .not('user_id', 'is', null)
    .lte('created_at', new Date(now - 86_400_000).toISOString())
    .gte('created_at', new Date(now - 14 * 86_400_000).toISOString())
    .limit(1000)
  if (error) return json({ error: 'failed_to_load_events' }, 500)

  const userIds = [...new Set((events ?? []).map((e) => e.user_id as string))]
  let sent = 0
  let skipped = 0

  const INTERNAL = new Set(['ssloboda@gmail.com', 'nvs.camilla5@gmail.com', 'aaneves88@gmail.com'])
  const { data: admins } = await supabase.from('user_roles').select('user_id').eq('role', 'admin')
  const adminIds = new Set((admins ?? []).map((a) => a.user_id as string))

  for (const userId of userIds) {
    if (adminIds.has(userId)) { skipped++; continue }
    const { data: plans } = await supabase
      .from('user_plans').select('id, plans!inner(is_starter)').eq('user_id', userId).eq('status', 'active')
    // deno-lint-ignore no-explicit-any
    if ((plans ?? []).some((p: any) => p.plans?.is_starter === false)) { skipped++; continue }

    // Ainda mexeu no pagamento nas últimas 24h? Espera o próximo dia.
    const { count: recent } = await supabase
      .from('product_events').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('event_name', 'checkout_started')
      .gt('created_at', new Date(now - 86_400_000).toISOString())
    if ((recent ?? 0) > 0) { skipped++; continue }

    const { data: profile } = await supabase
      .from('profiles').select('email, full_name').eq('id', userId).maybeSingle()
    if (!profile?.email || INTERNAL.has(profile.email.toLowerCase())) { skipped++; continue }

    const { error: claimError } = await supabase.from('checkout_rescue_log').insert({ user_id: userId })
    if (claimError) { skipped++; continue }

    const sendError = await sendAppEmail(supabase, 'checkout-rescue', profile.email, {
      idempotencyKey: `checkout-rescue-${userId}`,
      templateData: {
        firstName: (profile.full_name || '').trim().split(/\s+/)[0] || undefined,
        appUrl: APP_URL,
      },
    }).then(() => null, (e: unknown) => e as Error)

    if (sendError) {
      console.error('Checkout rescue email failed', { userId, sendError })
      await supabase.from('checkout_rescue_log').delete().eq('user_id', userId)
      skipped++
      continue
    }
    sent++
  }

  console.log('Checkout rescue run finished', { candidates: userIds.length, sent, skipped })
  return json({ success: true, sent, skipped })
})
