import type { MetadataRoute } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import {
  FREE_TOOLS_CATEGORY_PAGES,
  FREE_TOOLS_PAGE_SIZE,
  buildFreeToolsRoute
} from "@/app/free-tools/free-tools-data";

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
      url: `${siteUrl}/weekly-roundups/2026-04-10`,
      lastModified: new Date("2026-04-10"),
      changeFrequency: "monthly",
      priority: 0.75
    },
    {
      url: `${siteUrl}/weekly-roundups/2026-04-03`,
      lastModified: new Date("2026-04-03"),
      changeFrequency: "monthly",
      priority: 0.75
    },
    {
      url: `${siteUrl}/weekly-roundups/2026-03-27`,
      lastModified: new Date("2026-03-27"),
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
    }
  ];

  let articleEntries: MetadataRoute.Sitemap = [];
  let toolEntries: MetadataRoute.Sitemap = [];
  let freeToolsPaginationEntries: MetadataRoute.Sitemap = [];

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
      const approvedTools = tools.filter((tool: any) => !tool?.status || String(tool.status).toLowerCase() === "approved");

      toolEntries = tools.map((tool: any) => ({
        url: `${siteUrl}/free-tools/${tool.id}`,
        lastModified: tool.scraped_at ? new Date(tool.scraped_at) : staticLastModified,
        changeFrequency: "monthly",
        priority: 0.8
      }));

      const totalDirectoryPages = Math.ceil(approvedTools.length / FREE_TOOLS_PAGE_SIZE);

      for (let page = 2; page <= totalDirectoryPages; page += 1) {
        freeToolsPaginationEntries.push({
          url: `${siteUrl}${buildFreeToolsRoute(null, page)}`,
          lastModified: staticLastModified,
          changeFrequency: "weekly",
          priority: 0.7
        });
      }

      for (const categoryPage of FREE_TOOLS_CATEGORY_PAGES) {
        const categoryTools = approvedTools.filter((tool: any) => {
          const raw = String(tool?.category || "").trim().toLowerCase();
          if (categoryPage.category === "ui-kit") return ["ui-kit", "ui kits", "ui kit"].includes(raw);
          if (categoryPage.category === "course") return ["course", "courses"].includes(raw);
          if (categoryPage.category === "template") return ["template", "templates"].includes(raw);
          if (categoryPage.category === "ai-tool") return ["ai-tool", "ai tools", "ai tool"].includes(raw);
          if (categoryPage.category === "ui-component") return ["ui-component", "ui components", "component", "components"].includes(raw);
          return !["ui-kit", "ui kits", "ui kit", "course", "courses", "template", "templates", "ai-tool", "ai tools", "ai tool", "ui-component", "ui components", "component", "components"].includes(raw);
        });

        freeToolsPaginationEntries.push({
          url: `${siteUrl}${buildFreeToolsRoute(categoryPage.slug, 1)}`,
          lastModified: staticLastModified,
          changeFrequency: "weekly",
          priority: 0.72
        });

        const categoryPages = Math.ceil(categoryTools.length / FREE_TOOLS_PAGE_SIZE);
        for (let page = 2; page <= categoryPages; page += 1) {
          freeToolsPaginationEntries.push({
            url: `${siteUrl}${buildFreeToolsRoute(categoryPage.slug, page)}`,
            lastModified: staticLastModified,
            changeFrequency: "weekly",
            priority: 0.68
          });
        }
      }
    }

  } catch (error) {
    console.error("Sitemap fetch failed:", error);
    // Continue with static entries if dynamic fetch fails
  }

  return [...staticEntries, ...articleEntries, ...toolEntries, ...freeToolsPaginationEntries];
}
