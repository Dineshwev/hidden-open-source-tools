"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingDown,
  Server,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import DockerStackModal from "@/components/tools/DockerStackModal";
import { StackToolItem } from "@/lib/docker-stack";

interface SaaSOption {
  id: string;
  name: string;
  category: string;
  monthlyPerUser: number;
  flatMonthly?: number;
  osAlternative: {
    name: string;
    slug: string;
  };
  icon: string;
}

const SAAS_OPTIONS: SaaSOption[] = [
  {
    id: "airtable",
    name: "Airtable",
    category: "Databases & Spreadsheets",
    monthlyPerUser: 20,
    osAlternative: { name: "NocoDB", slug: "nocodb" },
    icon: "🗃️",
  },
  {
    id: "jira",
    name: "Jira",
    category: "Project & Issue Tracking",
    monthlyPerUser: 16,
    osAlternative: { name: "OpenProject", slug: "openproject" },
    icon: "📋",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Workflow Automation",
    monthlyPerUser: 0,
    flatMonthly: 30,
    osAlternative: { name: "n8n", slug: "n8n" },
    icon: "⚡",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Team Wiki & Docs",
    monthlyPerUser: 10,
    osAlternative: { name: "AppFlowy", slug: "appflowy" },
    icon: "📝",
  },
  {
    id: "1password",
    name: "1Password",
    category: "Password Manager",
    monthlyPerUser: 8,
    osAlternative: { name: "Vaultwarden", slug: "vaultwarden" },
    icon: "🔐",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Team Messaging",
    monthlyPerUser: 12.5,
    osAlternative: { name: "Mattermost", slug: "mattermost" },
    icon: "💬",
  },
  {
    id: "analytics",
    name: "Google Analytics / Mixpanel",
    category: "Web Analytics",
    monthlyPerUser: 0,
    flatMonthly: 25,
    osAlternative: { name: "Umami", slug: "umami" },
    icon: "📊",
  },
  {
    id: "datadog",
    name: "Datadog / New Relic",
    category: "Infrastructure Monitoring",
    monthlyPerUser: 0,
    flatMonthly: 50,
    osAlternative: { name: "Beszel", slug: "beszel" },
    icon: "📈",
  },
  {
    id: "heroku",
    name: "Heroku / Vercel Pro",
    category: "Application PaaS",
    monthlyPerUser: 0,
    flatMonthly: 40,
    osAlternative: { name: "Coolify", slug: "coolify" },
    icon: "🚀",
  },
];

