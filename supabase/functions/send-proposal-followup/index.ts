// Daily scheduled job: follow-up nudge for proposals with no answer.
//
// Eligible: proposal in a non-final status (Enviada / Visualizada), older than
// 48h and younger than 30 days, owner has an email. One reminder per proposal,
// ever — guaranteed by the unique proposal_id in proposal_followup_log.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const MIN_HOURS = 48
const MAX_DAYS = 30
const APP_URL = 'https://orca-mento.app'

function formatMoney(amount: number, currency = 'BRL') {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
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
  const notNewerThan = new Date(now - MIN_HOURS * 3600_000).toISOString()
  const notOlderThan = new Date(now - MAX_DAYS * 86_400_000).toISOString()

  const { data: proposals, error: proposalsError } = await supabase
    .from('proposals')
    .select('id, user_id, title, total_amount, currency, created_at, clients(name), proposal_statuses!inner(name, is_final)')
    .eq('proposal_statuses.is_final', false)
    .neq('proposal_statuses.name', 'Rascunho')
    .lte('created_at', notNewerThan)
    .gte('created_at', notOlderThan)
    .limit(300)

  if (proposalsError) {
    console.error('Failed to load proposals', proposalsError)
    return new Response(JSON.stringify({ error: 'failed_to_load_proposals' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let sent = 0
  let skipped = 0

  for (const proposal of proposals ?? []) {
    // Idempotency: claim first (unique proposal_id).
    const { error: claimError } = await supabase
      .from('proposal_followup_log')
      .insert({ proposal_id: proposal.id, user_id: proposal.user_id })
    if (claimError) { skipped++; continue }

    const { data: owner } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', proposal.user_id)
      .maybeSingle()

    if (!owner?.email) { skipped++; continue }

    const { count: viewCount } = await supabase
      .from('proposal_views')
      .select('id', { count: 'exact', head: true })
      .eq('proposal_id', proposal.id)

    const daysWaiting = Math.max(
      1,
      Math.floor((now - new Date(proposal.created_at).getTime()) / 86_400_000),
    )

    const { error: sendError } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'proposal-followup',
        recipientEmail: owner.email,
        idempotencyKey: `followup-${proposal.id}`,
        templateData: {
          firstName: (owner.full_name || '').trim().split(/\s+/)[0] || undefined,
          // deno-lint-ignore no-explicit-any
          clientName: (proposal as any).clients?.name || undefined,
          proposalTitle: proposal.title,
          proposalTotal: formatMoney(Number(proposal.total_amount), proposal.currency || 'BRL'),
          daysWaiting,
          wasViewed: (viewCount ?? 0) > 0,
          appProposalUrl: `${APP_URL}/proposals/${proposal.id}`,
        },
      },
    })

    if (sendError) {
      console.error('Follow-up email failed', { proposalId: proposal.id, sendError })
      await supabase.from('proposal_followup_log').delete().eq('proposal_id', proposal.id)
      skipped++
      continue
    }

    sent++
  }

  console.log('Follow-up run finished', { candidates: proposals?.length ?? 0, sent, skipped })

  return new Response(JSON.stringify({ success: true, sent, skipped }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
