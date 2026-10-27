"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Menu, X, PlusCircle } from "lucide-react";
import Logo from "./Logo";

const primaryDesktopLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "Explore Tools" },
  { href: "/alternatives", label: "Alternatives" },
  { href: "/vs", label: "Comparisons" },
  { href: "/article-museum", label: "Articles" },
  { href: "/weekly-roundups", label: "Roundups" },
];

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "Explore Tools" },
  { href: "/alternatives", label: "SaaS Alternatives" },
  { href: "/vs", label: "Head-to-Head Comparisons" },
  { href: "/article-museum", label: "Deep-Dive Articles" },
  { href: "/weekly-roundups", label: "Weekly Roundups" },
  { href: "/contact", label: "Contact" },
  { href: "/upload", label: "Submit a Tool" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const runSearch = (targetPath: string = "/free-tools") => {
    const query = searchQuery.trim();
    closePanels();
    if (query) {
      router.push(`${targetPath}?search=${encodeURIComponent(query)}`);
    } else {
      router.push(targetPath);
    }
  };

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-[color:var(--nav-border)] bg-[var(--nav-bg)] text-[color:var(--nav-text)] backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 md:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Logo size={30} className="rounded-lg shadow-glow-sm" />
          <div className="flex flex-col">
            <span className="font-display text-[11px] uppercase tracking-[0.26em] text-[color:var(--nav-muted)]">
              The Cloud
            </span>
            <span className="font-display text-base font-bold leading-none text-gradient">
              Rain
            </span>
          </div>
        </Link>

        {/* Desktop Primary Nav Links */}
        <div className="hidden items-center gap-1 lg:flex xl:gap-2">
          {primaryDesktopLinks.map(({ href, label }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-medium transition-all duration-200 ${
                  active
                    ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 font-semibold"
                    : "border border-transparent text-[color:var(--nav-muted)] hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons: Search, Submit Tool, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 rounded-full border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] px-3 py-1.5 text-xs text-[color:var(--nav-muted)] transition-all hover:border-cyan-400/30 hover:bg-white/5 hover:text-white"
            aria-label="Search directory"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/40">
              ⌘K
            </kbd>
          </button>

          {/* Submit Tool Button */}
          <Link
            href="/upload"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-400/20 hover:text-white"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Submit Tool</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="inline-flex rounded-full border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] p-2 text-[color:var(--nav-text)] lg:hidden transition hover:bg-white/10"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* ── Search Dropdown Panel ── */}
      {searchOpen && (
        <motion.div
          className="absolute right-4 top-full mt-2 w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-[color:var(--nav-border)] bg-[var(--nav-search-bg)] p-4 shadow-2xl md:right-8"
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch("/free-tools");
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tools by name, category, or SaaS (e.g. Supabase, Jira)..."
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/40 focus:border-cyan-400/60 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2 text-xs">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Search Directory
              </button>
              <button
                type="button"
                onClick={() => runSearch("/article-museum")}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Search Articles
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── Mobile Navigation Drawer ── */}
      {mobileOpen && (
        <motion.div
          className="border-t border-[color:var(--nav-border)] bg-[var(--nav-dropdown-bg)] px-4 py-4 lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Quick Search inside Mobile Menu */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch("/free-tools");
            }}
            className="mb-4 relative"
          >
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 375+ tools..."
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-white/40 focus:border-cyan-400/60 focus:outline-none"
            />
          </form>

          <div className="grid grid-cols-1 gap-1.5">
            {mobileLinks.map(({ href, label }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closePanels}
                  className={`inline-flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium transition ${
                    active
                      ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex justify-center">
            <Link
              href="/upload"
              onClick={closePanels}
              className="w-full text-center rounded-xl bg-cyan-400 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              + Submit Open-Source Tool
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
