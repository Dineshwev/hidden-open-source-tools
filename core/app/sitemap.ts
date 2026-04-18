import type { MetadataRoute } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticLastModified = new Date("2026-04-17");
  
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: staticLastModified,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/free-tools`,
      lastModified: staticLastModified,
      changeFrequency: "daily",
      priority: 0.95
    },
    {
      url: `${siteUrl}/mystery-box`,
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/article-museum`,
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/open-source-software`,
      lastModified: staticLastModified,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/about`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];

  let articleEntries: MetadataRoute.Sitemap = [];

  try {
    const supabase = getAdmin();
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      throw error;
    }

    articleEntries = (articles ?? []).map((art: any) => ({
      url: `${siteUrl}/article-museum/${art.slug}`,
      lastModified: art.published_at ? new Date(art.published_at) : staticLastModified,
      changeFrequency: "monthly",
      priority: 0.8
    }));
  } catch (error) {
    console.error("Sitemap articles fetch failed:", error);
    return staticEntries;
  }

  return [...staticEntries, ...articleEntries];
}
