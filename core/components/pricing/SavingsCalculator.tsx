"use client";

import { useState } from "react";
import { DollarSign, Server, ExternalLink, ChevronDown, ChevronUp, ShieldCheck, Calculator } from "lucide-react";
import { getSaasPricingModel, type SaasPricingModel } from "@/lib/pricing-data";

interface SavingsCalculatorProps {
  saasSlug: string;
  saasName: string;
}

type ProviderKey = "hetzner" | "digitalocean" | "aws";

const PROVIDERS: Record<ProviderKey, { name: string; label: string; url: string }> = {
  hetzner: {
    name: "Hetzner Cloud",
    label: "Hetzner (EU/US Budget)",
    url: "https://www.hetzner.com/cloud/",
  },
  digitalocean: {
    name: "DigitalOcean",
    label: "DigitalOcean (Global)",
    url: "https://www.digitalocean.com/pricing/droplets",
  },
  aws: {
    name: "AWS EC2 / Lightsail",
    label: "AWS (Enterprise)",
    url: "https://aws.amazon.com/ec2/pricing/",
  },
};

export default function SavingsCalculator({ saasSlug, saasName }: SavingsCalculatorProps) {
  const model: SaasPricingModel = getSaasPricingModel(saasSlug, saasName);

  const [units, setUnits] = useState<number>(model.defaultUnits);
  const [provider, setProvider] = useState<ProviderKey>("hetzner");
  const [showSources, setShowSources] = useState<boolean>(false);

  // Compute monthly VPS cost based on chosen provider
  const vpsMonthlyCost =
    provider === "hetzner"
      ? model.vpsCostHetzner
      : provider === "digitalocean"
        ? model.vpsCostDigitalOcean
        : model.vpsCostAWS;

  const selfHostedMonthlyTotal = Math.round(vpsMonthlyCost + model.backupCostMonthly);
  const saasMonthlyTotal = Math.round(units * model.unitCostMonthly);

  const saasAnnual = saasMonthlyTotal * 12;
  const selfHostedAnnual = selfHostedMonthlyTotal * 12;
  const netAnnualSavings = Math.max(0, saasAnnual - selfHostedAnnual);
  const savingsPercent = saasAnnual > 0 ? Math.round((netAnnualSavings / saasAnnual) * 100) : 0;

  const currentProviderInfo = PROVIDERS[provider];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 md:p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Self-Hosted Cost Savings Calculator
            </h3>
            <p className="text-xs text-white/50">
              Transparent, sourced comparison: Commercial {model.saasName} vs. Self-Hosted Infrastructure
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
          Verified Sourced Data
        </span>
      </div>

      {/* Interactive Controls Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slider 1: Workload Metric */}
        <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="savings-unit-slider" className="font-semibold text-white/80">
              Your Team Size / Workload
            </label>
            <span className="font-mono text-cyan-300 font-bold text-sm">
              {units.toLocaleString()} {model.unitName}
            </span>
          </div>

          <input
            id="savings-unit-slider"
            type="range"
            min={model.minUnits}
            max={model.maxUnits}
            step={model.step}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-white/10 h-2 rounded-lg cursor-pointer transition-all"
          />

          <div className="flex justify-between text-[11px] text-white/40 font-mono">
            <span>{model.minUnits}</span>
            <span>Based on standard {model.saasPricingTier}</span>
            <span>{model.maxUnits}+</span>
          </div>
        </div>

        {/* Selector 2: Cloud Infrastructure Provider */}
        <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/80">Self-Hosted Server Provider</span>
            <span className="font-mono text-xs text-white/50">{model.vpsSpec}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
              const p = PROVIDERS[key];
              const isSelected = provider === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProvider(key)}
                  className={`rounded-xl border px-2 py-2 text-center text-xs font-medium transition ${
                    isSelected
                      ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-200 shadow-sm shadow-cyan-500/20"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {p.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-white/40 leading-relaxed">
            Includes estimated ${model.backupCostMonthly}/mo for offsite encrypted S3/B2 backups.
          </p>
        </div>
      </div>

      {/* Results Comparison Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Commercial SaaS Cost */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-4 text-left">
          <p className="text-xs uppercase tracking-wider text-rose-300/80 font-semibold">
            {model.saasName} SaaS Bill
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl md:text-3xl font-bold text-rose-200">
              ${saasMonthlyTotal.toLocaleString()}
            </span>
            <span className="text-xs text-rose-300/60 font-mono">/month</span>
          </div>
          <p className="mt-2 text-xs text-white/50">
            ${saasAnnual.toLocaleString()} / year (Recurring)
          </p>
          <span className="mt-3 inline-block rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300">
            {model.saasPricingTier}
          </span>
        </div>

        {/* Self-Hosted Cost */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-4 text-left">
          <p className="text-xs uppercase tracking-wider text-cyan-300/80 font-semibold">
            Self-Hosted Infrastructure
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl md:text-3xl font-bold text-cyan-200">
              ${selfHostedMonthlyTotal.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-300/60 font-mono">/month</span>
          </div>
          <p className="mt-2 text-xs text-white/50">
            ${selfHostedAnnual.toLocaleString()} / year ({currentProviderInfo.name} VPS)
          </p>
          <span className="mt-3 inline-block rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300">
            {model.openSourceAlternative}
          </span>
        </div>

        {/* Net Savings Highlight */}
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-4 text-left shadow-lg shadow-emerald-500/10">
          <p className="text-xs uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Estimated Net Savings
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl md:text-3xl font-bold text-emerald-300">
              ${netAnnualSavings.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-300/80 font-mono">/year</span>
          </div>
          <p className="mt-2 text-xs text-emerald-200/80 font-semibold">
            {savingsPercent}% lower recurring cost
          </p>
          <span className="mt-3 inline-block rounded-md border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
            Unlimited Users • No Per-Seat Tax
          </span>
        </div>
      </div>

      {/* Sourced Methodology Disclosure (Collapsible Drawer) */}
      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => setShowSources(!showSources)}
          className="flex w-full items-center justify-between text-xs text-white/60 hover:text-white transition py-1"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span>How we calculate this (View official sources & documentation)</span>
          </span>
          {showSources ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {showSources && (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-white/70 leading-relaxed animate-in fade-in duration-200">
            <div>
              <span className="font-semibold text-white">Calculation Breakdown: </span>
              <span>{model.methodology}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5 text-[11px]">
              <a
                href={model.saasPricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
              >
                <span>Official {model.saasName} Pricing Page</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <span className="text-white/20">•</span>

              <a
                href={currentProviderInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
              >
                <span>{currentProviderInfo.name} Droplet/VPS Pricing</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <p className="text-[11px] text-white/40 italic pt-1">
              Note: Self-hosting requires initial setup and basic OS security maintenance. Hardware requirements are based on production benchmarks for running Docker containers with SQLite/PostgreSQL on moderate loads.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
