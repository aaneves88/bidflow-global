// Public proposal reads (load bundle + view tracking) behind a per-IP rate limit.
// The IP is never stored raw — only a salted SHA-256 hash.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { checkAndLog, clientIp, hashIp } from '../_shared/public-rate-limit.ts';

const LIMITS: Record<string, number> = {
  load: 30,
  record_view: 15,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    const publicCode = typeof body?.publicCode === 'string' ? body.publicCode.trim() : '';
    const action = body?.action === 'record_view' ? 'record_view' : body?.action === 'load' ? 'load' : '';
    const userAgent = typeof body?.userAgent === 'string' ? body.userAgent.slice(0, 200) : '';

    if (!publicCode || publicCode.length < 4 || publicCode.length > 64) {
      return json({ error: 'invalid_code' }, 400);
    }
    if (!action) return json({ error: 'invalid_action' }, 400);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const ipHash = await hashIp(clientIp(req), SERVICE_ROLE.slice(0, 16));
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const allowed = await checkAndLog(admin, ipHash, action, LIMITS[action]);
    if (!allowed) return json({ error: 'rate_limited' }, 200);

    if (action === 'record_view') {
      const { error } = await admin.rpc('record_proposal_view', {
        p_code: publicCode,
        p_user_agent: userAgent || null,
      });
      if (error) return json({ error: 'record_failed', message: error.message }, 200);
      return json({ ok: true });
    }

    // action === 'load': one round-trip for everything the public page needs.
    const [proposalRes, signatureRes, pixRes, brandingRes] = await Promise.all([
      admin.rpc('get_public_proposal', { p_code: publicCode }),
      admin.rpc('get_proposal_signature', { p_code: publicCode }),
      admin.rpc('get_proposal_pix', { p_code: publicCode }),
      admin.rpc('get_proposal_branding', { p_code: publicCode }),
    ]);

    if (proposalRes.error) {
      console.error('get_public_proposal failed', proposalRes.error.message);
      return json({ error: 'load_failed' }, 200);
    }
    if (!proposalRes.data) return json({ error: 'not_found' }, 200);

    const first = (res: { data: unknown }) =>
      Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;

    return json({
      proposal: proposalRes.data,
      signature: first(signatureRes),
      pix: first(pixRes),
      branding: first(brandingRes),
    });
  } catch (e) {
    console.error('public-proposal-view error', e);
    return json({ error: 'unexpected' }, 500);
  }
});
