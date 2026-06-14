import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import AlternativesListingClient from "./AlternativesListingClient";
export const revalidate = 86400;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "Open Source Alternatives to Popular SaaS | The Cloud Rain",
  description: "Find free, self-hostable alternatives to Figma, Linear, Datadog, Loom, and 50+ popular SaaS tools. Curated for developers.",
  keywords: ["open source alternatives", "saas alternatives", "self-hosted alternatives", "free software alternatives"],
  alternates: { canonical: `${siteUrl}/alternatives` },
  openGraph: {
    title: "Best Open Source Alternatives to Popular SaaS | The Cloud Rain",
    description: "Find the best free, open source alternatives to popular SaaS tools.",
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

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <section>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Open Source Alternatives</p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">Ditch the SaaS Tax</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Free, open source alternatives to the tools you pay for every month. Self-hostable, privacy-first, no vendor lock-in.
        </p>
      </section>
      <AlternativesListingClient alternatives={alternatives} />
    </div>
  );
}
