import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { marked } from "marked";

export const revalidate = 86400;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

type ComparisonPageProps = {
  params: { slug: string };
};

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  content: string;
  status: string;
};

async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("comparisons")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    if (error || !data) return null;
    return data as Comparison;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data } = await supabase
      .from("comparisons")
      .select("slug")
      .eq("status", "published");
    if (!data) return [];
    return data.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const comparison = await getComparisonBySlug(params.slug);
  if (!comparison) return {};
  const title = `${comparison.tool_a} vs ${comparison.tool_b} (2026): Full Comparison`;
  const description = `Detailed comparison of ${comparison.tool_a} vs ${comparison.tool_b}. Features, pricing, self-hosting, pros and cons — everything you need to choose the right tool.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/vs/${comparison.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/vs/${comparison.slug}`,
      siteName: "The Cloud Rain",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const comparison = await getComparisonBySlug(params.slug);
  if (!comparison) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <Link
        href="/vs"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
      >
        ← All Comparisons
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Comparison</p>
        <h1 className="mt-2 font-display text-3xl text-white md:text-5xl">
          {comparison.tool_a} vs {comparison.tool_b}
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Last updated 2026 · The Cloud Rain
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-xs font-semibold text-orange-200">
            {comparison.tool_a}
          </span>
          <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            {comparison.tool_b}
          </span>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div
          className="prose prose-invert max-w-none
            prose-headings:font-display
            prose-h2:text-2xl prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:text-white/90 prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-white/70 prose-p:leading-7
            prose-li:text-white/70
            prose-table:text-sm
            prose-th:text-white prose-th:bg-white/5 prose-th:p-3
            prose-td:text-white/70 prose-td:p-3 prose-td:border-white/10
            prose-strong:text-white
            prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{
            __html: marked(comparison.content, { async: false, breaks: true }) as string,
          }}
        />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore More</p>
        <h2 className="mt-2 text-xl text-white">Find the right tool for your stack</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/free-tools"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
          >
            Browse all tools
          </Link>
          <Link
            href="/vs"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
          >
            More comparisons
          </Link>
          <Link
            href="/mystery-box"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
          >
            Random tool discovery
          </Link>
        </div>
      </section>
    </div>
  );
}
