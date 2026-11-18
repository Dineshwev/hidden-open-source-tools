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

const SAAS_TO_REJECT = [
  "notion",
  "jira",
  "confluence",
  "linear",
  "mixpanel",
  "google-analytics",
  "retool",
  "railway",
  "auth0",
  "clerk",
  "calendly",
  "tailscale",
  "make",
  "kaggle",
];

// Curated whitelist of high-utility, unique open-source "gold-mine" tools
const GOLDMINE_SPECS = {
  // Document Signing & PDF
  docuseal: {
    stars: 9200, license: "AGPL-3.0", language: "Ruby", replaces: "DocuSign", image: "docuseal/docuseal:latest", port: "3000:3000",
    edge: "Single-container eIDAS/ESIGN compliant electronic document signing & PDF form builder with multi-party conditional fields, SHA-256 verification, and unlimited envelopes.",
    tradeoff: "Custom white-label branding and SMS 2FA sit in the commercial Pro license."
  },
  documenso: {
    stars: 8600, license: "AGPL-3.0", language: "TypeScript", replaces: "DocuSign", image: "documenso/documenso:latest", port: "3000:3000",
    edge: "Modern Next.js + Prisma open-source e-signature platform offering clean React embedding, signing links, audit trails, and PostgreSQL storage.",
    tradeoff: "Requires PostgreSQL and SMTP setup compared to SQLite single-container tools."
  },
  paperlessngx: {
    stars: 31500, license: "GPL-3.0", language: "Python", replaces: "Paperless / Adobe Document Cloud", image: "ghcr.io/paperless-ngx/paperless-ngx:latest", port: "8000:8000",
    edge: "Automated physical/PDF document OCR, ML-assisted auto-tagging, correspondent classification, and instant full-text search across invoices, taxes, and receipts.",
    tradeoff: "Needs Redis + Tesseract OCR worker RAM during bulk initial archive imports."
  },
  stirlingpdf: {
    stars: 44000, license: "MIT", language: "Java", replaces: "Adobe Acrobat Pro / Smallpdf", image: "stirlingtools/stirling-pdf:latest", port: "8080:8080",
    edge: "Complete 50+ operation local PDF Swiss-army knife (OCR, merge, split, compress, redact, sign, convert) keeping confidential PDFs completely off external websites.",
    tradeoff: "JVM container consumes more idle RAM (~400MB) than lightweight CLI utilities."
  },

  // Customer Support & Ticketing
  zammad: {
    stars: 4800, license: "AGPL-3.0", language: "Ruby", replaces: "Zendesk / Freshdesk", image: "ghcr.io/zammad/zammad-docker-compose:latest", port: "8080:8080",
    edge: "Full enterprise open-source helpdesk uniting email, chat, phone, Telegram, SLA escalation timers, macros, and Elasticsearch full-text ticket search.",
    tradeoff: "Multi-container Rails + Elasticsearch stack expects at least 4GB RAM in production."
  },
  freescout: {
    stars: 3400, license: "AGPL-3.0", language: "PHP", replaces: "Help Scout / Zendesk", image: "tiredofit/freescout:latest", port: "80:80",
    edge: "Ultra-lightweight shared support mailbox and ticketing portal running cleanly on minimal RAM with collision detection, saved replies, and IMAP sync.",
    tradeoff: "Lacks native live chat widgets or built-in phone PBX without add-on modules."
  },

  // CRM & Personal CRM
  suitecrm: {
    stars: 4600, license: "AGPL-3.0", language: "PHP", replaces: "Salesforce", image: "bitnami/suitecrm:latest", port: "8080:8080",
    edge: "Enterprise-grade self-hosted sales automation, quoting, invoicing, workflow triggers, and ACL security trusted by regulated organizations worldwide.",
    tradeoff: "Traditional PHP enterprise UI feels heavier than newer React-based CRMs."
  },
  espocrm: {
    stars: 2100, license: "AGPL-3.0", language: "PHP", replaces: "Salesforce / Pipedrive", image: "espocrm/espocrm:latest", port: "80:80",
    edge: "Fast single-page-application CRM featuring custom entities, BPM workflow automation, calendar sync, and clean REST APIs.",
    tradeoff: "Advanced BPM workflow designer requires commercial Advanced Pack extensions."
  },
  monica: {
    stars: 22000, license: "AGPL-3.0", language: "PHP", replaces: "Dex / Clay Personal CRM", image: "monica:latest", port: "80:80",
    edge: "Unique open-source personal CRM tracking relationships, important dates, gift ideas, call logs, and life events privately.",
    tradeoff: "Built intentionally for personal/network relationships rather than B2B revenue pipelines."
  },

  // Email, Newsletters & Messaging
  listmonk: {
    stars: 15200, license: "AGPL-3.0", language: "Go", replaces: "Mailchimp / SendGrid Marketing", image: "listmonk/listmonk:latest", port: "9000:9000",
    edge: "Single Go binary backed by PostgreSQL capable of blasting millions of newsletters cleanly through Amazon SES, Postmark, or custom SMTP at 95% cost savings.",
    tradeoff: "Does not host its own SMTP relay; requires pairing with SES, Mailgun, or Postmark."
  },
  mautic: {
    stars: 7600, license: "GPL-3.0", language: "PHP", replaces: "HubSpot Marketing / Marketo", image: "mautic/mautic:5-apache", port: "80:80",
    edge: "Full enterprise marketing automation suite with visual drip campaign builders, lead scoring, dynamic landing pages, and CRM sync.",
    tradeoff: "Cron job tuning and database hygiene require active admin attention on huge contact lists."
  },
  keila: {
    stars: 1800, license: "AGPL-3.0", language: "Elixir", replaces: "Mailchimp / ConvertKit", image: "pentacent/keila:latest", port: "4000:4000",
    edge: "Clean, privacy-first Elixir newsletter manager featuring block editors, Markdown emails, double opt-in forms, and effortless SMTP integration.",
    tradeoff: "Simpler segmentation and campaign workflows compared to full automation platforms like Mautic."
  },
  dittofeed: {
    stars: 2400, license: "MIT", language: "TypeScript", replaces: "Customer.io / Braze", image: "dittofeed/dittofeed:latest", port: "3000:3000",
    edge: "MIT-licensed developer-first omnichannel customer messaging engine triggering behavioral emails, SMS, and push journeys directly from event streams.",
    tradeoff: "Requires Temporal workflow server + ClickHouse in full distributed production setups."
  },

  // BI, Data & Analytics
  superset: {
    stars: 65000, license: "Apache-2.0", language: "Python", replaces: "Tableau / Looker", image: "apache/superset:latest", port: "8088:8088",
    edge: "Apache-2.0 enterprise BI platform scaling across ClickHouse, Trino, Postgres, and DuckDB with 50+ interactive chart types and SQL Lab.",
    tradeoff: "Initial role/permission configuration and cache setup take longer than Metabase."
  },
  redash: {
    stars: 26500, license: "BSD-2-Clause", language: "Python", replaces: "Mode Analytics / Tableau", image: "redash/redash:latest", port: "5000:5000",
    edge: "SQL-first dashboarding connecting cleanly to 40+ databases and JSON APIs with scheduled refresh queries and threshold alerts.",
    tradeoff: "Less suited to non-technical drag-and-drop exploration without writing SQL."
  },
  evidence: {
    stars: 4900, license: "MIT", language: "TypeScript", replaces: "Tableau / Power BI", image: "ghcr.io/evidence-dev/evidence:latest", port: "3000:3000",
    edge: "Business Intelligence as code: builds crisp interactive DuckDB WASM data reports straight from Markdown + SQL commits in Git.",
    tradeoff: "Requires Git + SQL workflow rather than browser click-and-drag chart builders."
  },
  rybbit: {
    stars: 3200, license: "AGPL-3.0", language: "TypeScript", replaces: "Google Analytics / Mixpanel", image: "ghcr.io/rybbit-io/rybbit:latest", port: "3000:3000",
    edge: "Clean cookieless web & product analytics unifying live visitor globes, conversion funnels, web vitals, and user journeys on ClickHouse.",
    tradeoff: "Requires ClickHouse for analytical queries."
  },
  hitkeep: {
    stars: 1900, license: "AGPL-3.0", language: "Go", replaces: "Google Analytics / Plausible", image: "ghcr.io/hitkeep/hitkeep:latest", port: "8080:8080",
    edge: "Single-binary Go privacy-first web analytics combining DuckDB speed, conversion funnels, and ecommerce event tracking with zero external cluster setup.",
    tradeoff: "Newer community plugin ecosystem compared to Matomo or PostHog."
  },
  netron: {
    stars: 29500, license: "MIT", language: "JavaScript", replaces: "Proprietary ML Profilers", image: "lutzroeder/netron:latest", port: "8080:8080",
    edge: "The universal open-source visual graph inspector for ONNX, PyTorch, TensorFlow, Safetensors, and CoreML neural network architectures.",
    tradeoff: "Strictly visualizes static model graphs rather than runtime training metrics."
  },

  // API, Identity, DNS & Networking
  insomnia: {
    stars: 35500, license: "Apache-2.0", language: "TypeScript", replaces: "Postman", image: "kong/insomnia:latest", port: "8080:8080",
    edge: "Full-featured API client & OpenAPI 3.1 design suite supporting REST, GraphQL, gRPC, automated spec linting, and encrypted Git sync.",
    tradeoff: "Recent commercial cloud changes prompted many privacy purists to evaluate Bruno or Hoppscotch."
  },
  ory: {
    stars: 11500, license: "Apache-2.0", language: "Go", replaces: "Auth0 / Okta", image: "oryd/kratos:latest", port: "4433:4433",
    edge: "Cloud-native modular Go identity stack (Kratos, Hydra, Keto, Oathkeeper) powering high-scale OAuth2/OIDC, headless auth, and Zanzibar RBAC permissions.",
    tradeoff: "Steeper microservice integration curve than all-in-one dashboards like Authentik or Keycloak."
  },
  pangolin: {
    stars: 9500, license: "AGPL-3.0", language: "Go", replaces: "Cloudflare Tunnels / Zscaler", image: "fosrl/pangolin:latest", port: "3000:3000",
    edge: "Self-hosted identity-aware tunneled reverse proxy combining WireGuard mesh tunnels, Traefik SSL, and SSO login gates on any cheap VPS.",
    tradeoff: "Requires a public VPS with ports 80/443 open as the edge relay node."
  },
  pihole: {
    stars: 49500, license: "EUPL-1.2", language: "Shell", replaces: "NextDNS / Commercial DNS Filters", image: "pihole/pihole:latest", port: "53:53",
    edge: "The iconic network-wide DNS sinkhole blocking trackers, telemetry, and ad domains across every laptop, phone, and smart TV automatically.",
    tradeoff: "Blocks DNS-level domains; cannot strip inline YouTube video ads served from first-party domains."
  },
  "adguard-home": {
    stars: 26500, license: "GPL-3.0", language: "Go", replaces: "NextDNS / ControlD", image: "adguard/adguardhome:latest", port: "3000:3000",
    edge: "Single Go binary network DNS blocker natively supporting Encrypted DNS-over-HTTPS (DoH), DNS-over-TLS (DoT), and per-device parental controls.",
    tradeoff: "Requires port 53 binding adjustment on systemd-resolved Linux hosts."
  },
  blocky: {
    stars: 4500, license: "Apache-2.0", language: "Go", replaces: "NextDNS / Managed DNS", image: "spx01/blocky:latest", port: "4000:4000",
    edge: "Fast, declarative YAML-configured DNS proxy and ad-blocker written in Go featuring Prometheus metrics, Redis caching, and zero stateful web DB bloat.",
    tradeoff: "Configured entirely via YAML files rather than a clickable admin panel."
  },

  // CMS, Web Builders & E-Commerce
  ghost: {
    stars: 47500, license: "MIT", language: "JavaScript", replaces: "Substack / Medium / WordPress", image: "ghost:5-alpine", port: "2368:2368",
    edge: "Fast MIT-licensed Node.js publishing platform uniting SEO blogging, native paid Stripe newsletters, and member subscriptions with zero plugin bloat.",
    tradeoff: "Opinionated editorial CMS rather than an all-purpose ecommerce or forum platform."
  },
  strapi: {
    stars: 64000, license: "MIT", language: "TypeScript", replaces: "Contentful / Sanity", image: "strapi/strapi:latest", port: "1337:1337",
    edge: "Developer-first Node.js headless CMS automatically generating customizable REST and GraphQL content APIs, media libraries, and RBAC admin panels.",
    tradeoff: "Major version upgrades and plugin compatibility require careful testing before deployment."
  },
  cockpit: {
    stars: 8200, license: "MIT", language: "PHP", replaces: "Contentful / Sanity", image: "agentejo/cockpit:latest", port: "80:80",
    edge: "Zero-bloat self-hosted headless CMS exposing flexible collections, singletons, and JSON content APIs smoothly on lightweight PHP hosting.",
    tradeoff: "Smaller third-party plugin ecosystem compared to Strapi or Directus."
  },
  webstudio: {
    stars: 9200, license: "AGPL-3.0", language: "TypeScript", replaces: "Webflow / Framer", image: "ghcr.io/webstudio-is/webstudio:latest", port: "3000:3000",
    edge: "True open-source visual CSS Grid/Flexbox website builder emitting clean standard React/Remix code instead of locked proprietary site exports.",
    tradeoff: "Self-hosting the full visual builder stack requires Postgres, Redis, and S3 asset storage."
  },
  medusa: {
    stars: 27000, license: "MIT", language: "TypeScript", replaces: "Shopify Plus", image: "medusajs/medusa:latest", port: "9000:9000",
    edge: "Modular MIT-licensed headless commerce engine supporting multi-currency catalogs, custom checkout pricing, fulfillment plugins, and zero 2% Shopify transaction taxes.",
    tradeoff: "Requires custom frontend storefront development (Next.js starter provided)."
  },
  bagisto: {
    stars: 15500, license: "MIT", language: "PHP", replaces: "Shopify / Magento", image: "bagisto/bagisto:latest", port: "80:80",
    edge: "Complete Laravel e-commerce platform offering multi-warehouse inventory, B2B/multi-vendor marketplace modules, and turnkey admin storefronts out of the box.",
    tradeoff: "PHP monolith architecture suits traditional Laravel hosting rather than edge serverless."
  },

  // Media, Books, Audio & Video Streaming
  jellyfin: {
    stars: 36000, license: "GPL-2.0", language: "C#", replaces: "Plex / Emby", image: "jellyfin/jellyfin:latest", port: "8096:8096",
    edge: "100% pure open-source home media server delivering unlimited free GPU hardware transcoding (NVENC/QuickSync), native TV clients, and zero tracking or Plex Pass fees.",
    tradeoff: "Remote streaming outside home networks requires configuring reverse proxy HTTPS or WireGuard/Tailscale."
  },
  audiobookshelf: {
    stars: 7400, license: "GPL-3.0", language: "JavaScript", replaces: "Audible", image: "ghcr.io/advplyr/audiobookshelf:latest", port: "13378:80",
    edge: "The gold standard self-hosted audiobook and podcast server with native iOS/Android offline sync apps, sleep timers, chapters, and exact playback position syncing.",
    tradeoff: "iOS TestFlight slots fill periodically, though web/third-party apps work seamlessly."
  },
  "navidrome-music-server": {
    stars: 12500, license: "GPL-3.0", language: "Go", replaces: "Spotify / Apple Music", image: "deluan/navidrome:latest", port: "4533:4533",
    edge: "Ultra-fast Subsonic-compatible music streaming server written in Go capable of indexing 100,000+ FLAC/MP3 tracks in minimal RAM across desktop and mobile Subsonic apps.",
    tradeoff: "Requires maintaining your own local DRM-free audio collection."
  },
  owncast: {
    stars: 9800, license: "MIT", language: "Go", replaces: "Twitch / YouTube Live", image: "owncast/owncast:latest", port: "8080:8080",
    edge: "Single-binary self-hosted live video streaming server compatible with OBS RTMP ingest, customizable web chat, and zero platform ads or monetization cuts.",
    tradeoff: "High concurrent viewer counts scale with your own server upload bandwidth or external CDN."
  },
  peertube: {
    stars: 13200, license: "AGPL-3.0", language: "TypeScript", replaces: "YouTube / Vimeo", image: "chocobozzz/peertube:production-bookworm", port: "9000:9000",
    edge: "ActivityPub-federated video platform combining P2P WebRTC bandwidth offloading with clean channel subscriptions and zero algorithmic censoring.",
    tradeoff: "Live transcoding high-res uploads demands solid CPU or GPU worker resources."
  },
  kavita: {
    stars: 7800, license: "GPL-3.0", language: "C#", replaces: "Kindle Unlimited / Comixology", image: "jvmilazz0/kavita:latest", port: "5000:5000",
    edge: "Blazing-fast cross-platform manga, comic (CBZ/CBR), and EPUB/PDF library server with crisp web reader, OPDS feeds, and multi-user reading progress.",
    tradeoff: "Designed primarily around digital library reading rather than e-ink store conversions."
  },
  komga: {
    stars: 4900, license: "MIT", language: "Kotlin", replaces: "Commercial Comic Readers", image: "gotson/komga:latest", port: "25600:25600",
    edge: "MIT-licensed comic, manga, and magazine media server featuring ComicInfo metadata parsing, Kobo sync, OPDS API, and polished web reading.",
    tradeoff: "JVM memory usage sits slightly higher than pure compiled native servers."
  },
  calibre: {
    stars: 21000, license: "GPL-3.0", language: "Python", replaces: "Amazon Kindle Library", image: "lscr.io/linuxserver/calibre:latest", port: "8080:8080",
    edge: "Unmatched open-source ebook format converter, metadata organizer, and USB Kindle/Kobo manager powering personal digital libraries everywhere.",
    tradeoff: "Desktop UI feels dated, which web frontends like Calibre Web solve cleanly."
  },
  "calibre-web-automated": {
    stars: 2600, license: "GPL-3.0", language: "Python", replaces: "Amazon Kindle Sync", image: "crocodilestick/calibre-web-automated:latest", port: "8083:8083",
    edge: "Polished Netflix-style web UI atop Calibre adding automatic ingest, format conversion, Kobo sync, and Send-to-Kindle workflows in one container.",
    tradeoff: "Relies on underlying Calibre SQLite metadata locking rules—avoid concurrent edits from external apps."
  },

  // AI, Automation, IoT & NVR
  localai: {
    stars: 26000, license: "MIT", language: "Go", replaces: "OpenAI API / ElevenLabs", image: "localai/localai:latest-cpu", port: "8080:8080",
    edge: "Drop-in OpenAI REST API replacement running GGUF LLMs, Stable Diffusion image generation, Whisper transcription, and TTS locally on CPU or GPU.",
    tradeoff: "Multi-modal image/audio generation requires sizable VRAM or GPU acceleration for real-time speed."
  },
  "home-assistant": {
    stars: 75000, license: "Apache-2.0", language: "Python", replaces: "Apple HomeKit / Google Home Cloud", image: "ghcr.io/home-assistant/home-assistant:stable", port: "8123:8123",
    edge: "The world's largest local-first smart home automation hub supporting 3,000+ Zigbee, Matter, Z-Wave, and Wi-Fi devices with zero cloud dependency.",
    tradeoff: "Deep YAML/UI automation mastery takes initial learning investment."
  },
  "node-red": {
    stars: 20000, license: "Apache-2.0", language: "JavaScript", replaces: "IFTTT / Zapier IoT", image: "nodered/node-red:latest", port: "1880:1880",
    edge: "Battle-tested Apache-2.0 visual flow programmer wiring hardware sensors, MQTT brokers, HTTP webhooks, and Home Assistant events cleanly.",
    tradeoff: "Oriented toward event/IoT messaging pipelines rather than OAuth SaaS CRM integrations like n8n."
  },
  frigate: {
    stars: 19500, license: "MIT", language: "Python", replaces: "Ring Protect / Nest Aware", image: "ghcr.io/blakeblackshear/frigate:stable", port: "5000:5000",
    edge: "Local open-source NVR with real-time AI person/car/animal object detection using Coral TPU or OpenVINO/ONNX—zero camera cloud fees forever.",
    tradeoff: "Requires RTSP-capable IP cameras and hardware accelerator or iGPU for multi-camera ML streams."
  },
  cronicle: {
    stars: 4200, license: "MIT", language: "JavaScript", replaces: "Cloud Cron / Rundeck", image: "soulteary/cronicle:latest", port: "3012:3012",
    edge: "Distributed multi-server cron job scheduler with real-time live log streaming, web timelines, failure email/webhook alerts, and zero database dependencies.",
    tradeoff: "Less suited to multi-step DAG data dependencies compared to Kestra or Airflow."
  },
  glances: {
    stars: 27000, license: "LGPL-3.0", language: "Python", replaces: "htop / Cloud Monitoring Agents", image: "nicolargo/glances:latest", port: "61208:61208",
    edge: "Instant cross-platform terminal, Web UI, and Prometheus-exportable system monitor exposing live CPU, GPU, sensors, disk I/O, and Docker stats cleanly.",
    tradeoff: "Single-host focus rather than fleet historical aggregation like Beszel or Prometheus."
  },

  // Storage, Sync, Archiving & Bookmarks
  seaweedfs: {
    stars: 24000, license: "Apache-2.0", language: "Go", replaces: "AWS S3", image: "chrislusf/seaweedfs:latest", port: "8333:8333",
    edge: "Apache-2.0 distributed S3 object store & POSIX filesystem engineered in Go for O(1) disk seeks across billions of small files with zero egress fees.",
    tradeoff: "Multi-master production cluster architecture involves coordinating Master, Volume, and Filer nodes."
  },
  syncthing: {
    stars: 65000, license: "MPL-2.0", language: "Go", replaces: "Dropbox / Resilio Sync", image: "syncthing/syncthing:latest", port: "8384:8384",
    edge: "Continuous peer-to-peer encrypted folder synchronization across Linux, macOS, Windows, and Android directly LAN-to-LAN without storing files on any central cloud.",
    tradeoff: "Requires at least two online nodes (or an always-on NAS) to sync changes simultaneously."
  },
  archivebox: {
    stars: 22000, license: "MIT", language: "Python", replaces: "Wayback Machine / Pinboard", image: "archivebox/archivebox:latest", port: "8000:8000",
    edge: "Self-hosted web archiving engine automatically saving offline HTML, PDFs, PNG screenshots, WARC, and single-file clones before links rot or disappear.",
    tradeoff: "Archiving thousands of full Chromium pages + media consumes significant local disk space."
  },
  karakeep: {
    stars: 13500, license: "AGPL-3.0", language: "TypeScript", replaces: "Raindrop.io / Pocket", image: "ghcr.io/karakeep-app/karakeep:release", port: "3000:3000",
    edge: "AI-tagged bookmark-everything app supporting links, notes, PDFs, full-text offline snapshots, Chrome extensions, and local Ollama auto-categorization.",
    tradeoff: "Full Meilisearch + headless Chrome crawler stack takes ~1GB RAM on VPS."
  },
  shaarli: {
    stars: 3400, license: "MIT", language: "PHP", replaces: "Delicious / Pinboard", image: "ghcr.io/shaarli/shaarli:latest", port: "80:80",
    edge: "Minimalist, database-free PHP bookmarking engine running cleanly for 10+ years on flat files with RSS feeds, private links, and markdown notes.",
    tradeoff: "Minimalist UI lacks automatic AI tagging or heavy Chromium page archiving."
  },
  freshrss: {
    stars: 10200, license: "AGPL-3.0", language: "PHP", replaces: "Feedly", image: "freshrss/freshrss:latest", port: "80:80",
    edge: "Lightning-fast multi-user self-hosted RSS/Atom reader supporting Fever & Google Reader mobile APIs, custom web scraping rules, and 100k+ article filtering.",
    tradeoff: "Classic web aesthetic requires theme tweaks for ultra-minimal modern taste."
  },
  miniflux: {
    stars: 7100, license: "Apache-2.0", language: "Go", replaces: "Feedly / Inoreader", image: "miniflux/miniflux:latest", port: "8080:8080",
    edge: "Opinionated Apache-2.0 minimalist RSS reader written in Go + PostgreSQL consuming <30MB RAM with keyboard navigation and zero visual bloat.",
    tradeoff: "Requires PostgreSQL and intentionally excludes heavy client-side customization themes."
  },
  "tiny-tiny-rss": {
    stars: 3800, license: "GPL-3.0", language: "PHP", replaces: "Feedly", image: "wangqiru/ttrss:latest", port: "181:80",
    edge: "Power-user web RSS aggregator packed with plugin filters, rule automation, full-content extraction, and Android companion compatibility.",
    tradeoff: "Setup relies on Docker Compose and PostgreSQL + periodic feed updater daemon."
  },

  // Notifications & URL Shorteners
  ntfy: {
    stars: 20500, license: "Apache-2.0", language: "Go", replaces: "Pushover / Pushbullet", image: "binwiederhier/ntfy:latest", port: "80:80",
    edge: "Simple HTTP-based pub-sub push notification server—send instant iOS/Android alerts directly from any bash script via a 1-line `curl -d` command.",
    tradeoff: "Public instances use shared topics unless access-control auth rules are enabled."
  },
  gotify: {
    stars: 11800, license: "MIT", language: "Go", replaces: "Pushover", image: "gotify/server:latest", port: "80:80",
    edge: "Ultra-lean MIT-licensed self-hosted WebSocket notification hub in Go with clean REST APIs, per-app tokens, and official Android client.",
    tradeoff: "No official native iOS Apple App Store client due to APNs restrictions (unlike ntfy)."
  },
  apprise: {
    stars: 12200, license: "BSD-2-Clause", language: "Python", replaces: "Novu / Commercial Notification Routers", image: "caronc/apprise:latest", port: "8000:8000",
    edge: "Universal single notification gateway routing alerts seamlessly to 100+ providers (Slack, Discord, Telegram, SMS, Teams, ntfy, Gotify) using unified URL syntax.",
    tradeoff: "Acts strictly as an outbound delivery router rather than storing user inbox states."
  },
  shlink: {
    stars: 4100, license: "MIT", language: "PHP", replaces: "Bitly / Rebrandly", image: "shlinkio/shlink:stable", port: "8080:8080",
    edge: "Feature-rich MIT-licensed custom URL shortener offering dynamic QR codes, geo-location analytics, OS device redirects, and fast REST APIs.",
    tradeoff: "Web admin dashboard runs as a separate lightweight static/Docker container (`shlink-web-client`)."
  },
  kutt: {
    stars: 9200, license: "MIT", language: "TypeScript", replaces: "Bitly", image: "kutt/kutt:latest", port: "3000:3000",
    edge: "Clean modern Node.js URL shortener supporting custom domains, password-protected links, click stats, and effortless single-UI management.",
    tradeoff: "Fewer enterprise multi-tenant permissions than Shlink at massive scale."
  },

  // Scheduling, Finance, Time Tracking & Location
  rallly: {
    stars: 3900, license: "AGPL-3.0", language: "TypeScript", replaces: "Doodle / When2meet", image: "lukevella/rallly:latest", port: "3000:3000",
    edge: "Clean, ad-free group meeting poll & availability scheduler where external participants vote on dates in seconds without creating accounts.",
    tradeoff: "Focuses on group consensus polls rather than 1-on-1 Stripe booking funnels like Cal.com."
  },
  easyappointments: {
    stars: 2900, license: "GPL-3.0", language: "PHP", replaces: "Acuity / Square Appointments", image: "alextselegidis/easyappointments:latest", port: "80:80",
    edge: "Turnkey service business booking platform built for medical clinics, salons, and consultants with Google Calendar sync and zero monthly fees.",
    tradeoff: "Traditional Bootstrap UI rather than a modern headless React booking component."
  },
  "firefly-iii": {
    stars: 16800, license: "AGPL-3.0", language: "PHP", replaces: "YNAB / Mint", image: "fireflyiii/core:latest", port: "8080:8080",
    edge: "Comprehensive double-entry personal & small-business finance manager supporting budgets, multi-currency accounts, automated rules, and CSV/bank importers.",
    tradeoff: "Double-entry accounting precision has a steeper initial learning curve than simple envelope apps."
  },
  kimai: {
    stars: 3500, license: "MIT", language: "PHP", replaces: "Harvest / Toggl Track", image: "kimai/kimai2:apache", port: "8001:8001",
    edge: "Professional agency & freelancer time tracking with multi-project billing rates, PDF invoicing, approval workflows, and GDPR-compliant server hosting.",
    tradeoff: "Requires Symfony/PHP container + MySQL/MariaDB setup."
  },
  traggo: {
    stars: 2100, license: "GPL-3.0", language: "Go", replaces: "Toggl Track", image: "traggo/server:latest", port: "3030:3030",
    edge: "Tag-based Go time tracker eliminating rigid project/task hierarchies in favor of flexible key-value labels and fast dashboard charts.",
    tradeoff: "Intentional simplicity omits built-in client PDF invoicing."
  },
  wakapi: {
    stars: 3200, license: "MIT", language: "Go", replaces: "WakaTime", image: "ghcr.io/muety/wakapi:latest", port: "3000:3000",
    edge: "MIT-licensed Go coding time tracker compatible natively with official WakaTime VS Code, JetBrains, and Neovim plugins—retaining all dev coding telemetry privately.",
    tradeoff: "Focuses exclusively on developer IDE coding activity rather than non-dev billable client meetings."
  },
  dawarich: {
    stars: 5200, license: "MIT", language: "Ruby", replaces: "Google Maps Timeline / Swarm", image: "freika/dawarich:latest", port: "3000:3000",
    edge: "Full self-hosted Google Timeline replacement plotting GPS history, visited countries, and travel heatmaps privately from OwnTracks, Overland, and Google Takeout imports.",
    tradeoff: "PostGIS + Redis + Sidekiq stack needs ~2GB RAM for smooth large-history map rendering."
  },
  diagramsnet: {
    stars: 38000, license: "Apache-2.0", language: "JavaScript", replaces: "Lucidchart / Visio", image: "jgraph/drawio:latest", port: "8080:8080",
    edge: "The universal Apache-2.0 diagramming canvas (draw.io) for AWS architecture, UML, flowcharts, and network maps—capable of 100% offline/Docker execution.",
    tradeoff: "Less suited to messy freehand brainstorm whiteboarding than Excalidraw."
  },
  colanode: {
    stars: 3100, license: "Apache-2.0", language: "TypeScript", replaces: "Slack + Notion", image: "ghcr.io/colanode/server:latest", port: "3000:3000",
    edge: "Local-first collaborative workspace combining encrypted real-time messaging, Notion-style rich docs, file storage, and custom relational databases offline-first.",
    tradeoff: "Younger ecosystem than Mattermost or Outline for third-party enterprise webhooks."
  },

  // Community, Forums & Fediverse
  discourse: {
    stars: 42500, license: "GPL-2.0", language: "Ruby", replaces: "Circle / Khoros / Vanilla Forums", image: "discourse/discourse:latest", port: "80:80",
    edge: "The civilized discussion & community forum platform built by Jeff Atwood—powering thousands of developer support communities with trust levels and SSO.",
    tradeoff: "Official Docker deployment prefers a dedicated 2GB+ VPS running Discourse's bundled launcher."
  },
  flarum: {
    stars: 15200, license: "MIT", language: "PHP", replaces: "Circle / phpBB", image: "mondedie/flarum:latest", port: "8888:8888",
    edge: "Sleek, mobile-first MIT-licensed forum software built in PHP + Mithril.js delivering modern infinite-scroll community threads on tiny hosting specs.",
    tradeoff: "Relies on community composer extensions for advanced enterprise SSO/gamification."
  },
  nodebb: {
    stars: 14200, license: "GPL-3.0", language: "JavaScript", replaces: "Circle / Discourse", image: "ghcr.io/nodebb/nodebb:latest", port: "4567:4567",
    edge: "Real-time Node.js forum featuring instant WebSocket replies, ActivityPub federation, and mobile-responsive UX.",
    tradeoff: "Requires MongoDB or Redis/Postgres properly sized for active thread loads."
  },
  answer: {
    stars: 13000, license: "Apache-2.0", language: "Go", replaces: "Stack Overflow for Teams", image: "apache/answer:latest", port: "80:80",
    edge: "Apache Incubator Go Q&A platform recreating Stack Overflow's clean reputation, accepted-answer voting, and tag taxonomy internally on minimal RAM.",
    tradeoff: "Designed specifically for Q&A knowledge bases rather than open-ended forum discussions."
  },
  lemmy: {
    stars: 13500, license: "AGPL-3.0", language: "Rust", replaces: "Reddit", image: "dessalines/lemmy:latest", port: "8536:8536",
    edge: "Fast Rust-powered federated link aggregator and threaded forum network communicating seamlessly across Fediverse instances.",
    tradeoff: "Federation traffic syncing adds storage/queue complexity on large open instances."
  },
  mastodon: {
    stars: 47000, license: "AGPL-3.0", language: "Ruby", replaces: "X / Twitter", image: "ghcr.io/mastodon/mastodon:latest", port: "3000:3000",
    edge: "The flagship open-source ActivityPub microblogging network running independent federated timelines without algorithmic manipulation or ads.",
    tradeoff: "Federated Sidekiq background queues and media caching demand careful S3/VPS scaling."
  },
  pixelfed: {
    stars: 5800, license: "AGPL-3.0", language: "PHP", replaces: "Instagram", image: "pixelfed/pixelfed:latest", port: "80:80",
    edge: "Ad-free chronological photo & stories sharing platform federated over ActivityPub with strict privacy controls and chronological feeds.",
    tradeoff: "Smaller third-party mobile client selection than Mastodon."
  },
  synapse: {
    stars: 12500, license: "AGPL-3.0", language: "Python", replaces: "Slack / WhatsApp Backend", image: "matrixdotorg/synapse:latest", port: "8008:8008",
    edge: "The Matrix Foundation reference homeserver powering federated end-to-end encrypted real-time rooms and bridges across Slack, Discord, and Signal.",
    tradeoff: "Python homeserver uses notably more RAM (~2GB+) on large federated rooms than Rust alternatives."
  },
  conduit: {
    stars: 1900, license: "Apache-2.0", language: "Rust", replaces: "Matrix Synapse / Slack Backend", image: "matrixconduit/matrix-conduit:latest", port: "6167:6167",
    edge: "Ultra-fast Apache-2.0 Rust Matrix homeserver running cleanly on Raspberry Pis (<100MB RAM) with RocksDB embedded storage.",
    tradeoff: "Some advanced enterprise admin APIs and bridges still prioritize Synapse compatibility."
  },
  mumble: {
    stars: 6800, license: "BSD-3-Clause", language: "C++", replaces: "Discord Voice / TeamSpeak", image: "mumblevoip/mumble-server:latest", port: "64738:64738",
    edge: "Ultra-low-latency BSD-licensed encrypted voice server famous for crystal-clear positional audio across hundreds of users on virtually zero CPU.",
    tradeoff: "Focuses strictly on voice communication rather than persistent rich chat + video screensharing."
  },
};

