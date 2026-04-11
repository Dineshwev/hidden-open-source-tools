import FileCard from "@/components/FileCard";
import SectionHeading from "@/components/SectionHeading";

const trendingDownloads = [
  {
    title: "Neon SaaS Wireframes",
    description: "High-conversion web and mobile wireframes verified by moderators.",
    category: "Templates",
    status: "Epic",
    hint: "Contains: landing page sections + mobile flows",
    previewLabel: "UI Signal"
  },
  {
    title: "Prompt Engineer Vault",
    description: "A curated set of AI prompts for creators, marketers, and indie builders.",
    category: "AI prompts",
    status: "Rare",
    hint: "Contains: role prompts + conversion scripts",
    mystery: true,
    previewLabel: "Cipher Pack"
  },
  {
    title: "Low Poly Planet Pack",
    description: "3D objects and materials designed for game prototypes and scene kits.",
    category: "3D models",
    status: "Legendary",
    hint: "Contains: 3D textures + planetary materials",
    mystery: true,
    previewLabel: "Nebula Mesh"
  }
];

export default function TrendingDownloads() {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Trending downloads"
        title="Community-approved drops rising across the universe"
        description="These assets represent the kinds of verified files the mystery engine can surface based on rarity, freshness, and community demand."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {trendingDownloads.map((file) => (
          <FileCard key={file.title} {...file} />
        ))}
      </div>
    </section>
  );
}
