// RevenueCat webhook receiver.
// Validates the Authorization header against RC_WEBHOOK_SECRET, logs every
// event to public.revenuecat_events for audit, and reconciles user_plans
// based on entitlement changes.
//
// Configure in RevenueCat dashboard:
//   URL:        https://<project>.supabase.co/functions/v1/revenuecat-webhook
//   Auth Header: Bearer <RC_WEBHOOK_SECRET>
//
// Reference: https://www.revenuecat.com/docs/integrations/webhooks

import { createClient } from 'npm:@supabase/supabase-js@2';

const RC_SECRET = Deno.env.get('RC_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type RcEvent = {
  event?: {
    type?: string;
    id?: string;
    app_user_id?: string;
    original_app_user_id?: string;
    product_id?: string;
    entitlement_ids?: string[];
    expiration_at_ms?: number;
    event_timestamp_ms?: number;
    environment?: 'PRODUCTION' | 'SANDBOX';
  };
};

const ACTIVATING = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
]);

const DEACTIVATING = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'SUBSCRIPTION_PAUSED',
  'BILLING_ISSUE',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // Auth: RevenueCat sends the configured value as-is in Authorization header.
  const auth = req.headers.get('authorization') ?? '';
  const presented = auth.replace(/^Bearer\s+/i, '').trim();
  if (!RC_SECRET || presented !== RC_SECRET) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  let body: RcEvent;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400, headers: corsHeaders });
  }

  const evt = body?.event;
  if (!evt?.type || !evt?.app_user_id) {
    return new Response('Missing event fields', { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Idempotent audit log
  await supabase.from('revenuecat_events').upsert(
    {
      event_id: evt.id ?? crypto.randomUUID(),
      event_type: evt.type,
      app_user_id: evt.app_user_id,
      product_id: evt.product_id ?? null,
      environment: evt.environment ?? 'PRODUCTION',
      payload: body as unknown as Record<string, unknown>,
    },
    { onConflict: 'event_id' },
  );

  // Reconcile user_plans only when we can resolve the user
  const userId = evt.app_user_id;
  if (userId && (ACTIVATING.has(evt.type) || DEACTIVATING.has(evt.type))) {
    try {
      // Map product_id -> plan via plans.metadata->>'rc_product_id' (admin-configurable)
      let planId: string | null = null;
      if (evt.product_id) {
        const { data: plan } = await supabase
          .from('plans')
          .select('id')
          .eq('is_active', true)
          .filter('metadata->>rc_product_id', 'eq', evt.product_id)
          .maybeSingle();
        planId = plan?.id ?? null;
      }

      if (ACTIVATING.has(evt.type) && planId) {
        const expiresAt = evt.expiration_at_ms
          ? new Date(evt.expiration_at_ms).toISOString()
          : null;
        await supabase.from('user_plans').upsert(
          {
            user_id: userId,
            plan_id: planId,
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: expiresAt,
          },
          { onConflict: 'user_id' },
        );
      } else if (DEACTIVATING.has(evt.type)) {
        await supabase
          .from('user_plans')
          .update({ status: 'cancelled' })
          .eq('user_id', userId);
      }
    } catch (err) {
      console.error('reconcile failed', err);
      // Still 200 — RC retries on non-2xx, but we already logged the event.
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
