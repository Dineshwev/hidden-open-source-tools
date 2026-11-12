import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareButton from "@/components/ShareButton";
import AlternativesStackAction from "@/components/alternatives/AlternativesStackAction";
import { cleanToolMarkdownContent } from "@/lib/clean-tool-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
const siteUrl = getSiteUrl();

type ComparisonPageProps = {
  params: { slug: string };
};

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  content: string;
  status: string;
  verified_regenerated_at?: string | null;
};

type ToolLink = {
  name: string;
  slug: string;
  type: "tool" | "alternative";
};

async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("comparisons")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    if (error || !data) return null;
    return data as Comparison;
  } catch {
    return null;
  }
}

async function getToolLinks(toolA: string, toolB: string): Promise<ToolLink[]> {
  try {
    const supabase = getAdmin();
    const links: ToolLink[] = [];

    // Helper for normalizing lookup keys
    const normA = toolA.trim().toLowerCase();
    const normB = toolB.trim().toLowerCase();

    // 1. Fetch matching open_source_tools
    const { data: openTools } = await supabase
      .from("open_source_tools")
      .select("slug, name")
      .or(`slug.ilike.${normA},slug.ilike.${normB},name.ilike.${toolA},name.ilike.${toolB}`);

    if (Array.isArray(openTools)) {
      for (const t of openTools) {
        if (t?.slug && t?.name) {
          links.push({ name: String(t.name), slug: String(t.slug), type: "tool" });
        }
      }
    }

    // 2. Fetch matching alternatives (SaaS reference alternatives pages)
    const { data: altTools } = await supabase
      .from("alternatives")
      .select("saas_slug, saas_name")
      .or(`saas_slug.ilike.${normA},saas_slug.ilike.${normB},saas_name.ilike.${toolA},saas_name.ilike.${toolB}`);

    if (Array.isArray(altTools)) {
      for (const a of altTools) {
        if (a?.saas_slug && a?.saas_name) {
          links.push({ name: String(a.saas_name), slug: String(a.saas_slug), type: "alternative" });
        }
      }
    }

    return links;
  } catch {
    return [];
  }
}

function stripMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#|]/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

const VS_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  "infisical-vs-hashicorp-vault": {
    title: "Infisical vs HashiCorp Vault (2026): Startup Verdict",
    description:
      "Compare Infisical vs HashiCorp Vault: setup complexity, Kubernetes sync, license differences, and which secrets manager fits startups vs enterprise teams.",
  },
  "appflowy-vs-notion": {
    title: "AppFlowy vs Notion (2026): Local-First Privacy & Verdict",
    description:
      "AppFlowy vs Notion compared: offline local-first speed, Rust/Flutter architecture, AI plugins, self-hosting, and how much you save switching from Notion.",
  },
  "openobserve-vs-datadog": {
    title: "OpenObserve vs Datadog (2026): 140x Lower Log Costs?",
    description:
      "Compare OpenObserve vs Datadog: Rust-based log & trace ingestion, S3 storage costs, OpenTelemetry support, and self-hosting vs Datadog's per-GB pricing.",
  },
  "tooljet-vs-retool": {
    title: "ToolJet vs Retool (2026): Flexibility, Pricing & Verdict",
    description:
      "How does Retool compare with ToolJet in development flexibility? Compare open-source self-hosting, custom JS/Python plugins, and per-user pricing.",
  },
  "chatwoot-vs-intercom": {
    title: "Chatwoot vs Intercom (2026): Open-Source Support Savings",
    description:
      "Chatwoot vs Intercom compared: live chat, omnichannel inbox, Fin AI vs self-hosted bots, and how teams save thousands switching to open-source Chatwoot.",
  },
  "openproject-vs-jira": {
    title: "OpenProject vs Jira (2026): Self-Hosted PM & Pricing",
    description:
      "Compare OpenProject vs Jira: GPLv3 open-source self-hosting, Gantt charts, agile boards, GDPR data control, and per-seat cost savings vs Atlassian.",
  },
  "plane-vs-linear": {
    title: "Plane vs Linear (2026): Open-Source Issue Tracking Verdict",
    description:
      "Plane vs Linear compared: AGPLv3 self-hosted Docker deployment, cycle speed, Jira migration, and pricing for engineering teams.",
  },
  "keycloak-vs-auth0": {
    title: "Keycloak vs Auth0 (2026): Self-Hosted Auth Cost & Verdict",
    description:
      "Compare Keycloak vs Auth0: OIDC/SAML SSO, Docker/Kubernetes setup, maintenance overhead, and why teams leave Auth0's MAU pricing.",
  },
  "minio-vs-aws-s3": {
    title: "MinIO vs AWS S3 (2026): Architecture, Speed & Cost",
    description:
      "How does MinIO architecture compare with Amazon S3? Compare erasure coding, zero-egress self-hosting, S3 API compatibility, and performance.",
  },
};

