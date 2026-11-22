"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Compass } from "lucide-react";
import { VERIFIED_DOCKER_SPECS } from "@/lib/docker-specs";

export type QuadrantToolInput = {
  name: string;
  slug: string;
  tagline: string;
  best_for: string;
  license: string;
  similarity_score: number;
  href: string;
  isInternal: boolean;
};

type PlottedPoint = QuadrantToolInput & {
  simplicity: number; // 0-100 (higher = easier setup)
  parity: number;     // 0-100 (similarity_score)
  x: number;          // SVG x (0-400)
  y: number;          // SVG y (0-240)
};

function computeSimplicityScore(tool: QuadrantToolInput, index: number): number {
  const slugLower = String(tool.slug || "").toLowerCase().trim();
  const spec = VERIFIED_DOCKER_SPECS[slugLower];
  const text = `${tool.tagline || ""} ${tool.best_for || ""}`.toLowerCase();

  let score = 56;

  if (spec) {
    const hasExternalDb = Boolean(
      spec.environment &&
        Object.keys(spec.environment).some((k) => /DATABASE|POSTGRES|MYSQL|MONGO|REDIS/i.test(k))
    );
    score = hasExternalDb ? 60 : 80;
  }

  if (/(lightweight|single|sqlite|simple|minimal|fast|instant|browser|static|drop-in)/.test(text)) {
    score += 12;
  }
  if (/(enterprise|kubernetes|cluster|clickhouse|erp|full-featured|heavy|large team|complex)/.test(text)) {
    score -= 18;
  }

  // Deterministic subtle spread to prevent exact vertical stacking
  const hashOffset = ((index * 11) % 13) - 6;
  return Math.max(18, Math.min(88, score + hashOffset));
}

