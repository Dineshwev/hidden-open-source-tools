type ToolRecordLike = {
  id?: unknown;
  slug?: unknown;
  created_at?: unknown;
};

/** Keep one stable, original record when legacy duplicate tool slugs exist. */
export function dedupeToolRowsBySlug<T extends ToolRecordLike>(rows: T[]): T[] {
  const isPreferred = (a: T, b: T) => {
    const createdA = Date.parse(String(a.created_at ?? ""));
    const createdB = Date.parse(String(b.created_at ?? ""));
    const timeA = Number.isFinite(createdA) ? createdA : Number.MAX_SAFE_INTEGER;
    const timeB = Number.isFinite(createdB) ? createdB : Number.MAX_SAFE_INTEGER;

    if (timeA !== timeB) return timeA < timeB;
    return String(a.id ?? "").localeCompare(String(b.id ?? "")) < 0;
  };

  const preferredBySlug = new Map<string, T>();
  for (const row of rows) {
    const slug = String(row.slug ?? "").trim();
    if (!slug) continue;
    const current = preferredBySlug.get(slug);
    if (!current || isPreferred(row, current)) preferredBySlug.set(slug, row);
  }

  // Preserve the caller's sort order after selecting the preferred record.
  return rows.filter((row) => {
    const slug = String(row.slug ?? "").trim();
    return slug.length > 0 && preferredBySlug.get(slug) === row;
  });
}
