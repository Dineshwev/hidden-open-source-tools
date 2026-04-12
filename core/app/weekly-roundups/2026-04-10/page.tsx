import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const pagePath = "/weekly-roundups/2026-04-10";

export const metadata: Metadata = {
  title: "Weekly Developer Tools Roundup - April 10, 2026",
  description:
    "This week's curated roundup of free developer tools, open source software, and hidden workflow gems.",
  alternates: {
    canonical: pagePath
  },
  openGraph: {
    title: "Weekly Developer Tools Roundup - April 10, 2026",
    description:
      "Curated weekly picks: free tools, open source software, and hidden gems for practical development workflows.",
    url: `${siteUrl}${pagePath}`
  }
};

const picks = [
  {
    title: "Open source collaboration platform",
    note: "Strong for teams needing self-hosted project and code collaboration workflows."
  },
  {
    title: "Free SSL and security validators",
    note: "Useful for deployment checks, certificate monitoring, and basic security hygiene."
  },
  {
    title: "Underrated productivity utilities",
    note: "Small tools that remove repetitive friction in build and release workflows."
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Weekly Developer Tools Roundup - April 10, 2026",
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
  mainEntityOfPage: `${siteUrl}${pagePath}`
};

export default function WeeklyRoundup20260410Page() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Weekly Roundup</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">April 10, 2026: Free tools and open source picks</h1>
        <p className="text-white/70">A practical weekly shortlist of useful software discoveries for developers.</p>
      </header>

      <section className="space-y-4">
        {picks.map((pick) => (
          <article key={pick.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl text-white">{pick.title}</h2>
            <p className="mt-2 text-sm text-white/70">{pick.note}</p>
          </article>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/free-tools" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900">Browse Free Tools</Link>
        <Link href="/open-source-software" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Open Source Software</Link>
        <Link href="/weekly-roundups" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">All Weekly Roundups</Link>
      </div>
    </div>
  );
}


