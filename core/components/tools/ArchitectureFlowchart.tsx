"use client";

import { useState } from "react";
import { Globe, Shield, Box, Database, HardDrive, Activity, Info } from "lucide-react";
import { getDockerSpec } from "@/lib/docker-specs";

interface ArchitectureFlowchartProps {
  toolName: string;
  slug: string;
  language?: string | null;
  category?: string | null;
  repoOwner?: string | null;
}

type FlowNode = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: "client" | "proxy" | "app" | "db" | "volume" | "analytics";
  accent: "cyan" | "emerald" | "amber" | "white";
  details: string;
  specChip: string;
};

const MULTI_SERVICE_SLUGS = new Set([
  "plane",
  "twenty",
  "authentik",
  "chatwoot",
  "keycloak",
  "appwrite",
  "supabase",
  "hoppscotch",
  "calcom",
  "cal-com",
  "n8n",
  "listmonk",
  "postiz",
  "outline",
  "windmill",
  "tooljet",
  "appsmith",
  "matomo",
  "dokploy",
  "coolify",
  "infisical",
  "openproject",
  "zammad",
  "rocketchat",
  "rocket-chat",
  "mattermost",
  "gitlab",
  "umami",
  "plausible",
  "immich",
  "nextcloud",
  "medusa",
  "langfuse",
]);

const ANALYTICS_PIPELINE_SLUGS = new Set([
  "posthog",
  "signoz",
  "openobserve",
  "plausible",
  "clickhouse",
  "netdata",
]);

function detectTopology(slug: string, hasDbEnv: boolean): "analytics" | "multi" | "single" {
  const s = slug.toLowerCase();
  if (ANALYTICS_PIPELINE_SLUGS.has(s)) return "analytics";
  if (hasDbEnv || MULTI_SERVICE_SLUGS.has(s)) return "multi";
  return "single";
}

function NodeIcon({ icon, className }: { icon: FlowNode["icon"]; className?: string }) {
  switch (icon) {
    case "client":
      return <Globe className={className} />;
    case "proxy":
      return <Shield className={className} />;
    case "app":
      return <Box className={className} />;
    case "db":
      return <Database className={className} />;
    case "analytics":
      return <Activity className={className} />;
    default:
      return <HardDrive className={className} />;
  }
}

