import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedStars from "@/components/AnimatedStars";
import HeroScene from "@/components/HeroScene";
import StatGrid from "@/components/StatGrid";
import StatsTicker from "@/components/StatsTicker";
import TrendingDownloads from "@/components/TrendingDownloads";
import TopContributors from "@/components/TopContributors";
import SpaceBackground from "@/components/SpaceBackground";

export default function HomePage() {
  return (
    <>
      <SpaceBackground />
      <div className="space-y-20 relative z-10">
        <section className="depth-stage relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-10 md:px-10 md:py-12">
          <AnimatedStars />
          <div className="hero-ambient absolute inset-0" />
          <div className="hero-grid-flow absolute inset-0 opacity-40" />
          <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-nebula-500/15 blur-3xl animate-vortex-spin" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-ember/10 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-aurora/75 animate-pulse">Creator economy meets discovery</p>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-tight text-white md:text-6xl">
                Portfolio Universe turns every verified community upload into a mystery-powered reward system.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                Unlock templates, prompts, notes, tools, 3D packs, and design resources after ad flows, while contributors grow their reputation through moderated submissions and daily streaks.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/mystery-box"
                  className="group rounded-full bg-gradient-to-r from-nebula-500 via-[#7f96ff] to-ember px-6 py-3 text-sm font-semibold text-white shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] animate-neon-pulse"
                >
                  <span className="relative z-10">Open Mystery Box</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-all blur-sm" />
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 group rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-2 hover:border-white/25 hover:bg-white/10"
                >
                  Submit Your File
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <div className="depth-panel group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 hover:shadow-glow">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Immersive unlocks</p>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    Layered scenes, rarity reveals, and contributor rewards designed to feel tactile instead of flat.
                  </p>
                </div>
                <div className="depth-panel group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 hover:shadow-glow">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Smooth feedback</p>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    Softer hover lift, better glow balance, and a more dimensional layout across the landing page.
                  </p>
                </div>
              </div>
            </div>

            <HeroScene />
          </div>
        </section>

        <StatGrid />
        <StatsTicker />
        <TrendingDownloads />
        <TopContributors />
      </div>
    </>
  );
}

