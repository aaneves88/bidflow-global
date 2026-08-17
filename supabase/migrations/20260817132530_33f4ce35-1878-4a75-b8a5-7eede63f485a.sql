CREATE TABLE public.signup_ip_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX idx_signup_ip_log_hash_time ON public.signup_ip_log (ip_hash, created_at DESC);
GRANT ALL ON public.signup_ip_log TO service_role;
ALTER TABLE public.signup_ip_log ENABLE ROW LEVEL SECURITY;