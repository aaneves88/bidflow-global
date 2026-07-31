ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pix_key text,
  ADD COLUMN IF NOT EXISTS pix_key_type text;

CREATE OR REPLACE FUNCTION public.get_proposal_pix(p_code text)
RETURNS TABLE(pix_key text, pix_key_type text, merchant_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pr.pix_key, pr.pix_key_type,
         COALESCE(NULLIF(pr.company_name, ''), NULLIF(pr.full_name, ''), 'RECEBEDOR')
  FROM public.proposals p
  JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.public_code = p_code
    AND pr.pix_key IS NOT NULL
    AND length(trim(pr.pix_key)) > 0
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposal_pix(text) TO anon, authenticated;