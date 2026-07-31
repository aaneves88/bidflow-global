ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS pix_key text,
  ADD COLUMN IF NOT EXISTS pix_key_type text;

CREATE OR REPLACE FUNCTION public.get_proposal_pix(p_code text)
 RETURNS TABLE(pix_key text, pix_key_type text, merchant_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    COALESCE(NULLIF(trim(p.pix_key), ''), pr.pix_key),
    CASE WHEN NULLIF(trim(p.pix_key), '') IS NOT NULL THEN p.pix_key_type ELSE pr.pix_key_type END,
    COALESCE(NULLIF(pr.company_name, ''), NULLIF(pr.full_name, ''), 'RECEBEDOR')
  FROM public.proposals p
  JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.public_code = p_code
    AND COALESCE(NULLIF(trim(p.pix_key), ''), NULLIF(trim(pr.pix_key), '')) IS NOT NULL
  LIMIT 1;
$function$;