export default function ArchitectureFlowchart({
  toolName,
  slug,
  language,
  repoOwner,
}: ArchitectureFlowchartProps) {
  const spec = getDockerSpec(slug, repoOwner);
  const primaryPort = spec.ports?.[0]?.split(":")?.[0] || "3000";
  const primaryVolume = spec.volumes?.[0] || `./${slug}_data:/data`;
  const hasDbEnv = Boolean(
    spec.environment &&
      Object.keys(spec.environment).some((k) => /DATABASE|POSTGRES|MYSQL|MONGO|REDIS/i.test(k))
  );

  const topology = detectTopology(slug, hasDbEnv);

  const topologyLabel =
    topology === "analytics"
      ? "Event & Columnar Pipeline"
      : topology === "multi"
        ? "App + Database Stack"
        : "Single-Container Stack";

  const nodes: FlowNode[] = [
    {
      id: "client",
      title: topology === "analytics" ? "Apps & SDKs" : "HTTPS Users",
      subtitle: topology === "analytics" ? "Web / API Events" : "Browser / CLI",
      badge: "TLS 1.3",
      icon: "client",
      accent: "white",
      details:
        topology === "analytics"
          ? `Your web apps, backend services, or OpenTelemetry agents stream events to your private ${toolName} domain without third-party trackers.`
          : `End users and team members connect over HTTPS to your custom domain (e.g. ${slug}.yourdomain.com) with zero vendor lock-in.`,
      specChip: "Port 443 · First-Party Domain",
    },
    {
      id: "proxy",
      title: "Reverse Proxy",
      subtitle: "Caddy / Traefik",
      badge: "Auto-SSL",
      icon: "proxy",
      accent: "cyan",
      details: `Terminates Let's Encrypt HTTPS certificates automatically and forwards verified traffic internally to ${toolName} on container port :${primaryPort}.`,
      specChip: `443 → :${primaryPort} · Let's Encrypt`,
    },
    {
      id: "app",
      title: toolName,
      subtitle: language ? `${language} Container` : "Docker Container",
      badge: `:${primaryPort}`,
      icon: "app",
      accent: "cyan",
      details: `Runs isolated inside Docker using image ${spec.image}. Stateless restarts let you upgrade versions cleanly without touching your persisted data.`,
      specChip: spec.image,
    },
    topology === "analytics"
      ? {
          id: "storage",
          title: "Columnar & S3",
          subtitle: "ClickHouse / R2",
          badge: "Persistent",
          icon: "analytics",
          accent: "emerald",
          details: `High-compression analytical storage (ClickHouse / S3-compatible object storage) enables sub-second queries across millions of events with low disk cost.`,
          specChip: "Columnar DB + S3 Backups",
        }
      : topology === "multi"
        ? {
            id: "storage",
            title: "PostgreSQL & Cache",
            subtitle: "DB + S3 Backups",
            badge: "Persistent",
            icon: "db",
            accent: "emerald",
            details: `Stores relational state in PostgreSQL (and optional Redis queues) on a mounted Docker volume. Pair with nightly encrypted pg_dump backups to Cloudflare R2 or Backblaze B2.`,
            specChip: "PostgreSQL 16 + Automated Backups",
          }
        : {
            id: "storage",
            title: "Persistent Volume",
            subtitle: "SQLite / Local Disk",
            badge: "1-Volume",
            icon: "volume",
            accent: "emerald",
            details: `All state lives in a single mounted Docker volume (${primaryVolume}) — zero external database servers to manage. Sync the folder nightly to S3/R2 for disaster recovery.`,
            specChip: primaryVolume,
          },
  ];

  const [activeId, setActiveId] = useState<string>("app");
  const activeNode = nodes.find((n) => n.id === activeId) || nodes[2];

  return (
    <section
      aria-label={`${toolName} self-hosting architecture flowchart`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            Production Topology
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            How {toolName} Runs Self-Hosted
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
            {topologyLabel}
          </span>
          <span className="hidden sm:inline text-[11px] text-white/40">
            Click a node to inspect
          </span>
        </div>
      </div>

      {/* Interactive Pure-Black Dotted Diagram Canvas */}
      <div
        className="mt-5 rounded-2xl border border-white/10 bg-black p-4 sm:p-6"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="flex flex-col items-stretch justify-between gap-2 md:flex-row md:items-center md:gap-0">
          {nodes.map((node, index) => {
            const isActive = node.id === activeNode.id;
            const ringStyle = isActive
              ? node.accent === "emerald"
                ? "border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_24px_-6px_rgba(52,211,153,0.45)]"
                : "border-cyan-400/70 bg-cyan-400/10 shadow-[0_0_24px_-6px_rgba(34,211,238,0.45)]"
              : "border-white/15 bg-black/90 hover:border-white/30 hover:bg-white/[0.04]";

            return (
              <div
                key={node.id}
                className="flex flex-col items-center md:flex-1 md:flex-row"
              >
                <button
                  type="button"
                  onClick={() => setActiveId(node.id)}
                  onMouseEnter={() => setActiveId(node.id)}
                  aria-pressed={isActive}
                  className={`group relative w-full rounded-2xl border p-3.5 text-left transition-all duration-200 ${ringStyle}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                        isActive
                          ? node.accent === "emerald"
                            ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                            : "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                          : "border-white/10 bg-white/5 text-white/70 group-hover:text-white"
                      }`}
                    >
                      <NodeIcon icon={node.icon} className="h-4 w-4" />
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                      {node.badge}
                    </span>
                  </div>

                  <p className="mt-2.5 truncate font-display text-sm font-bold text-white">
                    {node.title}
                  </p>
                  <p className="truncate text-[11px] text-white/55">
                    {node.subtitle}
                  </p>
                </button>

                {/* Animated SVG Connector Arrow */}
                {index < nodes.length - 1 && (
                  <>
                    {/* Desktop Horizontal Connector */}
                    <div className="hidden w-9 shrink-0 items-center justify-center md:flex">
                      <svg
                        viewBox="0 0 36 16"
                        className="h-4 w-9 overflow-visible"
                        aria-hidden="true"
                      >
                        <line
                          x1="0"
                          y1="8"
                          x2="28"
                          y2="8"
                          stroke="rgba(34, 211, 238, 0.7)"
                          strokeWidth="1.75"
                          className="animate-flow-dash"
                        />
                        <polygon
                          points="27,4 35,8 27,12"
                          fill="rgba(34, 211, 238, 0.85)"
                        />
                      </svg>
                    </div>

                    {/* Mobile Vertical Connector */}
                    <div className="flex h-7 items-center justify-center md:hidden">
                      <svg
                        viewBox="0 0 16 28"
                        className="h-7 w-4 overflow-visible"
                        aria-hidden="true"
                      >
                        <line
                          x1="8"
                          y1="0"
                          x2="8"
                          y2="20"
                          stroke="rgba(34, 211, 238, 0.7)"
                          strokeWidth="1.75"
                          className="animate-flow-dash"
                        />
                        <polygon
                          points="4,19 8,27 12,19"
                          fill="rgba(34, 211, 238, 0.85)"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Node Technical Inspector */}
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            <div>
              <p className="text-xs font-semibold text-white">
                {activeNode.title} — {activeNode.subtitle}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                {activeNode.details}
              </p>
            </div>
          </div>
          <span className="shrink-0 self-start rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 font-mono text-[11px] text-cyan-200 sm:self-center">
            {activeNode.specChip}
          </span>
        </div>
      </div>
    </section>
  );
}
