"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import AdUnlockModal from "@/components/AdUnlockModal";
import { useMysteryStore } from "@/store/mystery-store";

export default function MysteryBox() {
  const [open, setOpen] = useState(false);
  const { reward, loading, setLoading, setReward } = useMysteryStore();

  async function unlockBox() {
    setLoading(true);

    try {
      const response = await api.post("/mystery/unlock");
      setReward(response.data.data);
    } catch (_error) {
      setReward({
        title: "Fallback Demo Asset",
        downloadUrl: "#",
        rarity: "Prototype",
        description: "API unavailable. This placeholder shows the intended reward card state.",
        category: "Demo",
        uploader: "System",
        tags: ["offline", "demo"],
        license: "Community"
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-8">
        <div className="absolute inset-x-12 top-10 h-40 rounded-full bg-nebula-500/20 blur-3xl" />
        <p className="relative text-sm uppercase tracking-[0.35em] text-aurora/70">Mystery download vault</p>
        <h2 className="relative mt-4 font-display text-4xl font-bold leading-tight text-white">
          Unlock curated digital treasures one ad at a time.
        </h2>
        <p className="relative mt-4 max-w-xl text-white/70">
          Each approved upload enters the universe pool. Users watch a rewarded ad flow, then receive a randomized verified download.
        </p>

        <div className="relative mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-gradient-to-r from-nebula-500 to-ember px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            Open Mystery Box
          </button>
          <span className="text-sm text-white/60">Rewarded ad + randomized verified file</span>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Current result</p>
        {loading ? (
          <div className="mt-8 animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
            Generating your reward...
          </div>
        ) : reward ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl border border-aurora/20 bg-aurora/5 p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/75">{reward.rarity}</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">{reward.title}</h3>
            <p className="mt-3 text-sm text-white/70">{reward.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span>{reward.category}</span>
              <span>•</span>
              <span>by {reward.uploader}</span>
              <span>•</span>
              <span>{reward.license}</span>
            </div>
            <a
              href={reward.downloadUrl}
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Download File
            </a>
          </motion.div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
            No file unlocked yet. Start the ad flow to reveal a random asset.
          </div>
        )}
      </div>

      <AdUnlockModal open={open} onClose={() => setOpen(false)} onUnlock={unlockBox} />
    </section>
  );
}
