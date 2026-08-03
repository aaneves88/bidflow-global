DROP POLICY IF EXISTS "Anyone can view proposals by public_code" ON public.proposals;
DROP POLICY IF EXISTS "Anyone can view items of public proposals" ON public.proposal_items;
REVOKE SELECT ON public.proposals FROM anon;
REVOKE SELECT ON public.proposal_items FROM anon;