import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { Metadata } from "next";
import ArticleMuseumClient from "./ArticleMuseumClient";

export const metadata: Metadata = {
  title: "Open Source Tool Deep Dives for Developers and DevOps",
  description: "Read practical deep dives on open-source developer tools, self-hosted software, and lightweight SaaS alternatives for builders and DevOps teams.",
  keywords: [
    "open source tool reviews",
    "developer tool deep dives",
    "self-hosted software analysis"
  ],
  openGraph: {
    title: "Open Source Tool Deep Dives for Developers and DevOps",
    description: "Read practical deep dives on open-source developer tools, self-hosted software, and lightweight SaaS alternatives for builders and DevOps teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Source Tool Deep Dives for Developers and DevOps",
    description: "Read practical deep dives on open-source developer tools, self-hosted software, and lightweight SaaS alternatives for builders and DevOps teams.",
  }
};

// Force fresh data on every visit
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const searchTerm = normalizeSearchTerm(searchParams?.search)?.trim().toLowerCase() || "";
  const filteredArticles = searchTerm
    ? articleRows.filter((article) => {
        const haystack = `${article.title || ""} ${article.tool_name || ""} ${(article.tags || []).join(" ")} ${article.mystery_intro || ""}`.toLowerCase();
        return haystack.includes(searchTerm);
      })
    : articleRows;

  return (
    <>
      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          Error loading articles: {error.message}
        </div>
      ) : null}
      <ArticleMuseumClient articles={filteredArticles} />
    </>
  );
}
