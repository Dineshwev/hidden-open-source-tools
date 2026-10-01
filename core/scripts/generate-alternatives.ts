import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import ws from "ws";
import { getGroqModel } from "./ai-config";
import { fetchAllSupabaseRows } from "./fetch-all-supabase-rows";
import { formatLicense } from "../lib/utils/license";
import { filterDisplayEntries } from "../lib/content-sanity";

dotenv.config({ path: ".env.local" });

type SaaSReference = {
  name: string;
  slug: string;
  official_url: string;
  description: string;
  categories: string[];
  pricing_info: string | null;
  key_features: string[] | null;
  integrations: string[] | null;
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
  structured_content_status: string | null;
};

type Narrative = {
  slug: string;
  tagline: string;
  description: string;
  best_for: string;
  tradeoffs: string;
};

type NarrativeResponse = {
  intro: string;
  why_alternatives: string;
  comparison_table_note: string;
  migration_tips: string;
  narratives: Narrative[];
  faq: Array<{ q: string; a: string }>;
  conclusion: string;
};

type ExistingAlternative = {
  id: string;
  status: string | null;
  verified_regenerated_at: string | null;
};

const GROQ_DELAY_MS = Number.parseInt(process.env.GROQ_DELAY_MS ?? "8000", 10);
const NETWORK_RETRY_DELAYS_MS = [5000, 15000, 30000];

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
    throw new Error("--limit must be a positive integer, for example --limit=3");
  }

  return limit;
}

function isForceRun(): boolean {
  return process.argv.includes("--force");
}

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function findCandidates(saas: SaaSReference, tools: ToolRow[]): ToolRow[] {
  const categories = new Set((saas.categories ?? []).map(normalizeCategory));

  return tools
    .filter((tool) =>
      tool.structured_content_status === "success" &&
      tool.category &&
      categories.has(normalizeCategory(tool.category))
    )
    .slice(0, 6);
}

function getGithubUrl(tool: ToolRow): string | null {
  if (tool.url?.toLowerCase().includes("github.com")) return tool.url;
  const source = `${tool.description ?? ""}\n${tool.readme_excerpt ?? ""}`;
  return source.match(/https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/)?.[0] ?? null;
}

function buildVerifiedCandidateData(tool: ToolRow) {
  return {
    name: tool.name,
    slug: tool.slug,
    category: tool.category,
    description: tool.description,
    github_stars: tool.github_stars,
    github_forks: tool.github_forks,
    github_contributors: tool.github_contributors,
    github_open_issues: tool.github_open_issues,
    github_last_commit: tool.github_last_commit,
    language: tool.language,
    license: tool.license,
    readme_excerpt: tool.readme_excerpt,
    best_for: tool.best_for,
    not_for: tool.not_for,
    pros: tool.pros,
    cons: tool.cons,
    pricing_info: tool.pricing_info,
    key_features: tool.key_features,
    integrations: tool.integrations,
  };
}

function buildPrompt(saas: SaaSReference, candidates: ToolRow[]): string {
  return `You are a technical writer for The Cloud Rain.

Write the narrative for a "Best Open Source Alternatives to ${saas.name}" page.
The SaaS description and candidate tool data below are verified database data.

Use only the supplied data. Do not invent, estimate, or guess any tool name, GitHub statistic,
license, pricing, feature, integration, date, founder, ranking metric, or performance claim.
If a claim is not supported by the supplied data, omit it.

Do not return candidate names, slugs, GitHub statistics, licenses, pricing_info, key_features,
integrations, or ranking metrics. Those values are inserted by a fixed template directly from
the database rows. Return narrative text only, with each narrative keyed by the supplied slug.

SaaS reference:
${JSON.stringify({
  name: saas.name,
  slug: saas.slug,
  description: saas.description,
  pricing_info: saas.pricing_info,
  key_features: saas.key_features,
  integrations: saas.integrations,
}, null, 2)}

Verified open-source candidates:
${JSON.stringify(candidates.map(buildVerifiedCandidateData), null, 2)}

Return only this JSON shape:
{
  "intro": "2-3 evidence-based sentences",
  "why_alternatives": "100-150 words using only supported reasons",
  "comparison_table_note": "One concise sentence",
  "migration_tips": "100-120 words using only supported information",
  "narratives": [
    {
      "slug": "one supplied candidate slug",
      "tagline": "One supported sentence",
      "description": "80-100 words grounded in the supplied candidate data",
      "best_for": "One supported short phrase",
      "tradeoffs": "One concise evidence-based paragraph"
    }
  ],
  "faq": [{ "q": "Question", "a": "Evidence-based answer" }],
  "conclusion": "60-80 words grounded in the supplied data"
}`;
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

async function generateNarrative(saas: SaaSReference, candidates: ToolRow[]): Promise<NarrativeResponse | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  for (let attempt = 0; attempt <= NETWORK_RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: getGroqModel(),
          messages: [{ role: "user", content: buildPrompt(saas, candidates) }],
          temperature: 0.2,
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`❌ Groq failed for ${saas.name}: ${response.status} ${body}`);
        if (response.status === 429 && attempt < NETWORK_RETRY_DELAYS_MS.length) {
          await delay(NETWORK_RETRY_DELAYS_MS[attempt]);
          continue;
        }
        return null;
      }

      const data = await response.json() as any;
      const raw = data.choices?.[0]?.message?.content?.trim();
      if (!raw) return null;
      return JSON.parse(raw) as NarrativeResponse;
    } catch (error) {
      console.error(`❌ Narrative generation failed for ${saas.name}:`, error);
      if (attempt < NETWORK_RETRY_DELAYS_MS.length) {
        await delay(NETWORK_RETRY_DELAYS_MS[attempt]);
        continue;
      }
      return null;
    }
  }

  return null;
}

