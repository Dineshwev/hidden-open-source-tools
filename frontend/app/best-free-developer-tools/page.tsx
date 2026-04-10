import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Best Free Developer Tools in 2026",
  description:
    "A practical 2026 guide to the best free developer tools, including open source software, templates, UI kits, and hidden productivity tools.",
  keywords: [
    "best free developer tools",
    "free developer tools 2026",
    "best free software for developers",
    "open source developer tools",
    "hidden developer tools"
  ],
  alternates: {
    canonical: "/best-free-developer-tools"
  },
  openGraph: {
    title: "Best Free Developer Tools in 2026",
    description:
      "Compare top free tools for developers across UI, AI, templates, and productivity workflows.",
    url: `${siteUrl}/best-free-developer-tools`
  }
};

const toolGroups = [
  {
    title: "UI and Frontend",
    summary: "UI kits, component libraries, and visual design helpers for faster frontend shipping.",
    bestFor: "Landing pages, dashboard UIs, and rapid prototyping"
  },
  {
    title: "AI and Automation",
    summary: "Free AI-assisted tools for writing, refactoring, generation, and workflow acceleration.",
    bestFor: "Boilerplate generation, docs, and repetitive coding tasks"
  },
  {
    title: "Templates and Starters",
    summary: "Production-ready starters and templates that reduce setup overhead.",
    bestFor: "Faster project kickoff with cleaner architecture"
  },
  {
    title: "Hidden Productivity Tools",
    summary: "Lesser-known utilities that remove friction from daily developer work.",
    bestFor: "Teams looking for workflow gains beyond mainstream toolsets"
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Free Developer Tools in 2026",
  description:
    "A practical comparison page for free developer tools across open source software, templates, AI tools, and hidden gems.",
  datePublished: "2026-04-10",
  dateModified: "2026-04-10",
  author: {
    "@type": "Organization",
    name: "The Cloud Rain"
  },
  publisher: {
    "@type": "Organization",
    name: "The Cloud Rain",
    url: siteUrl
  },
  mainEntityOfPage: `${siteUrl}/best-free-developer-tools`
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
      name: "Best Free Developer Tools",
      item: `${siteUrl}/best-free-developer-tools`
    }
  ]
};

export default function BestFreeDeveloperToolsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Comparison Guide</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Best free developer tools in 2026</h1>
        <p className="max-w-3xl text-white/70">
          This comparison page helps developers quickly choose high-value free tools by category, including open source options and hidden software gems.
        </p>
      </header>

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
            Free Tools Library
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Open Source Software
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Hidden Tools
          </Link>
        </div>
      </section>
    </div>
  );
}
