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
];
