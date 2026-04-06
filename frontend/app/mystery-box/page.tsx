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
        description="This experience uses a rewarded sponsor step, rarity weighting, duplicate avoidance, and a reveal moment that feels premium without being pushy."
      />

      <AdSmartlinkSlot
        title="Optional Sponsor Booster"
        description="Choose any partner offer you actually want to see before the box opens."
        cta="Open Offer"
        compact
      />

      <AdBanner
        title="Mystery Box Companion Banner"
        description="A second sponsor placement that sits beside the mystery flow instead of blocking it."
        cta="See Banner"
        href="/dashboard"
        width={728}
        height={90}
        className="mx-auto max-w-[728px]"
      />

      <AdBanner
        width={160}
        height={600}
        className="mx-auto max-w-[160px]"
      />

      <MysteryBox />

      <AdSmartlinkSlot
        title="More Partner Options"
        description="Extra sponsor placements live here for users who want another choice after the main mystery action."
        cta="See Another Offer"
      />
    </div>
  );
}
