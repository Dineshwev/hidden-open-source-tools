import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export const revalidate = 86400;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

type AlternativePageProps = {
  params: { slug: string };
};

type AlternativeTool = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  best_for: string;
  github_stars: string;
  license: string;
  similarity_score: number;
};

type AlternativeContent = {
  meta_title: string;
  meta_description: string;
  intro: string;
  why_alternatives: string;
  alternatives: AlternativeTool[];
  comparison_table_note: string;
  migration_tips: string;
  faq: Array<{ q: string; a: string }>;
  conclusion: string;
};

type Alternative = {
  id: string;
  saas_name: string;
  saas_slug: string;
  saas_description: string;
  content: AlternativeContent;
  status: string;
};

async function getAlternativeBySlug(slug: string): Promise<Alternative | null> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("alternatives")
      .select("*")
      .eq("saas_slug", slug)
      .eq("status", "approved")
      .single();
    if (error || !data) return null;
    return data as Alternative;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data } = await supabase
      .from("alternatives")
      .select("saas_slug")
      .eq("status", "approved");
    if (!data) return [];
    return data.map((row) => ({ slug: row.saas_slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: AlternativePageProps): Promise<Metadata> {
  const alt = await getAlternativeBySlug(params.slug);
  if (!alt) return {};
  const c = alt.content;
  return {
    title: c.meta_title,
    description: c.meta_description,
    alternates: { canonical: `${siteUrl}/alternatives/${alt.saas_slug}` },
    openGraph: {
      title: c.meta_title,
      description: c.meta_description,
      url: `${siteUrl}/alternatives/${alt.saas_slug}`,
      siteName: "The Cloud Rain",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: c.meta_title,
      description: c.meta_description,
    },
  };
}

export default async function AlternativePage({ params }: AlternativePageProps) {
  const alt = await getAlternativeBySlug(params.slug);
  if (!alt) notFound();

  const c = alt.content;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <Link href="/alternatives" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
        ← All Alternatives
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Open Source Alternatives</p>
        <h1 className="mt-2 font-display text-3xl text-white md:text-5xl">
          Best Open Source Alternatives to {alt.saas_name}
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/60">{c.intro}</p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-xl text-white">Why look for {alt.saas_name} alternatives?</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.why_alternatives}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl text-white">Top Alternatives</h2>
        {c.alternatives?.map((tool, i) => (
          <div key={tool.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white/30">#{i + 1}</span>
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                  <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-xs text-emerald-300">
                    {tool.similarity_score}% match
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/50">{tool.tagline}</p>
                <p className="mt-3 text-sm leading-6 text-white/60">{tool.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/40">
                  <span>⭐ {tool.github_stars}</span>
                  <span>📄 {tool.license}</span>
                  <span>🎯 {tool.best_for}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/tools/${tool.slug}`}
                className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
              >
                View {tool.name} →
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-xl text-white">Migration Tips</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.migration_tips}</p>
      </section>

      {c.faq && c.faq.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="text-xl text-white">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-4">
            {c.faq.map((item, i) => (
              <div key={i} className="border-b border-white/10 pb-4 last:border-0">
                <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-xl text-white">Conclusion</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">{c.conclusion}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore more</p>
        <h2 className="mt-2 text-xl text-white">Keep discovering</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/alternatives" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            More alternatives
          </Link>
          <Link href="/vs" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Tool comparisons
          </Link>
          <Link href="/free-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition">
            Browse all tools
          </Link>
        </div>
      </section>
    </div>
  );
}
