"use client";

import { motion } from "framer-motion";

type FileCardProps = {
  title: string;
  description: string;
  category: string;
  status?: string;
};

export default function FileCard({ title, description, category, status = "Verified" }: FileCardProps) {
  return (
    <motion.article
      whileHover={{ y: -8, rotateX: -3, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="depth-panel glass-panel rounded-3xl p-5 transition hover:border-nebula-400/40"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full border border-aurora/30 bg-aurora/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-aurora">
          {category}
        </span>
        <span className="text-xs text-white/55">{status}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{description}</p>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.article>
  );
}
