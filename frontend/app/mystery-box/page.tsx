import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";

export default function MysteryBoxPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Randomized reward flow"
        title="Mystery Box"
        description="This experience is designed around a rewarded ad unlock, rarity weighting, duplicate avoidance, and a reveal moment that feels premium."
      />

      <MysteryBox />
    </div>
  );
}
