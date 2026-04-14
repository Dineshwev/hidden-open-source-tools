import type { Metadata } from "next";
import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

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

      </div>
    </div>
  );
}


