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

const nowIso = new Date().toISOString();

const ARTICLES = [
  {
    slug: "openobserve-the-rust-observability-engine-that-crushed-datadog",
    title: "OpenObserve: The Rust Observability Engine Cutting Log & Datadog Costs by 140x",
    tool_name: "OpenObserve",
    related_tool_url: "https://github.com/openobserve/openobserve",
    reading_time: 6,
    read_time: "6 min",
    tags: ["observability", "logs", "rust", "datadog-alternative", "opentelemetry", "s3"],
    mystery_intro:
      "Every scaling engineering team hits the exact same unpleasant milestone: their Datadog or Elastic Cloud invoice quietly overtakes their primary database hosting bill. When ingesting tens of terabytes of logs costs $0.10 per gigabyte plus indexing surcharges, observability turns into an existential margin tax. OpenObserve approached this from bare-metal Rust—replacing heavy JVM heaps and expensive hot SSD shards with compressed Apache Parquet streamed straight to S3.",
    superpower:
      "OpenObserve unifies logs, metrics, OpenTelemetry distributed traces, frontend real-user monitoring (RUM), and alerting inside one compact Rust binary backed by DataFusion and S3 object storage. Unlike Elasticsearch clusters that demand 32GB+ of JVM heap memory just to stay upright, OpenObserve ingests millions of JSON log events while keeping local RAM tiny and supporting full SQL and PromQL filtering across arbitrary nested fields.",
    origin_story:
      "Founded by infrastructure engineers who experienced multi-million-dollar enterprise logging pain firsthand while operating Petabyte-scale Kubernetes fleets, OpenObserve rejected the conventional wisdom that searchable observability required hot NVMe shards. Instead, combining Rust's zero-GC speed, Apache Arrow columnar memory layouts, and immutable Parquet chunks on S3/MinIO unlocked an order-of-magnitude cost collapse.",
    why_care:
      "For startups and mid-market DevOps teams drowning in ELK maintenance or Datadog log overage fees, OpenObserve gives a turnkey drop-in pipeline (compatible with FluentBit, Vector, OpenTelemetry, and Elastic Bulk APIs) at roughly ~140x lower storage footprint without forfeiting fast SQL debugging.",
    hands_on_code: `services:
  openobserve:
    image: public.ecr.aws/zinclabs/openobserve:latest
    container_name: openobserve
    restart: unless-stopped
    ports:
      - "5080:5080"
    environment:
      ZO_ROOT_USER_EMAIL: "admin@example.com"
      ZO_ROOT_USER_PASSWORD: "ComplexPassword123!"
    volumes:
      - ./openobserve-data:/data`,
    user_case:
      "Production engineering teams point Vector and OpenTelemetry collectors directly at port 5080, retain 90+ days of structured JSON API logs on Cloudflare R2 or AWS S3 for pennies per terabyte, and run sub-second SQL alerts across checkout errors and webhook failures.",
  },
  {
    slug: "signoz-the-opentelemetry-native-datadog-replacement",
    title: "SigNoz: The OpenTelemetry-Native APM & Datadog Replacement Built on ClickHouse",
    tool_name: "SigNoz",
    related_tool_url: "https://github.com/SigNoz/signoz",
    reading_time: 6,
    read_time: "6 min",
    tags: ["apm", "opentelemetry", "clickhouse", "datadog-alternative", "devops", "tracing"],
    mystery_intro:
      "Most open-source monitoring stacks force engineers to stitch together three separate systems—Prometheus for metrics, Jaeger for traces, and Loki for logs—leaving teams wishing for Datadog's cohesive APM experience without Datadog's $15-$31/host agent tax. SigNoz solved the fragmentation problem by building a unified observability suite natively on two pillars: OpenTelemetry and ClickHouse.",
    superpower:
      "SigNoz captures distributed trace flamegraphs, database query latencies, p99 endpoints, exception stack traces, infrastructure metrics, and correlated structured logs inside one correlated web console. Clicking any latency spike on an API chart jumps straight into the exact slow SQL span and log context.",
    origin_story:
      "Born during Y Combinator and forged with heavy community contributions across the CNCF OpenTelemetry ecosystem, SigNoz bet early that OpenTelemetry would become the universal instrumentation standard—making proprietary monitoring agents obsolete while ClickHouse handled columnar trace aggregation effortlessly.",
    why_care:
      "Instrumenting Node.js, Go, Python, Rust, or Java services with standard OpenTelemetry SDKs eliminates vendor lock-in permanently. Self-hosting SigNoz on a dedicated 8GB NVMe VPS handles millions of daily spans with zero per-seat or high-cardinality surprise fees.",
    hands_on_code: `git clone -b main https://github.com/SigNoz/signoz.git
cd signoz/deploy/
./install.sh
# Or point your OpenTelemetry SDK directly at port 4317 (gRPC) / 4318 (HTTP)`,
    user_case:
      "SaaS engineering orgs migrating from New Relic or Datadog APM swap their proprietary agents for standard OTel auto-instrumentation, inspect slow Redis/Postgres spans via SigNoz service maps, and trigger Slack alerts on p99 latency regressions.",
  },
  {
    slug: "bruno-the-git-native-api-client-that-killed-postman",
    title: "Bruno: The Offline, Git-Native API Client That Ended Postman's Cloud Lock-In",
    tool_name: "Bruno",
    related_tool_url: "https://github.com/usebruno/bruno",
    reading_time: 5,
    read_time: "5 min",
    tags: ["api-testing", "postman-alternative", "git", "mit-license", "developer-tools"],
    mystery_intro:
      "When Postman depreciated its Scratch Pad mode and required forced cloud accounts to save local API collections, developers across enterprises hit a security wall—internal bearer tokens, staging credentials, and private routes could no longer stay cleanly off third-party clouds. Bruno answered with a radical idea: skip cloud sync altogether and save API requests as plain text files right inside your Git repository.",
    superpower:
      "Bruno introduces `.bru` files—human-readable markup files describing URLs, headers, pre-request scripts, assertions, and GraphQL queries inside standard directories. Because collections live in Git beside your code, backend engineers ship controller changes and updated API test collections inside the exact same Pull Request.",
    origin_story:
      "Created by Anoop M D to scratch his own itch after Postman team paywalls blocked simple collection collaboration, Bruno launched under the permissive MIT license and exploded past 30,000 GitHub stars inside months as Fortune 500 engineering teams banned external cloud API sync tools.",
    why_care:
      "No forced sign-ins, zero monthly subscription seats ($0 vs. Postman's $33/developer/mo), spotless Git diff reviews, and an integrated CLI (`bru run`) that runs API integration tests cleanly inside GitHub Actions CI pipelines.",
    hands_on_code: `# Install Bruno CLI to run .bru API test collections in CI/CD
npm install -g @usebruno/cli
cd ./api-collections
bru run --env production`,
    user_case:
      "Full-stack product squads keep an `/api-tests` directory inside their monorepo, review endpoint payload updates directly in GitHub PR diffs, and run automated regression assertions via `bru run` before merging to `main`.",
  },
  {
    slug: "hoppscotch-the-sub-second-open-source-api-platform",
    title: "Hoppscotch: The Lightweight Web & Docker API Platform Replacing Heavy Desktop Clients",
    tool_name: "Hoppscotch",
    related_tool_url: "https://github.com/hoppscotch/hoppscotch",
    reading_time: 5,
    read_time: "5 min",
    tags: ["api-client", "postman-alternative", "graphql", "websocket", "mit-license", "self-hosted"],
    mystery_intro:
      "Opening Electron-based API clients often feels like booting a second operating system just to fire one POST request. Hoppscotch reimagined the API workspace as a sub-second Progressive Web App (and native Tauri desktop shell) supporting REST, GraphQL, WebSockets, MQTT, Server-Sent Events, and Socket.IO right inside any browser.",
    superpower:
      "Beyond instant startup, Hoppscotch Community Edition ships a complete self-hostable Docker Compose platform with team RBAC workspaces, OAuth 2.0 flows, environment secret variables, pre-request JavaScript tests, and Postman JSON importers under an MIT license.",
    origin_story:
      "Started as 'Postwoman' by Liyas Thomas as a sleek weekend open-source side project, Hoppscotch evolved into one of GitHub's most starred developer utilities (>68,000 stars) used daily by frontend, backend, and QA teams worldwide.",
    why_care:
      "Teams wanting centralized, browser-accessible workspace sharing without forcing developers to maintain local desktop installs deploy Hoppscotch behind corporate SSO on Docker for $0 per seat.",
    hands_on_code: `services:
  hoppscotch:
    image: hoppscotch/hoppscotch:latest
    container_name: hoppscotch
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "3100:3100"`,
    user_case:
      "Distributed frontend and QA engineers log into an internal `api.company.internal` Hoppscotch Docker instance, inspect real-time WebSocket event streams and GraphQL schemas together, and share reproducible bug-fix requests via direct workspace links.",
  },
  {
    slug: "docuseal-the-self-hosted-esignature-engine-replacing-docusign",
    title: "DocuSeal: The Single-Container eSignature Engine Replacing DocuSign's $40/User Paywalls",
    tool_name: "DocuSeal",
    related_tool_url: "https://github.com/docusealco/docuseal",
    reading_time: 6,
    read_time: "6 min",
    tags: ["esignature", "docusign-alternative", "pdf", "self-hosted", "docker", "legal"],
    mystery_intro:
      "DocuSign built an empire charging $40/user/month while strictly metering sent contracts at ~100 envelopes per year and locking API signing workflows behind steep enterprise add-ons. DocuSeal brings legally verifiable ESIGN/eIDAS electronic signatures, conditional PDF forms, and white-labeled React embeds inside one tiny self-hosted container.",
    superpower:
      "Unlike clunky legacy PDF tools, DocuSeal gives ops teams a razor-sharp drag-and-drop field builder supporting multi-party sequential signing, conditional checkboxes, file attachments, verified audit-trail certificates with SHA-256 document hashing, and instant mobile signing links.",
    origin_story:
      "Created cleanly with performance-tuned Ruby on Rails and SQLite/PostgreSQL, DocuSeal gained rapid traction among fintech, real-estate, and SaaS founders tired of embedding clunky iframe redirects or surrendering client tax/NDA documents to external clouds.",
    why_care:
      "Deploy once on a $5 VPS and send 10,000+ NDAs, vendor MSAs, or employee offer letters annually for zero extra license cost—while integrating signature webhooks seamlessly into onboarding apps via clean REST APIs.",
    hands_on_code: `services:
  docuseal:
    image: docuseal/docuseal:latest
    container_name: docuseal
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./docuseal-data:/data`,
    user_case:
      "SaaS onboarding portals, HR teams, and boutique agencies auto-generate employment agreements and client SOWs via DocuSeal's API, capture mobile touchscreen signatures on their own custom domain, and archive signed PDFs directly to private S3 storage.",
  },
  {
    slug: "dokploy-the-lightweight-paas-that-replaces-vercel-and-railway",
    title: "Dokploy: The Apache-2.0 Self-Hosted PaaS Replacing Vercel & Railway on a $5 VPS",
    tool_name: "Dokploy",
    related_tool_url: "https://github.com/Dokploy/dokploy",
    reading_time: 6,
    read_time: "6 min",
    tags: ["paas", "vercel-alternative", "railway-alternative", "docker", "devops", "traefik"],
    mystery_intro:
      "Managed cloud platforms like Vercel and Railway spoil developers with effortless `git push` workflows—right until a viral traffic spike triggers $40/100GB bandwidth overages, serverless function timeouts cut off long AI requests, or multiple staging databases multiply monthly compute invoices. Dokploy puts that exact seamless PaaS experience natively atop any Ubuntu VPS.",
    superpower:
      "Built cleanly over Docker Swarm, Traefik automatic Let's Encrypt SSL, and Nixpacks/Buildpacks, Dokploy deploys Next.js, Python, Go, Rust, static SPAs, and multi-container `docker-compose.yml` stacks automatically on GitHub push—complete with 1-click Postgres, Redis, MySQL, and S3 scheduled backups.",
    origin_story:
      "Engineered in modern TypeScript and Next.js for effortless UI responsiveness, Dokploy became a breakout star among indie hackers, AI founders, and agencies wanting Vercel simplicity alongside predictable fixed Hetzner/DigitalOcean server pricing.",
    why_care:
      "Colocate your frontend app, Python AI background worker, PostgreSQL database, and Redis cache inside the same private Docker network for zero-millisecond DB roundtrips and zero bandwidth surcharges.",
    hands_on_code: `# 1-Command Installation on Ubuntu / Debian VPS:
curl -sSL https://dokploy.com/install.sh | sh`,
    user_case:
      "Startup engineering teams run staging preview environments, customer-facing Next.js apps, and cron workers on a single $15 Hetzner CPX31 VPS—saving $300–$1,000/mo vs. multi-tier SaaS hosting.",
  },
  {
    slug: "twenty-the-modern-open-source-crm-challenging-salesforce-and-hubspot",
    title: "Twenty: The Modern Open-Source CRM Challenging Salesforce & HubSpot Bloat",
    tool_name: "Twenty",
    related_tool_url: "https://github.com/twentyhq/twenty",
    reading_time: 6,
    read_time: "6 min",
    tags: ["crm", "salesforce-alternative", "hubspot-alternative", "graphql", "typescript", "self-hosted"],
    mystery_intro:
      "For over two decades, CRM buyers faced an ugly choice: endure clunky, 2005-era PHP open-source dashboards or pay HubSpot and Salesforce $90–$165/seat/month for clean UX and basic workflow automation. Twenty shattered that compromise—delivering a sleek Notion/Linear-inspired TypeScript CRM with first-class GraphQL APIs and zero per-seat vendor lock-in.",
    superpower:
      "Powered by TypeScript, React, NestJS, PostgreSQL, and Redis, Twenty lets teams model arbitrary custom objects, Kanban deal pipelines, Gmail/Outlook mailbox syncing, notes, tasks, and webhook automations inside a clean dark/light UI your sales team actually enjoys using.",
    origin_story:
      "Backed by Y Combinator and supported by thousands of contributors worldwide, Twenty built explicitly for modern product-led startups, boutique agencies, and engineering teams wanting Linear's design standard inside an auditable GPL-3.0 open-source CRM.",
    why_care:
      "Sales organizations escaping HubSpot's steep Professional onboarding gates gain 100% database ownership, custom schema freedom, and unlimited contractor/sales seats under one self-hosted Docker Compose deployment.",
    hands_on_code: `curl -O https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-docker/docker-compose.yml
docker compose up -d`,
    user_case:
      "Dev-tool startups sync Stripe billing webhooks and GitHub stars directly into custom Twenty CRM workspace objects via GraphQL—giving founders real-time product-qualified lead pipelines with zero CRM tax.",
  },
  {
    slug: "posthog-the-open-source-product-analytics-os-replacing-mixpanel",
    title: "PostHog: How One ClickHouse Platform Replaced Mixpanel, Hotjar, and LaunchDarkly",
    tool_name: "PostHog",
    related_tool_url: "https://github.com/PostHog/posthog",
    reading_time: 6,
    read_time: "6 min",
    tags: ["analytics", "mixpanel-alternative", "clickhouse", "session-replay", "feature-flags"],
    mystery_intro:
      "Modern software teams used to stitch together five separate SaaS tools: Mixpanel for event funnels, Amplitude for retention cohorts, Hotjar/FullStory for session replays, LaunchDarkly for feature flags, and Optimizely for A/B tests. PostHog collapsed the entire suite onto one unified ClickHouse platform.",
    superpower:
      "Because PostHog binds event analytics, session recordings, feature flags, and surveys to the exact same underlying user identity in ClickHouse, engineers watching a funnel drop-off can click any bar and instantly watch the exact user DOM session replay leading up to an unhandled exception.",
    origin_story:
      "Born out of YC W20 by James Hawkins and Tim Glaser as an open-source hacker tool on Hacker News, PostHog pioneered transparent open-source product engineering—opening source code, pricing formulas, and product strategy publicly while scaling past 24,000 GitHub stars.",
    why_care:
      "Consolidating 4 commercial analytics/flagging subscriptions slashes stack costs dramatically while giving engineers direct HogQL SQL access over raw event data.",
    hands_on_code: `# Quick Hobby Self-Hosted Stack Deploy (Requires 4+ vCPU / 8GB+ RAM Ubuntu VPS):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/posthog/posthog/HEAD/bin/deploy-hobby)"`,
    user_case:
      "Product engineers deploy canary feature flags safely to 5% of beta tenants, monitor activation funnel lifts directly inside PostHog trends, and inspect live session recordings whenever checkout drop-offs spike.",
  },
  {
    slug: "immich-the-self-hosted-google-photos-replacement",
    title: "Immich: The High-Performance Self-Hosted Google Photos Replacement Families Actually Love",
    tool_name: "Immich",
    related_tool_url: "https://github.com/immich-app/immich",
    reading_time: 6,
    read_time: "6 min",
    tags: ["photos", "google-photos-alternative", "self-hosted", "homelab", "ai-search", "docker"],
    mystery_intro:
      "Countless open-source photo servers failed over the past decade for one simple reason: their mobile apps felt clunky, uploads stalled in the background, and family members went straight back to Google Photos or Apple iCloud. Immich changed everything by engineering mobile auto-backup and timeline scrubbing to feel indistinguishable from Google Photos.",
    superpower:
      "Powered by Flutter mobile apps, TypeScript/NestJS backend, PostgreSQL (`pgvecto.rs`), and a Python machine-learning container, Immich delivers automated iOS/Android background backup, multi-user partner sharing, interactive world photo maps, facial recognition clustering, and instant CLIP semantic search across 100,000+ RAW and HEIC photos.",
    origin_story:
      "Started in 2022 by Alex Tran purely to build a trustworthy home backup experience for his family after Google Photos dropped unlimited free storage, Immich rapidly surged past 60,000+ GitHub stars to become the crown jewel of `r/selfhosted`.",
    why_care:
      "Stop paying endless tiered Google One / iCloud+ storage renewals across every family member while ensuring private family memories are never scanned, monetized, or locked inside proprietary cloud accounts.",
    hands_on_code: `mkdir ./immich-app && cd ./immich-app
wget -O docker-compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml
wget -O .env https://github.com/immich-app/immich/releases/latest/download/example.env
docker compose up -d`,
    user_case:
      "Families point iPhones and Android devices at a home NAS or Hetzner Storage Box running Immich over WireGuard/Tailscale, enjoying instant 4K timeline browsing, smart semantic search ('hiking snow 2024'), and shared holiday albums.",
  },
  {
    slug: "dragonfly-the-25x-faster-drop-in-redis-replacement",
    title: "Dragonfly: The Multi-Threaded Drop-In Redis Replacement Achieving 25x Higher Throughput",
    tool_name: "Dragonfly",
    related_tool_url: "https://github.com/dragonflydb/dragonfly",
    reading_time: 6,
    read_time: "6 min",
    tags: ["cache", "redis-alternative", "database", "performance", "c++", "docker"],
    mystery_intro:
      "Redis revolutionized in-memory caching on the single-threaded design of 2009 hardware. Yet on modern 16-to-64-core cloud servers, scaling Redis meant orchestrating fragile shard clusters while snapshot forks (`BGSAVE`) caused unpredictable 2x memory spikes—forcing ops teams to provision huge standby RAM headroom right as Redis switched to proprietary licensing.",
    superpower:
      "Written in modern C++ with a shared-nothing multi-threaded io_uring architecture and Dashtable data structures, Dragonfly utilizes every CPU core inside one vertical instance to push 3.8M+ ops/sec while cutting memory overhead ~30% and saving crash-safe snapshots without Linux `fork()` RAM doubling.",
    origin_story:
      "Engineered by Roman Gershman (an alumnus of Google Cloud & AWS storage teams) after scaling multi-terabyte Redis fleets exposed fundamental single-threaded bottlenecks, Dragonfly launched straight onto GitHub and quickly became the go-to vertical speed upgrade for high-traffic caches and BullMQ/Sidekiq queues.",
    why_care:
      "Drop Dragonfly straight behind your existing `ioredis`, `redis-py`, or Go Redis clients with zero application code modifications—replacing multi-node Redis clusters with a single ultra-dense vertical instance at massive hardware savings.",
    hands_on_code: `services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly:latest
    container_name: dragonfly
    restart: unless-stopped
    ulimits:
      memlock: -1
    ports:
      - "6379:6379"
    volumes:
      - ./dragonfly-data:/data`,
    user_case:
      "High-volume SaaS APIs, Next.js ISR caches, and BullMQ job queues replace complex 6-node Redis Cluster topologies with one multi-threaded Dragonfly container—halving cloud cache RAM bills immediately.",
  },
];

async function main() {
  console.log(`Seeding ${ARTICLES.length} Article Museum deep-dives...`);
  let count = 0;
  for (const art of ARTICLES) {
    const payload = {
      slug: art.slug,
      title: art.title,
      tool_name: art.tool_name,
      mystery_intro: art.mystery_intro,
      superpower: art.superpower,
      origin_story: art.origin_story,
      why_care: art.why_care,
      hands_on_code: art.hands_on_code,
      user_case: art.user_case,
      tags: art.tags,
      related_tool_url: art.related_tool_url,
      reading_time: art.reading_time,
      read_time: art.read_time,
      is_published: true,
      published_at: nowIso,
    };

    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", art.slug)
      .maybeSingle();

    const res = existing?.id
      ? await supabase.from("articles").update(payload).eq("id", existing.id)
      : await supabase.from("articles").insert(payload);

    if (res.error) {
      console.error(`Failed ${art.slug}:`, res.error.message);
    } else {
      count++;
      console.log(`✓ ${existing ? "Updated" : "Inserted"}: /article-museum/${art.slug}`);
    }
  }
  console.log(`Done: ${count}/${ARTICLES.length} articles live.`);
}

main();
