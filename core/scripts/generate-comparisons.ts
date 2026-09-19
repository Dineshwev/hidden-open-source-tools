import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import ws from 'ws';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';

dotenv.config({ path: '.env.local' });

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  status: string;
  content?: string | null;
};

type ToolRow = {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  category: string | null;
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
  structured_content_status: string | null;
};

interface CerebrasResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const CEREBRAS_DELAY_MS = 5000;
const API_MAX_RETRIES = 3;

function getRetryDelayMs(response: Response, attempt: number) {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const retryAfterSeconds = Number(retryAfter);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return Math.ceil(retryAfterSeconds * 1000);
    }
  }

  return Math.min(15000, 1000 * 2 ** attempt);
}

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase();
}

function isGitHubUrl(value: string | null): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.hostname.toLowerCase().replace(/^www\./, '') === 'github.com';
  } catch {
    return false;
  }
}

function getGitHubUrl(tool: ToolRow): string | null {
  if (isGitHubUrl(tool.url)) return tool.url;

  const source = `${tool.description || ''}\n${tool.readme_excerpt || ''}`;
  const match = source.match(/https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/);
  return match?.[0] || null;
}

function getOfficialUrl(tool: ToolRow): string | null {
  return tool.url && !isGitHubUrl(tool.url) ? tool.url : null;
}

function formatMetric(value: number | string | null | undefined): string {
  return value === null || value === undefined || value === '' ? 'Not available' : String(value);
}

function buildFixedVerifiedSignals(toolA: ToolRow, toolB: ToolRow): string {
  return `## Verified Project Signals

| Signal | ${toolA.name || 'Tool A'} | ${toolB.name || 'Tool B'} |
|---|---:|---:|
| GitHub stars | ${formatMetric(toolA.github_stars)} | ${formatMetric(toolB.github_stars)} |
| GitHub forks | ${formatMetric(toolA.github_forks)} | ${formatMetric(toolB.github_forks)} |
| Contributors | ${formatMetric(toolA.github_contributors)} | ${formatMetric(toolB.github_contributors)} |
| Open issues | ${formatMetric(toolA.github_open_issues)} | ${formatMetric(toolB.github_open_issues)} |
| Last commit | ${formatMetric(toolA.github_last_commit)} | ${formatMetric(toolB.github_last_commit)} |
| Language | ${formatMetric(toolA.language)} | ${formatMetric(toolB.language)} |
| License | ${formatMetric(toolA.license)} | ${formatMetric(toolB.license)} |`;
}

function buildResources(tool: ToolRow): string {
  const officialUrl = getOfficialUrl(tool);
  const githubUrl = getGitHubUrl(tool);
  const official = officialUrl ? `[Official website](${officialUrl})` : 'Not available in verified data';
  const github = githubUrl ? `[GitHub repository](${githubUrl})` : 'Not available in verified data';

  return `### ${tool.name || 'Tool'}

- Official Website: ${official}
- GitHub Repository: ${github}`;
}

function buildFixedResources(toolA: ToolRow, toolB: ToolRow): string {
  return `## Resources

${buildResources(toolA)}

${buildResources(toolB)}`;
}

function buildVerifiedToolData(tool: ToolRow) {
  return {
    name: tool.name,
    slug: tool.slug,
    category: tool.category,
    github_stars: tool.github_stars,
    github_forks: tool.github_forks,
    github_contributors: tool.github_contributors,
    github_open_issues: tool.github_open_issues,
    github_last_commit: tool.github_last_commit,
    language: tool.language,
    license: tool.license,
    readme_excerpt: tool.readme_excerpt,
    pros: tool.pros,
    cons: tool.cons,
    best_for: tool.best_for,
    not_for: tool.not_for,
  };
}

