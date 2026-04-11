"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { isMobileUserAgent } from "@/lib/utils/device";

type AdOffer = {
  id: string;
  label: string;
  url: string;
  provider: "adsterra-smartlink";
};

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
  const [adOffers, setAdOffers] = useState<AdOffer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [waitSeconds, setWaitSeconds] = useState(6);
  const [isFetchingChallenge, setIsFetchingChallenge] = useState(false);
  const [isExchangingPass, setIsExchangingPass] = useState(false);
  const [adPassToken, setAdPassToken] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [deviceChecked, setDeviceChecked] = useState(false);
  
  const unlockWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMobile(isMobileUserAgent(globalThis.navigator?.userAgent));
    setDeviceChecked(true);
  }, []);

  useEffect(() => {
    if (isMobile && unlockReady && adPassToken) {
      onUnlock(adPassToken);
    }
  }, [adPassToken, isMobile, onUnlock, unlockReady]);

  const resetUnlockTimer = useCallback(() => {
    if (unlockWaitTimer.current) {
      clearTimeout(unlockWaitTimer.current);
      unlockWaitTimer.current = null;
    }
  }, []);

  const startPassExchange = useCallback((nextChallengeToken: string, nextWaitSeconds: number, offerId: string) => {
    setHasClickedSponsor(true);
    setSelectedOfferId(offerId);
    setUnlockReady(false);
    setErrorMsg("");
    setIsExchangingPass(true);

    resetUnlockTimer();

    unlockWaitTimer.current = setTimeout(() => {
      const exchangeChallenge = async () => {
        try {
          const response = await api.post('/mystery/ad-pass', {
            challengeToken: nextChallengeToken
          });

          const passToken = response.data?.data?.adPassToken || "";
          setAdPassToken(passToken);
          setUnlockReady(Boolean(passToken));
          setErrorMsg("");
        } catch {
          setUnlockReady(false);
          setErrorMsg("Verification failed. Please try again.");
        } finally {
          setIsExchangingPass(false);
          unlockWaitTimer.current = null;
        }
      };

      void exchangeChallenge();
    }, Math.max(nextWaitSeconds, 5) * 1000);
  }, [resetUnlockTimer]);

  const ensureSessionToken = async () => {
    const existingToken = getToken();
    if (existingToken) {
      return existingToken;
    }

    const guestKeyStorageKey = "thecloudrain_guest_key";
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
      setAdOffers([]);
      setSelectedOfferId("");
      setWaitSeconds(6);
      setAdPassToken("");
      setIsFetchingChallenge(false);
      setIsExchangingPass(false);
      resetUnlockTimer();
      return;
    }

    if (!deviceChecked) {
      return;
    }

    let isActive = true;

    const fetchChallenge = async () => {
      setIsFetchingChallenge(true);
      setErrorMsg("");

      try {
        await ensureSessionToken();

        const [challengeResponse, offerResponse] = await Promise.all([
          api.post('/mystery/ad-challenge'),
          api.get('/mystery/ad-offer')
        ]);

        const nextChallengeToken = challengeResponse.data?.data?.challengeToken || "";
        const nextOffers = Array.isArray(offerResponse.data?.data?.offers) ? offerResponse.data.data.offers : [];
        const nextWaitSeconds = Number(offerResponse.data?.data?.waitSeconds) || 6;

        if (!isActive) {
          return;
        }

        setChallengeToken(nextChallengeToken);
        setAdOffers(nextOffers);
        setWaitSeconds(nextWaitSeconds);

        if (!nextChallengeToken) {
          throw new Error("Challenge token missing");
        }

        if (isMobile || nextOffers.length === 0) {
          startPassExchange(nextChallengeToken, nextWaitSeconds, isMobile ? "mobile-verification" : "no-offers");
        }
      } catch (error: any) {
        if (!isActive) {
          return;
        }

        const apiError = error?.response?.data?.error;
        setErrorMsg(apiError || "Unable to prepare unlock verification. Please try again.");
      } finally {
        if (!isActive) {
          return;
        }

        setIsFetchingChallenge(false);
      }
    };

    void fetchChallenge();
    return () => {
      isActive = false;
    };
  }, [deviceChecked, isMobile, open, resetUnlockTimer, startPassExchange]);

  const beginUnlockVerification = (offer: AdOffer) => {
    if (!challengeToken) {
      setUnlockReady(false);
      setErrorMsg("Verification token is not ready yet.");
      return;
    }

    if (!/^https?:\/\//i.test(offer.url)) {
      setUnlockReady(false);
      setErrorMsg("Adsterra smartlink URL is invalid. Please refresh and try again.");
      return;
    }

    globalThis.window?.open(offer.url, "_blank", "noopener,noreferrer");
    startPassExchange(challengeToken, waitSeconds, offer.id);
  };

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
        
        <div className="mb-6 w-full rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 pointer-events-none" />

          <p className="text-white/80 mb-6 relative z-10 text-lg">
            {isMobile
              ? `Mobile verification runs automatically for about ${waitSeconds} seconds.`
              : `Choose any sponsor offer, stay there for at least ${waitSeconds} seconds, then return.`}
          </p>

          <div className="relative z-10 grid w-full gap-3">
            {isMobile ? (
              <p className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
                Mobile verification is handled by the mobile ad experience. Please wait for the unlock timer.
              </p>
            ) : (
              <>
                {adOffers.map((offer) => (
                  <a
                    key={offer.id}
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => beginUnlockVerification(offer)}
                    className={`btn-premium block w-full transform text-center hover:scale-[1.01] active:scale-95 shadow-[0_0_20px_rgba(0,255,212,0.25)] ${(isFetchingChallenge || isExchangingPass) ? 'pointer-events-none opacity-70' : ''}`}
                  >
                    {isExchangingPass && selectedOfferId === offer.id ? 'Verifying...' : `Open ${offer.label}`}
                  </a>
                ))}

                {!isFetchingChallenge && adOffers.length === 0 && (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    No sponsor offers are configured right now.
                  </p>
                )}

                {isFetchingChallenge && (
                  <p className="text-sm text-cyan-300">Preparing sponsor offers...</p>
                )}
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-pulse text-center">
            {errorMsg}
          </div>
        )}

        {hasClickedSponsor && !unlockReady && (
          <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-6 text-center animate-pulse">
            <p className="text-sm font-medium text-cyan-300">
              {isExchangingPass ? 'Verifying access...' : 'Waiting for verification...'}
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
