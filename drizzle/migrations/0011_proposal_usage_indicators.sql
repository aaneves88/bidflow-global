CREATE TABLE public.proposal_usage_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
 event_type text NOT NULL CHECK (event_type IN ('pdf_owner','pdf_public','link_copied','whatsapp_opened','email_sent')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.proposal_usage_events TO authenticated;
GRANT ALL ON public.proposal_usage_events TO service_role;
ALTER TABLE public.proposal_usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_owner_read ON public.proposal_usage_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id=proposal_id AND p.user_id=auth.uid()));
CREATE POLICY usage_owner_insert ON public.proposal_usage_events FOR INSERT TO authenticated WITH CHECK (event_type <> 'pdf_public' AND EXISTS (SELECT 1 FROM public.proposals p WHERE p.id=proposal_id AND p.user_id=auth.uid()));
CREATE INDEX proposal_usage_events_proposal_date ON public.proposal_usage_events(proposal_id,created_at DESC);
CREATE OR REPLACE FUNCTION public.record_public_pdf_download(p_code text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 INSERT INTO public.proposal_usage_events(proposal_id,event_type) SELECT id,'pdf_public' FROM public.proposals WHERE public_code=p_code;
$$;
REVOKE ALL ON FUNCTION public.record_public_pdf_download(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_public_pdf_download(text) TO service_role;
CREATE OR REPLACE FUNCTION public.get_admin_proposal_usage() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 RETURN (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.proposal_count DESC),'[]'::jsonb) FROM (
 SELECT pr.id AS user_id,coalesce(nullif(pr.company_name,''),nullif(pr.full_name,''),pr.email) AS name,pr.email,
 (SELECT count(*) FROM public.proposals p WHERE p.user_id=pr.id) AS proposal_count,
 round((SELECT count(*) FROM public.proposals p WHERE p.user_id=pr.id)::numeric / greatest(1,ceil(extract(epoch FROM (now()-pr.created_at))/2592000)),2) AS monthly_average,
 coalesce((SELECT jsonb_object_agg(v.currency,v.average) FROM (SELECT p.currency,round(avg(p.total_amount)::numeric,2) AS average FROM public.proposals p WHERE p.user_id=pr.id GROUP BY p.currency) v),'{}'::jsonb) AS average_values,
 (SELECT count(*) FROM public.proposal_views v JOIN public.proposals p ON p.id=v.proposal_id WHERE p.user_id=pr.id) AS public_views,
 (SELECT count(*) FROM public.proposal_usage_events e JOIN public.proposals p ON p.id=e.proposal_id WHERE p.user_id=pr.id AND e.event_type='pdf_owner') AS pdf_owner,
 (SELECT count(*) FROM public.proposal_usage_events e JOIN public.proposals p ON p.id=e.proposal_id WHERE p.user_id=pr.id AND e.event_type='pdf_public') AS pdf_public,
 (SELECT count(*) FROM public.proposal_usage_events e JOIN public.proposals p ON p.id=e.proposal_id WHERE p.user_id=pr.id AND e.event_type='link_copied') AS link_copied,
 (SELECT count(*) FROM public.proposal_usage_events e JOIN public.proposals p ON p.id=e.proposal_id WHERE p.user_id=pr.id AND e.event_type='whatsapp_opened') AS whatsapp_opened,
 (SELECT count(*) FROM public.proposal_usage_events e JOIN public.proposals p ON p.id=e.proposal_id WHERE p.user_id=pr.id AND e.event_type='email_sent') AS email_sent
 FROM public.profiles pr) r);
END; $$;
REVOKE ALL ON FUNCTION public.get_admin_proposal_usage() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_admin_proposal_usage() TO authenticated;