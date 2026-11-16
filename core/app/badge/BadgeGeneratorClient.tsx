"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, ExternalLink, ShieldCheck, ArrowRight, Star, Sparkles } from "lucide-react";

type SimpleTool = {
  name: string;
  slug: string;
  category: string;
  stars?: number | null;
};

interface BadgeGeneratorClientProps {
  tools: SimpleTool[];
  siteUrl: string;
}

export default function BadgeGeneratorClient({
  tools,
  siteUrl,
}: BadgeGeneratorClientProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    tools[0]?.slug || "supabase"
  );
  const [search, setSearch] = useState("");
  const [copiedFormat, setCopiedFormat] = useState<"markdown" | "html" | null>(
    null
  );

  const cleanSite = siteUrl.replace(/\/$/, "");

  const activeTool = useMemo(() => {
    return (
      tools.find((t) => t.slug === selectedSlug) || {
        name: selectedSlug,
        slug: selectedSlug,
        category: "Open Source Tool",
      }
    );
  }, [tools, selectedSlug]);

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools.slice(0, 40);
    const q = search.toLowerCase();
    return tools
      .filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q))
      .slice(0, 40);
  }, [tools, search]);

  const badgeUrl = `${cleanSite}/api/badge/${activeTool.slug}`;
  const toolUrl = `${cleanSite}/tools/${activeTool.slug}`;

  const markdownSnippet = `[![Listed on The Cloud Rain](${badgeUrl})](${toolUrl})`;
  const htmlSnippet = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="${activeTool.name} on The Cloud Rain" />\n</a>`;

  const handleCopy = async (format: "markdown" | "html") => {
    const text = format === "markdown" ? markdownSnippet : htmlSnippet;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2500);
    }
  };

  return (
    <div className="space-y-12">
      {/* ── Live Badge Preview & Code Embed Box ── */}
      <section className="rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-cyan-950/40 via-cyan-900/10 to-white/[0.02] p-6 sm:p-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Live Badge Preview
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white">
              {activeTool.name}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Verified Open-Source Recognition Badge
            </p>
          </div>

          {/* Rendered Live SVG Badge */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="rounded-xl border border-white/15 bg-black/60 p-3 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/badge/${activeTool.slug}`}
                alt={`${activeTool.name} badge`}
                className="h-8"
              />
            </div>
            <span className="text-[11px] text-white/40">
              Real-time SVG rendered directly by our edge API
            </span>
          </div>
        </div>

        {/* ── Snippets Grid: Markdown & HTML ── */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Markdown Snippet */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  GitHub README.md (Markdown)
                </span>
                <span className="text-[10px] text-white/40">Recommended</span>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-white/80 select-all">
                <code>{markdownSnippet}</code>
              </pre>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("markdown")}
              className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition ${
                copiedFormat === "markdown"
                  ? "border border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
                  : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              }`}
            >
              {copiedFormat === "markdown" ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied Markdown to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Markdown Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* HTML Snippet */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Website / Docs (HTML)
                </span>
                <span className="text-[10px] text-white/40">Docusaurus / Next.js / Docs</span>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-white/80 select-all">
                <code>{htmlSnippet}</code>
              </pre>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("html")}
              className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition ${
                copiedFormat === "html"
                  ? "border border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
                  : "border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              {copiedFormat === "html" ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied HTML to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy HTML Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Tool Selector ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              Select or Search Any Tool
            </h3>
            <p className="text-xs text-white/50">
              Pick your project from the 470+ verified tools in our directory to generate its custom badge.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by tool name or slug..."
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-cyan-400/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredTools.map((t) => {
            const isSelected = selectedSlug === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSelectedSlug(t.slug)}
                className={`flex flex-col items-start justify-between rounded-xl p-3 text-left transition-all ${
                  isSelected
                    ? "border border-cyan-400 bg-cyan-400/15 text-white shadow-md shadow-cyan-500/10"
                    : "border border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="font-semibold text-xs truncate w-full">{t.name}</span>
                <span className="text-[10px] text-white/40 truncate w-full mt-1">
                  {t.slug}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Why Embed the Badge? (Benefits for Maintainers) ── */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="mt-3 font-display text-base font-semibold text-white">
            Verified License & Self-Hosting Stamp
          </h4>
          <p className="mt-1 text-xs text-white/60 leading-relaxed">
            Signals to developers, homelabbers, and teams that your repository has been audited for open-source license integrity and self-hosted support.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <ExternalLink className="h-5 w-5" />
          </div>
          <h4 className="mt-3 font-display text-base font-semibold text-white">
            Direct Referral Discovery
          </h4>
          <p className="mt-1 text-xs text-white/60 leading-relaxed">
            Links developers directly to your dedicated deep-dive profile on The Cloud Rain, including Docker Compose stacks and SaaS comparison verdicts.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="mt-3 font-display text-base font-semibold text-white">
            Lightweight & Fast
          </h4>
          <p className="mt-1 text-xs text-white/60 leading-relaxed">
            Zero external JavaScript or tracking. Pure SVG rendered instantly at edge nodes with HTTP caching so your README loads blisteringly fast.
          </p>
        </div>
      </section>
    </div>
  );
}
