import type { MetadataRoute } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getIndustryPagePath } from "@/lib/industry-url";
import { getSiteUrl } from "@/lib/site-url";
import { dedupeToolRowsBySlug } from "@/lib/tool-records";

const siteUrl = getSiteUrl();

// Refresh the generated URL list after database status/content changes.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/free-tools`,
      changeFrequency: "daily",
      priority: 0.95
    },
    {
      url: `${siteUrl}/vs`,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/alternatives`,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/article-museum`,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/open-source-software`,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${siteUrl}/hidden-tools`,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${siteUrl}/best-free-developer-tools`,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/weekly-roundups`,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/weekly-roundups/weekly-roundup-2026-05-21`,
      changeFrequency: "monthly",
      priority: 0.75
    },
    {
      url: `${siteUrl}/security`,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/copyright`,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/dmca`,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/license`,
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];

  let articleEntries: MetadataRoute.Sitemap = [];
  let toolEntries: MetadataRoute.Sitemap = [];
  let industryEntries: MetadataRoute.Sitemap = [];
  let comparisonEntries: MetadataRoute.Sitemap = [];
  let altEntries: MetadataRoute.Sitemap = [];
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
        changeFrequency: "monthly",
        priority: 0.8
      }));
    }

    // Fetch Approved Tools (with structured_content_status = 'success')
    let allTools: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: pageTools, error: toolsError } = await supabase
        .from("open_source_tools")
        .select("id, slug, created_at, enrichment_completed_at")
        .eq("status", "approved")
        .eq("structured_content_status", "success")
        .not("slug", "is", null)
        .neq("slug", "")
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (toolsError || !pageTools || pageTools.length === 0) {
        hasMore = false;
      } else {
        allTools = allTools.concat(pageTools);
        if (pageTools.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    if (allTools.length > 0) {
      toolEntries = dedupeToolRowsBySlug(allTools).map((tool: any) => ({
        url: `${siteUrl}/tools/${tool.slug}`,
        ...(tool?.enrichment_completed_at
          ? { lastModified: new Date(tool.enrichment_completed_at) }
          : {}),
        changeFrequency: "monthly",
        priority: 0.7
      }));
    }

    // Fetch Industry Pages
    const { data: industryPages } = await supabase
      .from("industry_pages")
      .select("slug, created_at")
      .eq("status", "published");

    if (industryPages) {
      industryEntries = industryPages
        .filter((row: any) => typeof row?.slug === "string" && row.slug.trim().length > 0)
        .map((row: any) => ({
          url: `${siteUrl}${getIndustryPagePath(row.slug)}`,
          changeFrequency: "monthly",
          priority: 0.8
        }));
    }

    const { data: comparisons } = await supabase
      .from("comparisons")
      .select("slug, verified_regenerated_at")
      .eq("status", "published");

    if (comparisons) {
      comparisonEntries = comparisons.map((row: any) => ({
        url: `${siteUrl}/vs/${row.slug}`,
        ...(row.verified_regenerated_at ? { lastModified: new Date(row.verified_regenerated_at) } : {}),
        changeFrequency: "monthly",
        priority: 0.75
      }));
    }

    const { data: altsData } = await supabase
      .from("alternatives")
      .select("saas_slug, verified_regenerated_at")
      .eq("status", "approved");

    if (altsData) {
      altEntries = altsData.map((row: any) => ({
        url: `${siteUrl}/alternatives/${row.saas_slug}`,
        ...(row.verified_regenerated_at ? { lastModified: new Date(row.verified_regenerated_at) } : {}),
        changeFrequency: "monthly",
        priority: 0.75
      }));
    }

  } catch (error) {
    console.error("Sitemap fetch failed:", error);
    // Continue with static entries if dynamic fetch fails
  }

  return [...staticEntries, ...articleEntries, ...toolEntries, ...industryEntries, ...comparisonEntries, ...altEntries];
}
