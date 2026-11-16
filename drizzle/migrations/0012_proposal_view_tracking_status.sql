CREATE OR REPLACE FUNCTION public.mark_proposal_viewed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status uuid;
BEGIN
 SELECT id INTO v_status FROM public.proposal_statuses WHERE NOT is_final AND lower(name) IN ('visualizada','viewed') ORDER BY position LIMIT 1;
 IF v_status IS NOT NULL THEN
 UPDATE public.proposals p SET status_id=v_status FROM public.proposal_statuses s WHERE p.id=NEW.proposal_id AND s.id=p.status_id AND NOT s.is_final AND lower(s.name) IN ('rascunho','draft','enviada','sent');
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.mark_proposal_viewed() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER mark_proposal_viewed AFTER INSERT ON public.proposal_views FOR EACH ROW EXECUTE FUNCTION public.mark_proposal_viewed();