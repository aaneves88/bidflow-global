CREATE TABLE public.public_proposal_rate_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_proposal_rate_log_lookup
  ON public.public_proposal_rate_log (ip_hash, action, created_at);

GRANT ALL ON public.public_proposal_rate_log TO service_role;

ALTER TABLE public.public_proposal_rate_log ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role (edge functions) may access it.