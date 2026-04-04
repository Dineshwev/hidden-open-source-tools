"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from 'framer-motion';
import { Search, Box, LayoutDashboard, LockKeyhole, ShieldCheck, Upload } from "lucide-react";
import ThemeToggle from './ThemeToggle';

const links = [

  { href: "/", label: "Home" },
  { href: "/mystery-box", label: "Mystery Box", icon: Box },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/login", label: "Login", icon: LockKeyhole }
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <motion.header 
      className="sticky top-0 z-50 border-b border-white/10 bg-void/80 backdrop-blur-xl shadow-glow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.div
          className="font-display text-xl font-bold tracking-wide text-gradient cursor-pointer select-none hover:scale-105 transition-transform"
          whileHover={{ scale: 1.05, rotate: [0, -2, 0] }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Portfolio Universe
        </motion.div>

        <div className="flex items-center gap-3">
          {/* Search Button */}
          <motion.button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-glow-xs transition-all"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="h-5 w-5" />
          </motion.button>

          {/* Animated Links */}
          <motion.div 
            className="flex flex-wrap items-center gap-2"
            initial={false}
            animate={{ 
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2
              }
            }}
          >
            {links.map(({ href, label, icon: Icon }, index) => {
              const active = pathname === href;

              return (
                <motion.div key={href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
                  <Link
                    href={href}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm group relative overflow-hidden transition-all duration-200 ${
              active
                ? "bg-nebula-500 text-white shadow-glow"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:shadow-glow-sm"
            }`}
                  >
                    {Icon ? <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" /> : null}
                    <span>{label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-1000" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <motion.div 
          className="absolute right-6 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-glow-lg"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              type="text"
              placeholder="Search files, creators, categories..."
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-white/90 placeholder-white/50 backdrop-blur-sm focus:border-nebula-400 focus:outline-none focus:shadow-glow transition-all"
              autoFocus
            />
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
