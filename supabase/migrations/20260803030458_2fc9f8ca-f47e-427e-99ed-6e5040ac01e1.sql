-- 1. app_settings: anon only sees branding
DROP POLICY IF EXISTS "Public can view branding settings" ON public.app_settings;
CREATE POLICY "Public can view branding settings"
ON public.app_settings FOR SELECT TO anon
USING (category = 'branding');

-- 2. proposal_views: require knowledge of public_code via RPC
DROP POLICY IF EXISTS "Anyone can record a proposal view" ON public.proposal_views;

CREATE OR REPLACE FUNCTION public.record_proposal_view(p_code text, p_user_agent text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_code IS NULL OR length(p_code) < 4 THEN
    RETURN;
  END IF;

  SELECT id INTO v_id FROM public.proposals WHERE public_code = p_code;
  IF v_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.proposal_views (proposal_id, user_agent)
  VALUES (v_id, left(coalesce(p_user_agent, ''), 200));
END;
$$;

REVOKE ALL ON FUNCTION public.record_proposal_view(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_proposal_view(text, text) TO anon, authenticated;

-- 3. Lock down internal email-queue functions + fix mutable search_path
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;

REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;

-- 4. accept_proposal / sign_proposal etc: keep public (link-based), but drop implicit PUBLIC grant
REVOKE EXECUTE ON FUNCTION public.accept_proposal(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_proposal_branding(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_proposal_pix(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_proposal_signature(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_proposal(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sign_proposal(text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;