import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import ws from 'ws';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';
import { getGroqModel } from './ai-config';
import { SAAS_REFERENCE, type SaaSReference } from '../lib/saas-reference';
import { fetchAllSupabaseRows } from './fetch-all-supabase-rows';
import { formatLicense } from '../lib/utils/license';

dotenv.config({ path: '.env.local' });

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  status: string;
  content?: string | null;
  verified_regenerated_at?: string | null;
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

type ComparisonSide = ToolRow | SaaSReference;

const OPEN_SOURCE_ALIASES: Record<string, string> = {
  plausible: 'plausible-analytics',
};

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const GROQ_DELAY_MS = 8000;
const MAX_RETRIES = 2;
const NETWORK_RETRY_DELAYS_MS = [5000, 15000, 30000];

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function getErrorCause(error: unknown): unknown {
  return error && typeof error === 'object' && 'cause' in error
    ? (error as { cause?: unknown }).cause
    : undefined;
}

function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const cause = getErrorCause(error);
  const causeCode = cause && typeof cause === 'object' && 'code' in cause
    ? String((cause as { code?: unknown }).code).toLowerCase()
    : '';

  return message.includes('fetch failed') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    /econnreset|econnrefused|etimedout|enotfound|eai_again/.test(causeCode) ||
    /econnreset|econnrefused|etimedout|enotfound|eai_again/.test(message);
}

