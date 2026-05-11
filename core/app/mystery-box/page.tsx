import type { Metadata } from "next";
import MysteryBox from "@/components/MysteryBox";
import SectionHeading from "@/components/SectionHeading";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "Random Open Source Tool Discovery for Developer Teams",
  description:
    "Use a randomized discovery flow to find open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives curated by The Cloud Rain.",
  keywords: [
    "random developer tools",
    "open source discovery",
    "lightweight SaaS alternatives"
  ],
  alternates: {
    canonical: "/mystery-box"
  },
  openGraph: {
    title: "Random Open Source Tool Discovery for Developer Teams",
    description:
      "Use a randomized discovery flow to find open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives curated by The Cloud Rain.",
    url: `${siteUrl}/mystery-box`
  }
};

export default function MysteryBoxPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Random Tool Finder"
        title="Randomized discovery for open-source tools"
        description={
          <span className="block">
            Use the Mystery Box experience to surface a curated developer resource without browsing a long directory.
            <span className="ml-2 font-medium text-green-400">
              Built for lightweight tool discovery.
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


