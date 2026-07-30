ALTER TABLE public.user_plans
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_email text;

CREATE INDEX IF NOT EXISTS user_plans_stripe_subscription_id_idx ON public.user_plans (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS user_plans_stripe_customer_id_idx ON public.user_plans (stripe_customer_id);