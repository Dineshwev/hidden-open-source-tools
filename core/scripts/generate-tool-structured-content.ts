/**
 * generate-tool-structured-content.ts
 *
 * Overwrites ai_content and structured columns for all approved tools.
 * Pipeline per tool:
 *   1. GitHub API  → stats
 *   2. raw.githubusercontent.com → README excerpt
 *   3. Cerebras (primary) / Groq (fallback) → structured JSON
 */

import { createClient } from "@supabase/supabase-js";
import * as ws from "ws";

// ─── Config ──────────────────────────────────────────────────────────────────

const CEREBRAS_MODEL = "gpt-oss-120b";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const DELAY_MS = 3000;
const MAX_RETRIES = 2;
const README_MAX_CHARS = 800;

// ─── Types ────────────────────────────────────────────────────────────────────

type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  github_stars: number | null;
  language: string | null;
  license: string | null;
};

type GitHubStats = {
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  contributors: number;
  last_commit: string | null;
  latest_release: string | null;
  language: string | null;
  license: string | null;
  default_branch: string;
  owner: string;
  repo: string;
};

type DeploymentInfo = {
  docker: boolean | null;
  docker_compose: boolean | null;
  kubernetes: boolean | null;
  helm: boolean | null;
  self_hosted: boolean | null;
  cloud_version: boolean | null;
};

type StructuredContent = {
  summary: string;
  best_for: string[];
  not_for: string[];
  pros: string[];
  cons: string[];
  deployment: DeploymentInfo;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractGithubOwnerRepo(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
    }
    return null;
  } catch {
    return null;
  }
}

function findGithubUrl(tool: Tool): string | null {
  if (tool.url?.includes("github.com")) return tool.url;
  const match = (tool.description || "").match(
    /https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+/
  );
  return match?.[0] || null;
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

async function fetchGitHubStats(owner: string, repo: string): Promise<GitHubStats | null> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const [repoRes, contribRes, releaseRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers }),
    ]);

    if (!repoRes.ok) return null;
    const repoData = await repoRes.json();

    // Last commit
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      { headers }
    );
    let lastCommit: string | null = null;
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      lastCommit = commits?.[0]?.commit?.committer?.date || null;
    }

    // Contributors count from Link header
    let contributors = 0;
    if (contribRes.ok) {
      const linkHeader = contribRes.headers.get("Link") || "";
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      contributors = match ? parseInt(match[1]) : 1;
    }

    // Latest release
    let latestRelease: string | null = null;
    if (releaseRes.ok) {
      const rel = await releaseRes.json();
      latestRelease = rel?.tag_name || null;
    }

    return {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      watchers: repoData.watchers_count || 0,
      open_issues: repoData.open_issues_count || 0,
      contributors,
      last_commit: lastCommit,
      latest_release: latestRelease,
      language: repoData.language || null,
      license: repoData.license?.spdx_id || null,
      default_branch: repoData.default_branch || "main",
      owner,
      repo,
    };
  } catch {
    return null;
  }
}

// ─── README fetch ─────────────────────────────────────────────────────────────

