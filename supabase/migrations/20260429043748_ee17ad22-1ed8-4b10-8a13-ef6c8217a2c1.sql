-- 1. Plans: trial/starter fields and limits
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_starter boolean NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS trial_days integer NOT NULL DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_proposals integer;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_clients integer;

-- Only one starter plan at a time
CREATE UNIQUE INDEX IF NOT EXISTS plans_only_one_starter
  ON public.plans ((is_starter)) WHERE is_starter = true;

-- 2. proposal_views table
CREATE TABLE IF NOT EXISTS public.proposal_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  ip_hash text
);

CREATE INDEX IF NOT EXISTS idx_proposal_views_proposal ON public.proposal_views(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_views_viewed_at ON public.proposal_views(viewed_at DESC);

ALTER TABLE public.proposal_views ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authed) can record a view if the proposal exists
CREATE POLICY "Anyone can record a proposal view"
  ON public.proposal_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id)
  );

-- Owners can see views of their proposals
CREATE POLICY "Owners can view their proposal views"
  ON public.proposal_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_views.proposal_id AND p.user_id = auth.uid()
    )
  );

-- Admins can see all
CREATE POLICY "Admins can view all proposal views"
  ON public.proposal_views
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. Update handle_new_user to grant starter plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INT;
  starter_plan_id uuid;
  starter_trial_days int;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  -- First user becomes admin
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  -- All users get 'user' role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  -- Auto-grant starter plan if one exists
  SELECT id, trial_days INTO starter_plan_id, starter_trial_days
  FROM public.plans
  WHERE is_starter = true AND is_active = true
  LIMIT 1;

  IF starter_plan_id IS NOT NULL THEN
    INSERT INTO public.user_plans (user_id, plan_id, status, starts_at, expires_at)
    VALUES (
      NEW.id,
      starter_plan_id,
      'active',
      now(),
      CASE WHEN starter_trial_days > 0 THEN now() + (starter_trial_days || ' days')::interval ELSE NULL END
    );
  END IF;

  RETURN NEW;
END;
$function$;