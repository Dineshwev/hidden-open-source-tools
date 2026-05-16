import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type FeaturedTool = {
  name: string;
  slug?: string;
  category?: string;
  github_stars?: number;
  summary?: string;
  url?: string;
};

type ComparisonTool = {
  name: string;
  stars?: number;
  language?: string;
  license?: string;
  url?: string;
};

type ComparisonTable = {
  category?: string;
  tools?: ComparisonTool[];
};

type NewsItem = {
  title: string;
  summary?: string;
  source?: string;
};

type WeeklyRoundupRow = {
  id: string;
  title: string;
  slug: string;
  week_date: string;
  featured_tools: FeaturedTool[] | null;
  editor_note?: string | null;
  comparison_table: ComparisonTable | null;
  comparison_summary?: string | null;
  news_summaries: NewsItem[] | null;
  status: string;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getWeeklyRoundup(slug: string): Promise<WeeklyRoundupRow | null> {
  const supabase = getAdmin();

  const { data, error } = await supabase
    .from("weekly_roundups")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return data as WeeklyRoundupRow;
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const roundup = await getWeeklyRoundup(params.slug);

  if (!roundup) {
    return {
      title: "Weekly Roundup Not Found"
    };
  }

  const pagePath = `/weekly-roundups/${params.slug}`;
  const featuredToolNames = (roundup.featured_tools || []).slice(0, 3).map((tool) => tool.name).join(", ");

  return {
    title: roundup.title,
    description: featuredToolNames
      ? `Read this week's roundup featuring ${featuredToolNames} and more open-source tools.`
      : "Read this week's roundup covering open-source tools, comparisons, and tech news.",
    alternates: {
      canonical: pagePath
    },
    openGraph: {
      title: roundup.title,
      description: featuredToolNames
        ? `Read this week's roundup featuring ${featuredToolNames} and more open-source tools.`
        : "Read this week's roundup covering open-source tools, comparisons, and tech news.",
      type: "article",
      url: `${siteUrl}${pagePath}`
    },
    twitter: {
      card: "summary_large_image",
      title: roundup.title,
      description: featuredToolNames
        ? `Read this week's roundup featuring ${featuredToolNames} and more open-source tools.`
        : "Read this week's roundup covering open-source tools, comparisons, and tech news."
    }
  };
}

function formatWeekDate(weekDate: string): string {
  return new Date(weekDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatStars(value?: number) {
  if (typeof value !== "number") {
    return "Unknown";
  }

  return value.toLocaleString();
}

function getTopLanguage(tools: ComparisonTool[]) {
  const counts = new Map<string, number>();

  for (const tool of tools) {
    const language = tool.language?.trim();
    if (!language) continue;
    counts.set(language, (counts.get(language) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "Mixed";
}

function buildOverviewParagraph(
  featuredTools: FeaturedTool[],
  comparisonTable: ComparisonTable | null,
  newsItems: NewsItem[]
) {
  const featuredNames = featuredTools.slice(0, 2).map((tool) => tool.name).join(" and ");
  const comparisonCategory = comparisonTable?.category || "developer tools";

  const firstSentence = featuredNames
    ? `This weekly roundup highlights ${featuredNames}${featuredTools.length > 2 ? " and more" : ""}, alongside a focused comparison of ${comparisonCategory.toLowerCase()}.`
    : `This weekly roundup curates a fresh set of open-source picks alongside a focused comparison of ${comparisonCategory.toLowerCase()}.`;

  const secondSentence = newsItems.length > 0
    ? `It also includes ${newsItems.length} news update${newsItems.length === 1 ? "" : "s"} so readers can scan tool discoveries and broader ecosystem movement in one place.`
    : "It is designed to give readers a compact mix of tool discovery, category context, and practical signals for further research.";

  return `${firstSentence} ${secondSentence}`;
}

function buildComparisonInsights(tools: ComparisonTool[]) {
  if (tools.length === 0) {
    return [];
  }

  const rankedByStars = [...tools]
    .filter((tool): tool is ComparisonTool & { stars: number } => typeof tool.stars === "number")
    .sort((a, b) => b.stars - a.stars);

  const topTool = rankedByStars[0];
  const language = getTopLanguage(tools);
  const licenseCount = new Set(tools.map((tool) => tool.license).filter(Boolean)).size;

  const insights: string[] = [];

  if (topTool) {
    insights.push(`${topTool.name} currently leads this comparison with ${topTool.stars.toLocaleString()} GitHub stars.`);
  }

  insights.push(`${tools.length} row${tools.length === 1 ? "" : "s"} are included in the comparison table for quick shortlisting.`);
  insights.push(`${language} is the most common language across the current comparison set.`);

  if (licenseCount > 0) {
    insights.push(`${licenseCount} distinct license profile${licenseCount === 1 ? "" : "s"} appear in this comparison table.`);
  }

  return insights;
}

export default async function WeeklyRoundupPage({
  params
}: {
  params: { slug: string };
}) {
  const roundup = await getWeeklyRoundup(params.slug);

  if (!roundup) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: roundup.title,
    datePublished: roundup.week_date,
    dateModified: roundup.week_date,
    author: {
      "@type": "Organization",
      name: "The Cloud Rain"
    },
    publisher: {
      "@type": "Organization",
      name: "The Cloud Rain",
      url: siteUrl
    },
    mainEntityOfPage: `${siteUrl}/weekly-roundups/${params.slug}`
  };

  const featuredTools = roundup.featured_tools || [];
  const comparisonTable = roundup.comparison_table;
  const comparisonTools = comparisonTable?.tools || [];
  const newsItems = roundup.news_summaries || [];
  const totalFeaturedStars = featuredTools.reduce((sum, tool) => sum + (tool.github_stars || 0), 0);
  const totalComparisonStars = comparisonTools.reduce((sum, tool) => sum + (tool.stars || 0), 0);
  const comparisonInsights = buildComparisonInsights(comparisonTools);
  const overviewParagraph = buildOverviewParagraph(featuredTools, comparisonTable, newsItems);
  const editorNote = roundup.editor_note?.trim() || null;
  const comparisonSummary = roundup.comparison_summary?.trim() || null;
  const topFeaturedTool = [...featuredTools]
    .filter((tool): tool is FeaturedTool & { github_stars: number } => typeof tool.github_stars === "number")
    .sort((a, b) => b.github_stars - a.github_stars)[0];
  const topComparisonTool = [...comparisonTools]
    .filter((tool): tool is ComparisonTool & { stars: number } => typeof tool.stars === "number")
    .sort((a, b) => b.stars - a.stars)[0];
  const statCards = [
    {
      label: "Featured tools",
      value: String(featuredTools.length),
      hint: topFeaturedTool ? `Top pick: ${topFeaturedTool.name}` : "No featured picks saved"
    },
    {
      label: "Comparison rows",
      value: String(comparisonTools.length),
      hint: comparisonTable?.category || "No comparison category"
    },
    {
      label: "News items",
      value: String(newsItems.length),
      hint: newsItems.length > 0 ? "Developer news included" : "No news summaries saved"
    },
    {
      label: "Tracked stars",
      value: formatCompactNumber(totalFeaturedStars + totalComparisonStars),
      hint: "Combined visible GitHub stars"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#08101f] to-[#071521] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Weekly Roundup</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{roundup.title}</h1>
          <p className="text-sm text-white/60">{formatWeekDate(roundup.week_date)}</p>
        </header>

        {editorNote ? (
          <section className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.05] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Editor&apos;s note</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-white/80 md:text-base">
              {editorNote.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph.trim()}</p>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Roundup overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">What this issue covers</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
              {overviewParagraph}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Featured section</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {topFeaturedTool
                    ? `${topFeaturedTool.name} is the most prominent featured project in this issue with ${formatStars(topFeaturedTool.github_stars)} stars.`
                    : "Featured tool metadata is available, but no GitHub star leader could be determined."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Comparison snapshot</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {topComparisonTool
                    ? `${topComparisonTool.name} leads the comparison table, and ${getTopLanguage(comparisonTools)} is the most common language in this category set.`
                    : "Comparison stats are limited, so this issue falls back to row-level metadata rather than ranking insights."}
                </p>
              </div>
            </div>
          </article>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {statCards.map((card) => (
              <article key={card.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">{card.label}</p>
                <p className="mt-3 font-display text-3xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{card.hint}</p>
              </article>
            ))}
          </aside>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Featured Tools</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredTools.length > 0 ? (
              featuredTools.map((tool, index) => (
                <article key={`${tool.name}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                      </div>
                      {tool.category ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-200/60">{tool.category}</p>
                      ) : null}
                    </div>
                    {typeof tool.github_stars === "number" ? (
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                        ★ {tool.github_stars.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/75">{tool.summary || "No summary available."}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/50">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                      Featured row {index + 1}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                      Stars: {formatStars(tool.github_stars)}
                    </span>
                  </div>
                  {tool.url ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200"
                    >
                      Visit project →
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
                No featured tools were saved for this roundup.
              </article>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Comparison Table</h2>
          {comparisonTools.length > 0 ? (
            <div className="space-y-4">
              {comparisonSummary ? (
                <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Comparison summary</p>
                  <p className="mt-3 text-sm leading-7 text-white/78 md:text-base">
                    {comparisonSummary}
                  </p>
                </article>
              ) : null}

              {comparisonInsights.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {comparisonInsights.map((insight) => (
                    <article key={insight} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/75">
                      {insight}
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/75">
                This table includes {comparisonTools.length} row{comparisonTools.length === 1 ? "" : "s"} in the{" "}
                {comparisonTable?.category || "selected"} category. It is meant to give a fast shortlist view before you open the individual projects.
              </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              {comparisonTable?.category ? (
                <div className="border-b border-white/10 px-5 py-4 text-sm text-cyan-200/80">
                  {comparisonTable.category}
                </div>
              ) : null}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-white/70">
                    <tr>
                      <th className="px-5 py-4 font-medium">#</th>
                      <th className="px-5 py-4 font-medium">Tool</th>
                      <th className="px-5 py-4 font-medium">Stars</th>
                      <th className="px-5 py-4 font-medium">Language</th>
                      <th className="px-5 py-4 font-medium">License</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonTools.map((tool, index) => (
                      <tr key={`${tool.name}-${index}`} className="border-b border-white/5 last:border-b-0">
                        <td className="px-5 py-4 text-white/45">{index + 1}</td>
                        <td className="px-5 py-4 font-medium text-white">
                          {tool.url ? (
                            <a href={tool.url} target="_blank" rel="noreferrer" className="transition hover:text-cyan-200">
                              {tool.name}
                            </a>
                          ) : (
                            tool.name
                          )}
                        </td>
                        <td className="px-5 py-4 text-white/70">
                          {typeof tool.stars === "number" ? tool.stars.toLocaleString() : "-"}
                        </td>
                        <td className="px-5 py-4 text-white/70">{tool.language || "-"}</td>
                        <td className="px-5 py-4 text-white/70">{tool.license || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          ) : (
            <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
              No comparison table was saved for this roundup.
            </article>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">News Summaries</h2>
          <div className="space-y-4">
            {newsItems.length > 0 ? (
              newsItems.map((item, index) => (
                <article key={`${item.title}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">{item.summary || "No summary available."}</p>
                  {item.source ? <p className="mt-3 text-xs text-white/45">Source: {item.source}</p> : null}
                </article>
              ))
            ) : (
              <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
                No news summaries were saved for this roundup.
              </article>
            )}
          </div>
        </section>

        <div>
          <Link
            href="/weekly-roundups"
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Back to Weekly Roundups
          </Link>
        </div>
      </div>
    </div>
  );
}
