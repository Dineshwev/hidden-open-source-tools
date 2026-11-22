"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, RotateCcw, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import type { QuadrantToolInput } from "./DecisionQuadrantChart";
import { VERIFIED_DOCKER_SPECS } from "@/lib/docker-specs";

type PriorityKey = "parity" | "simple" | "license" | "cost";
type TeamKey = "solo" | "startup" | "enterprise";

const PRIORITY_OPTIONS: Array<{ key: PriorityKey; label: string; hint: string }> = [
  { key: "parity", label: "Closest Feature Parity", hint: "Drop-in replacement feel" },
  { key: "simple", label: "Fastest 5-Min Setup", hint: "Minimal DevOps friction" },
  { key: "license", label: "Permissive License", hint: "MIT / Apache-2.0 preferred" },
  { key: "cost", label: "Lowest $5 VPS Cost", hint: "Lightweight RAM footprint" },
];

const TEAM_OPTIONS: Array<{ key: TeamKey; label: string; hint: string }> = [
  { key: "solo", label: "Solo / Indie / Homelab", hint: "1–5 users on a small VPS" },
  { key: "startup", label: "Startup Engineering Team", hint: "5–50 users via Docker" },
  { key: "enterprise", label: "Scale / Enterprise Ops", hint: "50+ users, SSO & governance" },
];

function scoreTool(tool: QuadrantToolInput, priority: PriorityKey, team: TeamKey): number {
  const parity = Number(tool.similarity_score) || 75;
  const slug = String(tool.slug || "").toLowerCase();
  const lic = String(tool.license || "").toUpperCase();
  const text = `${tool.tagline || ""} ${tool.best_for || ""}`.toLowerCase();
  const spec = VERIFIED_DOCKER_SPECS[slug];

  const isPermissive = /MIT|APACHE|BSD|ISC|UNLICENSE/.test(lic);
  const isLightweight =
    Boolean(spec && (!spec.environment || !Object.keys(spec.environment).some((k) => /DATABASE|POSTGRES/i.test(k)))) ||
    /(lightweight|sqlite|single|minimal|fast|browser|simple)/.test(text);
  const isEnterprise = /(enterprise|sso|saml|kubernetes|rbac|compliance|large|team|scale)/.test(text);

  let score = parity * 0.6;

  if (priority === "parity") score += parity * 0.55;
  if (priority === "simple") score += isLightweight ? 32 : 8;
  if (priority === "license") score += isPermissive ? 34 : 6;
  if (priority === "cost") score += isLightweight ? 30 : 12;

  if (team === "solo") score += isLightweight ? 18 : 4;
  if (team === "startup") score += parity * 0.15 + (isLightweight ? 8 : 10);
  if (team === "enterprise") score += isEnterprise ? 24 : parity * 0.15;

  return score;
}

export default function ToolMatcherQuiz({
  saasName,
  tools,
}: {
  saasName: string;
  tools: QuadrantToolInput[];
}) {
  const [priority, setPriority] = useState<PriorityKey | null>(null);
  const [team, setTeam] = useState<TeamKey | null>(null);

  if (!tools || tools.length < 2) return null;

  const ranked =
    priority && team
      ? [...tools].sort((a, b) => scoreTool(b, priority, team) - scoreTool(a, priority, team))
      : [];

  const winner = ranked[0] || null;
  const runnerUp = ranked[1] || null;

  const stepNum = !priority ? 1 : !team ? 2 : 3;

  const reset = () => {
    setPriority(null);
    setTeam(null);
  };

  return (
    <section
      aria-label={`2-click ${saasName} alternative matcher`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2-Click Tool Matcher</span>
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            Not Sure Which {saasName} Alternative Fits Best?
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black px-3 py-1 font-mono text-[11px] text-white/70">
            {stepNum === 3 ? "Match Ready" : `Step ${stepNum} of 2`}
          </span>
          {(priority || team) && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75 transition hover:border-white/30 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Step 1: Priority */}
      {stepNum === 1 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            1. What is your #1 priority for replacing {saasName}?
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPriority(opt.key)}
                className="group rounded-2xl border border-white/10 bg-black/80 p-4 text-left transition hover:border-cyan-400/50 hover:bg-white/[0.04]"
              >
                <p className="text-sm font-semibold text-white group-hover:text-cyan-200 transition">
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-white/50">{opt.hint}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Team Size */}
      {stepNum === 2 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            2. Who is deploying and using it?
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {TEAM_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTeam(opt.key)}
                className="group rounded-2xl border border-white/10 bg-black/80 p-4 text-left transition hover:border-cyan-400/50 hover:bg-white/[0.04]"
              >
                <p className="text-sm font-semibold text-white group-hover:text-cyan-200 transition">
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-white/50">{opt.hint}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Instant Matched Result */}
      {stepNum === 3 && winner && (
        <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-black p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Recommended Match
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-white/70">
                  {winner.license}
                </span>
                <span className="text-xs font-semibold text-cyan-300">
                  {winner.similarity_score}% feature match
                </span>
              </div>

              <h3 className="font-display text-2xl font-bold text-white">
                {winner.name}
              </h3>

              <p className="max-w-xl text-sm leading-relaxed text-white/75">
                {winner.best_for || winner.tagline}
              </p>

              {runnerUp && (
                <p className="pt-1 text-xs text-white/45">
                  Close runner-up:{" "}
                  <Link
                    href={runnerUp.href}
                    target={runnerUp.isInternal ? undefined : "_blank"}
                    rel={runnerUp.isInternal ? undefined : "noopener noreferrer"}
                    className="font-semibold text-white/75 underline underline-offset-2 hover:text-cyan-200"
                  >
                    {runnerUp.name}
                  </Link>{" "}
                  ({runnerUp.similarity_score}% match)
                </p>
              )}
            </div>

            <Link
              href={winner.href}
              target={winner.isInternal ? undefined : "_blank"}
              rel={winner.isInternal ? undefined : "noopener noreferrer"}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <span>{winner.isInternal ? `Open ${winner.name} Specs` : `Visit ${winner.name}`}</span>
              {winner.isInternal ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
