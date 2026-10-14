// Sends a proposal to the client's email, only for the proposal's owner.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAppEmail } from '../_shared/app-email.ts'
import { adminClient, getCaller, json, str } from '../_shared/caller.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  const caller = await getCaller(req)
  if (!caller) return json({ error: 'unauthorized' }, 401)

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }
  const proposalId = str(body.proposalId, 64)
  const to = str(body.recipientEmail, 254)?.toLowerCase() ?? null
  if (!proposalId || !to || !EMAIL_RE.test(to)) return json({ error: 'invalid_input' }, 400)

  const admin = adminClient()
  const { data: proposal } = await admin
    .from('proposals')
    .select('id, title, public_code, user_id')
    .eq('id', proposalId)
    .eq('user_id', caller.id)
    .maybeSingle()
  if (!proposal) return json({ error: 'not_found' }, 404)

  const publicUrl = str(body.publicUrl, 500)
  if (!publicUrl || !/^https?:\/\//.test(publicUrl) || !publicUrl.endsWith(`/p/${proposal.public_code}`)) {
    return json({ error: 'invalid_url' }, 400)
  }

  try {
    const result = await sendAppEmail(admin, 'proposal-sent', to, {
      idempotencyKey: `proposal-sent-${proposal.id}-${to}`,
      templateData: {
        clientName: str(body.clientName, 200),
        senderName: str(body.senderName, 200),
        proposalTitle: proposal.title,
        proposalTotal: str(body.proposalTotal, 60),
        publicUrl,
        validUntil: str(body.validUntil, 60),
      },
    })
    return json({ success: result.sent })
  } catch (e) {
    console.error('proposal email failed', e instanceof Error ? e.message : e)
    return json({ error: 'send_failed' }, 500)
  }
})