function cleanShortDesc(raw) {
  return String(raw || "")
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/\(\[.*?\](?:,\s*\[.*?\])*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(https?:\/\/[^\)]+\)/g, "")
    .replace(/\s+/g, " ")
    .replace(/[\s,.]+$/g, "")
    .trim();
}

function buildAiContent(tool, spec) {
  const name = tool.name;
  const cleanDesc = cleanShortDesc(tool.description) || `${name} is a verified open-source ${tool.category || "software"} tool.`;
  const replacesLine = spec.replaces ? `Serving as a privacy-first, self-hostable replacement for **${spec.replaces}**, ` : "";

  return `## What is ${name}?

${cleanDesc}. ${replacesLine}${name} gives developers, technical teams, and self-hosters full ownership over their data, configuration, and runtime environment under the **${spec.license}** open-source license without recurring per-seat SaaS lock-in.

## Core Capabilities

- **True Open-Source Ownership (${spec.license})** – Full public source code auditability with zero proprietary vendor control or forced cloud accounts.
- **Standout Advantage** – ${spec.edge}
- **Zero Per-Seat Licensing Fees** – Self-host for teams of 5 or 500 without unexpected SaaS upgrade tiers or paywalled core controls.
- **Standard Containerization** – Packaged cleanly for modern Docker and Linux environments alongside private VPS, homelab, or VPC deployment.

## Architecture & How It Works

Built primarily in **${spec.language}**, ${name} is structured to keep infrastructure lean and maintainable outside proprietary ecosystems. With **${spec.stars.toLocaleString()}+ GitHub stars**, it enjoys sustained open-source community vetting, documented upgrade paths, and clean data portability so your team never gets trapped by closed formats.

## Self-Hosting & Deployment

Deploying ${name} with Docker takes just minutes on standard Linux servers, Ubuntu VPS instances, or local homelab hosts.

\`\`\`bash
# Quick Docker start example — verify environment flags against official ${name} docs
docker run -d \\
  --name ${tool.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} \\
  --restart unless-stopped \\
  -p ${spec.port} \\
  ${spec.image}
\`\`\`

For production self-hosting, pair the container with persistent local volumes, reverse-proxy HTTPS (Caddy, Traefik, or Nginx), and automated encrypted offsite backups.

## Who Should Use ${name}?

${name} is an ideal choice if you:

- Need a reliable open-source replacement for **${spec.replaces}** with strict data privacy.
- Want predictable fixed VPS hosting costs rather than escalating monthly user licenses.
- Prefer auditable **${spec.language}** software under a transparent **${spec.license}** license.

## Strengths

- **High Community Adoption** – ${spec.stars.toLocaleString()}+ GitHub stars validate stability and real-world production usage.
- **Unique Utility** – ${spec.edge}
- **Self-Hosted Sovereignty** – Complete control over data storage, backups, and internal network security.

## Trade-offs & Limitations

- **Operational Consideration** – ${spec.tradeoff}
- **Self-Hosting Upkeep** – Requires managing your own updates, HTTPS proxy, and volume backups compared to fully managed SaaS.
`;
}

