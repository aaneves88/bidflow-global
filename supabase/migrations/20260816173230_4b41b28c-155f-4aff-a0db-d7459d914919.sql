CREATE TABLE public.coupon_email_log (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code text NOT NULL,
  reason text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.coupon_email_log TO service_role;
ALTER TABLE public.coupon_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view coupon email log"
ON public.coupon_email_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

SELECT cron.schedule(
  'send-coupon-nudge-daily',
  '30 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mhsyllzvzuorzyacobar.supabase.co/functions/v1/send-coupon-nudge-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);