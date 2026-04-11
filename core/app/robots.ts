import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/control-room/", "/admin/", "/api/"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}