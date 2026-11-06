export interface CategoryMeta {
  slug: string;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

export const CATEGORIES_DATA: Record<string, CategoryMeta> = {
  "developer-tools": {
    slug: "developer-tools",
    label: "Developer Tools",
    tagline: "CLIs, SDKs, APIs, and modern engineering utilities",
    description: "Discover production-grade open-source developer tools, local dev servers, code review platforms, and testing suites. Built to accelerate developer velocity without vendor lock-in.",
    icon: "💻",
    keywords: ["developer tools", "cli", "sdk", "api", "testing", "compiler", "ide", "git"],
    faqs: [
      {
        question: "What are the best open-source developer tools?",
        answer: "Top open-source developer tools include Gitea (self-hosted Git), MeiliSearch (lightning-fast search), PocketBase (single-binary backend), and Coolify (self-hosted PaaS).",
      },
      {
        question: "Can I use these developer tools for commercial projects?",
        answer: "Yes, most curated developer tools on The Cloud Rain are distributed under permissive open-source licenses like MIT, Apache 2.0, and BSD, allowing free commercial use.",
      },
      {
        question: "Are these developer tools difficult to self-host?",
        answer: "Every tool in this directory provides Docker container definitions or single-binary executables for straightforward self-hosting on your private infrastructure.",
      },
    ],
  },
  "self-hosting-infrastructure": {
    slug: "self-hosting-infrastructure",
    label: "Self-Hosting & Infrastructure",
    tagline: "PaaS, hypervisors, server automation, and private clouds",
    description: "Replace costly cloud services (Heroku, Vercel, AWS ECS) with self-hosted application platforms, virtualization engines, and homelab infrastructure. Maintain 100% control of your compute.",
    icon: "🖥️",
    keywords: ["self-hosting", "infrastructure", "docker", "kubernetes", "homelab", "server", "paas", "vps"],
    faqs: [
      {
        question: "What is the easiest self-hosted PaaS to replace Heroku or Vercel?",
        answer: "Coolify, Dokku, and CapRover are the leading self-hosted platforms that allow 1-click deployments of Git repositories, databases, and Docker containers directly on any VPS.",
      },
      {
        question: "What hardware or VPS do I need to start self-hosting?",
        answer: "Most self-hosted infrastructure tools run comfortably on modest VPS instances starting at 2GB RAM and 1 vCPU (such as Hetzner, DigitalOcean, or a Raspberry Pi / mini PC homelab).",
      },
      {
        question: "How do I secure self-hosted infrastructure?",
        answer: "We recommend placing services behind a reverse proxy (like Traefik, Caddy, or Nginx Proxy Manager) with automated TLS/HTTPS certificates, SSH key authentication, and automated backup volumes.",
      },
    ],
  },
  "analytics-search": {
    slug: "analytics-search",
    label: "Analytics & Search",
    tagline: "Privacy-first metrics, time-series logging, and full-text search",
    description: "Track web traffic, monitor uptime, and execute instant full-text search queries while respecting visitor privacy. Compliant with GDPR, PECR, and CCPA out of the box.",
    icon: "📊",
    keywords: ["analytics", "search", "metrics", "monitoring", "uptime", "logs", "full-text", "privacy"],
    faqs: [
      {
        question: "Can open-source analytics replace Google Analytics?",
        answer: "Yes. Plausible and Umami are lightweight, privacy-focused open-source analytics tools that track visitor metrics accurately without cookie banners or third-party tracking.",
      },
      {
        question: "What is the fastest open-source alternative to Algolia?",
        answer: "MeiliSearch and Typesense are fast, typo-tolerant open-source search engines engineered as direct replacements for Algolia and Elasticsearch.",
      },
      {
        question: "What tool should I use for server and website uptime monitoring?",
        answer: "Uptime Kuma is a self-hosted monitoring tool featuring real-time status pages, SSL expiry alerts, and multiple notification channels (Telegram, Discord, Slack, Email).",
      },
    ],
  },
  "media-utilities": {
    slug: "media-utilities",
    label: "Media & Utilities",
    tagline: "Audio, video, image processing, and format conversion",
    description: "Curated open-source software for image compression, video transcode pipelines, audio editing, and document processing without monthly SaaS subscriptions.",
    icon: "🎨",
    keywords: ["media", "utilities", "image", "video", "audio", "converter", "streaming", "transcoding"],
    faqs: [
      {
        question: "Are there open-source alternatives to Adobe Media and Canva?",
        answer: "Yes. Tools like Photopea, Penpot, and Krita offer robust graphic and image design workflows, while tools like HandBrake and Jellyfin handle media encoding and home streaming.",
      },
      {
        question: "Can I automate video and image compression locally?",
        answer: "Open-source CLI and container utilities like FFmpeg, OptiPNG, and ImageMagick can be integrated into your self-hosted Docker workflows for automated pipeline processing.",
      },
    ],
  },
  "productivity": {
    slug: "productivity",
    label: "Productivity",
    tagline: "Wikis, note-taking, project management, and calendars",
    description: "Eliminate Notion and Jira subscription costs with open-source collaboration platforms, private knowledge graphs, and markdown-based workspaces.",
    icon: "📝",
    keywords: ["productivity", "notes", "wiki", "notion", "jira", "kanban", "calendar", "workflow"],
    faqs: [
      {
        question: "What is the best self-hosted alternative to Notion?",
        answer: "AppFlowy, Memos, and AFFiNE provide offline-first, markdown-supported document and wiki capabilities with end-to-end privacy.",
      },
      {
        question: "What open-source tool replaces Jira for agile teams?",
        answer: "Plane is an open-source project management platform built to mirror Jira and Linear with sprints, backlog triage, and issue matrices.",
      },
    ],
  },
  "security": {
    slug: "security",
    label: "Security & Authentication",
    tagline: "Identity management, secret vaults, and vulnerability detection",
    description: "Fortify your architecture with self-hosted password vaults, OAuth2/OIDC identity providers, zero-trust tunnels, and automated security scanners.",
    icon: "🛡️",
    keywords: ["security", "auth", "oauth", "jwt", "vault", "identity", "passwords", "encryption"],
    faqs: [
      {
        question: "What is the best open-source password manager?",
        answer: "Vaultwarden is a lightweight, single-binary Rust implementation of the Bitwarden API, making it ideal for self-hosting on low-resource hardware.",
      },
      {
        question: "How can I replace Auth0 or Okta with open source?",
        answer: "Keycloak, Authelia, and Authentik are identity and access management (IAM) platforms supporting Single Sign-On (SSO), MFA, and OIDC federation.",
      },
    ],
  },
  "business-tools": {
    slug: "business-tools",
    label: "Business Tools",
    tagline: "CRMs, invoicing, bookkeeping, and operational ERPs",
    description: "Operate your business with open-source tools: manage customer relationships, issue professional invoices, and maintain financial books with zero per-seat SaaS taxes.",
    icon: "💼",
    keywords: ["business", "crm", "invoicing", "billing", "erp", "sales", "accounting"],
    faqs: [
      {
        question: "Is there an open-source alternative to Salesforce or HubSpot?",
        answer: "Twenty is an open-source CRM with visual pipelines, contact management, and modern GraphQL/REST APIs.",
      },
      {
        question: "Can I self-host invoicing and client billing?",
        answer: "Yes, Invoice Ninja is a self-hosted platform for invoicing, payment gateway integration, time tracking, and expense logging.",
      },
    ],
  },
  "community-events": {
    slug: "community-events",
    label: "Community & Events",
    tagline: "Forums, group messaging, and community gathering spaces",
    description: "Build thriving developer communities, host interactive forums, and schedule team events without giving up user data to commercial networks.",
    icon: "👥",
    keywords: ["community", "events", "chat", "forum", "messaging", "discussion", "meetup"],
    faqs: [
      {
        question: "What is the best open-source alternative to Slack and Discord?",
        answer: "Mattermost and Zulip offer team messaging with threaded conversations, channel permissions, and self-hosted server deployments.",
      },
      {
        question: "How can I host a community discussion forum?",
        answer: "Discourse is an open-source forum platform used by thousands of engineering communities worldwide.",
      },
    ],
  },
};

export function getAllCategorySlugs(): string[] {
  return Object.keys(CATEGORIES_DATA);
}

export function getCategoryMeta(slug: string): CategoryMeta | null {
  return CATEGORIES_DATA[slug] || null;
}
