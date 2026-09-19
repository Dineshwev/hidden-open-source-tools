-- One-time backfill for open_source_tools.
-- A row is considered complete only when all structured-content fields written by
-- generate-tool-structured-content.ts are non-NULL.

-- Dry-run summary: review these counts before applying the UPDATE below.
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (
    WHERE structured_content_status IS NULL
      AND readme_excerpt IS NOT NULL
      AND pros IS NOT NULL
      AND cons IS NOT NULL
      AND best_for IS NOT NULL
      AND not_for IS NOT NULL
  ) AS would_mark_success,
  COUNT(*) FILTER (
    WHERE structured_content_status IS NULL
      AND NOT (
        readme_excerpt IS NOT NULL
        AND pros IS NOT NULL
        AND cons IS NOT NULL
        AND best_for IS NOT NULL
        AND not_for IS NOT NULL
      )
  ) AS incomplete_null_status_rows,
  COUNT(*) FILTER (WHERE structured_content_status IS NOT NULL) AS already_statused_rows
FROM open_source_tools;

-- Apply only to rows that are currently unclassified and have all generated
-- structured-content fields populated. Existing statuses are preserved.
BEGIN;

UPDATE open_source_tools
SET structured_content_status = 'success'
WHERE structured_content_status IS NULL
  AND readme_excerpt IS NOT NULL
  AND pros IS NOT NULL
  AND cons IS NOT NULL
  AND best_for IS NOT NULL
  AND not_for IS NOT NULL;

-- Verification inside the transaction, before COMMIT.
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE structured_content_status = 'success') AS success_rows,
  COUNT(*) FILTER (
    WHERE structured_content_status IS NULL
      AND NOT (
        readme_excerpt IS NOT NULL
        AND pros IS NOT NULL
        AND cons IS NOT NULL
        AND best_for IS NOT NULL
        AND not_for IS NOT NULL
      )
  ) AS remaining_incomplete_null_status_rows
FROM open_source_tools;

COMMIT;
