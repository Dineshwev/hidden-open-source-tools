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
import SavingsCalculator from "@/components/pricing/SavingsCalculator";
import QuickVerdictCard from "@/components/vs/QuickVerdictCard";
import CostComparisonBarChart from "@/components/vs/CostComparisonBarChart";
import { VERIFIED_SAAS_PRICING } from "@/lib/pricing-data";

export const revalidate = 3600;
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
  "surrealdb-vs-mongodb": {
    title: "SurrealDB vs MongoDB (2026): Multi-Model Speed & Verdict",
    description:
      "Compare SurrealDB vs MongoDB: multi-model queries (document, graph, relational), ACID guarantees, self-hosting ease, and when to switch from Mongo.",
  },
  "authentik-vs-auth0": {
    title: "Authentik vs Auth0 (2026): Enterprise SSO & Self-Hosted Cost",
    description:
      "Authentik vs Auth0 compared: SAML/OIDC SSO, multi-factor auth, visual authentication flows, and how teams avoid Auth0 MAU pricing cliff.",
  },
  "coolify-vs-railway": {
    title: "Coolify vs Railway (2026): Self-Hosted PaaS vs Cloud Pricing",
    description:
      "Compare Coolify vs Railway: Docker/Nixpacks deployment, database management, resource limits, and VPS self-hosting vs Railway monthly compute fees.",
  },
  "netdata-vs-datadog": {
    title: "Netdata vs Datadog (2026): Real-Time 1-Second Metrics",
    description:
      "Netdata vs Datadog compared: zero-config 1-second metric streaming, CPU/RAM resource footprint, per-host monitoring costs, and self-hosted privacy.",
  },
  "glitchtip-vs-sentry": {
    title: "GlitchTip vs Sentry (2026): Sentry-Compatible Error Tracking",
    description:
      "Compare GlitchTip vs Sentry: drop-in Sentry SDK compatibility, lightweight PostgreSQL architecture, self-hosted Docker, and $0 error ingestion costs.",
  },
  "appwrite-vs-firebase": {
    title: "Appwrite vs Firebase (2026): Self-Hosted BaaS Architecture",
    description:
      "Appwrite vs Firebase compared: auth, real-time databases, storage, serverless cloud functions, Docker setup, and zero proprietary Google lock-in.",
  },
  "affine-vs-notion": {
    title: "AFFiNE vs Notion (2026): Canvas + Docs Local-First Workspace",
    description:
      "Compare AFFiNE vs Notion: unified markdown docs and whiteboard canvas, local-first data ownership, privacy, and self-hosting without Notion limits.",
  },
  "dragonfly-vs-redis": {
    title: "Dragonfly vs Redis (2026): 25x Higher Throughput Benchmarks",
    description:
      "Dragonfly vs Redis compared: multi-threaded shared-nothing architecture, memory efficiency, Redis API drop-in compatibility, and cloud hardware savings.",
  },
  "outline-vs-notion": {
    title: "Outline vs Notion (2026): Fast Markdown Team Knowledge Base",
    description:
      "Outline vs Notion compared: lightning-fast markdown wiki, sub-second search, team permissioning, Docker self-hosting, and why dev teams switch from Notion.",
  },
  "postiz-vs-buffer": {
    title: "Postiz vs Buffer (2026): Self-Hosted AI Social Scheduler",
    description:
      "Compare Postiz vs Buffer: unlimited social accounts, AI content generation, multi-platform scheduling, Docker deployment, and zero monthly seat fees.",
  },
  "penpot-vs-figma": {
    title: "Penpot vs Figma (2026): Open Web Standards & Team Verdict",
    description:
      "Penpot vs Figma compared: native SVG/CSS flexbox design, zero Adobe lock-in, self-hosted Docker privacy, and collaboration features for teams.",
  },
  "tally-vs-typeform": {
    title: "Tally vs Typeform (2026): Free Forms & Unlimited Responses",
    description:
      "Compare Tally vs Typeform: Notion-style form builder, 99% free features, unlimited responses, custom domains, and why teams leave Typeform's paywall.",
  },
  "gitea-vs-gitlab": {
    title: "Gitea vs GitLab (2026): Lightweight Git Hosting on 100MB RAM",
    description:
      "Gitea vs GitLab compared: minimal hardware requirements (runs on Raspberry Pi), CI/CD runner speed, GitHub issue parity, and enterprise Git features.",
  },
  "posthog-vs-mixpanel": {
    title: "PostHog vs Mixpanel (2026): Product Analytics & Session Replay",
    description:
      "Compare PostHog vs Mixpanel: event-based analytics, session recordings, feature flags, A/B testing, and self-hosted ClickHouse data sovereignty.",
  },
  "dokploy-vs-vercel": {
    title: "Dokploy vs Vercel (2026): Self-Hosted PaaS on $5 VPS",
    description:
      "Dokploy vs Vercel compared: zero serverless execution timeouts, Traefik auto-SSL, Docker Compose multi-service support, and 90% cloud cost reduction.",
  },
  "coolify-vs-vercel": {
    title: "Coolify vs Vercel (2026): Free Self-Hosted Cloud Verdict",
    description:
      "Coolify vs Vercel: compare GitHub automatic deployments, preview PR environments, database backups, and why developers are abandoning Vercel limits.",
  },
  "signoz-vs-datadog": {
    title: "SigNoz vs Datadog (2026): OpenTelemetry APM & Log Savings",
    description:
      "SigNoz vs Datadog compared: native OpenTelemetry instrumentation, ClickHouse columnar storage speed, APM traces, and eliminating Datadog bill shock.",
  },
  "docuseal-vs-docusign": {
    title: "DocuSeal vs DocuSign (2026): Free Self-Hosted eSignatures",
    description:
      "Compare DocuSeal vs DocuSign: eIDAS/ESIGN compliance, unlimited envelope signing, PDF form fields, self-hosted Docker, and 95% cost savings.",
  },
  "hoppscotch-vs-postman": {
    title: "Hoppscotch vs Postman (2026): Lightweight Web API Client",
    description:
      "Hoppscotch vs Postman compared: browser-based sub-second speed, WebSocket & GraphQL support, zero forced cloud sync, and open-source privacy.",
  },
  "bruno-vs-postman": {
    title: "Bruno vs Postman (2026): Git-Native Offline API Testing",
    description:
      "Bruno vs Postman: plain text Bru collection files saved in your Git repo, zero mandatory logins, offline-first execution, and total API data privacy.",
  },
  "supertokens-vs-auth0": {
    title: "SuperTokens vs Auth0 (2026): Open-Source Auth Architecture",
    description:
      "SuperTokens vs Auth0 compared: session management, pre-built React SDKs, self-hosted Docker control, and zero unexpected active user price jumps.",
  },
  "twenty-vs-hubspot": {
    title: "Twenty vs HubSpot (2026): Modern Open-Source CRM Verdict",
    description:
      "Twenty vs HubSpot compared: GraphQL APIs, custom data objects, modern Notion-like UI, self-hosted PostgreSQL, and zero steep seat-upgrade paywalls.",
  },
  "baserow-vs-airtable": {
    title: "Baserow vs Airtable (2026): Self-Hosted Database with 100K+ Rows",
    description:
      "Baserow vs Airtable: PostgreSQL backend speed, handling 100,000+ records without lag, custom formulas, API webhooks, and unlimited self-hosted rows.",
  },
  "windmill-vs-retool": {
    title: "Windmill vs Retool (2026): Code-First Internal Tools & Workflows",
    description:
      "Windmill vs Retool compared: Rust-powered sub-millisecond execution, Python/TypeScript script caching, UI builder, and developer-first pricing.",
  },
  "zammad-vs-zendesk": {
    title: "Zammad vs Zendesk (2026): Open-Source Helpdesk & Ticket SLAs",
    description:
      "Zammad vs Zendesk: multi-channel email/chat support, automated SLA workflows, Elasticsearch search, self-hosted Docker, and zero per-agent gouging.",
  },
  "rocketchat-vs-slack": {
    title: "Rocket.Chat vs Slack (2026): Enterprise Self-Hosted Chat & Matrix",
    description:
      "Rocket.Chat vs Slack compared: end-to-end encryption, Matrix federation, on-premise compliance, voice/video calls, and unlimited message history.",
  },
  "listmonk-vs-mailchimp": {
    title: "Listmonk vs Mailchimp (2026): Send Millions of Emails on $5/mo",
    description:
      "Listmonk vs Mailchimp: single Go binary speed, PostgreSQL subscriber management, SES/Sendgrid integration, and why newsletters ditch Mailchimp costs.",
  },
  "medusa-vs-shopify": {
    title: "Medusa vs Shopify (2026): Headless Open-Source Commerce",
    description:
      "Medusa vs Shopify compared: Node.js modular microservices, multi-currency cart & checkout, full source control, and zero 2% transaction penalties.",
  },
  "langfuse-vs-langsmith": {
    title: "Langfuse vs LangSmith (2026): Open-Source LLM Observability",
    description:
      "Langfuse vs LangSmith: prompt management, LLM tracing & evaluation, latency & token cost analytics, self-hosted Docker, and vendor independence.",
  },
  "openobserve-vs-signoz": {
    title: "OpenObserve vs SigNoz (2026): Rust S3 Logs vs ClickHouse APM",
    description:
      "Compare OpenObserve vs SigNoz: S3 Parquet log compression vs ClickHouse distributed trace flamegraphs, RAM footprint, licenses, and self-hosting costs.",
  },
  "openobserve-vs-elasticsearch": {
    title: "OpenObserve vs Elasticsearch (2026): 140x Cheaper S3 Logs?",
    description:
      "OpenObserve vs Elasticsearch (ELK) compared: Rust + Parquet S3 storage vs JVM heap shards, SQL vs Query DSL, and cutting log retention bills by 90%.",
  },
  "openobserve-vs-grafana-loki": {
    title: "OpenObserve vs Grafana Loki (2026): SQL Logs vs Label Streams",
    description:
      "Compare OpenObserve vs Grafana Loki: single binary all-in-one observability vs LGTM cluster complexity, high-cardinality JSON queries, and Docker setup.",
  },
  "changedetection-io-vs-visualping": {
    title: "Changedetection.io vs Visualping (2026): Unlimited Free Checks?",
    description:
      "Changedetection.io vs Visualping compared: Playwright browser steps, JSON/PDF diffs, 85+ alert channels, and unlimited self-hosted monitoring on a $5 VPS.",
  },
  "changedetection-io-vs-uptime-kuma": {
    title: "Changedetection.io vs Uptime Kuma (2026): Diffs vs Uptime Pings",
    description:
      "Compare Changedetection.io vs Uptime Kuma: DOM content/price change alerts vs 20s endpoint uptime pings and public SLA status pages.",
  },
  "postiz-vs-hootsuite": {
    title: "Postiz vs Hootsuite (2026): Self-Hosted AI Social Scheduling",
    description:
      "Postiz vs Hootsuite compared: unlimited channels, AI drafting, API/n8n automation, Next.js Docker self-hosting, and eliminating $99/user/mo Hootsuite bills.",
  },
  "taiga-vs-jira": {
    title: "Taiga vs Jira (2026): Clean Open-Source Scrum & Kanban",
    description:
      "Compare Taiga vs Jira: MPL-2.0 self-hosted Docker Agile boards, Scrum story points, burndown charts, and escaping Jira bloat & per-seat hikes.",
  },
  "taiga-vs-linear": {
    title: "Taiga vs Linear (2026): Open-Source Scrum vs Cloud Cycles",
    description:
      "Taiga vs Linear compared: formal Scrum planning & story points, self-hosted MPL-2.0 data ownership vs Linear's cloud-only speed.",
  },
  "posthog-vs-amplitude": {
    title: "PostHog vs Amplitude (2026): All-in-One Analytics & Replay",
    description:
      "Compare PostHog vs Amplitude: product funnels, built-in session replay, feature flags, ClickHouse HogQL access, and lower growth-stage pricing.",
  },
  "matomo-vs-mixpanel": {
    title: "Matomo vs Mixpanel (2026): GDPR Privacy vs Event Cohorts",
    description:
      "Matomo vs Mixpanel compared: CNIL consent-free GDPR tracking on a $5 MySQL VPS vs cloud MTU pricing for deep app telemetry.",
  },
  "countly-vs-mixpanel": {
    title: "Countly vs Mixpanel (2026): Self-Hosted Mobile Analytics",
    description:
      "Compare Countly vs Mixpanel: native iOS/Android/Flutter SDKs, integrated crash reporting, custom events, and unlimited self-hosted MAUs.",
  },
  "beszel-vs-netdata": {
    title: "Beszel vs Netdata (2026): 30MB Go Fleet Hub vs 1-Sec Metrics",
    description:
      "Compare Beszel vs Netdata: ultra-light multi-server Docker overview in <30MB RAM vs 1-second kernel & eBPF performance troubleshooting.",
  },
  "beszel-vs-uptime-kuma": {
    title: "Beszel vs Uptime Kuma (2026): Server Metrics vs SLA Status Pages",
    description:
      "Beszel vs Uptime Kuma compared: internal CPU/RAM/Docker telemetry vs external HTTP/SSL endpoint probing and customer status pages.",
  },
  "docuseal-vs-documenso": {
    title: "DocuSeal vs Documenso (2026): Best Open-Source eSignature App",
    description:
      "Compare DocuSeal vs Documenso: single-container PDF form builder vs TypeScript Next.js/Prisma architecture, APIs, and self-hosting ease.",
  },
  "bruno-vs-hoppscotch": {
    title: "Bruno vs Hoppscotch (2026): Offline Git `.bru` vs Web API Client",
    description:
      "Bruno vs Hoppscotch compared: plain-text Git PR API collections vs lightning-fast browser PWA, WebSocket testing, and Docker team sync.",
  },
  "pocketbase-vs-supabase": {
    title: "PocketBase vs Supabase (2026): Single Go Binary vs Postgres BaaS",
    description:
      "Compare PocketBase vs Supabase: <100MB SQLite simplicity on a $4 VPS vs multi-container PostgreSQL, pgvector, and Edge Functions.",
  },
  "pocketbase-vs-appwrite": {
    title: "PocketBase vs Appwrite (2026): Lightweight Go vs Firebase BaaS",
    description:
      "PocketBase vs Appwrite compared: zero-ops single executable SQLite backend vs full polyglot cloud functions and mobile SDK suite.",
  },
  "immich-vs-photoprism": {
    title: "Immich vs PhotoPrism (2026): Best Self-Hosted Google Photos",
    description:
      "Immich vs PhotoPrism compared: native iOS/Android mobile auto-backup, multi-user family albums, CLIP search, and NAS RAW photo indexing.",
  },
  "jellyfin-vs-plex": {
    title: "Jellyfin vs Plex (2026): 100% Free GPU Transcoding & Privacy",
    description:
      "Compare Jellyfin vs Plex: free NVENC/QuickSync hardware transcoding, offline LAN auth, zero ad bloat, and remote sharing tradeoffs.",
  },
  "metabase-vs-tableau": {
    title: "Metabase vs Tableau (2026): 5-Min Open BI vs Enterprise Seats",
    description:
      "Metabase vs Tableau compared: intuitive SQL/no-code team dashboards on $10 Docker hosting vs Tableau's $15-$75/user/mo license fees.",
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

  const supabase = getAdmin();
  const [relatedVsRes, relatedArtsRes] = await Promise.all([
    supabase
      .from("comparisons")
      .select("slug, tool_a, tool_b")
      .eq("status", "published")
      .neq("slug", comparison.slug)
      .or(`tool_a.ilike.%${toolA}%,tool_b.ilike.%${toolA}%,tool_a.ilike.%${toolB}%,tool_b.ilike.%${toolB}%`)
      .limit(4),
    supabase
      .from("articles")
      .select("slug, tool_name, title")
      .eq("is_published", true)
      .or(`tool_name.ilike.%${toolA}%,tool_name.ilike.%${toolB}%,title.ilike.%${toolA}%,title.ilike.%${toolB}%`)
      .limit(3),
  ]);

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

  const fallbackFaqs = [
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

  const cleanedMarkdown = cleanToolMarkdownContent(comparison.content);
  const comparisonWordCount = cleanedMarkdown.trim().split(/\s+/).filter(Boolean).length;

  // Extract tool-specific FAQs from "## Frequently Asked Questions" if present,
  // and remove the raw section from body markdown so it isn't rendered twice.
  const faqSectionMatch = cleanedMarkdown.match(
    /\n##\s+Frequently Asked Questions[^\n]*\n([\s\S]*?)(?=\n##\s+|$)/i
  );
  const extractedFaqs: Array<{ q: string; a: string }> = [];
  if (faqSectionMatch?.[1]) {
    const qaRegex = /###\s+([^\n]+)\n+([\s\S]*?)(?=\n###\s+|$)/g;
    let qaMatch: RegExpExecArray | null;
    while ((qaMatch = qaRegex.exec(faqSectionMatch[1])) !== null) {
      const q = stripMarkdown(qaMatch[1]);
      const a = stripMarkdown(qaMatch[2]);
      if (q.length > 8 && a.length > 15) {
        extractedFaqs.push({ q, a });
      }
    }
  }
  const comparisonFaqs = extractedFaqs.length >= 2 ? extractedFaqs : fallbackFaqs;
  const bodyMarkdown =
    extractedFaqs.length >= 2 && faqSectionMatch
      ? cleanedMarkdown.replace(faqSectionMatch[0], "").trim()
      : cleanedMarkdown;

  const slugifyHeading = (text: string) =>
    text
      .replace(/<[^>]+>/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const tocSections: Array<{ id: string; label: string }> = [];
  const rawHtml = marked(bodyMarkdown, { async: false, breaks: true }) as string;
  const renderedHtml = rawHtml.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_match, inner) => {
    const plain = String(inner).replace(/<[^>]+>/g, "").trim();
    const id = slugifyHeading(plain);
    if (id && plain && !tocSections.some((s) => s.id === id)) {
      tocSections.push({ id, label: plain });
    }
    return `<h2 id="${id}" class="scroll-mt-24">${inner}</h2>`;
  });

  const comparisonStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
        headline: `${toolA} vs ${toolB} (2026): Detailed Technical Comparison & Verdict`,
        description: verdictSnippet,
        wordCount: comparisonWordCount,
        datePublished: comparison.verified_regenerated_at || undefined,
        dateModified: comparison.verified_regenerated_at || undefined,
        author: {
          "@type": "Person",
          name: "Dinesh Regar",
          url: `${siteUrl}/about`,
          sameAs: [
            "https://github.com/Dineshwev",
            "https://x.com/TheCloudRain_",
          ],
        },
        publisher: {
          "@type": "Organization",
          name: "The Cloud Rain",
          url: siteUrl,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/icon.svg`,
          },
        },
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

  const saasSlugMatch = Object.keys(VERIFIED_SAAS_PRICING).find(
    (slug) =>
      comparison.slug.includes(slug) ||
      toolA.toLowerCase().includes(slug) ||
      toolB.toLowerCase().includes(slug)
  );

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

        {/* Quick Jump Anchor Strip */}
        {tocSections.length > 1 && (
          <nav aria-label="Comparison sections" className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-4 text-xs">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Jump to:
            </span>
            {tocSections.slice(0, 6).map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
              >
                {sec.label}
              </a>
            ))}
            {saasSlugMatch && (
              <a
                href="#cost-calculator"
                className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-emerald-300 transition hover:border-emerald-400/40"
              >
                Cost Savings
              </a>
            )}
            <a
              href="#comparison-faq"
              className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
            >
              FAQ
            </a>
          </nav>
        )}
      </section>

      {/* ── Above-the-Fold Quick Verdict Split Card ── */}
      <QuickVerdictCard
        toolA={toolA}
        toolB={toolB}
        markdown={cleanedMarkdown}
        toolLinks={toolLinks}
      />

      {/* ── Verified Annual Cost Comparison Bar Chart ── */}
      {saasSlugMatch && (
        <CostComparisonBarChart
          pricing={VERIFIED_SAAS_PRICING[saasSlugMatch]}
          openSourceToolName={
            toolA.toLowerCase().includes(saasSlugMatch) ? toolB : toolA
          }
        />
      )}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div
          className="prose prose-invert max-w-none
            prose-headings:font-display
            prose-h2:text-2xl prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:text-white/90 prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-slate-200/90 prose-p:leading-7
            prose-li:text-slate-200/90
            prose-table:text-sm
            prose-th:text-white prose-th:bg-white/5 prose-th:p-3
            prose-td:text-slate-200/85 prose-td:p-3 prose-td:border-white/10
            prose-strong:text-white
            prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{
            __html: renderedHtml,
          }}
        />
      </section>

      {/* ── Verified Self-Hosted vs. SaaS Cost Savings Calculator ── */}
      {saasSlugMatch && (
        <section id="cost-calculator" className="scroll-mt-20">
          <SavingsCalculator
            saasSlug={saasSlugMatch}
            saasName={VERIFIED_SAAS_PRICING[saasSlugMatch].saasName}
          />
        </section>
      )}

      {/* ── Frequently Asked Questions ── */}
      <section id="comparison-faq" className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
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

      {relatedComparisons.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Related Comparisons</p>
          <h2 className="mt-2 font-display text-2xl text-white">
            More {toolA} &amp; {toolB} Matchups
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
            Related Engineering Deep Dives
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
            href="/best-free-developer-tools"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
          >
            Best Free Developer Tools
          </Link>
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
