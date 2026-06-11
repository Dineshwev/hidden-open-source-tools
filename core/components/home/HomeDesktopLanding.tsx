"use client";

import Link from "next/link";
import { ArrowRight, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

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

type Tool = {
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
  const faviconUrl = tool.logo_url ?? (() => {
    try {
      const domain = new URL(tool.url).hostname.replace(/^www\./, "");
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch { return null; }
  })();

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1.5">
          {faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faviconUrl} alt={tool.name} className="h-full w-full rounded-lg object-contain" />
          ) : (
            <span className="text-lg font-bold text-white">{tool.name[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white group-hover:text-cyan-300 transition-colors">{tool.name}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">{tool.category}</p>
        </div>
        {(tool.github_stars ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Star className="h-3 w-3" />
            {(tool.github_stars ?? 0) >= 1000 ? `${((tool.github_stars ?? 0) / 1000).toFixed(1)}k` : tool.github_stars}
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-white/55">{stripMarkdown(tool.description ?? "")}</p>
    </Link>
  );
}

export default function HomeDesktopLanding() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [totalCount, setTotalCount] = useState(357);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "What is The Cloud Rain?", a: "A curated directory of 357+ open-source tools, self-hosted software, and free alternatives to expensive SaaS products. Every tool is manually reviewed before being added." },
    { q: "Are all tools completely free?", a: "Most tools are open-source and free to self-host. Some have cloud-hosted versions with free tiers. Always check the individual tool's license before using in production." },
    { q: "How is this different from GitHub Awesome lists?", a: "Awesome lists are link dumps. The Cloud Rain adds structured descriptions, category filtering, tool comparison pages, and deep-dive articles — making discovery and decision-making faster." },
    { q: "How often are new tools added?", a: "New tools are added weekly through a moderated pipeline. You can submit a tool via the upload page if you find something missing." },
    { q: "Can I replace Jira or HubSpot with open-source tools?", a: "Yes. Check the 'Replace Jira' and 'Replace HubSpot' pages under Popular Use Cases for curated lists of open-source alternatives with feature comparisons." },
  ];

  useEffect(() => {
    fetch("/api/home-tools")
      .then((r) => r.json())
      .then((data) => {
        if (data.tools) setTools(data.tools);
        if (data.total) setTotalCount(data.total);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-20">
      <section className="pt-10 pb-4">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-300/80 tracking-wide">
            <Zap className="h-3 w-3" />
            {totalCount}+ curated open-source tools
          </div>
          <h1 className="font-display text-5xl leading-[1.08] tracking-tight text-white lg:text-6xl">
            Open source alternatives<br />
            <span className="text-white/40">to every SaaS you pay for</span>
          </h1>
          <p className="text-lg text-white/55 leading-relaxed max-w-xl">
            A curated directory of free, self-hostable tools for developers. No accounts, no paywalls — just tools.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link href="/free-tools" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200">
              Browse all tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/alternatives" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white">
              Alternatives directory
            </Link>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/35">Browse by category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href="/free-tools" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white">
              {cat.label}
              <span className="text-xs text-white/30">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">Featured tools</p>
          <Link href="/free-tools" className="text-xs text-white/40 transition hover:text-white/70 flex items-center gap-1">
            View all {totalCount} tools <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {tools.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {tools.slice(0, 6).map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
            ))}
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/free-tools" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm text-white/60 transition hover:border-white/30 hover:text-white">
            Browse all {totalCount}+ tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/35">Popular use cases</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Replace Jira", href: "/best-project-management-for-startups" },
            { label: "Replace HubSpot", href: "/best-crm-for-agencies" },
            { label: "Compare tools", href: "/vs" },
            { label: "Find alternatives", href: "/alternatives" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white">
              {item.label}
              <ArrowRight className="h-3.5 w-3.5 opacity-40" />
            </Link>
          ))}
        </div>
      </section>

{/* FAQ Section */}
<section>
  <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/35">FAQ</p>
  <div className="divide-y divide-white/8">
    {faqs.map((faq, i) => (
      <div key={i} className="py-4">
        <button
          type="button"
          onClick={() => setOpenFaq(openFaq === i ? null : i)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span className="text-sm font-medium text-white/80">{faq.q}</span>
          <span className="text-lg text-white/40 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
        </button>
        {openFaq === i && (
          <p className="mt-3 text-sm leading-relaxed text-white/50">{faq.a}</p>
        )}
      </div>
    ))}
  </div>
</section>

    </div>
  );
}