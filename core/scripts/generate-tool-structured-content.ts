/**
 * generate-tool-structured-content.ts
 *
 * Overwrites ai_content and structured columns for all approved tools.
 * Pipeline per tool:
 *   1. GitHub API  → stats
 *   2. raw.githubusercontent.com → README excerpt
 *   3. Groq → structured JSON
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as ws from "ws";
import { getGroqModel } from "./ai-config";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";
import { normalizeLicense } from "../lib/utils/license";

dotenv.config({ path: ".env.local" });

// ─── Config ──────────────────────────────────────────────────────────────────

const configuredDelayMs = Number.parseInt(process.env.GROQ_DELAY_MS ?? "8000", 10);
const DELAY_MS = Number.isFinite(configuredDelayMs) && configuredDelayMs >= 0
  ? configuredDelayMs
  : 8000;
const RATE_LIMIT_BUFFER_MS = 1000;
const MAX_RETRIES = 2;
const JSON_PARSE_RETRIES = 1;
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
  structured_content_status: StructuredContentStatus | null;
};

type StructuredContentStatus = "success" | "failed" | "skipped";

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

class GroqDailyQuotaError extends Error {
  constructor(public readonly toolName: string) {
    super(`Groq rate limit persisted while generating content for ${toolName}`);
    this.name = "GroqDailyQuotaError";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatErrorDetails(error: unknown): string {
  if (!error || typeof error !== "object") {
    return `message=${String(error)}`;
  }

  const value = error as {
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
    response?: { data?: unknown };
  };
  const details: string[] = [];

  if (value.message !== undefined) details.push(`message=${String(value.message)}`);
  if (value.status !== undefined) details.push(`status=${String(value.status)}`);
  if (value.statusCode !== undefined) details.push(`statusCode=${String(value.statusCode)}`);
  if (value.response?.data !== undefined) {
    const data = typeof value.response.data === "string"
      ? value.response.data
      : JSON.stringify(value.response.data);
    details.push(`response.data=${data}`);
  }

  return details.join("; ") || `details=${JSON.stringify(error)}`;
}

function logHttpFailure(provider: string, toolName: string, response: Response, body: string): void {
  console.error(
    `  ❌ ${provider} failed for ${toolName}: ` +
      formatErrorDetails({
        message: `HTTP ${response.status} ${response.statusText}`,
        status: response.status,
        response: { data: body },
      })
  );

  if (body.includes("json_validate_failed")) {
    try {
      const parsed = JSON.parse(body) as { error?: { failed_generation?: unknown } };
      const failedGeneration = parsed.error?.failed_generation;
      if (failedGeneration !== undefined) {
        const preview = String(failedGeneration).slice(0, 500);
        console.error(`  ↳ failed_generation=${JSON.stringify(`${preview}${String(failedGeneration).length > 500 ? "..." : ""}`)}`);
      }
    } catch {
      console.error(`  ↳ failed_generation unavailable: invalid error response JSON`);
    }
  }
}

function getRateLimitWaitMs(response: Response, body: string, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number.parseFloat(retryAfter) : NaN;
  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(0, retryAfterSeconds * 1000) + RATE_LIMIT_BUFFER_MS;
  }

  const messageSeconds = body.match(/try again in\s+([\d.]+)s/i)?.[1];
  const parsedMessageSeconds = messageSeconds ? Number.parseFloat(messageSeconds) : NaN;
  if (Number.isFinite(parsedMessageSeconds)) {
    return Math.max(0, parsedMessageSeconds * 1000) + RATE_LIMIT_BUFFER_MS;
  }

  return DELAY_MS * (attempt + 1) + RATE_LIMIT_BUFFER_MS;
}

function isRetryRun(): boolean {
  return process.argv.includes("--retry-failed") || process.argv.includes("--retry-skipped");
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

async function fetchGitHubStats(owner: string, repo: string, toolName: string): Promise<GitHubStats | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const request = async (url: string): Promise<Response> => {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        logHttpFailure("GitHub API", toolName, response, await response.text());
      }
      return response;
    };

    const [repoRes, contribRes, releaseRes] = await Promise.all([
      request(`https://api.github.com/repos/${owner}/${repo}`),
      request(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`),
      request(`https://api.github.com/repos/${owner}/${repo}/releases/latest`),
    ]);

    if (!repoRes.ok) return null;
    const repoData = await repoRes.json();

    // Last commit
    const commitsRes = await request(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
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
      license: normalizeLicense(repoData.license?.spdx_id),
      default_branch: repoData.default_branch || "main",
      owner,
      repo,
    };
  } catch (error) {
    console.error(`  ❌ GitHub API request failed for ${toolName}: ${formatErrorDetails(error)}`);
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

// ─── Groq API ─────────────────────────────────────────────────────────────────

async function generateWithGroq(prompt: string, toolName: string): Promise<string | null> {
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
        model: getGroqModel(),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
      }

      const errorBody = await res.text();
      logHttpFailure("Groq", toolName, res, errorBody);

      if (res.status === 429) {
        if (attempt < MAX_RETRIES) {
          const waitMs = getRateLimitWaitMs(res, errorBody, attempt);
          console.warn(
            `  ⚠️ Groq rate limit for ${toolName}; retry ${attempt + 1}/${MAX_RETRIES} after ${waitMs}ms.`
          );
          await delay(waitMs);
          continue;
        }

        throw new GroqDailyQuotaError(toolName);
      }

      return null;
    } catch (error) {
      console.error(`  ❌ Groq request failed for ${toolName}: ${formatErrorDetails(error)}`);
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
  const sourceGuidance = stats === null
    ? `
This tool has no GitHub or README data. Use only the short description provided below.
Keep every generated field brief: summary must be 1-2 short sentences, and every item in
best_for, not_for, pros, and cons must be one short sentence. Do not add details that are
not supported by the description; use empty arrays or null when the description does not
support a field.`
    : "";

  const prompt = `IMPORTANT: Your entire response must be a single valid JSON object. Start your response with { and end with }. No text before or after. No markdown. No code fences. No explanation.

You are a technical writer for a developer tools directory.
Base your response ONLY on the information provided below. Do NOT invent features, integrations, or capabilities not mentioned. If information is not available, use null for objects or empty array for lists.
${sourceGuidance}

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

  for (let parseAttempt = 0; parseAttempt <= JSON_PARSE_RETRIES; parseAttempt++) {
    const raw = await generateWithGroq(prompt, tool.name);

    if (!raw) {
      console.error(`  ❌ Groq generation failed for ${tool.name}. See provider error details above.`);
      return null;
    }

    // JSON mode should return an object, but keep a defensive extraction for provider output.
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Provider returned no JSON object");
      }

      return JSON.parse(jsonMatch[0].trim()) as StructuredContent;
    } catch (error) {
      const rawPreview = raw.slice(0, 500);
      const truncatedSuffix = raw.length > 500 ? "..." : "";
      console.error(
        `  ❌ JSON parse failed for ${tool.name} (attempt ${parseAttempt + 1}/${JSON_PARSE_RETRIES + 1}): ${formatErrorDetails(error)} raw=${JSON.stringify(`${rawPreview}${truncatedSuffix}`)}`
      );

      if (parseAttempt < JSON_PARSE_RETRIES) {
        console.warn(`  🔁 Retrying JSON generation for ${tool.name} after parse failure...`);
        continue;
      }

      return null;
    }
  }

  return null;
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

async function validateGroqModel(model: string): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable not set");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with OK." }],
      temperature: 0,
      max_tokens: 4,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq model preflight failed for ${model}: ${response.status} - ${error}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const missingKeys = ["GROQ_API_KEY"].filter(
    (name) => !process.env[name]?.trim()
  );
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missingKeys.join(", ")}`);
  }

  if (!process.env.GITHUB_TOKEN?.trim()) {
    console.warn("⚠️  GITHUB_TOKEN is not set; GitHub API requests will use the unauthenticated rate limit.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as any },
  });

  const groqModel = getGroqModel();
  console.log(`🤖 Using Groq model: ${groqModel}`);
  console.log(`⏱️ Delay between Groq calls: ${DELAY_MS}ms (override with GROQ_DELAY_MS)`);
  console.log("🔎 Checking Groq model availability...");
  await validateGroqModel(groqModel);
  console.log("✅ Groq model is available.");

  const retryRun = isRetryRun();
  console.log(retryRun ? "🔁 Fetching failed/skipped tools for retry..." : "🚀 Fetching approved tools...");
  const tools = await fetchAllSupabaseRows<Tool>(() => {
    const query = supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, github_stars, language, license, structured_content_status")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    return retryRun
      ? query.in("structured_content_status", ["failed", "skipped"])
      : query.or("structured_content_status.is.null,structured_content_status.neq.success");
  });
  console.log(`✅ Found ${tools.length} tools\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;
  let dailyQuotaReached = false;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i] as Tool;
    console.log(`[${i + 1}/${tools.length}] Processing: ${tool.name}`);

    const githubUrl = findGithubUrl(tool);
    if (!githubUrl) {
  if (!tool.description || tool.description.length < 50) {
    console.log(`  ⚠️  No GitHub URL and no description — skipping`);
    const { error: statusError } = await supabase
      .from("open_source_tools")
      .update({ structured_content_status: "skipped" })
      .eq("id", tool.id);
    if (statusError) console.error(`  ❌ Failed to save skipped status: ${statusError.message}`);
    skipped++;
    continue;
  }
  console.log(`  📝 No GitHub — using description only...`);
  let content: StructuredContent | null;
  try {
    content = await generateStructuredContent(tool, null, tool.description.slice(0, 800));
  } catch (error) {
    if (error instanceof GroqDailyQuotaError) {
      dailyQuotaReached = true;
      break;
    }
    throw error;
  }
  if (!content) {
    const { error: statusError } = await supabase
      .from("open_source_tools")
      .update({ structured_content_status: "failed" })
      .eq("id", tool.id);
    if (statusError) console.error(`  ❌ Failed to save failed status: ${statusError.message}`);
    failed++;
    await delay(DELAY_MS);
    continue;
  }
  const aiContent = buildAiContent(tool, null, content, content.deployment);
  const { error: updateError } = await supabase.from("open_source_tools").update({
    ai_content: aiContent,
    best_for: content.best_for ?? [],
    not_for: content.not_for ?? [],
    pros: content.pros ?? [],
    cons: content.cons ?? [],
    deployment_info: content.deployment,
    structured_content_status: "success",
  }).eq("id", tool.id);
  if (updateError) {
    console.error(`  ❌ DB update failed: ${updateError.message}`);
    failed++;
  } else {
  success++;
  }
  await delay(DELAY_MS);
  continue;
}

    const ref = extractGithubOwnerRepo(githubUrl);
    if (!ref) {
      console.log(`  ⚠️  Could not parse GitHub URL — skipping`);
      const { error: statusError } = await supabase
        .from("open_source_tools")
        .update({ structured_content_status: "skipped" })
        .eq("id", tool.id);
      if (statusError) console.error(`  ❌ Failed to save skipped status: ${statusError.message}`);
      skipped++;
      continue;
    }

    // Step 1: GitHub API
    console.log(`  📊 Fetching GitHub stats...`);
    const stats = await fetchGitHubStats(ref.owner, ref.repo, tool.name);
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
    let content: StructuredContent | null;
    try {
      content = await generateStructuredContent(tool, stats, readme);
    } catch (error) {
      if (error instanceof GroqDailyQuotaError) {
        dailyQuotaReached = true;
        break;
      }
      throw error;
    }
    if (!content) {
      console.error(`  ❌ AI generation failed for ${tool.name}; status=failed`);
      const { error: statusError } = await supabase
        .from("open_source_tools")
        .update({ structured_content_status: "failed" })
        .eq("id", tool.id);
      if (statusError) console.error(`  ❌ Failed to save failed status: ${statusError.message}`);
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
      structured_content_status: "success",
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
  if (dailyQuotaReached) {
    console.error(
      `⛔ Daily token limit reached — ${success + skipped + failed}/${tools.length} tools processed. `+
        "Resume with --retry-failed after quota resets."
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
