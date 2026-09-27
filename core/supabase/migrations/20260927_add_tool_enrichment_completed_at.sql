ALTER TABLE public.open_source_tools
  ADD COLUMN IF NOT EXISTS enrichment_completed_at timestamptz;
