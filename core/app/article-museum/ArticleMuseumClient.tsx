"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

export default function ArticleMuseumClient({
  articles = []
}: {
  articles: ArticleRow[];
}) {
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  const sortedArticles = useMemo(() => {
    const sorted = [...articles];

    if (sortOption === "latest") {
      sorted.sort(
        (a, b) =>
          new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
      );
    } else if (sortOption === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime()
      );
    } else if (sortOption === "a-z") {
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortOption === "z-a") {
      sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    return sorted;
  }, [articles, sortOption]);

  return (
    <div className="space-y-10">
      <section className="mb-10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Tool Deep Dives
        </p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-4xl text-white">
            Deep dives into open-source developer tools
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            {articles.length} articles
          </span>
        </div>
        <p className="mt-3 text-white/60 max-w-2xl text-lg leading-relaxed">
          Practical analysis of open-source tools, self-hosted software, and lightweight SaaS alternatives worth evaluating for real projects.
        </p>
      </section>

      {/* Sort filter section */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Sort</p>
        <h2 className="mt-2 text-xl text-white">Organize articles</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Click a sort option below to re-order the article list.
        </p>

        {/* Sort buttons row */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { key: "latest", label: "Latest First" },
            { key: "oldest", label: "Oldest First" },
            { key: "a-z", label: "A → Z" },
            { key: "z-a", label: "Z → A" }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSortOption(option.key as SortOption)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                sortOption === option.key
                  ? "bg-cyan-300 font-semibold text-slate-900"
                  : "border border-white/20 text-white/90"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Articles grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {!sortedArticles.length ? (
          <div className="col-span-1 md:col-span-2 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="font-display text-xl text-white">First article coming soon...</h2>
            <p className="mt-2 text-white/50">Stay tuned for deep dives into open-source history.</p>
          </div>
        ) : (
          sortedArticles.map((article) => (
            <div
              key={article.id}
              className="glass-panel flex flex-col justify-between rounded-[1.5rem] border border-white/10 p-6 transition-colors hover:border-white/20"
            >
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    {article.tool_name}
                  </span>
                  <span className="text-xs text-white/40">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recently'}
                  </span>
                  <span className="text-xs text-white/40">• {article.read_time || "5 min read"}</span>
                </div>
                <h2 className="mb-3 font-display text-2xl font-semibold text-white">
                  {article.title}
                </h2>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-white/60">
                  {article.mystery_intro}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {(article.tags || []).map((tag: string) => (
                    <span key={tag} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] uppercase text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/article-museum/${article.slug}`}
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                Read Story <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
