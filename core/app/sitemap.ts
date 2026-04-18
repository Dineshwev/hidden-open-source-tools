import type { MetadataRoute } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  // 1. Static Pages (as per requirements)
  const staticEntries: MetadataRoute.Sitemap = [
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
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/article-museum`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/open-source-software`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85
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
    }
  ];

  let articleEntries: MetadataRoute.Sitemap = [];

  try {
    const supabase = getAdmin();
    const { data: articles, error } = await supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (!error && articles) {
      articleEntries = articles.map((art: any) => ({
        url: `${siteUrl}/article-museum/${art.slug}`,
        lastModified: art.updated_at ? new Date(art.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.8
      }));
    }
  } catch (err) {
    console.error("Sitemap generation error:", err);
    // Graceful error handling - return static entries if fetch fails
  }

  return [...staticEntries, ...articleEntries];
}