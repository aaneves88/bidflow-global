ALTER TABLE public.referral_partners
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'prospectado',
  ADD COLUMN IF NOT EXISTS last_contact_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.referral_partners
  ALTER COLUMN coupon_code DROP NOT NULL,
  ALTER COLUMN discount_percent DROP NOT NULL,
  ALTER COLUMN discount_duration DROP NOT NULL,
  ALTER COLUMN repasse_rule DROP NOT NULL;

ALTER TABLE public.referral_partners
  ADD CONSTRAINT referral_partners_status_check
  CHECK (status IN ('prospectado','contatado','negociando','ativo','recusado'));

UPDATE public.referral_partners SET status = 'ativo';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_partners TO authenticated;
GRANT ALL ON public.referral_partners TO service_role;