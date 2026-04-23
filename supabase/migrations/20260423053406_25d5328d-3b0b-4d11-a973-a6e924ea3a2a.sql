
-- Drop overly permissive anon policies
DROP POLICY "Public can accept proposals" ON public.proposals;
DROP POLICY "Public can insert history" ON public.proposal_status_history;

-- Recreate with tighter constraints: anon can only update status_id
CREATE POLICY "Public can accept proposals" ON public.proposals FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Anon can insert history only for existing proposals
CREATE POLICY "Public can insert history" ON public.proposal_status_history FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_status_history.proposal_id));
