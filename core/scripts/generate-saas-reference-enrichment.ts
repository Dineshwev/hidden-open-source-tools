import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { getGroqModel } from "./ai-config";
import {
  scrapeWebsiteContent,
  WEBSITE_ENRICHMENT_GROUNDING_RULES,
} from "../lib/firecrawl-enrichment";

dotenv.config({ path: ".env.local" });

const GROQ_DELAY_MS = Number.parseInt(process.env.GROQ_DELAY_MS ?? "20000", 10);
const MAX_429_RETRIES = 3;
const RATE_LIMIT_BUFFER_MS = 1000;
const NETWORK_RETRY_DELAYS_MS = [5000, 15000, 30000];

type SaaSReference = {
  name: string;
  slug: string;
  official_url: string;
  description: string;
  pricing_info: string | null;
  key_features: string[] | null;
  integrations: string[] | null;
  enrichment_completed_at: string | null;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorCause(error: unknown): unknown {
  return error && typeof error === "object" && "cause" in error
    ? (error as { cause?: unknown }).cause
    : undefined;
}

function formatErrorValue(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const cause = getErrorCause(error);
  const causeCode = cause && typeof cause === "object" && "code" in cause
    ? String((cause as { code?: unknown }).code).toLowerCase()
    : "";

  return message.includes("fetch failed") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    /econnreset|econnrefused|etimedout|enotfound|eai_again/.test(causeCode) ||
    /econnreset|econnrefused|etimedout|enotfound|eai_again/.test(message);
}

function getOptionValue(name: string): string | null {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);

  const index = process.argv.indexOf(name);
  const next = index >= 0 ? process.argv[index + 1] : undefined;
  return next && !next.startsWith("--") ? next : null;
}

function getLimit(): number | null {
  const value = getOptionValue("--limit");
  if (value === null) return null;

  const limit = Number.parseInt(value, 10);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer, for example --limit=5");
  }

  return limit;
}

function isForceRun(): boolean {
  return process.argv.includes("--force");
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

  return GROQ_DELAY_MS * (attempt + 1) + RATE_LIMIT_BUFFER_MS;
}

async function validateGroqModel(model: string): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable not set");

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
    throw new Error(`Groq model preflight failed: ${response.status} - ${await response.text()}`);
  }
}

function buildPrompt(row: SaaSReference, websiteContent: string): string {
  return `IMPORTANT: Return only one valid JSON object. No markdown, code fences, or explanation.

You are enriching a manually curated SaaS reference entry. Use the description and official website content only.
Do not invent, estimate, or infer pricing, features, integrations, numbers, dates, or claims.

${WEBSITE_ENRICHMENT_GROUNDING_RULES}

Name: ${row.name}
Description: ${row.description}
Official website content:
${websiteContent || "Not available"}

Return exactly:
{
  "pricing_info": null,
  "key_features": [],
  "integrations": []
}

pricing_info must be null unless the website literally states pricing information. Keep it as a short factual summary. Keep each key_features and integrations item concise and include only explicitly named values.`;
}

