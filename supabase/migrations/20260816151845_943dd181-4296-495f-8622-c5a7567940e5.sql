-- 1. Fix outdated feature text on the free plan (limit is 3 proposals)
UPDATE public.plans
SET features = '["3 propostas", "5 clientes", "Link público", "Painel básico"]'::jsonb
WHERE is_starter = true;

-- 2. Activation email log (one 48h email per account, ever)
CREATE TABLE public.activation_email_log (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.activation_email_log TO service_role;

ALTER TABLE public.activation_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activation email log"
  ON public.activation_email_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Daily schedule (09:00 UTC) calling the activation job
SELECT cron.schedule(
  'send-activation-emails-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mhsyllzvzuorzyacobar.supabase.co/functions/v1/send-activation-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);