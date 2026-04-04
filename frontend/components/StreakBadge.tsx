"use client";

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animateFlame?: boolean;
}

const milestoneRewards = [
  { days: 3, reward: 'Bronze Flame', color: '#cd7f32' },
  { days: 7, reward: 'Silver Flame', color: '#c0c0c0' },
  { days: 30, reward: 'Golden Flame', color: '#ffd700' },
];

export default function StreakBadge({ 
  streak, 
  className = '', 
  size = 'md', 
  animateFlame = true 
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size] || 'w-10 h-10 text-sm';

  const milestone = milestoneRewards.find(m => streak >= m.days);
  const color = milestone ? milestone.color : '#ef4444';
  const rewardName = milestone ? milestone.reward : `${streak} Day Streak`;

  return (
    <motion.div 
      className={`relative inline-flex items-center gap-1 ${sizeClasses} ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Flame Icon */}
      <motion.div
        className="relative"
        animate={animateFlame ? { 
          scale: [1, 1.1, 1.05, 1],
          rotate: [0, -2, 2, 0]
        } : {}}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatType: 'loop',
          ease: 'easeInOut'
        }}
      >
        <Flame 
          className={`drop-shadow-glow stroke-[2px] stroke-current shadow-lg ${animateFlame ? 'animate-flicker' : ''}`}
          style={{ color }}
          size={size === 'lg' ? 20 : size === 'md' ? 16 : 12}
        />
        {/* Flame glow */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{ backgroundColor: color }}
          animate={animateFlame ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Streak Number */}
      <motion.span 
        className="font-bold uppercase tracking-wide drop-shadow-lg select-none"
        style={{ color, textShadow: `0 0 8px ${color}40` }}
        animate={animateFlame ? { y: [-1, 1, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {streak}
      </motion.span>

      {/* Milestone tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl px-3 py-2 rounded-lg text-xs whitespace-nowrap text-white/90 shadow-2xl border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        whileHover={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {rewardName} 🔥
        {streak >= 3 && <span className="ml-1">+50 XP</span>}
        {streak >= 7 && <span className="ml-1">+100 XP</span>}
        {streak >= 30 && <span className="ml-1">Legendary!</span>}
      </motion.div>
    </motion.div>
  );
}

// Higher Order Component for Profile Cards
export function ProfileCardWithStreak({ 
  children, 
  streak, 
  className 
}: { 
  children: React.ReactNode; 
  streak: number; 
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {streak > 0 && (
        <div className="absolute top-4 right-4">
          <StreakBadge streak={streak} size="sm" />
        </div>
      )}
    </div>
  );
}

