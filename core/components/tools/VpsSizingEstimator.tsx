"use client";

import { useState } from "react";
import { Cpu, MemoryStick, HardDrive, Server, Sparkles } from "lucide-react";
import { VERIFIED_SAAS_PRICING } from "@/lib/pricing-data";

interface VpsSizingEstimatorProps {
  toolName: string;
  slug: string;
  language?: string | null;
  saasSlug?: string | null;
}

type TierKey = "solo" | "startup" | "production";

type TierSpec = {
  key: TierKey;
  label: string;
  audience: string;
  vcpu: string;
  vcpuPct: number;
  ram: string;
  ramPct: number;
  storage: string;
  storagePct: number;
  hetzner: number;
  digitalOcean: number;
  aws: number;
  opsTip: string;
};

const LIGHTWEIGHT_SLUGS = new Set([
  "pocketbase",
  "uptime-kuma",
  "uptimekuma",
  "vaultwarden",
  "docuseal",
  "beszel",
  "gitea",
  "memos",
  "listmonk",
  "umami",
  "goatcounter",
  "changedetection-io",
  "ntfy",
  "caddy",
  "traefik",
  "meilisearch",
]);

const HEAVY_SLUGS = new Set([
  "posthog",
  "signoz",
  "openobserve",
  "gitlab",
  "keycloak",
  "supabase",
  "appwrite",
  "sentry",
  "clickhouse",
  "immich",
  "nextcloud",
]);

function detectProfile(slug: string, language?: string | null): "light" | "standard" | "heavy" {
  const s = slug.toLowerCase();
  if (HEAVY_SLUGS.has(s)) return "heavy";
  if (LIGHTWEIGHT_SLUGS.has(s)) return "light";
  const lang = (language || "").toLowerCase();
  if (lang === "go" || lang === "rust" || lang === "c" || lang === "c++") return "light";
  return "standard";
}

function buildTiers(
  toolName: string,
  profile: "light" | "standard" | "heavy",
  saasSlug?: string | null
): TierSpec[] {
  const pricing = saasSlug ? VERIFIED_SAAS_PRICING[saasSlug] : undefined;

  if (profile === "light") {
    return [
      {
        key: "solo",
        label: "Solo / Homelab",
        audience: "1–10 users",
        vcpu: "1 vCPU",
        vcpuPct: 20,
        ram: "512 MB – 1 GB",
        ramPct: 18,
        storage: "20 GB NVMe",
        storagePct: 20,
        hetzner: 4.35,
        digitalOcean: 6,
        aws: 8.5,
        opsTip: `${toolName} has a tiny footprint — runs smoothly even on a $4.35/mo CX22 or Raspberry Pi 4 with nightly R2 backups.`,
      },
      {
        key: "startup",
        label: "Startup Team",
        audience: "10–50 users",
        vcpu: "2 vCPU",
        vcpuPct: 45,
        ram: "2 GB RAM",
        ramPct: 40,
        storage: "40 GB NVMe",
        storagePct: 45,
        hetzner: pricing ? pricing.vpsCostHetzner : 4.35,
        digitalOcean: pricing ? pricing.vpsCostDigitalOcean : 12,
        aws: pricing ? pricing.vpsCostAWS : 16,
        opsTip: `Enable Caddy/Traefik HTTP/2 + automated daily volume snapshots to Cloudflare R2 (~$1/mo) for zero-stress operations.`,
      },
      {
        key: "production",
        label: "Production Scale",
        audience: "50–250+ users",
        vcpu: "4 vCPU",
        vcpuPct: 80,
        ram: "8 GB RAM",
        ramPct: 78,
        storage: "80 GB NVMe",
        storagePct: 80,
        hetzner: 7.59,
        digitalOcean: 24,
        aws: 34,
        opsTip: `Pair ${toolName} with Cloudflare CDN in front, off-site encrypted backups, and Uptime Kuma/Beszel alerts.`,
      },
    ];
  }

  if (profile === "heavy") {
    return [
      {
        key: "solo",
        label: "Solo / Dev",
        audience: "Testing / <10 users",
        vcpu: "2 vCPU",
        vcpuPct: 35,
        ram: "4 GB RAM",
        ramPct: 38,
        storage: "40 GB NVMe",
        storagePct: 35,
        hetzner: 4.35,
        digitalOcean: 24,
        aws: 30,
        opsTip: `Configure a 4 GB Linux swap file if testing ${toolName} on a 4 GB VPS to prevent container OOM kills during spikes.`,
      },
      {
        key: "startup",
        label: "Startup Team",
        audience: "10–50 users",
        vcpu: "4 vCPU",
        vcpuPct: 62,
        ram: "8 GB RAM",
        ramPct: 65,
        storage: "80 GB NVMe",
        storagePct: 60,
        hetzner: pricing ? pricing.vpsCostHetzner : 14.9,
        digitalOcean: pricing ? pricing.vpsCostDigitalOcean : 48,
        aws: pricing ? pricing.vpsCostAWS : 62,
        opsTip: `Recommended baseline for ${toolName}: dedicated 8 GB RAM keeps background workers, queues, and analytical queries snappy.`,
      },
      {
        key: "production",
        label: "Production Scale",
        audience: "50–500+ users",
        vcpu: "8 vCPU",
        vcpuPct: 92,
        ram: "16 GB RAM",
        ramPct: 92,
        storage: "160 GB NVMe",
        storagePct: 90,
        hetzner: 27.9,
        digitalOcean: 96,
        aws: 124,
        opsTip: `Separate PostgreSQL/ClickHouse onto dedicated storage volumes and set retention policies so disk usage stays predictable.`,
      },
    ];
  }

  // Standard App + DB stack
  return [
    {
      key: "solo",
      label: "Solo / Homelab",
      audience: "1–10 users",
      vcpu: "2 vCPU",
      vcpuPct: 30,
      ram: "2 GB RAM",
      ramPct: 28,
      storage: "40 GB NVMe",
      storagePct: 30,
      hetzner: 4.35,
      digitalOcean: 12,
      aws: 16,
      opsTip: `Add a 2 GB swap file on a 2 GB VPS so ${toolName} builds and PostgreSQL vacuum jobs never hit memory limits.`,
    },
    {
      key: "startup",
      label: "Startup Team",
      audience: "10–50 users",
      vcpu: "2–4 vCPU",
      vcpuPct: 58,
      ram: "4 GB RAM",
      ramPct: 55,
      storage: "80 GB NVMe",
      storagePct: 55,
      hetzner: pricing ? pricing.vpsCostHetzner : 7.05,
      digitalOcean: pricing ? pricing.vpsCostDigitalOcean : 24,
      aws: pricing ? pricing.vpsCostAWS : 30,
      opsTip: `Sweet spot for most teams: runs ${toolName}, PostgreSQL, Redis, and Traefik comfortably with nightly pg_dump backups to S3/R2.`,
    },
    {
      key: "production",
      label: "Production Scale",
      audience: "50–250+ users",
      vcpu: "4–8 vCPU",
      vcpuPct: 88,
      ram: "8–16 GB RAM",
      ramPct: 86,
      storage: "160 GB NVMe",
      storagePct: 85,
      hetzner: 14.9,
      digitalOcean: 48,
      aws: 64,
      opsTip: `For mission-critical teams, offload PostgreSQL to managed DB or dedicated standby replica and enable automated health alerts.`,
    },
  ];
}

