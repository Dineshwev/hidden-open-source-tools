"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Download, Heart, Eye, ExternalLink } from 'lucide-react';

interface CreatorPreview {
  id: string;
  name: string;
  avatar: string;
  stats: {
    uploads: number;
    downloads: number;
    likes: number;
    views: number;
  };
  level: number;
}

interface PortfolioPreviewProps {
  creator: CreatorPreview;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const PortfolioPreview = ({ creator, isVisible, position, onClose }: PortfolioPreviewProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: position.x + 20,
            top: position.y - 80,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Glassmorphism Container */}
          <motion.div
            className="glass-panel rounded-2xl p-6 shadow-2xl shadow-nebula-500/40 border-white/20 w-80 backdrop-blur-3xl max-h-96 overflow-hidden"
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={onClose}
            whileHover={{ y: -4, boxShadow: '0 35px 100px rgba(127, 150, 255, 0.4)' }}
          >
            {/* Header with avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden shadow-glow bg-gradient-to-br from-${creator.level > 4 ? 'orange' : creator.level > 2 ? 'purple' : 'blue'}-500`}>
                  <img 
                    src={creator.avatar || '/api/placeholder/64/64'} 
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-black/20 shadow-glow-xs">
                  <span className="text-xs font-bold text-white">L{creator.level}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-white truncate mb-1">{creator.name}</h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Lv. {creator.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
                  <Download className="h-4 w-4" />
                  Downloads
                </div>
                <div className="text-lg font-bold text-white">{creator.stats.downloads.toLocaleString()}</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
                  <Heart className="h-4 w-4" />
                  Likes
                </div>
                <div className="text-lg font-bold text-[#ef4444]">{creator.stats.likes.toLocaleString()}</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
                  <Eye className="h-4 w-4" />
                  Views
                </div>
                <div className="text-lg font-bold text-[#60a5fa]">{creator.stats.views.toLocaleString()}</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
                  📁
                  Uploads
                </div>
                <div className="text-lg font-bold text-emerald-400">{creator.stats.uploads}</div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              className="w-full rounded-2xl bg-gradient-to-r from-nebula-500 to-aurora px-6 py-4 text-white font-bold shadow-glow hover:shadow-glow-lg transition-all border border-white/20 backdrop-blur-sm hover:scale-[1.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Open Portfolio
              </div>
            </motion.button>

            {/* Arrow pointer */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortfolioPreview;

