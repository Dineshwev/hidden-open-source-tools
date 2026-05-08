import Link from "next/link";
import { ArrowRight, BadgeCheck, PlayCircle, Shield, Sparkles } from "lucide-react";
import StatGrid from "@/components/StatGrid";
import TrendingDownloads from "@/components/TrendingDownloads";

const mobileSteps = [
  {
    icon: <PlayCircle className="h-4 w-4" />,
    title: "Start randomized discovery",
    text: "Open the Mystery Box experience to surface the next curated file."
  },
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Pass verification",
    text: "The discovery flow still protects the platform from abuse."
  },
  {
    icon: <BadgeCheck className="h-4 w-4" />,
    title: "Download instantly",
    text: "Approved files stay fast and simple on smaller screens."
  }
];

export default function HomeMobileLanding() {
  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(7,7,7,0.98))] px-5 py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/65">
            OPEN SOURCE | SELF-HOSTED
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-white">
              Open-source tools built for
              <span className="text-gradient-magic"> practical workflows</span>
            </h1>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                No-Cost
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                Open Source
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                Self-Hosted
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                No Login
              </span>
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              The Cloud Rain helps developers evaluate curated resources and keep moving smoothly through the site.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/mystery-box" className="btn-premium inline-flex items-center justify-center gap-2 text-sm">
              Try Random Tool Finder <Sparkles className="h-4 w-4" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Become a Contributor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {mobileSteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  {step.icon}
                  {step.title}
                </div>
                <p className="mt-2 text-sm text-white/65">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[1.8rem] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Global Activity</p>
        <h2 className="mt-3 font-display text-2xl text-white">Live System Snapshot</h2>
        <div className="mt-5">
          <StatGrid />
        </div>
      </section>

      <TrendingDownloads />

      <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-nebula-500/10 blur-3xl" />
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Ready For The Next Tool</p>
        <h2 className="mt-3 font-display text-3xl text-white">Discover practical developer resources</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Join developers and designers using The Cloud Rain to evaluate open-source resources for real workflows.
        </p>
        <Link href="/mystery-box" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-black shadow-xl">
          Try Random Tool Finder <Sparkles className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
