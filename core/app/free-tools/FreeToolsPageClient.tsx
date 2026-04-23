"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { Frown } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import type { PaginatedResponse, ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";
import {
  FREE_TOOLS_CATEGORY_PAGES,
  FREE_TOOLS_PAGE_SIZE,
  buildFreeToolsRoute,
  getCategoryPageByCategory
} from "./free-tools-data";

type ToolsApiResponse = PaginatedResponse<ScrapedTool>;

type CategoryTab = {
  key: "all" | "ui-kits" | "courses" | "templates" | "ai-tools" | "components" | "other";
  label: string;
  queryValue?: ToolCategory;
};

type SortOption = "newest" | "az" | "random";

const categoryTabs: CategoryTab[] = [
  { key: "all", label: "All" },
  { key: "ui-kits", label: "UI Kits", queryValue: "ui-kit" },
  { key: "courses", label: "Courses", queryValue: "course" },
  { key: "templates", label: "Templates", queryValue: "template" },
  { key: "ai-tools", label: "AI Tools", queryValue: "ai-tool" },
  { key: "components", label: "Components", queryValue: "ui-component" },
  { key: "other", label: "Other", queryValue: "other" }
];

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [];

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export default function FreeToolsPageClient({
  initialTools = [],
  initialCount = null,
  initialTotalPages = 1,
  initialPage = 1,
  initialCategory
}: {
  initialTools?: ScrapedTool[];
  initialCount?: number | null;
  initialTotalPages?: number;
  initialPage?: number;
  initialCategory?: ToolCategory;
}) {
  const [selectedCategories, setSelectedCategories] = useState<ToolCategory[]>(initialCategory ? [initialCategory] : []);
  const [tools, setTools] = useState<ScrapedTool[]>(initialTools);
  const [toolCount, setToolCount] = useState<number | null>(initialCount);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages > 0 ? initialTotalPages : 1);
  const [loading, setLoading] = useState(initialTools.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [randomSeed, setRandomSeed] = useState(0);
  const hasSkippedInitialFetch = useRef(false);

  const serverCategory = useMemo(() => {
    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }

    return undefined;
  }, [selectedCategories]);

  const activeCategoryPage = getCategoryPageByCategory(serverCategory || null);
  const paginationItems = getPaginationItems(page, totalPages);

  const visibleTools = useMemo(() => {
    const categoryFiltered = selectedCategories.length
      ? tools.filter((tool) => selectedCategories.includes(tool.category))
      : tools;

    const sorted = [...categoryFiltered];

    if (sortOption === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      return sorted;
    }

    if (sortOption === "random") {
      for (let i = sorted.length - 1; i > 0; i -= 1) {
        const j = (i * (randomSeed + 17)) % (i + 1);
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }

      return sorted;
    }

    sorted.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
    return sorted;
  }, [tools, selectedCategories, sortOption, randomSeed]);

  const hasMore = page < totalPages;

  const fetchTools = useCallback(
    async (targetPage: number, replace = false) => {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError("");

      try {
        const response = await axios.get<ToolsApiResponse>("/api/files/scraped-tools", {
          params: {
            page: targetPage,
            limit: FREE_TOOLS_PAGE_SIZE,
            ...(serverCategory ? { category: serverCategory } : {})
          }
        });

        const payload = response.data;
        const incoming = Array.isArray(payload.data) ? payload.data : [];

        setTools((previous) => (replace ? incoming : [...previous, ...incoming]));
        setTotalPages(payload.totalPages > 0 ? payload.totalPages : 1);
        setPage(payload.currentPage || targetPage);
      } catch (err: unknown) {
        const maybeError = err as { response?: { data?: { error?: string } } };
        setError(maybeError?.response?.data?.error || "Unable to load free tools right now.");

        if (replace) {
          setTools([]);
          setTotalPages(1);
          setPage(1);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [serverCategory]
  );

  useEffect(() => {
    if (!hasSkippedInitialFetch.current) {
      hasSkippedInitialFetch.current = true;
      return;
    }

    setTools([]);
    setPage(1);
    setTotalPages(1);
    void fetchTools(1, true);
  }, [fetchTools, selectedCategories]);

  useEffect(() => {
    if (initialCount !== null) {
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/files/scraped-tools?page=1&limit=1");
        const data = await res.json();

        if (typeof data?.count === "number") {
          setToolCount(data.count);
        }
      } catch {
        // Keep null and show fallback text.
      }
    };

    void fetchCount();
  }, [initialCount]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    await fetchTools(page + 1, false);
  };

  const renderSkeletons = loading && tools.length === 0;

  const handleOpenTool = (url: string) => {
    window.open(url, "_blank");
  };

  const toggleCategory = (tab: CategoryTab) => {
    if (!tab.queryValue) {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((previous) =>
      previous.includes(tab.queryValue as ToolCategory)
        ? previous.filter((value) => value !== tab.queryValue)
        : [...previous, tab.queryValue as ToolCategory]
    );
  };

  const shuffleTools = () => {
    setSortOption("random");
    setRandomSeed(Date.now());
  };

  const surpriseMe = () => {
    if (!visibleTools.length) {
      return;
    }

    const pick = visibleTools[Math.floor(Math.random() * visibleTools.length)];
    handleOpenTool(pick.webpage_url);
  };

  return (
    <div className="space-y-10 pb-8">
      <section className="mb-10 pt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Open Source Directory</p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-4xl text-white">Free Developer Resources</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            {toolCount !== null ? toolCount : "..."} tools live
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-white/60">
          {toolCount !== null ? `${toolCount}+` : "153+"} curated free tools, UI kits, courses, templates, AI tools, and components for developers.
          All completely free. No account needed to browse.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            100% Free Forever
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            Open Source
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            No Login Required
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Crawlable categories</p>
        <h2 className="mt-2 text-xl text-white">Browse by category</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          These category pages create stable directory routes for search engines and visitors who want to browse a narrower slice of the library.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={buildFreeToolsRoute(null, 1)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              !activeCategoryPage ? "bg-cyan-300 font-semibold text-slate-900" : "border border-white/20 text-white/90"
            }`}
          >
            All Resources
          </Link>
          {FREE_TOOLS_CATEGORY_PAGES.map((entry) => (
            <Link
              key={entry.slug}
              href={buildFreeToolsRoute(entry.slug, 1)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeCategoryPage?.slug === entry.slug
                  ? "bg-cyan-300 font-semibold text-slate-900"
                  : "border border-white/20 text-white/90"
              }`}
            >
              {entry.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-4 md:p-5">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => toggleCategory(tab)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                tab.key === "all"
                  ? selectedCategories.length === 0
                    ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                    : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  : selectedCategories.includes(tab.queryValue as ToolCategory)
                    ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                    : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={sortOption}
            onChange={(event) => {
              const nextSort = event.target.value as SortOption;
              setSortOption(nextSort);
              if (nextSort === "random") {
                setRandomSeed(Date.now());
              }
            }}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="az">Sort: A-Z</option>
            <option value="random">Sort: Random</option>
          </select>

          <button
            type="button"
            onClick={shuffleTools}
            disabled={loading || visibleTools.length < 2}
            className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Shuffle
          </button>
          <button
            type="button"
            onClick={surpriseMe}
            disabled={loading || visibleTools.length === 0}
            className="rounded-full border border-fuchsia-300/35 bg-fuchsia-300/10 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-300/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Surprise Me
          </button>
          <p className="self-center text-xs text-white/55">Tip: use category routes for browsing and the filters for quick on-page exploration.</p>
        </div>
      </section>

      {error ? (
        <section className="glass-panel rounded-3xl border border-rose-300/30 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {renderSkeletons
          ? Array.from({ length: FREE_TOOLS_PAGE_SIZE }).map((_, skeletonIdx) => (
              <div key={`skeleton-${skeletonIdx}`} className="glass-card animate-pulse rounded-3xl border border-white/10 p-4">
                <div className="h-44 rounded-2xl bg-white/10" />
                <div className="mt-4 h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-3 h-3 w-full rounded bg-white/10" />
                <div className="mt-2 h-3 w-11/12 rounded bg-white/10" />
                <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
                <div className="mt-5 h-10 w-40 rounded-full bg-white/10" />
              </div>
            ))
          : visibleTools.map((tool, toolIdx) => (
              <ToolCard key={tool.id} tool={tool} index={toolIdx} onOpen={handleOpenTool} />
            ))}
      </section>

      {!loading && visibleTools.length === 0 ? (
        <section className="glass-panel flex flex-col items-center justify-center gap-3 rounded-3xl p-10 text-center">
          <Frown className="h-10 w-10 text-white/55" />
          <h3 className="font-display text-2xl text-white">No tools found</h3>
          <p className="max-w-lg text-sm text-white/60">Try another category to discover more free resources.</p>
        </section>
      ) : null}

      {totalPages > 1 ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-white/45">Crawlable pagination</p>
          <h3 className="mt-2 font-display text-xl text-white">Directory pages</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {page > 1 ? (
              <Link href={buildFreeToolsRoute(activeCategoryPage?.slug || null, page - 1)} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
                Previous Page
              </Link>
            ) : null}
            {paginationItems.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={buildFreeToolsRoute(activeCategoryPage?.slug || null, pageNumber)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  pageNumber === page ? "bg-cyan-300 font-semibold text-slate-900" : "border border-white/20 text-white/90"
                }`}
              >
                Page {pageNumber}
              </Link>
            ))}
            {page < totalPages ? (
              <Link href={buildFreeToolsRoute(activeCategoryPage?.slug || null, page + 1)} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
                Next Page
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {tools.length > 0 ? (
        <section className="flex justify-center">
          <button
            type="button"
            onClick={() => void handleLoadMore()}
            disabled={!hasMore || loadingMore}
            className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingMore ? "Loading..." : hasMore ? "Load More" : "No More Tools"}
          </button>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">More discovery</p>
        <h3 className="mt-2 font-display text-xl text-white">Compare and discover more tools</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/best-free-developer-tools" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Best Free Developer Tools
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Open Source Software
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Hidden Tools
          </Link>
        </div>
      </section>
    </div>
  );
}
