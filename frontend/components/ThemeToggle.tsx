
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, ChevronLeft } from 'lucide-react';

export default function ThemeToggle({ className = 'ml-auto' }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(localStorage.theme !== 'light' || window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.theme = newTheme ? 'dark' : 'light';
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur-lg shadow-glow-xs hover:border-white/25 hover:bg-white/10 hover:shadow-glow hover:scale-105 transition-all duration-200"
        whileHover={{ scale: 1.05, rotate: 180 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-nebula-500/20 to-aurora/20 blur-sm"
          animate={{ rotate: isOpen ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        />
        {isDark ? <Sun className="h-5 w-5 text-aurora" /> : <Moon className="h-5 w-5 text-ember" />}
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          className="absolute top-full right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 shadow-glow-lg"
        >
          <motion.button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/10 transition-colors"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-nebula-400 p-2 shadow-glow-xs">
              <Sun className="h-6 w-6 text-nebula-100" />
            </div>
            <div>
              <p className="font-medium text-white">Light Mode</p>
              <p className="text-xs text-white/60">Solar interface</p>
            </div>
          </motion.button>
          
          <motion.button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/10 transition-colors mt-2"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-ember/20 p-2 shadow-glow-xs">
              <Moon className="h-6 w-6 text-ember" />
            </div>
            <div>
              <p className="font-medium text-white">Dark Mode</p>
              <p className="text-xs text-white/60">Cyberpunk immersion</p>
            </div>
          </motion.button>
          
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <button
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-white/60 hover:text-white hover:bg-white/5 transition-colors mt-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Close</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
