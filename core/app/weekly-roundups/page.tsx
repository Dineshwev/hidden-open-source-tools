import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "Weekly Open Source Tool Roundups for Developers and DevOps",
  description:
    "Read weekly curated briefs on open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives for engineering teams.",
  keywords: [
    "weekly developer tool roundup",
    "open source tool discoveries",
    "self-hosted software updates"
  ],
  alternates: {
    canonical: "/weekly-roundups"
  },
  openGraph: {
    title: "Weekly Open Source Tool Roundups for Developers and DevOps",
    description:
      "Read weekly curated briefs on open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives for engineering teams.",
    url: `${siteUrl}/weekly-roundups`
  }
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
      name: "Weekly Tool Briefs",
      item: `${siteUrl}/weekly-roundups`
    }
  ]
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Weekly Tool Briefs",
  url: `${siteUrl}/weekly-roundups`,
  description:
    "Editorial weekly briefs covering open-source developer tools, self-hosted software, and lightweight workflow alternatives.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  }
};

const roundupItems = [
  {
    href: "/weekly-roundups/2026-04-10",
    title: "Weekly Roundup - April 10, 2026",
    summary: "Open-source productivity stack, self-hosted utilities, and practical workflow tools for faster shipping."
  },
  {
    href: "/weekly-roundups/2026-04-03",
    title: "Weekly Roundup - April 3, 2026",
    summary: "Lesser-known developer utilities, AI helpers, and lightweight infrastructure picks for builders."
  },
  {
    href: "/weekly-roundups/2026-03-27",
    title: "Weekly Roundup - March 27, 2026",
    summary: "Developer tool picks this week with practical categories and quick-start recommendations."
  }
];

export default function WeeklyRoundupsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Weekly Tool Briefs</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Weekly open-source tool briefs for developers</h1>
        <p className="max-w-3xl text-white/70">
          Each week we publish curated picks across open-source software, self-hosted utilities, and lightweight SaaS alternatives so engineering teams can evaluate useful resources faster.
        </p>
      </header>

      <section className="space-y-4">
        {roundupItems.map((item) => (
          <article key={item.href} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-white/70">{item.summary}</p>
            <Link href={item.href} className="mt-4 inline-flex rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900">
              Read Roundup
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-2xl text-white">How these roundups help discovery</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          Weekly roundups give The Cloud Rain an editorial layer on top of the main directory. They help developers
          discover open-source software, no-cost resources, and developer utilities through short practical summaries instead of
          only raw listings. That makes the site more useful for comparison, recurring discovery, and intent-based browsing.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/free-tools" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Browse No-Cost Resources
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Developer Utilities
          </Link>
          <Link href="/best-free-developer-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Developer Tool Comparisons
          </Link>
        </div>
      </section>
    </div>
  );
}


