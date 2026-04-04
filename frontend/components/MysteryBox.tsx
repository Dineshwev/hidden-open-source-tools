"use client";

import { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Download, Star, Crown, Sparkles } from 'lucide-react';
import AdUnlockModal from './AdUnlockModal';
import api from '@/lib/api';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Reward {
  name: string;
  description: string;
  rarity: Rarity;
  fileType: string;
  creator: string;
}

const rarities = {
  common: { color: 'bg-gray-400/20 border-gray-400/50', glow: 'shadow-gray-400/20', text: 'bg-gradient-to-r from-gray-300 to-gray-400', rarityIcon: Download },
  rare: { color: 'bg-blue-500/20 border-blue-500/50', glow: 'shadow-blue-500/30', text: 'bg-gradient-to-r from-blue-400 to-cyan-400', rarityIcon: Star },
  epic: { color: 'bg-purple-500/30 border-purple-500/60', glow: 'shadow-purple-500/50', text: 'bg-gradient-to-r from-purple-400 to-pink-400', rarityIcon: Crown },
  legendary: { color: 'bg-orange-500/40 border-orange-500/70', glow: 'shadow-orange-500/70', text: 'bg-gradient-to-r from-orange-400 to-yellow-400', rarityIcon: Sparkles },
};

const sampleRewards: Reward[] = [
  { name: 'Neon UI Icons', description: '50 cyberpunk icons SVG', rarity: 'common' as Rarity, fileType: 'SVG Pack', creator: 'Alex Rivera' },
  { name: 'Quantum Shader', description: 'Advanced GLSL fragment shader', rarity: 'rare' as Rarity, fileType: 'Shader', creator: 'Luna Voss' },
  { name: 'Holographic HUD', description: 'Interactive 3D interface kit', rarity: 'epic' as Rarity, fileType: '3D Model', creator: 'Kai Nova' },
  { name: 'NFT Galaxy Generator', description: 'Procedural space art generator', rarity: 'legendary' as Rarity, fileType: 'Script', creator: 'Zara Quill' },
];

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

  const openBox = () => {
    // Stage 1: Trigger the gated ad slot before anything opens
    setShowAdModal(true);
  };

  const handleAdUnlock = async () => {
    setShowAdModal(false);
    setIsOpening(true);

    try {
      // Stage 2: Call Serverless Next.js API
      const res = await api.post('/mystery/unlock');
      const dbFile = res.data.data;
      
      // Map DB schema to frontend display schema
      setReward({
        name: dbFile.title,
        description: dbFile.description,
        rarity: (dbFile.rarity?.toLowerCase() as Rarity) || 'common',
        fileType: dbFile.mimeType || 'File',
        creator: 'Anonymous'
      });
    } catch (err) {
      // Fallback to sample data if user not logged in or backend fails
      setTimeout(() => {
        const randomReward = sampleRewards[Math.floor(Math.random() * sampleRewards.length)]!;
        setReward(randomReward);
      }, 1500);
    }
  };

  const closeModal = () => {
    setReward(null);
    setIsOpening(false);
  };

  return (
    <div className={`relative mx-auto w-fit ${className}`}>
      <motion.div
        variants={boxVariants}
        initial="closed"
        whileHover="hover"
        animate={isOpening ? "opening" : "closed"}
        onClick={openBox}
        className="relative w-48 h-48 md:w-64 md:h-64 cursor-pointer select-none touch-man-action"
        style={{ perspective: 1000 }}
      >
        {/* Box */}
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-nebula-500/40 via-[#7f96ff]/20 to-aurora/30 border-4 border-white/30 backdrop-blur-xl shadow-2xl shadow-nebula-500/50"
          animate={{ 
            rotateX: isOpening ? [0, 90, 0] : 0,
            rotateY: isOpening ? [0, 180, 360] : 0 
          }}
          transition={{ duration: 1.5 }}
        >
          {/* Lock */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 shadow-glow flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white/80 to-nebula-100 shadow-inner" />
          </div>
          
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-nebula-500 via-white/20 to-aurora opacity-70 blur-xl animate-pulse" />
          
          {/* Particles */}
          <div className="absolute inset-0 rounded-3xl">
            <motion.div 
              className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-nebula-400 blur-sm top-10 left-10"
              variants={particlesVariants}
              animate={isOpening ? "burst" : "idle"}
            />
            <motion.div 
              className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-aurora blur-sm top-20 right-10"
              variants={particlesVariants}
              animate={isOpening ? "burst" : "idle"}
            />
            <motion.div 
              className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-ember blur-sm bottom-20 left-20"
              variants={particlesVariants}
              animate={isOpening ? "burst" : "idle"}
            />
            <motion.div 
              className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-nebula-400 blur-sm bottom-10 right-20"
              variants={particlesVariants}
              animate={isOpening ? "burst" : "idle"}
            />
          </div>
        </motion.div>

        {/* Click prompt */}
        <motion.div 
          className="absolute inset-0 rounded-3xl border-4 border-transparent flex items-center justify-center bg-black/20 backdrop-blur-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-center text-white/90">
            <div className="text-4xl mb-2 animate-spin">🎁</div>
            <div className="font-bold text-lg mb-1">Click to Open</div>
            <div className="text-sm opacity-75">Random file reward awaits</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Ad Gateway Modal */}
      <AdUnlockModal 
        open={showAdModal} 
        onClose={() => setShowAdModal(false)} 
        onUnlock={handleAdUnlock} 
      />

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
                    onClick={closeModal}
                  >
                    Download (2.4MB)
                  </motion.button>
                  <motion.button 
                    className="px-6 py-4 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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