export default function DecisionQuadrantChart({
  saasName,
  tools,
}: {
  saasName: string;
  tools: QuadrantToolInput[];
}) {
  const points = useMemo<PlottedPoint[]>(() => {
    const W = 400;
    const H = 240;
    const PAD_X = 36;
    const PAD_Y = 28;

    const raw: PlottedPoint[] = tools.slice(0, 7).map((tool, idx) => {
      const simplicity = computeSimplicityScore(tool, idx);
      const parity = Math.max(45, Math.min(99, Number(tool.similarity_score) || 75));

      // Map simplicity [15..95] -> X [PAD_X .. W-PAD_X]
      const xNorm = (simplicity - 15) / 80;
      // Map parity [45..100] -> Y [H-PAD_Y .. PAD_Y] (higher parity = higher up)
      const yNorm = (parity - 45) / 55;

      return {
        ...tool,
        simplicity,
        parity,
        x: Math.round(PAD_X + Math.max(0, Math.min(1, xNorm)) * (W - PAD_X * 2)),
        y: Math.round(H - PAD_Y - Math.max(0, Math.min(1, yNorm)) * (H - PAD_Y * 2)),
      };
    });

    // Gentle collision avoidance so labels/dots never sit on top of each other
    for (let i = 0; i < raw.length; i++) {
      for (let j = i + 1; j < raw.length; j++) {
        const dx = raw[j].x - raw[i].x;
        const dy = raw[j].y - raw[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 28) {
          const shiftX = dx >= 0 ? 16 : -16;
          const shiftY = dy >= 0 ? 12 : -12;
          raw[j].x = Math.max(PAD_X, Math.min(W - PAD_X, raw[j].x + shiftX));
          raw[j].y = Math.max(PAD_Y, Math.min(H - PAD_Y, raw[j].y + shiftY));
        }
      }
    }

    return raw;
  }, [tools]);

  const [selectedSlug, setSelectedSlug] = useState<string>(points[0]?.slug || "");

  if (points.length < 2) return null;

  const active = points.find((p) => p.slug === selectedSlug) || points[0];

  const quadrantTag = (p: PlottedPoint) => {
    const highParity = p.parity >= 75;
    const easySetup = p.simplicity >= 55;
    if (highParity && easySetup) return "Best Overall (Easy + High Parity)";
    if (highParity && !easySetup) return "Enterprise / Deep Stack";
    if (!highParity && easySetup) return "Lightweight & Quick Setup";
    return "Specialized / Custom Fit";
  };

  return (
    <section
      aria-label={`${saasName} alternatives decision quadrant chart`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            <Compass className="h-3.5 w-3.5" />
            <span>Interactive Decision Map</span>
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            {saasName} Alternatives: Setup Simplicity vs Feature Parity
          </h2>
        </div>
        <span className="text-[11px] text-white/45">
          Hover or click a point to compare
        </span>
      </div>

      {/* Pure-Black SVG Quadrant Plot */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-black p-3 sm:p-5">
        <div className="relative w-full">
          <svg
            viewBox="0 0 400 240"
            className="h-auto w-full select-none"
            role="img"
            aria-label={`2 by 2 quadrant plotting open-source alternatives to ${saasName}`}
          >
            {/* Outer Plot Frame */}
            <rect
              x="24"
              y="16"
              width="352"
              height="200"
              rx="10"
              fill="#000000"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />

            {/* Top-Right Highlight Tint (Sweet Spot) */}
            <rect
              x="200"
              y="16"
              width="176"
              height="100"
              fill="rgba(34,211,238,0.035)"
            />

            {/* Quadrant Crosshairs */}
            <line
              x1="200"
              y1="16"
              x2="200"
              y2="216"
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
            />
            <line
              x1="24"
              y1="116"
              x2="376"
              y2="116"
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
            />

            {/* Quadrant Corner Labels */}
            <text x="32" y="30" fill="rgba(255,255,255,0.38)" fontSize="7.5" fontWeight="600">
              DEEP / ENTERPRISE STACK
            </text>
            <text
              x="368"
              y="30"
              textAnchor="end"
              fill="rgba(34,211,238,0.75)"
              fontSize="7.5"
              fontWeight="600"
            >
              ★ QUICK &amp; HIGH PARITY
            </text>
            <text x="32" y="208" fill="rgba(255,255,255,0.32)" fontSize="7.5" fontWeight="600">
              SPECIALIZED / CUSTOM
            </text>
            <text
              x="368"
              y="208"
              textAnchor="end"
              fill="rgba(52,211,153,0.65)"
              fontSize="7.5"
              fontWeight="600"
            >
              LIGHTWEIGHT CORE
            </text>

            {/* Axis Titles */}
            <text
              x="200"
              y="233"
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="8"
              letterSpacing="0.08em"
            >
              SETUP SIMPLICITY (COMPLEX STACK → 5-MIN DOCKER) →
            </text>
            <text
              x="12"
              y="116"
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="8"
              letterSpacing="0.08em"
              transform="rotate(-90 12 116)"
            >
              FEATURE PARITY →
            </text>

            {/* Interactive Tool Points */}
            {points.map((pt) => {
              const isSelected = pt.slug === active.slug;
              const alignLeft = pt.x > 290;
              const labelX = alignLeft ? pt.x - 10 : pt.x + 10;

              return (
                <g
                  key={pt.slug || pt.name}
                  className="cursor-pointer"
                  onClick={() => setSelectedSlug(pt.slug)}
                  onMouseEnter={() => setSelectedSlug(pt.slug)}
                >
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="11"
                      fill="rgba(34,211,238,0.18)"
                      stroke="rgba(34,211,238,0.65)"
                      strokeWidth="1"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? "5.5" : "4.2"}
                    fill={isSelected ? "#22d3ee" : "#34d399"}
                    stroke="#000000"
                    strokeWidth="1.5"
                  />
                  <text
                    x={labelX}
                    y={pt.y + 3}
                    textAnchor={alignLeft ? "end" : "start"}
                    fill={isSelected ? "#ffffff" : "rgba(255,255,255,0.72)"}
                    fontSize={isSelected ? "9.5" : "8.5"}
                    fontWeight={isSelected ? "700" : "500"}
                  >
                    {pt.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Mobile/Desktop Quick Pill Selector */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
          {points.map((pt) => {
            const isSelected = pt.slug === active.slug;
            return (
              <button
                key={pt.slug || pt.name}
                type="button"
                onClick={() => setSelectedSlug(pt.slug)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "border border-cyan-400/50 bg-cyan-400/15 font-semibold text-cyan-200"
                    : "border border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25 hover:text-white"
                }`}
              >
                {pt.name} ({pt.parity}%)
              </button>
            );
          })}
        </div>

        {/* Selected Tool Inspector Strip */}
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-base font-bold text-white">{active.name}</p>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                {active.parity}% parity
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                {quadrantTag(active)}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
              {active.best_for || active.tagline}
            </p>
            <p className="mt-1 text-[11px] font-mono text-white/45">
              License: {active.license || "Open Source"}
            </p>
          </div>

          <Link
            href={active.href}
            target={active.isInternal ? undefined : "_blank"}
            rel={active.isInternal ? undefined : "noopener noreferrer"}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <span>{active.isInternal ? `Inspect ${active.name}` : `Visit ${active.name}`}</span>
            {active.isInternal ? (
              <ArrowRight className="h-3.5 w-3.5" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
