const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.resolve(__dirname, "../.env.local");
const envText = fs.readFileSync(envPath, "utf8");
const getEnv = (key) => {
  const m = envText.match(new RegExp("^" + key + "=(.*)$", "m"));
  return m ? m[1].trim() : null;
};

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

async function resolveToolIds(slugs) {
  const { data } = await supabase
    .from("open_source_tools")
    .select("id, slug, status")
    .in("slug", slugs);

  const bySlug = new Map();
  for (const row of data || []) {
    const existing = bySlug.get(row.slug);
    // Prefer approved record if duplicate slugs exist
    if (!existing || String(row.status || "").toLowerCase() === "approved") {
      bySlug.set(row.slug, row.id);
    }
  }
  return slugs.map((s) => bySlug.get(s)).filter(Boolean);
}

const EXISTING_UPGRADES = [
  {
    slug: "best-authentication-tools-for-saas",
    toolSlugs: ["keycloak", "authentik", "supertokens", "logto", "teleport"],
  },
  {
    slug: "best-note-taking-apps-for-privacy",
    toolSlugs: [
      "appflowy",
      "affine-community-edition",
      "joplin",
      "standard-notes",
      "triliumnext-notes",
      "silverbullet",
      "memos",
    ],
  },
  {
    slug: "best-crm-for-government",
    toolSlugs: ["suitecrm", "espocrm", "odoo", "dolibarr", "twenty", "group-office"],
  },
  {
    slug: "best-crm-for-agencies",
    toolSlugs: ["twenty", "suitecrm", "espocrm", "nocodb", "baserow", "chatwoot"],
  },
];

