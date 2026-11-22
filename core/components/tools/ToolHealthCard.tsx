import { Activity, ShieldCheck, Server, Users, AlertTriangle } from "lucide-react";
import { formatLicense } from "@/lib/utils/license";
import AnimatedBar from "@/components/ui/AnimatedBar";

interface ToolHealthCardProps {
  toolName: string;
  stars: number | null;
  forks: number | null;
  license: string | null;
  lastCommitIso: string | null;
  isSelfHostable: boolean;
  hasDocker: boolean;
  isArchived?: boolean | null;
}

function scoreCommunity(stars: number | null, forks: number | null): { score: number; label: string } {
  const s = stars ?? 0;
  const f = forks ?? 0;
  if (s <= 0) return { score: 35, label: "Unverified" };
  if (s >= 25000) return { score: 98, label: `${(s / 1000).toFixed(1)}k stars · Mainstream` };
  if (s >= 10000) return { score: 90, label: `${(s / 1000).toFixed(1)}k stars · Widely Adopted` };
  if (s >= 3000) return { score: 80, label: `${(s / 1000).toFixed(1)}k stars · Strong` };
  if (s >= 1000) return { score: 70, label: `${(s / 1000).toFixed(1)}k stars · Growing` };
  if (s >= 250 || f >= 50) return { score: 58, label: `${s.toLocaleString()} stars · Niche` };
  return { score: 45, label: `${s.toLocaleString()} stars · Emerging` };
}

function scoreFreshness(lastCommitIso: string | null, isArchived?: boolean | null): { score: number; label: string } {
  if (isArchived) return { score: 15, label: "Archived Repo" };
  if (!lastCommitIso) return { score: 50, label: "Not tracked" };
  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(lastCommitIso).getTime()) / (1000 * 60 * 60 * 24)));
  if (Number.isNaN(diffDays)) return { score: 50, label: "Not tracked" };
  if (diffDays <= 30) return { score: 96, label: "Active (<30 days)" };
  if (diffDays <= 90) return { score: 84, label: "Active (<3 months)" };
  if (diffDays <= 180) return { score: 68, label: "Moderate (<6 months)" };
  if (diffDays <= 365) return { score: 48, label: "Slow (<1 year)" };
  return { score: 25, label: "Stale (>1 year)" };
}

function scoreSelfHost(isSelfHostable: boolean, hasDocker: boolean): { score: number; label: string } {
  if (hasDocker) return { score: 95, label: "Docker Ready" };
  if (isSelfHostable) return { score: 80, label: "Self-Hostable" };
  return { score: 45, label: "Manual / Cloud" };
}

function scoreLicense(license: string | null): { score: number; label: string } {
  if (!license) return { score: 45, label: "Check Repo" };
  const upper = license.toUpperCase();
  const formatted = formatLicense(license);
  if (/MIT|APACHE|BSD|ISC|UNLICENSE|ZLIB|CC0/.test(upper)) {
    return { score: 96, label: `${formatted} · Permissive` };
  }
  if (/GPL|AGPL|LGPL|MPL|EPL|EUPL/.test(upper)) {
    return { score: 82, label: `${formatted} · Copyleft OSS` };
  }
  if (/BSL|BUSL|SSPL|ELV2|FSL/.test(upper)) {
    return { score: 58, label: `${formatted} · Source-Available` };
  }
  return { score: 70, label: formatted };
}

function barColor(score: number): string {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-cyan-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-rose-400";
}

export default function ToolHealthCard({
  toolName,
  stars,
  forks,
  license,
  lastCommitIso,
  isSelfHostable,
  hasDocker,
  isArchived,
}: ToolHealthCardProps) {
  const community = scoreCommunity(stars, forks);
  const freshness = scoreFreshness(lastCommitIso, isArchived);
  const selfHost = scoreSelfHost(isSelfHostable, hasDocker);
  const licenseScore = scoreLicense(license);

  const overall = Math.round(
    community.score * 0.3 +
      freshness.score * 0.3 +
      selfHost.score * 0.2 +
      licenseScore.score * 0.2
  );

  const overallTier =
    isArchived
      ? { text: "Archived", cls: "border-rose-400/30 bg-rose-400/10 text-rose-300" }
      : overall >= 82
        ? { text: "Production Ready", cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" }
        : overall >= 65
          ? { text: "Solid Choice", cls: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200" }
          : { text: "Evaluate Carefully", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" };

  const metrics = [
    { name: "Community Adoption", icon: Users, ...community },
    { name: "Maintenance Freshness", icon: Activity, ...freshness },
    { name: "Self-Host Readiness", icon: Server, ...selfHost },
    { name: "License Freedom", icon: ShieldCheck, ...licenseScore },
  ];

  return (
    <section
      aria-label={`${toolName} health and readiness scores`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            At-a-Glance Health Audit
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            {toolName} Open-Source Readiness Score
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display text-2xl font-bold leading-none text-white">
              {overall}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </p>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${overallTier.cls}`}
          >
            {overallTier.text}
          </span>
        </div>
      </div>

      {isArchived && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>
            This GitHub repository is marked as archived. Check active forks or alternatives below before deploying in production.
          </span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.name}
              className="rounded-2xl border border-white/10 bg-black/50 p-4"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 font-medium text-white/90">
                  <Icon className="h-3.5 w-3.5 text-cyan-400" />
                  {m.name}
                </span>
                <span className="font-semibold text-white/75">{m.label}</span>
              </div>
              <div
                className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={m.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${m.name}: ${m.score} out of 100`}
              >
                <AnimatedBar pct={m.score} className={barColor(m.score)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
