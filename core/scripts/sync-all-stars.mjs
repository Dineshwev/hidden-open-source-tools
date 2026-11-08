import { createClient } from "@supabase/supabase-js";
import fs from "fs";

function loadEnv() {
  const content = fs.readFileSync(".env.local", "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const KNOWN_REPOS = {
  coolify: "coollabsio/coolify",
  nocodb: "nocodb/nocodb",
  minio: "minio/minio",
  "uptime-kuma": "louislam/uptime-kuma",
  n8n: "n8n-io/n8n",
  portainer: "portainer/portainer",
  dockge: "louislam/dockge",
  podman: "containers/podman",
  docker: "moby/moby",
  langchain: "langchain-ai/langchain",
  llamaindex: "run-llama/llama_index",
  vllm: "vllm-project/vllm",
  chroma: "chroma-core/chroma",
  litellm: "BerriAI/litellm",
  dify: "langgenius/dify",
  flowise: "FlowiseAI/Flowise",
  crewai: "crewAIInc/crewAI",
  autogen: "microsoft/autogen",
  continue: "continuedev/continue",
  tabby: "TabbyML/tabby",
  haystack: "deepset-ai/haystack",
  dokku: "dokku/dokku",
  dokploy: "Dokploy/dokploy",
  caprover: "caprover/caprover",
  mattermost: "mattermost/mattermost",
  vaultwarden: "dani-garcia/vaultwarden",
  keycloak: "keycloak/keycloak",
  kubernetes: "kubernetes/kubernetes",
  "docker-swarm": "moby/moby",
  beszel: "henrygd/beszel",
  dragonfly: "dragonflydb/dragonfly",
  "woodpecker-ci": "woodpecker-ci/woodpecker",
  "drone-ci": "harness/drone",
  netbird: "netbirdio/netbird",
  headscale: "juanfont/headscale",
  surrealdb: "surrealdb/surrealdb",
  ferretdb: "FerretDB/FerretDB",
  opentofu: "opentofu/opentofu",
  "open-webui": "open-webui/open-webui",
  openwebui: "open-webui/open-webui",
  anythingllm: "Mintplex-Labs/anything-llm",
  caddy: "caddyserver/caddy",
  traefik: "traefik/traefik",
  nginx: "nginx/nginx",
  "affine-community-edition": "toeverything/AFFiNE",
  changedetectionio: "dgtlmoon/changedetection.io",
  openobserveai: "openobserve/openobserve",
  netdatacloud: "netdata/netdata",
  "outline-server": "outline/outline",
  "infisical-community-edition": "Infisical/infisical",
  drawdb: "drawdb-io/drawdb",
  pug: "pugjs/pug",
  evalship: "evalship/evalship",
  archboard: "archboard/archboard",
  actionbook: "actionbook/actionbook",
  nextcloud: "nextcloud/server",
  owncloud: "owncloud/core",
  seafile: "haiwen/seafile",
  invidious: "iv-org/invidious",
  teammapper: "b310-digital/teammapper"
};

function extractGitHubOwnerRepo(urlOrText) {
  if (!urlOrText) return null;
  const match = urlOrText.match(/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  if (!match) return null;
  const owner = match[1];
  let repo = match[2].replace(/\.git$/i, "").replace(/[#\?\/].*$/, "");
  return `${owner}/${repo}`;
}

async function fetchStats(ownerRepo) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "TheCloudRain-Sync",
  };

  try {
    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, { headers });
    if (res.ok) {
      const data = await res.json();
      return {
        stars: Number(data.stargazers_count || 0),
        language: data.language || null,
        license: data.license?.spdx_id || null,
      };
    }
    
    // If rate limited or not found on GitHub, fallback to shields.io
    console.warn(`GitHub API returned ${res.status} for ${ownerRepo}, checking shields.io...`);
    const shieldRes = await fetch(`https://img.shields.io/github/stars/${ownerRepo}.json`);
    if (shieldRes.ok) {
      const sData = await shieldRes.json();
      const valStr = String(sData.value || sData.message || "");
      let stars = 0;
      if (valStr.endsWith("k")) {
        stars = Math.round(parseFloat(valStr) * 1000);
      } else if (valStr.endsWith("M")) {
        stars = Math.round(parseFloat(valStr) * 1000000);
      } else {
        stars = parseInt(valStr, 10) || 0;
      }
      if (stars > 0) {
        return { stars, language: null, license: null };
      }
    }
  } catch (err) {
    console.warn(`Error fetching stats for ${ownerRepo}:`, err.message);
  }
  return null;
}

async function run() {
  console.log("🚀 Starting GitHub star & metadata sync for approved tools needing stars...");

  // Select tools that have 0 or null stars
  const { data: tools, error } = await supabase
    .from("open_source_tools")
    .select("id, name, slug, url, description, github_stars")
    .eq("status", "approved")
    .or("github_stars.is.null,github_stars.eq.0");

  if (error || !tools) {
    console.error("Failed to fetch tools:", error?.message);
    process.exit(1);
  }

  console.log(`Checking ${tools.length} approved tools needing stars...`);

  let updatedCount = 0;

  for (const tool of tools) {
    const slug = String(tool.slug || "").toLowerCase();
    let repo = KNOWN_REPOS[slug];

    if (!repo) {
      repo = extractGitHubOwnerRepo(tool.url) || extractGitHubOwnerRepo(tool.description);
    }

    if (!repo) continue;

    try {
      const stats = await fetchStats(repo);
      if (stats && stats.stars > 0) {
        const updatePayload = {
          github_stars: stats.stars,
        };
        if (stats.language) updatePayload.language = stats.language;
        if (stats.license && stats.license !== "NOASSERTION") updatePayload.license = stats.license;

        const { error: upErr } = await supabase
          .from("open_source_tools")
          .update(updatePayload)
          .eq("id", tool.id);

        if (!upErr) {
          console.log(`⭐ [${tool.name}] (${repo}) -> ${stats.stars.toLocaleString()} stars (Language: ${stats.language || 'N/A'}, License: ${stats.license || 'N/A'})`);
          updatedCount++;
        }
      }
      // Delay to respect rate limit
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.warn(`Failed for ${tool.name}:`, e.message);
    }
  }

  console.log(`\n🎉 Sync complete! Updated stars and metadata for ${updatedCount} tools.`);
}

run().catch(console.error);
