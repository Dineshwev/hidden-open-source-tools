import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import buildToolStructuredData from "@/lib/seo/toolStructuredData";
import { marked } from "marked";
import { formatLicense } from "@/lib/utils/license";
import { ExternalLink, Star, GitFork, Code2, Scale, Clock, ArrowLeft } from "lucide-react";

export const revalidate = 3600;
const siteUrl = getSiteUrl();

type ToolRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  url: string;
  ai_content?: string | null;
  structured_content_status?: string | null;
};

type GitHubStats = {
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
};

type ToolPageProps = {
  params: {
    slug: string;
  };
};

function normalizeTool(row: any): ToolRow {
  return {
    id: String(row?.id || ""),
    slug: String(row?.slug || ""),
    name: String(row?.name || row?.title || "Untitled tool"),
    description: String(row?.description || "No description available yet."),
    category: String(row?.category || "Developer Resource"),
    url: String(row?.url || row?.webpage_url || ""),
    ai_content: row?.ai_content || null,
    structured_content_status: row?.structured_content_status || null,
  };
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getFaviconUrl(url: string) {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "";
}

function cleanDescription(description: string) {
  return description
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/\(\[.*?\](?:,\s*\[.*?\])*\)/g, "")
    .replace(/\(https?:\/\/[^\)]+\)/g, "")
    .replace(/\(\)/g, "")
    .replace(/\s+/g, " ")
    .replace(/[\s,.]+$/g, "")
    .trim();
}

/** Returns only the first sentence (used for the hero tagline to avoid duplicating the full About text). */
function firstSentence(description: string): string {
  const match = description.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : description.slice(0, 120).trim();
}

function getSeoDescriptionSnippet(description: string) {
  const cleaned = cleanDescription(description);
  return cleaned.length > 160 ? `${cleaned.slice(0, 157).trimEnd()}...` : cleaned;
}

function extractGithubUrl(description: string) {
  const match = description.match(
    /https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+/
  );
  return match?.[0] || null;
}

function extractGithubOwnerRepo(githubUrl: string) {
  try {
    const parsedUrl = new URL(githubUrl);
    const [owner, repo] = parsedUrl.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

async function fetchGithubStats(githubUrl: string): Promise<GitHubStats | null> {
  const repoRef = extractGithubOwnerRepo(githubUrl);
  if (!repoRef) return null;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoRef.owner}/${repoRef.repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/vnd.github+json",
        },
        next: { revalidate },
      }
    );
    if (!response.ok) return null;

    const data = await response.json();
    const stars = Number(data?.stargazers_count || 0);
    if (stars <= 0) return null;

    return {
      stars,
      forks: Number(data?.forks_count || 0),
      language: data?.language ? String(data.language) : null,
      license: data?.license?.spdx_id ? String(data.license.spdx_id) : null,
    };
  } catch {
    return null;
  }
}

async function getToolBySlug(slug: string) {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("*")
      .eq("slug", slug)
      .or("status.eq.approved,status.eq.APPROVED")
      .single();

    if (!error && data) return normalizeTool(data);
    return null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("slug")
      .not("slug", "is", null)
      .neq("slug", "")
      .or("status.eq.approved,status.eq.APPROVED");

    if (error || !Array.isArray(data)) return [];
    return data
      .map((row) => String(row?.slug || "").trim())
      .filter(Boolean)
      .map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug);
  if (!tool) return {};

  const cleanCat = tool.category && !["other", "Developer Resource"].includes(tool.category)
    ? tool.category
    : "Developer";
  const title = `${tool.name} – Open Source ${cleanCat} Alternative`;
  const snippet = getSeoDescriptionSnippet(tool.description);
  const description = snippet
    ? `${snippet.slice(0, 115)}... Compare features, GitHub stars, license, and alternatives.`
    : `Explore ${tool.name}: a curated open-source ${cleanCat.toLowerCase()} tool. Review GitHub stars, license, and self-hosted alternatives.`;
  const faviconUrl = getFaviconUrl(tool.url);
  const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;
  const isSuccess = tool.structured_content_status === "success";

  return {
    title,
    description,
    ...(!isSuccess ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: faviconUrl ? [{ url: faviconUrl, alt: `${tool.name} logo` }] : [],
    },
  };
}

