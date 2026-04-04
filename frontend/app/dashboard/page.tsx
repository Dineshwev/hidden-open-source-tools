"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Upload, Eye, Award, Flame, Download, ArrowRight } from 'lucide-react';
import LevelBadge from '@/components/LevelBadge';
import StreakBadge from '@/components/StreakBadge';
import AdSmartlinkSlot from '@/components/AdSmartlinkSlot';

const stats = [
  { name: 'Uploads', value: 247, change: '+12%', icon: Upload, color: 'emerald' },
  { name: 'Downloads', value: 12.4, unit: 'k', change: '+28%', icon: Download, color: 'blue' },
  { name: 'Views', value: 89.2, unit: 'k', change: '+15%', icon: Eye, color: 'purple' },
  { name: 'Likes', value: 2.1, unit: 'k', change: '+8%', icon: 'heart', color: 'pink' },
];

const recentUploads = [
  { name: 'Neon UI Icons Pack', downloads: 456, status: 'approved' as const },
  { name: 'Cyberpunk Shader GLSL', downloads: 234, status: 'pending' as const },
  { name: 'Holographic Dashboard', downloads: 178, status: 'approved' as const },
  { name: 'Space Nebula Generator', downloads: 89, status: 'rejected' as const },
];

export default function CreatorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-void via-[#0a0f23] to-[#1a0a2a]">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nebula-500 p-3 shadow-glow-lg">
                <Image src="/avatar.jpg" alt="Profile" width={56} height={56} className="w-full h-full rounded-xl object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-aurora to-nebula-400 bg-clip-text text-transparent">
                  Alex Rivera
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <LevelBadge currentXP={8470} size="sm" />
                  <StreakBadge streak={14} size="sm" animateFlame />
                  <div className="text-sm text-white/60 font-mono">ID: CR-2471</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-nebula-500 to-aurora text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all">
                New Upload
              </motion.button>
              <motion.button className="px-6 py-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all">
                View Analytics
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <motion.section className="mb-12">
          <motion.h2 
            className="text-2xl font-bold mb-8 bg-gradient-to-r from-white via-aurora to-nebula-400 bg-clip-text text-transparent flex items-center gap-3"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <BarChart3 className="h-8 w-8" />
            Platform Stats
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.name}
                className="depth-panel group p-8 rounded-3xl border border-white/10 hover:shadow-glow-lg transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${stat.color}-500 flex items-center justify-center mb-6 shadow-glow group-hover:shadow-glow-lg transition-all mx-auto`}>
                  <stat.icon className={`h-8 w-8 text-white drop-shadow-lg ${stat.icon === 'heart' ? 'fill-current' : ''}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-2 text-center">
                  {stat.value}
                  {stat.unit}
                </div>
                <div className="text-lg font-semibold text-white/90 text-center mb-4">
                  {stat.name}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-green-400 font-mono">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="mb-12">
          <AdSmartlinkSlot
            title="Dashboard Sponsor Slot"
            description="Creator-focused sponsor campaigns run here to keep analytics and unlock tools free."
            cta="Check Sponsored Tool"
            compact
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* XP Progress */}
          <motion.section className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              XP Progress
            </h3>
            <div className="space-y-6">
              <LevelBadge currentXP={8470} size="lg" showProgress />
              <div className="text-sm text-white/60 space-y-2">
                <div>Next Level: 5,000 XP (1,530 left)</div>
                <div>Daily Goal: 100 XP</div>
              </div>
              <motion.button className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold shadow-glow hover:shadow-glow-lg transition-all">
                Earn XP Today
              </motion.button>
            </div>
          </motion.section>

          {/* Recent Uploads */}
          <motion.section className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-white flex-1">Recent Uploads</h3>
              <div className="text-sm text-white/60">Last 30 days</div>
            </div>
            <div className="space-y-4">
              {recentUploads.map((upload, index) => (
                <motion.div
                  key={upload.name}
                  className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-3 h-16 rounded-lg flex-shrink-0 bg-gradient-to-b ${
                    upload.status === 'approved' ? 'from-emerald-500 to-emerald-600' 
                    : upload.status === 'pending' ? 'from-amber-500 to-amber-600'
                    : 'from-red-500 to-red-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate mb-1 group-hover:text-nebula-400 transition-colors">
                      {upload.name}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{upload.downloads} downloads</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        upload.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' 
                        : upload.status === 'pending' ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                        {upload.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-auto">
                    <div className="text-2xl font-bold text-emerald-400">{upload.downloads}</div>
                    <div className="text-xs text-white/50">dls</div>
                  </div>
                  <motion.div 
                    className="opacity-0 group-hover:opacity-100 ml-4 flex-shrink-0 transition-all"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  >
                    <ArrowRight className="h-5 w-5 text-white/70" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Quick Actions */}
        <motion.section className="mt-12 pt-12 border-t border-white/10">
          <h3 className="text-xl font-bold mb-8 bg-gradient-to-r from-white via-aurora to-nebula-400 bg-clip-text text-transparent">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Upload, label: 'New Upload', href: '/upload' },
              { icon: BarChart3, label: 'Analytics', href: '#' },
              { icon: TrendingUp, label: 'Leaderboard', href: '/leaderboard' },
              { icon: Award, label: 'Achievements', href: '/achievements' },
              { icon: Flame, label: 'Streak Challenge', href: '/streak' },
            ].map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:shadow-glow-lg transition-all h-32 justify-between"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -8 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-nebula-500 flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-white text-center group-hover:text-nebula-400 transition-colors">
                  {action.label}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