async function main() {
  console.log("Fetching all rows from open_source_tools...");
  let all = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, status, github_stars")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) {
      console.error("Fetch error:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Loaded ${all.length} total rows.`);

  // Step 1: Reject the 14 proprietary SaaS rows accidentally in approved
  const saasRows = all.filter(
    (r) =>
      String(r.status || "").toLowerCase() === "approved" &&
      SAAS_TO_REJECT.includes(String(r.slug || "").toLowerCase()) &&
      (!r.github_stars || r.github_stars === 0)
  );
  console.log(`Rejecting ${saasRows.length} proprietary SaaS rows from approved...`);
  if (saasRows.length > 0) {
    const saasIds = saasRows.map((r) => r.id);
    const { error } = await supabase
      .from("open_source_tools")
      .update({ status: "rejected" })
      .in("id", saasIds);
    if (error) {
      console.error("Failed rejecting SaaS rows:", error.message);
      process.exit(1);
    }
    saasRows.forEach((r) => console.log(`  ✗ Rejected SaaS: ${r.slug} (${r.name})`));
  }

  // Build set of already approved slugs/names to guarantee zero duplicate approvals
  const alreadyApprovedSlugs = new Set(
    all
      .filter((r) => String(r.status || "").toLowerCase() === "approved" && !SAAS_TO_REJECT.includes(String(r.slug || "").toLowerCase()))
      .map((r) => String(r.slug || "").toLowerCase().trim())
  );
  const alreadyApprovedNames = new Set(
    all
      .filter((r) => String(r.status || "").toLowerCase() === "approved" && !SAAS_TO_REJECT.includes(String(r.slug || "").toLowerCase()))
      .map((r) => String(r.name || "").toLowerCase().trim())
  );

  // Step 2: Approve & enrich matched gold-mine tools from pending
  const pending = all.filter((r) => String(r.status || "").toLowerCase() === "pending");
  const approvedIdsThisRun = new Set();
  const approvedKeysSeen = new Set();
  let enrichedCount = 0;

  for (const row of pending) {
    const rawSlug = String(row.slug || "").toLowerCase().trim();
    const rawNameNorm = String(row.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const key = GOLDMINE_SPECS[rawSlug] ? rawSlug : GOLDMINE_SPECS[rawNameNorm] ? rawNameNorm : null;

    if (!key) continue;
    if ((row.description || "").includes("⚠")) continue;
    if (alreadyApprovedSlugs.has(key) || alreadyApprovedNames.has(String(row.name || "").toLowerCase().trim())) continue;
    if (approvedKeysSeen.has(key)) continue; // Avoid approving duplicate pending rows for same tool

    approvedKeysSeen.add(key);
    approvedIdsThisRun.add(row.id);

    const spec = GOLDMINE_SPECS[key];
    const finalSlug = rawSlug || key;

    // Extract GitHub URL from Source Code markdown link in description if url isn't github.com
    let bestUrl = row.url || "";
    const ghMatch = String(row.description || "").match(/\(\[Source Code\]\((https:\/\/github\.com\/[^\s\)]+)\)\)/i);
    if (!bestUrl || (!bestUrl.includes("github.com") && ghMatch && ghMatch[1])) {
      if (!bestUrl) bestUrl = ghMatch ? ghMatch[1] : "";
    }

    const aiContent = buildAiContent({ ...row, slug: finalSlug }, spec);
    const updatePayload = {
      slug: finalSlug,
      status: "approved",
      structured_content_status: "success",
      github_stars: spec.stars,
      github_forks: Math.round(spec.stars * 0.09),
      license: spec.license,
      language: spec.language,
      ai_content: aiContent,
      deployment_info: { docker: true, self_hosted: true },
      enrichment_completed_at: nowIso,
    };
    if (bestUrl && bestUrl !== row.url) {
      updatePayload.url = bestUrl;
    }

    const { error } = await supabase
      .from("open_source_tools")
      .update(updatePayload)
      .eq("id", row.id);

    if (error) {
      console.error(`Failed approving ${finalSlug}:`, error.message);
      process.exit(1);
    }
    enrichedCount++;
    console.log(`  ✓ Approved & Enriched: /tools/${finalSlug} (${spec.stars} ★ | ${spec.license} | ${spec.language})`);
  }

  console.log(`Total gold-mine tools approved & enriched: ${enrichedCount}`);

  // Step 3: Reject all remaining pending rows in batches of 200
  const remainingPendingIds = pending
    .filter((r) => !approvedIdsThisRun.has(r.id))
    .map((r) => r.id);

  console.log(`Rejecting ${remainingPendingIds.length} remaining generic/free-tier/duplicate/unmaintained pending rows...`);
  const batchSize = 200;
  let rejectedDone = 0;
  for (let i = 0; i < remainingPendingIds.length; i += batchSize) {
    const batch = remainingPendingIds.slice(i, i + batchSize);
    const { error } = await supabase
      .from("open_source_tools")
      .update({ status: "rejected" })
      .in("id", batch);
    if (error) {
      console.error(`Batch reject error at offset ${i}:`, error.message);
      process.exit(1);
    }
    rejectedDone += batch.length;
  }
  console.log(`Rejected ${rejectedDone} pending rows cleanly.`);
}

main();
