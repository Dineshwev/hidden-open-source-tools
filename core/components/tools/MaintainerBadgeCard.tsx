"use client";

import { useState } from "react";
import { Copy, Check, Code } from "lucide-react";

type MaintainerBadgeCardProps = {
  toolName: string;
  slug: string;
  siteUrl: string;
};

export default function MaintainerBadgeCard({
  toolName,
  slug,
  siteUrl,
}: MaintainerBadgeCardProps) {
  const [tab, setTab] = useState<"markdown" | "html">("markdown");
  const [copied, setCopied] = useState(false);

  const cleanSite = siteUrl.replace(/\/$/, "");
  const badgeUrl = `${cleanSite}/api/badge/${slug}`;
  const toolUrl = `${cleanSite}/tools/${slug}`;

  const markdownCode = `[![Listed on The Cloud Rain](${badgeUrl})](${toolUrl})`;
  const htmlCode = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="${toolName} on The Cloud Rain" /></a>`;

  const activeCode = tab === "markdown" ? markdownCode : htmlCode;

  const handleCopy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">For Project Maintainers</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">Embed Badge in GitHub README</h2>
          <p className="mt-1 text-xs text-white/50">
            Showcase verified open-source recognition on your project repository and documentation.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/badge/${slug}`}
            alt={`${toolName} badge`}
            className="h-6"
          />
        </div>
      </div>

      {/* Snippet Card */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTab("markdown")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                tab === "markdown"
                  ? "bg-white/15 text-cyan-200"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setTab("html")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                tab === "html"
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
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              copied
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
            }`}
            title="Copy snippet to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-white/60" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <pre className="overflow-x-auto font-mono text-xs text-cyan-200 select-all p-1">
          <code>{activeCode}</code>
        </pre>
      </div>
    </section>
  );
}
