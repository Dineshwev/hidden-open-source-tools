"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ShieldCheck } from "lucide-react";
import { getAdsterraSmartlinkUrl } from "@/lib/adsterra";

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
}

export default function SponsorModal({ isOpen, onClose, targetUrl }: SponsorModalProps) {
  const [adClicked, setAdClicked] = useState(false);
  const smartlink = getAdsterraSmartlinkUrl();

  const handleAction = () => {
    if (!adClicked) {
      if (smartlink) {
        window.open(smartlink, "_blank", "noopener,noreferrer");
      }
      setAdClicked(true);
    } else {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      onClose();
      setAdClicked(false); // Reset for next time
    }
  };

  // Reset state when modal closes manually
  useEffect(() => {
    if (!isOpen) setAdClicked(false);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-[2rem] p-8 text-center border border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 flex justify-center">
              <div className="bg-cyan-500/20 p-4 rounded-2xl border border-cyan-400/30">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <h3 className="text-2xl font-display text-white mb-4">Sponsor Verification</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              To keep these resources free, please visit our sponsor link. Your download will start automatically after.
            </p>

            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all group"
            >
              {adClicked ? "Unlock Resource →" : "Visit Sponsor & Unlock"}
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <p className="mt-6 text-[10px] text-white/30 uppercase tracking-widest">
              Secured by The Cloud Rain
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
