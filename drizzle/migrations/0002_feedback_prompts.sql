ALTER TYPE public.support_category ADD VALUE IF NOT EXISTS 'feedback';

CREATE TABLE public.feedback_prompts_shown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  threshold_days integer NOT NULL CHECK (threshold_days IN (3, 10, 30)),
  shown_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, threshold_days)
);
GRANT SELECT, INSERT ON public.feedback_prompts_shown TO authenticated;
GRANT ALL ON public.feedback_prompts_shown TO service_role;
ALTER TABLE public.feedback_prompts_shown ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own feedback prompts" ON public.feedback_prompts_shown
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own feedback prompts" ON public.feedback_prompts_shown
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));