export default function SaaSTaxCalculator() {
  const [selectedSaasIds, setSelectedSaasIds] = useState<string[]>([
    "airtable",
    "zapier",
    "1password",
    "analytics",
  ]);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [vpsCost, setVpsCost] = useState<number>(5); // $5/mo VPS
  const [isComposeModalOpen, setIsComposeModalOpen] = useState<boolean>(false);

  const toggleSaas = (id: string) => {
    setSelectedSaasIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const { annualSaasCost, annualVpsCost, annualSavings, savingsPercent, matchedOsTools } =
    useMemo(() => {
      let monthlyTotal = 0;
      const toolsToRun: StackToolItem[] = [];

      for (const id of selectedSaasIds) {
        const option = SAAS_OPTIONS.find((s) => s.id === id);
        if (!option) continue;

        if (option.monthlyPerUser > 0) {
          monthlyTotal += option.monthlyPerUser * teamSize;
        }
        if (option.flatMonthly) {
          monthlyTotal += option.flatMonthly;
        }

        toolsToRun.push({
          name: option.osAlternative.name,
          slug: option.osAlternative.slug,
        });
      }

      const annualSaas = Math.round(monthlyTotal * 12);
      const annualVps = Math.round(vpsCost * 12);
      const savings = Math.max(0, annualSaas - annualVps);
      const percent = annualSaas > 0 ? Math.round((savings / annualSaas) * 100) : 0;

      return {
        annualSaasCost: annualSaas,
        annualVpsCost: annualVps,
        annualSavings: savings,
        savingsPercent: percent,
        matchedOsTools: toolsToRun,
      };
    }, [selectedSaasIds, teamSize, vpsCost]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 md:p-10 backdrop-blur-md shadow-2xl shadow-black/50">
      {/* Background subtle ambient effect */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
          <Calculator className="h-3.5 w-3.5 text-white/60" />
          <span>Interactive Calculator</span>
        </div>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Calculate Your &ldquo;SaaS Tax&rdquo; Savings
        </h2>
        <p className="mt-2 text-sm sm:text-base text-white/60 leading-relaxed">
          Proprietary subscriptions quietly tax every user in your company month after month.
          Select what your team uses to see how much you save by self-hosting verified open source.
        </p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: SaaS Picker & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SaaS Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              1. What SaaS are you currently paying for?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAAS_OPTIONS.map((saas) => {
                const isSelected = selectedSaasIds.includes(saas.id);
                return (
                  <button
                    key={saas.id}
                    type="button"
                    onClick={() => toggleSaas(saas.id)}
                    className={`relative flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-white/40 bg-white/10 text-white shadow-md shadow-black/40"
                        : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{saas.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{saas.name}</p>
                        <p className="text-[11px] text-white/45 truncate">
                          {saas.monthlyPerUser > 0
                            ? `$${saas.monthlyPerUser}/user/mo`
                            : `$${saas.flatMonthly}/mo`}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders: Team Size & VPS Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="team-size-slider" className="text-xs font-medium text-white/70">
                  Team Members / Seats
                </label>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-bold text-white">
                  {teamSize} {teamSize === 1 ? "seat" : "seats"}
                </span>
              </div>
              <input
                id="team-size-slider"
                type="range"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/35 mt-1">
                <span>1 (Solo)</span>
                <span>25</span>
                <span>50+</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="vps-cost-slider" className="text-xs font-medium text-white/70">
                  VPS Server Hosting
                </label>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-bold text-white">
                  ${vpsCost}/mo
                </span>
              </div>
              <input
                id="vps-cost-slider"
                type="range"
                min="0"
                max="30"
                step="5"
                value={vpsCost}
                onChange={(e) => setVpsCost(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/35 mt-1">
                <span>$0 (Homelab)</span>
                <span>$5 (Hetzner)</span>
                <span>$30 (High-RAM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: ROI Scorecard & Actions (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-md space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">
              Projected Annual Savings
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
                ${annualSavings.toLocaleString()}
              </span>
              <span className="text-xs text-white/50">/ year saved</span>
            </div>
            {savingsPercent > 0 && (
              <p className="mt-1 text-xs text-white/70 font-medium flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-white/60" />
                <span>{savingsPercent}% reduction in software overhead</span>
              </p>
            )}
          </div>

          {/* Cost Comparison Breakdown */}
          <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Current Commercial SaaS:</span>
              <span className="font-semibold text-white/80">
                ${annualSaasCost.toLocaleString()}/yr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Self-Hosted VPS Cost:</span>
              <span className="font-semibold text-white/60">
                ${annualVpsCost.toLocaleString()}/yr
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold">
              <span className="text-white">Net Cash Retained:</span>
              <span className="text-white font-extrabold">+${annualSavings.toLocaleString()}/yr</span>
            </div>
          </div>

          {/* Matched Open Source Replacements */}
          {matchedOsTools.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/60 mb-2 flex items-center justify-between">
                <span>Your Open-Source Replacement Stack:</span>
                <span className="text-white/80 font-normal">
                  {matchedOsTools.length} {matchedOsTools.length === 1 ? "tool" : "tools"}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchedOsTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>{tool.name}</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Direct Docker Stack CTA */}
          <button
            type="button"
            onClick={() => setIsComposeModalOpen(true)}
            disabled={matchedOsTools.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold px-4 py-3 text-xs sm:text-sm shadow-lg shadow-black/30 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4 text-black" />
            <span>Generate docker-compose.yml For This Stack</span>
          </button>
        </div>
      </div>

      {/* Linked Docker Stack Modal */}
      <DockerStackModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        tools={matchedOsTools}
      />
    </section>
  );
}
