import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getIndustryPagePath } from "@/lib/industry-url";
import { getSiteUrl } from "@/lib/site-url";
import { cleanSeoDescription, cleanSeoTitle } from "@/lib/seo/metadata-text";
import { BEST_TOOL_GUIDES } from "@/lib/best-guides";
import { formatLicense } from "@/lib/utils/license";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;
const siteUrl = getSiteUrl();

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("industry_pages")
      .select("slug")
      .eq("status", "published");

    if (error || !Array.isArray(data)) return [];

    return data
      .map((row) => String(row?.slug || "").trim())
      .filter(Boolean)
      .map((slug) => ({ industrySlug: slug.startsWith('best-') ? slug : `best-${slug}` }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { industrySlug: string } }): Promise<Metadata> {
  if (!params.industrySlug.startsWith('best-')) {
    return {};
  }

  const slug = params.industrySlug;

  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("industry_pages")
      .select("meta_title, meta_description")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) return {};

    const page = data as any;
    return {
      title: cleanSeoTitle(page.meta_title || "Best Developer Tools"),
      description: cleanSeoDescription(page.meta_description || "Discover the best tools."),
      alternates: {
        canonical: getIndustryPagePath(slug)
      }
    };
  } catch {
    return {};
  }
}

export default async function IndustrySlugPage({ params }: { params: { industrySlug: string } }) {
  if (!params.industrySlug.startsWith('best-')) {
    notFound();
  }

  const slug = params.industrySlug;

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("industry_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    notFound();
  }

  const page = data as any;

  let tools: any[] = [];
  if (Array.isArray(page.tool_ids) && page.tool_ids.length > 0) {
    const { data: toolsData, error: toolsError } = await supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, logo_url, license, status, deployment_info")
      .in("id", page.tool_ids);

    if (!toolsError && Array.isArray(toolsData)) {
      const orderMap = new Map(page.tool_ids.map((id: string, idx: number) => [id, idx]));
      tools = [...toolsData].sort(
        (a, b) => Number(orderMap.get(a.id) ?? 999) - Number(orderMap.get(b.id) ?? 999)
      );
    }
  }

  const pageUrl = `${siteUrl}${getIndustryPagePath(slug)}`;
  const guideTitleClean = String(page.h1_title || "Best Open-Source Tools").replace(/\s*\(\d{4}\)$/, "");
  const topToolNames = tools.slice(0, 4).map((t) => t.name).join(", ");

  const guideFaqs: Array<{ q: string; a: string }> = [
    {
      q: `What are the top open-source options for ${guideTitleClean.replace(/^Best\s+/i, "")}?`,
      a: topToolNames
        ? `The leading self-hostable open-source choices include ${topToolNames}. Each can be deployed on private servers or Docker infrastructure to replace recurring proprietary SaaS subscriptions.`
        : String(page.intro_paragraph || "All tools listed in this guide are verified open-source, self-hostable software options."),
    },
    ...(page.why_open_source
      ? [
          {
            q: `Why choose self-hosted open source over commercial SaaS here?`,
            a: String(page.why_open_source),
          },
        ]
      : []),
    ...(page.how_to_choose
      ? [
          {
            q: `How should teams pick the right open-source stack from this shortlist?`,
            a: String(page.how_to_choose),
          },
        ]
      : []),
  ];

  const industryStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageUrl,
        url: pageUrl,
        name: page.h1_title || "Best Developer Tools",
        description: page.intro_paragraph || page.meta_description,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
      },
      ...(tools.length > 0
        ? [
            {
              "@type": "ItemList",
              name: page.h1_title || "Recommended Open Source Tools",
              numberOfItems: tools.length,
              itemListElement: tools.map((tool: any, idx: number) => {
                const isApproved = String(tool.status || "").toLowerCase() === "approved";
                return {
                  "@type": "ListItem",
                  position: idx + 1,
                  name: tool.name,
                  url: isApproved && tool.slug ? `${siteUrl}/tools/${tool.slug}` : (tool.url || pageUrl),
                  description: stripMarkdown(tool.description ?? ""),
                };
              }),
            },
          ]
        : []),
      ...(guideFaqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: guideFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(industryStructuredData) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: page.h1_title || slug },
        ]}
      />

      <section>
        <h1 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">{page.h1_title}</h1>
        {page.intro_paragraph && (
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70">
            {page.intro_paragraph}
          </p>
        )}
      </section>

      {/* ── At-a-Glance Comparison Table (Featured Snippet & Rich Comparison) ── */}
      {tools.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">At-a-Glance Comparison</h2>
              <p className="text-xs text-white/50">Verified licensing, Docker support, and deployment overview.</p>
            </div>
            <Link href="/about#methodology" className="text-xs text-cyan-300/80 hover:text-cyan-200 transition">
              Audit Methodology →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 pr-4">Tool</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">License</th>
                  <th className="py-2.5 px-4">Self-Hosted Docker</th>
                  <th className="py-2.5 pl-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tools.map((tool: any) => {
                  const isApproved = String(tool.status || "").toLowerCase() === "approved";
                  const href = isApproved && tool.slug ? `/tools/${tool.slug}` : (tool.url || "#");
                  const formattedLic = tool.license ? formatLicense(String(tool.license)) : "Open Source (OSS)";
                  const dep = tool.deployment_info as { docker?: boolean; docker_compose?: boolean; self_hosted?: boolean } | null;
                  const dockerReady =
                    dep?.docker || dep?.docker_compose
                      ? "🐳 Docker Ready"
                      : dep?.self_hosted
                        ? "Self-Hostable"
                        : "Open Source";

                  return (
                    <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">{tool.name}</td>
                      <td className="py-3 px-4 text-white/60">{tool.category || "Open Source"}</td>
                      <td className="py-3 px-4 font-mono text-white/80">{formattedLic}</td>
                      <td className="py-3 px-4 font-mono text-cyan-200">{dockerReady}</td>
                      <td className="py-3 pl-4">
                        <Link
                          href={href}
                          target={isApproved ? undefined : "_blank"}
                          rel={isApproved ? undefined : "noopener noreferrer"}
                          className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-2"
                        >
                          {isApproved ? "View Tool →" : "Visit Site ↗"}
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

      {tools.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-3xl text-white">Recommended Tools</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {tools.map((tool: any) => {
              const isApproved = String(tool.status || "").toLowerCase() === "approved";
              const toolUrl = isApproved && tool.slug ? `/tools/${tool.slug}` : (tool.url || "#");

              return (
                <div key={tool.id} className="group relative rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8 transition-colors hover:bg-white/[0.05]">
                  <Link
                    href={toolUrl}
                    target={isApproved ? undefined : "_blank"}
                    rel={isApproved ? undefined : "noopener noreferrer"}
                    className="absolute inset-0 z-10"
                  />
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-2">
                      {tool.logo_url ? (
                        <Image
                          src={tool.logo_url}
                          alt={`${tool.name || 'Tool'} logo`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="font-display text-2xl text-white">{tool.name?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="space-y-2 pt-1">
                      <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                        {tool.category || "Resource"}
                      </span>
                      <h3 className="font-display text-2xl text-white transition-colors group-hover:text-cyan-400">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/70 line-clamp-3 relative z-20">
                    {stripMarkdown(tool.description ?? "")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(page.why_open_source || page.how_to_choose) && (
        <section className="grid gap-6 md:grid-cols-2">
          {page.why_open_source && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80 font-semibold">Why Self-Host</p>
              <h2 className="mt-2 font-display text-2xl text-white">Why Choose Open Source?</h2>
              <p className="mt-3 text-sm leading-7 text-white/70">{page.why_open_source}</p>
            </div>
          )}
          {page.how_to_choose && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80 font-semibold">Selection Guide</p>
              <h2 className="mt-2 font-display text-2xl text-white">How to Choose the Right Stack</h2>
              <p className="mt-3 text-sm leading-7 text-white/70">{page.how_to_choose}</p>
            </div>
          )}
        </section>
      )}

      {Array.isArray(page.related_vs_slugs) && page.related_vs_slugs.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Head-to-Head</p>
          <h2 className="mt-2 font-display text-2xl text-white">Related Comparisons</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {page.related_vs_slugs.map((vsSlug: string) => (
              <Link
                key={vsSlug}
                href={`/vs/${vsSlug}`}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                {vsSlug.replace(/-vs-/g, " vs ").replace(/-/g, " ")} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {(page.cta_text || page.cta_href) && (
        <section className="flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            href={page.cta_href || "/free-tools"}
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
          >
            {page.cta_text || "Explore All Open-Source Tools"}
          </Link>
          <Link
            href="/alternatives"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/40"
          >
            Browse SaaS Alternatives →
          </Link>
        </section>
      )}

      {/* ── Frequently Asked Questions ── */}
      {guideFaqs.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">FAQ</p>
          <h2 className="mt-1 font-display text-2xl text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-5 space-y-3">
            {guideFaqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 open:border-cyan-400/30 open:bg-white/[0.04] transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm sm:text-base font-semibold text-white/90 group-hover:text-cyan-200">
                  <span>{faq.q}</span>
                  <span className="text-xs text-white/40 group-open:rotate-180 transition-transform ml-3">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/70">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* More Best-of Open-Source Buyer Guides */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80 font-semibold">
              From the Blog
            </p>
            <h2 className="mt-1 font-display text-2xl text-white">
              More Open-Source Buyer Guides
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            View All in Blog →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {BEST_TOOL_GUIDES.filter((g) => g.slug !== slug).slice(0, 4).map((guide) => (
            <Link
              key={guide.slug}
              href={guide.href}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-cyan-400/35 hover:bg-white/[0.04]"
            >
              <div>
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-200">
                  {guide.category}
                </span>
                <h3 className="mt-2 font-display text-base font-semibold text-white transition group-hover:text-cyan-300">
                  {guide.title}
                </h3>
              </div>
              <p className="mt-2 text-xs text-white/50 truncate">
                Stack: <span className="text-cyan-200/85">{guide.topTools}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
