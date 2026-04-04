"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Box, LayoutDashboard, LockKeyhole, ShieldCheck, Upload, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const closePanels = () => {
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/10 bg-[#08182a]/80 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <motion.div
          className="cursor-pointer select-none"
          whileHover={{ scale: 1.05, rotate: [0, -2, 0] }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Link href="/" className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg border border-white/20 bg-gradient-to-br from-cyan-300 to-blue-400" />
            <div>
              <p className="font-display text-sm uppercase tracking-[0.28em] text-cyan-200/80">The Cloud</p>
              <p className="font-display text-lg leading-none text-gradient">Rain</p>
            </div>
          </Link>
        </motion.div>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map(({ href, label, icon: Icon }, index) => {
            const active = pathname === href;

            return (
              <motion.div key={href} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
                <Link
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    active
                      ? "border border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                      : "border border-transparent bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <motion.button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
            whileHover={{ scale: 1.08, rotate: 18 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </motion.button>

          <ThemeToggle />

          <Link
            href="/mystery-box"
            className="hidden rounded-full border border-cyan-200/35 bg-gradient-to-r from-cyan-200 to-blue-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:scale-[1.02] md:inline-flex"
          >
            Start Unlocking
          </Link>

          <button
            type="button"
            className="inline-flex rounded-full border border-white/10 bg-white/5 p-2 text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {searchOpen && (
        <motion.div
          className="absolute right-4 top-full mt-2 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/15 bg-[#0f253c]/95 p-4 shadow-2xl md:right-6"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              type="text"
              placeholder="Search files, creators, categories..."
              className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-12 pr-4 text-white/90 placeholder-white/45 focus:border-cyan-300/60 focus:outline-none"
              autoFocus
            />
          </div>
        </motion.div>
      )}

      {mobileOpen && (
        <motion.div
          className="border-t border-white/10 bg-[#0b1f33]/95 px-4 py-4 lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 gap-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closePanels}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                    active
                      ? "border border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                      : "border border-white/10 bg-white/[0.04] text-white/80"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
