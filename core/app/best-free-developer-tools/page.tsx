import { getSiteUrl } from "@/lib/site-url";
import { BEST_TOOL_GUIDES } from "@/lib/best-guides";
import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Best Open-Source Developer Tools & Buyer Guides (2026)",
  description:
    "Browse curated 2026 open-source software buyer guides grouped by use case: CRM, project management, DevOps monitoring, homelab, AI tools, authentication, internal tools, and automation.",
  alternates: {
    canonical: "/best-free-developer-tools"
  },
  openGraph: {
    title: "Best Open-Source Developer Tools & Buyer Guides (2026)",
    description:
      "Browse curated 2026 open-source software buyer guides grouped by CRM, project management, DevOps monitoring, homelab, AI tools, and automation.",
    url: `${siteUrl}/best-free-developer-tools`
  }
};

const toolGroups = [
  {
    title: "Self-Hosting and Infrastructure",
    summary: "Open-source infrastructure tools for deployment, orchestration, and platform operations.",
    bestFor: "Teams migrating away from hosted SaaS infrastructure"
  },
  {
    title: "AI and Automation",
    summary: "No-cost AI-assisted tools for writing, refactoring, generation, and workflow acceleration.",
    bestFor: "Boilerplate generation, docs, and repetitive coding tasks"
  },
  {
    title: "Analytics and Search",
    summary: "Tools for logs, dashboards, metrics, observability, and search workflows.",
    bestFor: "Teams improving product insight and operational visibility"
  },
  {
    title: "Lesser-Known Productivity Tools",
    summary: "Lesser-known utilities that remove friction from daily developer work.",
    bestFor: "Teams looking for workflow gains beyond mainstream toolsets"
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  headline: "Best Open-Source Developer Tools & Buyer Guides (2026)",
  description:
    "Curated 2026 buyer guides for open-source software across CRM, project management, DevOps monitoring, homelab, AI engineering, authentication, internal tools, and workflow automation.",
  datePublished: "2026-04-10",
  dateModified: "2026-11-16",
  author: {
    "@type": "Organization",
    name: "The Cloud Rain"
  },
  publisher: {
    "@type": "Organization",
    name: "The Cloud Rain",
    url: siteUrl
  },
  mainEntityOfPage: `${siteUrl}/best-free-developer-tools`,
  hasPart: BEST_TOOL_GUIDES.map((guide, idx) => ({
    "@type": "Article",
    position: idx + 1,
    headline: guide.title,
    description: guide.summary,
    url: `${siteUrl}${guide.href}`
  }))
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Best Open-Source Tool Guides",
      item: `${siteUrl}/best-free-developer-tools`
    }
  ]
};

export default function BestFreeDeveloperToolsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">2026 Buyer Guides & Stack Comparisons</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Best Open-Source Tools by Use Case</h1>
        <p className="max-w-3xl text-white/70">
          Explore our curated buyer guides comparing self-hostable open-source software across CRM, DevOps monitoring, AI engineering, authentication, internal tools, and workflow automation.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-white">Curated Best-of Open-Source Guides</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BEST_TOOL_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={guide.href}
              className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-cyan-400/35 hover:bg-white/[0.06]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {guide.category}
                  </span>
                  <span className="text-xs font-semibold text-cyan-300 transition group-hover:translate-x-0.5">
                    Read Guide →
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-white transition group-hover:text-cyan-300">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {guide.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <span className="text-white/45 shrink-0">Recommended Stack:</span>
                <span className="text-cyan-200 font-medium truncate">{guide.topTools}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {toolGroups.map((group) => (
          <article key={group.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl text-white">{group.title}</h2>
            <p className="mt-2 text-sm text-white/70">{group.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-200/80">Best for</p>
            <p className="mt-1 text-sm text-white/60">{group.bestFor}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-emerald-300/20 bg-gradient-to-r from-[#0f2f2c] to-[#153f4a] p-8">
        <h2 className="text-2xl text-white">Explore matching resources</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/free-tools" className="rounded-full bg-emerald-300 px-5 py-2 text-sm font-semibold text-slate-900">
            No-Cost Resources
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Open Source Alternatives
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Developer Utilities
          </Link>
        </div>
      </section>
    </div>
  );
}
