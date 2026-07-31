REVOKE ALL ON public.stripe_events FROM anon;
REVOKE ALL ON public.stripe_events FROM authenticated;
GRANT ALL ON public.stripe_events TO service_role;