function getSearchTitle(comparison: Comparison): string {
  const override = VS_SEO_OVERRIDES[comparison.slug];
  if (override) return override.title;
  const toolA = comparison.tool_a?.trim() || "Tool A";
  const toolB = comparison.tool_b?.trim() || "Tool B";
  return `${toolA} vs ${toolB} (2026): Self-Hosted vs SaaS Verdict`;
}

function getSearchDescription(comparison: Comparison): string {
  const override = VS_SEO_OVERRIDES[comparison.slug];
  if (override) return override.description;
  const toolA = comparison.tool_a?.trim() || "Tool A";
  const toolB = comparison.tool_b?.trim() || "Tool B";
  const body = comparison.content.replace(/^#{1,2}\s+.+\r?\n/m, "").trimStart();
  const firstParagraph = body.split(/\r?\n\s*\r?\n/).find((paragraph) => {
    const trimmed = paragraph.trim();
    if (/^#{1,6}\s/.test(trimmed)) return false;
    const text = stripMarkdown(trimmed);
    return text.length > 50 && !text.toLowerCase().includes("verified project signals");
  });
  const description = firstParagraph
    ? stripMarkdown(firstParagraph)
    : `Compare ${toolA} vs ${toolB}: architecture differences, performance benchmarks, self-hosting difficulty, and our final developer verdict.`;
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data } = await supabase
      .from("comparisons")
      .select("slug")
      .eq("status", "published");
    if (!data) return [];
    return data.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const comparison = await getComparisonBySlug(params.slug);
  if (!comparison) return {};
  const title = getSearchTitle(comparison);
  const description = getSearchDescription(comparison) || `Compare ${comparison.tool_a} and ${comparison.tool_b} using the specific features and trade-offs covered on this page.`;
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(`${comparison.tool_a} vs ${comparison.tool_b}`)}&subtitle=${encodeURIComponent('Detailed feature comparison, self-hosting difficulty, and verdict')}&badge=${encodeURIComponent("Head-to-Head Comparison")}&category=${encodeURIComponent("Tool Comparison")}`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/vs/${comparison.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/vs/${comparison.slug}`,
      siteName: "The Cloud Rain",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${comparison.tool_a} vs ${comparison.tool_b} Comparison – The Cloud Rain`,
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

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const comparison = await getComparisonBySlug(params.slug);
  if (!comparison) notFound();

  const toolLinks = await getToolLinks(comparison.tool_a, comparison.tool_b);
  const pageUrl = `${siteUrl}/vs/${comparison.slug}`;
  const toolA = comparison.tool_a?.trim() || "Tool A";
  const toolB = comparison.tool_b?.trim() || "Tool B";
  const verdictSnippet = getSearchDescription(comparison);

  const comparisonFaqs = [
    {
      q: `What are the key architectural differences between ${toolA} and ${toolB}?`,
      a: `${toolA} and ${toolB} take different approaches to runtime performance, deployment complexity, and hosting. ${verdictSnippet}`
    },
    {
      q: `Is ${toolA} good for startups and small engineering teams compared to ${toolB}?`,
      a: `Yes, for teams that want zero per-seat licensing, full data ownership, and self-hosted privacy, ${toolA} eliminates proprietary subscription lock-in. ${toolB} may suit organizations that require vendor-managed hosting SLAs without maintaining their own servers.`
    },
    {
      q: `Can I self-host ${toolA} using Docker?`,
      a: `Most verified open-source developer tools, including ${toolA}, offer simple production deployment via Docker containers and docker-compose. Review our self-hosting and architecture breakdown above for setup guidance.`
    },
    {
      q: `How does ${toolA} compare in development flexibility against ${toolB}?`,
      a: `Open-source alternatives like ${toolA} offer deeper code-level flexibility, custom plugin support, direct database connectivity, and unmetered API calls, whereas proprietary tools like ${toolB} typically restrict customization behind higher enterprise pricing tiers.`
    }
  ];

  const comparisonStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
        headline: `${toolA} vs ${toolB} (2026): Detailed Technical Comparison & Verdict`,
        description: verdictSnippet,
        datePublished: comparison.verified_regenerated_at || undefined,
        dateModified: comparison.verified_regenerated_at || undefined,
        about: [
          { "@type": "SoftwareApplication", name: toolA },
          { "@type": "SoftwareApplication", name: toolB },
        ],
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: comparisonFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Comparisons", item: `${siteUrl}/vs` },
          { "@type": "ListItem", position: 3, name: `${toolA} vs ${toolB}`, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonStructuredData) }}
      />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Comparisons", href: "/vs" },
        { label: `${comparison.tool_a} vs ${comparison.tool_b}` },
      ]} />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Comparison</p>
        <h1 className="mt-2 font-display text-3xl text-white md:text-5xl">
          {comparison.tool_a} vs {comparison.tool_b}
        </h1>
        {comparison.verified_regenerated_at && (
          <p className="mt-3 text-sm text-white/60">
            Last reviewed {new Date(comparison.verified_regenerated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })} · The Cloud Rain
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-xs font-semibold text-orange-200">
              {comparison.tool_a}
            </span>
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              {comparison.tool_b}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {toolLinks.filter((l) => l.type === "tool").length > 0 && (
              <AlternativesStackAction
                saasName={`${comparison.tool_a} vs ${comparison.tool_b}`}
                tools={toolLinks.filter((l) => l.type === "tool")}
              />
            )}
            <ShareButton
              title={`${comparison.tool_a} vs ${comparison.tool_b} | The Cloud Rain`}
              url={`${siteUrl}/vs/${comparison.slug}`}
            />
          </div>
        </div>

        {/* Links to both tool pages & alternatives rendered directly from DB slugs */}
        {toolLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
            {toolLinks.map((link) => (
              <Link
                key={`${link.type}-${link.slug}`}
                href={link.type === "tool" ? `/tools/${link.slug}` : `/alternatives/${link.slug}`}
                className="rounded-full bg-cyan-300/10 border border-cyan-300/30 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/20 transition-colors"
              >
                {link.type === "tool" ? `View ${link.name} →` : `Alternatives to ${link.name} →`}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div
          className="prose prose-invert max-w-none
            prose-headings:font-display
            prose-h2:text-2xl prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:text-white/90 prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-white/70 prose-p:leading-7
            prose-li:text-white/70
            prose-table:text-sm
            prose-th:text-white prose-th:bg-white/5 prose-th:p-3
            prose-td:text-white/70 prose-td:p-3 prose-td:border-white/10
            prose-strong:text-white
            prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{
            __html: marked(cleanToolMarkdownContent(comparison.content), { async: false, breaks: true }) as string,
          }}
        />
      </section>

      {/* ── Frequently Asked Questions ── */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">FAQ</p>
        <h2 className="mt-2 font-display text-2xl text-white">
          Frequently Asked Questions: {toolA} vs {toolB}
        </h2>
        <div className="mt-6 space-y-4">
          {comparisonFaqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 open:bg-white/[0.04] transition-colors"
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

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore More</p>
        <h2 className="mt-2 text-xl text-white">Find the right tool for your stack</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {toolLinks.map((link) => (
            <Link
              key={`explore-${link.type}-${link.slug}`}
              href={link.type === "tool" ? `/tools/${link.slug}` : `/alternatives/${link.slug}`}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
            >
              {link.type === "tool" ? `View ${link.name}` : `Alternatives to ${link.name}`}
            </Link>
          ))}
          <Link
            href="/free-tools"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
          >
            Browse all tools
          </Link>
          <Link
            href="/vs"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
          >
            More comparisons
          </Link>
        </div>
      </section>
    </div>
  );
}
