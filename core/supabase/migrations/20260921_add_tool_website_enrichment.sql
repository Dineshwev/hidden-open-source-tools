ALTER TABLE public.open_source_tools
  ADD COLUMN IF NOT EXISTS pricing_info text,
  ADD COLUMN IF NOT EXISTS key_features text[],
  ADD COLUMN IF NOT EXISTS integrations text[];
