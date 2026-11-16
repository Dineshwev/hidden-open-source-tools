"use client";

import { useState } from "react";
import { Check, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

type MaintainerBadgeCardProps = {
  toolName: string;
  slug: string;
  siteUrl: string;
  replacesSaaS?: string | null;
};

export default function MaintainerBadgeCard({
  toolName,
  slug,
  siteUrl,
  replacesSaaS,
}: MaintainerBadgeCardProps) {
  const [format, setFormat] = useState<"markdown" | "html">("markdown");
  const [badgeType, setBadgeType] = useState<"verified" | "alternative">("verified");
  const [copied, setCopied] = useState(false);

  const cleanSite = siteUrl.replace(/\/$/, "");
  const toolUrl = `${cleanSite}/tools/${slug}`;

  // Badge query params
  const badgeUrl =
    badgeType === "alternative" && replacesSaaS
      ? `${cleanSite}/api/badge/${slug}?label=${encodeURIComponent("THE CLOUD RAIN")}&text=${encodeURIComponent(`Alternative to ${replacesSaaS}`)}`
      : `${cleanSite}/api/badge/${slug}`;

  const badgeAlt =
    badgeType === "alternative" && replacesSaaS
      ? `${toolName} - Open Source Alternative to ${replacesSaaS}`
      : `${toolName} on The Cloud Rain - Verified Open Source`;

  const markdownCode = `[![${badgeAlt}](${badgeUrl})](${toolUrl})`;
  const htmlCode = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="${badgeAlt}" /></a>`;

  const activeCode = format === "markdown" ? markdownCode : htmlCode;

  const handleCopy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="maintainer-badge" className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80 font-semibold">
              For Project Maintainers
            </p>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-white">
            Embed Verified Badge in GitHub README
          </h2>
          <p className="mt-1 text-xs text-white/50 max-w-xl">
            Signal to developers that {toolName} is actively verified on The Cloud Rain. Boost credibility and showcase commercial SaaS replacement.
          </p>
        </div>

        {/* Live Badge Preview */}
        <div className="shrink-0 flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={badgeUrl}
            src={badgeUrl}
            alt={badgeAlt}
            className="h-7 w-auto drop-shadow-sm"
          />
        </div>
      </div>

      {/* Badge Type Selector (if replaces SaaS) */}
      {replacesSaaS && (
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 text-xs">
          <span className="text-white/40 mr-1 text-[11px] uppercase tracking-wider font-semibold">
            Choose Badge Text:
          </span>
          <button
            type="button"
            onClick={() => setBadgeType("verified")}
            className={`rounded-xl border px-3 py-1.5 font-medium transition ${
              badgeType === "verified"
                ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-200 shadow-sm shadow-cyan-500/20"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            ★ Verified OSS
          </button>
          <button
            type="button"
            onClick={() => setBadgeType("alternative")}
            className={`rounded-xl border px-3 py-1.5 font-medium transition flex items-center gap-1.5 ${
              badgeType === "alternative"
                ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-200 shadow-sm shadow-emerald-500/20"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Alternative to {replacesSaaS}</span>
          </button>
        </div>
      )}

      {/* Snippet Card */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFormat("markdown")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                format === "markdown"
                  ? "bg-white/15 text-cyan-200"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Markdown (README.md)
            </button>
            <button
              type="button"
              onClick={() => setFormat("html")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                format === "html"
                  ? "bg-white/15 text-cyan-200"
                  : "text-white/50 hover:text-white"
              }`}
            >
              HTML
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition ${
              copied
                ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
            }`}
            title="Copy snippet to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">Copied snippet!</span>
              </>
            ) : (
              <span>Copy Snippet</span>
            )}
          </button>
        </div>

        {/* Code display */}
        <pre className="overflow-x-auto font-mono text-xs text-white/70 whitespace-pre-wrap break-all select-all py-1">
          {activeCode}
        </pre>
      </div>
    </section>
  );
}
