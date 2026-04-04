import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";
import AdSmartlinkSlot from "@/components/AdSmartlinkSlot";
import AdBanner from "@/components/AdBanner";

export default function MysteryBoxPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Randomized reward flow"
        title="Mystery Box"
        description="This experience is designed around a rewarded ad unlock, rarity weighting, duplicate avoidance, and a reveal moment that feels premium."
      />

      <AdSmartlinkSlot
        title="Sponsored Booster"
        description="Check this partner offer before your next mystery pull to support more free drops."
        cta="Open Sponsor Offer"
        compact
      />

      <AdBanner
        adKey="b50d3eab6429780cb08020245e37a868"
        scriptSrc="https://www.highperformanceformat.com/b50d3eab6429780cb08020245e37a868/invoke.js"
        width={160}
        height={600}
        className="mx-auto max-w-[160px]"
      />

      <MysteryBox />

      <AdSmartlinkSlot
        title="More Partner Offers"
        description="Extra sponsor placements help increase rewards inventory and keep unlock costs at zero for users."
        cta="See Another Offer"
      />
    </div>
  );
}
