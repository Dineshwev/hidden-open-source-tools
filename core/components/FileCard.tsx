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
  Common: "border-white/15 bg-white/5 text-white/70",
  Rare: "border-white/15 bg-white/5 text-white/70",
  Epic: "border-white/15 bg-white/5 text-white/70",
  Legendary: "border-white/15 bg-white/5 text-white/70"
};

export default function FileCard({
  title,
  description,
  category,
  status = "Verified",
  hint = "Contains: reviewed developer resource",
  mystery = false,
  previewLabel
}: FileCardProps) {
  const badgeClass = rarityStyles[status] ?? rarityStyles.Common;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ y: -1, scale: 0.99 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-[#050505] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.28)] transition-all hover:border-white/15"
    >
      <div className="rounded-[1.25rem] border border-white/10 bg-black p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
            {mystery ? "Mystery asset" : "Preview"}
          </span>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${badgeClass}`}>
            <Sparkles className="h-3 w-3 opacity-70" />
            {status}
          </span>
        </div>

        <motion.div
          className="mt-4 h-24 rounded-[1rem] border border-white/10 bg-[#090909]"
          whileHover={{ scale: 1.01 }}
        />

        <p className="mt-3 text-sm text-white/50">
          {mystery ? previewLabel ?? "Encrypted Preview" : "Simple black preview block"}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/65">
          {category}
        </span>
        <span className="text-xs text-white/45">{mystery ? "Encrypted" : "Verified"}</span>
      </div>
      <h3 className="mt-4 text-xl font-medium text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
        <span className="text-white/35">Hint:</span> {hint}
      </div>
    </motion.article>
  );
}


