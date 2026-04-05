"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";

type AdUnlockModalProps = {
  open: boolean;
  onClose: () => void;
  onUnlock: (adPassToken: string) => void;
};

export default function AdUnlockModal({ open, onClose, onUnlock }: AdUnlockModalProps) {
  const [hasClickedSponsor, setHasClickedSponsor] = useState(false);
  const [unlockReady, setUnlockReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [isFetchingChallenge, setIsFetchingChallenge] = useState(false);
  const [isExchangingPass, setIsExchangingPass] = useState(false);
  const [adPassToken, setAdPassToken] = useState("");
  
  const timeLeftTab = useRef<number | null>(null);

  const ensureSessionToken = async () => {
    const existingToken = getToken();
    if (existingToken) {
      return existingToken;
    }

    const guestKeyStorageKey = "portfolio_universe_guest_key";
    const guestKey =
      window.localStorage.getItem(guestKeyStorageKey) ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    window.localStorage.setItem(guestKeyStorageKey, guestKey);

    const response = await api.post('/auth/guest', { guestKey });
    const guestToken = response.data?.token;

    if (!guestToken) {
      throw new Error("Guest session could not be created");
    }

    setToken(guestToken);
    return guestToken;
  };

  useEffect(() => {
    if (!open) {
      setHasClickedSponsor(false);
      setUnlockReady(false);
      setErrorMsg("");
      setChallengeToken("");
      setAdPassToken("");
      setIsFetchingChallenge(false);
      setIsExchangingPass(false);
      timeLeftTab.current = null;
      return;
    }

    const fetchChallenge = async () => {
      setIsFetchingChallenge(true);
      setErrorMsg("");

      try {
        await ensureSessionToken();
        const response = await api.post('/mystery/ad-challenge');
        setChallengeToken(response.data?.data?.challengeToken || "");
      } catch {
        setErrorMsg("Unable to prepare the sponsor unlock. Please try again.");
      } finally {
        setIsFetchingChallenge(false);
      }
    };

    void fetchChallenge();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleVisibilityChange = () => {
      // If user has not clicked sponsor link yet, don't track
      if (!hasClickedSponsor) return;

      if (document.hidden) {
        // User left the tab
        timeLeftTab.current = Date.now();
      } else {
        // User came back to our tab
        if (timeLeftTab.current) {
          const timeSpentAwayInSeconds = (Date.now() - timeLeftTab.current) / 1000;
          
          if (timeSpentAwayInSeconds >= 5) {
            // Exchange the challenge for a short-lived unlock token.
            const exchangeChallenge = async () => {
              if (!challengeToken) {
                setUnlockReady(false);
                setErrorMsg("Sponsor verification is not ready yet.");
                return;
              }

              setIsExchangingPass(true);

              try {
                const response = await api.post('/mystery/ad-pass', {
                  challengeToken
                });

                const passToken = response.data?.data?.adPassToken || "";
                setAdPassToken(passToken);
                setUnlockReady(Boolean(passToken));
                setErrorMsg("");
              } catch {
                setUnlockReady(false);
                setErrorMsg("Sponsor verification failed. Please complete the sponsor step again.");
              } finally {
                setIsExchangingPass(false);
              }
            };

            void exchangeChallenge();
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
  }, [open, hasClickedSponsor, challengeToken]);

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
        
        {/* Monetag link placeholder */}
        <div className="mb-6 w-full rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 pointer-events-none" />
          <p className="text-white/80 mb-4 relative z-10 text-lg">Monetag sponsor link will be added here.</p>
          <p className="text-white/60 relative z-10 text-sm">Ad unlock is temporarily disabled until the new Monetag URL is configured.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-pulse text-center">
            {errorMsg}
          </div>
        )}

        {hasClickedSponsor && !unlockReady && (
          <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-6 text-center animate-pulse">
            <p className="text-sm font-medium text-cyan-300">
              {isExchangingPass ? 'Verifying sponsor return...' : 'Waiting for verification... Please stay on the sponsor tab!'}
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
            onClick={() => onUnlock(adPassToken)}
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
