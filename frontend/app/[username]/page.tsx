"use client";

import { motion } from 'framer-motion';
import { User, Crown, Download, Heart, Eye, MessageCircle, Clock, Award, TrendingUp } from 'lucide-react';
import LevelBadge from '@/components/LevelBadge';
import StreakBadge from '@/components/StreakBadge';
import FileCard from '@/components/FileCard';

const creatorData = {
  name: 'Alex Rivera',
  handle: '@alexriv',
  avatar: '/avatar-alex.jpg',
  bio: 'Cyberpunk UI specialist | 3D artist | 500+ neon assets',
  level: 24,
  xp: 8470,
  streak: 14,
  followers: 1247,
  following: 89,
  stats: {
    uploads: 247,
    downloads: 12400,
    likes: 2100,
    views: 89200,
  }
};

const uploads = [
  { title: 'Neon UI Icons Pack', downloads: 456, likes: 89, thumbnail: '/thumb1.jpg' },
  { title: 'Cyberpunk Shader GLSL', downloads: 234, likes: 67, thumbnail: '/thumb2.jpg' },
  { title: 'Holographic HUD Kit', downloads: 178, likes: 145, thumbnail: '/thumb3.jpg' },
];

const achievements = [
  { name: '100 Uploads', icon: Crown, date: 'Mar 2024', rarity: 'gold' as const },
  { name: 'Top 1%', icon: TrendingUp, date: 'Feb 2024', rarity: 'silver' as const },
  { name: '30 Day Streak', icon: 'flame', date: 'Jan 2024', rarity: 'bronze' as const },
];

const activity = [
  { type: 'upload', title: 'Neon Icons Pack approved', time: '2h ago', icon: Download },
  { type: 'like', title: 'Shader got 50 likes', time: '1d ago', icon: Heart },
  { type: 'download', title: 'HUD kit downloaded 25x', time: '2d ago', icon: Eye },
  { type: 'follow', title: 'Luna Voss followed you', time: '3d ago', icon: User },
];

export default function CreatorProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-void via-[#0a0f23] to-[#1a0a2a]">
      {/* Hero Section */}
      <motion.section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-nebula-500/10 via-transparent to-black/50" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-8">
              <div className="relative">
                <img 
                  src={creatorData.avatar} 
                  alt={creatorData.name}
                  className="w-32 h-32 rounded-3xl object-cover shadow-2xl shadow-black/50 ring-4 ring-white/20"
                />
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-emerald-500 rounded-2xl p-2 shadow-glow-lg ring-2 ring-black/30 -translate-x-2 translate-y-2">
                  <StreakBadge streak={creatorData.streak} size="sm" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-aurora to-nebula-400 bg-clip-text text-transparent mb-6">
              {creatorData.name}
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              {creatorData.bio}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center items-center mb-12">
              <LevelBadge currentXP={creatorData.xp} size="lg" />
              <div className="flex items-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="text-lg font-semibold text-white">{creatorData.followers}</span>
                  followers
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span className="text-lg font-semibold text-white">{creatorData.stats.likes.toLocaleString()}</span>
                  likes
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button className="px-12 py-4 rounded-3xl bg-gradient-to-r from-nebula-500 to-aurora text-white font-bold text-lg shadow-glow-lg hover:shadow-glow-xl transition-all px-8 py-4">
                Follow
              </motion.button>
              <motion.button className="px-12 py-4 rounded-3xl border-2 border-white/30 bg-white/5 backdrop-blur-xl text-white font-bold text-lg hover:bg-white/10 transition-all">
                View Portfolio
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-6 pb-24 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats */}
          <motion.section className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Stats
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Uploads', value: creatorData.stats.uploads, icon: Download, color: 'emerald' },
                { label: 'Downloads', value: creatorData.stats.downloads.toLocaleString(), icon: Eye, color: 'blue' },
                { label: 'Likes', value: creatorData.stats.likes.toLocaleString(), icon: Heart, color: 'pink' },
                { label: 'Views', value: creatorData.stats.views.toLocaleString(), icon: 'eye', color: 'purple' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r from-${stat.color}-500 shadow-glow-sm w-12 h-12 flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60 capitalize">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Uploaded Content */}
          <motion.section className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-2xl font-bold text-white flex-1">Uploads</h3>
              <div className="text-sm text-white/60">247 items</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((upload, index) => (
                <motion.div
                  key={upload.title}
                  className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-glow-sm hover:shadow-glow-lg cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative h-64 rounded-3xl overflow-hidden">
                    <img 
                      src={upload.thumbnail} 
                      alt={upload.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="font-bold text-white text-lg mb-2 line-clamp-1">{upload.title}</h4>
                      <div className="flex items-center gap-6 text-sm text-white/80">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {upload.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 fill-current" />
                          145
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section className="mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Achievements */}
            <section>
              <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                <Award className="h-8 w-8" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.name}
                    className={`p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:shadow-glow-lg transition-all ${
                      achievement.rarity === 'gold' ? 'bg-yellow-500/10' 
                      : achievement.rarity === 'silver' ? 'bg-gray-500/10' 
                      : 'bg-emerald-500/10'
                    }`}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow-sm flex-shrink-0 ${
                      achievement.rarity === 'gold' ? 'bg-yellow-500' 
                      : achievement.rarity === 'silver' ? 'bg-gray-500' 
                      : 'bg-emerald-500'
                    }`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{achievement.name}</h4>
                      <div className="text-sm text-white/70 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {achievement.date}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Activity Timeline */}
            <section>
              <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-sm ${
                      item.type === 'upload' ? 'bg-emerald-500' 
                      : item.type === 'like' ? 'bg-pink-500'
                      : item.type === 'download' ? 'bg-blue-500'
                      : 'bg-purple-500'
                    }`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 group-hover:text-nebula-400 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-sm text-white/60 flex items-center gap-2">
                        <div className="w-2 h-2 bg-white/50 rounded-full" />
                        {item.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

