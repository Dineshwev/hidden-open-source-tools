const FINAL_HOST = "https://www.thecloudrain.org";

export function getSiteUrl() {
  // The production site has one canonical host. Ignore a stray production
  // environment value (for example localhost or the non-www alias) so metadata,
  // robots.txt, and the sitemap all emit the same canonical origin.
  if (process.env.NODE_ENV === "production") return FINAL_HOST;

  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = explicitSiteUrl || FINAL_HOST;
  return url.replace(/\/+$/, "");
}
