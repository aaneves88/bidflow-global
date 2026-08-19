ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS credential_note text,
  ADD COLUMN IF NOT EXISTS trust_note text;

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS show_cover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_why_me boolean NOT NULL DEFAULT false;

DROP FUNCTION IF EXISTS public.get_proposal_branding(text);

CREATE FUNCTION public.get_proposal_branding(p_code text)
 RETURNS TABLE(company_name text, logo_url text, primary_color text, secondary_color text, accent_color text, tagline text, photo_url text, credential_note text, trust_note text, has_active_plan boolean)
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
    p.photo_url,
    p.credential_note,
    p.trust_note,
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

CREATE OR REPLACE FUNCTION public.get_public_proposal(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF p_code IS NULL OR length(p_code) < 4 THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'description', p.description,
    'notes', p.notes,
    'terms', p.terms,
    'currency', p.currency,
    'total_amount', p.total_amount,
    'discount_amount', p.discount_amount,
    'discount_type', p.discount_type,
    'valid_until', p.valid_until,
    'public_code', p.public_code,
    'status_id', p.status_id,
    'show_cover', p.show_cover,
    'show_why_me', p.show_why_me,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'clients', CASE WHEN c.id IS NULL THEN NULL ELSE jsonb_build_object(
      'name', c.name,
      'company', c.company,
      'email', c.email,
      'phone', c.phone
    ) END,
    'proposal_statuses', CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object(
      'name', s.name,
      'color', s.color,
      'is_final', s.is_final
    ) END,
    'proposal_items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', i.id,
        'description', i.description,
        'quantity', i.quantity,
        'unit_price', i.unit_price,
        'total', i.total,
        'position', i.position
      ) ORDER BY i.position)
      FROM public.proposal_items i
      WHERE i.proposal_id = p.id
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM public.proposals p
  LEFT JOIN public.clients c ON c.id = p.client_id
  LEFT JOIN public.proposal_statuses s ON s.id = p.status_id
  WHERE p.public_code = p_code;

  RETURN v_result;
END;
$function$;