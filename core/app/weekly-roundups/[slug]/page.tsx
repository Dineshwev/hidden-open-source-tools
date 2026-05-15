import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

interface FeaturedTool {
  name: string;
  slug: string;
  category: string;
  github_stars: number;
  summary: string;
  url: string;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
}

interface ComparisonTool {
  name: string;
  stars: number;
  language: string;
  license: string;
  url: string;
}

interface ComparisonData {
  category: string;
  tools: ComparisonTool[];
}

interface WeeklyRoundup {
  title: string;
  slug: string;
  week_date: string;
  featured_tools: FeaturedTool[];
  comparison_table: ComparisonData;
  news_summaries: NewsItem[];
  status: string;
}

async function getWeeklyRoundup(slug: string): Promise<WeeklyRoundup | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("weekly_roundups")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return null;
    }

    return data as WeeklyRoundup;
  } catch (err) {
    console.error("Error fetching roundup:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const roundup = await getWeeklyRoundup(params.slug);

  if (!roundup) {
    return {
      title: "Weekly Roundup Not Found",
    };
  }

  const pagePath = `/weekly-roundups/${params.slug}`;

  return {
    title: roundup.title,
    description: roundup.featured_tools
      ? `This week's curated picks: ${roundup.featured_tools.slice(0, 3).map((t) => t.name).join(", ")} and more.`
      : "Weekly curated picks of open-source tools and developer utilities.",
    alternates: {
      canonical: pagePath,
    },
    openGraph: {
      title: roundup.title,
      description: roundup.featured_tools
        ? `This week's curated picks: ${roundup.featured_tools.slice(0, 3).map((t) => t.name).join(", ")} and more.`
        : "Weekly curated picks of open-source tools and developer utilities.",
      url: `${siteUrl}${pagePath}`,
    },
  };
}

export default async function WeeklyRoundupPage({
  params,
}: {
  params: { slug: string };
}) {
  const roundup = await getWeeklyRoundup(params.slug);
  const pagePath = `/weekly-roundups/${params.slug}`;

  if (!roundup || roundup.status !== "published") {
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-2 py-8">
        <header className="space-y-3">
          <h1 className="font-display text-3xl text-white md:text-5xl">
            Weekly Roundup Not Found
          </h1>
          <p className="text-white/70">
            This roundup is not yet published or doesn&apos;t exist.
          </p>
        </header>
        <Link
          href="/weekly-roundups"
          className="inline-flex rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900"
        >
          View All Roundups
        </Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: roundup.title,
    datePublished: roundup.week_date,
    dateModified: roundup.week_date,
    author: {
      "@type": "Organization",
      name: "The Cloud Rain",
    },
    publisher: {
      "@type": "Organization",
      name: "The Cloud Rain",
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}${pagePath}`,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-2 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
          Weekly Roundup
        </p>
        <h1 className="font-display text-3xl text-white md:text-5xl">
          {roundup.title}
        </h1>
        <p className="text-white/70">
          A practical weekly shortlist of useful software discoveries for
          developers.
        </p>
      </header>

      {roundup.featured_tools && roundup.featured_tools.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl text-white">This Week&apos;s Picks</h2>
          {roundup.featured_tools.map((tool) => (
            <article
              key={tool.slug}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl text-white">{tool.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.1em] text-cyan-200/60">
                    {tool.category}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    {tool.summary}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-white/60">
                      ⭐ {tool.github_stars.toLocaleString()} stars
                    </span>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs text-white/90 hover:border-white/40"
                    >
                      View →
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {roundup.comparison_table &&
        roundup.comparison_table.tools &&
        roundup.comparison_table.tools.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl text-white">
              {roundup.comparison_table.category} Tools Comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-white">Tool</th>
                    <th className="px-4 py-3 text-left text-white">Stars</th>
                    <th className="px-4 py-3 text-left text-white">Language</th>
                    <th className="px-4 py-3 text-left text-white">License</th>
                  </tr>
                </thead>
                <tbody>
                  {roundup.comparison_table.tools.map((tool) => (
                    <tr key={tool.name} className="border-b border-white/5">
                      <td className="px-4 py-3">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 hover:text-cyan-200"
                        >
                          {tool.name}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {tool.stars.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-white/70">{tool.language}</td>
                      <td className="px-4 py-3 text-white/70">{tool.license}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      {roundup.news_summaries && roundup.news_summaries.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl text-white">Tech News This Week</h2>
          {roundup.news_summaries.map((news) => (
            <article
              key={news.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="text-base text-white">{news.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">{news.summary}</p>
              <p className="mt-2 text-xs text-white/50">Source: {news.source}</p>
            </article>
          ))}
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/free-tools"
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Browse No-Cost Resources
        </Link>
        <Link
          href="/open-source-software"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90"
        >
          Open Source Alternatives
        </Link>
        <Link
          href="/weekly-roundups"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90"
        >
          All Weekly Briefs
        </Link>
      </div>
    </div>
  );
}
