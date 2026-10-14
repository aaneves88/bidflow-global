// Public: delivers the e-book to a lead that was just captured on the e-book page.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAppEmail } from '../_shared/app-email.ts'
import { adminClient, json, str } from '../_shared/caller.ts'

const SITE_URL = 'https://orca-mento.app'
const RECENT_MS = 30 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }
  const email = str(body.email, 254)?.toLowerCase() ?? null
  const downloadUrl = str(body.downloadUrl, 500)
  if (!email || !downloadUrl || !/^https:\/\//.test(downloadUrl)) return json({ error: 'invalid_input' }, 400)

  const admin = adminClient()
  // Only send to an address that just signed up on the e-book page.
  const { data: lead } = await admin
    .from('ebook_leads')
    .select('id, name, created_at')
    .eq('email', email)
    .gte('created_at', new Date(Date.now() - RECENT_MS).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!lead) return json({ error: 'not_found' }, 404)

  try {
    const firstName = (lead.name ?? '').trim().split(/\s+/)[0] || undefined
    const result = await sendAppEmail(admin, 'ebook-delivery', email, {
      idempotencyKey: `ebook-delivery-${email}`,
      templateData: { firstName, downloadUrl, appUrl: SITE_URL },
    })
    return json({ success: result.sent })
  } catch (e) {
    console.error('ebook email failed', e instanceof Error ? e.message : e)
    return json({ error: 'send_failed' }, 500)
  }
})