const NEW_GUIDES = [
  {
    slug: "best-open-source-analytics-tools",
    meta_title: "6 Best Open-Source Analytics Tools (2026): Mixpanel & GA4 Alternatives",
    meta_description:
      "Compare 6 privacy-first self-hosted analytics engines replacing Mixpanel & Google Analytics: PostHog, Plausible, Umami, Matomo, Countly, and GoatCounter.",
    h1_title: "Best Open-Source Analytics & Product Telemetry Tools (2026)",
    intro_paragraph:
      "Whether escaping Mixpanel's steep MTU pricing or removing third-party cookies for strict EU GDPR compliance, self-hosting open-source analytics keeps clickstream telemetry inside your infrastructure at zero per-event surcharges.",
    toolSlugs: [
      "posthog",
      "plausible-analytics",
      "umami",
      "matomo",
      "countly-community-edition",
      "goatcounter",
    ],
    why_open_source:
      "Proprietary analytics vendors tax growth via MTU cliffs while collecting visitor IPs under third-party processors. Self-hosting PostHog or Umami eliminates ad-blocker loss, satisfies GDPR natively, and gives SQL access to raw events.",
    how_to_choose:
      "Choose PostHog for SaaS event funnels + session replay + feature flags on ClickHouse; pick Plausible or Umami for ultra-clean cookieless traffic & marketing goals under 200MB RAM; choose Countly for native mobile app telemetry.",
    related_vs_slugs: ["posthog-vs-mixpanel", "posthog-vs-amplitude", "matomo-vs-mixpanel", "countly-vs-mixpanel"],
    cta_text: "Compare All Mixpanel Alternatives →",
    cta_href: "/alternatives/mixpanel",
  },
  {
    slug: "best-open-source-api-testing-tools",
    meta_title: "5 Best Open-Source API Testing & Postman Alternatives (2026)",
    meta_description:
      "Escape forced Postman cloud logins & seat fees. Compare Hoppscotch, DreamFactory, Tyk, LocalStack, and n8n alongside Bruno & Yaak for offline & self-hosted API workflows.",
    h1_title: "Best Open-Source API Testing & Development Platforms (2026)",
    intro_paragraph:
      "API collections contain internal endpoints, bearer tokens, and architecture blueprints that shouldn't sit on forced vendor clouds. These open-source API platforms restore local speed, Docker team portals, and automated API testing pipelines.",
    toolSlugs: ["hoppscotch-community-edition", "dreamfactory", "tyk", "localstack", "n8n"],
    why_open_source:
      "Self-hosting Hoppscotch or adopting offline `.bru` Git files prevents sensitive API keys from leaking into third-party workspaces while cutting $19–$33/developer monthly licensing fees to zero.",
    how_to_choose:
      "Use Hoppscotch for instant browser + self-hosted team workspaces across REST, GraphQL & WebSockets; pair LocalStack + n8n for local AWS API mocking and automated webhook endpoint suites.",
    related_vs_slugs: ["hoppscotch-vs-postman", "bruno-vs-postman", "bruno-vs-hoppscotch"],
    cta_text: "View All Postman Alternatives →",
    cta_href: "/alternatives/postman",
  },
  {
    slug: "best-open-source-website-change-detection-tools",
    meta_title: "5 Best Open-Source Website Change Detection & Monitoring Tools (2026)",
    meta_description:
      "Monitor web page updates, price drops, and uptime without Visualping check caps. Compare Changedetection.io, Uptime Kuma, Gatus, Healthchecks, and Kestra.",
    h1_title: "Best Open-Source Website Change Detection & Alert Tools (2026)",
    intro_paragraph:
      "Tracking price changes, GPU restocks, competitor pricing edits, and government compliance documents shouldn't cost $50/mo on Visualping. Deploy these self-hosted open-source monitoring engines on Docker for unlimited checks and webhooks.",
    toolSlugs: ["changedetectionio", "uptime-kuma", "gatus", "healthchecks", "kestra"],
    why_open_source:
      "Commercial watchers throttle check frequency behind expensive tiers and forbid scraping logged-in internal portals. Self-hosting unlocks 1-minute Playwright JS monitoring privately across unlimited URLs.",
    how_to_choose:
      "Pick Changedetection.io for DOM element diffing, price drops, PDF monitoring, and Playwright browser logins; pair it with Uptime Kuma or Gatus for 20-second endpoint SLA uptime & SSL alerts.",
    related_vs_slugs: ["changedetection-io-vs-visualping", "changedetection-io-vs-uptime-kuma"],
    cta_text: "Explore All Visualping Alternatives →",
    cta_href: "/alternatives/visualping",
  },
  {
    slug: "best-open-source-log-management-tools",
    meta_title: "6 Best Open-Source Log Management & ELK Alternatives (2026)",
    meta_description:
      "Replace Datadog Logs & heavy Elastic clusters with S3-backed Rust/Go engines. Compare OpenObserve, ZincSearch, Grafana, VictoriaMetrics, Beszel, and GoAccess.",
    h1_title: "Best Open-Source Log Management & Observability Tools (2026)",
    intro_paragraph:
      "Datadog log indexing and JVM-heavy Elasticsearch clusters regularly consume more budget than production databases. Modern Rust and Go observability tools store compressed Parquet logs natively on S3 at up to 90% lower compute cost.",
    toolSlugs: ["openobserveai", "zincsearch", "grafana", "victoriametrics", "beszel", "goaccess"],
    why_open_source:
      "Modern Rust engines eliminate Java garbage collection freezes and $0.10/GB ingestion taxes while keeping sensitive trace and authentication logs encrypted inside your own VPC.",
    how_to_choose:
      "Choose OpenObserve for unified S3-backed logs, SQL queries & OTel traces; use ZincSearch for lightweight single-node log search; pick GoAccess for real-time terminal/HTML Nginx access analysis.",
    related_vs_slugs: [
      "openobserve-vs-datadog",
      "openobserve-vs-elasticsearch",
      "openobserve-vs-signoz",
      "openobserve-vs-grafana-loki",
    ],
    cta_text: "Compare All Datadog Alternatives →",
    cta_href: "/alternatives/datadog",
  },
  {
    slug: "best-open-source-social-media-schedulers",
    meta_title: "5 Best Open-Source Social Media Schedulers (2026 Buffer & Hootsuite Alternatives)",
    meta_description:
      "Automate X, LinkedIn, Instagram & Reddit calendars without $99/mo Hootsuite seats. Compare Postiz, Mixpost, n8n, Activepieces, and LinkStack.",
    h1_title: "Best Open-Source Social Media Schedulers & Growth Tools (2026)",
    intro_paragraph:
      "Agencies and SaaS marketing teams get squeezed by per-channel and per-seat fees across Buffer and Hootsuite. These self-hosted open-source schedulers combine clean visual calendars, AI content generation, and workflow hooks.",
    toolSlugs: ["postiz", "mixpost", "n8n", "activepieces", "linkstack"],
    why_open_source:
      "Hootsuite charges $99+/user/mo while capping connected brand profiles. Self-hosting Postiz or Mixpost via Docker gives agencies unlimited team seats, AI post generation, and programmatic API publishing.",
    how_to_choose:
      "Pick Postiz for Next.js + AI drafting + multi-platform API automation; pick Mixpost if your agency runs PHP/Laravel infrastructure; pair with n8n to auto-schedule blog & GitHub release announcements.",
    related_vs_slugs: ["postiz-vs-buffer", "postiz-vs-hootsuite"],
    cta_text: "Compare All Buffer Alternatives →",
    cta_href: "/alternatives/buffer",
  },
  {
    slug: "best-open-source-document-signing-tools",
    meta_title: "5 Best Open-Source Document Signing & DocuSign Alternatives (2026)",
    meta_description:
      "Send unlimited legally compliant PDF contracts without DocuSign envelope limits. Compare DocuSeal, Documenso, OpenSign, docassemble, and BentoPDF.",
    h1_title: "Best Open-Source Document Signing & PDF Workflow Tools (2026)",
    intro_paragraph:
      "DocuSign's $40/user/month plans strictly cap sent envelopes and force client PII through proprietary vendor servers. Self-hosted e-signature platforms comply with ESIGN and eIDAS while unlocking unlimited contracts and API webhooks.",
    toolSlugs: ["docuseal", "documenso", "opensign", "docassemble", "bentopdf"],
    why_open_source:
      "Legal, fintech, HR, and agency teams self-host e-signature infrastructure to store signed NDAs and employment contracts strictly on encrypted private disks while removing per-envelope SaaS billing.",
    how_to_choose:
      "Deploy DocuSeal for rapid single-container setup and rich conditional PDF form templates; pick Documenso if your engineering team wants a Next.js/TypeScript codebase; choose OpenSign for straightforward PDF signing workflows.",
    related_vs_slugs: ["docuseal-vs-docusign", "documenso-vs-docusign", "docuseal-vs-documenso"],
    cta_text: "Browse All DocuSign Alternatives →",
    cta_href: "/alternatives/docusign",
  },
  {
    slug: "best-open-source-paas-platforms",
    meta_title: "5 Best Open-Source PaaS Platforms (2026 Vercel, Heroku & Railway Alternatives)",
    meta_description:
      "Deploy Next.js, Node, Python, Postgres & Redis on a $5 VPS via Git push. Compare Coolify, Dokploy, CapRover, Dokku, and Portainer.",
    h1_title: "Best Open-Source Self-Hosted PaaS Platforms (2026)",
    intro_paragraph:
      "Managed cloud PaaS providers charge 400%+ markups over raw Hetzner or AWS hardware once bandwidth and database replicas scale. Open-source PaaS controllers turn any Ubuntu VPS into a sleek Heroku/Vercel workflow with automated Let's Encrypt SSL.",
    toolSlugs: ["coolify", "dokploy", "caprover", "dokku", "portainer"],
    why_open_source:
      "Self-hosting Coolify or Dokploy lets teams escape Vercel's $40/100GB bandwidth taxes, eliminate serverless cold-start timeouts, and colocate Next.js apps beside dedicated Postgres/Redis containers on flat-rate servers.",
    how_to_choose:
      "Choose Coolify for full multi-server homelab/startup infrastructure; choose Dokploy for ultra-responsive Traefik + Docker Compose SaaS deploys; choose Dokku if you love pure CLI `git push` Heroku workflows on minimal RAM.",
    related_vs_slugs: [
      "dokploy-vs-vercel",
      "coolify-vs-vercel",
      "dokploy-vs-railway",
      "coolify-vs-railway",
    ],
    cta_text: "Explore All Vercel Alternatives →",
    cta_href: "/alternatives/vercel",
  },
  {
    slug: "best-open-source-database-guis-and-airtable-alternatives",
    meta_title: "5 Best Open-Source Database GUIs & Airtable Alternatives (2026)",
    meta_description:
      "Manage 100K+ rows cleanly on PostgreSQL & SQLite with zero record caps. Compare NocoDB, Baserow, Grist, drawDB, and Supabase Studio.",
    h1_title: "Best Open-Source Smart Databases & Airtable Alternatives (2026)",
    intro_paragraph:
      "Airtable stops at 50,000 rows per base while billing $20+ for every operations viewer. These open-source relational spreadsheet interfaces layer Kanban boards, forms, Python formulas, and instant REST APIs atop real SQL engines.",
    toolSlugs: ["nocodb", "baserow", "grist", "drawdb", "supabase"],
    why_open_source:
      "Running NocoDB or Baserow against your own PostgreSQL database preserves strict ACID integrity, handles 100K–1M+ rows cleanly, and exposes automated webhooks without rate limits.",
    how_to_choose:
      "Pick NocoDB to put an Airtable UI over existing production SQL tables; pick Baserow (MIT core) for scalable tables + customer app portals; pick Grist (Apache-2.0) when finance/ops teams rely on Python cell formulas.",
    related_vs_slugs: ["nocodb-vs-airtable", "baserow-vs-airtable", "nocodb-vs-baserow"],
    cta_text: "Browse All Airtable Alternatives →",
    cta_href: "/alternatives/airtable",
  },
  {
    slug: "best-open-source-password-managers",
    meta_title: "5 Best Open-Source Password & Secrets Managers (2026)",
    meta_description:
      "Secure team credentials & .env API secrets privately via Docker. Compare Vaultwarden, Bitwarden, Passbolt, Psono, and Infisical.",
    h1_title: "Best Open-Source Password & Secrets Managers (2026)",
    intro_paragraph:
      "Following high-profile proprietary vault breaches and subscription upsells, organizations increasingly audit and self-host open-source credential managers across browser extensions and CI/CD developer pipelines alike.",
    toolSlugs: ["vaultwarden", "bitwarden", "passbolt", "psono", "infisical-community-edition"],
    why_open_source:
      "Zero-knowledge encryption only earns trust when clients and servers are publicly auditable. Self-hosting removes multi-device restrictions, unlocks hardware passkeys/YubiKeys, and prevents third-party vendor breaches.",
    how_to_choose:
      "Use Vaultwarden for featherweight 50MB RAM family/startup hosting compatible with all Bitwarden apps; pick Passbolt for PGP-audited agency credential sharing; deploy Infisical specifically for CI/CD & Kubernetes `.env` secrets.",
    related_vs_slugs: ["vaultwarden-vs-1password", "infisical-vs-hashicorp-vault"],
    cta_text: "Compare All 1Password Alternatives →",
    cta_href: "/alternatives/1password",
  },
  {
    slug: "best-open-source-business-intelligence-tools",
    meta_title: "5 Best Open-Source Business Intelligence (BI) Tools (2026 Tableau Alternatives)",
    meta_description:
      "Eliminate $75/Creator Tableau & Power BI viewer fees. Compare Metabase, Apache Superset, Redash, Apache Druid, and Grafana.",
    h1_title: "Best Open-Source Business Intelligence & Dashboard Tools (2026)",
    intro_paragraph:
      "Charging per Viewer seat on Tableau or Power BI kills company-wide data visibility. Open-source BI tools deploy over Docker and connect straight to PostgreSQL, ClickHouse, DuckDB, and BigQuery so everyone explores metrics freely.",
    toolSlugs: ["metabase", "superset", "redash", "druid", "grafana"],
    why_open_source:
      "Per-user BI licensing discourages sharing KPI dashboards across product, support, and executive teams. Self-hosted BI delivers automated Slack digests, drill-down filters, and customer-facing embeds with unlimited users.",
    how_to_choose:
      "Choose Metabase for 5-minute onboarding and visual no-SQL exploration; choose Apache Superset (Apache-2.0) for massive scale, SQL Lab, and 50+ chart types; use Redash when engineers live purely in SQL alerts.",
    related_vs_slugs: ["metabase-vs-tableau"],
    cta_text: "Compare All Tableau Alternatives →",
    cta_href: "/alternatives/tableau",
  },
];

