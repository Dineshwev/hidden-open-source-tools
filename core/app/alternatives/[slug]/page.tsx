import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { cleanSeoDescription, cleanSeoTitle } from "@/lib/seo/metadata-text";

export const revalidate = 3600;
const siteUrl = getSiteUrl();

type AlternativePageProps = {
  params: { slug: string };
};

type AlternativeTool = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  best_for: string;
  github_stars: string;
  license: string;
  similarity_score: number;
};

type AlternativeContent = {
  meta_title: string;
  meta_description: string;
  intro: string;
  why_alternatives: string;
  alternatives: AlternativeTool[];
  comparison_table_note: string;
  migration_tips: string;
  faq: Array<{ q: string; a: string }>;
  conclusion: string;
};

type Alternative = {
  id: string;
  saas_name: string;
  saas_slug: string;
  saas_description: string;
  content: AlternativeContent;
  status: string;
};

async function getAlternativeBySlug(slug: string): Promise<Alternative | null> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("alternatives")
      .select("*")
      .eq("saas_slug", slug)
      .eq("status", "approved")
      .single();
    if (error || !data) return null;
    return data as Alternative;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data } = await supabase
      .from("alternatives")
      .select("saas_slug")
      .eq("status", "approved");
    if (!data) return [];
    return data.map((row) => ({ slug: row.saas_slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: AlternativePageProps): Promise<Metadata> {
  const alt = await getAlternativeBySlug(params.slug);
  if (!alt) return {};
  const c = alt.content;
  const title = cleanSeoTitle(c.meta_title);
  const description = cleanSeoDescription(c.meta_description);
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/alternatives/${alt.saas_slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/alternatives/${alt.saas_slug}`,
      siteName: "The Cloud Rain",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AlternativePage({ params }: AlternativePageProps) {
  const alt = await getAlternativeBySlug(params.slug);
  if (!alt) notFound();

  const c = alt.content;
  const pageUrl = `${siteUrl}/alternatives/${alt.saas_slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        name: `Best Open Source Alternatives to ${alt.saas_name}`,
        url: pageUrl,
        description: c.meta_description || c.intro,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Alternatives", item: `${siteUrl}/alternatives` },
          { "@type": "ListItem", position: 3, name: `${alt.saas_name} Alternatives`, item: pageUrl },
        ],
      },
      ...(Array.isArray(c.alternatives) && c.alternatives.length > 0
        ? [
            {
              "@type": "ItemList",
              name: `Top Open Source Alternatives to ${alt.saas_name}`,
              itemListElement: c.alternatives.map((tool, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                item: {
                  "@type": "SoftwareApplication",
                  name: tool.name,
                  url: `${siteUrl}/tools/${tool.slug}`,
                  description: tool.description || tool.tagline,
                  operatingSystem: "Cross-Platform",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                },
              })),
            },
          ]
        : []),
      ...(Array.isArray(c.faq) && c.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: c.faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Link href="/alternatives" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
        ← All Alternatives
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Open Source Alternatives</p>
        <h1 className="mt-2 font-display text-3xl text-white md:text-5xl">
          Best Open Source Alternatives to {alt.saas_name}
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/60">{c.intro}</p>

        {/* Fact Pills Strip */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-3 border-t border-white/10 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-semibold text-cyan-200">
            ✓ {c.alternatives?.length || 0} Open Source Alternatives
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-semibold text-emerald-300">
            ✓ Self-Hostable via Docker
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
            ✓ SPDX Verified Licenses
          </span>
        </div>
      </section>

      {/* ── Concrete Comparison Matrix Table (Featured Snippet & AI Overview Anchor) ── */}
      {c.alternatives && c.alternatives.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">At a Glance: {alt.saas_name} Alternatives</h2>
            <Link href="/about#methodology" className="text-xs text-cyan-300/80 hover:text-cyan-200 transition">
              Evaluation Methodology →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 pr-4">Software</th>
                  <th className="py-2.5 px-4">Stars</th>
                  <th className="py-2.5 px-4">License</th>
                  <th className="py-2.5 px-4">Best For</th>
                  <th className="py-2.5 px-4">Match</th>
                  <th className="py-2.5 pl-4">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {c.alternatives.map((t) => (
                  <tr key={t.slug} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 font-semibold text-white">{t.name}</td>
                    <td className="py-3 px-4 text-amber-300 font-medium">⭐ {t.github_stars}</td>
                    <td className="py-3 px-4 font-mono text-cyan-200">{t.license}</td>
                    <td className="py-3 px-4 text-white/60">{t.best_for}</td>
                    <td className="py-3 px-4 text-emerald-300 font-semibold">{t.similarity_score}%</td>
                    <td className="py-3 pl-4">
                      <Link href={`/tools/${t.slug}`} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-2">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-xl text-white">Why look for {alt.saas_name} alternatives?</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.why_alternatives}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl text-white">Top Alternatives</h2>
        {c.alternatives?.map((tool, i) => (
          <div key={tool.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white/30">#{i + 1}</span>
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                  <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-xs text-emerald-300">
                    {tool.similarity_score}% match
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/50">{tool.tagline}</p>
                <p className="mt-3 text-sm leading-6 text-white/60">{tool.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/40">
                  <span>⭐ {tool.github_stars}</span>
                  <span>📄 {tool.license}</span>
                  <span>🎯 {tool.best_for}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/tools/${tool.slug}`}
                className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
              >
                View {tool.name} →
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-xl text-white">Migration Tips</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.migration_tips}</p>
      </section>

      {c.faq && c.faq.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="text-xl text-white">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-4">
            {c.faq.map((item, i) => (
              <div key={i} className="border-b border-white/10 pb-4 last:border-0">
                <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-xl text-white">Conclusion</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.conclusion}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore more</p>
        <h2 className="mt-2 text-xl text-white">Keep discovering</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/alternatives" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            More alternatives
          </Link>
          <Link href="/vs" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Tool comparisons
          </Link>
          <Link href="/free-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Browse all tools
          </Link>
        </div>
      </section>
    </div>
  );
}