export default function VpsSizingEstimator({
  toolName,
  slug,
  language,
  saasSlug,
}: VpsSizingEstimatorProps) {
  const [selectedTier, setSelectedTier] = useState<TierKey>("startup");
  const profile = detectProfile(slug, language);
  const tiers = buildTiers(toolName, profile, saasSlug);
  const active = tiers.find((t) => t.key === selectedTier) || tiers[1];

  const hardwareBars = [
    { label: "CPU Cores", value: active.vcpu, pct: active.vcpuPct, icon: Cpu, barCls: "bg-cyan-400" },
    { label: "Memory (RAM)", value: active.ram, pct: active.ramPct, icon: MemoryStick, barCls: "bg-emerald-400" },
    { label: "NVMe Disk", value: active.storage, pct: active.storagePct, icon: HardDrive, barCls: "bg-amber-300" },
  ];

  const providers = [
    { name: "Hetzner Cloud", price: active.hetzner, highlight: true, note: "Best value" },
    { name: "DigitalOcean", price: active.digitalOcean, highlight: false, note: "Simple DX" },
    { name: "AWS Lightsail / EC2", price: active.aws, highlight: false, note: "AWS VPC" },
  ];

  return (
    <section
      aria-label={`${toolName} VPS hardware and hosting cost estimator`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            <Server className="h-3.5 w-3.5" />
            <span>Interactive Server Sizer</span>
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            What VPS Do You Need for {toolName}?
          </h2>
        </div>

        {/* 3-Tier Interactive Pill Selector */}
        <div
          role="tablist"
          aria-label="Team scale"
          className="inline-flex flex-wrap rounded-2xl border border-white/10 bg-black p-1"
        >
          {tiers.map((tier) => {
            const isSelected = tier.key === active.key;
            return (
              <button
                key={tier.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedTier(tier.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-cyan-300 text-slate-950 shadow-sm"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardware Resource Bars */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {hardwareBars.map((hw) => {
          const Icon = hw.icon;
          return (
            <div
              key={hw.label}
              className="rounded-2xl border border-white/10 bg-black/70 p-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-white/60">
                  <Icon className="h-3.5 w-3.5 text-cyan-300" />
                  {hw.label}
                </span>
                <span className="font-mono font-bold text-white">{hw.value}</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${hw.barCls}`}
                  style={{ width: `${hw.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly VPS Cost Comparison Strip */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {providers.map((p) => (
          <div
            key={p.name}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
              p.highlight
                ? "border-emerald-400/30 bg-emerald-400/10"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-white">{p.name}</p>
              <p className="text-[10px] text-white/50">{p.note}</p>
            </div>
            <p
              className={`font-display text-base font-bold ${
                p.highlight ? "text-emerald-300" : "text-white/90"
              }`}
            >
              ~${p.price.toFixed(p.price % 1 === 0 ? 0 : 2)}
              <span className="text-[11px] font-normal text-white/50">/mo</span>
            </p>
          </div>
        ))}
      </div>

      {/* Production Ops Tip */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white/75">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
        <p>
          <span className="font-semibold text-white">
            {active.label} ({active.audience}):
          </span>{" "}
          {active.opsTip}
        </p>
      </div>
    </section>
  );
}
