/**
 * Known curated container profiles for common self-hosted tools.
 */
interface ToolContainerProfile {
  image: string;
  defaultPort: number;
  containerPort: number;
  volumeMount: string;
  environment?: Record<string, string>;
}

const KNOWN_PROFILES: Record<string, ToolContainerProfile> = {
  "uptime-kuma": {
    image: "louislam/uptime-kuma:latest",
    defaultPort: 3001,
    containerPort: 3001,
    volumeMount: "./uptime-kuma-data:/app/data",
  },
  plausible: {
    image: "ghcr.io/plausible/community-edition:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./plausible-data:/data",
  },
  gitea: {
    image: "gitea/gitea:latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumeMount: "./gitea-data:/data",
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
  pocketbase: {
    image: "ghcr.io/muchobien/pocketbase:latest",
    defaultPort: 8090,
    containerPort: 8090,
    volumeMount: "./pb-data:/pb_data",
  },
  memos: {
    image: "neosmemo/memos:latest",
    defaultPort: 5230,
    containerPort: 5230,
    volumeMount: "./memos-data:/var/opt/memos",
  },
  nocodb: {
    image: "nocodb/nocodb:latest",
    defaultPort: 8080,
    containerPort: 8080,
    volumeMount: "./nocodb-data:/usr/app/data",
  },
  coolify: {
    image: "ghcr.io/coollabsio/coolify:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./coolify-data:/data",
  },
  umami: {
    image: "ghcr.io/umami-software/umami:postgresql-latest",
    defaultPort: 3000,
    containerPort: 3000,
    volumeMount: "./umami-data:/data",
  },
  appflowy: {
    image: "appflowyinc/appflowy_cloud:latest",
    defaultPort: 8000,
    containerPort: 8000,
    volumeMount: "./appflowy-data:/data",
  },
  vaultwarden: {
    image: "vaultwarden/server:latest",
    defaultPort: 8080,
    containerPort: 80,
    volumeMount: "./vaultwarden-data:/data",
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
    const volumeMount = profile ? profile.volumeMount : `./${safeSlug}-data:/data`;

    lines.push(`  ${safeSlug}:`);
    lines.push(`    image: ${image}`);
    lines.push(`    container_name: ${safeSlug}`);
    lines.push(`    restart: unless-stopped`);
    lines.push(`    ports:`);
    lines.push(`      - "${hostPort}:${containerPort}"`);
    lines.push(`    volumes:`);
    lines.push(`      - ${volumeMount}`);

    if (profile?.environment) {
      lines.push(`    environment:`);
      for (const [key, value] of Object.entries(profile.environment)) {
        lines.push(`      ${key}: "${value}"`);
      }
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
