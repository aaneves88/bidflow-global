
-- 1. Translate default proposal statuses to pt-BR (in place — ids preserved)
UPDATE public.proposal_statuses SET name='Rascunho'      WHERE name='Draft';
UPDATE public.proposal_statuses SET name='Enviada'       WHERE name='Sent';
UPDATE public.proposal_statuses SET name='Visualizada'   WHERE name='Viewed';
UPDATE public.proposal_statuses SET name='Aprovada'      WHERE name='Approved';
UPDATE public.proposal_statuses SET name='Rejeitada'     WHERE name='Rejected';
UPDATE public.proposal_statuses SET name='Expirada'      WHERE name='Expired';

-- 2. SECURITY: replace overly-permissive anon UPDATE policy on proposals.
-- The old policy allowed anonymous users to UPDATE any column on any proposal.
-- We restrict the public accept flow to a SECURITY DEFINER RPC that only
-- flips status_id to an approved-or-final status.

DROP POLICY IF EXISTS "Public can accept proposals" ON public.proposals;

CREATE OR REPLACE FUNCTION public.accept_proposal(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal_id uuid;
  v_current_status uuid;
  v_current_is_final boolean;
  v_target_status uuid;
BEGIN
  -- Find the proposal by its public code
  SELECT id, status_id INTO v_proposal_id, v_current_status
  FROM public.proposals
  WHERE public_code = p_code;

  IF v_proposal_id IS NULL THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  -- Prevent re-accepting an already-final proposal
  IF v_current_status IS NOT NULL THEN
    SELECT is_final INTO v_current_is_final
    FROM public.proposal_statuses WHERE id = v_current_status;
    IF v_current_is_final THEN
      RAISE EXCEPTION 'Proposal is already final';
    END IF;
  END IF;

  -- Pick the approved final status (matches "Aprovada"/"Approved")
  SELECT id INTO v_target_status
  FROM public.proposal_statuses
  WHERE is_final = true AND (name ILIKE '%aprov%' OR name ILIKE '%approv%')
  ORDER BY position
  LIMIT 1;

  IF v_target_status IS NULL THEN
    RAISE EXCEPTION 'No approved status configured';
  END IF;

  -- Apply the status change (trigger will record history)
  UPDATE public.proposals
  SET status_id = v_target_status, updated_at = now()
  WHERE id = v_proposal_id;

  -- Add a note explaining the change for auditing
  INSERT INTO public.proposal_status_history (proposal_id, status_id, notes)
  VALUES (v_proposal_id, v_target_status, 'Aceita pelo cliente via link público');
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_proposal(text) TO anon, authenticated;
