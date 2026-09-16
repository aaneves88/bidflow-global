-- Permitir eventos de marketing anônimos (sem usuário) em product_events
GRANT INSERT ON public.product_events TO anon;

CREATE POLICY "Anon inserts marketing events"
ON public.product_events
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND event_name IN ('niche_page_viewed', 'niche_template_copied', 'niche_cta_clicked', 'hub_niche_clicked')
  AND (properties IS NULL OR length(properties::text) <= 1000)
);

-- Funil por nicho para o painel admin
CREATE OR REPLACE FUNCTION public.get_admin_niche_funnel(p_days integer DEFAULT 30)
RETURNS TABLE (
  niche text,
  page_views bigint,
  template_copies bigint,
  cta_clicks bigint,
  signups bigint,
  first_proposals bigint,
  public_views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT now() - (greatest(coalesce(p_days, 30), 1) || ' days')::interval AS since
  ),
  ev AS (
    SELECT
      coalesce(nullif(pe.properties->>'niche', ''), 'sem_nicho') AS niche,
      pe.event_name
    FROM public.product_events pe, bounds b
    WHERE pe.created_at >= b.since
      AND public.has_role(auth.uid(), 'admin')
  ),
  agg AS (
    SELECT
      niche,
      count(*) FILTER (WHERE event_name = 'niche_page_viewed') AS page_views,
      count(*) FILTER (WHERE event_name = 'niche_template_copied') AS template_copies,
      count(*) FILTER (WHERE event_name IN ('niche_cta_clicked', 'hub_niche_clicked')) AS cta_clicks,
      count(*) FILTER (WHERE event_name = 'signup_completed') AS signups,
      count(*) FILTER (WHERE event_name = 'first_proposal_created') AS first_proposals
    FROM ev
    GROUP BY niche
  ),
  pv AS (
    SELECT
      coalesce(nullif(regexp_replace(pr.signup_landing_path, '^/modelo-de-orcamento/', ''), pr.signup_landing_path), 'sem_nicho') AS niche,
      count(*) AS public_views
    FROM public.proposal_views v
    JOIN public.proposals p ON p.id = v.proposal_id
    JOIN public.profiles pr ON pr.id = p.user_id, bounds b
    WHERE v.viewed_at >= b.since
      AND pr.signup_landing_path LIKE '/modelo-de-orcamento/%'
      AND public.has_role(auth.uid(), 'admin')
    GROUP BY 1
  )
  SELECT
    coalesce(a.niche, pv.niche) AS niche,
    coalesce(a.page_views, 0),
    coalesce(a.template_copies, 0),
    coalesce(a.cta_clicks, 0),
    coalesce(a.signups, 0),
    coalesce(a.first_proposals, 0),
    coalesce(pv.public_views, 0)
  FROM agg a
  FULL OUTER JOIN pv ON pv.niche = a.niche
  ORDER BY 2 DESC, 1;
$$;

REVOKE ALL ON FUNCTION public.get_admin_niche_funnel(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_niche_funnel(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_niche_funnel(integer) TO service_role;