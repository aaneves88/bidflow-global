
-- 1. Signatures table
CREATE TABLE IF NOT EXISTS public.proposal_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text,
  ip_address text,
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_signatures_proposal_id ON public.proposal_signatures(proposal_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_signatures TO authenticated;
GRANT ALL ON public.proposal_signatures TO service_role;

ALTER TABLE public.proposal_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view signatures of their proposals"
ON public.proposal_signatures FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.proposals p
    WHERE p.id = proposal_signatures.proposal_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages signatures"
ON public.proposal_signatures FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 2. RPC to sign a proposal (callable by anon via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.sign_proposal(
  p_code text,
  p_signer_name text,
  p_signer_email text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal_id uuid;
  v_signature_id uuid;
  v_current_status uuid;
  v_is_final boolean;
  v_target_status uuid;
BEGIN
  IF p_signer_name IS NULL OR length(trim(p_signer_name)) < 2 THEN
    RAISE EXCEPTION 'Signer name is required';
  END IF;

  SELECT id, status_id INTO v_proposal_id, v_current_status
  FROM public.proposals
  WHERE public_code = p_code;

  IF v_proposal_id IS NULL THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_current_status IS NOT NULL THEN
    SELECT is_final INTO v_is_final
    FROM public.proposal_statuses WHERE id = v_current_status;
    IF COALESCE(v_is_final, false) THEN
      RAISE EXCEPTION 'Proposal is already final';
    END IF;
  END IF;

  INSERT INTO public.proposal_signatures (proposal_id, signer_name, signer_email, user_agent)
  VALUES (v_proposal_id, trim(p_signer_name), p_signer_email, p_user_agent)
  RETURNING id INTO v_signature_id;

  -- Move to approved status
  SELECT id INTO v_target_status
  FROM public.proposal_statuses
  WHERE is_final = true AND (name ILIKE '%aprov%' OR name ILIKE '%approv%')
  ORDER BY position LIMIT 1;

  IF v_target_status IS NOT NULL THEN
    UPDATE public.proposals SET status_id = v_target_status, updated_at = now()
    WHERE id = v_proposal_id;

    INSERT INTO public.proposal_status_history (proposal_id, status_id, notes)
    VALUES (v_proposal_id, v_target_status, 'Assinada digitalmente por ' || trim(p_signer_name));
  END IF;

  RETURN v_signature_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sign_proposal(text, text, text, text) TO anon, authenticated;

-- 3. Public read of signature summary (for showing "signed by X on Y" on public page)
CREATE OR REPLACE FUNCTION public.get_proposal_signature(p_code text)
RETURNS TABLE (signer_name text, signed_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.signer_name, s.signed_at
  FROM public.proposal_signatures s
  JOIN public.proposals p ON p.id = s.proposal_id
  WHERE p.public_code = p_code
  ORDER BY s.signed_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposal_signature(text) TO anon, authenticated;
