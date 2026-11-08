type ToolRecordLike = {
  id?: unknown;
  slug?: unknown;
  created_at?: unknown;
  github_stars?: unknown;
  ai_content?: unknown;
  description?: unknown;
};

/** Keep one stable, rich record when duplicate tool slugs exist, preferring records with stars/content. */
export function dedupeToolRowsBySlug<T extends ToolRecordLike>(rows: T[]): T[] {
  const isPreferred = (a: T, b: T) => {
    // 1. Prefer record with higher GitHub stars
    const starsA = Number(a.github_stars || 0);
    const starsB = Number(b.github_stars || 0);
    if (starsA !== starsB) return starsA > starsB;

    // 2. Prefer record with substantive AI content or description
    const contentLenA = String(a.ai_content || a.description || "").length;
    const contentLenB = String(b.ai_content || b.description || "").length;
    if (Math.abs(contentLenA - contentLenB) > 50) return contentLenA > contentLenB;

    // 3. Fall back to oldest record
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
