import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import ArticleMuseumClient from "./ArticleMuseumClient";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Open-Source Tool Deep Dives & Self-Hosting Guides (2026)",
  description:
    "Hands-on technical deep dives into underrated open-source tools and self-hosted SaaS alternatives. Architecture breakdowns, real use cases, and Docker setup guides.",
  alternates: {
    canonical: "/article-museum",
  },
  openGraph: {
    title: "Open-Source Tool Deep Dives & Self-Hosting Guides (2026) | The Cloud Rain",
    description:
      "Hands-on technical deep dives into underrated open-source tools and self-hosted SaaS alternatives, with architecture breakdowns and Docker quickstarts.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open-Source Tool Deep Dives & Self-Hosting Guides (2026) | The Cloud Rain",
    description:
      "Hands-on technical deep dives into underrated open-source tools and self-hosted SaaS alternatives.",
  },
};

export const revalidate = 3600;

function normalizeSearchTerm(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type ArticleRow = {
  id: string;
  slug: string;
  tool_name?: string | null;
  published_at?: string | null;
  read_time?: string | null;
  title?: string | null;
  mystery_intro?: string | null;
  tags?: string[] | null;
};

export default async function ArticleMuseumPage({
  searchParams
}: {
  searchParams?: { search?: string | string[] };
}) {
  const supabase = getAdmin();
  
  // Fetch directly from database to bypass all API caching
  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const articleRows = (articles || []) as ArticleRow[];
  const searchTerm = normalizeSearchTerm(searchParams?.search)?.trim() || "";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/article-museum`,
        url: `${siteUrl}/article-museum`,
        name: "Open-Source Tool Deep Dives & Self-Hosting Guides",
        description:
          "Hands-on technical deep dives into underrated open-source tools and self-hosted SaaS alternatives.",
      },
      {
        "@type": "ItemList",
        name: "Open-Source Tool Deep Dives",
        numberOfItems: articleRows.length,
        itemListElement: articleRows.slice(0, 50).map((art, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: art.title || art.tool_name || art.slug,
          url: `${siteUrl}/article-museum/${art.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Deep Dives", item: `${siteUrl}/article-museum` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          Error loading articles: {error.message}
        </div>
      ) : null}
      <ArticleMuseumClient articles={articleRows} initialSearch={searchTerm} />
    </>
  );
}
