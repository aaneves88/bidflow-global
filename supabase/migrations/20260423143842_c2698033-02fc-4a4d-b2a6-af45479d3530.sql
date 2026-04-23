
-- Allow anonymous users to view proposal statuses (needed for public proposal page)
CREATE POLICY "Anon can view statuses"
ON public.proposal_statuses
FOR SELECT
TO anon
USING (true);

-- Allow admins to insert profiles (for system operations)
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all proposals (for admin dashboard stats)
CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
