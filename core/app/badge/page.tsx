import type { Metadata } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { dedupeToolRowsBySlug } from "@/lib/tool-records";
import BadgeGeneratorClient from "./BadgeGeneratorClient";

export const revalidate = 3600;
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Embed GitHub README Badge | The Cloud Rain",
  description:
    "Generate and embed an official 'Featured on The Cloud Rain | ★ Verified Open Source' badge for your open-source GitHub repository and documentation.",
  alternates: {
    canonical: "/badge",
  },
  openGraph: {
    title: "Embed GitHub README Badge | The Cloud Rain",
    description:
      "Showcase verified open-source recognition on your project repository with a lightweight SVG badge.",
    url: `${siteUrl}/badge`,
    type: "website",
  },
};

export default async function BadgePage() {
  const supabase = getAdmin();
  const { data } = await supabase
    .from("open_source_tools")
    .select("name, slug, category, github_stars")
    .eq("status", "approved")
    .order("github_stars", { ascending: false, nullsFirst: false })
    .limit(300);

  const tools = dedupeToolRowsBySlug(data || []).map((t: any) => ({
    name: String(t.name || t.title || "Tool"),
    slug: String(t.slug || ""),
    category: String(t.category || "Open Source"),
    stars: typeof t.github_stars === "number" ? t.github_stars : null,
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Embed GitHub README Badge | The Cloud Rain",
    description:
      "Generate an embeddable verified open-source SVG badge for GitHub repositories.",
    url: `${siteUrl}/badge`,
    isPartOf: {
      "@type": "WebSite",
      name: "The Cloud Rain",
      url: siteUrl,
    },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
          For Open-Source Maintainers & Builders
        </p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          Embed Verified Open-Source Badge
        </h1>
        <p className="max-w-2xl text-base text-white/65 leading-relaxed">
          Add an official dark-mode SVG badge to your project&apos;s GitHub{" "}
          <code className="text-cyan-200 bg-white/5 px-1.5 py-0.5 rounded text-xs">
            README.md
          </code>{" "}
          or documentation to highlight verified licensing and self-hosting support.
        </p>
      </header>

      <BadgeGeneratorClient tools={tools} siteUrl={siteUrl} />
    </div>
  );
}
