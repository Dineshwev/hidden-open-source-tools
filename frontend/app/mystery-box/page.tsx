import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";
import AdBanner from "@/components/AdBanner";
import AdNativeBanner from "@/components/AdNativeBanner";

export default function MysteryBoxPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Randomized reward flow"
        title="Mystery Box"
        description="Experience our premium unlock system. Verified developer resources, rarity-weighted drops, and a smooth reveal experience."
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Core Mystery Box Section */}
        <MysteryBox />

        {/* Professional Sponsor Section Below */}
        <div className="mt-20 space-y-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 md:p-12">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-display text-white/80 uppercase tracking-widest">Platform Supporters</h3>
            <p className="text-sm text-white/40">These sponsors help keep The Cloud Rain free for everyone.</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="glass-panel p-4 rounded-3xl border-white/10">
              <AdNativeBanner />
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col items-center gap-4">
                <AdBanner
                  title="Premium Resource Sponsor"
                  description="Support our contributors by visiting this sponsor."
                  width={320}
                  height={50}
                  className="mx-auto max-w-[320px] md:hidden"
                />
                <AdBanner
                  title="Premium Resource Sponsor"
                  description="Support our contributors by visiting this sponsor."
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
