import { getSiteUrl } from "@/lib/site-url";
import { getApprovedSuccessToolCount } from "@/lib/tool-count";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { Metadata } from "next";
import HomeDesktopLanding, { type Tool } from "@/components/home/HomeDesktopLanding";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const title = "Open-Source Tools and Comparisons | The Cloud Rain";
  const description = `Explore ${toolCount}+ open-source tools and developer resources. Compare projects and read practical guides to help evaluate software for your workflow.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "The Cloud Rain",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function HomePage() {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const supabase = getAdmin();

  const { data: initialToolsData } = await supabase
    .from("open_source_tools")
    .select("id, name, slug, description, category, url, logo_url, github_stars")
    .eq("status", "approved")
    .in("slug", ["gitea", "plausible", "uptime-kuma", "meilisearch", "appwrite", "coolify"])
    .limit(6);

  const rawList = [...(initialToolsData ?? [])];
  if (rawList.length < 6) {
    const { data: fallbackTools } = await supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, logo_url, github_stars")
      .eq("status", "approved")
      .order("github_stars", { ascending: false, nullsFirst: false })
      .limit(6);

    if (fallbackTools && fallbackTools.length > 0) {
      const existingSlugs = new Set(rawList.map((t) => String(t.slug)));
      for (const t of fallbackTools) {
        if (!existingSlugs.has(String(t.slug)) && rawList.length < 6) {
          rawList.push(t);
        }
      }
    }
  }

  const initialTools: Tool[] = rawList.map((t) => ({
    id: String(t.id ?? ""),
    name: String(t.name ?? ""),
    slug: String(t.slug ?? ""),
    description: String(t.description ?? ""),
    category: String(t.category ?? ""),
    url: String(t.url ?? ""),
    logo_url: t.logo_url ? String(t.logo_url) : null,
    github_stars: typeof t.github_stars === "number" ? t.github_stars : null,
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is The Cloud Rain?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `A curated directory of ${toolCount}+ open-source tools, self-hosted software, and free alternatives to expensive SaaS products. Every tool is manually reviewed before being added.`
        }
      },
      {
        "@type": "Question",
        name: "Are all tools completely free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most tools are open-source and free to self-host. Some offer managed cloud-hosted versions with free tiers. Always check the individual tool's license before deploying in production."
        }
      },
      {
        "@type": "Question",
        name: "How is this different from GitHub Awesome lists?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Awesome lists are raw link dumps. The Cloud Rain adds verified star counts, category filtering, SaaS comparison pages, and practical evaluation metrics to help you make decisions faster."
        }
      },
      {
        "@type": "Question",
        name: "How often are new tools added?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "New tools are added continuously through our review pipeline. You can also submit new tools via the Upload page."
        }
      },
      {
        "@type": "Question",
        name: "Can I replace Jira, Firebase, or HubSpot with open-source tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Check the 'Comparisons' and 'Alternatives' pages for side-by-side breakdowns of open-source alternatives like Plane, Supabase, and Twenty with feature comparisons."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Open-Source Tools",
    itemListElement: initialTools.map((tool, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: tool.name,
      url: `${siteUrl}/tools/${tool.slug}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <HomeDesktopLanding initialTools={initialTools} initialCount={toolCount} />
    </>
  );
}
