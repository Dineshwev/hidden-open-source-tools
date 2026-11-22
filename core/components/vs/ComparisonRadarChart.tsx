"use client";

import { useMemo, useState } from "react";
import { Radar } from "lucide-react";
import { VERIFIED_DOCKER_SPECS } from "@/lib/docker-specs";
import { VERIFIED_SAAS_PRICING } from "@/lib/pricing-data";

type ToolLink = {
  name: string;
  slug: string;
  type: "tool" | "alternative";
};

type AxisScore = {
  key: string;
  label: string;
  shortLabel: string;
  scoreA: number;
  scoreB: number;
  reason: string;
};

const LIGHTWEIGHT_SLUGS = new Set([
  "gitea",
  "umami",
  "plausible",
  "pocketbase",
  "docuseal",
  "uptime-kuma",
  "vaultwarden",
  "bruno",
  "hoppscotch",
  "listmonk",
  "meilisearch",
  "typesense",
  "memos",
  "beszel",
  "netdata",
  "glitchtip",
  "dokploy",
  "coolify",
]);

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isLikelySaas(name: string, toolLinks: ToolLink[]): boolean {
  const norm = normalizeKey(name);
  if (toolLinks.some((l) => l.type === "alternative" && (l.slug === norm || l.name.toLowerCase() === name.toLowerCase()))) {
    return true;
  }
  if (VERIFIED_SAAS_PRICING[norm]) return true;
  return /^(auth0|okta|jira|linear|notion|firebase|datadog|intercom|retool|hubspot|salesforce|slack|docusign|postman|airtable|vercel|railway|heroku|aws|s3|google|mixpanel|amplitude|sentry|mailchimp|shopify|figma|typeform|zendesk|buffer|algolia|pinecone|mongodb|redis|hashicorp|1password|calendly|zapier|loom|langsmith)$/i.test(
    norm.split("-")[0] || ""
  );
}

function buildAxisScores(toolA: string, toolB: string, toolLinks: ToolLink[]): AxisScore[] {
  const slugA = normalizeKey(toolA);
  const slugB = normalizeKey(toolB);
  const saasA = isLikelySaas(toolA, toolLinks);
  const saasB = isLikelySaas(toolB, toolLinks);

  const lightA = LIGHTWEIGHT_SLUGS.has(slugA) || Boolean(VERIFIED_DOCKER_SPECS[slugA]);
  const lightB = LIGHTWEIGHT_SLUGS.has(slugB) || Boolean(VERIFIED_DOCKER_SPECS[slugB]);

  const costA = saasA ? 44 : lightA ? 95 : 88;
  const costB = saasB ? 42 : lightB ? 94 : 86;

  const privacyA = saasA ? 45 : 96;
  const privacyB = saasB ? 45 : 94;

  const setupA = saasA ? 94 : lightA ? 82 : 64;
  const setupB = saasB ? 95 : lightB ? 80 : 62;

  const customA = saasA ? 64 : 92;
  const customB = saasB ? 66 : 90;

  const ecoA = saasA ? 92 : 82;
  const ecoB = saasB ? 94 : 80;

  return [
    {
      key: "cost",
      label: "Cost Efficiency",
      shortLabel: "Cost",
      scoreA: costA,
      scoreB: costB,
      reason:
        !saasA && saasB
          ? `${toolA} eliminates per-seat SaaS renewals ($0 license + flat VPS hosting), while ${toolB} scales by seats/usage.`
          : saasA && !saasB
            ? `${toolB} eliminates per-seat SaaS renewals ($0 license + flat VPS hosting), while ${toolA} scales by seats/usage.`
            : `Both ${toolA} and ${toolB} are open-source with $0 software licensing; total cost depends on VPS RAM footprint.`,
    },
    {
      key: "privacy",
      label: "Data Ownership",
      shortLabel: "Privacy",
      scoreA: privacyA,
      scoreB: privacyB,
      reason:
        !saasA && saasB
          ? `${toolA} stores 100% of data in your own private database/VPC, whereas ${toolB} processes data on vendor-managed cloud infrastructure.`
          : `Both tools support self-hosted deployments with full database control and GDPR-friendly residency.`,
    },
    {
      key: "setup",
      label: "Zero-Ops Setup",
      shortLabel: "Ease of Setup",
      scoreA: setupA,
      scoreB: setupB,
      reason:
        !saasA && saasB
          ? `${toolB} requires zero server maintenance out of the box; ${toolA} deploys via Docker in minutes but you own backups and upgrades.`
          : `${lightA && !lightB ? toolA : !lightA && lightB ? toolB : toolA} has a streamlined container footprint for faster initial deployment.`,
    },
    {
      key: "custom",
      label: "Customization & API",
      shortLabel: "Flexibility",
      scoreA: customA,
      scoreB: customB,
      reason:
        !saasA && saasB
          ? `${toolA} provides full source access, direct database queries, and unmetered APIs without enterprise tier gates.`
          : `Both offer extensible open-source codebases, webhooks, and custom integration workflows.`,
    },
    {
      key: "ecosystem",
      label: "Ecosystem & Maturity",
      shortLabel: "Ecosystem",
      scoreA: ecoA,
      scoreB: ecoB,
      reason:
        !saasA && saasB
          ? `${toolB} benefits from a larger commercial marketplace and turnkey integrations, while ${toolA} has strong GitHub community momentum.`
          : `Both projects maintain active open-source communities, Docker images, and production documentation.`,
    },
  ];
}

