/**
 * generate-tool-structured-content.ts
 *
 * Generates AI content and structured metadata for approved tools using Groq API.
 * Features:
 *   - Exponential backoff retries for Groq API & GitHub API (max 4 attempts, starting at 2s).
 *   - Detailed error cause logging for fetch failures and non-200 responses.
 *   - Auto-retry with JSON reminder if Groq returns invalid JSON.
 *   - Strict validation: marks status as 'success' ONLY when readme_excerpt, pros, cons, best_for, and not_for are non-empty.
 *   - Inter-tool delay (default 3s, configurable via --delay=ms or GROQ_DELAY_MS).
 *   - Support for --limit=N, --retry-failed, and --slug="a,b".
 *   - Grouped failure summary report.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as ws from "ws";
import { getGroqModel } from "./ai-config";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";
import { normalizeLicense } from "../lib/utils/license";
import {
  scrapeWebsiteContent,
  getFirecrawlDelayMs,
  WEBSITE_ENRICHMENT_GROUNDING_RULES,
} from "../lib/firecrawl-enrichment";

dotenv.config({ path: ".env.local" });

// ─── Config & Constants ───────────────────────────────────────────────────────

const README_MAX_CHARS = 800;
const MAX_HTTP_ATTEMPTS = 4;
const INITIAL_BACKOFF_MS = 2000;

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
  pricing_info: string | null;
  key_features: string[] | null;
  integrations: string[] | null;
  enrichment_completed_at: string | null;
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
  pricing_info: string | null;
  key_features: string[];
  integrations: string[];
};

type FailureRecord = {
  tool: string;
  reason: string;
};

type FetchResult = {
  ok: boolean;
  status: number;
  statusText: string;
  body: string;
  headers: Headers;
  errorCause?: string;
};

// ─── CLI Options Parsing ──────────────────────────────────────────────────────

function getOptionValue(name: string): string | null {
  const inlinePrefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(inlinePrefix));
  if (inline) {
    let val = inline.slice(inlinePrefix.length);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return val;
  }

  const index = process.argv.indexOf(name);
  const next = index >= 0 ? process.argv[index + 1] : undefined;
  if (next && !next.startsWith("--")) {
    let val = next;
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return val;
  }

  return null;
}

function getDelayMs(): number {
  const cliVal = getOptionValue("--delay");
  if (cliVal !== null) {
    const parsed = Number.parseInt(cliVal, 10);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  const envVal = Number.parseInt(process.env.GROQ_DELAY_MS ?? "3000", 10);
  if (Number.isFinite(envVal) && envVal >= 0) return envVal;

  return 3000;
}

function getLimit(): number | null {
  const value = getOptionValue("--limit");
  if (value === null) return null;

  const limit = Number.parseInt(value, 10);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer, e.g. --limit=20");
  }

  return limit;
}

function getSlugFilter(): string[] {
  const value = getOptionValue("--slug");
  if (value === null) return [];

  const slugs = value
    .split(",")
    .map((slug) => slug.trim().replace(/^["']|["']$/g, "").toLowerCase())
    .filter(Boolean);

  if (slugs.length === 0) {
    throw new Error("--slug must contain at least one slug, e.g. --slug=\"n8n,supabase\"");
  }

  return [...new Set(slugs)];
}

function isRetryFailedRun(): boolean {
  return (
    process.argv.includes("--retry-failed") ||
    process.argv.includes("--retry-skipped")
  );
}

function isForceRun(): boolean {
  return process.argv.includes("--force");
}

function isForceRecheckRun(): boolean {
  return process.argv.includes("--force-recheck");
}

// ─── Helpers & Utilities ──────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatErrorDetails(error: unknown): string {
  if (!error || typeof error !== "object") {
    return `message=${String(error)}`;
  }

  const err = error as {
    message?: unknown;
    cause?: unknown;
    status?: unknown;
    statusCode?: unknown;
    response?: { data?: unknown };
  };
  const details: string[] = [];

  if (err.message !== undefined) details.push(`message=${String(err.message)}`);
  if (err.cause !== undefined) {
    const causeStr = typeof err.cause === "object" ? JSON.stringify(err.cause) : String(err.cause);
    details.push(`cause=${causeStr}`);
  }
  if (err.status !== undefined) details.push(`status=${String(err.status)}`);
  if (err.statusCode !== undefined) details.push(`statusCode=${String(err.statusCode)}`);
  if (err.response?.data !== undefined) {
    const data = typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
    details.push(`response.data=${data.slice(0, 300)}`);
  }

  return details.join("; ") || `details=${JSON.stringify(error)}`;
}

function parseRateLimitWaitMs(headers: Headers, body: string, attempt: number): number {
  const retryAfter = headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number.parseFloat(retryAfter) : NaN;
  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(0, retryAfterSeconds * 1000) + 1000;
  }

  const messageSeconds = body.match(/try again in\s+([\d.]+)s/i)?.[1];
  const parsedMessageSeconds = messageSeconds ? Number.parseFloat(messageSeconds) : NaN;
  if (Number.isFinite(parsedMessageSeconds)) {
    return Math.max(0, parsedMessageSeconds * 1000) + 1000;
  }

  // Exponential backoff default: 2s, 4s, 8s, 16s
  return INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
}

// ─── Universal HTTP Fetcher with Retry & Detailed Cause Logging ─────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  contextName: string
): Promise<FetchResult> {
  let lastErrorMsg = "";

  for (let attempt = 1; attempt <= MAX_HTTP_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, options);
      const bodyText = await res.text();

      // Successful HTTP response (200-299)
      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          statusText: res.statusText,
          body: bodyText,
          headers: res.headers,
        };
      }

      // Do NOT retry on 401 Unauthorized or 404 Not Found
      if (res.status === 401 || res.status === 404) {
        const snippet = bodyText.slice(0, 300).trim();
        lastErrorMsg = `HTTP ${res.status} ${res.statusText}${snippet ? `: ${snippet}` : ""}`;
        console.error(`  ❌ [${contextName}] ${lastErrorMsg} (no retry on ${res.status})`);
        return {
          ok: false,
          status: res.status,
          statusText: res.statusText,
          body: bodyText,
          headers: res.headers,
          errorCause: lastErrorMsg,
        };
      }

      // Retryable HTTP status codes: 429 Rate Limit, 5xx Server Error
      const snippet = bodyText.slice(0, 300).trim();
      lastErrorMsg = `HTTP ${res.status} ${res.statusText}${snippet ? `: ${snippet}` : ""}`;

      if (res.status === 429 || res.status >= 500) {
        const waitMs = parseRateLimitWaitMs(res.headers, bodyText, attempt);
        if (attempt < MAX_HTTP_ATTEMPTS) {
          console.warn(
            `  ⚠️ [${contextName}] ${lastErrorMsg} (attempt ${attempt}/${MAX_HTTP_ATTEMPTS}). Retrying in ${waitMs}ms...`
          );
          await delay(waitMs);
          continue;
        }
      }

      // Other non-200 errors (e.g. 400, 403, 422)
      console.error(`  ❌ [${contextName}] ${lastErrorMsg} (attempt ${attempt}/${MAX_HTTP_ATTEMPTS})`);
      if (attempt < MAX_HTTP_ATTEMPTS) {
        const waitMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        await delay(waitMs);
        continue;
      }

      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        body: bodyText,
        headers: res.headers,
        errorCause: lastErrorMsg,
      };
    } catch (err: unknown) {
      // Handles network failures (e.g. "TypeError: fetch failed")
      const cause = (err as any)?.cause;
      const causeStr = cause ? (typeof cause === "object" ? JSON.stringify(cause) : String(cause)) : "";
      lastErrorMsg = `Fetch error: ${(err as Error).message}${causeStr ? ` (cause: ${causeStr})` : ""}`;

      console.error(
        `  ❌ [${contextName}] ${lastErrorMsg} (attempt ${attempt}/${MAX_HTTP_ATTEMPTS})`
      );

      if (attempt < MAX_HTTP_ATTEMPTS) {
        const waitMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        await delay(waitMs);
        continue;
      }

      return {
        ok: false,
        status: 0,
        statusText: "Fetch Exception",
        body: "",
        headers: new Headers(),
        errorCause: lastErrorMsg,
      };
    }
  }

  return {
    ok: false,
    status: 0,
    statusText: "Max Attempts Exceeded",
    body: "",
    headers: new Headers(),
    errorCause: lastErrorMsg || "Max attempts exceeded",
  };
}

// ─── Firecrawl Logging ────────────────────────────────────────────────────────

function logFirecrawlConfiguration(): void {
  const key = process.env.FIRECRAWL_API_KEY?.trim();
  if (!key) {
    console.warn("⚠️ FIRECRAWL_API_KEY is missing or empty; website scraping will be skipped.");
    return;
  }

  const looksMalformed = key.length < 20 || !/^fc-/i.test(key);
  if (looksMalformed) {
    console.warn("⚠️ FIRECRAWL_API_KEY is present but may be malformed; it will not be printed.");
    return;
  }

  console.log("✅ FIRECRAWL_API_KEY is configured (value hidden).");
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

// ─── GitHub API Integration ───────────────────────────────────────────────────

async function fetchGitHubStats(owner: string, repo: string, toolName: string): Promise<GitHubStats | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const request = (url: string, label: string) =>
    fetchWithRetry(url, { headers }, `GitHub API (${label})`);

  const [repoRes, contribRes, releaseRes] = await Promise.all([
    request(`https://api.github.com/repos/${owner}/${repo}`, "repo"),
    request(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, "contributors"),
    request(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, "release"),
  ]);

  if (!repoRes.ok) {
    console.error(`  ❌ GitHub repo fetch failed for ${toolName}: ${repoRes.errorCause}`);
    return null;
  }

  let repoData: any;
  try {
    repoData = JSON.parse(repoRes.body);
  } catch (err) {
    console.error(`  ❌ Invalid JSON from GitHub repo API for ${toolName}: ${formatErrorDetails(err)}`);
    return null;
  }

  // Last commit
  const commitsRes = await request(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
    "commits"
  );
  let lastCommit: string | null = null;
  if (commitsRes.ok) {
    try {
      const commits = JSON.parse(commitsRes.body);
      lastCommit = commits?.[0]?.commit?.committer?.date || null;
    } catch {}
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
    try {
      const rel = JSON.parse(releaseRes.body);
      latestRelease = rel?.tag_name || null;
    } catch {}
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
}

// ─── README fetch ─────────────────────────────────────────────────────────────

async function fetchReadme(owner: string, repo: string, branch: string): Promise<string | null> {
  const candidates = ["README.md", "readme.md", "README.rst", "README"];
  for (const file of candidates) {
    const res = await fetchWithRetry(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`,
      {},
      `README (${file})`
    );

    if (res.ok && res.body) {
      // Strip badges, HTML tags, links — keep plain text
      return res.body
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/#{1,6}\s/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, README_MAX_CHARS);
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

// ─── Groq API Integration ─────────────────────────────────────────────────────

async function generateWithGroq(prompt: string, toolName: string): Promise<{ text: string | null; errorReason?: string }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return { text: null, errorReason: "GROQ_API_KEY missing" };
  }

  const model = getGroqModel();
  const res = await fetchWithRetry(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    },
    `Groq API (${toolName})`
  );

  if (!res.ok) {
    return { text: null, errorReason: res.errorCause || `Groq HTTP ${res.status}` };
  }

  try {
    const data = JSON.parse(res.body);
    const content = data.choices?.[0]?.message?.content?.trim() || null;
    if (!content) {
      return { text: null, errorReason: "Groq returned empty response choices" };
    }
    return { text: content };
  } catch (err) {
    return { text: null, errorReason: `Groq response JSON parse error: ${formatErrorDetails(err)}` };
  }
}

// ─── Code Fence Stripper & JSON Parser ────────────────────────────────────────

function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }
  return cleaned;
}

function tryParseJSON<T>(rawText: string): T | null {
  const cleaned = stripCodeFences(rawText);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0].trim()) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── Structured content generator ────────────────────────────────────────────

async function generateStructuredContent(
  tool: Tool,
  stats: GitHubStats | null,
  readme: string | null,
  websiteContent: string | null
): Promise<{ content: StructuredContent | null; errorReason?: string }> {
  const sourceGuidance = stats === null
    ? `
This tool has no GitHub or README data. Use only the short description provided below.
Keep every generated field brief: summary must be 1-2 short sentences, and every item in
best_for, not_for, pros, and cons must be one short sentence. Do not add details that are
not supported by the description; use empty arrays or null when the description does not
support a field.`
    : "";

  const basePrompt = `IMPORTANT: Your entire response must be a single valid JSON object. Start your response with { and end with }. No text before or after. No markdown. No code fences. No explanation.

You are a technical writer for a developer tools directory.
Base your response ONLY on the information provided below. Do NOT invent features, integrations, pricing, or capabilities not mentioned. If information is not available, use null for objects or empty array for lists.
${sourceGuidance}

Tool: ${tool.name}
Category: ${tool.category}
GitHub Stars: ${stats?.stars ?? "unknown"}
Language: ${stats?.language ?? tool.language ?? "unknown"}
License: ${stats?.license ?? tool.license ?? "unknown"}
README excerpt:
${readme ?? "Not available"}
Official website content:
${websiteContent || "Not available"}

${WEBSITE_ENRICHMENT_GROUNDING_RULES}

Output this exact JSON structure:
{
  "summary": "100-150 word description of what this tool does and who it is for. Base it only on README. No fluff.",
  "best_for": ["use case 1", "use case 2", "use case 3"],
  "not_for": ["limitation 1", "limitation 2"],
  "pros": ["pro 1", "pro 2", "pro 3", "pro 4"],
  "cons": ["con 1", "con 2", "con 3"],
  "pricing_info": null,
  "key_features": [],
  "integrations": [],
  "deployment": {
    "docker": true or false or null,
    "docker_compose": true or false or null,
    "kubernetes": true or false or null,
    "helm": true or false or null,
    "self_hosted": true or false or null,
    "cloud_version": true or false or null
  }
}`;

  // First Attempt
  const groqRes1 = await generateWithGroq(basePrompt, tool.name);
  if (!groqRes1.text) {
    return { content: null, errorReason: groqRes1.errorReason || "Groq generation failed" };
  }

  const parsed1 = tryParseJSON<StructuredContent>(groqRes1.text);
  if (parsed1) {
    return { content: parsed1 };
  }

  // Attempt 2 with explicit JSON reminder if Groq returned invalid JSON
  console.warn(`  ⚠️ Groq returned invalid JSON for ${tool.name}. Retrying once with JSON reminder...`);
  const reminderPrompt = `${basePrompt}\n\nCRITICAL: Your previous response contained invalid JSON. Return ONLY a valid JSON object matching the requested schema. No code fences, no extra text.`;
  const groqRes2 = await generateWithGroq(reminderPrompt, tool.name);

  if (!groqRes2.text) {
    return { content: null, errorReason: groqRes2.errorReason || "Groq retry generation failed" };
  }

  const parsed2 = tryParseJSON<StructuredContent>(groqRes2.text);
  if (parsed2) {
    return { content: parsed2 };
  }

  const snippet = groqRes2.text.slice(0, 200);
  return {
    content: null,
    errorReason: `Groq returned invalid JSON after retry (snippet: ${JSON.stringify(snippet)})`,
  };
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
  const depEntries = Object.entries(deployment || {}).filter(([, v]) => v !== null);
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

  if (content.pricing_info) {
    lines.push("## Pricing");
    lines.push(content.pricing_info);
    lines.push("");
  }

  if (content.key_features?.length) {
    lines.push("## Key Features");
    content.key_features.forEach((feature) => lines.push(`- ${feature}`));
    lines.push("");
  }

  if (content.integrations?.length) {
    lines.push("## Integrations");
    content.integrations.forEach((integration) => lines.push(`- ${integration}`));
    lines.push("");
  }

  return lines.join("\n");
}

async function validateGroqModel(model: string): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable not set");
  }

  const res = await fetchWithRetry(
    "https://api.groq.com/openai/v1/chat/completions",
    {
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
    },
    "Groq Preflight"
  );

  if (!res.ok) {
    throw new Error(`Groq model preflight failed for ${model}: ${res.errorCause || `HTTP ${res.status}`}`);
  }
}

// ─── Strict Field Validator ───────────────────────────────────────────────────

function validateStructuredData(
  readme: string | null,
  content: StructuredContent | null
): { valid: boolean; missingFields: string[] } {
  const missing: string[] = [];

  if (!readme || readme.trim().length === 0) {
    missing.push("readme_excerpt");
  }

  if (!content) {
    missing.push("structured_content");
    return { valid: false, missingFields: missing };
  }

  const countValid = (arr: unknown) =>
    Array.isArray(arr) ? arr.filter((s) => typeof s === "string" && s.trim().length > 0).length : 0;

  if (countValid(content.best_for) === 0) missing.push("best_for");
  if (countValid(content.not_for) === 0) missing.push("not_for");
  if (countValid(content.pros) === 0) missing.push("pros");
  if (countValid(content.cons) === 0) missing.push("cons");

  return { valid: missing.length === 0, missingFields: missing };
}

// ─── Main Execution Pipeline ──────────────────────────────────────────────────

async function main() {
  console.log("RAW ARGV:", JSON.stringify(process.argv));

  const missingKeys = ["GROQ_API_KEY"].filter(
    (name) => !process.env[name]?.trim()
  );
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missingKeys.join(", ")}`);
  }

  if (!process.env.GITHUB_TOKEN?.trim()) {
    console.warn("⚠️  GITHUB_TOKEN is not set; GitHub API requests will use the unauthenticated rate limit.");
  }
  logFirecrawlConfiguration();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as any },
  });

  const groqModel = getGroqModel();
  const delayMs = getDelayMs();
  console.log(`🤖 Using Groq model: ${groqModel}`);
  console.log(`⏱️ Inter-tool delay: ${delayMs}ms (override with --delay=ms or GROQ_DELAY_MS)`);
  console.log("🔎 Checking Groq model availability...");
  await validateGroqModel(groqModel);
  console.log("✅ Groq model is available.");

  const retryRun = isRetryFailedRun();
  const limit = getLimit();
  const slugFilter = getSlugFilter();
  const forceRun = isForceRun();
  const forceRecheckRun = isForceRecheckRun();

  console.log(
    slugFilter.length > 0
      ? `🎯 Fetching requested slugs: ${slugFilter.join(", ")}`
      : retryRun
        ? "🔁 Fetching tools with NULL or 'failed' status for retry..."
        : forceRecheckRun
          ? "🔄 Fetching already-enriched successful tools for recheck..."
          : forceRun
            ? "♻️ Fetching successful tools not yet enriched..."
            : "🚀 Fetching tools with NULL or 'failed' status..."
  );

  const fetchedTools = await fetchAllSupabaseRows<Tool>(() => {
    let query = supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, github_stars, language, license, pricing_info, key_features, integrations, enrichment_completed_at, structured_content_status")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (slugFilter.length > 0) {
      return query.in("slug", slugFilter);
    }

    query = query.eq("status", "approved");

    if (forceRecheckRun) {
      return query
        .eq("structured_content_status", "success")
        .not("enrichment_completed_at", "is", null);
    }
    if (forceRun) {
      return query
        .eq("structured_content_status", "success")
        .is("enrichment_completed_at", null);
    }

    // Default & --retry-failed: fetch tools where structured_content_status is NULL or 'failed'
    return query.or("structured_content_status.is.null,structured_content_status.eq.failed");
  });

  const tools = limit === null ? fetchedTools : fetchedTools.slice(0, limit);
  console.log(`✅ Found ${fetchedTools.length} matching tools; processing ${tools.length}${limit === null ? "" : ` due to --limit=${limit}`}\n`);
  console.log(`🔥 Firecrawl delay: ${getFirecrawlDelayMs()}ms between website requests (override with FIRECRAWL_DELAY_MS)`);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failureReasons: FailureRecord[] = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i] as Tool;
    console.log(`[${i + 1}/${tools.length}] Processing: ${tool.name} (${tool.slug})`);

    const githubUrl = findGithubUrl(tool);
    if (!githubUrl) {
      if (!tool.description || tool.description.length < 50) {
        console.log(`  ⚠️  No GitHub URL and description too short — skipping`);
        const { error: statusError } = await supabase
          .from("open_source_tools")
          .update({ structured_content_status: "skipped" })
          .eq("id", tool.id);
        if (statusError) console.error(`  ❌ Failed to save skipped status: ${statusError.message}`);
        skippedCount++;
        await delay(delayMs);
        continue;
      }
    }

    const ref = githubUrl ? extractGithubOwnerRepo(githubUrl) : null;
    if (githubUrl && !ref) {
      console.log(`  ⚠️  Could not parse GitHub URL (${githubUrl}) — skipping`);
      const { error: statusError } = await supabase
        .from("open_source_tools")
        .update({ structured_content_status: "skipped" })
        .eq("id", tool.id);
      if (statusError) console.error(`  ❌ Failed to save skipped status: ${statusError.message}`);
      skippedCount++;
      await delay(delayMs);
      continue;
    }

    // Step 1: GitHub API
    let stats: GitHubStats | null = null;
    if (ref) {
      console.log(`  📊 Fetching GitHub stats for ${ref.owner}/${ref.repo}...`);
      stats = await fetchGitHubStats(ref.owner, ref.repo, tool.name);
      if (stats) {
        console.log(`  ✅ Stars: ${stats.stars}, Last commit: ${stats.last_commit?.slice(0, 10) ?? "unknown"}`);
      } else {
        console.log(`  ⚠️  GitHub API failed or repo not found — continuing without stats`);
      }
    }

    // Step 2: README
    let readme: string | null = null;
    if (ref) {
      console.log(`  📄 Fetching README...`);
      const branch = stats?.default_branch ?? "main";
      readme = await fetchReadme(ref.owner, ref.repo, branch);
      if (readme) {
        console.log(`  ✅ README fetched (${readme.length} chars)`);
      } else {
        console.log(`  ⚠️  README not found`);
      }
    } else {
      // Fallback README excerpt from description if no GitHub repo
      readme = tool.description.slice(0, README_MAX_CHARS);
    }

    const deployment = parseDeploymentInfo(readme);
    const websiteContent = await scrapeWebsiteContent(tool.url, tool.name);
    if (websiteContent) console.log(`  ✅ Website content fetched (${websiteContent.length} chars)`);

    // Step 3: AI generation
    console.log(`  🤖 Generating structured content with Groq...`);
    const { content, errorReason: aiErrorReason } = await generateStructuredContent(
      tool,
      stats,
      readme,
      websiteContent
    );

    // Step 4: Strict Field Validation (readme_excerpt, pros, cons, best_for, not_for)
    const validation = validateStructuredData(readme, content);

    if (!content || !validation.valid) {
      const reason = aiErrorReason || `Missing required field(s): ${validation.missingFields.join(", ")}`;
      console.error(`  ❌ Validation failed for ${tool.name}: ${reason}`);

      // Save ONLY failed status, NEVER partial content
      const { error: statusError } = await supabase
        .from("open_source_tools")
        .update({ structured_content_status: "failed" })
        .eq("id", tool.id);

      if (statusError) {
        console.error(`  ❌ Failed to save failed status to DB: ${statusError.message}`);
      }

      failedCount++;
      failureReasons.push({ tool: tool.name, reason });
      await delay(delayMs);
      continue;
    }

    // Validation passed: build markdown and update database with 'success'
    console.log(`  ✅ Content generated and verified non-empty`);
    const aiContent = buildAiContent(tool, stats, content, deployment);

    const updatePayload: Record<string, any> = {
      ai_content: aiContent,
      deployment_info: deployment,
      best_for: content.best_for,
      not_for: content.not_for,
      pros: content.pros,
      cons: content.cons,
      pricing_info: content.pricing_info ?? null,
      key_features: content.key_features ?? [],
      integrations: content.integrations ?? [],
      readme_excerpt: readme,
      enrichment_completed_at: new Date().toISOString(),
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
      const dbReason = `DB update failed: ${updateError.message}`;
      console.error(`  ❌ ${dbReason}`);
      await supabase
        .from("open_source_tools")
        .update({ structured_content_status: "failed" })
        .eq("id", tool.id);
      failedCount++;
      failureReasons.push({ tool: tool.name, reason: dbReason });
    } else {
      console.log(`  ✅ Saved status='success' to database`);
      successCount++;
    }

    await delay(delayMs);
  }

  // ─── Requirement 7: Final Summary ──────────────────────────────────────────

  console.log("\n──────────────────────────────────────────────────");
  console.log("📊 BATCH PROCESS SUMMARY");
  console.log("──────────────────────────────────────────────────");
  console.log(`📦 Processed: ${tools.length}`);
  console.log(`✅ Success:   ${successCount}`);
  console.log(`❌ Failed:    ${failedCount}`);
  console.log(`⚠️  Skipped:   ${skippedCount}`);

  if (failedCount > 0 && failureReasons.length > 0) {
    console.log("\n❌ Failed Reasons (Grouped):");
    const grouped = new Map<string, string[]>();
    for (const item of failureReasons) {
      const list = grouped.get(item.reason) || [];
      list.push(item.tool);
      grouped.set(item.reason, list);
    }

    for (const [reason, toolList] of grouped.entries()) {
      console.log(`\n  • ${reason} (${toolList.length} tool${toolList.length === 1 ? "" : "s"}):`);
      console.log(`    - ${toolList.join(", ")}`);
    }
  }
  console.log("──────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
