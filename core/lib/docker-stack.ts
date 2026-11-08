/**
 * Known curated container profiles for common self-hosted tools.
 */
interface ToolContainerProfile {
  image: string;
  defaultPort: number;
  containerPort: number;
  volumeMount?: string;
  volumes?: string[];
  environment?: Record<string, string>;
  command?: string;
}

const KNOWN_PROFILES: Record<string, ToolContainerProfile> = {
  // Monitoring & Status
  "uptime-kuma": {
    image: "louislam/uptime-kuma:latest",
    defaultPort: 3001,
    containerPort: 3001,
    volumeMount: "./uptime-kuma-data:/app/data",
  },
  beszel: {
    image: "henrygd/beszel:latest",
    defaultPort: 8090,
    containerPort: 8090,
    volumeMount: "./beszel-data:/beszel_data",
  },
  gatus: {
    image: "twinproduction/gatus:latest",
    defaultPort: 8080,
    containerPort: 8080,
    volumeMount: "./gatus-config:/config",
  },
  netdatacloud: {
    image: "netdata/netdata:latest",
    defaultPort: 19999,
    containerPort: 19999,
    volumes: [
      "./netdataconfig:/etc/netdata",
      "./netdatalib:/var/lib/netdata",
      "./netdatacache:/var/cache/netdata",
    ],
  },

  // Automation & Low-Code
  n8n: {
    image: "docker.n8n.io/n8nio/n8n:latest",
    defaultPort: 5678,
    containerPort: 5678,
    volumeMount: "./n8n-data:/home/node/.n8n",
    environment: {
      N8N_PORT: "5678",
      GENERIC_TIMEZONE: "UTC",
    },
  },
  nocodb: {
    image: "nocodb/nocodb:latest",
    defaultPort: 8080,
    containerPort: 8080,
    volumeMount: "./nocodb-data:/usr/app/data",
  },
  flowise: {
    image: "flowiseai/flowise:latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumeMount: "./flowise-data:/root/.flowise",
  },
  dify: {
    image: "langgenius/dify-api:latest",
    defaultPort: 5001,
    containerPort: 5001,
  },

  // AI & LLM Serving
  "open-webui": {
    image: "ghcr.io/open-webui/open-webui:main",
    defaultPort: 3000,
    containerPort: 8080,
    volumeMount: "./open-webui-data:/app/backend/data",
  },
  openwebui: {
    image: "ghcr.io/open-webui/open-webui:main",
    defaultPort: 3000,
    containerPort: 8080,
    volumeMount: "./open-webui-data:/app/backend/data",
  },
  anythingllm: {
    image: "mintplexlabs/anything-llm:latest",
    defaultPort: 3001,
    containerPort: 3001,
    volumeMount: "./anythingllm-data:/app/server/storage",
  },
  chroma: {
    image: "chromadb/chroma:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./chroma-data:/chroma/chroma",
  },
  vllm: {
    image: "vllm/vllm-openai:latest",
    defaultPort: 8000,
    containerPort: 8000,
  },

  // PaaS & Container Management
  coolify: {
    image: "ghcr.io/coollabsio/coolify:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./coolify-data:/data",
  },
  dockge: {
    image: "louislam/dockge:latest",
    defaultPort: 5001,
    containerPort: 5001,
    volumes: [
      "./dockge-data:/app/data",
      "./stacks:/app/stacks",
      "/var/run/docker.sock:/var/run/docker.sock",
    ],
  },
  portainer: {
    image: "portainer/portainer-ce:latest",
    defaultPort: 9443,
    containerPort: 9443,
    volumes: [
      "./portainer-data:/data",
      "/var/run/docker.sock:/var/run/docker.sock",
    ],
  },
  dokploy: {
    image: "dokploy/dokploy:latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumes: [
      "./dokploy-data:/etc/dokploy",
      "/var/run/docker.sock:/var/run/docker.sock",
    ],
  },
  caprover: {
    image: "caprover/caprover:latest",
    defaultPort: 80,
    containerPort: 80,
    volumes: [
      "/var/run/docker.sock:/var/run/docker.sock",
      "./captain:/captain",
    ],
  },

  // Storage & Cloud
  minio: {
    image: "minio/minio:latest",
    defaultPort: 9000,
    containerPort: 9000,
    volumeMount: "./minio-data:/data",
    environment: {
      MINIO_ROOT_USER: "admin",
      MINIO_ROOT_PASSWORD: "password123",
    },
    command: "server /data --console-address ':9001'",
  },
  nextcloud: {
    image: "nextcloud:apache",
    defaultPort: 8080,
    containerPort: 80,
    volumeMount: "./nextcloud-data:/var/www/html",
  },
  seafile: {
    image: "seafileltd/seafile-mc:latest",
    defaultPort: 8082,
    containerPort: 80,
    volumeMount: "./seafile-data:/shared",
  },

  // Security, Identity & Secrets
  vaultwarden: {
    image: "vaultwarden/server:latest",
    defaultPort: 8080,
    containerPort: 80,
    volumeMount: "./vaultwarden-data:/data",
  },
  authentik: {
    image: "ghcr.io/goauthentik/server:latest",
    defaultPort: 9000,
    containerPort: 9000,
    volumeMount: "./authentik-media:/media",
  },
  keycloak: {
    image: "quay.io/keycloak/keycloak:latest",
    defaultPort: 8080,
    containerPort: 8080,
    environment: {
      KEYCLOAK_ADMIN: "admin",
      KEYCLOAK_ADMIN_PASSWORD: "admin",
    },
    command: "start-dev",
  },
  "infisical-community-edition": {
    image: "infisical/infisical:latest",
    defaultPort: 8080,
    containerPort: 8080,
  },

  // Databases & Caching
  pocketbase: {
    image: "ghcr.io/muchobien/pocketbase:latest",
    defaultPort: 8090,
    containerPort: 8090,
    volumeMount: "./pb-data:/pb_data",
  },
  surrealdb: {
    image: "surrealdb/surrealdb:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./surreal-data:/mydata",
    command: "start --user root --pass root file:/mydata/database.db",
  },
  dragonfly: {
    image: "docker.dragonflydb.io/dragonflydb/dragonfly:latest",
    defaultPort: 6379,
    containerPort: 6379,
    volumeMount: "./dragonfly-data:/data",
  },
  ferretdb: {
    image: "ghcr.io/ferretdb/ferretdb:latest",
    defaultPort: 27017,
    containerPort: 27017,
  },
  meilisearch: {
    image: "getmeili/meilisearch:latest",
    defaultPort: 7700,
    containerPort: 7700,
    volumeMount: "./meili-data:/meili_data",
    environment: {
      MEILI_ENV: "production",
      MEILI_NO_ANALYTICS: "true",
    },
  },

  // Reverse Proxies & Gateways
  caddy: {
    image: "caddy:latest",
    defaultPort: 80,
    containerPort: 80,
    volumes: [
      "./Caddyfile:/etc/caddy/Caddyfile",
      "./caddy_data:/data",
      "./caddy_config:/config",
    ],
  },
  traefik: {
    image: "traefik:v3.0",
    defaultPort: 80,
    containerPort: 80,
    volumes: [
      "/var/run/docker.sock:/var/run/docker.sock:ro",
      "./traefik.yml:/etc/traefik/traefik.yml",
    ],
  },
  nginx: {
    image: "nginx:alpine",
    defaultPort: 80,
    containerPort: 80,
    volumeMount: "./nginx.conf:/etc/nginx/nginx.conf:ro",
  },

  // Analytics & Observability
  plausible: {
    image: "ghcr.io/plausible/community-edition:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./plausible-data:/data",
  },
  umami: {
    image: "ghcr.io/umami-software/umami:postgresql-latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumeMount: "./umami-data:/data",
  },
  openobserveai: {
    image: "public.ecr.aws/zinclabs/openobserve:latest",
    defaultPort: 5080,
    containerPort: 5080,
    volumeMount: "./openobserve-data:/data",
  },
  changedetectionio: {
    image: "ghcr.io/dgtlmoon/changedetection.io:latest",
    defaultPort: 5000,
    containerPort: 5000,
    volumeMount: "./changedetection-data:/datastore",
  },

  // Collaboration, Git & Productivity
  gitea: {
    image: "gitea/gitea:latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumeMount: "./gitea-data:/data",
  },
  memos: {
    image: "neosmemo/memos:latest",
    defaultPort: 5230,
    containerPort: 5230,
    volumeMount: "./memos-data:/var/opt/memos",
  },
  "affine-community-edition": {
    image: "ghcr.io/toeverything/affine:stable",
    defaultPort: 3010,
    containerPort: 3010,
    volumeMount: "./affine-data:/root/.affine",
  },
  affine: {
    image: "ghcr.io/toeverything/affine:stable",
    defaultPort: 3010,
    containerPort: 3010,
    volumeMount: "./affine-data:/root/.affine",
  },
  appflowy: {
    image: "appflowyinc/appflowy_cloud:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./appflowy-data:/data",
  },
  mattermost: {
    image: "mattermost/mattermost-team-edition:latest",
    defaultPort: 8065,
    containerPort: 8065,
    volumeMount: "./mattermost-data:/mattermost/data",
  },
  chatwoot: {
    image: "chatwoot/chatwoot:latest",
    defaultPort: 3000,
    containerPort: 3000,
  },
  linkwarden: {
    image: "ghcr.io/linkwarden/linkwarden:latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumeMount: "./linkwarden-data:/data/data",
  },
};

