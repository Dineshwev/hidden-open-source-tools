import Link from "next/link";
import { ArrowRight, BadgeCheck, PlayCircle, Shield, Sparkles } from "lucide-react";
import StatGrid from "@/components/StatGrid";
import StatsTicker from "@/components/StatsTicker";
import TrendingDownloads from "@/components/TrendingDownloads";
import TopContributors from "@/components/TopContributors";
import SpaceBackground from "@/components/SpaceBackground";

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
                FREE | OPEN SOURCE | SELF-HOSTED
              </div>

              <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
                The Ultimate Hub for
                <span className="text-gradient-magic"> Premium Developer Resources</span>
              </h1>

              <div className="flex flex-wrap gap-3 items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  100% Free Forever
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                  Open Source
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                  Self-Hosted
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                  No Login Required
                </span>
              </div>

              <p className="max-w-2xl text-lg leading-relaxed text-white/72">
                Discover and unlock free developer resources,
                open-source tools, UI kits, and templates.
                Everything is completely free - no subscriptions,
                no hidden fees, no credit card required.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/mystery-box" className="btn-premium inline-flex items-center gap-2 text-sm md:text-base px-8 py-4">
                  Open Mystery Box <Sparkles className="h-4 w-4" />
                </Link>
                <Link
                  href="/free-tools"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Free Tools <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">5,000+</p>
                  Curated Resources
                </div>
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">Daily</p>
                  New Mystery Drops
                </div>
                <div className="glass-panel rounded-2xl p-4 text-sm text-white/70">
                  <p className="font-display text-2xl text-white">Verified</p>
                  Moderated Contents
                </div>
              </div>
            </div>

            <aside className="glass-panel depth-stage rounded-[1.6rem] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Community Activity</p>
              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
                    title: "Legendary Reward Unlocked",
                    text: "A user just unlocked a Premium Next.js Dashboard Template!"
                  },
                  {
                    icon: <Shield className="h-5 w-5 text-blue-400" />,
                    title: "New Tools Verified",
                    text: "15 new AI-powered developer utilities have been added to the library."
                  },
                  {
                    icon: <BadgeCheck className="h-5 w-5 text-green-400" />,
                    title: "Contributor Milestone",
                    text: "Dineshwev reached 500+ successful resource contributions."
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
            </aside>
          </div>
        </section>

        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-nebula-400 font-bold">Trending Assets</p>
            <h2 className="mt-4 font-display text-4xl text-white">Most Downloaded This Week</h2>
            <p className="mt-4 text-white/50">Discover what other developers are using to build the next generation of web applications.</p>
          </div>

          <TrendingDownloads />
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Quality Guaranteed</p>
              <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Why Developers Choose The Cloud Rain</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Zero Subscriptions",
                desc: "Get access to high-value assets securely and without any monthly fees."
              },
              {
                title: "Fast Discovery",
                desc: "Our intelligent search and categorization find the tools you need in seconds, not minutes."
              },
              {
                title: "Safe and Secure",
                desc: "Every resource is manually reviewed by our moderation team to ensure code safety and quality."
              }
            ].map((feature) => (
              <article key={feature.title} className="glass-card depth-panel rounded-3xl p-7 hover:border-nebula-500/30 transition-colors">
                <h3 className="font-display text-2xl text-white group-hover:text-nebula-400 transition-colors">{feature.title}</h3>
                <p className="mt-3 text-white/65">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel depth-stage rounded-[2rem] p-6 md:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Global Network</p>
              <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Real-time Platform Activity</h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/85 transition hover:border-white/30"
            >
              View System Status <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <StatGrid />
        </section>

        <StatsTicker />

        <div className="space-y-24">
          <TopContributors />
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 md:p-12 overflow-hidden relative">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-nebula-500/20 blur-[100px]" />
          <div className="mx-auto max-w-3xl text-center relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Join The Community</p>
            <h2 className="mt-3 font-display text-4xl text-white md:text-6xl">Ready to upgrade your workflow?</h2>
            <p className="mt-6 text-xl text-white/70">
              Start your journey with a daily mystery box unlock and discover the best resources for your next big project.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/mystery-box" className="btn-premium inline-flex items-center gap-2 text-lg px-10 py-5">
                Start Mystery Unlock <Sparkles className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-5 text-sm font-semibold text-white transition hover:bg-white/10"
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
