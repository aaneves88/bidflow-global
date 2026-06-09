
-- 1. Add per-user branding columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT;

-- 2. One-time migration: copy existing global branding to the admin user's profile
DO $$
DECLARE
  v_admin_id uuid;
  v_company_name text;
  v_logo_url text;
  v_primary text;
  v_secondary text;
  v_accent text;
BEGIN
  SELECT user_id INTO v_admin_id
  FROM public.user_roles
  WHERE role = 'admin'
  ORDER BY created_at
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    SELECT (value #>> '{}') INTO v_company_name FROM public.app_settings WHERE key = 'company_name';
    SELECT (value #>> '{}') INTO v_logo_url FROM public.app_settings WHERE key = 'logo_url';
    SELECT (value #>> '{}') INTO v_primary FROM public.app_settings WHERE key = 'primary_color';
    SELECT (value #>> '{}') INTO v_secondary FROM public.app_settings WHERE key = 'secondary_color';
    SELECT (value #>> '{}') INTO v_accent FROM public.app_settings WHERE key = 'accent_color';

    UPDATE public.profiles
    SET
      company_name = COALESCE(company_name, v_company_name),
      logo_url = COALESCE(logo_url, v_logo_url),
      primary_color = COALESCE(primary_color, v_primary),
      secondary_color = COALESCE(secondary_color, v_secondary),
      accent_color = COALESCE(accent_color, v_accent)
    WHERE id = v_admin_id;
  END IF;
END $$;

-- 3. Public RPC: branding for a proposal's owner (called from the anonymous public proposal page)
CREATE OR REPLACE FUNCTION public.get_proposal_branding(p_code TEXT)
RETURNS TABLE (
  company_name TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  has_active_plan BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION public.get_proposal_branding(TEXT) TO anon, authenticated;
