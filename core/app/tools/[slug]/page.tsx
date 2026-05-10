import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export const revalidate = 86400;

type ToolRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  url: string;
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
    url: String(row?.url || row?.webpage_url || "")
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

function truncateDescription(description: string) {
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

function getSeoDescriptionSnippet(description: string) {
  return cleanDescription(description).slice(0, 100).trimEnd();
}

function extractGithubUrl(description: string) {
  const match = description.match(/https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+/);
  return match?.[0] || null;
}

function extractGithubOwnerRepo(githubUrl: string) {
  try {
    const parsedUrl = new URL(githubUrl);
    const [owner, repo] = parsedUrl.pathname.split("/").filter(Boolean);

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo: repo.replace(/\.git$/i, "")
    };
  } catch {
    return null;
  }
}

async function fetchGithubStats(githubUrl: string): Promise<GitHubStats | null> {
  const repoRef = extractGithubOwnerRepo(githubUrl);

  if (!repoRef) {
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoRef.owner}/${repoRef.repo}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        Accept: "application/vnd.github+json"
      },
      next: {
        revalidate
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const stars = Number(data?.stargazers_count || 0);

    if (stars <= 0) {
      return null;
    }

    return {
      stars,
      forks: Number(data?.forks_count || 0),
      language: data?.language ? String(data.language) : null,
      license: data?.license?.spdx_id ? String(data.license.spdx_id) : null
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

    if (error || !data) return null;

    return normalizeTool(data);
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: faviconUrl ? [{ url: faviconUrl, alt: `${tool.name} logo` }] : []
    }
  };
}

export default async function ToolSlugPage({ params }: ToolPageProps) {
  const tool = await getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  const faviconUrl = getFaviconUrl(tool.url);
  const cleanedDescription = cleanDescription(tool.description);
  const githubUrl = (tool.url?.includes("github.com") ? tool.url : null) ?? extractGithubUrl(tool.description);
  const githubStats = githubUrl ? await fetchGithubStats(githubUrl) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-3">
            {faviconUrl ? (
              <img src={faviconUrl} alt={`${tool.name} logo`} width={64} height={64} className="h-16 w-16 rounded-xl object-contain" />
            ) : (
              <span className="font-display text-3xl text-white">{tool.name[0]?.toUpperCase() || "?"}</span>
            )}
          </div>

          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              {tool.category}
            </span>
            <h1 className="font-display text-4xl text-white md:text-5xl">{tool.name}</h1>
            <p className="max-w-3xl text-base leading-7 text-white/70 md:text-lg">{truncateDescription(cleanedDescription)}</p>
          </div>
        </div>
      </section>

      {githubStats ? (
        <section className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">⭐ {githubStats.stars} Stars</div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">🍴 {githubStats.forks} Forks</div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">💻 {githubStats.language || "Unknown"}</div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">📝 {githubStats.license || "Unlisted"}</div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Description</p>
        <h2 className="mt-2 text-2xl text-white">About {tool.name}</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/70">{cleanedDescription}</p>
      </section>

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
    </div>
  );
}
