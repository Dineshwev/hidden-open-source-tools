import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Open Source Software Directory for Developers",
  description:
    "Browse curated open source software, free tools, and practical developer resources on The Cloud Rain. Discover trusted projects for web, AI, and productivity.",
  keywords: [
    "open source software",
    "open source tools",
    "best open source software",
    "developer tools",
    "free open source projects"
  ],
  alternates: {
    canonical: "/open-source-software"
  },
  openGraph: {
    title: "Open Source Software Directory for Developers",
    description:
      "Discover curated open source software and free developer tools in one searchable resource hub.",
    url: `${siteUrl}/open-source-software`
  }
};

const faqItems = [
  {
    question: "What is the best way to find open source software for developers?",
    answer:
      "Start with curated lists that filter by use-case and quality. The Cloud Rain helps developers discover practical open source software and free tools without sorting through noisy directories."
  },
  {
    question: "Are the tools on The Cloud Rain free to use?",
    answer:
      "Most tools highlighted in the open source and free tools sections are free to use, with licensing determined by each project. Always review each tool's license before using it in production."
  },
  {
    question: "How often are open source software resources updated?",
    answer:
      "New tools and resources are added regularly, and moderation helps keep the directory useful, relevant, and safe for developers."
  },
  {
    question: "Where can I discover hidden or underrated developer tools?",
    answer:
      "You can explore hidden and underrated options through the Hidden Tools and Mystery Box sections, which surface less obvious tools with practical developer value."
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
      name: "Open Source Software",
      item: `${siteUrl}/open-source-software`
    }
  ]
};

export default function OpenSourceSoftwarePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Open Source Software</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Curated open source software and free tools</h1>
        <p className="max-w-3xl text-white/70">
          The Cloud Rain curates open source software and free developer tools so you can discover useful projects faster, with less noise.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg text-white">Verified Curation</h2>
          <p className="mt-2 text-sm text-white/65">Tools are reviewed before they appear in the public library.</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg text-white">Developer Categories</h2>
          <p className="mt-2 text-sm text-white/65">Explore UI kits, templates, courses, and AI tools in one place.</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg text-white">Fresh Discoveries</h2>
          <p className="mt-2 text-sm text-white/65">New resources are added regularly to keep your stack updated.</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-r from-[#0f2338] to-[#163654] p-8">
        <h2 className="text-2xl text-white">Start exploring now</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/free-tools" className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900">
            Browse Free Tools
          </Link>
          <Link href="/mystery-box" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Explore Hidden Tools
          </Link>
          <Link href="/best-free-developer-tools" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90">
            Compare Best Free Tools
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-2xl text-white">Open Source Software FAQ</h2>
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


