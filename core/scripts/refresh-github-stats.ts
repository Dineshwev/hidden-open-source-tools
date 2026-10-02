/**
 * refresh-github-stats.ts
 *
 * For every tool with status='approved' AND structured_content_status='success'
 * that has a GitHub repo URL, fetches from GitHub API:
 *   - stargazers_count
 *   - forks_count
 *   - open_issues_count
 *   - pushed_at  (used as last commit date proxy)
 *   - license.spdx_id
 *   - archived
 *
 * Updates the tool row and sets github_checked_at = now().
 * Uses GITHUB_TOKEN env var (optional but strongly recommended).
 * 500ms inter-request delay. Skips on 404. Logs a final summary.
 *
 * Run:
 *   npx tsx scripts/refresh-github-stats.ts
 *   npx tsx scripts/refresh-github-stats.ts --limit=50
 *   npx tsx scripts/refresh-github-stats.ts --slug="automatisch,n8n"
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as ws from "ws";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";
import { normalizeLicense } from "../lib/utils/license";

dotenv.config({ path: ".env.local" });

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_HTTP_ATTEMPTS = 4;
const INITIAL_BACKOFF_MS = 2000;
const DEFAULT_DELAY_MS = 500;

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolRow = {
  id: string;
  name: string;
  slug: string;
  url: string | null;
};

type GitHubRepoData = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  language: string | null;
  license: { spdx_id?: string | null; name?: string | null } | null;
  archived: boolean;
};

type RefreshResult =
  | { status: "success"; slug: string }
  | { status: "skipped"; slug: string; reason: string }
  | { status: "failed"; slug: string; reason: string };

// ─── CLI helpers ──────────────────────────────────────────────────────────────

function getOptionValue(name: string): string | null {
  const prefix = `${name}=`;
  const inline = process.argv.find((a) => a.startsWith(prefix));
  if (inline) {
    let v = inline.slice(prefix.length);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    return v;
  }
  const idx = process.argv.indexOf(name);
  const next = idx >= 0 ? process.argv[idx + 1] : undefined;
  if (next && !next.startsWith("--")) {
    let v = next;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    return v;
  }
  return null;
}

function getLimit(): number | null {
  const v = getOptionValue("--limit");
  if (!v) return null;
  const n = parseInt(v, 10);
  if (!Number.isInteger(n) || n < 1) throw new Error("--limit must be a positive integer");
  return n;
}

function getSlugFilter(): string[] {
  const v = getOptionValue("--slug");
  if (!v) return [];
  return [...new Set(v.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "").toLowerCase()).filter(Boolean))];
}

// ─── HTTP utilities ───────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function parseRetryAfterMs(headers: Headers, body: string, attempt: number): number {
  const ra = headers.get("retry-after");
  const raS = ra ? parseFloat(ra) : NaN;
  if (isFinite(raS)) return Math.max(0, raS * 1000) + 1000;
  const msg = body.match(/try again in\s+([\d.]+)s/i)?.[1];
  const msgS = msg ? parseFloat(msg) : NaN;
  if (isFinite(msgS)) return Math.max(0, msgS * 1000) + 1000;
  return INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
}

async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  label: string
): Promise<{ ok: boolean; status: number; body: string; headers: Headers; errorCause?: string }> {
  let lastErr = "";

  for (let attempt = 1; attempt <= MAX_HTTP_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers });
      const body = await res.text();

      if (res.ok) return { ok: true, status: res.status, body, headers: res.headers };

      // Never retry 401 or 404 — caller handles 404 as skip
      if (res.status === 401 || res.status === 404) {
        const cause = `HTTP ${res.status}: ${body.slice(0, 200).trim()}`;
        console.error(`  ❌ [${label}] ${cause} (no retry)`);
        return { ok: false, status: res.status, body, headers: res.headers, errorCause: cause };
      }

      lastErr = `HTTP ${res.status}: ${body.slice(0, 200).trim()}`;

      if ((res.status === 429 || res.status >= 500) && attempt < MAX_HTTP_ATTEMPTS) {
        const wait = parseRetryAfterMs(res.headers, body, attempt);
        console.warn(`  ⚠️  [${label}] ${lastErr} — attempt ${attempt}/${MAX_HTTP_ATTEMPTS}. Retrying in ${wait}ms...`);
        await delay(wait);
        continue;
      }

      console.error(`  ❌ [${label}] ${lastErr}`);
      return { ok: false, status: res.status, body, headers: res.headers, errorCause: lastErr };
    } catch (err: unknown) {
      const cause = (err as any)?.cause;
      const causeStr = cause ? (typeof cause === "object" ? JSON.stringify(cause) : String(cause)) : "";
      lastErr = `Fetch error: ${(err as Error).message}${causeStr ? ` (cause: ${causeStr})` : ""}`;
      console.error(`  ❌ [${label}] ${lastErr} — attempt ${attempt}/${MAX_HTTP_ATTEMPTS}`);
      if (attempt < MAX_HTTP_ATTEMPTS) {
        await delay(INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1));
        continue;
      }
      return { ok: false, status: 0, body: "", headers: new Headers(), errorCause: lastErr };
    }
  }

  return { ok: false, status: 0, body: "", headers: new Headers(), errorCause: lastErr || "Max attempts exceeded" };
}

// ─── GitHub helpers ───────────────────────────────────────────────────────────

function extractGitHubOwnerRepo(url: string | null): { owner: string; repo: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.toLowerCase().replace(/^www\./, "").endsWith("github.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

async function fetchGitHubRepo(
  owner: string,
  repo: string,
  token: string | null
): Promise<{ data: GitHubRepoData | null; status: number }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchWithRetry(
    `https://api.github.com/repos/${owner}/${repo}`,
    headers,
    `${owner}/${repo}`
  );

  if (!res.ok) return { data: null, status: res.status };

  try {
    return { data: JSON.parse(res.body) as GitHubRepoData, status: res.status };
  } catch {
    return { data: null, status: res.status };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const githubToken = process.env.GITHUB_TOKEN?.trim() || null;
  if (!githubToken) {
    console.warn("⚠️  GITHUB_TOKEN not set — using unauthenticated rate limit (60 req/hr)");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as any },
  });

  const limit = getLimit();
  const slugFilter = getSlugFilter();

  console.log("🔍 Fetching tools to refresh...");

  const allTools = await fetchAllSupabaseRows<ToolRow>(() => {
    let q = supabase
      .from("open_source_tools")
      .select("id, name, slug, url")
      .ilike("url", "%github.com%")
      .order("id", { ascending: true });

    if (slugFilter.length > 0) {
      return q.in("slug", slugFilter);
    }

    return q
      .eq("status", "approved")
      .eq("structured_content_status", "success");
  });

  const tools = limit !== null ? allTools.slice(0, limit) : allTools;

  console.log(
    `✅ ${allTools.length} tools found; processing ${tools.length}` +
    (limit !== null ? ` (--limit=${limit})` : "") +
    "\n"
  );

  const results: RefreshResult[] = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const label = `[${i + 1}/${tools.length}] ${tool.name} (${tool.slug})`;

    const ref = extractGitHubOwnerRepo(tool.url);
    if (!ref) {
      console.warn(`${label} — ⊘ Skipped: could not parse GitHub URL`);
      results.push({ status: "skipped", slug: tool.slug, reason: "invalid GitHub URL" });
      continue;
    }

    console.log(`${label} — fetching ${ref.owner}/${ref.repo}...`);

    const { data, status } = await fetchGitHubRepo(ref.owner, ref.repo, githubToken);

    if (status === 404) {
      console.warn(`  ⊘ 404 — repo not found, skipping`);
      results.push({ status: "skipped", slug: tool.slug, reason: "404 repo not found" });
      if (i < tools.length - 1) await delay(DEFAULT_DELAY_MS);
      continue;
    }

    if (!data) {
      const reason = `GitHub API failed (HTTP ${status})`;
      console.error(`  ❌ ${reason}`);
      results.push({ status: "failed", slug: tool.slug, reason });
      if (i < tools.length - 1) await delay(DEFAULT_DELAY_MS);
      continue;
    }

    const licenseValue = normalizeLicense(data.license?.spdx_id ?? data.license?.name ?? null);

    const updatePayload: Record<string, unknown> = {
      github_stars: data.stargazers_count,
      github_forks: data.forks_count,
      github_open_issues: data.open_issues_count,
      github_last_commit: data.pushed_at ?? null,
      license: licenseValue,
      github_archived: data.archived,
      github_checked_at: new Date().toISOString(),
    };

    if (data.language) updatePayload.language = data.language;

    const { error: updateError } = await supabase
      .from("open_source_tools")
      .update(updatePayload)
      .eq("id", tool.id);

    if (updateError) {
      const reason = `DB update failed: ${updateError.message}`;
      console.error(`  ❌ ${reason}`);
      results.push({ status: "failed", slug: tool.slug, reason });
    } else {
      const lastCommitLabel = data.pushed_at
        ? new Date(data.pushed_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "unknown";
      console.log(
        `  ✅ ⭐ ${data.stargazers_count.toLocaleString()} | 🍴 ${data.forks_count} | ` +
        `📝 ${licenseValue ?? "—"} | 🕐 ${lastCommitLabel}` +
        (data.archived ? " | 🗄️ ARCHIVED" : "")
      );
      results.push({ status: "success", slug: tool.slug });
    }

    if (i < tools.length - 1) await delay(DEFAULT_DELAY_MS);
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  const succeeded = results.filter((r) => r.status === "success");
  const skipped   = results.filter((r) => r.status === "skipped");
  const failed    = results.filter((r) => r.status === "failed");

  console.log("\n──────────────────────────────────────────────────");
  console.log("📊 REFRESH SUMMARY");
  console.log("──────────────────────────────────────────────────");
  console.log(`📦 Processed: ${tools.length}`);
  console.log(`✅ Updated:  ${succeeded.length}`);
  console.log(`⊘  Skipped:  ${skipped.length}`);
  console.log(`❌ Failed:   ${failed.length}`);

  if (skipped.length > 0) {
    const grouped = new Map<string, string[]>();
    for (const r of skipped) {
      if (r.status !== "skipped") continue;
      const list = grouped.get(r.reason) ?? [];
      list.push(r.slug);
      grouped.set(r.reason, list);
    }
    console.log("\n⊘ Skipped reasons:");
    for (const [reason, slugs] of grouped) {
      console.log(`  • ${reason}: ${slugs.join(", ")}`);
    }
  }

  if (failed.length > 0) {
    const grouped = new Map<string, string[]>();
    for (const r of failed) {
      if (r.status !== "failed") continue;
      const list = grouped.get(r.reason) ?? [];
      list.push(r.slug);
      grouped.set(r.reason, list);
    }
    console.log("\n❌ Failed reasons:");
    for (const [reason, slugs] of grouped) {
      console.log(`  • ${reason}: ${slugs.join(", ")}`);
    }
  }

  console.log("──────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