export interface StackToolItem {
  id?: string;
  name: string;
  slug: string;
  category?: string | null;
  url?: string | null;
}

/**
 * Generates a valid, multi-container docker-compose.yml file from a list of tools.
 * Resolves port collisions so every service binds to a unique host port.
 */
export function generateDockerCompose(tools: StackToolItem[]): string {
  if (!tools || tools.length === 0) {
    return `# The Cloud Rain – Docker Stack Generator
# No tools selected yet. Select tools to generate your docker-compose.yml.
version: "3.8"
services: {}
`;
  }

  const assignedHostPorts = new Set<number>();
  let fallbackPortCounter = 8080;

  function getUniqueHostPort(preferredPort: number): number {
    let port = preferredPort;
    while (assignedHostPorts.has(port)) {
      port = fallbackPortCounter++;
    }
    assignedHostPorts.add(port);
    return port;
  }

  const toolNames = tools.map((t) => t.name).join(", ");
  const lines: string[] = [
    `# ==============================================================================`,
    `# The Cloud Rain – Production Self-Hosted Docker Compose Stack`,
    `# Tools: ${toolNames}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Documentation & Updates: https://thecloudrain.org`,
    `# ==============================================================================`,
    ``,
    `version: "3.8"`,
    ``,
    `services:`,
  ];

  for (const tool of tools) {
    const rawSlug = (tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-+|-+$/g, "");
    const safeSlug = rawSlug.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const profile = KNOWN_PROFILES[safeSlug];

    const image = profile ? profile.image : `${safeSlug}:latest`;
    const containerPort = profile ? profile.containerPort : 8080;
    const defaultHostPort = profile ? profile.defaultPort : containerPort;
    const hostPort = getUniqueHostPort(defaultHostPort);

    lines.push(`  ${safeSlug}:`);
    lines.push(`    image: ${image}`);
    lines.push(`    container_name: ${safeSlug}`);
    lines.push(`    restart: unless-stopped`);
    lines.push(`    ports:`);
    lines.push(`      - "${hostPort}:${containerPort}"`);

    // Handle volumes
    if (profile?.volumes && profile.volumes.length > 0) {
      lines.push(`    volumes:`);
      for (const vol of profile.volumes) {
        lines.push(`      - ${vol}`);
      }
    } else {
      const volumeMount = profile?.volumeMount || `./${safeSlug}-data:/data`;
      lines.push(`    volumes:`);
      lines.push(`      - ${volumeMount}`);
    }

    // Handle environment variables
    if (profile?.environment) {
      lines.push(`    environment:`);
      for (const [key, value] of Object.entries(profile.environment)) {
        lines.push(`      ${key}: "${value}"`);
      }
    }

    // Handle custom command
    if (profile?.command) {
      lines.push(`    command: ${profile.command}`);
    }

    lines.push(`    networks:`);
    lines.push(`      - cloudrain-network`);
    lines.push(``);
  }

  lines.push(`networks:`);
  lines.push(`  cloudrain-network:`);
  lines.push(`    name: cloudrain-network`);
  lines.push(`    driver: bridge`);

  return lines.join("\n");
}
