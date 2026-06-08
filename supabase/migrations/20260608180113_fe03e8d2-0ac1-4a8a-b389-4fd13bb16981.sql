GRANT SELECT ON public.app_settings TO anon;
CREATE POLICY "Public can view branding settings"
ON public.app_settings
FOR SELECT
TO anon
USING (category IN ('branding', 'general'));