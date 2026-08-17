ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS tax_id_type text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tax_id_type_check
  CHECK (tax_id_type IS NULL OR tax_id_type IN ('cpf','cnpj'));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_tax_id_unique
  ON public.profiles (tax_id)
  WHERE tax_id IS NOT NULL;