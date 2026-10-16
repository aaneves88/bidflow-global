CREATE OR REPLACE FUNCTION public.get_admin_activation_by_channel()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_result jsonb;
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
    SELECT p.id,
      (lower(coalesce(p.email,'')) LIKE '%bkaro%' OR lower(coalesce(p.email,'')) LIKE '%blockaid-scan.invalid') AS is_test
    FROM public.profiles p
    WHERE p.id NOT IN (SELECT id FROM internal)
  ),
  per_user AS (
    SELECT b.id, b.is_test, fe.utm_source, fe.utm_medium, fe.utm_campaign,
      EXISTS (SELECT 1 FROM public.clients c WHERE c.user_id = b.id) AS has_client,
      EXISTS (SELECT 1 FROM public.proposals pr WHERE pr.user_id = b.id) AS has_proposal,
      EXISTS (SELECT 1 FROM public.product_events e WHERE e.user_id = b.id AND e.event_name = 'paywall_viewed') AS has_paywall,
      EXISTS (SELECT 1 FROM public.product_events e WHERE e.user_id = b.id AND e.event_name = 'checkout_started') AS has_checkout,
      EXISTS (
        SELECT 1 FROM public.user_plans up JOIN public.plans pl ON pl.id = up.plan_id
        WHERE up.user_id = b.id AND up.status = 'active' AND coalesce(pl.price,0) > 0
          AND (up.expires_at IS NULL OR up.expires_at > now())
      ) AS is_paid
    FROM base b
    LEFT JOIN LATERAL (
      SELECT e.utm_source, e.utm_medium, e.utm_campaign FROM public.product_events e
      WHERE e.user_id = b.id AND e.utm_source IS NOT NULL
      ORDER BY e.created_at LIMIT 1
    ) fe ON NOT b.is_test
  ),
  labeled AS (
    SELECT *,
      CASE WHEN is_test THEN 'interno/bkaro'
           WHEN utm_source IS NULL THEN 'direto/orgânico'
           ELSE utm_source || ' · ' || coalesce(utm_medium,'—') || ' · ' || coalesce(utm_campaign,'—') END AS channel_label
    FROM per_user
  ),
  grouped AS (
    SELECT channel_label, bool_or(is_test) AS is_internal,
      max(utm_source) AS utm_source, max(utm_medium) AS utm_medium, max(utm_campaign) AS utm_campaign,
      count(*) AS accounts,
      count(*) FILTER (WHERE has_client) AS with_client,
      count(*) FILTER (WHERE has_proposal) AS with_proposal,
      count(*) FILTER (WHERE has_paywall) AS with_paywall_viewed,
      count(*) FILTER (WHERE has_checkout) AS with_checkout_started,
      count(*) FILTER (WHERE is_paid) AS paid
    FROM labeled GROUP BY channel_label
  )
  SELECT coalesce(jsonb_agg(to_jsonb(g) ORDER BY g.accounts DESC, g.channel_label), '[]'::jsonb)
  INTO v_result FROM grouped g;

  RETURN v_result;
END $$;

REVOKE ALL ON FUNCTION public.get_admin_activation_by_channel() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_activation_by_channel() TO authenticated, service_role;