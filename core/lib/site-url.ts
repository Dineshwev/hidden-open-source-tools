const FINAL_HOST = "https://www.thecloudrain.org";

export function getSiteUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = explicitSiteUrl || FINAL_HOST;
  return url.replace(/\/+$/, "");
}
