ALTER TABLE public.saas_reference
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.alternatives
  ADD COLUMN IF NOT EXISTS verified_regenerated_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS alternatives_verified_regenerated_at_idx
  ON public.alternatives (verified_regenerated_at);
