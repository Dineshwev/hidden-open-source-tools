import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import VSListingClient from "./VSListingClient";

export const revalidate = 3600;
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Open Source vs SaaS Tool Comparisons & Benchmarks | The Cloud Rain",
  description: "Side-by-side technical comparisons between top open-source tools and proprietary SaaS. Compare features, self-hosting difficulty, Docker support, and pricing.",
  alternates: { canonical: `${siteUrl}/vs` },
  openGraph: {
    title: "Open Source vs SaaS Tool Comparisons & Benchmarks",
    description: "In-depth head-to-head comparisons of open-source tools versus commercial software. Features, self-hosting, and trade-offs.",
    url: `${siteUrl}/vs`,
    siteName: "The Cloud Rain",
    type: "website",
  },
};

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  status: string;
  created_at: string;
};

async function getComparisons(): Promise<Comparison[]> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("comparisons")
      .select("id, slug, tool_a, tool_b, status, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Comparison[];
  } catch {
    return [];
  }
}

export default async function VSListingPage() {
  const comparisons = await getComparisons();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/vs`,
        url: `${siteUrl}/vs`,
        name: "Open Source vs SaaS Tool Comparisons",
        description: "Side-by-side technical comparisons of open-source projects and proprietary SaaS.",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
      },
      {
        "@type": "ItemList",
        name: "Software Comparisons",
        numberOfItems: comparisons.length,
        itemListElement: comparisons.map((c, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `${c.tool_a} vs ${c.tool_b}`,
          url: `${siteUrl}/vs/${c.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 font-semibold">Tool Comparisons</p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl font-bold">Open Source vs SaaS</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Detailed, honest comparisons between open source tools and their popular paid alternatives.
          Features, pricing, self-hosting difficulty, and a clear verdict — so you can stop researching and start building.
        </p>
      </section>

      <VSListingClient comparisons={comparisons} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Looking for something else?</p>
        <h2 className="mt-2 text-xl text-white">Explore more</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/free-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Browse all tools
          </Link>
          <Link href="/article-museum" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Tool deep dives
          </Link>
          <Link href="/alternatives" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Alternatives directory
          </Link>
        </div>
      </section>
    </div>
  );
}
