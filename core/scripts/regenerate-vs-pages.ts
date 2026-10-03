/**
 * regenerate-vs-pages.ts
 *
 * Rewrites /vs/ comparison content grounded strictly in verified DB data.
 *
 * Scope:
 *   - Only comparisons where BOTH tools exist in open_source_tools
 *     with structured_content_status = 'success'.
 *
 * Supported CLI Flags:
 *   - --slug="a-vs-b"    (comma-separated list of comparison slugs)
 *   - --limit=N          (max comparisons to process)
 *   - --dry-run          (print generated content, do NOT update DB)
 *   - --delay=ms         (inter-request delay in ms, default 20000ms)
 *   - --print-input      (print the input JSON payload before generation)
 *
 * Examples:
 *   npx tsx scripts/regenerate-vs-pages.ts --slug="plane-vs-jira" --dry-run --print-input
 *   npx tsx scripts/regenerate-vs-pages.ts --slug="posthog-vs-mixpanel" --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as ws from "ws";
import { getGroqModel } from "./ai-config";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";
import { formatLicense } from "../lib/utils/license";

dotenv.config({ path: ".env.local" });

// ─── Constants & Config ───────────────────────────────────────────────────────

const MAX_HTTP_ATTEMPTS = 4;
const INITIAL_BACKOFF_MS = 2000;
const DEFAULT_DELAY_MS = 20000; // 20s default to stay under Groq 8000 TPM limit

const FORBIDDEN_PHRASES = [
  "provided material",
  "the provided material",
  "provided text",
  "unknown",
  "not detailed",
  "not specified",
  "according to the readme",
  "the readme states",
  "based on the provided",
  "not mentioned in the provided",
  "the documentation states",
  "from the provided documentation",
];

// Common structural, markdown, heading, and sentence-initial words — not proper nouns
const PROPER_NOUN_WHITELIST = new Set([
  // Markdown headings and structural words
  "The", "This", "When", "Choose", "Check", "Tool", "Feature", "Quick", "Verdict",
  "Side", "Side-by-Side", "Comparison", "Limitations", "Strengths", "Who", "Should", "Not",
  "Frequently", "Asked", "Questions", "Summary", "Notes", "Category", "Official",
  // Sentence-initial common English words
  "If", "Its", "It", "While", "Can", "Both", "Each", "For", "Since", "However",
  "Although", "Because", "These", "They", "Their", "There", "That", "Those",
  "With", "Without", "By", "From", "At", "In", "On", "As", "But", "And", "Or",
  "A", "An", "All", "Any", "Some", "Most", "Many", "Few", "More", "Less",
  "Also", "Additionally", "Furthermore", "Moreover", "Therefore", "Thus",
  "Overall", "Generally", "Typically", "Ideally", "Ultimately", "Especially",
  "Unlike", "Like", "Such", "Due", "Despite", "Though", "Instead", "Rather",
  // Calendar
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  // Tech deployment terms
  "Docker", "Compose", "Kubernetes", "Helm", "Self-Hosted", "Cloud", "Version",
  // License identifiers
  "License", "MIT", "AGPL", "Apache", "GPL", "BSD",
  // Common abbreviations
  "SaaS", "API", "UI", "DB", "FAQ", "TL", "DR", "GitHub", "Stars", "Forks",
  "Last", "Commit",
  // Common domain words
  "Yes", "No", "Best", "Fit", "Capability", "Primary", "Trade", "Trade-off", "Trade-offs",
  "Option", "User", "Users", "Project", "Management", "Software", "System", "Platform",
  "Open", "Source", "Developer", "Developers", "Team", "Teams", "Community", "Free",
  "Tier", "Issue", "Tracker", "Tracking", "Setup", "Transition", "Considerations",
  "Website", "Current", "Pricing", "Which", "What", "Why", "How",
  "Small", "Large", "Medium", "Enterprise", "Corporate", "Business", "Organizations",
  "Custom", "Advanced", "Simple", "Structured", "Hosted",
  // Geographic and political terms (commonly expanded from abbreviations in DB)
  "United", "States", "European", "Union", "North", "South", "East", "West",
  "America", "Europe", "Asia", "Pacific", "Global", "International",
  // Common action/modal words used in prose
  "Customers", "Clients", "Products", "Services", "Solutions", "Tools",
  "Supports", "Provides", "Offers", "Includes", "Requires", "Enables",
]);


// ─── Types ────────────────────────────────────────────────────────────────────

type ComparisonRow = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  status: string;
  content: string | null;
  verified_regenerated_at: string | null;
};

type ToolRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  url: string | null;
  github_stars: number | null;
  github_forks: number | null;
  github_contributors: number | null;
  github_open_issues: number | null;
  github_last_commit: string | null;
  language: string | null;
  license: string | null;
  readme_excerpt: string | null;
  best_for: string[] | null;
  not_for: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  pricing_info: string | null;
  key_features: string[] | null;
  integrations: string[] | null;
  deployment_info: any | null;
  structured_content_status: string | null;
};

type ComparisonTableRow = {
  feature: string;
  tool_a: string;
  tool_b: string;
};

type ComparisonFaq = {
  q: string;
  a: string;
};

type GeneratedVsContent = {
  tldr: string;
  comparison_table: ComparisonTableRow[];
  choose_a: string[];
  choose_b: string[];
  faq: ComparisonFaq[];
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
  return DEFAULT_DELAY_MS;
}

function getLimit(): number | null {
  const value = getOptionValue("--limit");
  if (value === null) return null;
  const limit = Number.parseInt(value, 10);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer, e.g. --limit=5");
  }
  return limit;
}

function getSlugFilter(): string[] {
  const value = getOptionValue("--slug");
  if (value === null) return [];
  return [...new Set(
    value
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, "").toLowerCase())
      .filter(Boolean)
  )];
}

function isDryRun(): boolean {
  return process.argv.includes("--dry-run");
}

function isPrintInput(): boolean {
  return process.argv.includes("--print-input");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function formatMonthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

function formatDeploymentSummary(dep: any): string | null {
  if (!dep || typeof dep !== "object") return null;
  const active: string[] = [];
  if (dep.docker) active.push("Docker");
  if (dep.docker_compose) active.push("Docker Compose");
  if (dep.kubernetes) active.push("Kubernetes");
  if (dep.helm) active.push("Helm");
  if (dep.self_hosted) active.push("Self-Hosted");
  if (dep.cloud_version) active.push("Cloud Version");
  return active.length > 0 ? active.join(", ") : null;
}

function isToolSaaS(tool: ToolRow): boolean {
  const url = (tool.url || "").toLowerCase();
  return !url.includes("github.com") && (tool.github_stars === null || tool.github_stars === 0);
}

// ─── Table Row Sanitization & Filtering ───────────────────────────────────────

function sanitizeAndFilterTableRows(
  rows: ComparisonTableRow[],
  toolAIsSaaS: boolean,
  toolBIsSaaS: boolean
): ComparisonTableRow[] {
  if (!Array.isArray(rows)) return [];

  return rows.filter((row) => {
    if (!row || !row.feature || !row.tool_a || !row.tool_b) return false;

    const feat = String(row.feature).trim().toLowerCase();
    const valA = String(row.tool_a).trim().toLowerCase();
    const valB = String(row.tool_b).trim().toLowerCase();

    // 1. Remove "Description" row entirely
    if (feat === "description") return false;

    // 2. For tools without GitHub repo (SaaS), never output License/Stars/Forks/Last Commit
    if (toolAIsSaaS || toolBIsSaaS) {
      if (
        feat.includes("license") ||
        feat.includes("star") ||
        feat.includes("fork") ||
        feat.includes("commit")
      ) {
        return false;
      }
    }

    // 3. Skip a row if either value is null, 0, "0", "unknown", "n/a", "see repository for license"
    const isInvalidVal = (v: string) => {
      if (v === "null" || v === "0" || v === "unknown" || v === "n/a" || v === "none") return true;
      if (v.includes("see repository")) return true;
      return false;
    };

    if (isInvalidVal(valA) || isInvalidVal(valB)) return false;

    return true;
  });
}

// ─── Universal HTTP Fetcher ───────────────────────────────────────────────────

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
  return INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
}

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

      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          statusText: res.statusText,
          body: bodyText,
          headers: res.headers,
        };
      }

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

// ─── Groq API Invocation ──────────────────────────────────────────────────────

async function generateWithGroq(prompt: string, contextName: string): Promise<{ text: string | null; errorReason?: string }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return { text: null, errorReason: "GROQ_API_KEY missing" };
  }

  const model = getGroqModel();
  // Sanitize non-ASCII typographic characters that can trigger model JSON validation errors
  const sanitizedPrompt = prompt
    .replace(/\u2011/g, "-")   // non-breaking hyphen → hyphen
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes → straight
    .replace(/[\u201C\u201D]/g, '"'); // curly double quotes → straight

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
        messages: [
          { role: "user", content: sanitizedPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    },
    `Groq VS (${contextName})`
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
  } catch (err: any) {
    return { text: null, errorReason: `Groq JSON parse error: ${err?.message || String(err)}` };
  }
}

function tryParseJSON<T>(rawText: string): T | null {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }
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

// ─── Markdown Formatter ───────────────────────────────────────────────────────

function formatVsMarkdown(
  data: GeneratedVsContent,
  toolA: ToolRow,
  toolB: ToolRow
): string {
  const lines: string[] = [];

  // TL;DR / Quick Verdict
  lines.push(`## Quick Verdict`);
  lines.push("");
  lines.push(data.tldr.trim());
  lines.push("");

  // Cleaned Side-by-Side Comparison Table
  const cleanRows = sanitizeAndFilterTableRows(
    data.comparison_table,
    isToolSaaS(toolA),
    isToolSaaS(toolB)
  );

  if (cleanRows.length > 0) {
    lines.push(`## Side-by-Side Comparison`);
    lines.push("");
    lines.push(`| Feature | ${toolA.name} | ${toolB.name} |`);
    lines.push(`|---|---|---|`);
    for (const row of cleanRows) {
      const feat = String(row.feature || "").replace(/\|/g, "\\|");
      const valA = String(row.tool_a || "").replace(/\|/g, "\\|");
      const valB = String(row.tool_b || "").replace(/\|/g, "\\|");
      lines.push(`| ${feat} | ${valA} | ${valB} |`);
    }
    lines.push("");
  }

  // When to Choose Tool A — fall back to best_for if model returned empty array
  const chooseBulletsA = (data.choose_a && data.choose_a.length > 0)
    ? data.choose_a
    : (sanitizeArr(toolA.best_for) || []);
  lines.push(`## When to Choose ${toolA.name}`);
  lines.push("");
  for (const bullet of chooseBulletsA) {
    lines.push(`- ${bullet.trim()}`);
  }
  lines.push("");

  // Per-Tool Sections for Tool A: populated from DB fields (sanitized)
  const prosA = sanitizeArr(toolA.pros);
  const consA = sanitizeArr(toolA.cons);
  const notForA = sanitizeArr(toolA.not_for);

  if (prosA && prosA.length > 0) {
    lines.push(`## Strengths of ${toolA.name}`);
    lines.push("");
    for (const item of prosA) lines.push(`- ${item.trim()}`);
    lines.push("");
  }

  if (consA && consA.length > 0) {
    lines.push(`## Limitations of ${toolA.name}`);
    lines.push("");
    for (const item of consA) lines.push(`- ${item.trim()}`);
    lines.push("");
  }

  if (notForA && notForA.length > 0) {
    lines.push(`## Who Should Not Choose ${toolA.name}`);
    lines.push("");
    for (const item of notForA) lines.push(`- ${item.trim()}`);
    lines.push("");
  }

  // Mandatory pricing check line for Tool A
  const urlA = toolA.url ? toolA.url.trim() : "official website";
  lines.push(`Check ${urlA} for current pricing.`);
  lines.push("");

  // When to Choose Tool B — fall back to best_for if model returned empty array
  const chooseBulletsB = (data.choose_b && data.choose_b.length > 0)
    ? data.choose_b
    : (sanitizeArr(toolB.best_for) || []);
  lines.push(`## When to Choose ${toolB.name}`);
  lines.push("");
  for (const bullet of chooseBulletsB) {
    lines.push(`- ${bullet.trim()}`);
  }
  lines.push("");

  // Per-Tool Sections for Tool B: populated from DB fields (sanitized)
  const prosB = sanitizeArr(toolB.pros);
  const consB = sanitizeArr(toolB.cons);
  const notForB = sanitizeArr(toolB.not_for);

  if (prosB && prosB.length > 0) {
    lines.push(`## Strengths of ${toolB.name}`);
    lines.push("");
    for (const item of prosB) lines.push(`- ${item.trim()}`);
    lines.push("");
  }

  if (consB && consB.length > 0) {
    lines.push(`## Limitations of ${toolB.name}`);
    lines.push("");
    for (const item of consB) lines.push(`- ${item.trim()}`);
    lines.push("");
  }

  if (notForB && notForB.length > 0) {
    lines.push(`## Who Should Not Choose ${toolB.name}`);
    lines.push("");
    for (const item of notForB) lines.push(`- ${item.trim()}`);
    lines.push("");
  }

  // Mandatory pricing check line for Tool B
  const urlB = toolB.url ? toolB.url.trim() : "official website";
  lines.push(`Check ${urlB} for current pricing.`);
  lines.push("");

  // FAQ
  if (Array.isArray(data.faq) && data.faq.length > 0) {
    lines.push(`## Frequently Asked Questions`);
    lines.push("");
    for (const item of data.faq) {
      lines.push(`### ${item.q.trim()}`);
      lines.push(item.a.trim());
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}


// ─── Output Validator ─────────────────────────────────────────────────────────

function validateVsOutput(
  content: GeneratedVsContent | null,
  toolA: ToolRow,
  toolB: ToolRow,
  inputJsonStr: string,
  formattedMarkdown: string
): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!content || typeof content !== "object") {
    return { valid: false, reasons: ["Output is null or not an object"] };
  }

  const fullText = JSON.stringify(content).toLowerCase();

  // 1. Check forbidden phrases
  for (const phrase of FORBIDDEN_PHRASES) {
    if (fullText.includes(phrase)) {
      reasons.push(`Contains forbidden phrase: "${phrase}"`);
    }
  }

  // 2. Validator (a): Reject if table cell contains "See repository", "0" (alone), "unknown", "n/a"
  const cleanRows = sanitizeAndFilterTableRows(
    content.comparison_table,
    isToolSaaS(toolA),
    isToolSaaS(toolB)
  );

  for (const row of content.comparison_table || []) {
    const aVal = String(row.tool_a || "").trim().toLowerCase();
    const bVal = String(row.tool_b || "").trim().toLowerCase();

    if (
      aVal.includes("see repository") || bVal.includes("see repository") ||
      aVal === "0" || bVal === "0" ||
      aVal === "unknown" || bVal === "unknown" ||
      aVal === "n/a" || bVal === "n/a"
    ) {
      reasons.push(`Table row '${row.feature}' contains forbidden cell value ('${row.tool_a}' or '${row.tool_b}')`);
    }
  }

  // 3. Validator (b): Word count 200–700 (DB-sourced sections add ~100–150 words outside model output)
  const wordCount = formattedMarkdown.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 200 || wordCount > 700) {
    reasons.push(`Output word count (${wordCount}) is out of allowed range [200, 700]`);
  }

  // 4. Validator (c): Proper noun hallucination check
  // Only flag capitalized words that are NOT in input JSON, whitelist, tool names, OR DB content
  // (DB pros/cons/not_for appear verbatim in markdown but were not in model's inputJsonStr)
  const properNouns = formattedMarkdown.match(/\b[A-Z][a-zA-Z0-9_-]+\b/g) || [];

  // Build a combined lowercase token set from inputJsonStr + raw DB array fields
  const dbContent = [
    ...(toolA.pros || []), ...(toolA.cons || []), ...(toolA.not_for || []),
    ...(toolA.best_for || []), ...(toolA.key_features || []),
    ...(toolB.pros || []), ...(toolB.cons || []), ...(toolB.not_for || []),
    ...(toolB.best_for || []), ...(toolB.key_features || []),
  ].join(" ").toLowerCase();

  const lowerInput = (inputJsonStr + " " + dbContent).toLowerCase();

  // Build name token sets for Tool A and Tool B to allow tool name references
  const toolNameTokens = new Set(
    `${toolA.name} ${toolB.name}`.toLowerCase().split(/\s+/).filter(Boolean)
  );

  for (const noun of properNouns) {
    if (PROPER_NOUN_WHITELIST.has(noun)) continue;
    if (toolNameTokens.has(noun.toLowerCase())) continue;

    // Check if noun appears in combined input (case-insensitive)
    if (!lowerInput.includes(noun.toLowerCase())) {
      reasons.push(`Hallucinated proper noun '${noun}' not present in input data`);
    }
  }

  return { valid: reasons.length === 0, reasons };
}


// ─── String Sanitizer (removes non-ASCII typographic chars before Groq) ──────

function sanitizeStr(s: string | null | undefined): string | null {
  if (!s) return null;
  return s
    .replace(/\u2011/g, "-")          // non-breaking hyphen → hyphen
    .replace(/[\u2018\u2019]/g, "'")  // curly single quotes → straight
    .replace(/[\u201C\u201D]/g, '"'); // curly double quotes → straight
}

function sanitizeArr(arr: string[] | null | undefined): string[] | null {
  if (!Array.isArray(arr)) return null;
  const cleaned = arr.map((s) => sanitizeStr(s) ?? "").filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPromptPayload(toolA: ToolRow, toolB: ToolRow) {
  const commitA = formatMonthYear(toolA.github_last_commit);
  const commitB = formatMonthYear(toolB.github_last_commit);

  const payloadA = {
    name: toolA.name,
    slug: toolA.slug,
    category: sanitizeStr(toolA.category),
    description: sanitizeStr(toolA.description ? toolA.description.slice(0, 300) : null),
    github_stars: isToolSaaS(toolA) ? null : toolA.github_stars,
    github_forks: isToolSaaS(toolA) ? null : toolA.github_forks,
    license: isToolSaaS(toolA) ? null : formatLicense(toolA.license),
    last_commit_month_year: isToolSaaS(toolA) ? null : commitA,
    deployment: sanitizeStr(formatDeploymentSummary(toolA.deployment_info)),
    pros: sanitizeArr(toolA.pros),
    cons: sanitizeArr(toolA.cons),
    best_for: sanitizeArr(toolA.best_for),
    not_for: sanitizeArr(toolA.not_for),
    key_features: sanitizeArr(toolA.key_features),
    official_url: toolA.url,
  };

  const payloadB = {
    name: toolB.name,
    slug: toolB.slug,
    category: sanitizeStr(toolB.category),
    description: sanitizeStr(toolB.description ? toolB.description.slice(0, 300) : null),
    github_stars: isToolSaaS(toolB) ? null : toolB.github_stars,
    github_forks: isToolSaaS(toolB) ? null : toolB.github_forks,
    license: isToolSaaS(toolB) ? null : formatLicense(toolB.license),
    last_commit_month_year: isToolSaaS(toolB) ? null : commitB,
    deployment: sanitizeStr(formatDeploymentSummary(toolB.deployment_info)),
    pros: sanitizeArr(toolB.pros),
    cons: sanitizeArr(toolB.cons),
    best_for: sanitizeArr(toolB.best_for),
    not_for: sanitizeArr(toolB.not_for),
    key_features: sanitizeArr(toolB.key_features),
    official_url: toolB.url,
  };

  return { payloadA, payloadB };
}


function buildVsPrompt(toolA: ToolRow, toolB: ToolRow): { prompt: string; inputJsonStr: string } {
  const { payloadA, payloadB } = buildPromptPayload(toolA, toolB);
  const inputJsonStr = JSON.stringify({ tool_a: payloadA, tool_b: payloadB }, null, 2);

  const prompt = `You are a senior technical writer for The Cloud Rain developer tools directory.
Write a detailed comparison between ${toolA.name} and ${toolB.name}.

VERIFIED DATABASE INPUT DATA (Use ONLY these facts — do not invent anything):
${inputJsonStr}

STRICT GROUNDING & CONTENT RULES:
1. NO NEW FACTS: You may ONLY restate facts present in the input JSON. Do NOT mention integrations, ecosystems, reporting, pricing limits, user count limits, or file-size limits unless that exact fact is in the input JSON.
2. NO PRICING CLAIMS: Never write specific pricing figures, user count limits, or file size caps.
3. FORBIDDEN PHRASES — never use any of these: "provided material", "provided text", "according to the README", "the README states", "unknown", "not detailed", "not specified"
4. TABLE RULES:
   - In "comparison_table", include valid rows comparing facts (e.g. Category, Deployment / Self-Hosting, Best Fit, Primary Trade-off).
   - SKIP any row where data is missing or null for either side.
   - NEVER output a "Description" row.
   - NEVER output License/Stars/Forks/Last Commit rows for SaaS tools (tools without a GitHub repo).
   - NEVER write "unknown", "N/A", "0", or "See repository for license" in any table cell.
5. LENGTH & DEPTH GUIDANCE:
   - In "tldr", write 3-4 sentences (~50-70 words) summarizing the core difference and ideal use cases.
   - In "choose_a" and "choose_b", write 3 bullets each. Each bullet should be 1-2 sentences (~15-25 words) grounded in the input data.
   - In "faq", write 3 Q&A pairs. Each answer should be 2-3 sentences (~30-50 words), using only facts from the input JSON.

Return ONLY a valid JSON object with exactly these keys:
{
  "tldr": "3-4 sentence quick verdict comparing ${toolA.name} and ${toolB.name}.",
  "comparison_table": [
    { "feature": "Category", "tool_a": "value from input", "tool_b": "value from input" }
  ],
  "choose_a": ["bullet 1 (1-2 sentences)", "bullet 2", "bullet 3"],
  "choose_b": ["bullet 1 (1-2 sentences)", "bullet 2", "bullet 3"],
  "faq": [
    { "q": "When is ${toolA.name} better than ${toolB.name}?", "a": "2-3 sentence answer using only verified input data." },
    { "q": "Question 2", "a": "Answer 2" },
    { "q": "Question 3", "a": "Answer 3" }
  ]
}`;

  return { prompt, inputJsonStr };
}


// ─── Main Execution Pipeline ──────────────────────────────────────────────────

async function main() {
  console.log("RAW ARGV:", JSON.stringify(process.argv));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as any },
  });

  const delayMs = getDelayMs();
  const limit = getLimit();
  const slugFilter = getSlugFilter();
  const dryRun = isDryRun();
  const printInput = isPrintInput();

  console.log(`🤖 Using Groq model: ${getGroqModel()}`);
  console.log(`⏱️ Inter-request delay: ${delayMs}ms (override with --delay=ms)`);
  if (dryRun) console.log("🧪 DRY RUN MODE ENABLED — no database updates will be written.\n");

  // Fetch open_source_tools where structured_content_status = 'success'
  console.log("🔍 Fetching verified open_source_tools (structured_content_status = 'success')...");
  const successTools = await fetchAllSupabaseRows<ToolRow>(() =>
    supabase
      .from("open_source_tools")
      .select("id, name, slug, category, description, url, github_stars, github_forks, github_contributors, github_open_issues, github_last_commit, language, license, readme_excerpt, best_for, not_for, pros, cons, pricing_info, key_features, integrations, deployment_info, structured_content_status")
      .eq("structured_content_status", "success")
      .order("id", { ascending: true })
  );

  console.log(`✅ Loaded ${successTools.length} verified open_source_tools.`);

  const toolBySlug = new Map<string, ToolRow>();
  const toolByName = new Map<string, ToolRow>();

  for (const tool of successTools) {
    if (tool.slug) toolBySlug.set(normalizeKey(tool.slug), tool);
    if (tool.name) toolByName.set(normalizeKey(tool.name), tool);
  }

  const ALIASES: Record<string, string> = {
    plausible: "plausible-analytics",
  };

  const findTool = (value: string): ToolRow | null => {
    const norm = normalizeKey(value);
    const aliased = ALIASES[norm] || norm;
    return toolBySlug.get(aliased) || toolByName.get(norm) || null;
  };

  // Fetch comparison rows
  console.log("🔍 Fetching comparisons...");
  const fetchedComparisons = await fetchAllSupabaseRows<ComparisonRow>(() => {
    let q = supabase
      .from("comparisons")
      .select("id, slug, tool_a, tool_b, status, content, verified_regenerated_at")
      .order("id", { ascending: true });

    if (slugFilter.length > 0) {
      return q.in("slug", slugFilter);
    }
    return q.eq("status", "published");
  });

  // Scope filter: ONLY comparisons where BOTH tools exist in open_source_tools with structured_content_status = 'success'
  const qualifiedComparisons: Array<{ comp: ComparisonRow; toolA: ToolRow; toolB: ToolRow }> = [];
  const skippedScope: string[] = [];

  for (const comp of fetchedComparisons) {
    const toolA = findTool(comp.tool_a);
    const toolB = findTool(comp.tool_b);

    if (toolA && toolB) {
      qualifiedComparisons.push({ comp, toolA, toolB });
    } else {
      const missingReason = [
        !toolA ? `tool_a '${comp.tool_a}' missing or not success` : null,
        !toolB ? `tool_b '${comp.tool_b}' missing or not success` : null,
      ].filter(Boolean).join(", ");
      skippedScope.push(`${comp.slug} (${missingReason})`);
    }
  }

  const itemsToProcess = limit === null ? qualifiedComparisons : qualifiedComparisons.slice(0, limit);

  console.log(`\n📊 SCOPE SELECTION SUMMARY:`);
  console.log(`  • Total comparisons fetched: ${fetchedComparisons.length}`);
  console.log(`  • Both tools success:         ${qualifiedComparisons.length}`);
  console.log(`  • Skipped (scope invalid):    ${skippedScope.length}`);
  console.log(`  • To process in this run:     ${itemsToProcess.length}${limit !== null ? ` (--limit=${limit})` : ""}\n`);

  if (skippedScope.length > 0 && slugFilter.length > 0) {
    console.log("⚠️ Skipped reasons for requested slugs:");
    for (const s of skippedScope) console.log(`  - ${s}`);
    console.log("");
  }

  let successCount = 0;
  let failedCount = 0;
  const failureReasons: Array<{ slug: string; reason: string }> = [];

  for (let i = 0; i < itemsToProcess.length; i++) {
    const { comp, toolA, toolB } = itemsToProcess[i];
    const label = `[${i + 1}/${itemsToProcess.length}] ${comp.slug} (${toolA.name} vs ${toolB.name})`;
    console.log(`\n${label}`);

    const { prompt, inputJsonStr } = buildVsPrompt(toolA, toolB);

    if (printInput) {
      console.log(`\n--- 🔍 INPUT JSON FOR ${comp.slug} ---`);
      console.log(inputJsonStr);
      console.log(`--- END INPUT JSON ---\n`);
    }

    // Attempt 1 with Groq
    console.log(`  🤖 Calling Groq model (${getGroqModel()})...`);
    const groqRes1 = await generateWithGroq(prompt, comp.slug);

    if (!groqRes1.text) {
      const reason = groqRes1.errorReason || "Groq request failed";
      console.error(`  ❌ ${reason} — keeping existing content untouched`);
      failedCount++;
      failureReasons.push({ slug: comp.slug, reason });
      await delay(delayMs);
      continue;
    }

    let parsed1 = tryParseJSON<GeneratedVsContent>(groqRes1.text);
    let md1 = parsed1 ? formatVsMarkdown(parsed1, toolA, toolB) : "";
    let val1 = validateVsOutput(parsed1, toolA, toolB, inputJsonStr, md1);
    let finalContent: GeneratedVsContent | null = val1.valid ? parsed1 : null;
    let finalMarkdown = md1;

    // Retry once if validation failed
    if (!val1.valid) {
      console.warn(`  ⚠️ Validation failed on attempt 1 (${val1.reasons.join("; ")}). Retrying once with strict reminder...`);
      const reminderPrompt = `${prompt}

CRITICAL FIXES REQUIRED FROM PREVIOUS ATTEMPT:
Validation failed: ${val1.reasons.join("; ")}.
STRICT REMINDERS:
- Do NOT invent proper nouns or company names not in input JSON.
- NO table cells with 0, N/A, unknown, or See repository.
- Provide all required keys: tldr, comparison_table, choose_a, choose_b, faq.
Return ONLY valid JSON starting with { and ending with }.`;

      const groqRes2 = await generateWithGroq(reminderPrompt, comp.slug);
      if (groqRes2.text) {
        const parsed2 = tryParseJSON<GeneratedVsContent>(groqRes2.text);
        if (parsed2) {
          const md2 = formatVsMarkdown(parsed2, toolA, toolB);
          const val2 = validateVsOutput(parsed2, toolA, toolB, inputJsonStr, md2);
          if (val2.valid) {
            finalContent = parsed2;
            finalMarkdown = md2;
          } else {
            console.error(`  ❌ Attempt 2 failed validation (${val2.reasons.join("; ")}). Keeping old content untouched.`);
          }
        }
      }
    }

    if (!finalContent) {
      const reason = `Validation failed: ${val1.reasons.join("; ")}`;
      console.error(`  ❌ ${reason} — keeping existing content untouched`);
      failedCount++;
      failureReasons.push({ slug: comp.slug, reason });
      await delay(delayMs);
      continue;
    }

    if (dryRun) {
      console.log(`\n--- 🧪 DRY-RUN OUTPUT FOR ${comp.slug} ---`);
      console.log(finalMarkdown);
      const wordCount = finalMarkdown.trim().split(/\s+/).filter(Boolean).length;
      console.log(`--- END DRY-RUN OUTPUT (${wordCount} words) ---\n`);
      successCount++;
    } else {
      console.log(`  💾 Saving regenerated content to Supabase comparisons table...`);
      // Update DB safely: try with verified_regenerated_at timestamptz first
      let { error: updateError } = await supabase
        .from("comparisons")
        .update({
          content: finalMarkdown,
          verified_regenerated_at: new Date().toISOString(),
        })
        .eq("id", comp.id);

      // Fallback if verified_regenerated_at column does not exist
      if (updateError && updateError.message.includes("verified_regenerated_at")) {
        console.warn(`  ⚠️ Column verified_regenerated_at not found, updating content only...`);
        const fallbackRes = await supabase
          .from("comparisons")
          .update({ content: finalMarkdown })
          .eq("id", comp.id);
        updateError = fallbackRes.error;
      }

      if (updateError) {
        const reason = `DB update failed: ${updateError.message}`;
        console.error(`  ❌ ${reason} — keeping old content untouched`);
        failedCount++;
        failureReasons.push({ slug: comp.slug, reason });
      } else {
        console.log(`  ✅ Successfully updated ${comp.slug} in DB`);
        successCount++;
      }
    }

    if (i < itemsToProcess.length - 1) {
      await delay(delayMs);
    }
  }

  // ─── Final Summary ──────────────────────────────────────────────────────────

  console.log("\n──────────────────────────────────────────────────");
  console.log("📊 REGENERATE VS PAGES SUMMARY");
  console.log("──────────────────────────────────────────────────");
  console.log(`📦 Qualified Scope: ${itemsToProcess.length}`);
  console.log(`✅ Success:         ${successCount}${dryRun ? " (dry run)" : ""}`);
  console.log(`❌ Failed:          ${failedCount}`);

  if (failureReasons.length > 0) {
    console.log("\n❌ Failure Details:");
    for (const f of failureReasons) {
      console.log(`  • ${f.slug}: ${f.reason}`);
    }
  }
  console.log("──────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
