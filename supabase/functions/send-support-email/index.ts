// Support notifications: a new ticket/feedback goes to the support inbox; an
// admin reply goes to the ticket's reporter. Recipients come from the database.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAppEmail } from '../_shared/app-email.ts'
import { adminClient, getCaller, json, str } from '../_shared/caller.ts'

const SUPPORT_INBOX = 'statematch@statematch.global'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  const caller = await getCaller(req)
  if (!caller) return json({ error: 'unauthorized' }, 401)

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }
  const admin = adminClient()
  const categoryLabel = str(body.categoryLabel, 100)

  try {
    if (body.action === 'report') {
      const ticketId = str(body.ticketId, 64)
      if (!ticketId) return json({ error: 'ticketId required' }, 400)
      const { data: ticket } = await admin
        .from('support_tickets')
        .select('id, user_id, reporter_email, description, page_path, user_agent, created_at')
        .eq('id', ticketId)
        .eq('user_id', caller.id)
        .maybeSingle()
      if (!ticket) return json({ error: 'not_found' }, 404)
      const result = await sendAppEmail(admin, 'support-report', SUPPORT_INBOX, {
        idempotencyKey: `support-report-${ticket.id}`,
        templateData: {
          reporterEmail: ticket.reporter_email ?? '',
          categoryLabel,
          description: ticket.description,
          pagePath: ticket.page_path,
          userAgent: ticket.user_agent,
          createdAt: new Date(ticket.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          ticketId: ticket.id,
        },
      })
      return json({ success: result.sent })
    }

    if (body.action === 'reply') {
      const messageId = str(body.messageId, 64)
      if (!messageId) return json({ error: 'messageId required' }, 400)
      const { data: isAdmin } = await admin.rpc('has_role', { _user_id: caller.id, _role: 'admin' })
      if (!isAdmin) return json({ error: 'forbidden' }, 403)
      const { data: msg } = await admin
        .from('support_ticket_messages')
        .select('id, body, ticket_id')
        .eq('id', messageId)
        .maybeSingle()
      if (!msg) return json({ error: 'not_found' }, 404)
      const { data: ticket } = await admin
        .from('support_tickets')
        .select('reporter_email, description')
        .eq('id', msg.ticket_id)
        .maybeSingle()
      if (!ticket?.reporter_email) return json({ error: 'not_found' }, 404)
      const result = await sendAppEmail(admin, 'support-reply', ticket.reporter_email, {
        idempotencyKey: `support-reply-${msg.id}`,
        templateData: { categoryLabel, originalMessage: ticket.description, replyMessage: msg.body },
      })
      return json({ success: result.sent })
    }

    return json({ error: 'unknown action' }, 400)
  } catch (e) {
    console.error('support email failed', e instanceof Error ? e.message : e)
    return json({ error: 'send_failed' }, 500)
  }
})
