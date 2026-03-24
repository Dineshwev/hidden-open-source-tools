"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type FileCardProps = {
  title: string;
  description: string;
  category: string;
  status?: string;
  hint?: string;
  mystery?: boolean;
  previewLabel?: string;
};

const rarityStyles: Record<string, string> = {
  Common: "border-white/20 bg-white/10 text-white/80",
  Rare: "border-sky-300/35 bg-sky-300/10 text-sky-200 shadow-[0_0_18px_rgba(125,211,252,0.18)]",
  Epic: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-200 shadow-[0_0_18px_rgba(244,114,182,0.18)]",
  Legendary: "border-amber-300/45 bg-amber-300/10 text-amber-200 shadow-[0_0_20px_rgba(252,211,77,0.24)]"
};

export default function FileCard({
  title,
  description,
  category,
  status = "Verified",
  hint = "Contains: premium asset drop",
  mystery = false,
  previewLabel
}: FileCardProps) {
  const badgeClass = rarityStyles[status] ?? rarityStyles.Common;

  return (
    <motion.article
      whileHover={{ y: -10, rotateX: -6, rotateY: 5 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      style={{ transformStyle: "preserve-3d" }}
      className="depth-panel asset-card glass-panel overflow-hidden rounded-3xl p-5 transition hover:border-nebula-400/40"
    >
      <div className="asset-card-preview relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,150,255,0.22),rgba(6,13,23,0.25)_55%,rgba(255,153,102,0.18))] p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
        <div className="absolute right-4 top-4">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${badgeClass}`}>
            <Sparkles className="h-3 w-3" />
            {status}
          </span>
        </div>
        <motion.div
          className={`relative flex h-40 items-end rounded-[1rem] border border-white/10 p-4 ${
            mystery
              ? "overflow-hidden bg-[linear-gradient(180deg,rgba(8,16,28,0.55),rgba(5,9,18,0.92))]"
              : "bg-[linear-gradient(180deg,rgba(10,17,31,0.15),rgba(10,17,31,0.55))]"
          }`}
          whileHover={{ scale: 1.01 }}
        >
          {mystery ? (
            <>
              <div className="asset-card-glitch absolute inset-0 opacity-70" />
              <div className="absolute inset-0 backdrop-blur-md" />
              <div className="absolute inset-x-6 top-6 h-14 rounded-full bg-nebula-400/20 blur-2xl" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Mystery Asset</p>
                  <p className="mt-2 font-display text-xl text-white/85">{previewLabel ?? "Encrypted Preview"}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">sealed</div>
              </div>
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col justify-end">
              <div className="absolute left-6 top-6 h-16 w-16 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md" />
              <div className="absolute left-20 top-10 h-8 w-28 rounded-full bg-aurora/15 blur-xl" />
              <div className="space-y-2">
                <div className="h-2 w-20 rounded-full bg-white/30" />
                <div className="h-2 w-32 rounded-full bg-white/20" />
                <div className="h-2 w-24 rounded-full bg-white/15" />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="rounded-full border border-aurora/30 bg-aurora/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-aurora">
          {category}
        </span>
        <span className="text-xs text-white/55">{mystery ? "Encrypted" : "Verified"}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{description}</p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
        <span className="text-white/45">Hint:</span> {hint}
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.article>
  );
}
