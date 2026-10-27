CREATE TABLE public.checkout_rescue_log (
  user_id uuid PRIMARY KEY,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.checkout_rescue_log TO service_role;
ALTER TABLE public.checkout_rescue_log ENABLE ROW LEVEL SECURITY;