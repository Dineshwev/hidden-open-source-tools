import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { getGroqModel } from "./ai-config";
import {
  scrapeWebsiteContent,
  WEBSITE_ENRICHMENT_GROUNDING_RULES,
} from "../lib/firecrawl-enrichment";

dotenv.config({ path: ".env.local" });

const GROQ_DELAY_MS = Number.parseInt(process.env.GROQ_DELAY_MS ?? "8000", 10);

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

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

  if (!response.ok) {
    console.error(`  ❌ Groq failed for ${row.name}: ${response.status} ${await response.text()}`);
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

    const websiteContent = await scrapeWebsiteContent(row.official_url, row.name);
    const enrichment = await generateEnrichment(row, websiteContent);
    if (!enrichment) {
      failed++;
      await delay(GROQ_DELAY_MS);
      continue;
    }

    const { error: updateError } = await supabase
      .from("saas_reference")
      .update({
        pricing_info: enrichment.pricing_info,
        key_features: enrichment.key_features,
        integrations: enrichment.integrations,
        enrichment_completed_at: new Date().toISOString(),
      })
      .eq("slug", row.slug);

    if (updateError) {
      console.error(`  ❌ Database update failed for ${row.name}: ${updateError.message}`);
      failed++;
    } else {
      console.log("  ✅ Enrichment saved");
      success++;
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
