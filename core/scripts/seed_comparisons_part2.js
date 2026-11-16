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

const COMPARISONS_PART2 = [
  {
    slug: "baserow-vs-airtable",
    tool_a: "Baserow",
    tool_b: "Airtable",
    intro: "Baserow and Airtable both turn relational PostgreSQL databases into collaborative, no-code spreadsheet workspaces with Kanban, Calendar, Gallery, and Form views. While Airtable caps row counts and charges $20–$45/seat/month, Baserow is open-source and scales to millions of rows on your own server.",
    verdict_a: "you want unlimited rows, unlimited self-hosted users, a built-in no-code application builder, and complete database privacy without Airtable's row caps.",
    verdict_b: "you want a purely cloud-hosted spreadsheet for a small team under 1,000 rows and don't need data residency.",
    rows: [
      ["License", "Open Source (MIT Core + Premium add-ons)", "Proprietary SaaS"],
      ["Row Limits per Base", "Unlimited when self-hosted (Millions of rows)", "1,000 (Free) / 50,000 (Team) / 125,000 (Business)"],
      ["Team Pricing", "$0 Self-Hosted", "$20–$45/user/month"],
      ["App Builder", "Built-in visual customer portal builder", "Airtable Interfaces (per-user portal fees)"],
    ],
    what_a: "Baserow is an open-source no-code database and application builder built on Python (Django), Vue.js, and PostgreSQL.",
    what_b: "Airtable is a commercial cloud collaboration platform blending spreadsheets with relational databases.",
    t1_title: "No 50k Row Ceilings or 5 req/sec API Rate Limits",
    t1_body: "Airtable throttles API calls to 5 requests per second and enforces strict row caps. Self-hosted Baserow runs directly on PostgreSQL, handling hundreds of thousands of rows and high-throughput API reads effortlessly.",
    t2_title: "Permissive MIT Core Licensing",
    t2_body: "Baserow's core is MIT licensed, allowing commercial organizations to embed and extend it freely inside their infrastructure.",
    pros_a: "MIT-licensed core; no row or API limits when self-hosted; polished UI; built-in application builder.",
    cons_a: "Some enterprise audit/RBAC features require Baserow Premium.",
    pros_b: "Polished templates; large library of native SaaS automations.",
    cons_b: "Severe row limits; 5 req/sec API bottleneck; expensive per-editor seat billing.",
    final_rec: "If your team is hitting Airtable's row caps, API rate limits, or per-seat bills, **Baserow** is the cleanest drop-in open-source upgrade."
  },
  {
    slug: "nocodb-vs-baserow",
    tool_a: "NocoDB",
    tool_b: "Baserow",
    intro: "NocoDB and Baserow are the two undisputed champions of open-source Airtable alternatives. While both provide rich Grid, Kanban, Gallery, and Form views with REST APIs, they differ fundamentally in architecture: NocoDB connects directly to your existing production MySQL/Postgres database, whereas Baserow manages its own dedicated PostgreSQL schema.",
    verdict_a: "you already have an existing PostgreSQL, MySQL, or SQL Server production database and want to instantly turn its tables into a collaborative Airtable UI.",
    verdict_b: "you are creating new no-code databases from scratch with non-technical teams and want a built-in visual web application/portal builder.",
    rows: [
      ["Core Superpower", "Turns any existing SQL DB into a smart spreadsheet", "Standalone no-code database + App Builder"],
      ["Supported Databases", "PostgreSQL, MySQL, MariaDB, SQLite, SQL Server", "PostgreSQL (Dedicated schema)"],
      ["Tech Stack", "Node.js / TypeScript + Vue", "Python (Django) + Nuxt/Vue"],
      ["License", "Open Source (AGPLv3)", "Open Source (MIT Core)"],
    ],
    what_a: "NocoDB connects to any new or existing relational database and exposes it as a fast spreadsheet interface alongside auto-generated REST APIs.",
    what_b: "Baserow is an open-source no-code database and application builder designed for high-volume tabular data and custom web portals.",
    t1_title: "Existing SQL DB Introspection vs Dedicated Schema",
    t1_body: "If your backend app already writes to a PostgreSQL database and your ops team wants an Airtable-like UI to view and edit records safely, **NocoDB** connects directly in 60 seconds. Baserow creates and manages its own internal tables.",
    t2_title: "Resource Footprint & Speed",
    t2_body: "NocoDB ships as a single compact binary/Docker image (~150MB RAM), while Baserow includes background workers and an integrated App Builder (~500MB RAM).",
    pros_a: "Connects to existing Postgres/MySQL DBs; tiny Docker footprint; 45k+ GitHub stars; built-in App Store integrations.",
    cons_a: "AGPLv3 license (compared to Baserow's MIT core).",
    pros_b: "Permissive MIT core license; smoother multi-million-row virtual scrolling; built-in portal builder.",
    cons_b: "Cannot wrap an arbitrary pre-existing MySQL database schema directly.",
    final_rec: "Choose **NocoDB** to put an Airtable UI on top of an existing SQL database. Choose **Baserow** to build standalone no-code databases and client portals from scratch."
  },
  {
    slug: "budibase-vs-retool",
    tool_a: "Budibase",
    tool_b: "Retool",
    intro: "Budibase and Retool both empower teams to build internal admin panels, CRUD dashboards, and operational workflows. Retool charges per both builder and end-user seats, whereas Budibase is an open-source low-code platform with a built-in database and responsive design.",
    verdict_a: "you want an open-source internal tool builder that creates mobile-responsive apps, includes a built-in database, and runs in Docker without per-end-user fees.",
    verdict_b: "your engineers want to write complex inline JavaScript/SQL everywhere and have budget for Retool's per-user enterprise licensing.",
    rows: [
      ["License", "Open Source (GPLv3)", "Proprietary Commercial SaaS"],
      ["Built-in Database", "Yes (Budibase DB + external SQL/REST)", "Yes (Retool DB on cloud)"],
      ["Mobile Responsiveness", "Responsive design out of the box", "Primarily desktop-grid oriented"],
      ["Auto-CRUD Screens", "1-click autogenerated CRUD screens from SQL tables", "Manual drag-and-drop wiring"],
    ],
    what_a: "Budibase is an open-source low-code platform designed to turn PostgreSQL, MySQL, MongoDB, and REST APIs into polished internal applications and forms.",
    what_b: "Retool is a commercial developer-focused internal tool builder featuring dense data grids and JavaScript query bindings.",
    t1_title: "1-Click Auto-Generated CRUD vs Manual Wiring",
    t1_body: "Point Budibase at a PostgreSQL table and it automatically generates working list, detail, create, and edit screens. In Retool, you wire each table selection and update query manually.",
    t2_title: "True Free Self-Hosting",
    t2_body: "Retool's self-hosted Docker deployment still requires a paid Retool account that phones home. Budibase's open-source edition runs completely independently.",
    pros_a: "Instant auto-generated CRUD apps; clean responsive UI; built-in automation builder; free self-hosting.",
    cons_a: "Less suited for ultra-dense 20-widget single-screen trading terminals than Retool.",
    pros_b: "Unmatched flexibility for complex custom JavaScript state; huge connector library.",
    cons_b: "Charges for every end-user viewing the dashboard; no free offline self-hosting.",
    final_rec: "For CRUD portals, customer support tools, and multi-step forms deployed to large internal teams, **Budibase** delivers cleaner UIs at a fraction of Retool's cost."
  },
  {
    slug: "windmill-vs-retool",
    tool_a: "Windmill",
    tool_b: "Retool",
    intro: "Windmill and Retool both let engineering teams build internal UIs and automate backend operations. However, Windmill is uniquely engineered as a code-first open-source platform that unifies internal UI dashboards (like Retool), workflow DAGs (like Airflow), and cron scripts in one ultra-fast Rust engine.",
    verdict_a: "your engineers want to write real Python, TypeScript, Go, or SQL scripts in Git, auto-generate UIs from function signatures, and run heavy background workflows with zero cold starts.",
    verdict_b: "your team is primarily frontend-oriented and only needs browser-based REST/SQL dashboard widgets.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Proprietary Commercial SaaS"],
      ["Core Engine", "Rust worker pool + PostgreSQL queue", "Browser JS + Cloud connectors"],
      ["Supported Languages", "TypeScript, Python, Go, Bash, PHP, Rust, SQL", "JavaScript & SQL"],
      ["Background Workflows", "Full DAG workflows, retries, cron, & approval steps", "Limited Retool Workflows add-on"],
    ],
    what_a: "Windmill turns scripts into auto-generated internal UIs and chained workflows, backed by a blazing-fast Rust job runner.",
    what_b: "Retool is a drag-and-drop internal application builder for connecting databases and APIs to UI components.",
    t1_title: "Multi-Language Backend Execution vs Browser JavaScript",
    t1_body: "In Windmill, a single button click can trigger a Python script using Pandas, a Go binary, or a 30-minute multi-step DAG workflow. Retool is limited to short-lived browser/API queries.",
    t2_title: "Git Version Control Included",
    t2_body: "Retool locks Git syncing behind its highest enterprise tier. Windmill lets you develop scripts locally in VS Code and sync via Git out of the box.",
    pros_a: "Blazing-fast Rust execution engine; replaces Retool + Airflow + Cron in one tool; auto-generates UIs from code.",
    cons_a: "More code-centric learning curve for non-technical business analysts.",
    pros_b: "More mature drag-and-drop visual widget styling for non-coders.",
    cons_b: "Expensive per-seat pricing; weak long-running background job orchestration.",
    final_rec: "For backend and platform engineering teams, **Windmill** is a superpower—it replaces both Retool and your cron/workflow runners in a single self-hosted stack."
  },
  {
    slug: "windmill-vs-n8n",
    tool_a: "Windmill",
    tool_b: "n8n",
    intro: "Windmill and n8n are two of the most powerful self-hostable automation platforms available. n8n excels at visual, node-based SaaS integrations and AI agent chains, while Windmill is a code-first workflow engine and internal UI builder built for high-performance Python, TypeScript, Go, and SQL execution.",
    verdict_a: "you are a software/data engineer writing custom Python, TypeScript, Go, or SQL logic who also needs internal admin UIs and high-throughput queue execution.",
    verdict_b: "you want a visual drag-and-drop canvas with 400+ pre-built SaaS nodes that both developers and ops teams can wire together.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Fair-Code (Sustainable Use License)"],
      ["Primary Interface", "Code-first scripts + DAG builder + UI App Builder", "Visual node-and-wire canvas"],
      ["Execution Languages", "Python, TypeScript, Go, Bash, SQL, Rust", "JavaScript / Python (in Code nodes)"],
      ["Internal Dashboard UI", "Full React App Builder included", "Webhooks & forms only (No dashboard builder)"],
    ],
    what_a: "Windmill is an open-source developer platform for running scripts, complex workflows, and internal UI dashboards with native dependency management.",
    what_b: "n8n is a visual workflow automation platform with 400+ integrations and native LangChain AI agent nodes.",
    t1_title: "Code + Internal Apps vs Visual SaaS Wiring",
    t1_body: "If your workflow involves connecting Webhook → HubSpot → Slack → OpenAI in 5 minutes without writing boilerplate API clients, **n8n** is unbeatable. If your workflow involves running heavy Python data transformations and exposing an admin dashboard, **Windmill** wins.",
    t2_title: "True OSI Open Source (AGPLv3) vs Fair-Code",
    t2_body: "Windmill is licensed under OSI-approved AGPLv3, whereas n8n uses the Sustainable Use License which restricts certain commercial hosting use cases.",
    pros_a: "Multi-language execution with automatic package caching; built-in UI builder; ultra-fast Rust workers.",
    cons_a: "Fewer point-and-click marketing SaaS connectors than n8n.",
    pros_b: "Unrivaled visual node editor; 400+ turnkey SaaS & AI nodes; huge template library.",
    cons_b: "No built-in admin panel UI builder; heavy data processing in Node.js requires tuning.",
    final_rec: "Choose **n8n** for marketing, ops, and AI agent automations, and **Windmill** for internal engineering tools and heavy data pipelines."
  },
  {
    slug: "activepieces-vs-n8n",
    tool_a: "Activepieces",
    tool_b: "n8n",
    intro: "Activepieces and n8n are the top two self-hostable alternatives to Zapier and Make. n8n uses a free-form node graph geared toward technical builders, while Activepieces offers a clean, step-by-step vertical flow builder with an MIT-licensed open-source core that non-technical teammates can master immediately.",
    verdict_a: "you want a true MIT-licensed open-source core, a clean Zapier-like vertical UI that non-technical staff love, and type-safe TypeScript piece development.",
    verdict_b: "you build complex branching graphs, multi-agent LangChain workflows, and advanced data-merging pipelines.",
    rows: [
      ["Core License", "Open Source (MIT Core)", "Fair-Code (Sustainable Use License)"],
      ["UI Paradigm", "Clean vertical step-by-step flow (Zapier-like)", "2D free-form node canvas (Make-like)"],
      ["Ease of Use for Non-Devs", "Very High (Zero learning curve)", "Moderate to High (Technical focus)"],
      ["Custom Integrations", "TypeScript npm packages (Hot-reload local dev)", "TypeScript community nodes"],
    ],
    what_a: "Activepieces is an MIT-licensed open-source workflow automation tool designed as an intuitive, AI-ready replacement for Zapier.",
    what_b: "n8n is an extendable workflow automation platform with deep visual branching, looping, and AI agent orchestration.",
    t1_title: "MIT License Freedom vs Fair-Code Restrictions",
    t1_body: "Because Activepieces' core is MIT licensed, SaaS companies can legally embed and white-label it inside their own commercial products much more easily than n8n's Fair-Code license.",
    t2_title: "Simplicity vs Complex Graph Topologies",
    t2_body: "Activepieces keeps flows tidy and readable with structured vertical steps. n8n's 2D canvas allows arbitrary multi-input merges and complex loops that power users love.",
    pros_a: "Permissive MIT license; beginner-friendly UI; clean TypeScript SDK for custom pieces; fast execution.",
    cons_a: "Smaller total connector count (~200+) compared to n8n's 400+.",
    pros_b: "Largest ecosystem of community nodes; deeper LangChain AI agent tooling; mature error handling.",
    cons_b: "Fair-code license is not OSI open-source; steeper learning curve for business users.",
    final_rec: "Choose **Activepieces** if you need an MIT license or a clean UI for your whole company. Choose **n8n** for complex technical and AI agent graphs."
  },
  {
    slug: "zammad-vs-zendesk",
    tool_a: "Zammad",
    tool_b: "Zendesk",
    intro: "Zammad and Zendesk are full-scale customer support ticketing and helpdesk platforms. While Zendesk charges $55–$115+ per agent per month and locks essential features behind add-ons, Zammad is a mature open-source helpdesk built in Ruby/Go that gives support teams unlimited agents when self-hosted.",
    verdict_a: "you want a fast, keyboard-driven enterprise ticketing system with email, live chat, telefonie (CTI), SLAs, and full-text Elasticsearch search at $0 per agent.",
    verdict_b: "you run a massive global enterprise call center already deeply integrated into Zendesk's proprietary marketplace.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Proprietary Commercial SaaS"],
      ["25-Agent Annual Cost", "$0 Self-Hosted", "$16,500 – $34,500+/year"],
      ["Search Engine", "Built-in Elasticsearch full-text attachment search", "Cloud search"],
      ["Channels", "Email, Web Chat, WhatsApp, Telegram, X, SIP/CTI Phone", "Email, Chat, Voice, Social"],
    ],
    what_a: "Zammad is an open-source helpdesk and customer support ticketing system founded by the original creator of OTRS, featuring a modern reactive UI, SLA management, and macros.",
    what_b: "Zendesk is the largest commercial customer service and support ticketing SaaS platform.",
    t1_title: "Instant Full-Text Search & Keyboard Speed",
    t1_body: "Zammad integrates directly with Elasticsearch to index ticket bodies and PDF/Office attachments, delivering instant search results and undo history without Zendesk's sluggish page reloads.",
    t2_title: "No Per-Agent Scaling Penalty",
    t2_body: "In Zendesk, giving engineers or part-time product managers full ticket access costs $55–$115/month each. Self-hosted Zammad lets your entire company collaborate on customer issues for free.",
    pros_a: "Unlimited free agents; Elasticsearch attachment indexing; native phone/CTI integration; clean, fast UI.",
    cons_a: "Requires Elasticsearch alongside PostgreSQL when self-hosting.",
    pros_b: "Huge third-party app marketplace; turnkey cloud voice call center.",
    cons_b: "Expensive per-agent pricing; aggressive AI add-on upsells; rigid multi-year contracts.",
    final_rec: "For B2B support teams, IT service desks, and privacy-conscious companies, **Zammad** replaces Zendesk's core ticketing workflows while saving tens of thousands annually."
  },
  {
    slug: "chatwoot-vs-zendesk",
    tool_a: "Chatwoot",
    tool_b: "Zendesk",
    intro: "Chatwoot and Zendesk both centralize customer conversations across email, live website chat, WhatsApp, Instagram, and Telegram. Chatwoot is an open-source omnichannel customer engagement suite designed with a modern Intercom/Zendesk hybrid interface.",
    verdict_a: "you want a sleek live-chat widget, unified omnichannel inbox (WhatsApp, Instagram, Email), help center portal, and AI assistant self-hosted in Docker.",
    verdict_b: "you need heavy traditional ITIL change-management ticketing rather than real-time omnichannel messaging.",
    rows: [
      ["License", "Open Source (MIT Core)", "Proprietary Commercial SaaS"],
      ["Omnichannel Inbox", "Live Chat, Email, WhatsApp, Instagram, Telegram, SMS", "Email, Chat, Voice, Social (Tier-gated)"],
      ["Help Center / Docs", "Built-in public Knowledge Base portal", "Zendesk Guide add-on"],
      ["Mobile Apps", "Free iOS & Android apps (Connects to self-hosted URL)", "iOS & Android apps"],
    ],
    what_a: "Chatwoot is an open-source omnichannel customer support platform built with Ruby on Rails and Vue.js, combining live chat, shared email inboxes, and social messaging.",
    what_b: "Zendesk is an enterprise customer service and ticketing suite.",
    t1_title: "Official Mobile Apps That Work With Your Server",
    t1_body: "Chatwoot provides official iOS and Android apps on the App Store and Play Store where you simply enter your own self-hosted domain to answer customer chats on the go.",
    t2_title: "Modern Real-Time Messaging vs Legacy Ticket Forms",
    t2_body: "Chatwoot feels like a modern messaging app (similar to Intercom and Front), making it ideal for SaaS and e-commerce teams handling WhatsApp, live chat, and email together.",
    pros_a: "MIT-licensed core; official mobile apps for self-hosters; built-in Help Center; Captain AI assistant.",
    cons_a: "Less focused on legacy ITIL phone/hardware asset ticketing than Zammad.",
    pros_b: "Deep enterprise SLA and legacy voice PBX routing.",
    cons_b: "Steep per-agent pricing; cluttered admin configuration.",
    final_rec: "For SaaS startups and digital businesses managing live chat, email, and WhatsApp in one place, **Chatwoot** is a modern, cost-effective replacement for Zendesk."
  },
  {
    slug: "rocketchat-vs-slack",
    tool_a: "Rocket.Chat",
    tool_b: "Slack",
    intro: "Rocket.Chat and Slack are real-time team communication platforms supporting channels, threads, voice/video calls, and file sharing. Slack stores every message on Salesforce's multi-tenant cloud and deletes history on free plans, while Rocket.Chat is an open-source platform built for complete on-premise data sovereignty.",
    verdict_a: "you need 100% on-premise or air-gapped team chat, unlimited message history, Matrix federation, and built-in omnichannel external customer chat.",
    verdict_b: "you want zero server maintenance and rely heavily on Slack's consumer third-party app directory.",
    rows: [
      ["License", "Open Source (MIT Core)", "Proprietary (Salesforce)"],
      ["Message History on Free", "100% Unlimited forever", "Deleted/hidden after 90 days"],
      ["Deployment", "Self-Hosted (Docker, K8s, Air-Gapped) or Cloud", "Slack Cloud only"],
      ["Federation", "Native Matrix protocol federation", "Slack Connect (Proprietary cloud)"],
    ],
    what_a: "Rocket.Chat is an open-source communications platform used by defense, healthcare, and technology organizations requiring strict privacy and customizable chat workflows.",
    what_b: "Slack is a commercial cloud-based team messaging application owned by Salesforce.",
    t1_title: "Unlimited Searchable History vs the 90-Day Paywall",
    t1_body: "Slack holds your institutional knowledge hostage behind a 90-day message retention paywall unless you pay $7.25–$15/user/month. Self-hosted Rocket.Chat preserves every message, code snippet, and file forever.",
    t2_title: "Air-Gapped & Defense-Grade Security",
    t2_body: "Rocket.Chat can run completely disconnected from the public internet inside classified or regulated networks with end-to-end encryption.",
    pros_a: "MIT core; unlimited history; desktop & mobile apps; Matrix federation; omnichannel customer chat.",
    cons_a: "Some push notification and enterprise role features have limits on the free community tier.",
    pros_b: "Polished consumer UX; massive catalog of third-party SaaS bots.",
    cons_b: "90-day free tier deletion; expensive per-active-user billing; zero self-hosting.",
    final_rec: "Organizations that refuse to let sensitive engineering discussions and credentials sit in a third-party cloud should self-host **Rocket.Chat**."
  },
  {
    slug: "zulip-vs-slack",
    tool_a: "Zulip",
    tool_b: "Slack",
    intro: "Zulip and Slack both power team communication, but Zulip solves Slack's biggest productivity killer: chaotic, overlapping channel conversations. Zulip is an open-source team chat platform built around email-style topic threading inside channels, making it the favorite of distributed open-source and engineering teams.",
    verdict_a: "you run an async, remote engineering team that wants structured topic-based threads, LaTeX/code blocks, and 100% open-source self-hosting with free mobile push notifications.",
    verdict_b: "your company prefers casual, unstructured synchronous chat streams.",
    rows: [
      ["License", "100% Open Source (Apache-2.0)", "Proprietary Commercial SaaS"],
      ["Threading Model", "Mandatory lightweight Topics per conversation", "Optional side-panel threads"],
      ["Message History", "Unlimited when self-hosted", "90-day cap on Free ($8.75/u/mo on Pro)"],
      ["Async Catch-Up Speed", "Read or mute entire topics in seconds", "Endless scrolling through mixed messages"],
    ],
    what_a: "Zulip is an Apache-2.0 open-source team chat application combining the immediacy of real-time chat with the structured organization of threaded email.",
    what_b: "Slack is the mainstream commercial team messaging platform.",
    t1_title: "First-Class Topic Threading vs Slack's Noise",
    t1_body: "In Slack, when multiple people ask different questions in `#engineering`, replies interleave into an unreadable mess. In Zulip, every message belongs to a named Topic inside a channel—allowing you to catch up on 500 messages after vacation in 5 minutes.",
    t2_title: "100% Apache-2.0 Open Source",
    t2_body: "Unlike competitors that cripple their community editions, Zulip's self-hosted installation is 100% open-source Apache-2.0 with official installer scripts and desktop/mobile clients.",
    pros_a: "Best async threading model on the market; 100% Apache-2.0; markdown, code, and LaTeX rendering; fast keyboard navigation.",
    cons_a: "Requires 1–2 days for Slack habits to adjust to naming a topic when starting a thread.",
    pros_b: "Familiar to non-technical hires on day one; built-in Huddles.",
    cons_b: "High cognitive overload in busy channels; expensive per-seat billing.",
    final_rec: "For serious engineering teams, open-source communities, and remote companies, **Zulip** is not just a free Slack replacement—it is a fundamentally better way to communicate."
  },
  {
    slug: "listmonk-vs-mailchimp",
    tool_a: "Listmonk",
    tool_b: "Mailchimp",
    intro: "Listmonk and Mailchimp both manage newsletter subscribers, mailing lists, and HTML email campaigns. Mailchimp charges progressively steeper monthly fees based on your total contact count (even for inactive subscribers), whereas Listmonk is a single-binary Go application that sends millions of emails via Amazon SES or SMTP for pennies.",
    verdict_a: "you want to send newsletters and transactional emails to 50,000–5,000,000+ subscribers for ~$0.10 per 1,000 emails using Amazon SES, Postmark, or Resend.",
    verdict_b: "you are a non-technical marketer who wants drag-and-drop e-commerce coupon templates and doesn't mind paying $350+/month for 50k contacts.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Proprietary (Intuit)"],
      ["Cost for 100,000 Contacts", "$0 Software + ~$10/campaign via AWS SES", "~$650 – $800/month recurring"],
      ["Architecture", "Single Go binary + PostgreSQL", "Multi-tenant Cloud SaaS"],
      ["Memory Footprint", "~30 MB – 60 MB RAM", "Cloud-hosted"],
    ],
    what_a: "Listmonk is a high-performance, self-hosted newsletter and mailing list manager written in Go with a Vue.js dashboard and PostgreSQL backend.",
    what_b: "Mailchimp is a commercial email marketing and automation platform owned by Intuit.",
    t1_title: "100x Lower Email Economics with AWS SES",
    t1_body: "Mailchimp penalizes you for growing your audience—storing 100,000 subscribers costs ~$8,000/year even if you email them once a month. Listmonk on a $5 VPS paired with Amazon SES costs $0/month to store 1,000,000 subscribers and just $10 per 100,000 emails sent.",
    t2_title: "Power-User SQL Segmentation",
    t2_body: "Listmonk stores custom subscriber metadata in a PostgreSQL JSONB column, letting you segment audiences with arbitrary SQL queries and template emails with Go syntax.",
    pros_a: "Tiny single-binary footprint; blazing multi-threaded SMTP/SES throughput; zero per-subscriber tax; clean UI.",
    cons_a: "Does not include complex multi-month visual drip-campaign flowcharts.",
    pros_b: "Hundreds of consumer drag-and-drop newsletter templates.",
    cons_b: "Charges for unsubscribed contacts; aggressive price hikes; strict affiliate policies.",
    final_rec: "For newsletters, product updates, and developer audiences, **Listmonk** + AWS SES/Postmark is the highest-ROI self-hosted upgrade you can make."
  },
  {
    slug: "mautic-vs-hubspot",
    tool_a: "Mautic",
    tool_b: "HubSpot",
    intro: "Mautic and HubSpot Marketing Hub are full-scale marketing automation platforms featuring visual drip campaigns, lead scoring, landing pages, forms, and website visitor tracking. Mautic is the world's largest open-source marketing automation project, freeing companies from HubSpot's contact-tier pricing.",
    verdict_a: "you want visual multi-step drip campaigns, lead scoring, dynamic email content, and unlimited marketing contacts self-hosted on your own server.",
    verdict_b: "you have a $1,000+/month budget and want marketing, sales CRM, and ad retargeting managed by a single SaaS vendor.",
    rows: [
      ["License", "Open Source (GPLv3)", "Proprietary Commercial SaaS"],
      ["Contact Tier Pricing", "$0 for unlimited marketing contacts", "$800/mo base + steep per-1,000 contact tiers"],
      ["Campaign Builder", "Visual drag-and-drop decision/action flowchart", "Visual workflow automation"],
      ["Lead Scoring & Tracking", "Included free (Page hits, points, stages)", "Locked behind Professional/Enterprise tiers"],
    ],
    what_a: "Mautic is an open-source marketing automation platform providing multi-channel campaigns, lead nurturing, contact segmentation, and landing page builders.",
    what_b: "HubSpot Marketing Hub is a commercial inbound marketing and automation suite.",
    t1_title: "Escaping the 'Marketing Contact' Tax",
    t1_body: "HubSpot Marketing Hub Professional starts around $800/month for just 2,000 contacts and scales into thousands per month as your list grows. Mautic lets you nurture 500,000+ leads with zero contact-tier penalties.",
    t2_title: "First-Party Cookie & GDPR Privacy",
    t2_body: "Hosting Mautic on a subdomain of your own website means tracking pixels and form submissions are 100% first-party and never shared with third-party ad brokers.",
    pros_a: "True visual drip campaign builder; lead scoring & segments; unlimited contacts; active community.",
    cons_a: "PHP/Symfony application requires proper cron job configuration during initial setup.",
    pros_b: "Polished UI; native integration with HubSpot Sales CRM.",
    cons_b: "Mandatory annual contracts; $3,000 onboarding fees; punitive contact-volume pricing.",
    final_rec: "If you need real behavioral marketing automation and drip campaigns without HubSpot's $10,000+/year price tag, **Mautic** is the only open-source platform with full feature parity."
  },
  {
    slug: "medusa-vs-shopify",
    tool_a: "Medusa",
    tool_b: "Shopify",
    intro: "Medusa and Shopify both power modern e-commerce storefronts, carts, checkouts, and order fulfillment. While Shopify locks merchants into its proprietary cloud ecosystem and charges transaction fees plus $2,300/month for Shopify Plus, Medusa is a modular, headless TypeScript e-commerce engine built for developers.",
    verdict_a: "you are building a custom Next.js storefront, B2B marketplace, multi-region/multi-currency store, or custom checkout flow with zero platform transaction fees.",
    verdict_b: "you want a no-code point-and-click store for standard retail merchandise and don't need custom backend domain logic.",
    rows: [
      ["Architecture", "Open-Source Headless Node.js / TypeScript Engine", "Proprietary Monolithic/Headless SaaS"],
      ["License", "Open Source (MIT)", "Proprietary Commercial SaaS"],
      ["Platform Transaction Fees", "0% (Pay only your Stripe/Adyen processor rate)", "0.2% – 2.0% extra if not using Shopify Payments"],
      ["Enterprise B2B / Multi-Currency", "Included free in open-source core", "Requires Shopify Plus ($2,300+/month)"],
    ],
    what_a: "Medusa is the leading open-source headless commerce platform built in Node.js and TypeScript, offering modular primitives for carts, products, regions, subscriptions, and B2B workflows.",
    what_b: "Shopify is a commercial hosted e-commerce platform for online stores and retail point-of-sale.",
    t1_title: "Custom Checkout & B2B Logic vs Shopify Plus Lock-In",
    t1_body: "Shopify restricts checkout customization and B2B price lists unless you upgrade to Shopify Plus at $2,300+/month. Medusa gives you full control over checkout steps and custom tax/shipping providers in standard TypeScript.",
    t2_title: "Zero Revenue Share",
    t2_body: "Because Medusa is MIT-licensed and self-hosted on your own PostgreSQL database, you never pay a percentage of your GMV to your software vendor.",
    pros_a: "MIT licensed; clean modular TypeScript architecture; official Next.js starter storefront; $0 GMV tax.",
    cons_a: "Requires a developer to deploy and connect payment/shipping plugins.",
    pros_b: "Turnkey for non-technical store owners; massive plug-and-play app store.",
    cons_b: "Revenue-share transaction fees; API rate limits; $2,300/mo paywall for enterprise checkout customization.",
    final_rec: "For developer-led brands, B2B commerce, marketplaces, and custom Next.js storefronts, **Medusa** provides Shopify Plus capabilities with 100% code ownership."
  },
  {
    slug: "lago-vs-stripe-billing",
    tool_a: "Lago",
    tool_b: "Stripe Billing",
    intro: "Lago and Stripe Billing both handle subscriptions, usage-based metering, prepaid credits, and invoicing for SaaS and AI companies. Stripe Billing takes a permanent 0.7% cut of your company's recurring revenue on top of payment processing fees, whereas Lago is an open-source metering and billing engine you can self-host.",
    verdict_a: "you run an AI, API, or SaaS company with high-volume usage-based metering (tokens, GBs, API calls) and want to eliminate Stripe Billing's 0.7% revenue tax.",
    verdict_b: "you only have simple flat-rate monthly subscriptions and low revenue volume where 0.7% is negligible.",
    rows: [
      ["License", "Open Source (AGPLv3)", "Proprietary Stripe Add-on"],
      ["Billing Engine Fee", "$0 Self-Hosted (0% of revenue)", "0.7% of all recurring & metered billing volume"],
      ["Event Ingestion Speed", "Up to 15,000 events/sec (Kafka/ClickHouse architecture)", "Rate-limited Stripe Meter Events API"],
      ["Payment Gateways", "Payment-agnostic (Stripe, Adyen, GoCardless, Wire)", "Locked strictly to Stripe Payments"],
    ],
    what_a: "Lago is an open-source metering and usage-based billing platform built for hybrid pricing models, connecting to any payment processor.",
    what_b: "Stripe Billing is Stripe's commercial subscription and invoicing module layered on top of Stripe Payments.",
    t1_title: "Saving $70,000/Year at $10M ARR",
    t1_body: "Stripe Billing charges 0.7% of billing volume—at $5M ARR you pay $35,000/year just for invoice calculation, on top of credit card fees. Lago decouples billing logic from payment processing so you only pay raw payment gateway fees.",
    t2_title: "High-Throughput Usage Metering for AI & APIs",
    t2_body: "Lago is engineered specifically for real-time token, compute-second, and API-call metering with idempotency, real-time wallet drawdowns, and SQL-like aggregation rules.",
    pros_a: "Eliminates the 0.7% Stripe Billing tax; payment-gateway agnostic; built for complex AI/API usage metering.",
    cons_a: "Requires self-hosting Ruby/Go/Postgres services (or using Lago Cloud).",
    pros_b: "Zero infrastructure setup if you already use Stripe.",
    cons_b: "Permanent 0.7% revenue share; locks you out of multi-PSP routing (Adyen, Braintree).",
    final_rec: "Any AI, API, or B2B SaaS company building usage-based or hybrid pricing should adopt **Lago** to own their billing ledger and avoid paying a permanent percentage of revenue."
  },
  {
    slug: "langfuse-vs-langsmith",
    tool_a: "Langfuse",
    tool_b: "LangSmith",
    intro: "Langfuse and LangSmith are the two leading LLM engineering platforms for tracing, prompt management, evaluation, and cost tracking of AI applications. LangSmith is a closed-source commercial platform built by the creators of LangChain, while Langfuse is open-source, framework-agnostic, and fully self-hostable.",
    verdict_a: "you want an open-source (MIT), self-hostable LLM observability and prompt management platform that works seamlessly across OpenAI SDK, Vercel AI SDK, LangChain, and LiteLLM.",
    verdict_b: "your entire stack is written exclusively in LangChain/LangGraph and you prefer a managed SaaS from the same vendor.",
    rows: [
      ["License", "Open Source (MIT Core)", "Proprietary Commercial SaaS"],
      ["Self-Hosting", "Docker Compose & Kubernetes (Free)", "Enterprise Tier only (Paid license)"],
      ["Framework Agnostic", "Native OpenTelemetry, OpenAI SDK, Vercel AI, LangChain", "Optimized primarily for LangChain / LangGraph"],
      ["Prompt Management", "Versioned prompts with client-side caching", "LangSmith Prompt Hub"],
    ],
    what_a: "Langfuse is an open-source LLM engineering platform providing nested trace visualization, token cost analytics, versioned prompt management, dataset benchmarking, and evaluations.",
    what_b: "LangSmith is a proprietary developer platform by LangChain for debugging, testing, and monitoring LLM applications.",
    t1_title: "Keeping Customer Prompts & PII Inside Your VPC",
    t1_body: "LLM traces contain every raw user prompt, RAG document chunk, and model response. LangSmith requires an expensive Enterprise contract to self-host, whereas Langfuse lets any startup self-host on Docker or Kubernetes for $0.",
    t2_title: "First-Class Support Beyond LangChain",
    t2_body: "Many production teams have moved away from heavy frameworks toward direct OpenAI/Anthropic SDKs or the Vercel AI SDK. Langfuse treats all SDKs and OpenTelemetry traces as first-class citizens.",
    pros_a: "MIT-licensed open source; easy Docker self-hosting; framework-agnostic; built-in prompt caching and playground.",
    cons_a: "High-scale production self-hosting benefits from ClickHouse + Postgres setup.",
    pros_b: "Zero-config 1-line env var setup if you already use LangChain.",
    cons_b: "Closed source; self-hosting locked behind enterprise sales; per-trace usage costs.",
    final_rec: "For production AI engineering teams that value data privacy, open standards, and framework independence, **Langfuse** is the clear industry favorite."
  }
];

async function run() {
  console.log("Seeding Comparisons Part 2 (15 items)...");
  let success = 0;
  for (const item of COMPARISONS_PART2) {
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
  console.log(`Part 2 finished: ${success}/${COMPARISONS_PART2.length} comparisons updated/created.`);
}

run();