function buildFixedAlternative(tool: ToolRow, narrative?: Narrative) {
  return {
    name: tool.name,
    slug: tool.slug,
    tagline: narrative?.tagline ?? "",
    description: narrative?.description ?? "",
    best_for: narrative?.best_for ?? "",
    tradeoffs: narrative?.tradeoffs ?? "",
    github_stars: tool.github_stars,
    github_forks: tool.github_forks,
    github_contributors: tool.github_contributors,
    github_open_issues: tool.github_open_issues,
    github_last_commit: tool.github_last_commit,
    language: tool.language,
    license: formatLicense(tool.license),
    pricing_info: tool.pricing_info,
    key_features: filterDisplayEntries(tool.key_features, `${tool.name} key_features`),
    integrations: filterDisplayEntries(tool.integrations, `${tool.name} integrations`),
    resources: {
      official_url: tool.url,
      github_url: getGithubUrl(tool),
    },
  };
}

function buildContent(saas: SaaSReference, candidates: ToolRow[], narrative: NarrativeResponse) {
  const narratives = new Map((narrative.narratives ?? []).map((item) => [item.slug, item]));

  return {
    meta_title: `Best Open Source Alternatives to ${saas.name}`,
    meta_description: `Compare verified open-source alternatives to ${saas.name} using real project data, features, pricing, licenses, and resources.`,
    intro: narrative.intro,
    why_alternatives: narrative.why_alternatives,
    alternatives: candidates.map((tool) => buildFixedAlternative(tool, narratives.get(tool.slug))),
    comparison_table_note: narrative.comparison_table_note,
    migration_tips: narrative.migration_tips,
    faq: narrative.faq ?? [],
    conclusion: narrative.conclusion,
    verified_saas: {
      name: saas.name,
      slug: saas.slug,
      description: saas.description,
      official_url: saas.official_url,
      pricing_info: saas.pricing_info,
      key_features: filterDisplayEntries(saas.key_features, `${saas.name} key_features`),
      integrations: filterDisplayEntries(saas.integrations, `${saas.name} integrations`),
    },
  };
}

async function main() {
  console.log("RAW ARGV:", JSON.stringify(process.argv));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    realtime: { transport: ws as any },
  });
  const limit = getLimit();
  const force = isForceRun();
  const model = getGroqModel();

  await validateGroqModel(model);

  const [saasRows, tools] = await Promise.all([
    fetchAllSupabaseRows<SaaSReference>(() => supabase
      .from("saas_reference")
      .select("name, slug, official_url, description, categories, pricing_info, key_features, integrations")
      .order("slug", { ascending: true })),
    fetchAllSupabaseRows<ToolRow>(() => supabase
      .from("open_source_tools")
      .select("id, name, slug, category, description, url, github_stars, github_forks, github_contributors, github_open_issues, github_last_commit, language, license, readme_excerpt, best_for, not_for, pros, cons, pricing_info, key_features, integrations, structured_content_status")
      .eq("structured_content_status", "success")
      .order("id", { ascending: true })),
  ]);

  const { data: existingRows, error: existingError } = await supabase
    .from("alternatives")
    .select("id, saas_slug, status, verified_regenerated_at");
  if (existingError) throw new Error(`Failed to fetch alternatives: ${existingError.message}`);

  const existingBySlug = new Map<string, ExistingAlternative>(
    (existingRows ?? []).map((row: any) => [row.saas_slug, row]),
  );
  const unverifiedRows = saasRows.filter((row) => !existingBySlug.get(row.slug)?.verified_regenerated_at);
  const selectedRows = force ? saasRows : unverifiedRows;
  const rows = limit === null ? selectedRows : selectedRows.slice(0, limit);

  console.log(`✅ ${saasRows.length} SaaS rows, ${tools.length} verified tools; processing ${rows.length}${limit === null ? "" : ` due to --limit=${limit}`}`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < rows.length; index++) {
    const saas = rows[index];
    console.log(`[${index + 1}/${rows.length}] Processing: ${saas.name}`);

    const candidates = findCandidates(saas, tools);
    if (candidates.length < 3) {
      console.warn(`  ⚠️ Skipping ${saas.name}: only ${candidates.length} verified category matches`);
      skipped++;
      continue;
    }

    const narrative = await generateNarrative(saas, candidates);
    if (!narrative) {
      failed++;
      await delay(GROQ_DELAY_MS);
      continue;
    }

    const content = buildContent(saas, candidates, narrative);
    const existing = existingBySlug.get(saas.slug);
    const payload = {
      saas_name: saas.name,
      saas_slug: saas.slug,
      saas_description: saas.description,
      content,
      status: existing?.status ?? "draft",
      verified_regenerated_at: new Date().toISOString(),
    };

    const result = existing
      ? await supabase.from("alternatives").update(payload).eq("id", existing.id)
      : await supabase.from("alternatives").insert(payload);

    if (result.error) {
      console.error(`  ❌ Failed to save ${saas.name}: ${result.error.message}`);
      failed++;
    } else {
      console.log(`  ✅ Saved ${saas.name} with ${candidates.length} verified alternatives`);
      success++;
    }

    await delay(GROQ_DELAY_MS);
  }

  console.log(`\n✅ Success: ${success}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${rows.length}`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exitCode = 1;
});