function formatErrorValue(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
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

function isToolRow(side: ComparisonSide): side is ToolRow {
  return 'structured_content_status' in side;
}

function getOfficialUrl(tool: ToolRow): string | null {
  return tool.url && !isGitHubUrl(tool.url) ? tool.url : null;
}

function formatMetric(value: number | string | null | undefined): string {
  return value === null || value === undefined || value === '' ? 'Not available' : String(value);
}

function buildFixedVerifiedSignals(toolA: ComparisonSide, toolB: ComparisonSide): string {
  return [toolA, toolB]
    .filter(isToolRow)
    .map((tool) => `### ${tool.name || 'Tool'}

| Signal | Verified value |
|---|---:|
| GitHub stars | ${formatMetric(tool.github_stars)} |
| GitHub forks | ${formatMetric(tool.github_forks)} |
| Contributors | ${formatMetric(tool.github_contributors)} |
| Open issues | ${formatMetric(tool.github_open_issues)} |
| Last commit | ${formatMetric(tool.github_last_commit)} |
| Language | ${formatMetric(tool.language)} |
| License | ${formatLicense(tool.license)} |`)
    .map((block, index) => `${index === 0 ? '## Verified Project Signals\n\n' : ''}${block}`)
    .join('\n\n');
}

function buildResources(tool: ComparisonSide): string {
  if (!isToolRow(tool)) {
    return `### ${tool.name}\n\n- Official Website: [Official website](${tool.official_url})\n- GitHub Repository: Not available for SaaS`;
  }
  const officialUrl = getOfficialUrl(tool);
  const githubUrl = getGitHubUrl(tool);
  const official = officialUrl ? `[Official website](${officialUrl})` : 'Not available in verified data';
  const github = githubUrl ? `[GitHub repository](${githubUrl})` : 'Not available in verified data';

  return `### ${tool.name || 'Tool'}

- Official Website: ${official}
- GitHub Repository: ${github}`;
}

function buildFixedResources(toolA: ComparisonSide, toolB: ComparisonSide): string {
  return `## Resources

${buildResources(toolA)}

${buildResources(toolB)}`;
}

function buildVerifiedToolData(tool: ToolRow | SaaSReference) {
  if (!isToolRow(tool)) {
    return {
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      official_url: tool.official_url,
      github_data_available: false,
    };
  }
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

function buildComparisonPrompt(toolA: ComparisonSide, toolB: ComparisonSide): string {
  const verifiedData = JSON.stringify({
    tool_a: buildVerifiedToolData(toolA),
    tool_b: buildVerifiedToolData(toolB),
  }, null, 2);

  const saasInstructions = [toolA, toolB]
    .filter((tool): tool is SaaSReference => !isToolRow(tool))
    .map((tool) => `${tool.name} is a SaaS reference entry with no GitHub data available. Do not invent GitHub stars, forks, contributors, commits, license, language, or any other GitHub data for this side.`)
    .join('\n');

  return `You are a senior technical writer for The Cloud Rain, a developer-focused open source discovery platform.

Write a detailed, honest comparison page between ${toolA.name} and ${toolB.name}.

Use only the data provided below. Do not invent, estimate, or guess any number, founder name, founding date, pricing figure, or fact not present in this data. If a comparison point cannot be supported by the data given, omit it rather than inventing it.

The verified project signals and Resources section are added by a fixed template after your response. Do not write a GitHub statistics section, Resources section, resource links, pricing figures, dates, founder stories, founding stories, or other numeric metrics in your response.
${saasInstructions}

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

async function generateContentWithGroq(toolA: ComparisonSide, toolB: ComparisonSide): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const prompt = buildComparisonPrompt(toolA, toolB);

  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: getGroqModel(),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });
    } catch (error) {
      const cause = getErrorCause(error);
      console.error(
        `❌ Groq network error for ${toolA.name} vs ${toolB.name}: ` +
          `message=${formatErrorValue(error)} cause=${formatErrorValue(cause)}`
      );

      if (isNetworkError(error) && attempt < NETWORK_RETRY_DELAYS_MS.length) {
        const retryDelayMs = NETWORK_RETRY_DELAYS_MS[attempt];
        console.warn(
          `⚠️ Retrying network failure ${attempt + 1}/${NETWORK_RETRY_DELAYS_MS.length} ` +
            `after ${retryDelayMs}ms.`
        );
        await delay(retryDelayMs);
        continue;
      }

      throw error;
    }

    if (response.ok) {
      const data = (await response.json()) as GroqResponse;
      return data.choices[0].message.content.trim();
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : NaN;
      const retryDelayMs = Number.isFinite(retryAfterMs)
        ? retryAfterMs
        : GROQ_DELAY_MS * (attempt + 1);
      console.warn(
        `⚠️ Groq rate limit for ${toolA.name} vs ${toolB.name}. Retry ${attempt + 1}/${MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`Groq API error: exhausted retries for ${toolA.name} vs ${toolB.name}`);
}

async function saveContentToSupabase(supabase: any, id: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('comparisons')
    .update({
      content,
      status: 'published',
      verified_regenerated_at: new Date().toISOString(),
    })
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

async function validateGroqModel(model: string): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
    throw new Error(`Groq model preflight failed for ${model}: ${response.status} - ${error}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const slugArg = args.find((arg) => arg.startsWith('--slug='));
  const force = args.includes('--force');
  const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : null;
  const requestedSlug = slugArg?.slice('--slug='.length).trim() || null;

  if (limitArg && (!Number.isInteger(limit) || (limit as number) < 1)) {
    throw new Error('--limit must be a positive integer, for example --limit=3');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set'
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws as unknown as WebSocketLikeConstructor },
  });

  console.log('🚀 Fetching all comparisons for verified regeneration...');
  const groqModel = getGroqModel();
  console.log(`🤖 Using Groq model: ${groqModel}`);
  console.log(`⏱️ Delay between calls: ${GROQ_DELAY_MS}ms`);
  console.log('🔎 Checking Groq model availability...');
  await validateGroqModel(groqModel);
  console.log('✅ Groq model is available.');

  let comparisonsQuery = supabase
    .from('comparisons')
    .select('id, slug, tool_a, tool_b, status, content, verified_regenerated_at')
    .order('id', { ascending: true });

  if (!force) {
    comparisonsQuery = comparisonsQuery.is('verified_regenerated_at', null);
  }

  const [{ data: comparisons, error: comparisonError }, tools] = await Promise.all([
    comparisonsQuery,
    fetchAllSupabaseRows<ToolRow>(() => supabase
      .from('open_source_tools')
      .select('id, name, slug, description, category, url, github_stars, github_forks, github_contributors, github_open_issues, github_last_commit, language, license, readme_excerpt, best_for, not_for, pros, cons, structured_content_status')
      .order('id', { ascending: true })),
  ]);

  if (comparisonError) {
    throw new Error(`Failed to fetch comparisons: ${comparisonError.message}`);
  }
  if (!comparisons || comparisons.length === 0) {
    console.log('✅ No comparisons found.');
    return;
  }

  const [{ count: verifiedCount, error: verifiedCountError }, { count: remainingCount, error: remainingCountError }] = await Promise.all([
    supabase.from('comparisons').select('id', { count: 'exact', head: true }).not('verified_regenerated_at', 'is', null),
    supabase.from('comparisons').select('id', { count: 'exact', head: true }).is('verified_regenerated_at', null),
  ]);

  if (verifiedCountError || remainingCountError) {
    throw new Error(`Failed to fetch verification progress: ${verifiedCountError?.message || remainingCountError?.message}`);
  }

  console.log(
    `📊 Verified progress: ${verifiedCount || 0}/${(verifiedCount || 0) + (remainingCount || 0)} verified, ` +
      `${remainingCount || 0} remaining${force ? ' (--force)' : ''}`
  );

  let selectedComparisons = comparisons as Comparison[];
  if (requestedSlug) {
    const lookup = normalizeLookupValue(requestedSlug);
    selectedComparisons = selectedComparisons.filter(
      (comparison) =>
        normalizeLookupValue(comparison.slug) === lookup ||
        normalizeLookupValue(comparison.id) === lookup
    );
  }
  if (limit !== null) {
    selectedComparisons = selectedComparisons.slice(0, limit as number);
  }

  if (selectedComparisons.length === 0) {
    console.log(requestedSlug
      ? `✅ No comparison found for --slug=${requestedSlug}.`
      : '✅ No comparisons selected.');
    return;
  }

  const toolRows = tools as ToolRow[];
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

  const saasByKey = new Map(
    SAAS_REFERENCE.flatMap((entry) => [
      [normalizeLookupValue(entry.name), entry] as const,
      [normalizeLookupValue(entry.slug), entry] as const,
    ])
  );

  const findTool = async (value: string): Promise<ComparisonSide | null> => {
    const saasMatch = saasByKey.get(normalizeLookupValue(value));
    if (saasMatch) {
      console.log(`[matching-debug] SaaS reference match: name=${JSON.stringify(saasMatch.name)} slug=${JSON.stringify(saasMatch.slug)}`);
      return saasMatch;
    }

    const normalizedValue = normalizeLookupValue(value);
    const slugAttempt = OPEN_SOURCE_ALIASES[normalizedValue] || normalizedValue;
    const nameAttempt = normalizedValue;

    const rawLookupDebugValues = new Set(['supabase', 'meilisearch', 'typesense']);
    if (rawLookupDebugValues.has(normalizedValue)) {
      console.log(
        `[matching-debug] raw exact lookup value=${JSON.stringify(value)} ` +
          `slugAttempt=${JSON.stringify(slugAttempt)} ` +
          `nameAttempt=${JSON.stringify(nameAttempt)} ` +
          `loadedToolRows=${JSON.stringify(toolRows.length)}`
      );

      const [slugQuery, nameQuery] = await Promise.all([
        supabase.from('open_source_tools').select('slug, name').eq('slug', slugAttempt).limit(20),
        supabase.from('open_source_tools').select('slug, name').eq('name', nameAttempt).limit(20),
      ]);
      console.log(
        `[matching-debug] raw exact query result value=${JSON.stringify(value)} ` +
          `slugQuery=${JSON.stringify({ data: slugQuery.data, error: slugQuery.error })} ` +
          `nameQuery=${JSON.stringify({ data: nameQuery.data, error: nameQuery.error })}`
      );
    }

    const slugMatch = bySlug.get(slugAttempt);
    const nameMatch = byName.get(nameAttempt);
    const match = slugMatch || nameMatch || null;

    console.log(
      `[matching-debug] search value=${JSON.stringify(value)} ` +
        `slug-attempt=${JSON.stringify(slugAttempt)} ` +
        `name-attempt=${JSON.stringify(nameAttempt)}`
    );

    if (match) {
      console.log(
        `[matching-debug] exact match: slug=${JSON.stringify(match.slug)} ` +
          `name=${JSON.stringify(match.name)}`
      );
      return match;
    }

    const broadTerm = value.trim().replace(/[%_]/g, '');
    const [{ data: slugCandidates, error: slugError }, { data: nameCandidates, error: nameError }] =
      await Promise.all([
        supabase.from('open_source_tools').select('slug, name').ilike('slug', `%${broadTerm}%`).limit(20),
        supabase.from('open_source_tools').select('slug, name').ilike('name', `%${broadTerm}%`).limit(20),
      ]);

    if (slugError || nameError) {
      console.error(
        `[matching-debug] broad ilike search failed for ${JSON.stringify(value)}: ` +
          `${slugError?.message || nameError?.message}`
      );
    } else {
      const candidates = new Map<string, { slug: string | null; name: string | null }>();
      for (const candidate of [...(slugCandidates || []), ...(nameCandidates || [])]) {
        candidates.set(`${candidate.slug || ''}\u0000${candidate.name || ''}`, candidate);
      }
      console.log(
        `[matching-debug] broad ilike candidates for ${JSON.stringify(value)}: ` +
          JSON.stringify([...candidates.values()])
      );
    }

    return null;
  };

  console.log(`📝 Processing ${selectedComparisons.length} of ${comparisons.length} comparisons and ${toolRows.length} tool rows fetched across all pages.\n`);

  let successCount = 0;
  let skippedCount = 0;
  let failureCount = 0;

  for (let i = 0; i < selectedComparisons.length; i++) {
    const comparison = selectedComparisons[i];
    const toolA = await findTool(comparison.tool_a);
    const toolB = await findTool(comparison.tool_b);

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
      isToolRow(toolA) && toolA.structured_content_status !== 'success'
        ? `${toolA.name || comparison.tool_a} status=${toolA.structured_content_status || 'null'}`
        : null,
      isToolRow(toolB) && toolB.structured_content_status !== 'success'
        ? `${toolB.name || comparison.tool_b} status=${toolB.structured_content_status || 'null'}`
        : null,
    ].filter(Boolean).join('; ');

    if (invalidStatus) {
      await markNeedsReview(supabase, comparison, invalidStatus);
      skippedCount++;
      continue;
    }

    try {
      console.log(`⏳ Regenerating: ${comparison.tool_a} vs ${comparison.tool_b} (${i + 1}/${selectedComparisons.length})`);

      const narrative = await generateContentWithGroq(toolA, toolB);
      const content = [
        narrative.trim(),
        buildFixedVerifiedSignals(toolA, toolB),
        buildFixedResources(toolA, toolB),
      ].join('\n\n');

      await saveContentToSupabase(supabase, comparison.id, content);

      console.log(`✅ Regenerated: ${comparison.slug} (${i + 1}/${selectedComparisons.length})\n`);
      successCount++;

      if (i < selectedComparisons.length - 1) {
        await delay(GROQ_DELAY_MS);
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
  console.log(`📊 Total: ${selectedComparisons.length}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exitCode = 1;
});
