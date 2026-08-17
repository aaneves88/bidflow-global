CREATE TABLE public.ebook_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  source text NOT NULL DEFAULT 'ebook-orcamento',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ebook_leads_email_idx ON public.ebook_leads (lower(email));
GRANT INSERT ON public.ebook_leads TO anon, authenticated;
GRANT ALL ON public.ebook_leads TO service_role;
ALTER TABLE public.ebook_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an ebook lead" ON public.ebook_leads FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND length(email) <= 255 AND (name IS NULL OR length(name) <= 120));
CREATE POLICY "Admins can view ebook leads" ON public.ebook_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));