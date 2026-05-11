const DEFAULT_SITE_URL = "https://www.thecloudrain.org";

export function getSiteUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicitSiteUrl) {
    return explicitSiteUrl;
  }

  return DEFAULT_SITE_URL;
}