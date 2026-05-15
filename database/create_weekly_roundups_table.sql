-- Create weekly_roundups table
CREATE TABLE IF NOT EXISTS weekly_roundups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  week_date DATE NOT NULL,
  featured_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  comparison_table JSONB NOT NULL DEFAULT '{}'::jsonb,
  news_summaries JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_weekly_roundups_slug ON weekly_roundups(slug);

-- Create index on week_date for sorting
CREATE INDEX IF NOT EXISTS idx_weekly_roundups_week_date ON weekly_roundups(week_date DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_weekly_roundups_status ON weekly_roundups(status);

-- Create index on created_at for recent posts
CREATE INDEX IF NOT EXISTS idx_weekly_roundups_created_at ON weekly_roundups(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_roundups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_weekly_roundups_updated_at ON weekly_roundups;

CREATE TRIGGER trigger_weekly_roundups_updated_at
  BEFORE UPDATE ON weekly_roundups
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_roundups_updated_at();
