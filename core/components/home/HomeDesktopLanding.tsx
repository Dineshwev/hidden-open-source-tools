"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, Zap, Search, ShieldCheck, DollarSign, Cpu, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import SaaSTaxCalculator from "./SaaSTaxCalculator";

const CATEGORIES = [
  { label: "Developer Tools", slug: "developer-tools", count: 116 },
  { label: "Self-Hosting", slug: "self-hosting-infrastructure", count: 58 },
  { label: "Analytics & Search", slug: "analytics-search", count: 41 },
  { label: "Media & Utilities", slug: "media-utilities", count: 44 },
  { label: "Productivity", slug: "productivity", count: 39 },
  { label: "Security", slug: "security", count: 17 },
  { label: "Business Tools", slug: "business-tools", count: 12 },
  { label: "Community", slug: "community-events", count: 16 },
];

export const SAAS_REPLACEMENTS = [
  {
    saas: "Notion",
    replaces: "Docs, wikis & notes",
    osAlt: "AppFlowy, Memos",
    href: "/alternatives/notion",
    icon: "📝"
  },
  {
    saas: "Firebase",
    replaces: "Backend & database",
    osAlt: "Supabase, PocketBase",
    href: "/alternatives/firebase",
    icon: "🔥"
  },
  {
    saas: "Jira / Linear",
    replaces: "Issue & project tracking",
    osAlt: "Plane",
    href: "/alternatives/jira",
    icon: "📋"
  },
  {
    saas: "Google Analytics",
    replaces: "Web & traffic analytics",
    osAlt: "Plausible, Umami",
    href: "/alternatives/google-analytics",
    icon: "📊"
  },
  {
    saas: "Airtable",
    replaces: "Databases & spreadsheets",
    osAlt: "NocoDB",
    href: "/alternatives/airtable",
    icon: "🗃️"
  },
  {
    saas: "Heroku / Vercel",
    replaces: "Cloud application PaaS",
    osAlt: "Coolify",
    href: "/alternatives/heroku",
    icon: "⚡"
  },
  {
    saas: "HubSpot",
    replaces: "Customer CRM & sales",
    osAlt: "Twenty",
    href: "/alternatives/hubspot",
    icon: "💼"
  },
  {
    saas: "Algolia",
    replaces: "Fast search API",
    osAlt: "MeiliSearch",
    href: "/alternatives/algolia",
    icon: "🔍"
  },
];

