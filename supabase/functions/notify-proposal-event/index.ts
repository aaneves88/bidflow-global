// Sends a branded notification email to the proposal OWNER when a public event happens.
// Callable from anon (public proposal page) — security comes from requiring the proposal's
// public_code, never trusting client-supplied recipient info.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

type EventType = 'viewed' | 'accepted' | 'signed' | 'rejected'

interface Body {
  publicCode: string
  event: EventType
  signerName?: string
  reason?: string
}

const APP_URL = 'https://orca-mento.app'

function formatBRL(amount: number, currency = 'BRL') {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  let body: Body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const { publicCode, event } = body
  if (!publicCode || !event) {
    return new Response(JSON.stringify({ error: 'publicCode and event are required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch proposal + client (service role bypasses RLS — safe; we only resolve owner)
  const { data: proposal, error: pErr } = await supabase
    .from('proposals')
    .select('id, user_id, title, total_amount, currency, public_code, clients(name, email)')
    .eq('public_code', publicCode)
    .maybeSingle()

  if (pErr || !proposal) {
    console.error('Proposal lookup failed', { pErr, publicCode })
    return new Response(JSON.stringify({ error: 'proposal_not_found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: owner } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', proposal.user_id)
    .maybeSingle()

  if (!owner?.email) {
    console.warn('Owner has no email — skipping', { user_id: proposal.user_id })
    return new Response(JSON.stringify({ skipped: true, reason: 'owner_no_email' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const clientName = (proposal as any).clients?.name || null
  const proposalTotal = formatBRL(Number(proposal.total_amount), proposal.currency || 'BRL')
  const appProposalUrl = `${APP_URL}/proposals/${proposal.id}`

  // Map event → template
  const map: Record<EventType, { templateName: string; data: Record<string, unknown> }> = {
    viewed: {
      templateName: 'proposal-viewed',
      data: {
        clientName,
        proposalTitle: proposal.title,
        appProposalUrl,
        viewedAt: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
    },
    accepted: {
      templateName: 'proposal-accepted',
      data: { clientName, proposalTitle: proposal.title, proposalTotal, appProposalUrl },
    },
    signed: {
      templateName: 'proposal-signed',
      data: {
        signerName: body.signerName || clientName,
        proposalTitle: proposal.title,
        proposalTotal,
        signedAt: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        appProposalUrl,
      },
    },
    rejected: {
      templateName: 'proposal-rejected',
      data: { clientName, proposalTitle: proposal.title, reason: body.reason, appProposalUrl },
    },
  }

  const entry = map[event]
  if (!entry) {
    return new Response(JSON.stringify({ error: 'unknown_event' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: entry.templateName,
      recipientEmail: owner.email,
      idempotencyKey: `${event}-${proposal.id}-${Date.now().toString(36)}`,
      templateData: entry.data,
    },
  })

  if (sendErr) {
    console.error('send-transactional-email failed', { sendErr })
    return new Response(JSON.stringify({ error: 'send_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true, event }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
