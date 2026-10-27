/**
 * Remove source-gap filler and exact duplicate bullets from existing tool content.
 * Defaults to a dry run. Pass --apply to back up and update approved successful rows.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";

dotenv.config({ path: ".env.local" });

type ToolContentRow = {
  id: string;
  slug: string;
  name: string;
  ai_content: string | null;
  cons: string[] | null;
  not_for: string[] | null;
};

type UpdatedToolContent = ToolContentRow & {
  next_ai_content: string | null;
  next_cons: string[];
  next_not_for: string[];
  removed_items: string[];
};

const SOURCE_GAP_PATTERNS = [
  /\b(?:not|isn't|aren't|wasn't|weren't)\s+(?:specified|detailed|mentioned|provided|listed|documented|described)\b.{0,100}\b(?:description|source|readme|documentation|website|material|text)\b/i,
  /\b(?:description|source|readme|documentation|website|provided material)\b.{0,100}\b(?:does not|doesn't|do not|don't|fails to|lack(?:s)?)\b.{0,40}\b(?:specify|detail|mention|provide|document|describe|list|include)\b/i,
  /\blimited\b.{0,80}\b(?:language|runtime|deployment|integration|setup)?\s*(?:specifics?|details?|information)\b.{0,40}\b(?:provided|available|included)\b/i,
  /\b(?:not|no)\s+(?:enough|much|any)\s+(?:information|detail|documentation)\b.{0,80}\b(?:description|source|readme|documentation|website|material)\b/i,
];

const BULLET_SECTIONS = new Set([
  "Best For",
  "Not Ideal For",
  "Pros",
  "Cons",
  "Key Features",
  "Integrations",
]);

function normalizeForDuplicateCheck(value: string): string {
  return value.replace(/^\s*[-*+]\s+/, "").replace(/[✓✗✅❌]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function isSourceGapFiller(value: string): boolean {
  return SOURCE_GAP_PATTERNS.some((pattern) => pattern.test(value));
}

function isSelfHostingClaim(value: string): boolean {
  const normalized = value.replace(/[\u2010-\u2015\u2212]/g, "-");
  return /\b(?:self[\s-]?hosting|on[\s-]?prem)\b/i.test(normalized);
}

function cleanArray(value: string[] | null): { cleaned: string[]; removed: string[] } {
  if (!Array.isArray(value)) return { cleaned: [], removed: [] };
  const seen = new Set<string>();
  const cleaned: string[] = [];
  const removed: string[] = [];

  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const item = raw.replace(/\s+/g, " ").trim();
    if (!item) continue;
    if (isSourceGapFiller(item)) {
      removed.push(item);
      continue;
    }

    const key = normalizeForDuplicateCheck(item);
    if (seen.has(key)) {
      removed.push(`Duplicate: ${item}`);
      continue;
    }
    seen.add(key);
    cleaned.push(item);
  }

  return { cleaned, removed };
}

function cleanMarkdown(markdown: string | null): { cleaned: string | null; removed: string[] } {
  if (!markdown?.trim()) return { cleaned: markdown, removed: [] };

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  const seenBulletsBySection = new Map<string, Set<string>>();
  let currentSection = "";
  let removedContent = false;
  const removed: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) currentSection = heading[1].trim();

    const bullet = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (bullet && BULLET_SECTIONS.has(currentSection)) {
      if (isSourceGapFiller(bullet[1])) {
        removedContent = true;
        removed.push(`${currentSection}: ${bullet[1]}`);
        continue;
      }

      let seen = seenBulletsBySection.get(currentSection);
      if (!seen) {
        seen = new Set<string>();
        seenBulletsBySection.set(currentSection, seen);
      }
      const key = normalizeForDuplicateCheck(bullet[1]);
      if (seen.has(key)) {
        removedContent = true;
        removed.push(`${currentSection}: Duplicate: ${bullet[1]}`);
        continue;
      }
      seen.add(key);
    }

    output.push(line);
  }

  if (!removedContent) return { cleaned: markdown, removed };

  // Remove headings whose section became empty after cleaning.
  const compacted: string[] = [];
  for (let index = 0; index < output.length; index++) {
    const line = output[index];
    if (/^##\s+/.test(line)) {
      let next = index + 1;
      while (next < output.length && !output[next].trim()) next++;
      if (next >= output.length || /^##\s+/.test(output[next])) {
        removedContent = true;
        continue;
      }
    }
    compacted.push(line);
  }

  const result = compacted.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { cleaned: result || null, removed };
}

function removeMatchingSectionBullets(
  markdown: string | null,
  sectionName: string,
  matcher: RegExp
): { cleaned: string | null; removed: string[] } {
  if (!markdown) return { cleaned: markdown, removed: [] };
  let currentSection = "";
  const removed: string[] = [];
  const lines = markdown.split("\n").filter((line) => {
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) currentSection = heading[1].trim();
    const bullet = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (currentSection === sectionName && bullet && matcher.test(bullet[1])) {
      removed.push(`${sectionName}: ${bullet[1]}`);
      return false;
    }
    return true;
  });
  return { cleaned: lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() || null, removed };
}

function getCliFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function main() {
  const apply = getCliFlag("--apply");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const rows = await fetchAllSupabaseRows<ToolContentRow>(() =>
    supabase
      .from("open_source_tools")
      .select("id, slug, name, ai_content, cons, not_for")
      .or("status.eq.approved,status.eq.APPROVED")
      .eq("structured_content_status", "success")
      .order("slug", { ascending: true })
  );

  const inspectArg = process.argv.find((arg) => arg.startsWith("--inspect="));
  if (inspectArg) {
    const inspectSlug = inspectArg.slice("--inspect=".length);
    const inspected = rows.find((row) => row.slug === inspectSlug);
    console.log(inspected ? JSON.stringify(inspected, null, 2) : `No eligible tool found for --inspect=${inspectSlug}`);
  }

  const changes: UpdatedToolContent[] = rows
    .map((row) => {
      const aiContent = cleanMarkdown(row.ai_content);
      const cons = cleanArray(row.cons);
      const notFor = cleanArray(row.not_for);
      let nextAiContent = aiContent.cleaned;
      let nextNotFor = notFor.cleaned;
      const removedItems = [...aiContent.removed, ...cons.removed.map((item) => `Cons: ${item}`), ...notFor.removed.map((item) => `Not Ideal For: ${item}`)];

      // Supabase officially supports self-hosting, so this generated exclusion is inaccurate.
      // Also remove the absolute no-vendor-lock-in claim from its summary.
      if (row.slug === "supabase") {
        const unsupportedSelfHostingExclusion = nextNotFor.filter(isSelfHostingClaim);
        nextNotFor = nextNotFor.filter((item) => !isSelfHostingClaim(item));
        removedItems.push(...unsupportedSelfHostingExclusion.map((item) => `Not Ideal For (unsupported): ${item}`));

        if (nextAiContent) {
          const withoutUnsupportedLockInClaim = nextAiContent.replace(/\s+without vendor lock[\s\u2010-\u2015\u2212-]?in\b/gi, "");
          if (withoutUnsupportedLockInClaim !== nextAiContent) {
            removedItems.push("Summary: removed absolute claim 'without vendor lock-in'");
            nextAiContent = withoutUnsupportedLockInClaim;
          }

          const correctedNotFor = removeMatchingSectionBullets(
            nextAiContent,
            "Not Ideal For",
            /(?:self[\s\u2010-\u2015\u2212-]?hosting|on[\s\u2010-\u2015\u2212-]?prem)/i
          );
          nextAiContent = correctedNotFor.cleaned;
          removedItems.push(...correctedNotFor.removed.map((item) => `${item} (unsupported)`));
        }
      }

      return {
        ...row,
        next_ai_content: nextAiContent,
        next_cons: cons.cleaned,
        next_not_for: nextNotFor,
        removed_items: removedItems,
      };
    })
    .filter((row) =>
      row.next_ai_content !== row.ai_content ||
      JSON.stringify(row.next_cons) !== JSON.stringify(row.cons ?? []) ||
      JSON.stringify(row.next_not_for) !== JSON.stringify(row.not_for ?? [])
    );

  console.log(`Scanned ${rows.length} approved successful tools; ${changes.length} have removable source-gap filler or exact duplicate bullets.`);
  for (const row of changes.slice(0, 30)) {
    console.log(`  ${row.slug}: cons ${row.cons?.length ?? 0}→${row.next_cons.length}, not_for ${row.not_for?.length ?? 0}→${row.next_not_for.length}`);
    for (const removed of row.removed_items.slice(0, 4)) console.log(`    remove: ${removed}`);
  }
  if (changes.length > 30) console.log(`  …and ${changes.length - 30} more`);

  if (!apply) {
    console.log("Dry run only. Review the candidates, then rerun with --apply to back up and save these edits.");
    return;
  }

  const outputDir = path.join(process.cwd(), "scripts", "out");
  await fs.mkdir(outputDir, { recursive: true });
  const backupPath = path.join(outputDir, `tool-content-cleanup-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await fs.writeFile(backupPath, JSON.stringify(changes.map(({ next_ai_content, next_cons, next_not_for, ...old }) => old), null, 2), "utf8");
  console.log(`Backup written: ${backupPath}`);

  let saved = 0;
  let failed = 0;
  for (const row of changes) {
    const { error } = await supabase
      .from("open_source_tools")
      .update({
        ai_content: row.next_ai_content,
        cons: row.next_cons,
        not_for: row.next_not_for,
      })
      .eq("id", row.id);

    if (error) {
      failed++;
      console.error(`  Failed ${row.slug}: ${error.message}`);
    } else {
      saved++;
    }
  }

  console.log(`Saved ${saved} tools; failed ${failed}. Original values are in ${backupPath}`);
}

main().catch((error) => {
  console.error(`Content cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
