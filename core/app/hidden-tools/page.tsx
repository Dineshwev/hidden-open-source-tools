import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Hidden Tools and Underrated Software for Developers",
  description:
    "Find hidden tools, underrated software, and lesser-known developer resources on The Cloud Rain. Discover practical free tools and open source gems.",
  keywords: ["hidden tools", "underrated software", "developer hidden gems", "free hidden tools"],
  alternates: {
    canonical: "/hidden-tools"
  },
  openGraph: {
    title: "Hidden Tools and Underrated Software for Developers",
    description:
      "Discover hidden and underrated tools for developers, including open source and free productivity resources.",
    url: `${siteUrl}/hidden-tools`
  }
};

const faqItems = [
  {
    question: "What are hidden tools for developers?",
    answer:
      "Hidden tools are useful software projects that are less marketed or less known, but still solve real development workflow problems effectively."
  },
  {
    question: "How can I find underrated software that is still reliable?",
    answer:
      "Look for curated collections, active repositories, clear documentation, and community feedback. The Cloud Rain moderation flow helps surface reliable hidden tools."
  },
  {
    question: "Are hidden tools usually free or open source?",
    answer:
      "Many hidden tools are free or open source, though some include paid tiers. Always check licensing and usage terms before integrating into your stack."
  },
  {
    question: "Where should I start if I want hidden tools and free alternatives?",
    answer:
      "Start with the Hidden Tools page, then expand into the Open Source Software directory and Free Tools section for related alternatives."
  }
];

const faqSchema = {
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
      name: "Hidden Tools",
      item: `${siteUrl}/hidden-tools`
    }
  ]
};

export default function HiddenToolsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/80">Hidden Tools</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Hidden tools worth adding to your workflow</h1>
        <p className="max-w-3xl text-white/70">
          This page highlights lesser-known tools and curated discoveries from The Cloud Rain so developers can find practical options beyond mainstream lists.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg text-white">Why hidden tools matter</h2>
          <p className="mt-2 text-sm text-white/65">
            Many of the best tools are not heavily marketed. Curated discovery helps you find real value earlier.
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg text-white">What you can find here</h2>
          <p className="mt-2 text-sm text-white/65">
            Open source projects, free developer resources, and utility tools that solve specific workflow problems.
          </p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-fuchsia-300/20 bg-gradient-to-r from-[#2a1642] to-[#14304d] p-8">
        <h2 className="text-2xl text-white">Continue with curated discovery</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/mystery-box" className="rounded-full bg-fuchsia-300 px-5 py-2 text-sm font-semibold text-slate-900">
            Open Mystery Box
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Open Source Directory
          </Link>
          <Link href="/best-free-developer-tools" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Compare Best Free Tools
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-2xl text-white">Hidden Tools FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-base text-white">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