function buildComparisonPrompt(toolA: ToolRow, toolB: ToolRow): string {
  const verifiedData = JSON.stringify({
    tool_a: buildVerifiedToolData(toolA),
    tool_b: buildVerifiedToolData(toolB),
  }, null, 2);

  return `You are a senior technical writer for The Cloud Rain, a developer-focused open source discovery platform.

Write a detailed, honest comparison page between ${toolA.name} and ${toolB.name}.

Use only the data provided below. Do not invent, estimate, or guess any number, founder name, founding date, pricing figure, or fact not present in this data. If a comparison point cannot be supported by the data given, omit it rather than inventing it.

The verified project signals and Resources section are added by a fixed template after your response. Do not write a GitHub statistics section, Resources section, resource links, pricing figures, dates, founder stories, founding stories, or other numeric metrics in your response.

Write in markdown with these sections:

## ${toolA.name} vs ${toolB.name}: Which Should You Choose?

One concise overview based only on the supplied descriptions and README excerpts.

## Quick Verdict

Two evidence-based lines:
- Choose ${toolA.name} if: [supported use case]
- Choose ${toolB.name} if: [supported use case]

## Side-by-Side Comparison

A markdown table comparing only supported qualitative differences such as best fit, limitations, deployment context, and learning considerations. Do not add unsupported rows.

## What is ${toolA.name}?

Explain what it does and who it may suit using only the supplied data. Do not discuss who created it or its origin.

## What is ${toolB.name}?

Explain what it does and who it may suit using only the supplied data. Do not discuss who created it or its origin.

## Head to Head

Compare the tools using only their supplied best_for, not_for, pros, cons, README excerpts, and verified fields. Omit unsupported comparisons.

### Practical Tradeoffs

Explain which type of team or project may prefer each tool. Do not invent performance, pricing, adoption, or market claims.

## Pros and Cons

Summarize only the supplied pros and cons for each tool. Do not add new claims.

## Final Verdict

Give a concise recommendation for each supported use case. If the data is insufficient to choose, say that the available data is insufficient.

Verified data, and the only source of truth:
${verifiedData}`;
}

async function generateContentWithCerebras(toolA: ToolRow, toolB: ToolRow): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  const model = process.env.CEREBRAS_MODEL || 'gpt-oss-120b';

  if (!apiKey) {
    throw new Error('CEREBRAS_API_KEY environment variable not set');
  }

  const prompt = buildComparisonPrompt(toolA, toolB);

  for (let attempt = 0; attempt <= API_MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as CerebrasResponse;
      return data.choices[0].message.content;
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt < API_MAX_RETRIES) {
      const retryDelayMs = getRetryDelayMs(response, attempt);
      console.warn(
        `⚠️ Cerebras rate limit for ${toolA.name} vs ${toolB.name}. Retry ${attempt + 1}/${API_MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Cerebras API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`Cerebras API error: exhausted retries for ${toolA.name} vs ${toolB.name}`);
}

async function saveContentToSupabase(supabase: any, id: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('comparisons')
    .update({ content, status: 'published' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to save content for comparison ${id}: ${error.message}`);
  }
}

async function markNeedsReview(supabase: any, comparison: Comparison, reason: string): Promise<void> {
  const { error } = await supabase
    .from('comparisons')
    .update({ status: 'needs_review' })
    .eq('id', comparison.id);

  if (error) {
    console.error(`❌ Could not mark ${comparison.slug} as needs_review: ${error.message}`);
    return;
  }

  console.warn(`⚠️ Skipped ${comparison.slug}: ${reason}. Marked needs_review.`);
}

