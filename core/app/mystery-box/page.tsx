import type { Metadata } from "next";
import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";
import AdBanner from "@/components/AdBanner";
import AdNativeBanner from "@/components/AdNativeBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Hidden Tools and Mystery Developer Resources",
  description:
    "Explore hidden tools and surprise developer resources through The Cloud Rain Mystery Box. Discover curated open source and premium-quality free tools.",
  keywords: ["hidden tools", "mystery developer tools", "surprise software", "developer resource drops"],
  alternates: {
    canonical: "/mystery-box"
  },
  openGraph: {
    title: "Hidden Tools and Mystery Developer Resources",
    description:
      "Unlock hidden tools and curated developer resources through an interactive mystery box experience.",
    url: `${siteUrl}/mystery-box`
  }
};

export default function MysteryBoxPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Randomized reward flow"
        title="Mystery Box"
        description={
          <span className="block">
            Open your free daily mystery box and discover hidden open-source tools and resources.
            <span className="ml-2 font-medium text-green-400">
              Always free. No subscription needed.
            </span>
          </span>
        }
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Core Mystery Box Section */}
        <MysteryBox />

        {/* Sponsor Section After Primary Experience */}
        <div className="mt-20 space-y-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Sponsored</p>
            <h3 className="text-xl font-display text-white/80 uppercase tracking-widest">Platform Supporters</h3>
            <p className="text-sm text-white/50">Sponsor placements appear after the unlock experience to keep the main flow focused.</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="glass-panel p-4 rounded-3xl border-white/10">
              <AdNativeBanner />
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col items-center gap-4">
                <AdBanner
                  title="Premium Resource Sponsor"
                  description="Optional sponsor shown after core content delivery."
                  width={320}
                  height={50}
                  className="mx-auto max-w-[320px] md:hidden"
                />
                <AdBanner
                  title="Premium Resource Sponsor"
                  description="Optional sponsor shown after core content delivery."
                  width={468}
                  height={60}
                  className="mx-auto hidden max-w-[468px] md:flex"
                />
                <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.2em]">Verified Sponsor Unit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


