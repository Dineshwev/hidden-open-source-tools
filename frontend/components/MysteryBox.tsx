"use client";

import { useState, useTransition, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Download, Star, Crown, Sparkles } from 'lucide-react';

const MysteryBox3D = dynamic(() => import('./MysteryBox3D'), { ssr: false });
import AdUnlockModal from './AdUnlockModal';
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
  const [showAdModal, setShowAdModal] = useState(false);
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

  const openBox = () => {
    if (hasInventory === false) {
      setUnlockError("No approved tools are available yet. Approve tools in Control Room and try again.");
      return;
    }
    
    if (hasInventory === null) {
      // Still checking
      return;
    }

    setUnlockError("");
    setShowAdModal(true);
  };

  const handleAdUnlock = async (adPassToken: string) => {
    setShowAdModal(false);
    setIsOpening(true);
    setUnlockError("");

    try {
      // Stage 2: Call Serverless Next.js API
      const res = await api.post('/mystery/unlock', { adPassToken });
      
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
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnlockError("Verification failed for this attempt. Please click the box and retry sponsor verification.");
      } else {
        setUnlockError(apiErrorMessage || "Unlock failed. Please complete the sponsor verification again.");
      }
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

      {/* Ad Gateway Modal */}
      <AdUnlockModal 
        open={showAdModal} 
        onClose={() => setShowAdModal(false)} 
        onUnlock={handleAdUnlock} 
      />

      {unlockError && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {unlockError}
        </div>
      )}

      {/* Reward Modal */}
      <AnimatePresence>
        {reward && !isPending && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={`relative max-w-sm w-full max-h-[90vh] overflow-hidden rounded-3xl p-8 shadow-2xl ${rarities[reward.rarity].color} ${rarities[reward.rarity].glow}`}
              initial={{ scale: 0.7, rotateX: -20 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.7, rotateX: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rarity Badge */}
              <div className="absolute top-6 right-6">
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-glow"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {(() => {
                    const Icon = rarities[reward.rarity].rarityIcon;
                    return <Icon size={20} />;
                  })()}
                  <span>{reward.rarity.toUpperCase()}</span>

                </motion.div>
              </div>

              {/* Reward Card */}
              <div className="relative z-10 text-center">
                <motion.div 
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-nebula-500 p-6 shadow-glow-lg"
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 1 }}
                >
                  <Download className="h-12 w-12 mx-auto text-white" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', backgroundImage: rarities[reward.rarity].text }}>
                  {reward.name}
                </h2>
                <p className="text-lg text-white/80 mb-6 max-w-md mx-auto">{reward.description}</p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-white/70 mb-8">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    {reward.fileType.split(' ')[0][0]}
                  </div>
                  <span>{reward.fileType}</span>
                  <span>•</span>
                  by <span className="font-semibold text-white">{reward.creator}</span>
                </div>

                <div className="flex gap-4">
                  <motion.button 
                    className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-nebula-500 to-aurora text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                  >
                    Download
                  </motion.button>
                  <motion.button 
                    className="px-6 py-4 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleShare()}
                  >
                    Share Reward
                  </motion.button>
                </div>
              </div>

              {/* Outer glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-radial from-white/20 to-transparent opacity-75 blur-3xl animate-pulse" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

