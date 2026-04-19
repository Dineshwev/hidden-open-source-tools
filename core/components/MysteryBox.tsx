"use client";

import { useState, useTransition, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Download, Star, Crown, Sparkles } from 'lucide-react';

const MysteryBox3D = dynamic(() => import('./MysteryBox3D'), { ssr: false });
import api from '@/lib/api';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Reward {
  name: string;
  description: string;
  rarity: Rarity;
  fileType: string;
  creator: string;
  downloadUrl?: string;
}

const rarities = {
  common: { color: 'bg-gray-400/20 border-gray-400/50', threeColor: '#94a3b8', glow: 'shadow-gray-400/20', text: 'bg-gradient-to-r from-gray-300 to-gray-400', rarityIcon: Download },
  rare: { color: 'bg-blue-500/20 border-blue-500/50', threeColor: '#3b82f6', glow: 'shadow-blue-500/30', text: 'bg-gradient-to-r from-blue-400 to-cyan-400', rarityIcon: Star },
  epic: { color: 'bg-purple-500/30 border-purple-500/60', threeColor: '#a855f7', glow: 'shadow-purple-500/50', text: 'bg-gradient-to-r from-purple-400 to-pink-400', rarityIcon: Crown },
  legendary: { color: 'bg-orange-500/40 border-orange-500/70', threeColor: '#f59e0b', glow: 'shadow-orange-500/70', text: 'bg-gradient-to-r from-orange-400 to-yellow-400', rarityIcon: Sparkles },
};

const boxVariants: Variants = {
  closed: {
    scale: 1,
    rotateY: 0,
    boxShadow: '0 25px 75px rgba(127, 150, 255, 0.4)',
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    boxShadow: '0 35px 100px rgba(127, 150, 255, 0.6)',
    transition: { duration: 0.3 }
  },
  opening: {
    scale: [1, 1.2, 0.8],
    rotateY: [0, 180, 360],
    borderRadius: ['20px', '50%', '50%'],
    transition: { 
      duration: 1.5,
      times: [0, 0.5, 1],
      ease: 'easeInOut'
    }
  },
  open: {
    scale: 0,
    rotateY: 720,
    opacity: 0,
  }
};

const particlesVariants: Variants = {
  idle: {
    opacity: 0.4,
    scale: 1,
  },
  burst: {
    opacity: [0.8, 1, 0],
    scale: [1, 1.5, 2],
    rotate: [0, 180, 360],
    x: ['0%', '100%', '-100%'],
    y: ['0%', '-100%', '100%'],
    transition: { 
      duration: 1.2,
      staggerChildren: 0.08,
      delayChildren: 0.8
    }
  }
};

