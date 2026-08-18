CREATE TABLE public.proposal_followup_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL UNIQUE REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.proposal_followup_log TO authenticated;
GRANT ALL ON public.proposal_followup_log TO service_role;

ALTER TABLE public.proposal_followup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own follow-up log"
ON public.proposal_followup_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

SELECT cron.schedule(
  'send-proposal-followup-daily',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mhsyllzvzuorzyacobar.supabase.co/functions/v1/send-proposal-followup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);