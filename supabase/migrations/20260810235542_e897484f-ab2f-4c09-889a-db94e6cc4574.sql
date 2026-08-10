GRANT SELECT ON public.plans TO anon;
CREATE POLICY "Anon can view active plans" ON public.plans FOR SELECT TO anon USING (is_active = true);