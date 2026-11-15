import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";
import { BEST_TOOL_GUIDES } from "@/lib/best-guides";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Open-Source Software Blog & Buyer Guides (2026)",
  description:
    "In-depth open-source buyer guides and stack comparisons covering CRM for agencies and government, project management for startups, DevOps monitoring, homelab apps, AI tools, authentication, internal tools, and workflow automation.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Open-Source Software Blog & Buyer Guides (2026) | The Cloud Rain",
    description:
      "Curated open-source software buyer guides and architecture comparisons across CRM, project management, DevOps, homelab, AI, auth, and automation.",
    url: `${siteUrl}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open-Source Software Blog & Buyer Guides (2026) | The Cloud Rain",
    description:
      "Curated open-source software buyer guides and architecture comparisons across CRM, project management, DevOps, homelab, AI, auth, and automation.",
  },
};

export default function BlogIndexPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}/blog`,
    url: `${siteUrl}/blog`,
    name: "The Cloud Rain Open-Source Blog & Buyer Guides",
    description:
      "Curated open-source software buyer guides and stack comparisons for engineering teams, agencies, startups, and self-hosters.",
    publisher: {
      "@type": "Organization",
      name: "The Cloud Rain",
      url: siteUrl,
    },
    blogPost: BEST_TOOL_GUIDES.map((guide) => ({
      "@type": "BlogPosting",
      headline: guide.title,
      description: guide.summary,
      url: `${siteUrl}${guide.href}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Blog Hero Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            The Cloud Rain Blog
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {BEST_TOOL_GUIDES.length} Curated Guides
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          Open-Source Buyer Guides & Stack Comparisons
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-white/65">
          In-depth 2026 guides comparing production-ready, self-hostable open-source software by industry and engineering use case—from agency & government CRMs to DevOps observability, local AI stacks, and SaaS authentication.
        </p>
      </header>

      {/* All 10 Blog Guides Grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {BEST_TOOL_GUIDES.map((guide, index) => (
          <Link
            key={guide.slug}
            href={guide.href}
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 transition-all hover:border-cyan-400/35 hover:bg-white/[0.06]"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {guide.category}
                  </span>
                  {index < 4 && (
                    <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                      Featured
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-white/35">
                  {guide.href}
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold text-white transition group-hover:text-cyan-300">
                {guide.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {guide.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="text-xs truncate">
                <span className="text-white/40">Top Stack: </span>
                <span className="font-medium text-cyan-200">{guide.topTools}</span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-950 transition group-hover:bg-cyan-300">
                Read Guide <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
