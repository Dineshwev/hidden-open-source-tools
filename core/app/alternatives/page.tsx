import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import AlternativesListingClient from "./AlternativesListingClient";
export const revalidate = 3600;
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Best Open-Source SaaS Alternatives (Free & Self-Hosted Directory)",
  description: "Browse 50+ curated open-source alternatives to Notion, Jira, Firebase, Airtable, Google Analytics, Slack, and more. Self-hostable, zero vendor lock-in, and $0 monthly subscriptions.",
  alternates: { canonical: `${siteUrl}/alternatives` },
  openGraph: {
    title: "Best Open-Source SaaS Alternatives | The Cloud Rain",
    description: "Discover verified open-source replacements for expensive proprietary SaaS tools. Complete data ownership and free self-hosting.",
    url: `${siteUrl}/alternatives`,
    siteName: "The Cloud Rain",
    type: "website",
  },
};

type Alternative = {
  id: string;
  saas_name: string;
  saas_slug: string;
  saas_description: string;
  status: string;
};

async function getAlternatives(): Promise<Alternative[]> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("alternatives")
      .select("id, saas_name, saas_slug, saas_description, status")
      .eq("status", "approved")
      .order("saas_name", { ascending: true });
    if (error || !data) return [];
    return data as Alternative[];
  } catch {
    return [];
  }
}

export default async function AlternativesListingPage() {
  const alternatives = await getAlternatives();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/alternatives`,
        url: `${siteUrl}/alternatives`,
        name: "Best Open-Source SaaS Alternatives Directory",
        description: "Curated collection of open-source alternatives to commercial software.",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
      },
      {
        "@type": "ItemList",
        name: "Open-Source SaaS Alternatives Hubs",
        numberOfItems: alternatives.length,
        itemListElement: alternatives.map((alt, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `${alt.saas_name} Alternatives`,
          url: `${siteUrl}/alternatives/${alt.saas_slug}`,
          description: alt.saas_description || `Best open-source alternatives to ${alt.saas_name}`,
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
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 font-semibold">Open Source Alternatives</p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl font-bold">Open-Source SaaS Alternatives</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Discover verified open-source replacements for expensive proprietary SaaS platforms. Review features, GitHub momentum, SPDX licenses, and self-hosting guides before you deploy.
        </p>
      </section>
      <AlternativesListingClient alternatives={alternatives} />
    </div>
  );
}
