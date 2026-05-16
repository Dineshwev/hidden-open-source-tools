import { createClient } from "@supabase/supabase-js";

type ToolRow = {
  id: string;
  name?: string | null;
  title?: string | null;
  url: string | null;
};

type GitHubRepoResponse = {
  stargazers_count: number;
  language: string | null;
  license: {
    spdx_id?: string | null;
    name?: string | null;
  } | null;
};

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractGitHubRepo(rawUrl: string | null): { owner: string; repo: string } | null {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname !== "github.com") {
      return null;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const [owner, repoWithSuffix] = pathParts;

    if (!owner || !repoWithSuffix) {
      return null;
    }

    const repo = repoWithSuffix.replace(/\.git$/i, "");
    return { owner, repo };
  } catch {
    return null;
  }
}

async function fetchGitHubRepo(
  owner: string,
  repo: string,
  githubToken: string
): Promise<GitHubRepoResponse> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text.slice(0, 200)}`);
  }

  return (await response.json()) as GitHubRepoResponse;
}

async function main(): Promise<void> {
  const supabaseUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const githubToken = readRequiredEnv("GITHUB_TOKEN");

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log("Fetching tools with GitHub URLs...\n");

  const { data: tools, error } = await supabase
    .from("open_source_tools")
    .select("id, name, title, url")
    .ilike("url", "%github.com%");

  if (error) {
    throw new Error(`Failed to fetch tools: ${error.message}`);
  }

  const toolsToSync = (tools || []) as ToolRow[];
  console.log(`Found ${toolsToSync.length} tools with GitHub URLs\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const [index, tool] of toolsToSync.entries()) {
    const repoRef = extractGitHubRepo(tool.url);

    if (!repoRef) {
      const label = tool.name || tool.title || tool.id;
      console.warn(`⊘ Skipped: ${label} (invalid URL format)`);
      skipCount++;
      continue;
    }

    try {
      const repoData = await fetchGitHubRepo(repoRef.owner, repoRef.repo, githubToken);

      const licenseValue = repoData.license?.spdx_id || repoData.license?.name || null;

      const { error: updateError } = await supabase
        .from("open_source_tools")
        .update({
          github_stars: repoData.stargazers_count,
          language: repoData.language,
          license: licenseValue
        })
        .eq("id", tool.id);

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`);
      }

      const stars = repoData.stargazers_count;
      const lang = repoData.language || "—";
      const license = licenseValue || "—";

      console.log(
        `✅ ${repoRef.owner}/${repoRef.repo} — ⭐ ${stars} | ${lang} | ${license}`
      );
      successCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${repoRef.owner}/${repoRef.repo} — ${message}`);
      failCount++;
    }

    if (index < toolsToSync.length - 1) {
      await sleep(500);
    }
  }

  console.log(
    `\n✓ Completed: ${successCount} updated, ${skipCount} skipped, ${failCount} failed`
  );
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
