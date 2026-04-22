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
  let toolEntries: MetadataRoute.Sitemap = [];

  try {
    const supabase = getAdmin();
    
    // Fetch Articles
    const { data: articles } = await supabase
      .from("articles")
      .select("id, slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (articles) {
      articleEntries = articles.map((art: any) => ({
        url: `${siteUrl}/article-museum/${art.slug}`,
        lastModified: art.published_at ? new Date(art.published_at) : staticLastModified,
        changeFrequency: "monthly",
        priority: 0.8
      }));
    }

    // Fetch Approved Tools
    const { data: tools } = await supabase
      .from("open_source_tools")
      .select("id, scraped_at, status")
      .or('status.eq.approved,status.is.null')
      .order("scraped_at", { ascending: false });

    if (tools) {
      toolEntries = tools.map((tool: any) => ({
        url: `${siteUrl}/free-tools/${tool.id}`,
        lastModified: tool.scraped_at ? new Date(tool.scraped_at) : staticLastModified,
        changeFrequency: "monthly",
        priority: 0.8
      }));
    }

  } catch (error) {
    console.error("Sitemap fetch failed:", error);
    // Continue with static entries if dynamic fetch fails
  }

  return [...staticEntries, ...articleEntries, ...toolEntries];
}
