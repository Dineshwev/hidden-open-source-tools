export interface DockerSpec {
  image: string;
  ports: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  notes?: string;
}

export const VERIFIED_DOCKER_SPECS: Record<string, DockerSpec> = {
  pocketbase: {
    image: "ghcr.io/muchobien/pocketbase:latest",
    ports: ["8090:8090"],
    volumes: ["./pb_data:/pb/pb_data"],
    notes: "Access the admin dashboard at http://localhost:8090/_/",
  },
  beszel: {
    image: "henrygd/beszel:latest",
    ports: ["8090:8090"],
    volumes: ["./beszel_data:/beszel_data"],
    notes: "Lightweight monitoring hub with 1-second real-time charts.",
  },
  docuseal: {
    image: "docuseal/docuseal:latest",
    ports: ["3000:3000"],
    volumes: ["./docuseal_data:/data"],
    environment: {
      FORCE_SSL: "false",
    },
    notes: "Open http://localhost:3000 to configure your first document template.",
  },
  documenso: {
    image: "documenso/documenso:latest",
    ports: ["3000:3000"],
    volumes: ["./documenso_data:/data"],
    notes: "Next.js & Prisma open-source signing platform.",
  },
  uptimekuma: {
    image: "louislam/uptime-kuma:1",
    ports: ["3001:3001"],
    volumes: ["./uptime-kuma-data:/app/data"],
    notes: "Access uptime monitoring UI at http://localhost:3001",
  },
  "uptime-kuma": {
    image: "louislam/uptime-kuma:1",
    ports: ["3001:3001"],
    volumes: ["./uptime-kuma-data:/app/data"],
    notes: "Access uptime monitoring UI at http://localhost:3001",
  },
  vaultwarden: {
    image: "vaultwarden/server:latest",
    ports: ["8080:80"],
    volumes: ["./vw_data:/data"],
    environment: {
      SIGNUPS_ALLOWED: "true",
    },
    notes: "Lightweight Rust Bitwarden server. Works with all official apps.",
  },
  n8n: {
    image: "n8nio/n8n:latest",
    ports: ["5678:5678"],
    volumes: ["./n8n_data:/home/node/.n8n"],
    notes: "Open http://localhost:5678 to build visual workflows.",
  },
  listmonk: {
    image: "listmonk/listmonk:latest",
    ports: ["9000:9000"],
    volumes: ["./listmonk_data:/listmonk/data"],
    notes: "High-performance newsletter & mailing list manager in Go.",
  },
  postiz: {
    image: "postiz/postiz:latest",
    ports: ["5000:5000"],
    volumes: ["./postiz_data:/data"],
    notes: "Self-hosted AI social media scheduler.",
  },
  plausible: {
    image: "ghcr.io/plausible/community-edition:latest",
    ports: ["8000:8000"],
    notes: "Privacy-focused Google Analytics replacement.",
  },
  umami: {
    image: "ghcr.io/umami-software/umami:postgresql-latest",
    ports: ["3000:3000"],
    environment: {
      DATABASE_URL: "postgresql://umami:umami@db:5432/umami",
    },
    notes: "Clean, privacy-first web analytics with custom events.",
  },
  ghost: {
    image: "ghost:5-alpine",
    ports: ["2368:2368"],
    volumes: ["./ghost_content:/var/lib/ghost/content"],
    environment: {
      NODE_ENV: "development",
    },
    notes: "Modern publishing platform for newsletters and blogs.",
  },
  gitea: {
    image: "gitea/gitea:latest",
    ports: ["3000:3000", "2222:22"],
    volumes: ["./gitea_data:/data"],
    notes: "Painless self-hosted Git service that runs on < 100MB RAM.",
  },
  mattermost: {
    image: "mattermost/mattermost-team-edition:latest",
    ports: ["8065:8065"],
    volumes: ["./mattermost_data:/mattermost/data"],
    notes: "Enterprise-grade open-source team collaboration.",
  },
  twenty: {
    image: "twentycrm/twenty:latest",
    ports: ["3000:3000"],
    volumes: ["./twenty_data:/app/packages/twenty-server/.local-storage"],
    notes: "Modern open-source CRM with Notion-style UI & GraphQL API.",
  },
  baserow: {
    image: "baserow/baserow:latest",
    ports: ["80:80", "443:443"],
    volumes: ["./baserow_data:/baserow/data"],
    notes: "Open-source database & Airtable alternative. Handles 100k+ rows.",
  },
  nocodb: {
    image: "nocodb/nocodb:latest",
    ports: ["8080:8080"],
    volumes: ["./nocodb_data:/usr/app/data"],
    notes: "Connects to any existing PostgreSQL/MySQL database as a smart spreadsheet.",
  },
  appsmith: {
    image: "appsmith/appsmith-ce:latest",
    ports: ["80:80", "443:443"],
    volumes: ["./appsmith_stacks:/appsmith-stacks"],
    notes: "Low-code platform for building internal developer tools.",
  },
  tooljet: {
    image: "tooljet/tooljet:latest",
    ports: ["80:80"],
    volumes: ["./tooljet_data:/data"],
    notes: "Extensible low-code framework for custom dashboards and admin panels.",
  },
  budibase: {
    image: "budibase/budibase:latest",
    ports: ["10000:80"],
    volumes: ["./budibase_data:/data"],
    notes: "Fast portal and internal app builder for engineers.",
  },
  windmill: {
    image: "ghcr.io/windmill-labs/windmill:latest",
    ports: ["8000:8000"],
    notes: "High-throughput, code-first developer platform with Python/TypeScript.",
  },
  calcom: {
    image: "calcom.docker.scarf.sh/calcom/cal.com:latest",
    ports: ["3000:3000"],
    notes: "Scheduling infrastructure for teams and individuals.",
  },
  "cal.com": {
    image: "calcom.docker.scarf.sh/calcom/cal.com:latest",
    ports: ["3000:3000"],
    notes: "Scheduling infrastructure for teams and individuals.",
  },
  hoppscotch: {
    image: "hoppscotch/hoppscotch:latest",
    ports: ["3000:3000"],
    notes: "Open source API development ecosystem (REST, GraphQL, WebSocket).",
  },
  bruno: {
    image: "usebruno/bruno:latest",
    ports: ["3000:3000"],
    notes: "Git-native API client that stores collections in plain text.",
  },
  signoz: {
    image: "signoz/frontend:latest",
    ports: ["3301:3301"],
    notes: "Native OpenTelemetry APM and log management on ClickHouse.",
  },
  openobserve: {
    image: "public.ecr.aws/zinclabs/openobserve:latest",
    ports: ["5080:5080"],
    volumes: ["./openobserve_data:/data"],
    notes: "Rust-powered 140x lower cost log and metrics search engine.",
  },
  glitchtip: {
    image: "glitchtip/glitchtip:latest",
    ports: ["8000:8000"],
    volumes: ["./glitchtip_data:/data"],
    notes: "Sentry-compatible open-source error monitoring platform.",
  },
  minio: {
    image: "minio/minio:latest",
    ports: ["9000:9000", "9001:9001"],
    volumes: ["./minio_data:/data"],
    notes: "High-performance S3 compatible object storage.",
  },
  coolify: {
    image: "ghcr.io/coollabsio/coolify:latest",
    ports: ["8000:8000"],
    volumes: ["./coolify_data:/data"],
    notes: "Self-hosted PaaS with automatic SSL, databases, and Git deployments.",
  },
  dokploy: {
    image: "dokploy/dokploy:latest",
    ports: ["3000:3000"],
    volumes: ["./dokploy_data:/etc/dokploy"],
    notes: "Next-generation self-hosted platform alternative to Vercel and Heroku.",
  },
  immich: {
    image: "ghcr.io/immich-app/immich-server:release",
    ports: ["2283:2283"],
    volumes: ["./photos:/usr/src/app/upload"],
    notes: "High-performance self-hosted backup solution for photos and videos.",
  },
  headscale: {
    image: "headscale/headscale:latest",
    ports: ["8080:8080", "9090:9090"],
    volumes: ["./headscale_data:/etc/headscale"],
    notes: "Open source, self-hosted implementation of the Tailscale control server.",
  },
  dragonfly: {
    image: "docker.dragonflydb.io/dragonflydb/dragonfly:latest",
    ports: ["6379:6379"],
    notes: "Modern multi-threaded drop-in replacement for Redis and Memcached.",
  },
};

/**
 * Returns verified Docker spec for a given tool slug or generates a standard conservative fallback.
 */
export function getDockerSpec(slug: string, repoOwner?: string | null): DockerSpec {
  const normSlug = slug.toLowerCase().trim();
  if (VERIFIED_DOCKER_SPECS[normSlug]) {
    return VERIFIED_DOCKER_SPECS[normSlug];
  }

  const fallbackImage = repoOwner
    ? `${repoOwner.toLowerCase()}/${normSlug}:latest`
    : `${normSlug}:latest`;

  return {
    image: fallbackImage,
    ports: ["8080:8080"],
    volumes: [`./${normSlug}-data:/data`],
    notes: "Default Docker Compose configuration.",
  };
}
