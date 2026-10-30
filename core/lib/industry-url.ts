/** Return the canonical route for an industry page regardless of whether its
 * stored slug already includes the public `best-` prefix.
 */
export function getIndustryPagePath(slug: string): string {
  const normalizedSlug = slug.trim().replace(/^\/+|\/+$/g, "");
  const pathSlug = normalizedSlug.startsWith("best-")
    ? normalizedSlug
    : `best-${normalizedSlug}`;

  return `/${pathSlug}`;
}