async function main() {
  console.log("=== Upgrading 4 existing industry guides ===");
  for (const upg of EXISTING_UPGRADES) {
    const toolIds = await resolveToolIds(upg.toolSlugs);
    const { error } = await supabase
      .from("industry_pages")
      .update({ tool_ids: toolIds })
      .eq("slug", upg.slug);
    if (error) {
      console.error(`Failed upgrade ${upg.slug}:`, error.message);
    } else {
      console.log(`✓ Fixed tool count on ${upg.slug}: ${toolIds.length} tools`);
    }
  }

  console.log("=== Upserting 10 new blog buyer guides ===");
  let success = 0;
  for (const guide of NEW_GUIDES) {
    const toolIds = await resolveToolIds(guide.toolSlugs);
    const payload = {
      slug: guide.slug,
      meta_title: guide.meta_title,
      meta_description: guide.meta_description,
      h1_title: guide.h1_title,
      intro_paragraph: guide.intro_paragraph,
      tool_ids: toolIds,
      why_open_source: guide.why_open_source,
      how_to_choose: guide.how_to_choose,
      related_vs_slugs: guide.related_vs_slugs,
      cta_text: guide.cta_text,
      cta_href: guide.cta_href,
      status: "published",
    };

    const { data: existing } = await supabase
      .from("industry_pages")
      .select("id")
      .eq("slug", guide.slug)
      .maybeSingle();

    const res = existing?.id
      ? await supabase.from("industry_pages").update(payload).eq("id", existing.id)
      : await supabase.from("industry_pages").insert(payload);

    if (res.error) {
      console.error(`Failed ${guide.slug}:`, res.error.message);
    } else {
      success++;
      console.log(`✓ ${existing ? "Updated" : "Inserted"}: /${guide.slug} (${toolIds.length} tools linked)`);
    }
  }
  console.log(`Done: ${success}/${NEW_GUIDES.length} new blog buyer guides live.`);
}

main();
