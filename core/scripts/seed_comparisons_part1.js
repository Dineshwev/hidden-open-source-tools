const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const env = dotenv.parse(fs.readFileSync(path.resolve(__dirname, "../.env.local")));
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const nowIso = new Date().toISOString();

function buildMarkdown({ tool_a, tool_b, intro, verdict_a, verdict_b, rows, what_a, what_b, t1_title, t1_body, t2_title, t2_body, pros_a, cons_a, pros_b, cons_b, final_rec }) {
  const table = [
    `| Feature | ${tool_a} | ${tool_b} |`,
    `|---|---|---|`,
    ...rows.map(([f, a, b]) => `| **${f}** | ${a} | ${b} |`),
  ].join("\n");

  return `## ${tool_a} vs ${tool_b}: Which Should You Choose in 2026?

${intro}

## Quick Verdict

- **Choose ${tool_a} if:** ${verdict_a}
- **Choose ${tool_b} if:** ${verdict_b}

## Side-by-Side Comparison

${table}

## What is ${tool_a}?

${what_a}

## What is ${tool_b}?

${what_b}

## Head-to-Head: Practical Tradeoffs

### 1. ${t1_title}
${t1_body}

### 2. ${t2_title}
${t2_body}

## Pros and Cons

### ${tool_a}
- **Pros:** ${pros_a}
- **Cons:** ${cons_a}

### ${tool_b}
- **Pros:** ${pros_b}
- **Cons:** ${cons_b}

## Final Recommendation

${final_rec}
`;
}

