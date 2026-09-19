ALTER TABLE public.comparisons
ADD COLUMN IF NOT EXISTS verified_regenerated_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS comparisons_verified_regenerated_at_idx
ON public.comparisons (verified_regenerated_at);