function polarToCartesian(cx: number, cy: number, radius: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export default function ComparisonRadarChart({
  toolA,
  toolB,
  toolLinks = [],
}: {
  toolA: string;
  toolB: string;
  toolLinks?: ToolLink[];
}) {
  const axes = useMemo(() => buildAxisScores(toolA, toolB, toolLinks), [toolA, toolB, toolLinks]);
  const [layer, setLayer] = useState<"both" | "a" | "b">("both");
  const [activeKey, setActiveKey] = useState<string>("cost");

  const activeAxis = axes.find((a) => a.key === activeKey) || axes[0];

  const CX = 180;
  const CY = 152;
  const R = 102;
  const total = axes.length;

  const rings = [25, 50, 75, 100];

  const polygonPoints = (scores: number[]) =>
    scores
      .map((val, idx) => {
        const pt = polarToCartesian(CX, CY, (R * val) / 100, idx, total);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(" ");

  const polyA = polygonPoints(axes.map((a) => a.scoreA));
  const polyB = polygonPoints(axes.map((a) => a.scoreB));

  return (
    <section
      aria-label={`5-axis visual comparison radar: ${toolA} vs ${toolB}`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            <Radar className="h-3.5 w-3.5" />
            <span>Visual Trade-Off Profile</span>
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            {toolA} vs {toolB}: 5-Axis Fingerprint
          </h2>
        </div>

        {/* Layer Toggles */}
        <div className="inline-flex flex-wrap rounded-2xl border border-white/10 bg-black p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLayer("both")}
            className={`rounded-xl px-3 py-1.5 transition ${
              layer === "both" ? "bg-white text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Overlay Both
          </button>
          <button
            type="button"
            onClick={() => setLayer("a")}
            className={`rounded-xl px-3 py-1.5 transition ${
              layer === "a" ? "bg-cyan-300 text-slate-950" : "text-cyan-300/75 hover:text-cyan-200"
            }`}
          >
            {toolA}
          </button>
          <button
            type="button"
            onClick={() => setLayer("b")}
            className={`rounded-xl px-3 py-1.5 transition ${
              layer === "b" ? "bg-orange-300 text-slate-950" : "text-orange-300/75 hover:text-orange-200"
            }`}
          >
            {toolB}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Pure-Black SVG Radar */}
        <div className="rounded-2xl border border-white/10 bg-black p-3">
          <svg
            viewBox="0 0 360 300"
            className="mx-auto h-auto w-full max-w-[340px] select-none"
            role="img"
            aria-label={`Radar chart comparing ${toolA} and ${toolB} across 5 engineering dimensions`}
          >
            {/* Concentric Pentagon Grid Rings */}
            {rings.map((pct) => {
              const ringPts = axes
                .map((_, idx) => {
                  const pt = polarToCartesian(CX, CY, (R * pct) / 100, idx, total);
                  return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  key={pct}
                  points={ringPts}
                  fill="none"
                  stroke={pct === 100 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)"}
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis Spokes & Clickable Labels */}
            {axes.map((axis, idx) => {
              const end = polarToCartesian(CX, CY, R, idx, total);
              const labelPt = polarToCartesian(CX, CY, R + 24, idx, total);
              const isSelected = axis.key === activeAxis.key;

              return (
                <g
                  key={axis.key}
                  className="cursor-pointer"
                  onClick={() => setActiveKey(axis.key)}
                  onMouseEnter={() => setActiveKey(axis.key)}
                >
                  <line
                    x1={CX}
                    y1={CY}
                    x2={end.x}
                    y2={end.y}
                    stroke={isSelected ? "rgba(34,211,238,0.65)" : "rgba(255,255,255,0.10)"}
                    strokeWidth={isSelected ? "1.6" : "1"}
                  />
                  <text
                    x={labelPt.x}
                    y={labelPt.y + 3}
                    textAnchor="middle"
                    fill={isSelected ? "#22d3ee" : "rgba(255,255,255,0.72)"}
                    fontSize={isSelected ? "10.5" : "9.5"}
                    fontWeight={isSelected ? "700" : "500"}
                  >
                    {axis.shortLabel}
                  </text>
                </g>
              );
            })}

            {/* Tool B Polygon (Orange) */}
            {(layer === "both" || layer === "b") && (
              <polygon
                points={polyB}
                fill="rgba(251,146,60,0.20)"
                stroke="#fb923c"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            )}

            {/* Tool A Polygon (Cyan) */}
            {(layer === "both" || layer === "a") && (
              <polygon
                points={polyA}
                fill="rgba(34,211,238,0.22)"
                stroke="#22d3ee"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            )}

            {/* Highlight Dots on Active Axis */}
            {axes.map((axis, idx) => {
              if (axis.key !== activeAxis.key) return null;
              const ptA = polarToCartesian(CX, CY, (R * axis.scoreA) / 100, idx, total);
              const ptB = polarToCartesian(CX, CY, (R * axis.scoreB) / 100, idx, total);
              return (
                <g key={`dot-${axis.key}`}>
                  {(layer === "both" || layer === "b") && (
                    <circle cx={ptB.x} cy={ptB.y} r="4.5" fill="#fb923c" stroke="#000" strokeWidth="1.5" />
                  )}
                  {(layer === "both" || layer === "a") && (
                    <circle cx={ptA.x} cy={ptA.y} r="4.5" fill="#22d3ee" stroke="#000" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Compact Legend */}
          <div className="mt-1 flex items-center justify-center gap-5 border-t border-white/10 pt-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-200 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              {toolA}
            </span>
            <span className="flex items-center gap-1.5 text-orange-200 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
              {toolB}
            </span>
          </div>
        </div>

        {/* Interactive 5-Dimension Breakdown */}
        <div className="space-y-2.5">
          {axes.map((axis) => {
            const isSelected = axis.key === activeAxis.key;
            return (
              <button
                key={axis.key}
                type="button"
                onClick={() => setActiveKey(axis.key)}
                onMouseEnter={() => setActiveKey(axis.key)}
                className={`w-full rounded-2xl border p-3.5 text-left transition ${
                  isSelected
                    ? "border-cyan-400/45 bg-white/[0.05]"
                    : "border-white/10 bg-black/60 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">{axis.label}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-cyan-300">
                      {toolA}: <strong>{axis.scoreA}</strong>
                    </span>
                    <span className="text-orange-300">
                      {toolB}: <strong>{axis.scoreB}</strong>
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <p className="mt-2 text-xs leading-relaxed text-white/70">
                    {axis.reason}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
