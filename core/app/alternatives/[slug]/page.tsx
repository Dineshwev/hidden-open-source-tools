import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { cleanSeoDescription, cleanSeoTitle } from "@/lib/seo/metadata-text";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareButton from "@/components/ShareButton";
import AlternativesStackAction from "@/components/alternatives/AlternativesStackAction";

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
  url?: string;
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
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(`Best Open Source ${alt.saas_name} Alternatives`)}&subtitle=${encodeURIComponent(`Curated privacy-first, self-hostable replacements for ${alt.saas_name}`)}&badge=${encodeURIComponent("Open Source Alternative")}&category=${encodeURIComponent("SaaS Alternative")}`;

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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Open Source ${alt.saas_name} Alternatives – The Cloud Rain`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AlternativePage({ params }: AlternativePageProps) {
  const alt = await getAlternativeBySlug(params.slug);
  if (!alt) notFound();

  const supabase = getAdmin();
  const saasName = alt.saas_name.trim();
  const [approvedToolsRes, relatedVsRes, relatedArtsRes] = await Promise.all([
    supabase
      .from("open_source_tools")
      .select("slug, url")
      .or("status.eq.approved,status.eq.APPROVED"),
    supabase
      .from("comparisons")
      .select("slug, tool_a, tool_b")
      .eq("status", "published")
      .or(`tool_a.ilike.%${saasName}%,tool_b.ilike.%${saasName}%`)
      .limit(6),
    supabase
      .from("articles")
      .select("slug, tool_name, title")
      .eq("is_published", true)
      .ilike("title", `%${saasName}%`)
      .limit(3),
  ]);

  const approvedToolsData = approvedToolsRes.data;
  const relatedComparisons = (relatedVsRes.data || []).map((c: any) => ({
    slug: String(c.slug || ""),
    tool_a: String(c.tool_a || ""),
    tool_b: String(c.tool_b || ""),
  }));
  const relatedArticles = (relatedArtsRes.data || []).map((a: any) => ({
    slug: String(a.slug || ""),
    tool_name: String(a.tool_name || ""),
    title: String(a.title || ""),
  }));

  const approvedSlugs = new Set(
    (approvedToolsData || [])
      .map((t: any) => String(t?.slug || "").toLowerCase().trim())
      .filter(Boolean)
  );

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
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Alternatives", href: "/alternatives" },
        { label: `${alt.saas_name} Alternatives` },
      ]} />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Open Source Alternatives</p>
        <h1 className="mt-2 font-display text-3xl text-white md:text-5xl">
          Best Open Source Alternatives to {alt.saas_name}
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/60">{c.intro}</p>

        {/* Fact Pills Strip & Share */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
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

          <ShareButton
            title={`Best Open Source Alternatives to ${alt.saas_name} | The Cloud Rain`}
            url={`${siteUrl}/alternatives/${alt.saas_slug}`}
          />
        </div>

        {/* Quick Jump Anchors */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/5 text-xs">
          <span className="text-white/40 mr-1 text-[11px] uppercase tracking-wider font-semibold">Jump to:</span>
          {c.alternatives && c.alternatives.length > 0 && (
            <a
              href="#comparison-matrix"
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:border-cyan-400/40 hover:text-cyan-200 transition"
            >
              📊 Comparison Matrix
            </a>
          )}
          <a
            href="#why-switch"
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:border-cyan-400/40 hover:text-cyan-200 transition"
          >
            💡 Why Switch
          </a>
          <a
            href="#top-alternatives"
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:border-cyan-400/40 hover:text-cyan-200 transition"
          >
            ⭐ Top Alternatives ({c.alternatives?.length || 0})
          </a>
          {c.migration_tips && (
            <a
              href="#migration-tips"
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:border-cyan-400/40 hover:text-cyan-200 transition"
            >
              🚀 Migration Tips
            </a>
          )}
          {c.faq && c.faq.length > 0 && (
            <a
              href="#faq"
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:border-cyan-400/40 hover:text-cyan-200 transition"
            >
              ❓ FAQs
            </a>
          )}
        </div>
      </section>

      {/* ── Concrete Comparison Matrix Table (Featured Snippet & AI Overview Anchor) ── */}
      {c.alternatives && c.alternatives.length > 0 && (
        <section id="comparison-matrix" className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">At a Glance: {alt.saas_name} Alternatives</h2>
              <p className="text-xs text-white/50">Verified open-source software with self-hosted Docker support.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <AlternativesStackAction saasName={alt.saas_name} tools={c.alternatives} />
              <Link href="/about#methodology" className="text-xs text-cyan-300/80 hover:text-cyan-200 transition">
                Methodology →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 pr-4">Software</th>
                  <th className="py-2.5 px-4">Deployment</th>
                  <th className="py-2.5 px-4">License</th>
                  <th className="py-2.5 px-4">Best For</th>
                  <th className="py-2.5 px-4">Match</th>
                  <th className="py-2.5 pl-4">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {c.alternatives.map((t) => {
                  const tSlug = String(t.slug || "").toLowerCase().trim();
                  const isInternal = approvedSlugs.has(tSlug);
                  const href = isInternal ? `/tools/${tSlug}` : (t.url || `https://github.com/search?q=${encodeURIComponent(t.name)}`);

                  return (
                    <tr key={t.slug} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">{t.name}</td>
                      <td className="py-3 px-4 font-mono text-cyan-200">🐳 Docker / Self-Host</td>
                      <td className="py-3 px-4 font-mono text-white/80">{t.license}</td>
                      <td className="py-3 px-4 text-white/60">{t.best_for}</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">{t.similarity_score}%</td>
                      <td className="py-3 pl-4">
                        <Link
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-2"
                        >
                          {isInternal ? "Details →" : "Visit Site ↗"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section id="why-switch" className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 scroll-mt-20">
        <h2 className="text-xl text-white">Why look for {alt.saas_name} alternatives?</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.why_alternatives}</p>
      </section>

      <section id="top-alternatives" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl text-white">Top Alternatives</h2>
        {c.alternatives?.map((tool, i) => {
          const toolSlug = String(tool.slug || "").toLowerCase().trim();
          const isInternal = approvedSlugs.has(toolSlug);
          const href = isInternal ? `/tools/${toolSlug}` : (tool.url || `https://github.com/search?q=${encodeURIComponent(tool.name)}`);

          return (
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
                    <span>🐳 Docker / Self-Host Ready</span>
                    <span>📄 {tool.license}</span>
                    <span>🎯 {tool.best_for}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={href}
                  target={isInternal ? undefined : "_blank"}
                  rel={isInternal ? undefined : "noopener noreferrer"}
                  className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
                >
                  {isInternal ? `View ${tool.name} →` : `Visit ${tool.name} ↗`}
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <section id="migration-tips" className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 scroll-mt-20">
        <h2 className="text-xl text-white">Migration Tips</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.migration_tips}</p>
      </section>

      {c.faq && c.faq.length > 0 && (
        <section id="faq" className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 scroll-mt-20">
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

      {relatedComparisons.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Head-to-Head</p>
          <h2 className="mt-2 font-display text-2xl text-white">
            {alt.saas_name} Head-to-Head Comparisons
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedComparisons.map((comp) => (
              <Link
                key={comp.slug}
                href={`/vs/${comp.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-white/85 transition hover:border-cyan-400/40 hover:text-cyan-200"
              >
                <span>{comp.tool_a} vs {comp.tool_b}</span>
                <span className="text-cyan-300 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Article Museum</p>
          <h2 className="mt-2 font-display text-2xl text-white">
            Related {alt.saas_name} Replacement Guides
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {relatedArticles.map((art) => (
              <Link
                key={art.slug}
                href={`/article-museum/${art.slug}`}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/40"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  {art.tool_name}
                </span>
                <p className="mt-1 text-xs font-semibold leading-snug text-white group-hover:text-cyan-200 line-clamp-2">
                  {art.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore more</p>
        <h2 className="mt-2 text-xl text-white">Keep discovering</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/alternatives" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            More alternatives
          </Link>
          <Link href="/best-free-developer-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Best Free Developer Tools
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
