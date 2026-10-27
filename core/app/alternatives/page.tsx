import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import AlternativesListingClient from "./AlternativesListingClient";
export const revalidate = 3600;
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Open-Source Alternatives to SaaS Tools",
  description: "Browse open-source projects listed as alternatives to selected SaaS products. Compare the available project details before choosing an option.",
  alternates: { canonical: `${siteUrl}/alternatives` },
  openGraph: {
    title: "Open-Source Alternatives to SaaS Tools | The Cloud Rain",
    description: "Browse projects listed as alternatives to selected SaaS products and compare their available details.",
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
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">Open-Source Alternatives</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Browse projects listed as alternatives to selected SaaS products. Check each project’s official source for current pricing, hosting, license, and privacy details.
        </p>
      </section>
      <AlternativesListingClient alternatives={alternatives} />
    </div>
  );
}
