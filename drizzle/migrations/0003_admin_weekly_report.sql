CREATE OR REPLACE FUNCTION public.get_admin_weekly_report()
RETURNS TABLE(week_start date, week_end date, new_users bigint, proposals_created bigint, paid_subscriptions bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  first_week date := date '2026-10-12';
  now_sp timestamp := (now() AT TIME ZONE 'America/Sao_Paulo');
  last_week date;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  -- last completed week whose report is released (Monday 07:00 São Paulo)
  last_week := (date_trunc('week', now_sp - interval '7 hours'))::date - 7;
  RETURN QUERY
  SELECT w::date, (w + interval '6 days')::date,
    (SELECT count(*) FROM profiles pr WHERE (pr.created_at AT TIME ZONE 'America/Sao_Paulo') >= w AND (pr.created_at AT TIME ZONE 'America/Sao_Paulo') < w + interval '7 days'),
    (SELECT count(*) FROM proposals p WHERE (p.created_at AT TIME ZONE 'America/Sao_Paulo') >= w AND (p.created_at AT TIME ZONE 'America/Sao_Paulo') < w + interval '7 days'),
    (SELECT count(DISTINCT up.user_id) FROM user_plans up JOIN plans pl ON pl.id = up.plan_id
       WHERE COALESCE(pl.price,0) > 0 AND up.granted_by IS NULL
         AND (up.created_at AT TIME ZONE 'America/Sao_Paulo') >= w AND (up.created_at AT TIME ZONE 'America/Sao_Paulo') < w + interval '7 days')
  FROM generate_series(first_week::timestamp, last_week::timestamp, interval '7 days') w
  ORDER BY 1 DESC;
END $$;
REVOKE ALL ON FUNCTION public.get_admin_weekly_report() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_weekly_report() TO authenticated;