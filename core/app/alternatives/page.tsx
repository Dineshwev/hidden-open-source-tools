import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

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
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
          Ditch the SaaS Tax
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Free, open source alternatives to the tools you pay for every month.
          Self-hostable, privacy-first, no vendor lock-in — curated by The Cloud Rain.
        </p>
      </section>

      {alternatives.length === 0 ? (
        <p className="text-sm text-white/40">No alternatives published yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alternatives.map((a) => (
            <Link
              key={a.id}
              href={`/alternatives/${a.saas_slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                {a.saas_description}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white group-hover:text-white transition">
                Alternatives to {a.saas_name}
              </h2>
              <p className="mt-2 text-sm text-white/50 group-hover:text-white/70 transition">
                Best free & open source replacements →
              </p>
            </Link>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore more</p>
        <h2 className="mt-2 text-xl text-white">More ways to discover</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/vs" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Tool comparisons
          </Link>
          <Link href="/free-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Browse all tools
          </Link>
          <Link href="/free-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Random discovery
          </Link>
        </div>
      </section>
    </div>
  );
}
