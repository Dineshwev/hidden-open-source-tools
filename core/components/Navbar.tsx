"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/lib/AuthProvider";

const primaryDesktopLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "No-Cost Resources", isNew: true },
  { href: "/vs", label: "Comparisons" },
  { href: "/alternatives", label: "Alternatives" },
  { href: "/article-museum", label: "Tool Deep Dives", badge: "Featured" },
  { href: "/weekly-roundups", label: "Weekly Roundups" }
];

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "No-Cost Resources", isNew: true },
  { href: "/vs", label: "Comparisons" },
  { href: "/alternatives", label: "Alternatives" },
  { href: "/article-museum", label: "Tool Deep Dives", badge: "Featured" },
  { href: "/weekly-roundups", label: "Weekly Roundups" },
  { href: "/hidden-tools", label: "Developer Utilities" },
  { href: "/contact", label: "Contact" },
  { href: "/general-queries", label: "General Queries" },
  { href: "/upload", label: "Upload" }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (href: string) => {
  if (!pathname) return false;
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

  const closePanels = () => {
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const runSearch = (targetPath: string) => {
    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    closePanels();
    router.push(`${targetPath}?search=${encodeURIComponent(query)}`);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-[color:var(--nav-border)] bg-[var(--nav-bg)] text-[color:var(--nav-text)] backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <motion.div
          className="cursor-pointer select-none"
          whileHover={{ scale: 1.05, rotate: [0, -2, 0] }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Link href="/" className="ml-0 mr-8 flex items-center gap-3 lg:mr-10">
            <Logo size={32} className="rounded-lg shadow-glow-sm" />
            <div className="flex items-center">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.28em] text-[color:var(--nav-muted)]">The Cloud</p>
                <p className="font-display text-lg leading-none text-gradient">Rain</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {primaryDesktopLinks.map(({ href, label, isNew, badge }, index) => {
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
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-all duration-200 ${
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
                  {badge ? (
                    <span className="rounded-full border border-purple-300/45 bg-purple-300/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-100">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              </motion.div>
            );
          })}

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

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] font-semibold text-[color:var(--nav-text)] transition hover:border-[color:var(--nav-pill-border)] hover:bg-[color:var(--nav-pill-hover)]"
              >
                {(user.displayName || user.email || "?")[0].toUpperCase()}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 text-white shadow-2xl"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <span className="text-base text-white">P</span> My Profile
                    </Link>
                    <Link
                      href="/dashboard#downloads"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <span className="text-base text-white">D</span> Downloads
                    </Link>
                    <Link
                      href="/dashboard#settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <span className="text-base text-white">S</span> Settings
                    </Link>
                    <div className="my-1 h-px w-full bg-white/10" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <span className="text-base text-white">X</span> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--nav-border)] bg-transparent text-[color:var(--nav-muted)] transition hover:border-[color:var(--nav-pill-border)] hover:bg-[color:var(--nav-pill-hover)] hover:text-[color:var(--nav-text)]"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

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
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch("/free-tools");
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--nav-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tools or article deep dives..."
                className="w-full rounded-xl border border-[color:var(--nav-input-border)] bg-[color:var(--nav-input-bg)] py-3 pl-12 pr-4 text-[color:var(--nav-text)] placeholder-[color:var(--nav-input-placeholder)] focus:border-[color:var(--nav-pill-border)] focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl border border-[color:var(--nav-pill-border)] bg-[color:var(--nav-pill-active)] px-3 py-2 text-sm text-[color:var(--nav-text)] transition hover:bg-[color:var(--nav-pill-hover)]"
              >
                Search tools
              </button>
              <button
                type="button"
                onClick={() => runSearch("/article-museum")}
                className="flex-1 rounded-xl border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] px-3 py-2 text-sm text-[color:var(--nav-text)] transition hover:bg-[color:var(--nav-pill-hover)]"
              >
                Search articles
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {mobileOpen && (
        <motion.div
          className="border-t border-[color:var(--nav-border)] bg-[var(--nav-dropdown-bg)] px-4 py-4 lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 gap-2">
            {mobileLinks.map(({ href, label, isNew, badge }) => {
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
                  {badge ? (
                    <span className="ml-auto rounded-full border border-purple-300/45 bg-purple-300/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-100">
                      {badge}
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
