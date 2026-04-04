import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";
import StatGrid from "@/components/StatGrid";
import StatsTicker from "@/components/StatsTicker";
import TrendingDownloads from "@/components/TrendingDownloads";
import TopContributors from "@/components/TopContributors";
import SpaceBackground from "@/components/SpaceBackground";

// Lazy-load heavy 3D components so they don't block initial page render
const HeroScene = dynamic(() => import("@/components/HeroScene"), { 
  ssr: false, 
  loading: () => <div className="animate-pulse bg-white/5 rounded-full w-[400px] h-[400px]" />
});
const AnimatedStars = dynamic(() => import("@/components/AnimatedStars"), { ssr: false });

export default function HomePage() {
  return (
    <>
      <SpaceBackground />
      <div className="space-y-32 relative z-10 pb-20">
        
        {/* PREMIUM HERO SECTION */}
        <section className="relative pt-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nebula-500/20 rounded-full blur-[120px] opacity-50 point-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aurora/10 rounded-full blur-[100px] opacity-40 point-events-none" />
          
          <div className="relative grid items-center gap-16 lg:grid-cols-[1fr_1fr] max-w-7xl mx-auto px-4">
            
            <div className="space-y-8 relative z-20">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-aurora/30 bg-aurora/10 backdrop-blur-md shadow-[0_0_20px_rgba(115,240,196,0.15)]">
                <span className="flex h-2 w-2 rounded-full bg-aurora animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-aurora">Next-Gen Creator Economy</span>
              </div>
              
              <h1 className="font-display text-6xl md:text-7xl font-extrabold leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-[#e2e8f0] to-nebula-400 drop-shadow-2xl">
                Unlock the <br /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-aurora via-nebula-400 to-ember animate-pulse">Mystery</span> of Web3.
              </h1>
              
              <p className="text-xl leading-relaxed text-white/70 max-w-xl font-light">
                Discover exclusive premium assets. Bypass paywalls with our sponsored unlock system. Turn ad-views into high-end resources.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <Link
                  href="/mystery-box"
                  className="relative group overflow-hidden rounded-2xl bg-white text-void px-8 py-4 font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-aurora to-nebula-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
                    Open Mystery Box <Sparkles className="w-5 h-5" />
                  </span>
                </Link>
                
                <Link
                  href="/upload"
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl text-white font-semibold hover:bg-white/10 transition-all hover:border-aurora/50"
                >
                  Contribute Code
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform text-aurora" />
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8 border-t border-white/10 flex items-center gap-8 opacity-60">
                <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> Safe</div>
                <div className="flex items-center gap-2"><Zap className="w-5 h-5" /> Instant</div>
                <div className="flex items-center gap-2"><Globe className="w-5 h-5" /> Global</div>
              </div>
            </div>

            <div className="relative z-10 h-[600px] w-full flex items-center justify-center">
               <HeroScene />
            </div>
            
          </div>
        </section>

        {/* HIGH-END FEATURE CARDS */}
        <section className="relative px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Zero Subscriptions", desc: "Premium content gated by our sponsor network, not your credit card.", color: "from-aurora to-emerald-500" },
              { title: "Verified Loot", desc: "Every download is securely hashed, validated, and ranked by the community.", color: "from-nebula-400 to-blue-600" },
              { title: "Creator Rewards", desc: "Uploads that trend earn XP, platform streaks, and dashboard dominance.", color: "from-ember to-rose-500" }
            ].map((feature, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[2.5rem] p-[1px] transition-all hover:scale-[1.02]">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative h-full flex flex-col justify-end p-8 bg-[#07111f]/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/5">
                  <div className={`w-12 h-12 mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]`}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* METRICS & DISCOVERY */}
        <div className="bg-black/40 backdrop-blur-2xl border-y border-white/5 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <StatGrid />
        </div>
        
        <StatsTicker />
        
        <div className="max-w-7xl mx-auto px-4 space-y-32">
          <TrendingDownloads />
          <TopContributors />
        </div>
        
      </div>
    </>
  );
}

