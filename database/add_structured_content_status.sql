ALTER TABLE IF EXISTS open_source_tools
ADD COLUMN IF NOT EXISTS structured_content_status TEXT
CHECK (structured_content_status IN ('success', 'failed', 'skipped'));

CREATE INDEX IF NOT EXISTS idx_open_source_tools_structured_content_status
ON open_source_tools(structured_content_status);
