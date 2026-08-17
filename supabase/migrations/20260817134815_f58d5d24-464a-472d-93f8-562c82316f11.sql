ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tagline text;

DROP FUNCTION IF EXISTS public.get_proposal_branding(text);

CREATE FUNCTION public.get_proposal_branding(p_code text)
 RETURNS TABLE(company_name text, logo_url text, primary_color text, secondary_color text, accent_color text, tagline text, has_active_plan boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner
  FROM public.proposals
  WHERE public_code = p_code
  LIMIT 1;

  IF v_owner IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.company_name,
    p.logo_url,
    p.primary_color,
    p.secondary_color,
    p.accent_color,
    p.tagline,
    EXISTS (
      SELECT 1 FROM public.user_plans up
      WHERE up.user_id = v_owner
        AND up.status = 'active'
        AND (up.expires_at IS NULL OR up.expires_at > now())
    ) OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = v_owner AND ur.role = 'admin'
    )
  FROM public.profiles p
  WHERE p.id = v_owner;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_proposal_branding(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposal_branding(text) TO anon, authenticated, service_role;