import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";
import AdSmartlinkSlot from "@/components/AdSmartlinkSlot";
import AdBanner from "@/components/AdBanner";
import AdNativeBanner from "@/components/AdNativeBanner";

export default function MysteryBoxPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Randomized reward flow"
        title="Mystery Box"
        description="This experience uses a rewarded sponsor step, rarity weighting, duplicate avoidance, and a reveal moment that feels premium without being pushy."
      />

      <AdSmartlinkSlot
        title="Optional Sponsor Booster"
        description="Choose any partner offer you actually want to see before the box opens."
        cta="Open Offer"
        compact
      />

      <AdNativeBanner />

      <div className="space-y-4">
        <AdBanner
          title="Mystery Box Companion Banner"
          description="A second sponsor placement that sits beside the mystery flow instead of blocking it."
          width={320}
          height={50}
          className="mx-auto max-w-[320px] md:hidden"
        />
        <AdBanner
          title="Mystery Box Companion Banner"
          description="A second sponsor placement that sits beside the mystery flow instead of blocking it."
          width={468}
          height={60}
          className="mx-auto hidden max-w-[468px] md:flex"
        />
      </div>

      <div className="mx-auto hidden w-full max-w-[160px] lg:block">
        <AdBanner
          width={160}
          height={600}
          className="max-w-[160px]"
        />
      </div>

      <MysteryBox />

      <AdSmartlinkSlot
        title="More Partner Options"
        description="Extra sponsor placements live here for users who want another choice after the main mystery action."
        cta="See Another Offer"
      />
    </div>
  );
}
