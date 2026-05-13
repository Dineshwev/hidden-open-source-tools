import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveHomePage from "@/components/home/ResponsiveHomePage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "The Cloud Rain | Free Open Source Tools & Self-Hosted Alternatives",
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
    title: "The Cloud Rain | Open Source SaaS Alternatives",
    description:
      "Discover lightweight open-source tools, self-hosted software, and practical SaaS alternatives curated for developers.",
    url: siteUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Open Source SaaS Alternatives",
    description:
      "A curated hub for self-hosted software, open-source utilities, and lightweight developer tools."
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
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />

      <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
        Open Source SaaS Alternatives for Developers
      </h1>

      <ResponsiveHomePage />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white">Explore by intent</p>
        <h2 className="mt-2 text-2xl text-white">Popular developer search topics</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/best-free-developer-tools" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
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
        <p className="text-xs uppercase tracking-[0.25em] text-white">Start here</p>
        <h2 className="mt-2 text-2xl text-white">How to use The Cloud Rain for faster discovery</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90">
          The homepage introduces the main discovery routes for developers who want self-hosted software, open-source tools,
          and practical workflow resources without digging through noisy directories. If you want comparison-driven browsing,
          start with the editorial landing pages. If you want a broader directory, move into the no-cost resource library.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Compare</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              Use comparison pages to evaluate developer tools by category, deployment model, and intent.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Browse</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              Explore curated open-source software and developer utilities when you want a wider set of options.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Deep dive</h3>
            <p className="mt-2 text-sm leading-6 text-white/90">
              Read weekly roundups and editorial pages to find practical recommendations with more context.
            </p>
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
            <Link href="/best-free-developer-tools" className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
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
            <Link href="/weekly-roundups" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
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
