"use client";

import { useEffect, useState } from "react";
import { Bookmark, Share2, Check } from "lucide-react";
import { isToolSaved, toggleSaveTool } from "@/lib/saved-tools";

type ToolDetailActionsProps = {
  toolName: string;
  slug: string;
  canonicalUrl?: string;
};

export default function ToolDetailActions({
  toolName,
  slug,
  canonicalUrl,
}: ToolDetailActionsProps) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(isToolSaved(slug));

    const handleSavedChange = () => {
      setSaved(isToolSaved(slug));
    };

    window.addEventListener("cloudrain:saved-change", handleSavedChange);
    return () => window.removeEventListener("cloudrain:saved-change", handleSavedChange);
  }, [slug]);

  const handleToggleSave = () => {
    const next = toggleSaveTool(slug);
    setSaved(next);
  };

  const handleShare = async () => {
    const shareUrl =
      canonicalUrl ||
      (typeof window !== "undefined"
        ? window.location.href
        : `https://thecloudrain.org/tools/${slug}`);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${toolName} – Open Source Tool | The Cloud Rain`,
          text: `Check out ${toolName} on The Cloud Rain:`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        // User aborted share or not supported; fall back to clipboard
        if (err?.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save to Stack Bookmark */}
      <button
        type="button"
        onClick={handleToggleSave}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
          saved
            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200 shadow-sm shadow-cyan-500/10"
            : "border-white/20 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
        }`}
        title={saved ? "Remove from your saved stack" : "Save to your personal stack"}
        aria-pressed={saved}
      >
        <Bookmark
          className={`h-4 w-4 ${saved ? "fill-cyan-300 text-cyan-300" : "text-white/60"}`}
        />
        <span className="hidden sm:inline">{saved ? "Saved in Stack" : "Save to Stack"}</span>
      </button>

      {/* Share / Copy Link */}
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
          copied
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-white/20 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
        }`}
        title="Share or copy page link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 text-white/60" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>
    </div>
  );
}
