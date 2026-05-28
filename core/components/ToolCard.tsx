"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ScrapedTool } from "@/lib/types/scraped-tools.types";

interface ToolCardProps {
  readonly tool: ScrapedTool;
  readonly index: number;
  readonly onOpen: (url: string) => void;
}

function ToolCardImage({ url, name }: { url: string; name: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  const domain = getDomain(url || "");
  const firstLetter = (name || "?")[0]?.toUpperCase() || "?";

  return (
    <>
      {!imgFailed ? (
        <Image
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={name}
          width={48}
          height={48}
          unoptimized={true}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            setImgFailed(true);
          }}
          className="h-12 w-12 rounded-xl bg-white/10 object-contain p-2"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-sm font-bold text-white">
          {firstLetter}
        </div>
      )}
    </>
  );
}

const ToolCard = React.memo(({ tool, onOpen }: ToolCardProps) => {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  return (
    <article className="glass-panel rounded-[1.5rem] p-5 transition-all hover:border-white/20">
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
          <h3 className="cursor-pointer font-display text-xl text-white transition-colors hover:text-cyan-400">
            {tool.title}
          </h3>
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-white/65" title={tool.description || ""}>
          {tool.description?.trim() || "No description available yet."}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">
          {tool.source_site || getDomain(tool.webpage_url) || "external"}
        </p>
        <a href={tool.webpage_url} target="_blank" rel="noopener noreferrer" className="sr-only">
          Open {tool.title}
        </a>
        <button
          type="button"
          onClick={() => onOpen(tool.webpage_url)}
          className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
        >
          Visit Resource →
        </button>
        {tool.slug && (
          <a
            href={`/tools/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
          >
            View Details
          </a>
        )}
      </div>
    </article>
  );
});

ToolCard.displayName = "ToolCard";

export default ToolCard;
