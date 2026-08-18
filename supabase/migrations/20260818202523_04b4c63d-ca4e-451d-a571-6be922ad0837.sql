CREATE TABLE public.text_snippets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'terms',
  title text NOT NULL,
  body text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT text_snippets_kind_check CHECK (kind IN ('description','notes','terms'))
);

CREATE INDEX text_snippets_user_kind_idx ON public.text_snippets (user_id, kind, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.text_snippets TO authenticated;
GRANT ALL ON public.text_snippets TO service_role;

ALTER TABLE public.text_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snippets" ON public.text_snippets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own snippets" ON public.text_snippets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own snippets" ON public.text_snippets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own snippets" ON public.text_snippets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_text_snippets_updated_at
  BEFORE UPDATE ON public.text_snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();