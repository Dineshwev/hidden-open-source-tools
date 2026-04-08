"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
import { Frown } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import SponsorModal from "@/components/SponsorModal";
import ToolCard from "@/components/ToolCard";
import type { PaginatedResponse, ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

type ToolsApiResponse = PaginatedResponse<ScrapedTool>;

type CategoryTab = {
  key: "all" | "ui-kits" | "courses" | "templates" | "ai-tools" | "components";
  label: string;
  queryValue?: ToolCategory;
};

const LIMIT = 12;
const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23161616'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='700' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a7a7a7' font-family='Arial,sans-serif' font-size='34'%3ENo preview available%3C/text%3E%3C/svg%3E";

const categoryTabs: CategoryTab[] = [
  { key: "all", label: "All" },
  { key: "ui-kits", label: "🎨 UI Kits", queryValue: "ui-kit" },
  { key: "courses", label: "📚 Courses", queryValue: "course" },
  { key: "templates", label: "🖼️ Templates", queryValue: "template" },
  { key: "ai-tools", label: "🤖 AI Tools", queryValue: "ai-tool" },
  { key: "components", label: "🧩 Components", queryValue: "ui-component" }
];

export default function FreeToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab["key"]>("all");
  const [tools, setTools] = useState<ScrapedTool[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");

  const activeCategory = useMemo(
    () => categoryTabs.find((tab) => tab.key === selectedCategory) || categoryTabs[0],
    [selectedCategory]
  );

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
            limit: LIMIT,
            ...(activeCategory.queryValue ? { category: activeCategory.queryValue } : {})
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
    [activeCategory.queryValue]
  );

  useEffect(() => {
    setTools([]);
    setPage(1);
    setTotalPages(1);
    void fetchTools(1, true);
  }, [fetchTools, selectedCategory]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    await fetchTools(page + 1, false);
  };

  const renderSkeletons = loading && tools.length === 0;

  const handleOpenTool = (url: string) => {
    setTargetUrl(url);
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-8">
      <SectionHeading
        eyebrow="Explore"
        title="Free Developer Resources"
        description="Curated free tools, UI kits, courses & templates for developers"
      />

      <section className="glass-panel rounded-3xl p-4 md:p-5">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategory(tab.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${selectedCategory === tab.key
                ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
            >
              {tab.label}
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
        {renderSkeletons
          ? Array.from({ length: 6 }).map((_, skeletonIdx) => (
            <div key={`skeleton-${skeletonIdx}`} className="glass-card animate-pulse rounded-3xl border border-white/10 p-4">
              <div className="h-44 rounded-2xl bg-white/10" />
              <div className="mt-4 h-4 w-2/3 rounded bg-white/10" />
              <div className="mt-3 h-3 w-full rounded bg-white/10" />
              <div className="mt-2 h-3 w-11/12 rounded bg-white/10" />
              <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
              <div className="mt-5 h-10 w-40 rounded-full bg-white/10" />
            </div>
          ))
          : tools.map((tool, toolIdx) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={toolIdx}
              onOpen={handleOpenTool}
            />
          ))}
      </section>

      <SponsorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetUrl={targetUrl}
      />

      {!loading && tools.length === 0 ? (
        <section className="glass-panel flex flex-col items-center justify-center gap-3 rounded-3xl p-10 text-center">
          <Frown className="h-10 w-10 text-white/55" />
          <h3 className="font-display text-2xl text-white">No tools found</h3>
          <p className="max-w-lg text-sm text-white/60">Try another category to discover more free resources.</p>
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
    </div>
  );
}