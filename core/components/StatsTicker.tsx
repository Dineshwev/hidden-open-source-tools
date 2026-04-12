"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Download, Sparkles } from 'lucide-react';

const stats = [
  { label: 'Files Unlocked', value: 24873, icon: Download, suffix: 'k', color: 'nebula-400' },
  { label: 'Active Creators', value: 1274, icon: Users, suffix: '', color: 'aurora' },
  { label: 'Mystery Drops', value: 892, icon: Sparkles, suffix: 'k', color: 'ember' },
  { label: 'Avg Rating', value: 4.78, icon: TrendingUp, suffix: '/5', color: 'neon-green' },
];

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  suffix: string;
  color: string;
  index: number;
}

function StatCard({ label, value, icon: Icon, suffix, color, index }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 2000;
        const start = Date.now();
        const startValue = 0;
        
        const animate = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setDisplayValue(Math.floor(startValue + (value - startValue) * easeProgress));
          
          if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="depth-panel group rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-glow transition-all hover:-translate-y-3"
    >
      <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-${color}/20 to-transparent p-4 shadow-glow-xs`}>
        <Icon className="h-12 w-12 text-white/60 group-hover:text-white/90 transition-colors" />
      </div>
      <motion.div
        className="text-3xl font-bold text-gradient bg-clip-text leading-none md:text-4xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
      >
        {displayValue.toLocaleString()}
        <span className="text-lg font-normal text-white/60">{suffix}</span>
      </motion.div>
      <p className="mt-3 text-sm uppercase tracking-[0.25em] text-white/50">{label}</p>
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
    </motion.div>
  );
}

export default function StatsTicker() {
  return (
    <section className="depth-stage py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-aurora to-nebula-400 bg-clip-text text-transparent">
            Live Platform Metrics
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-nebula-400 to-ember" />
        </motion.div>
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}


