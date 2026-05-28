import type { MetadataRoute } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticLastModified = new Date("2026-04-17");
  const currentLastModified = new Date();
  
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
      url: `${siteUrl}/hidden-tools`,
      lastModified: staticLastModified,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${siteUrl}/best-free-developer-tools`,
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/weekly-roundups`,
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/weekly-roundups/weekly-roundup-2026-05-21`,
      lastModified: new Date("2026-05-21"),
      changeFrequency: "monthly",
      priority: 0.75
    },
    {
      url: `${siteUrl}/security`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.6
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
    },
    {
      url: `${siteUrl}/ads-disclosure`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/copyright`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/dmca`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/license`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.5
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
      .select("slug, created_at, category")
      .eq("status", "approved")
      .not("slug", "is", null)
      .neq("slug", "")
      .order("created_at", { ascending: false });

    if (tools) {
      toolEntries = tools.map((tool: any) => ({
        url: `${siteUrl}/tools/${tool.slug}`,
        lastModified: tool?.created_at ? new Date(tool.created_at) : currentLastModified,
        changeFrequency: "monthly",
        priority: 0.7
      }));
    }

  } catch (error) {
    console.error("Sitemap fetch failed:", error);
    // Continue with static entries if dynamic fetch fails
  }

  return [...staticEntries, ...articleEntries, ...toolEntries];
}