async function generateEnrichment(row: SaaSReference, websiteContent: string): Promise<{
  pricing_info: string | null;
  key_features: string[];
  integrations: string[];
} | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  for (let attempt = 0; attempt <= MAX_429_RETRIES; attempt++) {
    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: getGroqModel(),
          messages: [{ role: "user", content: buildPrompt(row, websiteContent) }],
          temperature: 0.1,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });
    } catch (error) {
      const cause = getErrorCause(error);
      console.error(
        `  ❌ Groq network error for ${row.name}: ` +
          `message=${formatErrorValue(error)} cause=${formatErrorValue(cause)}`
      );

      const networkAttempt = attempt;
      if (isNetworkError(error) && networkAttempt < NETWORK_RETRY_DELAYS_MS.length) {
        const retryDelayMs = NETWORK_RETRY_DELAYS_MS[networkAttempt];
        console.warn(
          `  ⚠️ Retrying network failure for ${row.name} ` +
            `${networkAttempt + 1}/${NETWORK_RETRY_DELAYS_MS.length} after ${retryDelayMs}ms.`
        );
        await delay(retryDelayMs);
        continue;
      }

      throw error;
    }

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429 && attempt < MAX_429_RETRIES) {
        const waitMs = getRateLimitWaitMs(response, body, attempt);
        console.warn(
          `  ⚠️ Groq rate limit for ${row.name}; retry ${attempt + 1}/${MAX_429_RETRIES} after ${waitMs}ms.`
        );
        await delay(waitMs);
        continue;
      }

      console.error(`  ❌ Groq failed for ${row.name}: ${response.status} ${body}`);
      return null;
    }

    const data = await response.json() as any;
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return {
        pricing_info: typeof parsed.pricing_info === "string" ? parsed.pricing_info.trim() || null : null,
        key_features: Array.isArray(parsed.key_features) ? parsed.key_features.filter((item: unknown) => typeof item === "string") : [],
        integrations: Array.isArray(parsed.integrations) ? parsed.integrations.filter((item: unknown) => typeof item === "string") : [],
      };
    } catch (error) {
      console.error(`  ❌ Invalid enrichment JSON for ${row.name}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`  ↳ raw=${JSON.stringify(raw.slice(0, 500))}`);
      return null;
    }
  }

  return null;
}

async function main() {
  console.log("RAW ARGV:", JSON.stringify(process.argv));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const limit = getLimit();
  const force = isForceRun();
  const model = getGroqModel();

  await validateGroqModel(model);

  const { count: totalCount } = await supabase
    .from("saas_reference")
    .select("slug", { count: "exact", head: true });
  const { count: enrichedCount } = await supabase
    .from("saas_reference")
    .select("slug", { count: "exact", head: true })
    .not("enrichment_completed_at", "is", null);

  console.log(`📈 SaaS enrichment progress: ${enrichedCount ?? 0}/${totalCount ?? 0} enriched, ${Math.max(0, (totalCount ?? 0) - (enrichedCount ?? 0))} remaining`);
  console.log(`⏱️ Delay between Groq calls: ${GROQ_DELAY_MS}ms (override with GROQ_DELAY_MS)`);

  let query = supabase
    .from("saas_reference")
    .select("name, slug, official_url, description, pricing_info, key_features, integrations, enrichment_completed_at")
    .order("slug", { ascending: true });

  if (!force) query = query.is("enrichment_completed_at", null);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch SaaS references: ${error.message}`);

  const rows = limit === null ? data ?? [] : (data ?? []).slice(0, limit);
  console.log(`✅ Found ${data?.length ?? 0} eligible rows; processing ${rows.length}${limit === null ? "" : ` due to --limit=${limit}`}`);

  let success = 0;
  let failed = 0;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index] as SaaSReference;
    console.log(`[${index + 1}/${rows.length}] Processing: ${row.name}`);

    try {
      const websiteContent = await scrapeWebsiteContent(row.official_url, row.name);
      const enrichment = await generateEnrichment(row, websiteContent);
      if (!enrichment) {
        failed++;
        await delay(GROQ_DELAY_MS);
        continue;
      }

      const { data: savedRow, error: updateError } = await supabase
        .from("saas_reference")
        .update({
          pricing_info: enrichment.pricing_info,
          key_features: enrichment.key_features,
          integrations: enrichment.integrations,
          enrichment_completed_at: new Date().toISOString(),
        })
        .eq("slug", row.slug)
        .select("slug, enrichment_completed_at")
        .maybeSingle();

      if (updateError || !savedRow) {
        console.error(
          `  ❌ Database update failed for ${row.name}: ` +
            (updateError?.message ?? "no row was returned after update")
        );
        failed++;
      } else {
        console.log(`  ✅ Enrichment saved (${savedRow.enrichment_completed_at})`);
        success++;
      }
    } catch (error) {
      console.error(
        `  ❌ Unrecoverable failure for ${row.name}: ` +
          `message=${formatErrorValue(error)} cause=${formatErrorValue(getErrorCause(error))}`
      );
      failed++;
    }

    await delay(GROQ_DELAY_MS);
  }

  console.log(`\n✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${rows.length}`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exitCode = 1;
});
