"use client";

import { motion } from 'framer-motion';
import { motion as framerMotion } from 'framer-motion';
import { Star, Crown, Award, Diamond, Zap, Flame } from 'lucide-react';

interface LevelData {
  level: number;
  xp: number;
  xpToNext: number;
  name: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const levels: LevelData[] = [
  { level: 1, xp: 0, xpToNext: 100, name: 'Newcomer', badgeIcon: Star, color: '#94a3b8', description: 'First uploads' },
  { level: 2, xp: 100, xpToNext: 300, name: 'Explorer', badgeIcon: Flame, color: '#f59e0b', description: 'Active contributor' },
  { level: 3, xp: 400, xpToNext: 800, name: 'Rising Star', badgeIcon: Zap, color: '#06b6d4', description: 'Community favorite' },
  { level: 4, xp: 1200, xpToNext: 2000, name: 'Master', badgeIcon: Diamond, color: '#7f96ff', description: 'Expert creator' },
  { level: 5, xp: 3200, xpToNext: 5000, name: 'Legend', badgeIcon: Crown, color: '#f59e0b', description: 'Platform icon' },
  { level: 6, xp: 8200, xpToNext: Infinity, name: 'God Tier', badgeIcon: Award, color: '#ec4899', description: 'Ultimate creator' },
];

interface LevelBadgeProps {
  currentXP: number;
  className?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  profileMode?: boolean;
}

export default function LevelBadge({ 
  currentXP, 
  className = '', 
  showProgress = true, 
  size = 'md', 
  profileMode = false 
}: LevelBadgeProps) {
  const levelData = levels.find(l => currentXP >= l.xp) || levels[0]!;
  const progress = Math.min((currentXP - levelData.xp) / (levelData.xpToNext - levelData.xp) * 100, 100);
  const BadgeIcon = levelData.badgeIcon;
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  }[size];

  return (
    <motion.div 
      className={`relative group ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {/* Badge */}
      <div className={`relative ${sizeStyles} rounded-2xl shadow-2xl p-2 flex items-center justify-center font-bold uppercase tracking-wide ${profileMode ? 'shadow-' + levelData.color.slice(1) + '/40' : ''}`}>
        <BadgeIcon className={`h-4 w-4 md:h-6 md:w-6 drop-shadow-lg group-hover:scale-110 transition-transform ${profileMode ? '' : 'stroke-current'}`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl backdrop-blur-sm" />
        <div className={`absolute -inset-1 bg-gradient-to-r from-${levelData.color.slice(1)} to-transparent rounded-3xl blur opacity-75 animate-pulse`} />
      </div>

      {showProgress && (
        <motion.div 
          className="mt-2 w-full bg-white/10 rounded-full h-2 overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <motion.div 
            className={`h-full bg-gradient-to-r from-${levelData.color.slice(1)} to-transparent rounded-full shadow-glow`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ originX: 0 }}
          />
        </motion.div>
      )}

      {/* Tooltip */}
      <motion.div 
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl px-4 py-2 rounded-xl text-xs text-white/90 whitespace-nowrap shadow-2xl border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="font-bold">{levelData.name} Lv.{levelData.level}</div>
        <div className="opacity-75">{levelData.description}</div>
        {showProgress && (
          <div className="mt-1 text-[10px] opacity-75">{Math.floor(currentXP)} XP</div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Profile Card Integration Example
export function ProfileLevelDisplay({ xp, className }: { xp: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-glow-sm ${className}`}>
      <LevelBadge currentXP={xp} size="lg" />
      <div>
        <div className="text-2xl font-bold text-white mb-1">Lv. 24 Master</div>
        <div className="text-sm text-white/60">8,247 XP</div>
      </div>
    </div>
  );
}

