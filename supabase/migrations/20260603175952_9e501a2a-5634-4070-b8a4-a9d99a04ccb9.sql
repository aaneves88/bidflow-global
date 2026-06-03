
-- 1) Fix Settings: drop restrictive category check
ALTER TABLE public.app_settings DROP CONSTRAINT IF EXISTS app_settings_category_check;

-- 2) Expand clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS address_line text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text;

-- 3) Proposals: closed deal tracking
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS closed_amount numeric,
  ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS closed_notes text;

-- 4) Proposal statuses: distinguish won vs lost
ALTER TABLE public.proposal_statuses
  ADD COLUMN IF NOT EXISTS is_won boolean NOT NULL DEFAULT false;

-- Seed: mark existing "Aprovada"/"Approved" final statuses as won
UPDATE public.proposal_statuses
SET is_won = true
WHERE is_final = true
  AND (name ILIKE '%aprov%' OR name ILIKE '%approv%' OR name ILIKE '%won%' OR name ILIKE '%ganh%');

-- 5) Trigger: auto-fill closed_at / closed_amount when moving to a won status
CREATE OR REPLACE FUNCTION public.handle_proposal_closed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_won boolean;
BEGIN
  IF NEW.status_id IS NOT NULL AND NEW.status_id IS DISTINCT FROM OLD.status_id THEN
    SELECT is_won INTO v_is_won
    FROM public.proposal_statuses
    WHERE id = NEW.status_id;

    IF COALESCE(v_is_won, false) THEN
      IF NEW.closed_at IS NULL THEN
        NEW.closed_at := now();
      END IF;
      IF NEW.closed_amount IS NULL THEN
        NEW.closed_amount := NEW.total_amount;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proposal_closed ON public.proposals;
CREATE TRIGGER on_proposal_closed
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.handle_proposal_closed();
