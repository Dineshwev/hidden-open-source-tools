import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import buildToolStructuredData from "@/lib/seo/toolStructuredData";
import { marked } from "marked";
import { formatLicense } from "@/lib/utils/license";

export const revalidate = 86400;
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
  return cleanDescription(description).slice(0, 100).trimEnd();
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

  const title = `${tool.name} — Open Source ${tool.category} | Self-hosted Alternative`;
  const descriptionSnippet = getSeoDescriptionSnippet(tool.description);
  const description = `${tool.name} is a free, self-hosted alternative for ${tool.category}. ${descriptionSnippet}. No vendor lock-in.`;
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

  // Related vs comparisons — select tool_a, tool_b by name from DB so chips are proper-cased
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
  // Rules:
  //   • must have a github.com URL (open-source signal)
  //   • status = approved, structured_content_status = success
  //   • exclude current tool slug
  //   • ordered by github_stars desc
  // Vendor exclusion (same GitHub org/user → same vendor) is done in JS below.
  const { data: categoryToolsCandidates } = await supabaseAdmin
    .from("open_source_tools")
    .select("slug, name, description, url, github_stars")
    .eq("category", tool.category)
    .eq("structured_content_status", "success")
    .or("status.eq.approved,status.eq.APPROVED")
    .ilike("url", "%github.com%")
    .neq("slug", tool.slug)
    .order("github_stars", { ascending: false, nullsFirst: false })
    .limit(8); // fetch extra so vendor-filter still leaves ≥ 4

  // Extract the current tool's GitHub owner to detect same-vendor products
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
      if (!currentGithubOwner) return true; // can't determine vendor, keep all
      try {
        const parts = new URL(String(ct.url ?? "")).pathname.split("/").filter(Boolean);
        const owner = parts[0]?.toLowerCase() ?? "";
        return owner !== currentGithubOwner; // exclude same-vendor
      } catch {
        return true;
      }
    })
    .slice(0, 4); // max 4 after vendor filter

  const faviconUrl = getFaviconUrl(tool.url);
  const cleanedDescription = cleanDescription(tool.description);
  // Hero shows only the first sentence — About section shows the full description
  const heroTagline = firstSentence(cleanedDescription);

  const githubUrl =
    (tool.url?.includes("github.com") ? tool.url : null) ??
    extractGithubUrl(tool.description);
  const githubStats = githubUrl ? await fetchGithubStats(githubUrl) : null;

  // Prefer live GitHub license; fall back to DB-stored value from last generate run
  const displayLicense = githubStats?.license ?? dbLicense;

  // Format last commit date as "Mon YYYY" (e.g. "Jan 2026")
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
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Link
        href="/free-tools"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
      >
        ← Back to Directory
      </Link>

      {/* ── Hero ── short tagline (first sentence only, not the full About text) */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-3">
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
              <span className="font-display text-3xl text-white">
                {tool.name[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              {tool.category}
            </span>
            <h1 className="font-display text-4xl text-white md:text-5xl">{tool.name}</h1>
            <p className="max-w-3xl text-base leading-7 text-white/70 md:text-lg">{heroTagline}</p>
          </div>
        </div>
      </section>

      {/* ── Stats bar — shows DB-cached values; "Stats checked" date from github_checked_at */}
      {(githubStats || displayLicense || lastCommitLabel || checkedAtLabel) ? (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap gap-3">
            {githubStats && (
              <>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  ⭐ {githubStats.stars.toLocaleString()} Stars
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  🍴 {githubStats.forks.toLocaleString()} Forks
                </div>
                {githubStats.language && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                    💻 {githubStats.language}
                  </div>
                )}
              </>
            )}
            {(displayLicense) && (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                📝 {formatLicense(displayLicense)}
              </div>
            )}
            {lastCommitLabel && (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                🕐 Last commit: {lastCommitLabel}
              </div>
            )}
            {checkedAtLabel && (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/50">
                Stats checked: {checkedAtLabel}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* ── About ── full description (distinct from the short hero tagline above) */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Description</p>
        <h2 className="mt-2 text-2xl text-white">About {tool.name}</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/70">{cleanedDescription}</p>
      </section>

      {tool.ai_content ? (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: marked(tool.ai_content, { async: false, breaks: true }) as string,
            }}
          />
        </section>
      ) : null}

      <section className="flex flex-wrap gap-3">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
        >
          Visit {tool.name} →
        </a>
        {githubUrl ? (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/[0.05]"
          >
            View on GitHub →
          </a>
        ) : null}
      </section>

      {/* ── Comparisons */}
      {relatedVs && relatedVs.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Comparisons</p>
          <h2 className="mt-2 text-2xl text-white">How {tool.name} compares</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedVs.map((vs: any) => (
              <Link
                key={vs.slug}
                href={`/vs/${vs.slug}`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
              >
                {vs.tool_a} vs {vs.tool_b}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SaaS alternatives pages */}
      {relatedAlts && relatedAlts.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Alternatives</p>
          <h2 className="mt-2 text-2xl text-white">Alternatives to {tool.name}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedAlts.map((alt: any) => (
              <Link
                key={alt.saas_slug}
                href={`/alternatives/${alt.saas_slug}`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 transition"
              >
                {alt.saas_name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Same-category open-source alternatives (hidden if fewer than 2 qualify) */}
      {categoryTools.length >= 2 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Similar tools</p>
          <h2 className="mt-2 text-2xl text-white">Alternatives to {tool.name}</h2>
          <p className="mt-1 text-sm text-white/50">
            Other open-source {tool.category} tools
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {categoryTools.map((ct: any) => {
              const ctDesc = cleanDescription(String(ct.description || ""));
              return (
                <Link
                  key={ct.slug}
                  href={`/tools/${ct.slug}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/25 hover:bg-white/[0.04]"
                >
                  <p className="font-semibold text-white">{ct.name}</p>
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
