
-- 1) plans.metadata para mapear product_id do RC -> plano
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS plans_metadata_rc_product_id_idx
  ON public.plans ((metadata->>'rc_product_id'))
  WHERE metadata ? 'rc_product_id';

-- 2) Audit table for RevenueCat webhook events
CREATE TABLE IF NOT EXISTS public.revenuecat_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     text NOT NULL UNIQUE,
  event_type   text NOT NULL,
  app_user_id  text NOT NULL,
  product_id   text,
  environment  text NOT NULL DEFAULT 'PRODUCTION',
  payload      jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.revenuecat_events TO authenticated;
GRANT ALL ON public.revenuecat_events TO service_role;

ALTER TABLE public.revenuecat_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revenuecat events"
  ON public.revenuecat_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS revenuecat_events_app_user_id_idx
  ON public.revenuecat_events (app_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS revenuecat_events_event_type_idx
  ON public.revenuecat_events (event_type, created_at DESC);
