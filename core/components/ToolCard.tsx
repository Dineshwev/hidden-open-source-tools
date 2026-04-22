"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ScrapedTool } from "@/lib/types/scraped-tools.types";

interface ToolCardProps {
  readonly tool: ScrapedTool;
  readonly index: number;
  readonly onOpen: (url: string) => void;
}

function ToolCardImage({ url, name }: { url: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  const domain = getDomain(url || "");
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const firstLetter = (name || "?")[0].toUpperCase();

  if (imgError || !domain) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-2xl font-bold text-white">
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt={name}
      width={64}
      height={64}
      className="h-16 w-16 rounded-xl bg-white/10 object-contain p-2"
      onError={() => setImgError(true)}
    />
  );
}

const ToolCard = React.memo(({ tool, index, onOpen }: ToolCardProps) => {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  return (
    <motion.article
      className="glass-panel rounded-[1.5rem] p-5 transition-all hover:border-white/20"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <ToolCardImage 
          url={tool.webpage_url || ""} 
          name={tool.title || ""} 
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">
          {tool.category}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <Link href={`/free-tools/${tool.id}`} className="block">
          <h3 className="font-display text-xl text-white hover:text-cyan-400 transition-colors cursor-pointer">{tool.title}</h3>
        </Link>
        <p
          className="text-sm leading-6 text-white/65 line-clamp-3"
          title={tool.description || ""}
        >
          {tool.description?.trim() || "No description available yet."}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">
          {tool.source_site || getDomain(tool.webpage_url) || "external"}
        </p>
        <a
          href={tool.webpage_url}
          target="_blank"
          rel="noopener noreferrer"
          className="sr-only"
        >
          Open {tool.title}
        </a>
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
