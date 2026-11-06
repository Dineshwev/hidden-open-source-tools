"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Server, Sparkles, ArrowRight, ChevronDown, Check, Copy } from "lucide-react";
import { CategoryMeta } from "@/lib/categories";
import DockerStackModal from "@/components/tools/DockerStackModal";

type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  logo_url: string | null;
  github_stars: number | null;
};

interface CategoryPageClientProps {
  category: CategoryMeta;
  tools: Tool[];
  allCategories: { slug: string; label: string; icon: string }[];
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ToolCard({ tool }: { tool: Tool }) {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const faviconUrl = !imgFailed && domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-500/5"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors group-hover:border-cyan-400/30">
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl}
                  alt={tool.name}
                  onError={() => setImgFailed(true)}
                  className="h-full w-full rounded-lg object-contain"
                />
              ) : (
                <span className="text-base font-bold text-white group-hover:text-cyan-300">
                  {tool.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-white group-hover:text-cyan-200 transition-colors truncate">
                {tool.name}
              </h3>
              <p className="text-xs text-white/40 truncate">{tool.category || "Open Source"}</p>
            </div>
          </div>
        </div>

        <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-white/60">
          {stripMarkdown(tool.description ?? "") || "Curated open-source tool for modern workflows."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/40">
        <span className="truncate max-w-[140px]">{domain || "open-source"}</span>
        <span className="inline-flex items-center gap-1 text-cyan-300 group-hover:translate-x-0.5 transition-transform">
          Details <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default function CategoryPageClient({
  category,
  tools,
  allCategories,
}: CategoryPageClientProps) {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isStackModalOpen, setIsStackModalOpen] = useState(false);

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.url || "").toLowerCase().includes(q)
    );
  }, [tools, search]);

  const stackTools = useMemo(() => {
    return tools.slice(0, 6).map((t) => ({
      name: t.name,
      slug: t.slug,
      category: t.category,
      url: t.url,
    }));
  }, [tools]);

  return (
    <div className="space-y-12">
      {/* Category Navigation Bar */}
      <section className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-5">
        {allCategories.map((cat) => {
          const isActive = cat.slug === category.slug;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border border-cyan-400/50 bg-cyan-400/20 text-cyan-100 shadow-sm shadow-cyan-500/10 font-semibold"
                  : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </section>

      {/* Hero Header */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 font-semibold text-cyan-300">
            {category.icon} {category.label}
          </span>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-white/60">
            {tools.length} Curated Tools
          </span>
          <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-emerald-300">
            ✓ 100% Open Source
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Best Open-Source {category.label}
        </h1>

        <p className="text-base sm:text-lg text-white/65 max-w-3xl leading-relaxed">
          {category.description}
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filter ${tools.length} ${category.label.toLowerCase()}...`}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-cyan-400/60 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsStackModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-4 py-2.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/25 active:scale-95 shrink-0"
          >
            <Server className="h-4 w-4 text-cyan-300" />
            <span>Generate Category Docker Stack</span>
          </button>
        </div>
      </section>

      {/* Tools Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between text-xs text-white/50">
          <span>
            Showing <strong className="text-white font-medium">{filteredTools.length}</strong> of {tools.length} tools
          </span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-cyan-300 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <p className="text-base font-semibold text-white">No tools matched your search</p>
            <p className="mt-1 text-sm text-white/50">Try broadening your search term or view all tools in this category.</p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Reset Search
            </button>
          </div>
        )}
      </section>

      {/* Category FAQ Section */}
      {category.faqs && category.faqs.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80 font-semibold">Frequently Asked Questions</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              About Open-Source {category.label}
            </h2>
          </div>

          <div className="divide-y divide-white/5">
            {category.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left font-display text-base font-medium text-white transition hover:text-cyan-200"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-cyan-300" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-white/60 animate-in fade-in duration-150">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cross-linking to Comparisons & Alternatives */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-950/20 via-white/[0.02] to-purple-950/20 p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Evaluating alternatives for proprietary software?
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Check our head-to-head technical comparisons or explore direct replacements for Notion, Jira, Firebase, and more.
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
              SaaS Alternatives Matrix →
            </Link>
          </div>
        </div>
      </section>

      {/* Docker Stack Modal */}
      <DockerStackModal
        isOpen={isStackModalOpen}
        onClose={() => setIsStackModalOpen(false)}
        tools={stackTools}
      />
    </div>
  );
}