export default function MysteryBox({ className = '' }: { className?: string }) {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [isPending, startTransition] = useTransition();
  const [unlockError, setUnlockError] = useState("");
  const [hasInventory, setHasInventory] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInventory = async () => {
      try {
        const [legacyResponse, scrapedResponse] = await Promise.all([
          api.get('/files/approved').catch(() => ({ data: { data: [] } })),
          api.get('/files/scraped-tools', {
            params: { page: 1, limit: 1 }
          }).catch(() => ({ data: { data: [] } }))
        ]);

        const hasLegacy = Array.isArray(legacyResponse?.data?.data) && legacyResponse.data.data.length > 0;
        const hasScraped = Array.isArray(scrapedResponse?.data?.data) && scrapedResponse.data.data.length > 0;
        
        setHasInventory(hasLegacy || hasScraped);
      } catch (err) {
        console.error("Inventory check failed:", err);
        setHasInventory(false);
      }
    };

    checkInventory();
  }, []);

  const openBox = async () => {
    if (hasInventory === false) {
      setUnlockError("No approved tools are available yet. Approve tools in Control Room and try again.");
      return;
    }
    
    if (hasInventory === null) {
      return;
    }

    setUnlockError("");
    setIsOpening(true);

    try {
      const res = await api.post('/mystery/unlock', {});
      
      if (!res.data?.data) {
        throw new Error("The cloud rain was unable to retrieve your reward. Please try again.");
      }

      const dbFile = res.data.data;
      
      setReward({
        name: dbFile.title,
        description: dbFile.description,
        rarity: (dbFile.rarity?.toLowerCase() as Rarity) || 'common',
        fileType: dbFile.mimeType || 'File',
        creator: dbFile.uploader || 'Anonymous',
        downloadUrl: dbFile.downloadUrl
      });
    } catch (err: any) {
      setIsOpening(false);
      const apiErrorMessage = err.response?.data?.error || err.message;
      setUnlockError(apiErrorMessage || "Unlock failed. Please try again.");
    }
  };

  const closeModal = () => {
    setReward(null);
    setIsOpening(false);
  };

  const handleDownload = () => {
    if (!reward?.downloadUrl) {
      closeModal();
      return;
    }

    if (reward.downloadUrl.startsWith('http://') || reward.downloadUrl.startsWith('https://')) {
      window.open(reward.downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(reward.downloadUrl, '_blank');
  };

  const handleShare = async () => {
    if (!reward) return;

    const shareUrl = reward.downloadUrl || window.location.href;
    const payload = {
      title: reward.name,
      text: `I unlocked ${reward.name} on The Cloud Rain`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setUnlockError('Reward link copied to clipboard.');
    } catch {
      setUnlockError('Unable to share reward right now.');
    }
  };

  return (
    <div className={`relative mx-auto w-full max-w-2xl px-4 ${className}`}>
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 md:p-8 shadow-[0_0_50px_-12px_rgba(127,150,255,0.2)] hover:shadow-[0_0_80px_-12px_rgba(127,150,255,0.4)] transition-shadow duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-nebula-500/5 via-transparent to-aurora/5 pointer-events-none" />
        
        {/* New 3D Mystery Box Integration */}
        <div className="relative z-10 flex flex-col items-center">
          <MysteryBox3D 
            isOpening={isOpening} 
            color={reward ? rarities[reward.rarity].threeColor : "#7f96ff"}
            onClick={openBox}
          />
          
          <div className="mt-8 text-center space-y-2">
            <h3 className="text-2xl font-display text-white">
              {isOpening ? "Unlocking Your Reward..." : "Mystery Reward Box"}
            </h3>
            <p className="text-white/60 max-w-xs mx-auto text-sm">
              {hasInventory === null 
                ? "Verifying inventory availability..." 
                : "Unlock randomized premium developer tools and resources every day."}
            </p>
          </div>
        </div>
      </div>

      {/* Removed Ad Gateway Modal */}

      {unlockError && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {unlockError}
        </div>
      )}

      {/* Reward Modal */}
      <AnimatePresence>
        {reward && !isPending && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={`relative max-w-lg w-full overflow-hidden rounded-[2.5rem] border-2 border-white/20 bg-[#050505]/80 p-8 md:p-12 shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)] backdrop-blur-xl group`}
              initial={{ scale: 0.9, y: 20, rotateX: 10 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 20, rotateX: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dynamic Rarity Glow - Corner Accents */}
              <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px] opacity-20 transition-colors duration-1000 ${reward.rarity === 'legendary' ? 'bg-orange-500' : reward.rarity === 'epic' ? 'bg-purple-500' : 'bg-cyan-500'}`} />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Rarity Header */}
                <div className="mb-8 flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${reward.rarity === 'legendary' ? 'bg-orange-400' : reward.rarity === 'epic' ? 'bg-purple-400' : 'bg-cyan-400'}`} />
                    <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">System Drop</span>
                  </div>
                  <div className={`rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 shadow-inner`}>
                    {reward.rarity}
                  </div>
                </div>

                {/* Geometric Icon Container */}
                <div className="relative mb-10">
                  <div className="absolute inset-0 rotate-45 rounded-3xl border border-white/10 bg-white/5 blur-sm" />
                  <motion.div 
                    className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-gradient-to-br from-white/10 to-transparent shadow-2xl backdrop-blur-md"
                    animate={{ rotateY: [0, 15, 0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  >
                    <Download className="h-10 w-10 text-white" />
                  </motion.div>
                  {/* Floating sparkles for high rarity */}
                  {['epic', 'legendary'].includes(reward.rarity) && (
                    <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-400 animate-pulse" />
                  )}
                </div>
                
                {/* Text Content */}
                <div className="text-center space-y-6">
                  <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                    {reward.name}
                  </h2>
                  
                  <div className="group relative mx-auto max-w-md">
                    <div className="absolute -inset-2 rounded-2xl bg-white/5 opacity-0 blur transition-opacity group-hover:opacity-100" />
                    <p className="relative line-clamp-4 text-center text-lg leading-relaxed text-white/60">
                      {/* Stripping markdown-like links for a cleaner look */}
                      {reward.description.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[()]/g, '')}
                    </p>
                  </div>
                  
                  {/* Origin Tag */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <div className="h-px w-8 bg-white/10" />
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/30">
                      Authorized by <span className="text-white/70 font-bold">{reward.creator}</span>
                    </span>
                    <div className="h-px w-8 bg-white/10" />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-12 flex w-full flex-col gap-4 sm:flex-row">
                  <motion.button 
                    className="flex-1 rounded-2xl bg-white py-5 font-display text-sm font-black uppercase tracking-[0.1em] text-black transition-all hover:bg-zinc-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                  >
                    Download Asset
                  </motion.button>
                  <motion.button 
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-5 font-display text-sm font-black uppercase tracking-[0.1em] text-white transition-all hover:bg-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleShare()}
                  >
                    Share
                  </motion.button>
                </div>
              </div>

              {/* Decorative Scanlines */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



