// Shared IP rate limiting for the public proposal routes (/p/:publicCode).
// Same pattern as signup-guarded: the raw IP is never stored, only a salted
// SHA-256 hash, in a table with RLS enabled and no policies (service role only).

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const WINDOW_MINUTES = 10;

export function clientIp(req: Request) {
  return (
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function hashIp(ip: string, salt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Returns true when the caller is still within the limit (and logs the hit). */
export async function checkAndLog(
  admin: SupabaseClient,
  ipHash: string,
  action: string,
  limit: number,
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await admin
    .from('public_proposal_rate_log')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .eq('action', action)
    .gte('created_at', since);

  if (error) console.error('rate limit lookup failed', error.message);

  if ((count ?? 0) >= limit) return false;

  await admin.from('public_proposal_rate_log').insert({ ip_hash: ipHash, action });
  return true;
}
