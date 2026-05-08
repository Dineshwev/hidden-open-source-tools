import { createClient } from "@supabase/supabase-js";

type ToolRow = {
  id: string;
  name?: string | null;
  title?: string | null;
  url: string | null;
};

type GitHubRepoResponse = {
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  license: {
    spdx_id?: string | null;
  } | null;
  updated_at: string;
};

const GITHUB_API_VERSION = "2022-11-28";
const REQUEST_DELAY_MS = 500;

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractGitHubRepo(rawUrl: string | null) {
  if (!rawUrl) return null;

  try {
    const parsedUrl = new URL(rawUrl);
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname !== "github.com") {
      return null;
    }

    const [owner, repoWithSuffix] = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    if (!owner || !repoWithSuffix) {
      return null;
    }

    const repo = repoWithSuffix.replace(/\.git$/i, "");

    return { owner, repo };
  } catch {
    return null;
  }
}

async function fetchGitHubRepo(owner: string, repo: string, githubToken: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION
    }
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`GitHub API ${response.status}: ${responseText.slice(0, 240)}`);
  }

  return (await response.json()) as GitHubRepoResponse;
}

async function main() {
  const githubToken = readRequiredEnv("GITHUB_TOKEN");
  const supabaseUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: tools, error } = await supabase
    .from("open_source_tools")
    .select("id, name, title, url")
    .ilike("url", "%github.com%")
    .or("status.eq.approved,status.eq.APPROVED");

  if (error) {
    throw new Error(`Failed to fetch GitHub tools from Supabase: ${error.message}`);
  }

  const approvedTools = (tools || []) as ToolRow[];
  console.log(`Found ${approvedTools.length} approved GitHub tools to sync.`);

  for (const [index, tool] of approvedTools.entries()) {
    const label = tool.name || tool.title || tool.id;
    const repoRef = extractGitHubRepo(tool.url);

    if (!repoRef) {
      console.warn(`[skip] ${label}: unable to extract owner/repo from ${tool.url}`);
      continue;
    }

    try {
      const repoData = await fetchGitHubRepo(repoRef.owner, repoRef.repo, githubToken);

      const { error: updateError } = await supabase
        .from("open_source_tools")
        .update({
          github_stars: repoData.stargazers_count,
          github_forks: repoData.forks_count,
          language: repoData.language,
          license: repoData.license?.spdx_id || null,
          last_updated: repoData.updated_at
        })
        .eq("id", tool.id);

      if (updateError) {
        throw new Error(`Supabase update failed: ${updateError.message}`);
      }

      console.log(
        `[ok] ${label}: ${repoRef.owner}/${repoRef.repo} ` +
          `stars=${repoData.stargazers_count} forks=${repoData.forks_count}`
      );
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : String(syncError);
      console.error(`[fail] ${label}: ${message}`);
    }

    if (index < approvedTools.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  console.log("GitHub star sync complete.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[fatal] ${message}`);
  process.exitCode = 1;
});
