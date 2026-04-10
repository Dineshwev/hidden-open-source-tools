import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/free-tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95
    },
    {
      url: `${siteUrl}/mystery-box`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/open-source-software`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/hidden-tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${siteUrl}/best-free-developer-tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88
    },
    {
      url: `${siteUrl}/weekly-roundups`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.84
    },
    {
      url: `${siteUrl}/weekly-roundups/2026-04-10`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.74
    },
    {
      url: `${siteUrl}/weekly-roundups/2026-04-03`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72
    },
    {
      url: `${siteUrl}/weekly-roundups/2026-03-27`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/upload`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/dmca`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/general-queries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6
    }
  ];
}