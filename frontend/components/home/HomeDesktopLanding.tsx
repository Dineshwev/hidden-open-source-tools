import Link from "next/link";
import { ArrowRight, BadgeCheck, PlayCircle, Shield, TimerReset, Sparkles } from "lucide-react";
import StatGrid from "@/components/StatGrid";
import StatsTicker from "@/components/StatsTicker";
import TrendingDownloads from "@/components/TrendingDownloads";
import TopContributors from "@/components/TopContributors";
import SpaceBackground from "@/components/SpaceBackground";
import AdBanner from "@/components/AdBanner";
import AdNativeBanner from "@/components/AdNativeBanner";

export default function HomeDesktopLanding() {
  return (
    <>
      <SpaceBackground className="opacity-55" />
      <div className="relative z-10 space-y-24 pb-20">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-grid-cyber px-5 py-14 md:px-10 md:py-16 lg:px-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-white/5 blur-[100px]" />

          <div className="relative grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70">
                Sponsor-Safe Download Platform
              </div>

              <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
                Embedded ads when they work,
                <span className="text-gradient-magic"> sponsor fallbacks when they do not</span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-white/72">
                The Cloud Rain helps users unlock premium files without subscriptions. Banner and native units stay live where possible, and backup sponsor cards keep revenue paths open when a browser blocks ad rendering.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/mystery-box" className="btn-premium inline-flex items-center gap-2 text-sm md:text-base">
                  Open Mystery Box <Sparkles className="h-4 w-4" />
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
                  <p className="font-display text-2xl text-white">Fallback Ready</p>
                  Sponsor card backup
                </div>
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">Verified</p>
                  Human moderated resources
                </div>
              </div>
            </div>

            <aside className="glass-panel depth-stage rounded-[1.6rem] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Unlock Journey</p>
              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: <PlayCircle className="h-5 w-5" />,
                    title: "Try embedded sponsor ad",
                    text: "Users see a standard banner or native slot first when their browser allows it."
                  },
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Fallback when blocked",
                    text: "If rendering fails, a sponsor card keeps the visit monetizable without breaking the page."
                  },
                  {
                    icon: <BadgeCheck className="h-5 w-5" />,
                    title: "Keep downloads moving",
                    text: "Approved assets and smartlink offers continue the flow instead of leaving dead space."
                  }
                ].map((step) => (
                  <article key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      {step.icon}
                      {step.title}
                    </div>
                    <p className="text-sm text-white/65">{step.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <TimerReset className="h-4 w-4" /> Daily mystery reset
                </p>
                <p className="mt-2 text-white/65">Return every day to unlock limited drops and maintain your streak bonus.</p>
              </div>
            </aside>
          </div>
        </section>

        <div className="space-y-4">
          <AdBanner
            title="Featured Creator Tools"
            description="This slot now falls back to a sponsor card automatically when the banner cannot render."
            width={320}
            height={50}
            className="mx-auto max-w-[320px] md:hidden"
          />
          <AdBanner
            title="Featured Creator Tools"
            description="This slot now falls back to a sponsor card automatically when the banner cannot render."
            width={468}
            height={60}
            className="mx-auto hidden max-w-[468px] md:flex"
          />
        </div>

        <AdNativeBanner />

        <div className="space-y-4">
          <AdBanner width={320} height={50} className="mx-auto max-w-[320px] md:hidden" />
          <AdBanner width={468} height={60} className="mx-auto hidden max-w-[468px] md:flex" />
        </div>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Why users stay longer</p>
              <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Designed for blocked and unblocked browsers alike</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "No Dead Inventory",
                desc: "When a banner fails, the section still carries a monetization path through a sponsor fallback."
              },
              {
                title: "Clear Progress Loops",
                desc: "Daily resets, rarity labels, and contributor reputation create momentum and longer exploration sessions."
              },
              {
                title: "Mobile First Choices",
                desc: "The primary homepage now favors smaller screens and only expands into the denser desktop experience when space allows."
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
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Performance Snapshot</p>
              <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Built to keep visits monetizable</h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/85 transition hover:border-white/30"
            >
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <StatGrid />
        </section>

        <StatsTicker />

        <AdBanner width={300} height={250} className="mx-auto max-w-[300px]" />

        <div className="space-y-24">
          <TrendingDownloads />
          <TopContributors />
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Ready To Scale Engagement</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">Launch the next unlock session without depending on one ad format</h2>
            <p className="mt-4 text-white/70">
              Explore trending drops, keep sponsor opportunities visible, and let fallback cards protect revenue when a browser blocks embedded ads.
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
