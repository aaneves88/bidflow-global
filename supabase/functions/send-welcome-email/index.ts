// Welcome email for a new account that signed in with Google. Sends only to the
// caller's own address; one welcome per address (idempotency key).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAppEmail } from '../_shared/app-email.ts'
import { adminClient, getCaller, json } from '../_shared/caller.ts'

const NEW_ACCOUNT_WINDOW_MS = 10 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  const caller = await getCaller(req)
  if (!caller?.email) return json({ error: 'unauthorized' }, 401)

  const admin = adminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', caller.id)
    .maybeSingle()
  const createdAt = profile?.created_at
  if (!createdAt || Date.now() - new Date(createdAt).getTime() > NEW_ACCOUNT_WINDOW_MS) {
    return json({ success: false, reason: 'not_new' })
  }

  try {
    const firstName = (profile?.full_name ?? '').trim().split(' ')[0] || undefined
    const email = caller.email.toLowerCase()
    const result = await sendAppEmail(admin, 'welcome', email, {
      idempotencyKey: `welcome-${email}`,
      templateData: { firstName, appUrl: 'https://orca-mento.app' },
    })
    return json({ success: result.sent })
  } catch (e) {
    console.error('welcome email failed', e instanceof Error ? e.message : e)
    return json({ error: 'send_failed' }, 500)
  }
})
