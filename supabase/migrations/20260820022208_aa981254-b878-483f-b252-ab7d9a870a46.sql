CREATE OR REPLACE FUNCTION public.get_admin_user_activity()
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  proposals_count integer,
  last_proposal_at timestamptz,
  clients_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.created_at,
    u.last_sign_in_at,
    (SELECT count(*)::int FROM public.proposals pr WHERE pr.user_id = p.id),
    (SELECT max(pr.created_at) FROM public.proposals pr WHERE pr.user_id = p.id),
    (SELECT count(*)::int FROM public.clients c WHERE c.user_id = p.id)
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_user_activity() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_user_activity() TO authenticated;