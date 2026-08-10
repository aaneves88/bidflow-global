CREATE OR REPLACE FUNCTION public.get_admin_activation_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  WITH internal AS (
    SELECT p.id FROM public.profiles p
    WHERE lower(coalesce(p.email,'')) = 'demo@orca-mento.app'
       OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin')
  ),
  base AS (
    SELECT p.id, p.email, p.full_name, p.created_at
    FROM public.profiles p
    WHERE p.id NOT IN (SELECT id FROM internal)
  ),
  per_user AS (
    SELECT
      b.id,
      b.email,
      b.full_name,
      b.created_at,
      EXISTS (SELECT 1 FROM public.clients c WHERE c.user_id = b.id) AS has_client,
      (SELECT min(pr.created_at) FROM public.proposals pr WHERE pr.user_id = b.id) AS first_proposal_at,
      EXISTS (
        SELECT 1 FROM public.proposal_views v
        JOIN public.proposals pr ON pr.id = v.proposal_id
        WHERE pr.user_id = b.id
      ) AS has_view,
      EXISTS (
        SELECT 1 FROM public.proposals pr
        JOIN public.proposal_statuses s ON s.id = pr.status_id
        WHERE pr.user_id = b.id AND s.is_won
      ) AS has_approved,
      EXISTS (
        SELECT 1 FROM public.user_plans up
        JOIN public.plans pl ON pl.id = up.plan_id
        WHERE up.user_id = b.id AND up.status = 'active'
          AND coalesce(pl.price, 0) > 0
          AND (up.expires_at IS NULL OR up.expires_at > now())
      ) AS is_paid,
      EXISTS (
        SELECT 1 FROM public.proposals pr
        WHERE pr.user_id = b.id AND greatest(pr.created_at, pr.updated_at) > now() - interval '7 days'
      ) AS active_7d,
      EXISTS (
        SELECT 1 FROM public.proposals pr
        WHERE pr.user_id = b.id AND greatest(pr.created_at, pr.updated_at) > now() - interval '30 days'
      ) AS active_30d
    FROM base b
  ),
  status_dist AS (
    SELECT
      coalesce(s.name, 'Sem status') AS name,
      coalesce(s.color, '#94a3b8') AS color,
      coalesce(s.is_won, false) AS is_won,
      count(*) AS total
    FROM public.proposals pr
    LEFT JOIN public.proposal_statuses s ON s.id = pr.status_id
    WHERE pr.user_id NOT IN (SELECT id FROM internal)
    GROUP BY 1, 2, 3
  ),
  signups AS (
    SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
      (SELECT count(*) FROM base b WHERE b.created_at::date = d::date) AS total
    FROM generate_series(now()::date - interval '29 days', now()::date, interval '1 day') d
  ),
  revenue AS (
    SELECT
      count(*) AS active_subs,
      coalesce(sum(CASE WHEN pl.interval = 'year' THEN pl.price / 12.0 ELSE pl.price END), 0) AS mrr
    FROM public.user_plans up
    JOIN public.plans pl ON pl.id = up.plan_id
    WHERE up.status = 'active'
      AND coalesce(pl.price, 0) > 0
      AND (up.expires_at IS NULL OR up.expires_at > now())
      AND up.user_id NOT IN (SELECT id FROM internal)
  )
  SELECT jsonb_build_object(
    'funnel', jsonb_build_object(
      'accounts', (SELECT count(*) FROM per_user),
      'with_client', (SELECT count(*) FROM per_user WHERE has_client),
      'with_proposal', (SELECT count(*) FROM per_user WHERE first_proposal_at IS NOT NULL),
      'with_view', (SELECT count(*) FROM per_user WHERE has_view),
      'with_approved', (SELECT count(*) FROM per_user WHERE has_approved),
      'paid', (SELECT count(*) FROM per_user WHERE is_paid)
    ),
    'median_hours_to_first_proposal', (
      SELECT round((percentile_cont(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (first_proposal_at - created_at)) / 3600.0
      ))::numeric, 1)
      FROM per_user WHERE first_proposal_at IS NOT NULL
    ),
    'stalled', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'email', email, 'full_name', full_name, 'created_at', created_at
      ) ORDER BY created_at)
      FROM per_user
      WHERE first_proposal_at IS NULL AND created_at < now() - interval '7 days'
    ), '[]'::jsonb),
    'active_7d', (SELECT count(*) FROM per_user WHERE active_7d),
    'active_30d', (SELECT count(*) FROM per_user WHERE active_30d),
    'status_distribution', coalesce((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'color', color, 'is_won', is_won, 'total', total) ORDER BY total DESC)
      FROM status_dist
    ), '[]'::jsonb),
    'proposals_total', (SELECT coalesce(sum(total), 0) FROM status_dist),
    'proposals_won', (SELECT coalesce(sum(total) FILTER (WHERE is_won), 0) FROM status_dist),
    'active_subscriptions', (SELECT active_subs FROM revenue),
    'mrr', (SELECT mrr FROM revenue),
    'signups_by_day', coalesce((
      SELECT jsonb_agg(jsonb_build_object('day', day, 'total', total) ORDER BY day) FROM signups
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_activation_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_activation_stats() TO authenticated;