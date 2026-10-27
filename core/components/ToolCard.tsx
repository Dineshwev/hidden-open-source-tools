"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink, ArrowRight } from "lucide-react";
import type { ScrapedTool } from "@/lib/types/scraped-tools.types";

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface ToolCardProps {
  readonly tool: ScrapedTool;
  readonly index?: number;
  readonly onOpen?: (url: string) => void;
}

function formatStars(stars: number | null | undefined): string {
  if (!stars || stars <= 0) return "";
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const ToolCard = React.memo(({ tool, onOpen }: ToolCardProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = getDomain(tool.webpage_url || "");
  const firstLetter = (tool.title || "?")[0]?.toUpperCase() || "?";
  const displayCategory = tool.raw_category || (tool.category === "other" ? "Developer Tool" : tool.category);
  const starsLabel = formatStars(tool.github_stars);
  const targetSlug = tool.slug || tool.id;

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpen) {
      onOpen(tool.webpage_url);
    } else {
      window.open(tool.webpage_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-500/5">
      <div>
        {/* Top Header: Logo, Name, Category & Stars (Opens in new tab) */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/tools/${targetSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors group-hover:border-cyan-400/30">
              {!imgFailed && domain ? (
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                  alt={tool.title}
                  width={36}
                  height={36}
                  unoptimized={true}
                  onError={() => setImgFailed(true)}
                  className="h-full w-full rounded-lg object-contain"
                />
              ) : (
                <span className="text-base font-bold text-white group-hover:text-cyan-300">
                  {firstLetter}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-base font-semibold text-white transition-colors group-hover:text-cyan-300">
                {tool.title}
              </h3>
              <p className="truncate text-xs font-medium text-cyan-300/80 uppercase tracking-wider">
                {displayCategory}
              </p>
            </div>
          </Link>

          {starsLabel && (
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">
              <Star className="h-3 w-3 fill-amber-300/40 text-amber-300" />
              <span>{starsLabel}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p
          className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-white/60"
          title={tool.description || ""}
        >
          {stripMarkdown(tool.description ?? "") || "Curated open-source tool for modern workflows."}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/45">
        <span className="truncate max-w-[140px] text-white/40">{domain || "open-source"}</span>

        <div className="flex items-center gap-2">
          {tool.webpage_url && (
            <button
              type="button"
              onClick={handleExternalClick}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              title={`Visit ${tool.title} website`}
            >
              <span>Visit</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}

          {/* Details Link (Opens in new tab) */}
          <Link
            href={`/tools/${targetSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20 hover:text-cyan-100"
          >
            <span>Details</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
});

ToolCard.displayName = "ToolCard";

export default ToolCard;
