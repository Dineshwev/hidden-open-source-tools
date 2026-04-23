import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Weekly Roundups | Free Developer Tools and Open Source Picks",
  description:
    "Weekly curated roundup of free developer tools, open source software, and hidden gems from The Cloud Rain.",
  keywords: [
    "weekly developer tools roundup",
    "open source weekly picks",
    "free tools weekly",
    "developer resources updates"
  ],
  alternates: {
    canonical: "/weekly-roundups"
  },
  openGraph: {
    title: "Weekly Roundups | Free Developer Tools and Open Source Picks",
    description:
      "Explore fresh weekly picks across free developer tools, open source software, and hidden productivity resources.",
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
      name: "Weekly Roundups",
      item: `${siteUrl}/weekly-roundups`
    }
  ]
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Weekly Roundups",
  url: `${siteUrl}/weekly-roundups`,
  description:
    "Editorial weekly roundups covering free developer tools, open source software, and hidden workflow picks.",
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
    summary: "Open source productivity stack, free UI kits, and underrated workflow tools for faster shipping."
  },
  {
    href: "/weekly-roundups/2026-04-03",
    title: "Weekly Roundup - April 3, 2026",
    summary: "Hidden dev utilities, AI helpers, and free template picks for frontend and SaaS builders."
  },
  {
    href: "/weekly-roundups/2026-03-27",
    title: "Weekly Roundup - March 27, 2026",
    summary: "Best free developer tools this week with practical categories and quick-start recommendations."
  }
];

export default function WeeklyRoundupsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Weekly Roundups</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Fresh weekly picks for developers</h1>
        <p className="max-w-3xl text-white/70">
          Each week we publish curated picks across open source software, free tools, and hidden gems so you can discover high-value resources faster.
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
          discover free tools, open source software, and hidden utilities through short practical summaries instead of
          only raw listings. That makes the site more useful for comparison, recurring discovery, and intent-based browsing.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/free-tools" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Browse Free Tools
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Hidden Tools
          </Link>
          <Link href="/best-free-developer-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Best Free Developer Tools
          </Link>
        </div>
      </section>
    </div>
  );
}


