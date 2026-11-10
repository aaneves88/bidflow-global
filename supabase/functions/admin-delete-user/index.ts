// Admin-only: deletes another user from auth (cascades remove their data).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'Missing Authorization' }, 401);
    const URL_ = Deno.env.get('SUPABASE_URL')!;
    const anon = createClient(URL_, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: u, error: uErr } = await anon.auth.getUser();
    if (uErr || !u?.user) return json({ error: 'Invalid session' }, 401);

    const admin = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'Forbidden' }, 403);

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.userIds) ? body.userIds : body?.userId ? [body.userId] : [];
    if (!ids.length || ids.length > 50 || !ids.every((i) => typeof i === 'string' && UUID.test(i))) {
      return json({ error: 'Invalid userId(s)' }, 400);
    }
    if (ids.includes(u.user.id)) return json({ error: 'Cannot delete yourself' }, 400);

    const results: Record<string, string> = {};
    for (const id of ids) {
      const { error } = await admin.auth.admin.deleteUser(id);
      results[id] = error ? error.message : 'ok';
    }
    return json({ ok: true, results });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
