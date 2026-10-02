/**
 * audit-comparisons.ts
 *
 * Audits every published /vs/[slug] and approved /alternatives/[slug] page.
 * Reads ONLY — never writes to the database.
 *
 * Output: scripts/out/audit.csv
 *
 * CSV columns (vs rows):
 *   page_type, slug, tool_a, tool_b, tool_a_slug, tool_b_slug,
 *   both_tools_success, tool_a_status, tool_b_status,
 *   has_numbers, has_percentages, has_prices,
 *   word_count, links_tool_a, links_tool_b
 *
 * CSV columns (alternatives rows):
 *   page_type, slug (saas_slug), saas_name, tool_slugs (comma-sep),
 *   all_tools_success, any_tool_status_issues,
 *   has_numbers, has_percentages, has_prices,
 *   word_count, links_all_tools
 *
 * Run:
 *   npx tsx scripts/audit-comparisons.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as ws from "ws";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";

dotenv.config({ path: ".env.local" });

// ─── Types ────────────────────────────────────────────────────────────────────

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  content: string | null;
  status: string;
};

type Alternative = {
  id: string;
  saas_name: string;
  saas_slug: string;
  content: any; // JSON
  status: string;
};

type ToolInfo = {
  slug: string;
  name: string;
  structured_content_status: string | null;
};

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function csvEscape(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? "");
  // Quote if contains comma, newline, or double-quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(cells: (string | number | boolean | null | undefined)[]): string {
  return cells.map(csvEscape).join(",");
}

// ─── Content analysis helpers ─────────────────────────────────────────────────

/**
 * Flatten all text fields in an alternatives content JSON into a single string.
 */
function flattenAlternativeContent(content: any): string {
  if (!content) return "";
  const parts: string[] = [];

  const pushString = (v: unknown) => {
    if (typeof v === "string" && v.trim()) parts.push(v);
  };

  pushString(content.intro);
  pushString(content.why_alternatives);
  pushString(content.comparison_table_note);
  pushString(content.migration_tips);
  pushString(content.conclusion);

  if (Array.isArray(content.faq)) {
    for (const item of content.faq) {
      pushString(item?.q);
      pushString(item?.a);
    }
  }

  if (Array.isArray(content.alternatives)) {
    for (const alt of content.alternatives) {
      pushString(alt?.tagline);
      pushString(alt?.description);
      pushString(alt?.best_for);
      pushString(alt?.tradeoffs);
    }
  }

  return parts.join(" ");
}

/** Count approximate words (whitespace-split). */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** True if text contains any standalone integer or decimal number. */
function hasNumbers(text: string): boolean {
  return /\b\d[\d,]*\.?\d*\b/.test(text);
}

/** True if text contains a percentage. */
function hasPercentages(text: string): boolean {
  return /\d+\s*%/.test(text);
}

/** True if text contains a price-like pattern ($N, £N, €N, USD, pricing tiers, etc.). */
function hasPrices(text: string): boolean {
  return /[\$£€]\s*\d|(\d+\s*(usd|eur|gbp|\bper\s+month|\bper\s+user|\bper\s+seat|\bfree\s+tier|\bpro\s+plan))/i.test(text);
}

/** True if the content text contains a link to /tools/{slug}. */
function linksToTool(text: string, toolSlug: string | null): boolean {
  if (!toolSlug) return false;
  return text.includes(`/tools/${toolSlug}`);
}

// ─── Tool lookup helpers ──────────────────────────────────────────────────────

function normKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function findTool(
  value: string,
  bySlug: Map<string, ToolInfo>,
  byName: Map<string, ToolInfo>
): ToolInfo | null {
  return bySlug.get(normKey(value)) ?? byName.get(normKey(value)) ?? null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    realtime: { transport: ws as any },
  });

  console.log("🔍 Fetching data (read-only)...");

  // Parallel fetch: comparisons, alternatives, all open_source_tools basic info
  const [comparisons, alternatives, allTools] = await Promise.all([
    fetchAllSupabaseRows<Comparison>(() =>
      supabase
        .from("comparisons")
        .select("id, slug, tool_a, tool_b, content, status")
        .eq("status", "published")
        .order("slug", { ascending: true })
    ),
    fetchAllSupabaseRows<Alternative>(() =>
      supabase
        .from("alternatives")
        .select("id, saas_name, saas_slug, content, status")
        .eq("status", "approved")
        .order("saas_slug", { ascending: true })
    ),
    fetchAllSupabaseRows<ToolInfo>(() =>
      supabase
        .from("open_source_tools")
        .select("slug, name, structured_content_status")
        .order("slug", { ascending: true })
    ),
  ]);

  console.log(`  ✅ ${comparisons.length} published comparisons`);
  console.log(`  ✅ ${alternatives.length} approved alternatives pages`);
  console.log(`  ✅ ${allTools.length} open_source_tools rows\n`);

  // Build lookup maps
  const bySlug = new Map<string, ToolInfo>(
    allTools.filter((t) => t.slug).map((t) => [normKey(t.slug), t])
  );
  const byName = new Map<string, ToolInfo>(
    allTools.filter((t) => t.name).map((t) => [normKey(t.name), t])
  );

  const rows: string[] = [];

  // ─── Header ─────────────────────────────────────────────────────────────────
  rows.push(csvRow([
    "page_type",
    "slug",
    "tool_a_or_saas",
    "tool_b_or_alt_slugs",
    "tool_a_slug",
    "tool_b_slug",
    "both_all_tools_success",
    "tool_a_status",
    "tool_b_or_alts_status",
    "has_numbers",
    "has_percentages",
    "has_prices",
    "word_count",
    "links_tool_a",
    "links_tool_b_or_all",
  ]));

  // ─── /vs comparisons ────────────────────────────────────────────────────────
  let vsFullyGroundable = 0;
  let vsNotGroundable = 0;

  for (const comp of comparisons) {
    const text = comp.content ?? "";
    const toolAInfo = findTool(comp.tool_a, bySlug, byName);
    const toolBInfo = findTool(comp.tool_b, bySlug, byName);

    const toolAStatus = toolAInfo?.structured_content_status ?? "NOT FOUND";
    const toolBStatus = toolBInfo?.structured_content_status ?? "NOT FOUND";
    const bothSuccess =
      toolAStatus === "success" && toolBStatus === "success";

    if (bothSuccess) vsFullyGroundable++;
    else vsNotGroundable++;

    rows.push(csvRow([
      "vs",
      comp.slug,
      comp.tool_a,
      comp.tool_b,
      toolAInfo?.slug ?? "",
      toolBInfo?.slug ?? "",
      bothSuccess,
      toolAStatus,
      toolBStatus,
      hasNumbers(text),
      hasPercentages(text),
      hasPrices(text),
      wordCount(text),
      linksToTool(text, toolAInfo?.slug ?? null),
      linksToTool(text, toolBInfo?.slug ?? null),
    ]));
  }

  // ─── /alternatives pages ─────────────────────────────────────────────────────
  let altFullyGroundable = 0;
  let altNotGroundable = 0;

  for (const alt of alternatives) {
    const content = alt.content ?? {};
    const text = flattenAlternativeContent(content);

    // Collect alternative tool slugs from content.alternatives[]
    const altTools: Array<{ slug: string; name: string; status: string }> = [];
    if (Array.isArray(content.alternatives)) {
      for (const item of content.alternatives) {
        const slug = String(item?.slug ?? "").trim();
        if (!slug) continue;
        const info = bySlug.get(normKey(slug));
        altTools.push({
          slug,
          name: item?.name ?? slug,
          status: info?.structured_content_status ?? "NOT FOUND",
        });
      }
    }

    const allSuccess = altTools.length > 0 && altTools.every((t) => t.status === "success");
    const statusSummary = altTools
      .filter((t) => t.status !== "success")
      .map((t) => `${t.slug}=${t.status}`)
      .join("; ") || "all-success";

    const altSlugs = altTools.map((t) => t.slug).join("; ");
    const allLinked = altTools.length > 0 && altTools.every((t) => linksToTool(text, t.slug));

    if (allSuccess) altFullyGroundable++;
    else altNotGroundable++;

    rows.push(csvRow([
      "alternatives",
      alt.saas_slug,
      alt.saas_name,
      altSlugs,
      "",                        // tool_a_slug not applicable
      "",                        // tool_b_slug not applicable
      allSuccess,
      "",                        // tool_a_status not applicable
      statusSummary,
      hasNumbers(text),
      hasPercentages(text),
      hasPrices(text),
      wordCount(text),
      "",                        // links_tool_a not applicable
      allLinked,
    ]));
  }

  // ─── Write CSV ───────────────────────────────────────────────────────────────
  const outDir = path.resolve(path.dirname(new URL(`file://${__filename}`).pathname.replace(/^\/([A-Z]:)/, "$1")), "out");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "audit.csv");
  fs.writeFileSync(outPath, rows.join("\n"), "utf8");

  console.log(`📄 CSV written to: ${outPath}`);
  console.log(`   Total rows: ${rows.length - 1} (excluding header)\n`);

  // ─── Summary ─────────────────────────────────────────────────────────────────
  const totalVs = vsFullyGroundable + vsNotGroundable;
  const totalAlt = altFullyGroundable + altNotGroundable;

  console.log("══════════════════════════════════════════════════");
  console.log("📊 AUDIT SUMMARY");
  console.log("══════════════════════════════════════════════════");

  console.log(`\n/vs comparisons (${totalVs} published):`);
  console.log(`  ✅ Fully groundable (both tools = success): ${vsFullyGroundable}`);
  console.log(`  ⚠️  Not fully groundable (missing/non-success tool): ${vsNotGroundable}`);

  console.log(`\n/alternatives pages (${totalAlt} approved):`);
  console.log(`  ✅ Fully groundable (all listed tools = success): ${altFullyGroundable}`);
  console.log(`  ⚠️  Not fully groundable (missing/non-success tools): ${altNotGroundable}`);

  console.log(`\nGrand total:`);
  console.log(`  ✅ Fully groundable: ${vsFullyGroundable + altFullyGroundable}`);
  console.log(`  ⚠️  Not fully groundable: ${vsNotGroundable + altNotGroundable}`);
  console.log("══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
