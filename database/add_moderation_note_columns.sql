ALTER TABLE IF EXISTS scraped_tools
ADD COLUMN IF NOT EXISTS moderation_note TEXT;

ALTER TABLE IF EXISTS open_source_tools
ADD COLUMN IF NOT EXISTS moderation_note TEXT;
