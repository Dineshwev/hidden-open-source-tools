import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import VSListingClient from "./VSListingClient";

export const revalidate = 86400;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "Tool Comparisons | Open Source vs SaaS | The Cloud Rain",
  description: "Compare open-source tools side by side. Gitea vs GitHub, Meilisearch vs Algolia, and 20+ more comparisons for developers choosing their stack.",
  keywords: ["tool comparison", "open source vs saas", "gitea vs github", "self-hosted alternatives comparison"],
  alternates: { canonical: `${siteUrl}/vs` },
  openGraph: {
    title: "Open Source Tool Comparisons | The Cloud Rain",
    description: "Detailed comparisons of open source tools vs popular SaaS alternatives.",
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

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <section>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Tool Comparisons</p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">Open Source vs SaaS</h1>
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