const COMPARISONS_PART1 = [
  {
    slug: "signoz-vs-datadog",
    tool_a: "SigNoz",
    tool_b: "Datadog",
    intro: "SigNoz and Datadog are full-stack observability platforms uniting logs, metrics, and distributed traces in a single pane of glass. While Datadog is the dominant commercial cloud APM, its per-host, per-GB, and custom metric billing frequently causes surprise five-figure cloud bills. SigNoz is built natively on OpenTelemetry and ClickHouse, enabling engineering teams to self-host enterprise observability at a fraction of the cost.",
    verdict_a: "you want native OpenTelemetry instrumentation, fast ClickHouse log/trace queries, complete data ownership, and 80%+ lower observability costs via Docker or Kubernetes self-hosting.",
    verdict_b: "you run a large enterprise budget that requires 700+ turnkey vendor integrations, managed SIEM security modules, and zero infrastructure maintenance.",
    rows: [
      ["License & Openness", "Open Source (MIT / SigNoz)", "Proprietary Commercial SaaS"],
      ["Telemetry Standard", "100% OpenTelemetry Native", "Proprietary Agent + OTel support"],
      ["Storage Engine", "ClickHouse (Columnar OLAP)", "Proprietary SaaS Cloud Backend"],
      ["Self-Hosting", "Docker Compose & Kubernetes Helm", "Cloud-only (No self-hosting)"],
      ["Pricing Model", "$0 Self-Hosted / Usage-based Cloud", "$15–$31+/host + per-GB logs + custom metrics"],
    ],
    what_a: "SigNoz is an open-source APM and observability platform designed as a direct alternative to Datadog. Powered by ClickHouse, it ingests OpenTelemetry traces, metrics, and logs into a unified UI with flamegraphs, service maps, and dashboards.",
    what_b: "Datadog is a commercial cloud monitoring and security platform offering infrastructure metrics, APM, log management, RUM, and cloud SIEM across hundreds of cloud providers.",
    t1_title: "Predictable Infrastructure Cost vs Per-Host Billing",
    t1_body: "Datadog charges separately for infrastructure hosts, APM hosts, ingested log GBs, and custom metrics. SigNoz eliminates multi-dimensional billing penalties—when self-hosted with ClickHouse, you pay only for raw disk and compute.",
    t2_title: "OpenTelemetry Portability",
    t2_body: "SigNoz uses standard OpenTelemetry SDKs, meaning your instrumentation code stays 100% portable with zero proprietary SDK lock-in.",
    pros_a: "OpenTelemetry-native; fast ClickHouse aggregations; zero per-host licensing; unified traces, metrics, and logs.",
    cons_a: "Smaller catalog of out-of-the-box vendor dashboards compared to Datadog.",
    pros_b: "700+ turnkey integrations; mature RUM, synthetics, and security products; fully managed.",
    cons_b: "Complex, high pricing; aggressive annual contract lock-in; data leaves your private VPC.",
    final_rec: "For startups and scaling engineering teams already adopting OpenTelemetry, **SigNoz** delivers 90% of Datadog's daily APM, log, and trace workflows while cutting observability spend by 70–90%."
  },
  {
    slug: "signoz-vs-new-relic",
    tool_a: "SigNoz",
    tool_b: "New Relic",
    intro: "SigNoz and New Relic both provide unified APM, distributed tracing, and log management for modern microservices. New Relic charges steeply for Full Platform User seats ($99–$549/user/mo) alongside data ingestion, while SigNoz offers an open-source, self-hostable alternative with unlimited team seats.",
    verdict_a: "you want unlimited developer seats, self-hosted data privacy on ClickHouse, and native OpenTelemetry without a per-user seat tax.",
    verdict_b: "you want a fully managed SaaS with NRQL querying and don't mind paying per full-platform engineer seat.",
    rows: [
      ["License", "Open Source", "Proprietary SaaS"],
      ["User Seat Pricing", "$0 (Unlimited users)", "$99–$549/month per Full Platform User"],
      ["Data Backend", "ClickHouse", "New Relic NRDB"],
      ["Self-Hosting", "Yes (Docker & Kubernetes)", "No (SaaS only)"],
    ],
    what_a: "SigNoz is an open-source observability platform uniting APM, logs, metrics, and exceptions on top of ClickHouse and OpenTelemetry.",
    what_b: "New Relic is a cloud-based observability platform known for its NRQL query language, APM agents, and browser/mobile monitoring.",
    t1_title: "Unlimited Engineers vs Per-Seat Observability Tax",
    t1_body: "New Relic's per-seat pricing discourages companies from giving every developer access to production observability. Self-hosted SigNoz lets your entire engineering org debug production with zero seat fees.",
    t2_title: "Standard SQL vs Proprietary NRQL",
    t2_body: "SigNoz gives you both a visual query builder and standard ClickHouse SQL, whereas New Relic locks custom dashboards into proprietary NRQL.",
    pros_a: "Unlimited user seats; self-hostable in your own VPC; fast ClickHouse engine; native OpenTelemetry.",
    cons_a: "You manage your own ClickHouse storage retention when self-hosting.",
    pros_b: "Generous 100GB free ingest tier for 1 user; mature browser RUM and mobile crash reporting.",
    cons_b: "Expensive per-user seat scaling; data residency locked to New Relic cloud.",
    final_rec: "Choose **SigNoz** if you have a growing engineering team and want every developer to have full APM and log access without New Relic's per-seat licensing."
  },
  {
    slug: "dokploy-vs-vercel",
    tool_a: "Dokploy",
    tool_b: "Vercel",
    intro: "Dokploy and Vercel both streamline deploying Next.js, Node.js, and full-stack web applications directly from Git. Vercel provides a zero-ops serverless edge cloud, while Dokploy turns any $5–$20 VPS into a complete self-hosted PaaS with Docker, Traefik, and one-click databases.",
    verdict_a: "you want predictable flat-rate VPS hosting, built-in PostgreSQL/Redis databases, Docker Compose support, and zero bandwidth or serverless execution overages.",
    verdict_b: "you want instant global edge preview deployments with zero server maintenance and are comfortable with Vercel's $20/seat Pro pricing.",
    rows: [
      ["Hosting Model", "Self-Hosted PaaS on any VPS", "Managed Serverless Cloud"],
      ["Team Seat Cost", "$0 (Unlimited seats)", "$20/user/month on Pro"],
      ["Backend Support", "Full Docker, long-running workers, cron, DBs", "Serverless functions (timeout limits)"],
      ["Databases Included", "1-click Postgres, MySQL, Redis, Mongo", "Paid add-ons / third-party integrations"],
    ],
    what_a: "Dokploy is a lightweight, open-source PaaS built with Node.js, Docker, and Traefik. It deploys any Git repo, Dockerfile, or Docker Compose stack alongside managed databases with automated S3 backups.",
    what_b: "Vercel is a commercial cloud platform created by the makers of Next.js, optimized for frontend frameworks, serverless functions, and global CDN edge caching.",
    t1_title: "Long-Running Containers vs Serverless Constraints",
    t1_body: "Vercel is built around stateless serverless functions with execution timeouts and expensive bandwidth tiers. Dokploy runs real Docker containers alongside local PostgreSQL and Redis on the same private network.",
    t2_title: "Flat VPS Predictability vs Per-Seat + Bandwidth Billing",
    t2_body: "A 5-person team on Vercel Pro starts at $100/month before database or bandwidth add-ons. Dokploy on a Hetzner 8GB VPS costs ~$10/month total for unlimited team members and projects.",
    pros_a: "Clean modern UI; native Docker Compose support; automated database backups; $0 license cost.",
    cons_a: "Requires basic Linux VPS management; no built-in global multi-region CDN without Cloudflare in front.",
    pros_b: "Unmatched Next.js PR preview ergonomics; instant global edge network; zero server maintenance.",
    cons_b: "$20/seat/mo team tax; serverless cold starts and execution limits; high bandwidth overage risk.",
    final_rec: "Use **Dokploy** (paired with Cloudflare CDN) to run full-stack Next.js, APIs, background workers, and databases for a flat ~$10/month. Stick with **Vercel** only if your team values zero-ops edge previews over infrastructure control."
  },
  {
    slug: "dokploy-vs-railway",
    tool_a: "Dokploy",
    tool_b: "Railway",
    intro: "Dokploy and Railway both offer sleek, developer-friendly dashboards for deploying full-stack apps and databases from GitHub. Railway is a managed cloud billing by RAM/CPU minute, whereas Dokploy is an open-source PaaS you install on your own servers.",
    verdict_a: "you want Railway's modern developer experience on your own Hetzner, DigitalOcean, or AWS servers at 70–85% lower monthly compute cost.",
    verdict_b: "you want instant managed cloud containers without provisioning or patching a Linux VPS.",
    rows: [
      ["License", "Open Source (Apache-2.0)", "Proprietary Cloud PaaS"],
      ["Compute Cost (8GB RAM)", "~$8–$15/mo on Hetzner/OVH", "~$80+/mo metered RAM/CPU"],
      ["Docker Compose", "First-class native support", "Template-based service graphs"],
      ["Database Backups", "Built-in S3 automated backups", "Managed volume snapshots"],
    ],
    what_a: "Dokploy is an open-source self-hosted PaaS alternative to Railway, Vercel, and Heroku with built-in Traefik routing, Nixpacks/Dockerfile builds, and database management.",
    what_b: "Railway is an infrastructure cloud that builds and deploys code and databases from Git with usage-based per-minute resource billing.",
    t1_title: "Raw VPS Price-Performance vs Metered Cloud RAM",
    t1_body: "Memory-heavy workloads (Java, Next.js SSR, multiple databases) quickly rack up $50–$150/month on Railway's metered RAM pricing. Dokploy lets you run 16GB–32GB of RAM on a dedicated VPS for under $25/month.",
    t2_title: "Full SSH & Host Access",
    t2_body: "With Dokploy, you own the underlying Linux host, Docker daemon, and local NVMe storage, avoiding multi-tenant cloud noisy neighbors.",
    pros_a: "Massive savings on RAM-intensive apps; native Docker Compose; lightweight UI; unlimited team users.",
    cons_a: "You are responsible for VPS OS updates and disk monitoring.",
    pros_b: "Best-in-class visual canvas for service networking; zero VPS setup; instant provisioning.",
    cons_b: "Metered RAM and network egress become expensive as services scale.",
    final_rec: "If your Railway bill has crossed $30–$50/month, migrating to **Dokploy** on a dedicated VPS gives you the same smooth Git-push workflow while slashing your hosting bill by up to 80%."
  },
  {
    slug: "coolify-vs-vercel",
    tool_a: "Coolify",
    tool_b: "Vercel",
    intro: "Coolify and Vercel are two of the most talked-about deployment platforms for web developers. Vercel is a managed frontend cloud, while Coolify is an open-source, self-hostable Heroku and Vercel alternative that deploys Next.js, Laravel, Go, Python, and 200+ one-click open-source services on your own hardware.",
    verdict_a: "you want to self-host Next.js, backend APIs, cron jobs, and databases on your own servers with PR preview deployments and zero per-seat fees.",
    verdict_b: "you only deploy frontend static/serverless apps and want a fully managed edge network.",
    rows: [
      ["Open Source", "Yes (Apache-2.0)", "No (Proprietary)"],
      ["PR Preview Deployments", "Yes (Automated via GitHub App)", "Yes (Industry standard)"],
      ["One-Click Services", "200+ (Supabase, Plausible, N8n, Postgres)", "Marketplace SaaS integrations"],
      ["Serverless Lock-In", "None (Standard Docker containers)", "High (Vercel Edge/Serverless primitives)"],
    ],
    what_a: "Coolify is an open-source, self-hostable PaaS that automates Git deployments, SSL certificates, reverse proxying, database backups, and 200+ one-click self-hosted apps across any SSH-accessible server.",
    what_b: "Vercel is a managed cloud platform tailored for Next.js and frontend teams with global edge caching and serverless functions.",
    t1_title: "Full-Stack Freedom vs Frontend Specialization",
    t1_body: "Coolify deploys persistent WebSockets, background workers, Redis, PostgreSQL, and full Docker Compose stacks alongside your Next.js app. Vercel forces you to buy external SaaS services for background jobs, queues, and stateful backends.",
    t2_title: "Zero Bill Shock",
    t2_body: "A viral traffic spike or DDoS attack on a self-hosted Coolify VPS simply maxes out CPU temporarily—it never generates a surprise $5,000 serverless bandwidth invoice.",
    pros_a: "200+ one-click open-source templates; automatic Git PR previews; multi-server management; zero vendor lock-in.",
    cons_a: "Requires managing your own VPS instances; build times depend on your server's CPU.",
    pros_b: "Instant zero-config global CDN; tightest Next.js App Router integration.",
    cons_b: "Expensive per-seat and bandwidth scaling; no persistent background processes.",
    final_rec: "Choose **Coolify** if you want complete infrastructure independence and want to run your entire stack—frontend, backend, and databases—under one predictable roof."
  },
  {
    slug: "docuseal-vs-docusign",
    tool_a: "DocuSeal",
    tool_b: "DocuSign",
    intro: "DocuSeal and DocuSign both provide legally binding electronic document signing, audit trails, and multi-party workflows. DocuSign is the legacy enterprise giant notorious for strict envelope quotas and expensive API tiers, while DocuSeal is a fast, open-source alternative you can self-host in Docker with unlimited envelopes.",
    verdict_a: "you want unlimited document signing envelopes, embeddable white-label signing forms, clean REST APIs, and 100% on-premise PDF privacy.",
    verdict_b: "your legal department mandates a legacy commercial vendor brand name for external Fortune-500 procurement.",
    rows: [
      ["License", "Open Source (MIT / Commercial add-ons)", "Proprietary Commercial SaaS"],
      ["Envelope Quotas", "Unlimited when self-hosted", "Strict per-plan envelope caps (e.g. 100/yr)"],
      ["Embedded Signing API", "Included free in open-source core", "Expensive API developer tiers"],
      ["Self-Hosting", "Single Docker container (<150MB RAM)", "Cloud-only"],
    ],
    what_a: "DocuSeal is an open-source digital document signing platform built with Ruby on Rails. It features a drag-and-drop PDF form builder, multi-party signing workflows, automated email reminders, webhooks, and embeddable UI components.",
    what_b: "DocuSign is the largest commercial e-signature SaaS platform, offering contract lifecycle management (CLM) and enterprise compliance.",
    t1_title: "Unlimited API Envelopes vs Per-Envelope Tolls",
    t1_body: "If you embed document signing inside your SaaS product, DocuSign charges steep per-envelope API fees. Self-hosted DocuSeal lets you generate and sign 100,000+ PDFs via API for $0.",
    t2_title: "Sensitive Contract Data Sovereignty",
    t2_body: "With DocuSeal, HR contracts, medical consent forms, and financial agreements never leave your private server or S3 bucket.",
    pros_a: "Unlimited free envelopes; lightweight single-container Docker deploy; developer-friendly embeddable components; fast UI.",
    cons_a: "Advanced enterprise SAML SSO requires DocuSeal Pro.",
    pros_b: "Universal brand recognition; deep Salesforce/SAP enterprise CLM integrations.",
    cons_b: "Punitive envelope limits; dated UI; aggressive upsells for API access.",
    final_rec: "For SaaS builders embedding e-signatures via API and companies tired of counting envelopes, **DocuSeal** is faster, cleaner, and saves thousands per year."
  },
  {
    slug: "documenso-vs-docusign",
    tool_a: "Documenso",
    tool_b: "DocuSign",
    intro: "Documenso and DocuSign both enable digital contract signing with cryptographic verification. Documenso is a modern TypeScript/Next.js open-source DocuSign alternative built for transparency, self-hosting, and developer extensibility.",
    verdict_a: "you want a modern TypeScript/Next.js open-source signing stack with cryptographic X.509 certificate verification and unlimited self-hosted documents.",
    verdict_b: "you need legacy enterprise CLM workflows and pre-built corporate legal integrations.",
    rows: [
      ["Tech Stack", "TypeScript, Next.js, Prisma, Postgres", "Proprietary Legacy Cloud"],
      ["License", "Open Source (AGPLv3)", "Proprietary SaaS"],
      ["Self-Hosting", "Docker Compose & Kubernetes", "No"],
      ["Signing Certificates", "Standard X.509 digital certificates", "Proprietary + PKI options"],
    ],
    what_a: "Documenso is an open-source electronic signature platform built with Next.js, Prisma, and PostgreSQL, positioning itself as the open-source trust layer for digital documents.",
    what_b: "DocuSign is the incumbent commercial e-signature provider used for enterprise agreements.",
    t1_title: "Modern Developer Stack vs Legacy Portals",
    t1_body: "Documenso provides clean webhooks, REST APIs, and a modern React codebase that engineering teams can audit and customize directly.",
    t2_title: "No Artificial Envelope Caps",
    t2_body: "Self-hosting Documenso removes artificial monthly document caps, letting your entire organization send unlimited agreements.",
    pros_a: "Modern UX; cryptographic PDF signing; active open-source community; full data control.",
    cons_a: "Heavier Node.js/Postgres footprint than lightweight alternatives like DocuSeal.",
    pros_b: "Global legal familiarity; phone/SMS identity verification add-ons.",
    cons_b: "Expensive per-seat and per-envelope pricing; rigid contract renewals.",
    final_rec: "Choose **Documenso** if your team prefers a modern TypeScript open-source stack for self-hosted contract signing without DocuSign's envelope quotas."
  },
  {
    slug: "hoppscotch-vs-postman",
    tool_a: "Hoppscotch",
    tool_b: "Postman",
    intro: "Hoppscotch and Postman are API development and testing platforms for REST, GraphQL, and WebSockets. As Postman has grown into a heavy Electron app that forces cloud account syncing and charges $14–$49/user/month for team workspaces, Hoppscotch offers an instantaneous, open-source, self-hostable alternative.",
    verdict_a: "you want an instant, sub-second browser/PWA API client that can be self-hosted on your private intranet so sensitive API keys never sync to third-party servers.",
    verdict_b: "you rely heavily on complex multi-step Postman mock servers and enterprise governance dashboards.",
    rows: [
      ["License", "Open Source (MIT)", "Proprietary Commercial SaaS"],
      ["Memory & Speed", "Ultra-lightweight Web/PWA & Tauri Desktop", "Heavy Electron desktop app (~500MB+ RAM)"],
      ["Secret & Key Privacy", "100% Local or Self-Hosted on your VPC", "Synced to Postman Cloud workspaces"],
      ["Protocols", "REST, GraphQL, WebSocket, SSE, Socket.IO, MQTT", "REST, GraphQL, gRPC, WebSocket, SOAP"],
    ],
    what_a: "Hoppscotch is an open-source API development ecosystem built with Vue/TypeScript and Rust (Tauri). It provides instant API testing, shared team collections, environments, and CLI test runners.",
    what_b: "Postman is a commercial API platform for building, testing, documenting, and mocking APIs.",
    t1_title: "Security & Secret Sovereignty vs Forced Cloud Sync",
    t1_body: "Many security teams have banned Postman's cloud sync after sensitive production bearer tokens were accidentally synced. Self-hosted Hoppscotch keeps all collections and secrets strictly inside your corporate VPN.",
    t2_title: "Instant Startup vs Electron Bloat",
    t2_body: "Hoppscotch opens in under a second in any browser or via its lightweight Tauri client, whereas Postman frequently consumes gigabytes of RAM.",
    pros_a: "MIT licensed; blazingly fast; self-hostable for teams; supports REST, GraphQL, WebSockets, and MQTT.",
    cons_a: "Fewer enterprise API governance bells and whistles than Postman Enterprise.",
    pros_b: "Ubiquitous industry adoption; extensive collection runner and mock server features.",
    cons_b: "Forced cloud login controversies; bloated memory usage; expensive per-seat team pricing.",
    final_rec: "Switch to **Hoppscotch** for a faster, lighter API testing workflow that keeps your team's API keys and collections under your own roof."
  },
  {
    slug: "bruno-vs-postman",
    tool_a: "Bruno",
    tool_b: "Postman",
    intro: "Bruno and Postman take opposite approaches to API client collaboration. Postman stores your API collections in its proprietary cloud database, while Bruno is an offline-first, open-source API client that saves collections directly as plain-text `.bru` files inside your Git repository.",
    verdict_a: "you want 100% offline privacy, zero cloud accounts, and want to version-control your API collections alongside your backend code using standard Git PRs.",
    verdict_b: "you prefer a web-based cloud dashboard for non-technical stakeholders who don't use Git.",
    rows: [
      ["Storage Architecture", "Plain-text `.bru` files in local folders / Git", "Proprietary Postman Cloud sync"],
      ["Cloud Account Required", "Never (100% offline-first)", "Required for workspaces & sync"],
      ["Collaboration Method", "Git (GitHub, GitLab, Bitbucket PRs)", "Paid Postman Team Workspaces ($14–$49/u/mo)"],
      ["License", "Open Source (MIT)", "Proprietary"],
    ],
    what_a: "Bruno is a fast, Git-friendly open-source API client that revolutionizes API testing by storing collections directly on your filesystem using a clean, human-readable markup language (`Bru`).",
    what_b: "Postman is the traditional cloud-connected API testing suite used for managing API collections and workspaces.",
    t1_title: "Git Pull Requests vs Paid Cloud Workspaces",
    t1_body: "With Bruno, when a developer modifies an API endpoint in a branch, they update the `.bru` collection file in the same Git commit and review it in the same PR—for $0. Postman charges per developer seat just to share a collection.",
    t2_title: "Zero Cloud Leakage Risk",
    t2_body: "Bruno has no cloud backend at all. Your production URLs, headers, and local environment secrets never leave your machine.",
    pros_a: "True offline-first architecture; native Git version control; MIT licensed; supports importing NPM modules in test scripts.",
    cons_a: "Desktop-only (no hosted web dashboard for non-Git users).",
    pros_b: "Web dashboard access; built-in hosted API documentation publishing.",
    cons_b: "Cloud sync security concerns; expensive team collaboration tiers; heavy resource usage.",
    final_rec: "For software engineering teams already living in Git, **Bruno** is a revelation—it eliminates Postman's per-seat bills and keeps API tests permanently in sync with your codebase."
  },
  {
    slug: "supertokens-vs-auth0",
    tool_a: "SuperTokens",
    tool_b: "Auth0",
    intro: "SuperTokens and Auth0 both provide authentication, session management, social login, and MFA for web and mobile apps. Auth0 is notorious for its steep MAU (Monthly Active User) pricing cliff once you cross 7,500 users, while SuperTokens is an open-source alternative you can self-host alongside your own database for $0.",
    verdict_a: "you want clean React/Node/Go SDKs, customizable login UI inside your own app, secure rotating session tokens, and zero MAU price cliffs.",
    verdict_b: "you need a legacy enterprise identity broker with hundreds of pre-built SAML enterprise connectors managed by a third party.",
    rows: [
      ["License", "Open Source (Apache-2.0)", "Proprietary (Okta/Auth0)"],
      ["Self-Hosting", "Docker container + Your own Postgres/MySQL", "Cloud-only"],
      ["Cost at 50,000 MAU", "$0 (Self-Hosted)", "$1,000+/month on Auth0 B2C/B2B plans"],
      ["Login UI", "Embedded in your app (No external redirect)", "Universal Login redirect (or custom setup)"],
    ],
    what_a: "SuperTokens is an open-source authentication solution offering pre-built UI components and modular backend SDKs for email/password, passwordless, OAuth social login, MFA, and multi-tenant RBAC.",
    what_b: "Auth0 (owned by Okta) is a commercial Identity-as-a-Service (IDaaS) platform providing authentication and authorization for web and enterprise apps.",
    t1_title: "Owning Your User Table vs Third-Party Identity Silos",
    t1_body: "When you self-host SuperTokens, user credentials and metadata live in your own PostgreSQL database, making SQL joins with your application data trivial. Auth0 silos your users in their external cloud.",
    t2_title: "Avoiding the Auth0 MAU Tax",
    t2_body: "Freemium SaaS apps with 50k–200k users face crippling Auth0 renewal quotes. Self-hosted SuperTokens scales to millions of users for the cost of a small container.",
    pros_a: "Apache-2.0 open source; stores data in your own DB; native React/Next.js components; $0 self-hosted.",
    cons_a: "Smaller list of niche legacy enterprise identity connectors than Auth0.",
    pros_b: "Battle-tested enterprise compliance; massive library of enterprise SAML integrations.",
    cons_b: "Aggressive MAU pricing cliffs; rate limits on user exports/imports.",
    final_rec: "For startups and SaaS applications building in React, Next.js, Node, Python, or Go, **SuperTokens** gives you drop-in auth in hours while protecting you from Auth0's pricing curve."
  },
  {
    slug: "supertokens-vs-clerk",
    tool_a: "SuperTokens",
    tool_b: "Clerk",
    intro: "SuperTokens and Clerk are both developer-first authentication platforms famous for drop-in React and Next.js UI components. Clerk is a proprietary cloud service charging per MAU and per B2B organization, while SuperTokens is open-source and fully self-hostable.",
    verdict_a: "you want Clerk-style drop-in React/Next.js auth components while keeping 100% of user data in your own database with $0 MAU fees.",
    verdict_b: "you want a zero-backend hosted service with pre-built `<UserProfile />` modals and don't mind vendor lock-in.",
    rows: [
      ["Open Source", "Yes (Apache-2.0)", "No (Proprietary SaaS)"],
      ["Self-Hosting", "Yes (Docker + Postgres/MySQL)", "No (Clerk Cloud only)"],
      ["Pricing beyond 10k MAU", "$0 Self-Hosted", "$0.02/MAU + $1/monthly active org + add-ons"],
      ["Database Sync Needed", "No (Reads/writes directly to your DB)", "Requires Webhooks to sync users to your DB"],
    ],
    what_a: "SuperTokens is an open-source authentication framework providing pre-built frontend auth widgets and backend session management.",
    what_b: "Clerk is a commercial user management platform built specifically for React and Next.js applications.",
    t1_title: "Direct Database Storage vs Webhook Sync Fragility",
    t1_body: "With Clerk, your users live in Clerk's cloud, forcing you to maintain webhook listeners to keep your local `users` table in sync. Self-hosted SuperTokens connects directly to your PostgreSQL database.",
    t2_title: "Multi-Tenant Organization Pricing",
    t2_body: "Clerk charges extra for B2B organizations, SAML connections, and MFA add-ons. SuperTokens lets you self-host unlimited tenants and users.",
    pros_a: "No webhook sync headaches; open-source Apache-2.0; zero per-MAU or per-org fees when self-hosted.",
    cons_a: "Requires running the lightweight SuperTokens core container alongside your backend.",
    pros_b: "Polished UI components; 5-minute Next.js setup.",
    cons_b: "Proprietary lock-in; webhook synchronization complexity; rising costs with B2B orgs and add-ons.",
    final_rec: "Choose **SuperTokens** if you want modern React/Next.js authentication without locking your user database into a proprietary cloud."
  },
  {
    slug: "keycloak-vs-okta",
    tool_a: "Keycloak",
    tool_b: "Okta",
    intro: "Keycloak and Okta are heavyweight enterprise Identity and Access Management (IAM) platforms supporting SAML 2.0, OpenID Connect (OIDC), OAuth 2.0, LDAP/Active Directory federation, and fine-grained RBAC. Keycloak is the CNCF open-source standard, while Okta is the largest commercial workforce and customer IAM vendor.",
    verdict_a: "you want enterprise-grade SSO, SAML/OIDC federation, and Active Directory sync deployed in your own VPC or air-gapped data center with zero per-user licensing.",
    verdict_b: "you want a managed corporate IT workforce portal with 7,000+ pre-built SaaS app provisioning connectors (SCIM).",
    rows: [
      ["License & Governance", "Open Source (Apache-2.0, CNCF Incubation)", "Proprietary Commercial SaaS"],
      ["Protocols", "OIDC, OAuth 2.0, SAML 2.0, LDAP, Kerberos", "OIDC, OAuth 2.0, SAML 2.0, SCIM, LDAP"],
      ["Deployment", "Self-Hosted (Docker, Kubernetes, Bare Metal)", "Cloud-only SaaS"],
      ["Licensing Cost", "$0 (Unlimited workforce & customer users)", "$6–$15+/workforce user/mo or steep CIAM tiers"],
    ],
    what_a: "Keycloak is an open-source Identity and Access Management system created by Red Hat and part of the CNCF. It powers authentication for thousands of enterprises worldwide.",
    what_b: "Okta is a publicly traded identity cloud offering Workforce Identity (SSO, MFA) and Customer Identity (CIAM).",
    t1_title: "Complete Security Control vs Third-Party Cloud Breaches",
    t1_body: "Running Keycloak inside your own private Kubernetes cluster means you control the network perimeter, certificates, and audit logs. You are never exposed to multi-tenant SaaS support breaches.",
    t2_title: "CIAM Scale Without Million-Dollar Renewals",
    t2_body: "Keycloak handles millions of users and thousands of B2B SAML realms on modest hardware without per-user or per-connection fees.",
    pros_a: "CNCF-backed Apache-2.0 standard; unmatched SAML/OIDC/LDAP depth; multi-realm B2B tenancy; $0 licensing.",
    cons_a: "Java/Quarkus runtime requires operational tuning and database management.",
    pros_b: "Huge catalog of HR-driven SCIM SaaS provisioning connectors; fully managed.",
    cons_b: "High per-seat workforce and CIAM costs; annual contract lock-in.",
    final_rec: "For customer-facing SaaS (CIAM), B2B enterprise SSO, and privacy-sensitive infrastructure, **Keycloak** is the undisputed open-source gold standard."
  },
  {
    slug: "authentik-vs-keycloak",
    tool_a: "Authentik",
    tool_b: "Keycloak",
    intro: "Authentik and Keycloak are the two leading open-source Identity Providers (IdP) for self-hosted SSO. While Keycloak is the battle-tested Java/CNCF veteran, Authentik has surged in popularity among DevOps and homelab engineers thanks to its visual flow engine, built-in reverse proxy outposts, and modern UI.",
    verdict_a: "you want a modern UI, visual drag-and-drop authentication flows, and built-in forward-auth proxy outposts to protect apps that don't support OIDC natively.",
    verdict_b: "you need a lightweight, battle-tested CNCF Java/Quarkus engine optimized strictly for high-throughput B2B SAML/OIDC customer identity.",
    rows: [
      ["Core Stack", "Python (Django) + Go (Outposts) + Lit UI", "Java (Quarkus) + React UI"],
      ["Built-in Reverse Proxy", "Yes (Native Go Proxy Outposts for Traefik/NGINX)", "Requires external oauth2-proxy"],
      ["Auth Customization", "Visual node-based Flow & Stage editor", "Authentication execution flows + Java SPIs"],
      ["License", "Open Source (MIT)", "Open Source (Apache-2.0)"],
    ],
    what_a: "Authentik is an open-source Identity Provider focused on flexibility and versatility, featuring a visual policy/flow engine and native application proxy outposts.",
    what_b: "Keycloak is the CNCF open-source identity and access management platform built on Quarkus for high-scale application authentication.",
    t1_title: "Protecting Internal Apps & Dashboards (Forward Auth)",
    t1_body: "Authentik includes built-in Go proxy outposts that integrate directly with Traefik, Caddy, and NGINX—letting you put SSO in front of internal tools without deploying separate `oauth2-proxy` containers.",
    t2_title: "Visual Flows vs Java SPI Extensions",
    t2_body: "Customizing onboarding, invite links, or conditional MFA in Authentik is done entirely in the web UI via visual stages and Python expressions, whereas deep customization in Keycloak requires writing custom Java SPI plugins.",
    pros_a: "Best-in-class admin and user portal UI; built-in forward-auth proxy outposts; visual flow builder.",
    cons_a: "Higher idle RAM usage (~600MB–800MB) due to Python workers + Redis/Postgres.",
    pros_b: "Extremely high token-issuance throughput on Quarkus; CNCF enterprise backing; massive documentation ecosystem.",
    cons_b: "Steeper learning curve; protecting legacy non-OIDC apps requires external proxies.",
    final_rec: "Choose **Authentik** for internal infrastructure SSO, DevOps portals, and visual auth flows. Choose **Keycloak** for high-throughput B2C/B2B SaaS application token issuance."
  },
  {
    slug: "twenty-vs-hubspot",
    tool_a: "Twenty",
    tool_b: "HubSpot",
    intro: "Twenty and HubSpot are modern CRM platforms designed to manage customer relationships, sales pipelines, and team workflows. HubSpot lures startups with a free tier before jumping to $800–$3,600+/month on Professional/Enterprise plans. Twenty is the fastest-growing open-source CRM, built with a Notion/Linear-inspired UX and full self-hosting.",
    verdict_a: "you want a fast, keyboard-first modern CRM with custom objects, GraphQL/REST APIs, unlimited team seats, and 100% self-hosted PostgreSQL ownership.",
    verdict_b: "you need an all-in-one commercial marketing automation, ad tracking, and enterprise call-center suite out of the box.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Proprietary Commercial SaaS"],
      ["UX Design", "Fast, minimalist Linear/Notion-inspired UI", "Feature-dense multi-hub enterprise portal"],
      ["Team Seat Pricing", "$0 Self-Hosted / $9 Cloud", "$20 to $150+/seat + mandatory onboarding fees"],
      ["Custom Objects", "Included free in open-source core", "Locked behind $1,200+/mo Enterprise tier"],
    ],
    what_a: "Twenty is the #1 open-source alternative to Salesforce and HubSpot, built with TypeScript, React, NestJS, and PostgreSQL. It delivers custom data models, kanban deal pipelines, email sync, and workflow automation.",
    what_b: "HubSpot is a commercial CRM and inbound marketing suite spanning Sales Hub, Marketing Hub, and Service Hub.",
    t1_title: "Custom Objects Without the Enterprise Paywall",
    t1_body: "HubSpot locks Custom Objects behind its Enterprise tier. In Twenty, creating custom objects, fields, and relations is a core free feature available from day one.",
    t2_title: "Clean Data Model vs Bloated Marketing Upsells",
    t2_body: "Twenty focuses on speed, clean pipeline management, and developer-friendly GraphQL APIs without cluttering your workspace with constant tier upgrade prompts.",
    pros_a: "Gorgeous modern UI; free custom objects & workflows; auto-generated GraphQL API; Docker self-hostable.",
    cons_a: "Does not include built-in ad network management or landing page builders.",
    pros_b: "Massive ecosystem of marketing, email, and sales enablement tools.",
    cons_b: "Infamous pricing cliff from Starter to Professional; expensive contact-tier and seat add-ons.",
    final_rec: "For agencies, startups, and tech companies that want a fast, customizable sales CRM without HubSpot's five-figure renewal traps, **Twenty** is the clear winner."
  },
  {
    slug: "suitecrm-vs-salesforce",
    tool_a: "SuiteCRM",
    tool_b: "Salesforce",
    intro: "SuiteCRM and Salesforce are full-featured enterprise Customer Relationship Management (CRM) systems covering leads, opportunities, quotes, contracts, cases, and field workflows. SuiteCRM is the world's most widely deployed open-source enterprise CRM, offering complete on-premise sovereignty with zero per-seat licensing.",
    verdict_a: "you need deep enterprise CRM modules (Quotes, Invoices, Cases, Workflows, RBAC) for 50 to 5,000+ staff on your own servers with $0 license fees.",
    verdict_b: "your organization relies on the Salesforce AppExchange ecosystem and has dedicated certified Salesforce admins.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Proprietary Commercial Cloud"],
      ["100-User Annual Cost", "$0 License (Self-Hosted)", "$180,000 – $360,000+/year"],
      ["Deployment", "On-Premise, Air-Gapped, Docker, or Any Cloud", "Salesforce Multi-Tenant Cloud"],
      ["Built-in Modules", "Leads, Accounts, Quotes, Contracts, Cases, Campaigns", "Split across Sales Cloud, Service Cloud, CPQ add-ons"],
    ],
    what_a: "SuiteCRM is an enterprise-ready open-source CRM (originally forked from SugarCRM) used by millions of users across government, finance, healthcare, and manufacturing.",
    what_b: "Salesforce is the largest commercial cloud CRM platform, built around Sales Cloud, Service Cloud, and the proprietary Force.com ecosystem.",
    t1_title: "Eliminating Six-Figure Per-Seat Licensing",
    t1_body: "Salesforce Enterprise editions cost $165–$330+ per user per month. SuiteCRM includes quotes, invoices, case management, and workflow automation out of the box for unlimited users.",
    t2_title: "Strict Data Sovereignty & Government Compliance",
    t2_body: "Public sector agencies and healthcare providers use SuiteCRM because it can run 100% air-gapped inside domestic data centers.",
    pros_a: "Comprehensive enterprise feature set; zero per-user fees; full SQL database ownership; mature RBAC security groups.",
    cons_a: "Traditional enterprise UI compared to newer minimalist CRMs; PHP stack requires web server tuning.",
    pros_b: "Largest third-party AppExchange marketplace; deep enterprise consulting network.",
    cons_b: "Extreme licensing and storage costs; vendor lock-in to proprietary Apex code.",
    final_rec: "Organizations seeking full enterprise CRM depth (Sales + Service + Quotes) without paying Salesforce's recurring per-seat tax should deploy **SuiteCRM**."
  }
];

async function run() {
  console.log("Seeding Comparisons Part 1 (15 items)...");
  let success = 0;
  for (const item of COMPARISONS_PART1) {
    const content = buildMarkdown(item);
    const { data: existing } = await supabase.from("comparisons").select("id").eq("slug", item.slug).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("comparisons").update({
        tool_a: item.tool_a,
        tool_b: item.tool_b,
        content,
        status: "published",
        verified_regenerated_at: nowIso,
      }).eq("id", existing.id);
      if (error) console.error("Error updating:", item.slug, error.message);
      else success++;
    } else {
      const { error } = await supabase.from("comparisons").insert({
        slug: item.slug,
        tool_a: item.tool_a,
        tool_b: item.tool_b,
        content,
        status: "published",
        created_at: nowIso,
        verified_regenerated_at: nowIso,
      });
      if (error) console.error("Error inserting:", item.slug, error.message);
      else success++;
    }
  }
  console.log(`Part 1 finished: ${success}/${COMPARISONS_PART1.length} comparisons updated/created.`);
}

run();
