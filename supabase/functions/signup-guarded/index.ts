// Signup wrapper with a simple per-IP rate limit: max 3 successful signups
// per IP every 24h. The IP is never stored raw — only a salted SHA-256 hash.
// The auth flow itself (email confirmation, redirects) is unchanged: the
// function calls the normal signUp endpoint and returns the session, if any.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const MAX_SIGNUPS_PER_DAY = 3;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function hashIp(ip: string, salt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim().slice(0, 120) : '';
    const referralCode = typeof body?.referralCode === 'string' ? body.referralCode.toUpperCase().trim() : '';
    const emailRedirectTo = typeof body?.emailRedirectTo === 'string' ? body.emailRedirectTo : undefined;

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) {
      return json({ error: 'invalid_email' }, 400);
    }
    if (password.length < 6 || password.length > 128) {
      return json({ error: 'invalid_password' }, 400);
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

    const rawIp =
      (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';
    const ipHash = await hashIp(rawIp, SERVICE_ROLE.slice(0, 16));

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countErr } = await admin
      .from('signup_ip_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);

    if (countErr) console.error('rate limit lookup failed', countErr.message);

    if ((count ?? 0) >= MAX_SIGNUPS_PER_DAY) {
      return json({ error: 'rate_limited' }, 200);
    }

    const anonClient = createClient(SUPABASE_URL, ANON);
    const { data, error } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
        emailRedirectTo,
      },
    });

    if (error) {
      return json({ error: 'signup_failed', message: error.message }, 200);
    }

    await admin.from('signup_ip_log').insert({ ip_hash: ipHash });

    // Track referral if a valid referral code was provided
    if (referralCode && data.user?.id) {
      try {
        const { data: referrer } = await admin
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single();

        if (referrer && referrer.id !== data.user.id) {
          await admin.from('referrals').insert({
            referrer_user_id: referrer.id,
            referred_user_id: data.user.id,
            referral_code: referralCode,
            status: 'pending',
            discount_percent: 20,
          });
        }
      } catch (referralErr) {
        console.error('referral tracking failed', referralErr);
      }
    }

    return json({ ok: true, session: data.session ?? null });
  } catch (e) {
    console.error('signup-guarded error', e);
    return json({ error: 'unexpected' }, 500);
  }
});
