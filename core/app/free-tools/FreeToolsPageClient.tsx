"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Frown } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

type SortOption = "all" | "shuffle" | "newest" | "oldest";

const CATEGORY_DEFS: { key: string; label: string; keywords?: string[] }[] = [
  { key: "all", label: "All" },
  { key: "developer-tools", label: "Developer Tools", keywords: ["tool", "dev", "developer", "cli", "sdk"] },
  { key: "self-hosting-infrastructure", label: "Self-Hosting & Infrastructure", keywords: ["self-host", "self host", "docker", "kubernetes", "infra", "infrastructure", "server"] },
  { key: "analytics-search", label: "Analytics & Search", keywords: ["analytics", "search", "monitor", "metrics", "log"] },
  { key: "media-utilities", label: "Media & Utilities", keywords: ["image", "media", "video", "audio", "converter", "compress"] },
  { key: "productivity", label: "Productivity", keywords: ["productivity", "todo", "notes", "workflow", "task"] },
  { key: "community-events", label: "Community & Events", keywords: ["community", "events", "chat", "forum", "meetup"] },
  { key: "business-tools", label: "Business Tools", keywords: ["business", "crm", "invoice", "billing", "saas"] },
  { key: "security", label: "Security", keywords: ["security", "auth", "oauth", "jwt", "vault", "scan"] },
  { key: "miscellaneous", label: "Miscellaneous", keywords: [] }
];

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;

  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffleTools<T>(items: T[], seed: number) {
  const shuffled = [...items];
  const random = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

function toolMatchesCategory(tool: ScrapedTool, catKey: string) {
  if (catKey === "all") return true;

  const def = CATEGORY_DEFS.find((category) => category.key === catKey);
  if (!def) return false;

  const haystack = `${tool.title} ${tool.description || ""} ${tool.category || ""} ${tool.source_site || ""}`.toLowerCase();

  if (!def.keywords || def.keywords.length === 0) return true;

  return def.keywords.some((keyword) => haystack.includes(keyword));
}

export default function FreeToolsPageClient({
  initialTools = [],
  initialCount = null,
  initialTotalPages: _initialTotalPages,
  initialPage: _initialPage,
  initialCategory: _initialCategory,
  categoryCounts: categoryCountsProp
}: {
  initialTools?: ScrapedTool[];
  initialCount?: number | null;
  initialTotalPages?: number;
  initialPage?: number;
  initialCategory?: ToolCategory;
  categoryCounts?: Record<string, number> | null;
}) {
  const [sortOption, setSortOption] = useState<SortOption>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [shuffleSeed, setShuffleSeed] = useState(Date.now());
  const [error, setError] = useState("");
  const tools = initialTools;
  const toolCount = initialCount ?? initialTools.length;

  // Precompute category counts from the initial tool set
  // Use server-provided counts where available. Keys are the user-facing labels.
  const categoryCounts = categoryCountsProp ?? null;

  const visibleTools = useMemo(() => {
    const filtered = tools.filter((t) => toolMatchesCategory(t, selectedCategory));
    const sorted = [...filtered];

    if (sortOption === "shuffle") {
      return shuffleTools(sorted, shuffleSeed);
    }

    if (sortOption === "newest") {
      sorted.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
      return sorted;
    }

    if (sortOption === "oldest") {
      sorted.sort((a, b) => new Date(a.scraped_at).getTime() - new Date(b.scraped_at).getTime());
      return sorted;
    }

    return sorted;
  }, [tools, sortOption, shuffleSeed, selectedCategory]);

  const handleOpenTool = (url: string) => {
    window.open(url, "_blank");
  };

  const handleShuffleClick = () => {
    setSortOption("shuffle");
    setShuffleSeed(Date.now());
  };

  return (
    <div className="space-y-10 pb-8">
      <section className="mb-10 pt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">No-Cost Resources</p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-4xl text-white">No-cost developer resources and open-source tools</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            {toolCount !== null ? toolCount : "..."} tools live
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-white/60">
          {toolCount !== null ? `${toolCount}+` : "153+"} curated open-source tools, self-hosted software, AI utilities, and developer components for builders.
          No account needed to browse.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            No-Cost Options
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            Open Source
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            Lightweight Tools
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Filter & sort</p>
        <h2 className="mt-2 text-xl text-white">Browse all approved resources</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Use the category pills to filter the directory, then sort the filtered results. Category and sort work together.
        </p>
        {/* Category filter row */}
        <div className="mt-4 flex flex-wrap gap-3">
          {CATEGORY_DEFS.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedCategory === cat.key
                  ? "bg-cyan-300 font-semibold text-slate-900"
                  : "border border-white/20 text-white/90"
              }`}
            >
              {cat.label} <span className="ml-2 text-white/60">({categoryCounts?.[cat.label] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* Sort row */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { key: "all", label: "All" },
            { key: "shuffle", label: "Shuffle" },
            { key: "newest", label: "Newest First" },
            { key: "oldest", label: "Oldest First" }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                if (option.key === "shuffle") {
                  handleShuffleClick();
                  return;
                }

                setSortOption(option.key as SortOption);
              }}
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

      {error ? (
        <section className="glass-panel rounded-3xl border border-rose-300/30 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleTools.map((tool, toolIdx) => (
          <ToolCard key={tool.id} tool={tool} index={toolIdx} onOpen={handleOpenTool} />
        ))}
      </section>

      {visibleTools.length === 0 ? (
        <section className="glass-panel flex flex-col items-center justify-center gap-3 rounded-3xl p-10 text-center">
          <Frown className="h-10 w-10 text-white/55" />
          <h3 className="font-display text-2xl text-white">No tools found</h3>
          <p className="max-w-lg text-sm text-white/60">No approved tools were returned from the database query.</p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">More discovery</p>
        <h3 className="mt-2 font-display text-xl text-white">Compare and discover more tools</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/best-free-developer-tools" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Developer Tool Comparisons
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Open Source Alternatives
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Developer Utilities
          </Link>
          <Link href="/best-crm-for-agencies" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Best CRM Tools
          </Link>
          <Link href="/best-project-management-for-startups" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Best PM Tools
          </Link>
        </div>
      </section>
    </div>
  );
}