async function validateCerebrasModel(model: string): Promise<void> {
  const apiKey = process.env.CEREBRAS_API_KEY;

  if (!apiKey) {
    throw new Error('CEREBRAS_API_KEY environment variable not set');
  }

  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with OK.' }],
      temperature: 0,
      max_tokens: 4,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cerebras model preflight failed for ${model}: ${response.status} - ${error}`);
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cerebrasModel = process.env.CEREBRAS_MODEL || 'gpt-oss-120b';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set'
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as unknown as WebSocketLikeConstructor },
  });

  console.log('🚀 Fetching all comparisons for verified regeneration...');
  console.log(`🤖 Using Cerebras model: ${cerebrasModel}`);
  console.log(`⏱️ Delay between calls: ${CEREBRAS_DELAY_MS}ms`);
  console.log('🔎 Checking Cerebras model availability...');
  await validateCerebrasModel(cerebrasModel);
  console.log('✅ Cerebras model is available.');

  const [{ data: comparisons, error: comparisonError }, { data: tools, error: toolsError }] = await Promise.all([
    supabase.from('comparisons').select('id, slug, tool_a, tool_b, status, content'),
    supabase
      .from('open_source_tools')
      .select('id, name, slug, description, category, url, github_stars, github_forks, github_contributors, github_open_issues, github_last_commit, language, license, readme_excerpt, best_for, not_for, pros, cons, structured_content_status'),
  ]);

  if (comparisonError) {
    throw new Error(`Failed to fetch comparisons: ${comparisonError.message}`);
  }
  if (toolsError) {
    throw new Error(`Failed to fetch open_source_tools: ${toolsError.message}`);
  }

  if (!comparisons || comparisons.length === 0) {
    console.log('✅ No comparisons found.');
    return;
  }

  const toolRows = (tools || []) as ToolRow[];
  const bySlug = new Map(
    toolRows
      .filter((tool) => tool.slug)
      .map((tool) => [normalizeLookupValue(tool.slug as string), tool])
  );
  const byName = new Map(
    toolRows
      .filter((tool) => tool.name)
      .map((tool) => [normalizeLookupValue(tool.name as string), tool])
  );

  const findTool = (value: string): ToolRow | null =>
    bySlug.get(normalizeLookupValue(value)) || byName.get(normalizeLookupValue(value)) || null;

  console.log(`📝 Found ${comparisons.length} comparisons and ${toolRows.length} tool rows.\n`);

  let successCount = 0;
  let skippedCount = 0;
  let failureCount = 0;

  for (let i = 0; i < comparisons.length; i++) {
    const comparison = comparisons[i] as Comparison;
    const toolA = findTool(comparison.tool_a);
    const toolB = findTool(comparison.tool_b);

    if (!toolA || !toolB) {
      const missing = [
        !toolA ? `${comparison.tool_a} (not found)` : null,
        !toolB ? `${comparison.tool_b} (not found)` : null,
      ].filter(Boolean).join('; ');
      await markNeedsReview(supabase, comparison, missing);
      skippedCount++;
      continue;
    }

    const invalidStatus = [
      toolA.structured_content_status !== 'success'
        ? `${toolA.name || comparison.tool_a} status=${toolA.structured_content_status || 'null'}`
        : null,
      toolB.structured_content_status !== 'success'
        ? `${toolB.name || comparison.tool_b} status=${toolB.structured_content_status || 'null'}`
        : null,
    ].filter(Boolean).join('; ');

    if (invalidStatus) {
      await markNeedsReview(supabase, comparison, invalidStatus);
      skippedCount++;
      continue;
    }

    try {
      console.log(`⏳ Regenerating: ${comparison.tool_a} vs ${comparison.tool_b} (${i + 1}/${comparisons.length})`);

      const narrative = await generateContentWithCerebras(toolA, toolB);
      const content = [
        narrative.trim(),
        buildFixedVerifiedSignals(toolA, toolB),
        buildFixedResources(toolA, toolB),
      ].join('\n\n');

      await saveContentToSupabase(supabase, comparison.id, content);

      console.log(`✅ Regenerated: ${comparison.slug} (${i + 1}/${comparisons.length})\n`);
      successCount++;

      if (i < comparisons.length - 1) {
        await delay(CEREBRAS_DELAY_MS);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`❌ Failed to regenerate ${comparison.slug}: ${errorMessage}\n`);
      failureCount++;
    }
  }

  console.log('\n🎉 Verified comparison regeneration complete!');
  console.log(`✅ Successfully regenerated: ${successCount}`);
  console.log(`⚠️ Skipped for manual review: ${skippedCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${comparisons.length}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
