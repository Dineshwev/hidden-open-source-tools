import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveHomePage from "@/components/home/ResponsiveHomePage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "The Cloud Rain | Hidden Open Source Tools",
  description:
    "Discover 250+ curated open-source tools, self-hosted software, and lightweight developer utilities to replace SaaS and speed development.",
  keywords: [
    "free open source tools",
    "self-hosted alternatives",
    "SaaS replacements",
    "developer tools",
    "open source utilities",
    "self-hosted software directory",
    "open source directory",
    "no-cost resources"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "The Cloud Rain | Hidden Open Source Tools",
    description:
      "Discover powerful, lesser-known open source tools — free alternatives to expensive software.",
    url: "https://www.thecloudrain.org",
    siteName: "The Cloud Rain",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Hidden Open Source Tools",
    description:
      "Discover powerful, lesser-known open source tools — free alternatives to expensive software."
  }
};

const faqItems = [
  {
    question: "What can I find on The Cloud Rain?",
    answer:
      "The Cloud Rain helps developers discover open-source software, self-hosted tools, and workflow utilities through curated landing pages and a moderated directory."
  },
  {
    question: "Can these tools help reduce SaaS costs?",
    answer:
      "Many resources are open source or available at no cost, but each project should still be reviewed for license terms, usage limits, maintenance status, and production fit."
  },
  {
    question: "Where should I start if I want the best developer tools quickly?",
    answer:
      "Start with Open Source Alternatives for comparison-style browsing, then move into Developer Utilities, No-Cost Resources, and Weekly Tool Briefs for deeper exploration."
  }
];

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
};

export default function HomePage() {
  return (
    <div className="home-page-shell">
      <style>{`
        .home-page-shell > section + section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .home-page-shell > section {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .home-page-shell > section {
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
        }

        .home-page-shell aside article {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .home-page-shell [class*="h-1.5"][class*="w-1.5"][class*="rounded-full"],
        .home-page-shell [class*="h-2"][class*="w-2"][class*="rounded-full"],
        .home-page-shell [class*="h-2.5"][class*="w-2.5"][class*="rounded-full"] {
          opacity: 1 !important;
        }

        .home-page-shell a[data-primary-cta],
        .home-page-shell .btn-premium {
          transition: opacity 150ms ease;
        }

        .home-page-shell a[data-primary-cta]:hover,
        .home-page-shell .btn-premium:hover {
          opacity: 0.9;
        }
      `}</style>

      <section className="pt-16 pb-8 md:pt-20 md:pb-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />

        <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
          Open Source SaaS Alternatives for Developers
        </h1>
      </section>

      <section className="pt-8">
        <ResponsiveHomePage />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white">Explore by intent</p>
        <h2 className="mt-2 text-2xl text-white">Popular developer search topics</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/best-free-developer-tools" data-primary-cta className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Developer Tool Comparisons
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
            Open Source Alternatives
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
            Developer Utilities
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">What lives here</p>
        <h2 className="mt-2 text-2xl text-white">A museum for tools the internet forgot</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          The Cloud Rain surfaces open-source tools that never made it to Product Hunt&apos;s front page —
          self-hostable, production-ready, and genuinely useful. Each tool gets a deep-dive article
          covering origin story, real use cases, and hands-on code. No fluff, no affiliate padding.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">Deep dives</p>
            <h3 className="mt-2 text-base text-white">Tool articles</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Every tool gets its own long-form breakdown — how it works, why it exists,
              and whether it fits your stack.
            </p>
            <Link href="/tools" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Browse deep dives
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">Mystery box</p>
            <h3 className="mt-2 text-base text-white">Random discovery</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Hit the mystery box and get dropped into a random hidden tool.
              No algorithm. No trending bias. Pure discovery.
            </p>
            <Link href="/mystery-box" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Open mystery box
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">No-cost resources</p>
            <h3 className="mt-2 text-base text-white">Free tools directory</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Curated free-tier tools, open-source utilities, and self-hosted
              alternatives organised by use case.
            </p>
            <Link href="/free-tools" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Explore free tools
            </Link>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white">Popular routes</p>
        <h2 className="mt-2 text-2xl text-white">Browse by search intent</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Developer tool comparisons</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              For visitors who want shortlist-style recommendations and comparison content before choosing a tool.
            </p>
            <Link href="/best-free-developer-tools" data-primary-cta className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
              Open comparison page
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Open-source software</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              For developers looking specifically for open-source software and SaaS alternatives across practical categories.
            </p>
            <Link href="/open-source-software" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white">
              Open source directory
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Developer utilities</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              For people searching for underrated software, overlooked utilities, and less obvious workflow wins.
            </p>
            <Link href="/hidden-tools" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white">
              Explore developer utilities
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Weekly tool briefs</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              For recurring discovery and editorial context around open-source picks, self-hosted software, and workflow ideas.
            </p>
            <Link href="/weekly-roundups" data-primary-cta className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
              Read weekly briefs
            </Link>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white">FAQ</p>
        <h2 className="mt-2 text-2xl text-white">Common questions</h2>
        <div className="mt-4 space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-base text-white">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-white/90">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
