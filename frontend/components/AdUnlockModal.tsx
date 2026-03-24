"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type AdUnlockModalProps = {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
};

export default function AdUnlockModal({ open, onClose, onUnlock }: AdUnlockModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (!open) {
      setSecondsLeft(5);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-glow"
      >
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-aurora/70">Sponsored unlock</p>
        <h2 className="font-display text-3xl font-bold text-white">Watching ad sequence...</h2>
        <p className="mt-4 text-white/70">
          Simulate an ad slot here, then unlock a random verified file once the countdown completes.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aurora to-nebula-400 transition-all duration-1000"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-white/70">
            {secondsLeft > 0 ? `Unlock available in ${secondsLeft}s` : "Mystery box is ready to open"}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-white/15 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={secondsLeft > 0}
            onClick={onUnlock}
            className="flex-1 rounded-full bg-nebula-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-nebula-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Unlock Download
          </button>
        </div>
      </motion.div>
    </div>
  );
}
