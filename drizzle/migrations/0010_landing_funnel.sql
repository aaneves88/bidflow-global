DROP POLICY IF EXISTS "Anon inserts marketing events" ON public.product_events;
CREATE POLICY "Anon inserts marketing events" ON public.product_events FOR INSERT TO anon
WITH CHECK ((user_id IS NULL) AND (event_name = ANY (ARRAY['niche_page_viewed','niche_template_copied','niche_cta_clicked','hub_niche_clicked','landing_viewed','landing_cta_clicked'])) AND ((properties IS NULL) OR (length(properties::text) <= 1000)));

CREATE OR REPLACE FUNCTION public.get_admin_landing_funnel(_days int DEFAULT 30)
RETURNS TABLE(step text, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT s.step, COALESCE(c.n, 0)::bigint FROM (VALUES
    (1,'landing_viewed'),(2,'landing_cta_clicked'),(3,'signup_completed'),(4,'first_proposal_created'),(5,'first_proposal_sent')
  ) AS s(ord, step)
  LEFT JOIN (
    SELECT event_name, count(*) AS n FROM public.product_events
    WHERE created_at >= now() - make_interval(days => _days)
    GROUP BY event_name
  ) c ON c.event_name = s.step
  ORDER BY s.ord;
END $$;
REVOKE ALL ON FUNCTION public.get_admin_landing_funnel(int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_landing_funnel(int) TO authenticated;