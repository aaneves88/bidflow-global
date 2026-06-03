ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS allow_pdf_export boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_templates boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_custom_branding boolean NOT NULL DEFAULT false;

UPDATE public.plans
SET allow_pdf_export = true,
    allow_custom_branding = true
WHERE price > 0;