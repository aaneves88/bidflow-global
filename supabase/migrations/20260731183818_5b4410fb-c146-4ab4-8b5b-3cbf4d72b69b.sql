CREATE TABLE public.stripe_events (
  id text PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_events TO service_role;

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages stripe events"
ON public.stripe_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);