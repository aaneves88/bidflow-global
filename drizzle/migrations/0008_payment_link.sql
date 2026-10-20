ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_link text,
  ADD COLUMN IF NOT EXISTS payment_link_label text;
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS payment_link text,
  ADD COLUMN IF NOT EXISTS payment_link_label text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_link_https CHECK (payment_link IS NULL OR payment_link ~* '^https://');
ALTER TABLE public.proposals ADD CONSTRAINT proposals_payment_link_https CHECK (payment_link IS NULL OR payment_link ~* '^https://');
ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_link_label_len CHECK (payment_link_label IS NULL OR length(payment_link_label) <= 80);
ALTER TABLE public.proposals ADD CONSTRAINT proposals_payment_link_label_len CHECK (payment_link_label IS NULL OR length(payment_link_label) <= 80);

CREATE OR REPLACE FUNCTION public.get_proposal_payment_link(p_code text)
 RETURNS TABLE(url text, label text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    COALESCE(NULLIF(trim(p.payment_link), ''), pr.payment_link),
    CASE WHEN NULLIF(trim(p.payment_link), '') IS NOT NULL THEN p.payment_link_label ELSE pr.payment_link_label END
  FROM public.proposals p
  JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.public_code = p_code
    AND COALESCE(NULLIF(trim(p.payment_link), ''), NULLIF(trim(pr.payment_link), '')) IS NOT NULL
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_proposal_payment_link(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_proposal_payment_link(text) TO service_role;