async function fetchReadme(owner: string, repo: string, branch: string): Promise<string | null> {
  const candidates = ["README.md", "readme.md", "README.rst", "README"];
  for (const file of candidates) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`
      );
      if (res.ok) {
        const text = await res.text();
        // Strip badges, HTML tags, links — keep plain text
        return text
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/\[.*?\]\(.*?\)/g, "")
          .replace(/<[^>]+>/g, "")
          .replace(/#{1,6}\s/g, "")
          .replace(/\r\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
          .slice(0, README_MAX_CHARS);
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Deployment info parser ───────────────────────────────────────────────────

function parseDeploymentInfo(readme: string | null): DeploymentInfo {
  if (!readme) {
    return {
      docker: null,
      docker_compose: null,
      kubernetes: null,
      helm: null,
      self_hosted: null,
      cloud_version: null,
    };
  }

  const lower = readme.toLowerCase();
  return {
    docker: lower.includes("docker") ? true : null,
    docker_compose: lower.includes("docker-compose") || lower.includes("docker compose") ? true : null,
    kubernetes: lower.includes("kubernetes") || lower.includes("k8s") ? true : null,
    helm: lower.includes("helm") ? true : null,
    self_hosted: lower.includes("self-host") || lower.includes("self host") || lower.includes("on-premise") ? true : true,
    cloud_version: lower.includes("cloud") && (lower.includes("managed") || lower.includes("hosted")) ? true : null,
  };
}

// ─── Cerebras API ─────────────────────────────────────────────────────────────

async function generateWithCerebras(prompt: string): Promise<string | null> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CEREBRAS_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
      }

      if (res.status === 429 && attempt < MAX_RETRIES) {
        await delay(5000 * (attempt + 1));
        continue;
      }

      return null;
    } catch {
      if (attempt < MAX_RETRIES) {
        await delay(3000);
        continue;
      }
      return null;
    }
  }
  return null;
}

// ─── Groq API (fallback) ──────────────────────────────────────────────────────

async function generateWithGroq(prompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
      }

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 8000 * (attempt + 1);
        await delay(waitMs);
        continue;
      }

      return null;
    } catch {
      if (attempt < MAX_RETRIES) {
        await delay(3000);
        continue;
      }
      return null;
    }
  }
  return null;
}

// ─── Structured content generator ────────────────────────────────────────────

async function generateStructuredContent(
  tool: Tool,
  stats: GitHubStats | null,
  readme: string | null
): Promise<StructuredContent | null> {
  const prompt = `You are a technical writer for a developer tools directory. Output ONLY valid JSON — no markdown, no explanation, no code fences.

Base your response ONLY on the information provided below. Do NOT invent features, integrations, or capabilities not mentioned. If information is not available, use null for objects or empty array for lists.

Tool: ${tool.name}
Category: ${tool.category}
GitHub Stars: ${stats?.stars ?? "unknown"}
Language: ${stats?.language ?? tool.language ?? "unknown"}
License: ${stats?.license ?? tool.license ?? "unknown"}
README excerpt:
${readme ?? "Not available"}

Output this exact JSON structure:
{
  "summary": "100-150 word description of what this tool does and who it is for. Base it only on README. No fluff.",
  "best_for": ["use case 1", "use case 2", "use case 3"],
  "not_for": ["limitation 1", "limitation 2"],
  "pros": ["pro 1", "pro 2", "pro 3", "pro 4"],
  "cons": ["con 1", "con 2", "con 3"],
  "deployment": {
    "docker": true or false or null,
    "docker_compose": true or false or null,
    "kubernetes": true or false or null,
    "helm": true or false or null,
    "self_hosted": true or false or null,
    "cloud_version": true or false or null
  }
}`;

  // Try Cerebras first
  let raw = await generateWithCerebras(prompt);

  // Fallback to Groq
  if (!raw) {
    console.warn(`  ⚠️  Cerebras failed for ${tool.name}, trying Groq...`);
    raw = await generateWithGroq(prompt);
  }

  if (!raw) return null;

  // Parse JSON — strip any accidental markdown fences
  try {
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned) as StructuredContent;
  } catch {
    console.error(`  ❌ JSON parse failed for ${tool.name}`);
    return null;
  }
}

// ─── Format ai_content markdown ──────────────────────────────────────────────

function buildAiContent(
  tool: Tool,
  stats: GitHubStats | null,
  content: StructuredContent,
  deployment: DeploymentInfo
): string {
  const lines: string[] = [];

  lines.push(`## ${tool.name}`);
  lines.push("");
  lines.push(content.summary);
  lines.push("");

  if (stats) {
    lines.push("## GitHub Stats");
    lines.push(`- ⭐ Stars: ${stats.stars.toLocaleString()}`);
    lines.push(`- 🍴 Forks: ${stats.forks.toLocaleString()}`);
    lines.push(`- 🐛 Open Issues: ${stats.open_issues}`);
    lines.push(`- 👥 Contributors: ${stats.contributors}`);
    if (stats.last_commit) {
      const d = new Date(stats.last_commit);
      lines.push(`- 🕐 Last Commit: ${d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`);
    }
    if (stats.latest_release) lines.push(`- 🏷️ Latest Release: ${stats.latest_release}`);
    if (stats.language) lines.push(`- 💻 Language: ${stats.language}`);
    if (stats.license) lines.push(`- 📄 License: ${stats.license}`);
    lines.push("");
  }

  // Deployment
  const depEntries = Object.entries(deployment).filter(([, v]) => v !== null);
  if (depEntries.length > 0) {
    lines.push("## Deployment");
    const labels: Record<string, string> = {
      docker: "Docker",
      docker_compose: "Docker Compose",
      kubernetes: "Kubernetes",
      helm: "Helm Chart",
      self_hosted: "Self-Hosted",
      cloud_version: "Cloud Version",
    };
    for (const [key, val] of depEntries) {
      lines.push(`- ${labels[key] ?? key}: ${val ? "✅" : "❌"}`);
    }
    lines.push("");
  }

  if (content.best_for?.length) {
    lines.push("## Best For");
    content.best_for.forEach((b) => lines.push(`- ✓ ${b}`));
    lines.push("");
  }

  if (content.not_for?.length) {
    lines.push("## Not Ideal For");
    content.not_for.forEach((n) => lines.push(`- ✗ ${n}`));
    lines.push("");
  }

  if (content.pros?.length) {
    lines.push("## Pros");
    content.pros.forEach((p) => lines.push(`- ✓ ${p}`));
    lines.push("");
  }

  if (content.cons?.length) {
    lines.push("## Cons");
    content.cons.forEach((c) => lines.push(`- ✗ ${c}`));
    lines.push("");
  }

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as any },
  });

  console.log("🚀 Fetching approved tools...");
  const { data: tools, error } = await supabase
    .from("open_source_tools")
    .select("id, name, slug, description, category, url, github_stars, language, license")
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    
  if (error || !tools) throw new Error(`Failed to fetch tools: ${error?.message}`);
  console.log(`✅ Found ${tools.length} tools\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i] as Tool;
    console.log(`[${i + 1}/${tools.length}] Processing: ${tool.name}`);

    const githubUrl = findGithubUrl(tool);
    if (!githubUrl) {
      console.log(`  ⚠️  No GitHub URL found — skipping`);
      skipped++;
      continue;
    }

    const ref = extractGithubOwnerRepo(githubUrl);
    if (!ref) {
      console.log(`  ⚠️  Could not parse GitHub URL — skipping`);
      skipped++;
      continue;
    }

    // Step 1: GitHub API
    console.log(`  📊 Fetching GitHub stats...`);
    const stats = await fetchGitHubStats(ref.owner, ref.repo);
    if (stats) {
      console.log(`  ✅ Stars: ${stats.stars}, Last commit: ${stats.last_commit?.slice(0, 10) ?? "unknown"}`);
    } else {
      console.log(`  ⚠️  GitHub API failed — continuing without stats`);
    }

    // Step 2: README
    console.log(`  📄 Fetching README...`);
    const branch = stats?.default_branch ?? "main";
    const readme = await fetchReadme(ref.owner, ref.repo, branch);
    const deployment = parseDeploymentInfo(readme);
    if (readme) {
      console.log(`  ✅ README fetched (${readme.length} chars)`);
    } else {
      console.log(`  ⚠️  README not found`);
    }

    // Step 3: AI generation
    console.log(`  🤖 Generating structured content...`);
    const content = await generateStructuredContent(tool, stats, readme);
    if (!content) {
      console.error(`  ❌ AI generation failed for ${tool.name}`);
      failed++;
      await delay(DELAY_MS);
      continue;
    }
    console.log(`  ✅ Content generated`);

    // Build markdown
    const aiContent = buildAiContent(tool, stats, content, deployment);

    // Update Supabase
    const updatePayload: Record<string, any> = {
      ai_content: aiContent,
      deployment_info: deployment,
      best_for: content.best_for ?? [],
      not_for: content.not_for ?? [],
      pros: content.pros ?? [],
      cons: content.cons ?? [],
      readme_excerpt: readme ?? null,
    };

    if (stats) {
      updatePayload.github_stars = stats.stars;
      updatePayload.github_forks = stats.forks;
      updatePayload.github_watchers = stats.watchers;
      updatePayload.github_open_issues = stats.open_issues;
      updatePayload.github_contributors = stats.contributors;
      updatePayload.github_last_commit = stats.last_commit;
      updatePayload.github_latest_release = stats.latest_release;
      if (stats.language) updatePayload.language = stats.language;
      if (stats.license) updatePayload.license = stats.license;
    }

    const { error: updateError } = await supabase
      .from("open_source_tools")
      .update(updatePayload)
      .eq("id", tool.id);

    if (updateError) {
      console.error(`  ❌ DB update failed: ${updateError.message}`);
      failed++;
    } else {
      console.log(`  ✅ Saved to database`);
      success++;
    }

    await delay(DELAY_MS);
  }

  console.log("\n─────────────────────────────────");
  console.log(`✅ Success:  ${success}`);
  console.log(`⚠️  Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`📦 Total:    ${tools.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});