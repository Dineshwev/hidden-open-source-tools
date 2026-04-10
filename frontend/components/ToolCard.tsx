"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ScrapedTool } from "@/lib/types/scraped-tools.types";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23161616'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='700' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a7a7a7' font-family='Arial,sans-serif' font-size='34'%3ENo preview available%3C/text%3E%3C/svg%3E";

interface ToolCardProps {
  readonly tool: ScrapedTool;
  readonly index: number;
  readonly onOpen: (url: string) => void;
}

const ToolCard = React.memo(({ tool, index, onOpen }: ToolCardProps) => {
  const [imageIndex, setImageIndex] = React.useState(0);

  const toDomainLabel = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "external";
    }
  };

  const domainFromUrl = React.useMemo(() => {
    try {
      return new URL(tool.webpage_url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }, [tool.webpage_url]);

  const imageCandidates = React.useMemo(() => {
    const sources: string[] = [];

    if (tool.image_url) {
      sources.push(tool.image_url);
    }

    if (tool.logo_url) {
      sources.push(tool.logo_url);
    }

    if (tool.id.startsWith("ost__") && domainFromUrl) {
      sources.push(`https://www.google.com/s2/favicons?domain=${domainFromUrl}&sz=128`);
    }

    return Array.from(new Set(sources.filter(Boolean)));
  }, [tool.id, tool.image_url, tool.logo_url, domainFromUrl]);

  React.useEffect(() => {
    setImageIndex(0);
  }, [tool.id]);

  const imageSrc = imageCandidates[imageIndex] || null;
  const initial = (tool.title?.trim().charAt(0) || "?").toUpperCase();

  return (
    <motion.article
      className="glass-card rounded-3xl border border-white/10 p-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={tool.title}
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 rounded-2xl object-cover"
            onError={() => setImageIndex((previous) => previous + 1)}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
            {initial}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">
          {tool.category}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <h3 className="font-display text-xl text-white">{tool.title}</h3>
        <p
          className="text-sm leading-6 text-white/65 line-clamp-3"
          title={tool.description || ""}
        >
          {tool.description?.trim() || "No description available yet."}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">
          {tool.source_site || toDomainLabel(tool.webpage_url)}
        </p>
        <button
          type="button"
          onClick={() => onOpen(tool.webpage_url)}
          className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
        >
          Visit Resource →
        </button>
      </div>
    </motion.article>
  );
});

ToolCard.displayName = "ToolCard";

export default ToolCard;