export type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  logo_url: string | null;
  github_stars: number | null;
};

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ToolCard({ tool }: { tool: Tool }) {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const faviconUrl = !imgFailed && domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-500/5"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors group-hover:border-cyan-400/30">
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl}
                  alt={tool.name}
                  onError={() => setImgFailed(true)}
                  className="h-full w-full rounded-lg object-contain"
                />
              ) : (
                <span className="text-base font-bold text-white group-hover:text-cyan-300">
                  {tool.name[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-base font-semibold text-white transition-colors group-hover:text-cyan-300">
                {tool.name}
              </h3>
              <p className="truncate text-xs font-medium text-cyan-300/80 uppercase tracking-wider">
                {tool.category}
              </p>
            </div>
          </div>

          {(tool.github_stars ?? 0) > 0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">
              <Star className="h-3 w-3 fill-amber-300/40 text-amber-300" />
              <span>
                {(tool.github_stars ?? 0) >= 1000
                  ? `${((tool.github_stars ?? 0) / 1000).toFixed(1)}k`
                  : tool.github_stars}
              </span>
            </div>
          )}
        </div>

        <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-white/60">
          {stripMarkdown(tool.description ?? "") || "Curated open-source tool for modern workflows."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/40">
        <span className="truncate max-w-[140px]">{domain || "open-source"}</span>
        <span className="inline-flex items-center gap-1 text-cyan-300 group-hover:translate-x-0.5 transition-transform">
          Details <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

type HomeLandingProps = {
  initialTools?: Tool[];
  initialCount?: number;
};

export default function HomeDesktopLanding({
  initialTools,
  initialCount,
}: HomeLandingProps = {}) {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>(initialTools || []);
  const [totalCount, setTotalCount] = useState(initialCount || 479);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "What is The Cloud Rain?",
      a: `A curated directory of ${totalCount}+ open-source tools, self-hosted software, and free alternatives to expensive SaaS products. Every tool is manually reviewed before being added.`,
    },
    {
      q: "Are all tools completely free?",
      a: "Most tools are open-source and free to self-host. Some offer managed cloud-hosted versions with free tiers. Always check the individual tool's license before deploying in production.",
    },
    {
      q: "How is this different from GitHub Awesome lists?",
      a: "Awesome lists are raw link dumps. The Cloud Rain adds verified star counts, category filtering, SaaS comparison pages, and practical evaluation metrics to help you make decisions faster.",
    },
    {
      q: "How often are new tools added?",
      a: "New tools are added continuously through our review pipeline. You can also submit new tools via the Upload page.",
    },
    {
      q: "Can I replace Jira, Firebase, or HubSpot with open-source tools?",
      a: "Yes. Check the 'Comparisons' and 'Alternatives' pages for side-by-side breakdowns of open-source alternatives like Plane, Supabase, and Twenty with feature comparisons.",
    },
  ];

  useEffect(() => {
    if (initialCount) {
      setTotalCount(initialCount);
    }
    if (!initialTools || initialTools.length === 0) {
      fetch("/api/home-tools")
        .then((r) => r.json())
        .then((data) => {
          if (data.tools && data.tools.length > 0) setTools(data.tools);
          if (data.total) setTotalCount(data.total);
        })
        .catch(() => {});
    }
  }, [initialTools, initialCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/free-tools?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/free-tools");
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ── Hero Section ── */}
      <section className="pt-8 pb-4">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1.5 text-xs text-cyan-300 font-medium tracking-wide">
            <Zap className="h-3.5 w-3.5" />
            <span>{totalCount}+ curated open-source tools & SaaS alternatives</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white">
            Find open source alternatives<br />
            <span className="text-white/40">to every SaaS you pay for</span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl">
            A curated directory of lightweight, privacy-focused open source software and self-hostable tools for developers. No paywalls, no vendor lock-in — just great software.
          </p>

          {/* Interactive Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl">
            <div className="relative flex items-center rounded-2xl border border-white/15 bg-white/[0.04] p-1.5 transition-all focus-within:border-cyan-400/60 focus-within:bg-white/[0.07] focus-within:shadow-lg focus-within:shadow-cyan-500/10">
              <Search className="ml-3.5 h-5 w-5 text-white/40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools or SaaS (e.g. Supabase, Jira, PostHog, Docker)..."
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
              >
                Search
              </button>
            </div>

            {/* Popular Alternatives Quick-Filter Pill Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40 flex items-center gap-1">
                <span>Top SaaS Replacements:</span>
              </span>
              {[
                { name: "Airtable", slug: "airtable", icon: "🗃️" },
                { name: "Jira / Linear", slug: "jira", icon: "📋" },
                { name: "Notion", slug: "notion", icon: "📝" },
                { name: "Zapier", slug: "zapier", icon: "⚡" },
                { name: "Firebase", slug: "firebase", icon: "🔥" },
                { name: "Google Analytics", slug: "google-analytics", icon: "📊" },
                { name: "Heroku / Vercel", slug: "heroku", icon: "🚀" },
                { name: "Datadog", slug: "datadog", icon: "📈" },
                { name: "1Password", slug: "1password", icon: "🔐" },
              ].map((saas) => (
                <Link
                  key={saas.slug}
                  href={`/alternatives/${saas.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
                >
                  <span className="text-xs">{saas.icon}</span>
                  <span>{saas.name}</span>
                  <span className="text-white/30 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
                </Link>
              ))}
              <Link
                href="/alternatives"
                className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/25 transition"
              >
                <span>All Alternatives</span>
                <span>→</span>
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* ── Trust / Value Pillars ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-base font-semibold text-white">$0 Subscriptions</h3>
          <p className="mt-1 text-xs sm:text-sm text-white/60 leading-relaxed">
            Eliminate recurring SaaS bills with battle-tested open-source alternatives and self-hosted deployments.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-base font-semibold text-white">Full Data Ownership</h3>
          <p className="mt-1 text-xs sm:text-sm text-white/60 leading-relaxed">
            Keep sensitive customer data and source code under your control with privacy-first infrastructure.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-base font-semibold text-white">Lightweight & Fast</h3>
          <p className="mt-1 text-xs sm:text-sm text-white/60 leading-relaxed">
            No enterprise bloatware or forced feature gating. Streamlined software designed for builders.
          </p>
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Browse by category</p>
          <Link
            href="/free-tools"
            className="text-xs text-cyan-300 transition hover:text-cyan-200 flex items-center gap-1"
          >
            All categories <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:border-cyan-400/40 hover:bg-white/[0.06] hover:text-white"
            >
              <span>{cat.label}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Tools ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Featured tools</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">Popular Open-Source Gems</h2>
          </div>
          <Link
            href="/free-tools"
            className="text-xs text-white/50 transition hover:text-cyan-300 flex items-center gap-1"
          >
            View all {totalCount} tools <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.slice(0, 6).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/free-tools"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            Browse all {totalCount}+ tools in Directory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Top SaaS to Open-Source Replacements ── */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80 font-semibold">Ditch Vendor Lock-In</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">Popular SaaS Replacements</h2>
          </div>
          <Link
            href="/alternatives"
            className="text-xs text-white/50 transition hover:text-cyan-300 flex items-center gap-1 sm:self-end"
          >
            All SaaS alternatives <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SAAS_REPLACEMENTS.map((item) => (
            <Link
              key={item.saas}
              href={item.href}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.05]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>Replace {item.saas}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="mt-1 text-xs text-white/45">{item.replaces}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">Switch to:</span>
                <span className="text-cyan-200 font-medium">{item.osAlt}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SaaS Tax Savings Calculator ── */}
      <SaaSTaxCalculator />

      {/* ── FAQ Section ── */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Frequently asked questions</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-white mb-6">About The Cloud Rain</h2>
        <div className="divide-y divide-white/10">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left transition hover:text-cyan-300"
              >
                <span className="text-sm sm:text-base font-medium text-white/90">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-white/40 transition-transform duration-200 shrink-0 ${
                    openFaq === i ? "rotate-180 text-cyan-300" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed text-white/60">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
