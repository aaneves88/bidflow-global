// Public endpoint behind the /unsubscribe page: validates an unsubscribe
// token from email_unsubscribe_tokens, marks it used and adds the address
// to suppressed_emails so no further app/announcement email goes out.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  let token = url.searchParams.get('token')
  if (!token && req.method === 'POST') {
    const body = await req.json().catch(() => ({}))
    token = typeof body.token === 'string' ? body.token : null
  }
  if (!token) return json({ error: 'token_required' }, 400)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: row, error } = await admin
    .from('email_unsubscribe_tokens')
    .select('id, email, used_at')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    console.error('token lookup failed', error)
    return json({ error: 'lookup_failed' }, 500)
  }
  if (!row) return json({ error: 'invalid_token' }, 404)
  if (row.used_at) return json({ success: true, reason: 'already_unsubscribed' })

  const { error: suppressError } = await admin
    .from('suppressed_emails')
    .upsert(
      { email: row.email.toLowerCase(), reason: 'unsubscribe' },
      { onConflict: 'email' },
    )
  if (suppressError) {
    console.error('suppress failed', suppressError)
    return json({ error: 'suppress_failed' }, 500)
  }

  await admin
    .from('email_unsubscribe_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id)

  return json({ success: true })
})
