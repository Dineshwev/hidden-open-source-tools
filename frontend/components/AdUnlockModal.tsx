"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

type AdUnlockModalProps = {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
};

export default function AdUnlockModal({ open, onClose, onUnlock }: AdUnlockModalProps) {
  const [hasClickedSponsor, setHasClickedSponsor] = useState(false);
  const [unlockReady, setUnlockReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const timeLeftTab = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setHasClickedSponsor(false);
      setUnlockReady(false);
      setErrorMsg("");
      timeLeftTab.current = null;
      return;
    }

    const handleVisibilityChange = () => {
      // If user has not clicked sponsor link yet, don't track
      if (!hasClickedSponsor) return;

      if (document.hidden) {
        // User left the tab (went to adsterra)
        timeLeftTab.current = Date.now();
      } else {
        // User came back to our tab
        if (timeLeftTab.current) {
          const timeSpentAwayInSeconds = (Date.now() - timeLeftTab.current) / 1000;
          
          if (timeSpentAwayInSeconds >= 5) {
            // They successfully dwelt on the ad!
            setUnlockReady(true);
            setErrorMsg("");
          } else {
            // They immediately closed it or bounced from proxy issue
            setUnlockReady(false);
            setHasClickedSponsor(false);
            setErrorMsg("You closed the sponsor page too quickly or used a VPN. Please visit the link and wait at least 5 seconds before returning.");
          }
          timeLeftTab.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [open, hasClickedSponsor]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-lg rounded-3xl p-8 shadow-glow-epic"
      >
        <p className="mb-2 text-xs uppercase tracking-widest text-cyan-400">Sponsored unlock</p>
        <h2 className="font-display text-3xl font-bold text-white mb-6">Action Required</h2>
        
        {/* Adsterra Smartlink Block */}
        <div className="mb-6 w-full rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 pointer-events-none" />
          <p className="text-white/80 mb-6 relative z-10 text-lg">You must visit our sponsor and stay there for <span className="text-cyan-400 font-bold">5 seconds</span> to unlock this mystery box.</p>
          
          <a
            href="https://www.profitablecpmratenetwork.com/eyxbqyzk?key=dc62ef4d3d7d7672be4a64e11612ea8c"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setHasClickedSponsor(true);
              setErrorMsg("");
            }}
            className="btn-premium transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,255,212,0.3)]"
          >
            Visit Sponsor Link
          </a>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-pulse text-center">
            {errorMsg}
          </div>
        )}

        {hasClickedSponsor && !unlockReady && (
          <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-6 text-center animate-pulse">
            <p className="text-sm font-medium text-cyan-300">
              Waiting for verification... Please stay on the sponsor tab!
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white backdrop-blur-md"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!unlockReady}
            onClick={onUnlock}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-bold text-white transition-all ${
              unlockReady 
                ? "bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105" 
                : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {unlockReady ? "Unlock Download!" : "Locked"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
