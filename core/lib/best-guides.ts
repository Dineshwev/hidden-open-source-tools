export type BestGuideItem = {
  slug: string;
  href: string;
  title: string;
  category: string;
  summary: string;
  topTools: string;
};

export const BEST_TOOL_GUIDES: BestGuideItem[] = [
  {
    slug: "best-crm-for-agencies",
    href: "/best-crm-for-agencies",
    title: "Best Open-Source CRM for Agencies (2026)",
    category: "CRM & Sales",
    summary:
      "Multi-pipeline deal tracking, client portals, and unlimited team seats without HubSpot or Salesforce per-seat lock-in.",
    topTools: "Twenty, Erxes, SuiteCRM, EspoCRM, Monica",
  },
  {
    slug: "best-project-management-for-startups",
    href: "/best-project-management-for-startups",
    title: "Best Open-Source Project Management for Startups",
    category: "Project Management",
    summary:
      "Fast issue tracking, sprint cycles, roadmaps, and real-time docs that replace Jira, Linear, and Asana.",
    topTools: "Plane, Huly, AppFlowy, Focalboard, Vikunja",
  },
  {
    slug: "best-crm-for-government",
    href: "/best-crm-for-government",
    title: "Best Open-Source CRM for Government & Public Sector",
    category: "Public Sector & Compliance",
    summary:
      "100% on-premise, air-gapped capable constituent case management and audit-logged CRM platforms with strict data sovereignty.",
    topTools: "SuiteCRM, EspoCRM, CiviCRM, Corteza, Odoo",
  },
  {
    slug: "best-devops-monitoring-tools",
    href: "/best-devops-monitoring-tools",
    title: "Best Open-Source DevOps Monitoring & Observability Tools",
    category: "DevOps & Observability",
    summary:
      "OpenTelemetry APM, distributed tracing, log aggregation, and status pages to cut Datadog and New Relic bills by 80%+.",
    topTools: "SigNoz, Grafana, Prometheus, Uptime Kuma, Netdata",
  },
  {
    slug: "best-self-hosted-apps-for-homelab",
    href: "/best-self-hosted-apps-for-homelab",
    title: "Best Self-Hosted Open-Source Apps for Homelab",
    category: "Self-Hosting & Homelab",
    summary:
      "Essential Docker-ready self-hosted apps for private cloud storage, photo backup, password management, and PaaS deployment.",
    topTools: "Immich, Nextcloud, Jellyfin, Vaultwarden, Coolify",
  },
  {
    slug: "best-open-source-ai-tools-for-developers",
    href: "/best-open-source-ai-tools-for-developers",
    title: "Best Open-Source AI & LLM Tools for Developers",
    category: "AI & Local LLMs",
    summary:
      "Run local LLMs, build RAG pipelines, orchestrate multi-agent workflows, and trace prompts without sending code to third-party APIs.",
    topTools: "Ollama, Open WebUI, Dify, Langfuse, AnythingLLM",
  },
  {
    slug: "best-note-taking-apps-for-privacy",
    href: "/best-note-taking-apps-for-privacy",
    title: "Best Open-Source Note-Taking Apps for Privacy",
    category: "Knowledge & PKM",
    summary:
      "Local-first markdown workspaces, end-to-end encryption, and self-hosted team wikis that replace Notion and Evernote.",
    topTools: "AppFlowy, AFFiNE, Logseq, Joplin, Outline",
  },
  {
    slug: "best-authentication-tools-for-saas",
    href: "/best-authentication-tools-for-saas",
    title: "Best Open-Source Authentication & Identity Tools for SaaS",
    category: "Auth & Security",
    summary:
      "Enterprise SAML/OIDC SSO, passkeys, MFA, and multi-tenant RBAC without Auth0 or Clerk monthly active user (MAU) price cliffs.",
    topTools: "Keycloak, Authentik, Zitadel, SuperTokens, Hanko",
  },
  {
    slug: "best-internal-tool-builders",
    href: "/best-internal-tool-builders",
    title: "Best Open-Source Internal Tool Builders & Retool Alternatives",
    category: "Low-Code & Admin Panels",
    summary:
      "Build admin panels, CRUD dashboards, and customer portals over PostgreSQL, REST, and GraphQL without per-end-user licensing.",
    topTools: "Appsmith, ToolJet, Budibase, NocoDB, Baserow",
  },
  {
    slug: "best-workflow-automation-tools",
    href: "/best-workflow-automation-tools",
    title: "Best Open-Source Workflow Automation Tools (Zapier Alternatives)",
    category: "Automation & Pipelines",
    summary:
      "Self-hosted visual workflow automation and background job orchestrators with unlimited executions and zero per-task fees.",
    topTools: "n8n, Activepieces, Windmill, Trigger.dev, Node-RED",
  },
  {
    slug: "best-open-source-analytics-tools",
    href: "/best-open-source-analytics-tools",
    title: "Best Open-Source Analytics & Product Telemetry Tools (2026)",
    category: "Analytics & Telemetry",
    summary:
      "Privacy-first, self-hosted replacements for Mixpanel and Google Analytics without cookie banners or MTU overage bills.",
    topTools: "PostHog, Plausible, Umami, Matomo, Countly",
  },
  {
    slug: "best-open-source-api-testing-tools",
    href: "/best-open-source-api-testing-tools",
    title: "Best Open-Source API Testing Tools (Postman Alternatives)",
    category: "API & Developer Tools",
    summary:
      "Self-hosted browser workspaces, offline Git-native clients, and API gateways without forced Postman cloud accounts.",
    topTools: "Hoppscotch, DreamFactory, Tyk, LocalStack, n8n",
  },
  {
    slug: "best-open-source-website-change-detection-tools",
    href: "/best-open-source-website-change-detection-tools",
    title: "Best Open-Source Website Change Detection & Alert Tools (2026)",
    category: "Monitoring & Alerts",
    summary:
      "Unlimited webpage diffs, price drop alerts, Playwright SPA scraping, and 20s uptime monitors on a $5 VPS.",
    topTools: "Changedetection.io, Uptime Kuma, Gatus, Healthchecks, Kestra",
  },
  {
    slug: "best-open-source-log-management-tools",
    href: "/best-open-source-log-management-tools",
    title: "Best Open-Source Log Management & ELK Alternatives (2026)",
    category: "Logs & Observability",
    summary:
      "S3-backed Rust/Go log compression and metrics pipelines cutting Datadog Log & Elasticsearch RAM bills by 90%.",
    topTools: "OpenObserve, ZincSearch, Grafana, VictoriaMetrics, Beszel",
  },
  {
    slug: "best-open-source-social-media-schedulers",
    href: "/best-open-source-social-media-schedulers",
    title: "Best Open-Source Social Media Schedulers (Buffer & Hootsuite Alternatives)",
    category: "Marketing & Growth",
    summary:
      "Multi-platform social calendars, AI post generation, and webhook automation without $99/user Hootsuite seats.",
    topTools: "Postiz, Mixpost, n8n, Activepieces, LinkStack",
  },
  {
    slug: "best-open-source-document-signing-tools",
    href: "/best-open-source-document-signing-tools",
    title: "Best Open-Source Document Signing & PDF Workflow Tools (2026)",
    category: "Legal & Compliance",
    summary:
      "Legally binding ESIGN/eIDAS PDF signatures, conditional intake forms, and self-hosted workflows replacing DocuSign.",
    topTools: "DocuSeal, Documenso, OpenSign, docassemble, BentoPDF",
  },
  {
    slug: "best-open-source-paas-platforms",
    href: "/best-open-source-paas-platforms",
    title: "Best Open-Source Self-Hosted PaaS Platforms (Vercel & Heroku Alternatives)",
    category: "Cloud & Deployment",
    summary:
      "Turn any Ubuntu VPS into an automated Git push cloud with Let's Encrypt SSL, preview branches, and managed Postgres.",
    topTools: "Coolify, Dokploy, CapRover, Dokku, Portainer",
  },
  {
    slug: "best-open-source-database-guis-and-airtable-alternatives",
    href: "/best-open-source-database-guis-and-airtable-alternatives",
    title: "Best Open-Source Smart Databases & Airtable Alternatives (2026)",
    category: "Databases & Operations",
    summary:
      "Manage 100K+ rows cleanly over PostgreSQL & SQLite with Kanban views, Python formulas, and zero record caps.",
    topTools: "NocoDB, Baserow, Grist, drawDB, Supabase",
  },
  {
    slug: "best-open-source-password-managers",
    href: "/best-open-source-password-managers",
    title: "Best Open-Source Password & Secrets Managers (2026)",
    category: "Security & Secrets",
    summary:
      "Publicly audited zero-knowledge password vaults and Kubernetes `.env` secret managers replacing LastPass and 1Password.",
    topTools: "Vaultwarden, Bitwarden, Passbolt, Psono, Infisical",
  },
  {
    slug: "best-open-source-business-intelligence-tools",
    href: "/best-open-source-business-intelligence-tools",
    title: "Best Open-Source Business Intelligence (BI) Tools (2026)",
    category: "BI & Dashboards",
    summary:
      "Self-hosted visual SQL & no-code executive dashboards over Postgres and ClickHouse without $75/Creator Tableau fees.",
    topTools: "Metabase, Superset, Redash, Druid, Grafana",
  },
];
