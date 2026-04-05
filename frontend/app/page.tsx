import Link from "next/link";
import { ArrowRight, BadgeCheck, PlayCircle, Shield, TimerReset, Sparkles } from "lucide-react";
import StatGrid from "@/components/StatGrid";
import StatsTicker from "@/components/StatsTicker";
import TrendingDownloads from "@/components/TrendingDownloads";
import TopContributors from "@/components/TopContributors";
import SpaceBackground from "@/components/SpaceBackground";
import AdSmartlinkSlot from "@/components/AdSmartlinkSlot";
import AdBanner from "@/components/AdBanner";

export default function HomePage() {
  return (
    <>
      <SpaceBackground className="opacity-70" />
      <div className="relative z-10 space-y-24 pb-20">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-grid-cyber px-5 py-14 md:px-10 md:py-16 lg:px-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
          <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-blue-300/20 blur-[100px]" />

          <div className="relative grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-100">
                Sponsored Access Platform
              </div>

              <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
                Professional asset downloads powered by
                <span className="text-gradient-magic"> watch-ads unlocks</span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-white/75">
                The Cloud Rain helps users unlock premium files without subscriptions. Watch a short sponsor ad, pass the gate, and download instantly from a curated and moderated resource vault.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/mystery-box" className="btn-premium inline-flex items-center gap-2 text-sm md:text-base">
                  Open Mystery Box <Sparkles className="h-4 w-4" />
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/45 hover:bg-white/10"
                >
                  Become a Contributor <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">24/7</p>
                  Active unlock flow
                </div>
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">Instant</p>
                  Post-ad gated download
                </div>
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">Verified</p>
                  Human moderated resources
                </div>
              </div>
            </div>

            <aside className="glass-panel depth-stage rounded-[1.6rem] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">Unlock Journey</p>
              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: <PlayCircle className="h-5 w-5" />,
                    title: "Watch sponsor ad",
                    text: "Users complete one short ad task to activate secure download access."
                  },
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Pass gate verification",
                    text: "Each unlock is tracked to prevent abuse and keep traffic quality high."
                  },
                  {
                    icon: <BadgeCheck className="h-5 w-5" />,
                    title: "Download premium file",
                    text: "Approved assets are delivered instantly with clear category and rarity tags."
                  }
                ].map((step) => (
                  <article key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                      {step.icon}
                      {step.title}
                    </div>
                    <p className="text-sm text-white/65">{step.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-orange-200/20 bg-orange-200/10 p-4 text-sm text-orange-50/90">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <TimerReset className="h-4 w-4" /> Daily mystery reset
                </p>
                <p className="mt-2 text-orange-50/80">Return every day to unlock limited drops and maintain your streak bonus.</p>
              </div>
            </aside>
          </div>
        </section>

        <AdSmartlinkSlot
          title="Creator Deals You Might Like"
          description="Short sponsor sessions unlock premium downloads and keep this platform free."
          cta="Visit Sponsored Offer"
          compact
        />

        <AdBanner
          width={468}
          height={60}
          className="mx-auto max-w-[468px]"
        />

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Why users stay longer</p>
              <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Designed for repeat sessions and trust</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "No Subscription Fatigue",
                desc: "Users unlock content through ads instead of recurring payments, reducing friction for return visits."
              },
              {
                title: "Clear Progress Loops",
                desc: "Daily resets, rarity labels, and contributor reputation create momentum and longer exploration sessions."
              },
              {
                title: "Professional Trust Layer",
                desc: "Moderation and verification signals help users feel safe before they spend time on unlock actions."
              }
            ].map((feature) => (
              <article key={feature.title} className="glass-card depth-panel rounded-3xl p-7">
                <h3 className="font-display text-2xl text-white">{feature.title}</h3>
                <p className="mt-3 text-white/65">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel depth-stage rounded-[2rem] p-6 md:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Performance Snapshot</p>
              <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Built for conversion and quality traffic</h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/85 transition hover:border-cyan-300/45"
            >
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <StatGrid />
        </section>

        <StatsTicker />

        <AdBanner
          width={300}
          height={250}
          className="mx-auto max-w-[300px]"
        />

        <AdSmartlinkSlot
          title="Limited Partner Promotion"
          description="Support the platform by checking this partner offer and unlock more mystery rewards."
          cta="Open Partner Deal"
        />

        <div className="space-y-24">
          <TrendingDownloads />
          <TopContributors />
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#112741] via-[#14304f] to-[#1f3c58] p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">Ready To Scale Engagement</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">Launch your next unlock session in under 30 seconds</h2>
            <p className="mt-4 text-white/70">
              Explore trending drops, watch one short ad, and get instant access to moderated digital resources tailored for creators.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/mystery-box" className="btn-premium inline-flex items-center gap-2 text-sm md:text-base">
                Start Unlock Flow <Sparkles className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

