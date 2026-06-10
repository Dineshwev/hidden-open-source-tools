import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import ws from "ws";
dotenv.config({ path: ".env.local" });

const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, realtime: { transport: ws as any } }
);

const SAAS_LIST = [
  { name: "Notion", slug: "notion", description: "all-in-one workspace" },
  { name: "Zapier", slug: "zapier", description: "workflow automation" },
  { name: "Airtable", slug: "airtable", description: "spreadsheet-database hybrid" },
  { name: "Mixpanel", slug: "mixpanel", description: "product analytics" },
  { name: "Datadog", slug: "datadog", description: "infrastructure monitoring" },
  { name: "Figma", slug: "figma", description: "collaborative design" },
  { name: "Intercom", slug: "intercom", description: "customer messaging" },
  { name: "Retool", slug: "retool", description: "internal tool builder" },
  { name: "Linear", slug: "linear", description: "project management" },
  { name: "Loom", slug: "loom", description: "async video messaging" },
];

async function generateAlternative(saas: { name: string; slug: string; description: string }) {
  const prompt = `You are a technical writer for The Cloud Rain (thecloudrain.org), a platform that surfaces hidden open-source tools as alternatives to expensive SaaS products.

Write a comprehensive "Best Open Source Alternatives to ${saas.name}" page. ${saas.name} is a ${saas.description} tool.

Respond ONLY with a valid JSON object, no markdown, no backticks. Schema:

{
  "meta_title": "Best Open Source Alternatives to ${saas.name} in 2025",
  "meta_description": "string, 150-160 chars, compelling SEO description",
  "intro": "string, 2-3 sentences explaining why people look for ${saas.name} alternatives",
  "why_alternatives": "string, 100-150 words on cost/privacy/customization reasons",
  "alternatives": [
    {
      "name": "tool name",
      "slug": "tool-slug-for-thecloudrain",
      "tagline": "one sentence pitch",
      "description": "80-100 words technical description",
      "best_for": "one short phrase e.g. 'Teams wanting self-hosted Notion'",
      "github_stars": "e.g. 12k",
      "license": "MIT / Apache 2.0 / etc",
      "similarity_score": 85
    }
  ],
  "comparison_table_note": "string, 1 sentence intro for the comparison table",
  "migration_tips": "string, 100-120 words practical migration advice from ${saas.name}",
  "faq": [
    { "q": "question", "a": "answer, 40-60 words" }
  ],
  "conclusion": "string, 60-80 words wrapping up"
}

Rules:
- Include 4-6 genuine open-source tools that actually exist
- All tools must be real projects on GitHub
- similarity_score is 0-100 (how close to ${saas.name}'s core feature set)
- Prioritize tools that are production-ready and actively maintained
- Be honest about limitations
- Use technical, developer-friendly language`;

  const response = await cerebras.chat.completions.create({
    model: "gpt-oss-120b",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 3000,
  });

  const raw = (response as any).choices[0].message.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function main() {
  const args = process.argv.slice(2);
  const targetSlug = args[0]; // optional: npm run generate-alternatives -- notion

  const list = targetSlug
    ? SAAS_LIST.filter((s) => s.slug === targetSlug)
    : SAAS_LIST;

  for (const saas of list) {
    const { data: existing } = await supabase
      .from("alternatives")
      .select("id, status")
      .eq("saas_slug", saas.slug)
      .single();

    if (existing && existing.status === "approved") {
      console.log(`⏭ Skipping ${saas.name} (already approved)`);
      continue;
    }

    console.log(`⚙ Generating ${saas.name}...`);

    try {
      const content = await generateAlternative(saas);

      const row = {
        saas_name: saas.name,
        saas_slug: saas.slug,
        saas_description: saas.description,
        content,
        status: "draft",
      };

      if (existing) {
        await supabase.from("alternatives").update(row).eq("id", existing.id);
        console.log(`✅ Updated ${saas.name}`);
      } else {
        await supabase.from("alternatives").insert(row);
        console.log(`✅ Inserted ${saas.name}`);
      }

      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      console.error(`❌ Failed ${saas.name}:`, err);
    }
  }

  console.log("Done.");
}

main();