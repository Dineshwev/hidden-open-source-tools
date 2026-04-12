"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, LockKeyhole, Menu, X, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const primaryDesktopLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "Free Tools", isNew: true },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/dashboard", label: "Dashboard" }
];

const communityLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/general-queries", label: "General Queries" },
  { href: "/upload", label: "Upload" }
];

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "Free Tools", isNew: true },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" },
  { href: "/general-queries", label: "General Queries" },
  { href: "/upload", label: "Upload" },
  { href: "/login", label: "Login" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const communityActive = communityLinks.some((item) => isActive(item.href));

  const closePanels = () => {
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-[color:var(--nav-border)] bg-[var(--nav-bg)] text-[color:var(--nav-text)] backdrop-blur-xl"
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
            <Logo size={32} className="rounded-lg shadow-glow-sm" />
            <div className="flex items-center">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.28em] text-[color:var(--nav-muted)]">The Cloud</p>
                <p className="font-display text-lg leading-none text-gradient">Rain</p>
              </div>
              <span className="ml-3 whitespace-nowrap rounded-full border border-green-500/30 px-2 py-0.5 text-[10px] font-medium text-green-400">
                Free & Open Source
              </span>
            </div>
          </Link>
        </motion.div>

        <div className="hidden items-center gap-2 lg:flex">
          {primaryDesktopLinks.map(({ href, label, isNew }, index) => {
            const active = isActive(href);

            return (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    active
                      ? "border border-[color:var(--nav-pill-border)] bg-[color:var(--nav-pill-active)] text-[color:var(--nav-text)]"
                      : "border border-transparent bg-[color:var(--nav-pill-bg)] text-[color:var(--nav-muted)] hover:border-[color:var(--nav-border)] hover:bg-[color:var(--nav-pill-hover)] hover:text-[color:var(--nav-text)]"
                  }`}
                >
                  <span>{label}</span>
                  {isNew ? (
                    <span className="rounded-full border border-cyan-300/45 bg-cyan-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                      New
                    </span>
                  ) : null}
                </Link>
              </motion.div>
            );
          })}

          <motion.div
            className="group relative"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + primaryDesktopLinks.length * 0.05 }}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                communityActive
                  ? "border border-[color:var(--nav-pill-border)] bg-[color:var(--nav-pill-active)] text-[color:var(--nav-text)]"
                  : "border border-transparent bg-[color:var(--nav-pill-bg)] text-[color:var(--nav-muted)] hover:border-[color:var(--nav-border)] hover:bg-[color:var(--nav-pill-hover)] hover:text-[color:var(--nav-text)]"
              }`}
            >
              <span>Community</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-[color:var(--nav-border)] bg-[var(--nav-dropdown-bg)] p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-1 group-hover:opacity-100">
              {communityLinks.map(({ href, label }) => {
                const active = isActive(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`mb-1 flex items-center rounded-xl px-3 py-2 text-sm last:mb-0 ${
                      active
                        ? "bg-[color:var(--nav-pill-active)] text-[color:var(--nav-text)]"
                        : "text-[color:var(--nav-muted)] hover:bg-[color:var(--nav-pill-hover)] hover:text-[color:var(--nav-text)]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <motion.button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] p-2 text-[color:var(--nav-text)] transition-all hover:bg-[color:var(--nav-pill-hover)]"
            whileHover={{ scale: 1.08, rotate: 18 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </motion.button>

          <ThemeToggle />

          <Link
            href="/login"
            className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition lg:inline-flex ${
              isActive("/login")
                ? "border-[color:var(--nav-pill-border)] bg-[color:var(--nav-pill-active)] text-[color:var(--nav-text)]"
                : "border-[color:var(--nav-border)] bg-transparent text-[color:var(--nav-muted)] hover:border-[color:var(--nav-pill-border)] hover:bg-[color:var(--nav-pill-hover)] hover:text-[color:var(--nav-text)]"
            }`}
          >
            <LockKeyhole className="h-4 w-4" />
            Login
          </Link>

          <button
            type="button"
            className="inline-flex rounded-full border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] p-2 text-[color:var(--nav-text)] lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {searchOpen && (
        <motion.div
          className="absolute right-4 top-full mt-2 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[color:var(--nav-border)] bg-[var(--nav-search-bg)] p-4 shadow-2xl md:right-6"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--nav-muted)]" />
            <input
              type="text"
              placeholder="Search files, creators, categories..."
              className="w-full rounded-xl border border-[color:var(--nav-input-border)] bg-[color:var(--nav-input-bg)] py-3 pl-12 pr-4 text-[color:var(--nav-text)] placeholder-[color:var(--nav-input-placeholder)] focus:border-[color:var(--nav-pill-border)] focus:outline-none"
              autoFocus
            />
          </div>
        </motion.div>
      )}

      {mobileOpen && (
        <motion.div
          className="border-t border-[color:var(--nav-border)] bg-[var(--nav-dropdown-bg)] px-4 py-4 lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 gap-2">
            {mobileLinks.map(({ href, label, isNew }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closePanels}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                    active
                      ? "border border-[color:var(--nav-pill-border)] bg-[color:var(--nav-pill-active)] text-[color:var(--nav-text)]"
                      : "border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] text-[color:var(--nav-muted)]"
                  }`}
                >
                  {label}
                  {isNew ? (
                    <span className="ml-auto rounded-full border border-cyan-300/45 bg-cyan-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                      New
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
