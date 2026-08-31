// Public proposal signing behind a per-IP rate limit (8 per 10 minutes).
// The IP is never stored raw — only a salted SHA-256 hash.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { checkAndLog, clientIp, hashIp } from '../_shared/public-rate-limit.ts';

const SIGN_LIMIT = 8;

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
    const signerName = typeof body?.signerName === 'string' ? body.signerName.trim() : '';
    const signerEmail = typeof body?.signerEmail === 'string' ? body.signerEmail.trim() : '';
    const userAgent = typeof body?.userAgent === 'string' ? body.userAgent.slice(0, 250) : '';

    if (!publicCode || publicCode.length < 4 || publicCode.length > 64) {
      return json({ error: 'invalid_code' }, 400);
    }
    if (signerName.length < 2 || signerName.length > 120) {
      return json({ error: 'invalid_name' }, 400);
    }
    if (signerEmail && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signerEmail) || signerEmail.length > 255)) {
      return json({ error: 'invalid_email' }, 400);
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const ipHash = await hashIp(clientIp(req), SERVICE_ROLE.slice(0, 16));
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const allowed = await checkAndLog(admin, ipHash, 'sign', SIGN_LIMIT);
    if (!allowed) return json({ error: 'rate_limited' }, 200);

    const { data, error } = await admin.rpc('sign_proposal', {
      p_code: publicCode,
      p_signer_name: signerName,
      p_signer_email: signerEmail || null,
      p_user_agent: userAgent || null,
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('not found')) return json({ error: 'not_found' }, 200);
      if (msg.includes('already final')) return json({ error: 'already_final' }, 200);
      console.error('sign_proposal failed', error.message);
      return json({ error: 'sign_failed', message: error.message }, 200);
    }

    return json({ ok: true, signatureId: data ?? null });
  } catch (e) {
    console.error('public-proposal-sign error', e);
    return json({ error: 'unexpected' }, 500);
  }
});
