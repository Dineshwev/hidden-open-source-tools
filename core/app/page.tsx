import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveHomePage from "@/components/home/ResponsiveHomePage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Free Tools, Open Source Software, and Hidden Gems for Developers",
  description:
    "Discover open source software, free developer tools, and hidden resources curated by The Cloud Rain. Browse trusted tools, templates, and mystery-box style discoveries.",
  keywords: [
    "open source software",
    "free tools for developers",
    "hidden developer tools",
    "best free software",
    "developer resource library",
    "The Cloud Rain"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "The Cloud Rain | Open Source Software and Free Tools",
    description:
      "Find high-quality open source software, free tools, and hidden developer resources in one curated platform.",
    url: siteUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Open Source Software and Free Tools",
    description:
      "A curated hub for open source software, free tools, and hidden gems for developers."
  }
};

const faqItems = [
  {
    question: "What can I find on The Cloud Rain?",
    answer:
      "The Cloud Rain helps developers discover free tools, open source software, UI kits, templates, and hidden workflow resources through curated landing pages and a moderated directory."
  },
  {
    question: "Are the tools on The Cloud Rain free?",
    answer:
      "The public discovery pages focus on free tools and open source software, but each resource should still be reviewed individually for license terms, usage limits, and maintenance status."
  },
  {
    question: "Where should I start if I want the best developer tools quickly?",
    answer:
      "Start with the Best Free Developer Tools page for comparison-style browsing, then move into Open Source Software, Hidden Tools, and the Free Tools directory for deeper exploration."
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

      <ResponsiveHomePage />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Explore by intent</p>
        <h2 className="mt-2 text-2xl text-white">Popular developer search topics</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/best-free-developer-tools" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Best Free Developer Tools
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Open Source Software
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Hidden Tools
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Start here</p>
        <h2 className="mt-2 text-2xl text-white">How to use The Cloud Rain for faster discovery</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          The homepage introduces the main discovery routes for developers who want free tools, open source software,
          and hidden workflow resources without digging through noisy directories. If you want comparison-driven browsing,
          start with the editorial landing pages. If you want a broader directory, move into the free tools library.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Compare</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Use comparison pages to evaluate the best free developer tools by category and intent.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Browse</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Explore curated open source software and hidden tools when you want a wider set of options.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Deep dive</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Read weekly roundups and editorial pages to find practical recommendations with more context.
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Popular routes</p>
        <h2 className="mt-2 text-2xl text-white">Browse by search intent</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Best free developer tools</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              For visitors who want shortlist-style recommendations and comparison content before choosing a tool.
            </p>
            <Link href="/best-free-developer-tools" className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
              Open comparison page
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Open source software</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              For developers looking specifically for open source software and free alternatives across practical categories.
            </p>
            <Link href="/open-source-software" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
              Open source directory
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Hidden tools</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              For people searching for underrated software, overlooked utilities, and less obvious workflow wins.
            </p>
            <Link href="/hidden-tools" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
              Explore hidden tools
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg text-white">Weekly roundups</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              For recurring discovery and editorial context around new free tools, open source picks, and workflow ideas.
            </p>
            <Link href="/weekly-roundups" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
              Read weekly roundups
            </Link>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">FAQ</p>
        <h2 className="mt-2 text-2xl text-white">Common questions</h2>
        <div className="mt-4 space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-base text-white">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-white/65">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
