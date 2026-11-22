import type { SaasPricingModel } from "@/lib/pricing-data";
import { DollarSign, TrendingDown } from "lucide-react";
import AnimatedBar from "@/components/ui/AnimatedBar";

function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export default function CostComparisonBarChart({
  pricing,
  openSourceToolName,
}: {
  pricing: SaasPricingModel;
  openSourceToolName: string;
}) {
  const units = pricing.defaultUnits;
  const saasAnnual = units * pricing.unitCostMonthly * 12;
  const doAnnual = (pricing.vpsCostDigitalOcean + pricing.backupCostMonthly) * 12;
  const hetznerAnnual = (pricing.vpsCostHetzner + pricing.backupCostMonthly) * 12;

  if (saasAnnual <= 0) return null;

  const maxCost = Math.max(saasAnnual, doAnnual, hetznerAnnual);
  const pct = (val: number) => Math.max(4, Math.round((val / maxCost) * 100));
  const annualSavings = Math.max(0, saasAnnual - hetznerAnnual);
  const savingsPct = saasAnnual > 0 ? Math.round((annualSavings / saasAnnual) * 100) : 0;

  const bars = [
    {
      label: `${pricing.saasName} (${pricing.saasPricingTier})`,
      sublabel: `${units} ${pricing.unitName} × $${pricing.unitCostMonthly}/mo`,
      annual: saasAnnual,
      width: pct(saasAnnual),
      barClass: "bg-gradient-to-r from-rose-500 to-orange-400",
      amountClass: "text-rose-300",
    },
    {
      label: `${openSourceToolName} Self-Hosted (DigitalOcean + Backups)`,
      sublabel: pricing.vpsSpec,
      annual: doAnnual,
      width: pct(doAnnual),
      barClass: "bg-gradient-to-r from-cyan-500 to-sky-400",
      amountClass: "text-cyan-200",
    },
    {
      label: `${openSourceToolName} Self-Hosted (Hetzner + Backups)`,
      sublabel: pricing.vpsSpec,
      annual: hetznerAnnual,
      width: pct(hetznerAnnual),
      barClass: "bg-gradient-to-r from-emerald-500 to-teal-400",
      amountClass: "text-emerald-300",
    },
  ];

  return (
    <section
      aria-label={`Annual cost comparison: ${openSourceToolName} vs ${pricing.saasName}`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Verified Annual Cost Snapshot</span>
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            Estimated 1-Year Spend ({units} {pricing.unitName})
          </h2>
        </div>

        {annualSavings > 0 && (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200">
            <TrendingDown className="h-4 w-4 text-emerald-400" />
            <span>
              Save ~{formatUsd(annualSavings)}/yr ({savingsPct}%)
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-white">{bar.label}</p>
                <p className="text-[11px] text-slate-400">{bar.sublabel}</p>
              </div>
              <p className={`font-display text-base font-bold ${bar.amountClass}`}>
                {formatUsd(bar.annual)}
                <span className="text-xs font-normal text-slate-400">/yr</span>
              </p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <AnimatedBar pct={bar.width} className={bar.barClass} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
        <span>
          Based on published {pricing.saasName} pricing vs dedicated VPS hosting.
        </span>
        <a
          href="#cost-calculator"
          className="font-semibold text-cyan-300 hover:text-cyan-200 transition"
        >
          Customize for your team size ↓
        </a>
      </div>
    </section>
  );
}
