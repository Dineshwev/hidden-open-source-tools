"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/lib/api";
import AdUnlockModal from "@/components/AdUnlockModal";
import TerminalUnlock from "@/components/TerminalUnlock";
import { useMysteryStore } from "@/store/mystery-store";

export default function MysteryBox() {
  const [open, setOpen] = useState(false);
  const [unlockFlash, setUnlockFlash] = useState(0);
  const { reward, loading, setLoading, setReward } = useMysteryStore();

  useEffect(() => {
    if (!reward) {
      return;
    }

    setUnlockFlash((current) => current + 1);
  }, [reward]);

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
      <div className="depth-stage glass-panel relative overflow-hidden rounded-[2rem] p-8">
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

      <div className="depth-stage glass-panel relative overflow-hidden rounded-[2rem] p-8">
        <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-aurora/10 blur-3xl" />
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Current result</p>
        {loading ? (
          <div className="mt-8 animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
            Generating your reward...
          </div>
        ) : reward ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${reward.title}-${unlockFlash}`}
              initial={{ opacity: 0, y: 16, scale: 0.97, filter: "brightness(1.65)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="unlock-glitch mt-8 overflow-hidden rounded-3xl border border-aurora/25 bg-[linear-gradient(180deg,rgba(115,240,196,0.12),rgba(255,255,255,0.03))] p-6"
            >
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_15%,rgba(255,255,255,0.24)_35%,transparent_55%)]"
                initial={{ x: "-120%", opacity: 0.8 }}
                animate={{ x: "120%", opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
              <motion.div
                className="pointer-events-none absolute inset-0 mix-blend-screen"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="unlock-glitch-layer absolute inset-0 bg-[linear-gradient(90deg,rgba(255,70,160,0.18),transparent_28%,transparent_72%,rgba(0,255,255,0.18))]" />
                <div className="unlock-glitch-layer unlock-glitch-layer-delay absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.1)_0_2px,transparent_2px_8px)]" />
              </motion.div>

              <p className="relative text-xs uppercase tracking-[0.3em] text-aurora/75">{reward.rarity}</p>
              <h3 className="relative mt-3 font-display text-2xl font-semibold">{reward.title}</h3>
              <p className="relative mt-3 text-sm text-white/70">{reward.description}</p>
              <div className="relative mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span>{reward.category}</span>
                <span>&bull;</span>
                <span>by {reward.uploader}</span>
                <span>&bull;</span>
                <span>{reward.license}</span>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {reward.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={reward.downloadUrl}
                className="relative mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900"
              >
                Download File
              </a>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
            No file unlocked yet. Start the ad flow to reveal a random asset.
          </div>
        )}
      </div>

      <AdUnlockModal open={open} onClose={() => setOpen(false)} onUnlock={unlockBox} />
      <div className="lg:col-span-2">
        <TerminalUnlock reward={reward} loading={loading} onUnlock={unlockBox} />
      </div>
    </section>
  );
}
