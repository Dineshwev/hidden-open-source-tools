"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, X } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

type SortOption = "latest" | "oldest" | "a-z" | "z-a";

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

function stripMarkdown(text: string | null | undefined): string {
  return (text || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ArticleMuseumClient({
  articles = [],
  initialSearch = "",
}: {
  articles: ArticleRow[];
  initialSearch?: string;
}) {
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const art of articles) {
      for (const rawTag of art.tags || []) {
        const tag = String(rawTag).trim().toLowerCase();
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [articles]);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = articles.filter((article) => {
      if (selectedTag !== "all") {
        const tagsLower = (article.tags || []).map((t) => String(t).trim().toLowerCase());
        if (!tagsLower.includes(selectedTag)) return false;
      }
      if (!q) return true;
      const haystack = `${article.title || ""} ${article.tool_name || ""} ${(article.tags || []).join(" ")} ${article.mystery_intro || ""}`.toLowerCase();
      return haystack.includes(q);
    });

    if (sortOption === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
      );
    } else if (sortOption === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime()
      );
    } else if (sortOption === "a-z") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortOption === "z-a") {
      list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    return list;
  }, [articles, searchQuery, selectedTag, sortOption]);

  return (
    <div className="space-y-8 pb-16">
      <div className="pt-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Deep Dives" },
          ]}
        />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
            Tool Deep Dives
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-0.5 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {filteredAndSorted.length} of {articles.length} guides
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          Open-Source Tool Deep Dives &amp; Self-Hosting Guides
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-300">
          Practical technical breakdowns of self-hostable open-source software, architecture trade-offs, and Docker quickstarts.
        </p>
      </section>

      {/* Compact Search, Topic Filter & Sort Toolbar */}
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deep dives by tool name, SaaS replaced, or topic..."
              className="w-full rounded-xl border border-white/15 bg-black/60 py-2.5 pl-10 pr-9 text-sm text-white placeholder-white/40 focus:border-cyan-400/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "latest", label: "Latest" },
              { key: "oldest", label: "Oldest" },
              { key: "a-z", label: "A–Z" },
              { key: "z-a", label: "Z–A" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSortOption(option.key as SortOption)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  sortOption === option.key
                    ? "bg-cyan-300 font-semibold text-slate-950"
                    : "border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {topTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedTag("all")}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                selectedTag === "all"
                  ? "border border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              All Topics
            </button>
            {topTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wider transition ${
                  selectedTag === tag
                    ? "border border-cyan-400/40 bg-cyan-400/15 font-semibold text-cyan-200"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Articles Grid */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {!filteredAndSorted.length ? (
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-3">
            <h2 className="font-display text-xl text-white">No matching deep dives found</h2>
            <p className="text-sm text-slate-400">Try clearing your search query or topic filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-200 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAndSorted.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/35 hover:bg-white/[0.05]"
            >
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                    {article.tool_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })
                      : "Recently"}
                  </span>
                  <span className="text-xs text-slate-400">
                    · {article.read_time || "5 min read"}
                  </span>
                </div>

                <h2 className="mb-2.5 font-display text-xl font-semibold leading-snug text-white group-hover:text-cyan-200 transition-colors">
                  <Link href={`/article-museum/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>

                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-300">
                  {stripMarkdown(article.mystery_intro)}
                </p>

                <div className="mb-5 flex flex-wrap gap-1.5">
                  {(article.tags || []).slice(0, 4).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/article-museum/${article.slug}`}
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                <span>Read Deep Dive</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