export default async function ToolSlugPage({ params }: ToolPageProps) {
  const supabaseAdmin = getAdmin();

  const tool = await getToolBySlug(params.slug);
  if (!tool) notFound();

  // Fetch extra columns written by generate / refresh scripts
  const { data: rawRow } = await supabaseAdmin
    .from("open_source_tools")
    .select("license, github_last_commit, github_checked_at")
    .eq("slug", params.slug)
    .single();

  const dbLicense: string | null = rawRow?.license != null ? String(rawRow.license) : null;
  const dbLastCommit: string | null = rawRow?.github_last_commit != null ? String(rawRow.github_last_commit) : null;
  const dbCheckedAt: string | null = rawRow?.github_checked_at != null ? String(rawRow.github_checked_at) : null;

  // Related vs comparisons
  const { data: relatedVs } = await supabaseAdmin
    .from("comparisons")
    .select("slug, tool_a, tool_b")
    .or(`slug.ilike.${params.slug}-vs-%,slug.ilike.%-vs-${params.slug}`)
    .eq("status", "published")
    .limit(3);

  // Alternatives pages (saas alternatives)
  const { data: relatedAlts } = await supabaseAdmin
    .from("alternatives")
    .select("saas_slug, saas_name")
    .ilike("saas_slug", `${params.slug}%`)
    .eq("status", "published")
    .limit(2);

  // Same-category open-source alternatives
  const { data: categoryToolsCandidates } = await supabaseAdmin
    .from("open_source_tools")
    .select("slug, name, description, url, github_stars")
    .eq("category", tool.category)
    .eq("structured_content_status", "success")
    .or("status.eq.approved,status.eq.APPROVED")
    .ilike("url", "%github.com%")
    .neq("slug", tool.slug)
    .order("github_stars", { ascending: false, nullsFirst: false })
    .limit(8);

  // Extract current tool's GitHub owner to detect same-vendor products
  const currentGithubOwner = (() => {
    const url = tool.url?.includes("github.com") ? tool.url : null;
    if (!url) return null;
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean);
      return parts[0]?.toLowerCase() ?? null;
    } catch {
      return null;
    }
  })();

  const categoryTools = (categoryToolsCandidates ?? [])
    .filter((ct) => {
      if (!currentGithubOwner) return true;
      try {
        const parts = new URL(String(ct.url ?? "")).pathname.split("/").filter(Boolean);
        const owner = parts[0]?.toLowerCase() ?? "";
        return owner !== currentGithubOwner;
      } catch {
        return true;
      }
    })
    .slice(0, 4);

  const faviconUrl = getFaviconUrl(tool.url);
  const cleanedDescription = cleanDescription(tool.description);
  const heroTagline = firstSentence(cleanedDescription);

  const githubUrl =
    (tool.url?.includes("github.com") ? tool.url : null) ??
    extractGithubUrl(tool.description);
  const githubStats = githubUrl ? await fetchGithubStats(githubUrl) : null;

  const displayLicense = githubStats?.license ?? dbLicense;

  function fmtMonthYear(iso: string | null): string | null {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return null;
    }
  }

  const lastCommitLabel = fmtMonthYear(dbLastCommit);
  const checkedAtLabel = fmtMonthYear(dbCheckedAt);

  const structuredData = buildToolStructuredData(
    {
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      description: cleanedDescription,
      url: tool.url,
    },
    siteUrl,
    faviconUrl
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Back Link */}
      <Link
        href="/free-tools"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Explore Tools</span>
      </Link>

      {/* ── Hero Section with Instant Action CTAs ── */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start flex-1 min-w-0">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3">
              {faviconUrl ? (
                <Image
                  src={faviconUrl}
                  alt={`${tool.name} logo`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-contain"
                  unoptimized
                />
              ) : (
                <span className="font-display text-3xl font-bold text-white">
                  {tool.name[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>

            <div className="space-y-3 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  {tool.category}
                </span>
                {displayLicense && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/70">
                    <Scale className="h-3 w-3 text-white/50" />
                    {formatLicense(displayLicense)}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                {tool.name}
              </h1>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
                {heroTagline}
              </p>
            </div>
          </div>

          {/* Primary Action Buttons (Top of Page) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0 pt-2 md:pt-0">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 shadow-md shadow-cyan-500/10"
            >
              <span>Visit Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
              >
                <span>GitHub</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/60" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Key Metrics & Stats Strip ── */}
      {(githubStats || displayLicense || lastCommitLabel || checkedAtLabel) && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {githubStats && (
              <>
                <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-300">
                  <Star className="h-4 w-4 fill-amber-300/30 text-amber-300" />
                  <span>{githubStats.stars.toLocaleString()} Stars</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs sm:text-sm text-white/80">
                  <GitFork className="h-4 w-4 text-white/50" />
                  <span>{githubStats.forks.toLocaleString()} Forks</span>
                </div>

                {githubStats.language && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs sm:text-sm text-white/80">
                    <Code2 className="h-4 w-4 text-cyan-300" />
                    <span>{githubStats.language}</span>
                  </div>
                )}
              </>
            )}

            {displayLicense && (
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs sm:text-sm text-white/80">
                <Scale className="h-4 w-4 text-white/50" />
                <span>{formatLicense(displayLicense)}</span>
              </div>
            )}

            {lastCommitLabel && (
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs sm:text-sm text-white/70">
                <Clock className="h-4 w-4 text-white/50" />
                <span>Last commit: {lastCommitLabel}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── About Section ── */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">Overview</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">About {tool.name}</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
          {cleanedDescription}
        </p>
      </section>

      {/* ── AI Structured Deep Dive Content (if available) ── */}
      {tool.ai_content && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div
            className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: marked(tool.ai_content, { async: false, breaks: true }) as string,
            }}
          />
        </section>
      )}

      {/* ── Bottom Action Strip ── */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h3 className="font-display text-base font-semibold text-white">
            Ready to explore {tool.name}?
          </h3>
          <p className="text-xs text-white/50">Visit their official site or check their code repository.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <span>Visit {tool.name}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
            >
              <span>View Code</span>
              <ExternalLink className="h-3.5 w-3.5 text-white/60" />
            </a>
          )}
        </div>
      </section>

      {/* ── Comparisons ── */}
      {relatedVs && relatedVs.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Comparisons</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">How {tool.name} compares</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {relatedVs.map((vs: any) => (
              <Link
                key={vs.slug}
                href={`/vs/${vs.slug}`}
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
              >
                <span>{vs.tool_a} vs {vs.tool_b}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SaaS Alternatives ── */}
      {relatedAlts && relatedAlts.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">SaaS Alternatives</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">Commercial Alternatives to {tool.name}</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {relatedAlts.map((alt: any) => (
              <Link
                key={alt.saas_slug}
                href={`/alternatives/${alt.saas_slug}`}
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
              >
                <span>{alt.saas_name} Alternatives</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Same-Category Open-Source Alternatives ── */}
      {categoryTools.length >= 2 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Similar Tools</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">Other Open-Source {tool.category} Tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categoryTools.map((ct: any) => {
              const ctDesc = cleanDescription(String(ct.description || ""));
              return (
                <Link
                  key={ct.slug}
                  href={`/tools/${ct.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                >
                  <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{ct.name}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55 line-clamp-2">
                    {firstSentence(ctDesc)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
