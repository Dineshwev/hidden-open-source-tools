"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Star, Sparkles, Filter, Frown, ArrowUpDown, RefreshCw } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import type { ScrapedTool } from "@/lib/types/scraped-tools.types";

type SortOption = "stars" | "newest" | "alpha" | "shuffle";

const CATEGORY_DEFS: { key: string; label: string; keywords?: string[] }[] = [
  { key: "all", label: "All" },
  { key: "developer-tools", label: "Developer Tools", keywords: ["developer tools", "developer-tools", "tool", "dev", "cli", "sdk", "api"] },
  { key: "self-hosting-infrastructure", label: "Self-Hosting & Infrastructure", keywords: ["self-hosting", "infrastructure", "self-host", "docker", "kubernetes", "infra", "server"] },
  { key: "analytics-search", label: "Analytics & Search", keywords: ["analytics", "search", "monitor", "metrics", "log", "observability"] },
  { key: "media-utilities", label: "Media & Utilities", keywords: ["media", "utilities", "image", "video", "audio", "converter", "compress"] },
  { key: "productivity", label: "Productivity", keywords: ["productivity", "todo", "notes", "workflow", "task", "project"] },
  { key: "security", label: "Security", keywords: ["security", "auth", "oauth", "jwt", "vault", "scan", "privacy"] },
  { key: "business-tools", label: "Business Tools", keywords: ["business", "crm", "invoice", "billing", "saas", "marketing"] },
  { key: "community-events", label: "Community & Events", keywords: ["community", "events", "chat", "forum", "meetup", "discussion"] },
  { key: "miscellaneous", label: "Miscellaneous", keywords: [] }
];

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffleTools<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  const random = createSeededRandom(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

function toolMatchesCategory(tool: ScrapedTool, catKey: string): boolean {
  if (catKey === "all") return true;

  const def = CATEGORY_DEFS.find((category) => category.key === catKey);
  if (!def) return false;

  const rawCat = (tool.raw_category || "").toLowerCase();
  const labelLower = def.label.toLowerCase();

  // Direct category matching
  if (rawCat && (rawCat.includes(labelLower) || labelLower.includes(rawCat))) {
    return true;
  }

  // Keyword haystack fallback
  const haystack = `${tool.title} ${tool.description || ""} ${rawCat} ${tool.source_site || ""}`.toLowerCase();
  if (!def.keywords || def.keywords.length === 0) return true;

  return def.keywords.some((keyword) => haystack.includes(keyword));
}

interface FreeToolsPageClientProps {
  readonly initialTools?: ScrapedTool[];
  readonly initialCount?: number | null;
  readonly initialCategory?: string;
  readonly initialSearch?: string;
  readonly categoryCounts?: Record<string, number> | null;
}

export default function FreeToolsPageClient({
  initialTools = [],
  initialCount = null,
  initialCategory = "all",
  initialSearch = "",
  categoryCounts: categoryCountsProp
}: FreeToolsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [sortOption, setSortOption] = useState<SortOption>("stars");
  const [shuffleSeed, setShuffleSeed] = useState(Date.now());

  // Sync if initial props change
  useEffect(() => {
    if (initialCategory && initialCategory !== "all") {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const categoryCounts = categoryCountsProp ?? null;
  const totalCount = initialCount ?? initialTools.length;

  const visibleTools = useMemo(() => {
    let list = initialTools;

    // Filter by Category
    if (selectedCategory && selectedCategory !== "all") {
      list = list.filter((tool) => toolMatchesCategory(tool, selectedCategory));
    }

    // Filter by Search Query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((tool) => {
        const titleMatch = tool.title.toLowerCase().includes(query);
        const descMatch = (tool.description || "").toLowerCase().includes(query);
        const catMatch = (tool.raw_category || "").toLowerCase().includes(query);
        const urlMatch = (tool.webpage_url || "").toLowerCase().includes(query);
        return titleMatch || descMatch || catMatch || urlMatch;
      });
    }

    const sorted = [...list];

    if (sortOption === "stars") {
      sorted.sort((a, b) => (b.github_stars ?? 0) - (a.github_stars ?? 0));
    } else if (sortOption === "newest") {
      sorted.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
    } else if (sortOption === "alpha") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "shuffle") {
      return shuffleTools(sorted, shuffleSeed);
    }

    return sorted;
  }, [initialTools, selectedCategory, searchQuery, sortOption, shuffleSeed]);

  const activeCategoryDef = CATEGORY_DEFS.find((c) => c.key === selectedCategory) || CATEGORY_DEFS[0];
  const hasActiveFilters = selectedCategory !== "all" || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ── */}
      <section className="pt-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3 w-3" />
              <span>{totalCount}+ Verified Open-Source Tools</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Open-Source Tools Directory
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
              Explore lightweight, privacy-focused open source software and self-hostable alternatives to expensive SaaS products.
            </p>
          </div>
        </div>
      </section>

      {/* ── Search & Filter Controls ── */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, description, category, or SaaS alternative (e.g. Docker, Jira, Postgres)..."
            className="w-full rounded-xl border border-white/15 bg-white/5 py-3.5 pl-12 pr-10 text-sm text-white placeholder-white/40 transition-colors focus:border-cyan-400/60 focus:bg-white/[0.08] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
              <Filter className="h-3 w-3" />
              Category
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-cyan-300/80 transition hover:text-cyan-200 underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_DEFS.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const count = cat.key === "all" ? totalCount : categoryCounts?.[cat.label] ?? 0;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border border-cyan-400/50 bg-cyan-400/20 text-cyan-100 shadow-sm shadow-cyan-500/10"
                      : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? "bg-cyan-400/30 text-cyan-200 font-bold" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort & Status Bar */}
        <div className="flex flex-col gap-3 border-t border-white/5 pt-3 sm:flex-row sm:items-center sm:justify-between text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white font-semibold">{visibleTools.length}</strong> of {totalCount} tools
            </span>
            {selectedCategory !== "all" && (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-white/70">
                in {activeCategoryDef.label}
              </span>
            )}
            {searchQuery && (
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-cyan-200">
                &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-white/40">
              <ArrowUpDown className="h-3 w-3" />
              Sort:
            </span>
            {[
              { key: "stars", label: "⭐ Most Stars" },
              { key: "newest", label: "🕒 Newest" },
              { key: "alpha", label: "🔤 A-Z" },
              { key: "shuffle", label: "🎲 Shuffle" }
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  if (opt.key === "shuffle") {
                    setSortOption("shuffle");
                    setShuffleSeed(Date.now());
                  } else {
                    setSortOption(opt.key as SortOption);
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  sortOption === opt.key
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Grid ── */}
      {visibleTools.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool, idx) => (
            <ToolCard key={tool.id || tool.slug || idx} tool={tool} index={idx} />
          ))}
        </section>
      ) : (
        /* Empty State */
        <section className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-16 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40">
            <Frown className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-white">No tools found</h2>
          <p className="mt-2 max-w-md text-sm text-white/60">
            We couldn&apos;t find any open-source tools matching &ldquo;{searchQuery}&rdquo;{" "}
            {selectedCategory !== "all" ? `in ${activeCategoryDef.label}` : ""}.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear all filters
          </button>
        </section>
      )}

      {/* ── Discovery Banner ── */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/20 via-white/[0.02] to-blue-950/20 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Looking for a specific SaaS alternative?</h3>
            <p className="mt-1 text-sm text-white/60">
              Browse direct head-to-head comparisons or explore our full SaaS alternatives matrix.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/vs"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/30"
            >
              Compare Tools (VS) →
            </Link>
            <Link
              href="/alternatives"
              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Browse Alternatives →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
