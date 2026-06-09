
-- ============================================================
-- 1) Secure public proposal access via RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_public_proposal(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    'valid_until', p.valid_until,
    'public_code', p.public_code,
    'status_id', p.status_id,
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
$$;

GRANT EXECUTE ON FUNCTION public.get_public_proposal(text) TO anon, authenticated;

-- ============================================================
-- 2) Drop overly permissive anon policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view by public_code" ON public.proposals;
DROP POLICY IF EXISTS "Public can view proposal items" ON public.proposal_items;
DROP POLICY IF EXISTS "Public can view proposal history" ON public.proposal_status_history;
DROP POLICY IF EXISTS "Public can insert history" ON public.proposal_status_history;

-- ============================================================
-- 3) Remove proposals from realtime publication
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='proposals'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.proposals';
  END IF;
END $$;

-- ============================================================
-- 4) Scope authenticated SELECT on app_settings to safe categories
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view settings" ON public.app_settings;

CREATE POLICY "Authenticated can view safe settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (category = ANY (ARRAY['branding','general','integrations_public','plans_public']));

-- Admins retain full access via existing "Admins can manage settings" policy.

-- ============================================================
-- 5) Revoke EXECUTE on internal SECURITY DEFINER functions
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.track_proposal_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_proposal_closed() FROM anon, authenticated;

-- Public-facing definers keep their grants:
-- get_proposal_branding, get_proposal_signature, get_public_proposal,
-- accept_proposal, sign_proposal, has_role (auth users need it for RLS)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
