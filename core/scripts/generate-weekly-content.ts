import ws from 'ws';
import { createClient } from '@supabase/supabase-js';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  github_stars: number | null;
  language: string | null;
  license: string | null;
  slug: string;
}

interface FeaturedTool {
  name: string;
  slug: string;
  category: string;
  github_stars: number;
  summary: string;
  url: string;
}

interface ComparisonTool {
  name: string;
  slug: string;
  github_stars: number | null;
  language: string | null;
  license: string | null;
  url: string;
}

interface ComparisonData {
  category: string;
  tools: Array<{
    name: string;
    stars: number | null;
    language: string | null;
    license: string | null;
    url: string;
  }>;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
}

type RoundupNarrativeContext = {
  title: string;
  featuredTools: FeaturedTool[];
  comparisonCategory: string;
  comparisonTools: ComparisonTool[];
  newsItems: NewsItem[];
};

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface NewsArticle {
  title?: string;
  description?: string;
  source?: {
    name?: string;
  };
}

type GitHubRepoRef = {
  owner: string;
  repo: string;
};

type GitHubRepoResponse = {
  name: string;
  full_name: string;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  license: {
    spdx_id?: string | null;
    name?: string | null;
  } | null;
};

type GitHubSearchResponse = {
  items?: GitHubRepoResponse[];
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const DEFAULT_GROQ_DELAY_MS = 5500;
const GROQ_MAX_RETRIES = 3;
const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_REQUEST_DELAY_MS = 400;

function getGitHubHeaders(githubToken: string) {
  return {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION
  };
}

function normalizeText(value: string | null | undefined) {
  return (value || '').trim();
}

function normalizeToolForStorage(tool: Tool): Tool {
  return {
    ...tool,
    github_stars: typeof tool.github_stars === 'number' ? tool.github_stars : null,
    language: normalizeText(tool.language) || null,
    license: normalizeText(tool.license) || null
  };
}

function sanitizeComparisonStat(value: string | null | undefined) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeRepoName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getHostname(rawUrl: string | null | undefined) {
  if (!rawUrl) return '';

  try {
    return new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function extractGitHubRepo(rawUrl: string | null | undefined): GitHubRepoRef | null {
  if (!rawUrl) return null;

  try {
    const parsedUrl = new URL(rawUrl);
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

    if (hostname !== 'github.com') {
      return null;
    }

    const [owner, repoWithSuffix] = parsedUrl.pathname.split('/').filter(Boolean);
    if (!owner || !repoWithSuffix) {
      return null;
    }

    return {
      owner,
      repo: repoWithSuffix.replace(/\.git$/i, '')
    };
  } catch {
    return null;
  }
}

function extractGitHubRepoFromText(text: string | null | undefined): GitHubRepoRef | null {
  if (!text) return null;

  const match = text.match(/https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+/);
  return match ? extractGitHubRepo(match[0]) : null;
}

async function fetchGitHubRepo(repoRef: GitHubRepoRef, githubToken: string): Promise<GitHubRepoResponse> {
  const response = await fetch(`https://api.github.com/repos/${repoRef.owner}/${repoRef.repo}`, {
    headers: getGitHubHeaders(githubToken)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub repo lookup failed: ${response.status} - ${errorText.slice(0, 240)}`);
  }

  return (await response.json()) as GitHubRepoResponse;
}

async function searchGitHubRepositories(tool: Tool, githubToken: string): Promise<GitHubRepoResponse[]> {
  const searchQuery = `"${tool.name}" in:name sort:stars-desc`;
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=5`,
    { headers: getGitHubHeaders(githubToken) }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub search failed: ${response.status} - ${errorText.slice(0, 240)}`);
  }

  const data = (await response.json()) as GitHubSearchResponse;
  return data.items || [];
}

function pickBestGitHubRepoMatch(tool: Tool, candidates: GitHubRepoResponse[]): GitHubRepoResponse | null {
  if (!candidates.length) {
    return null;
  }

  const normalizedToolName = normalizeRepoName(tool.name);
  const toolHostname = getHostname(tool.url);

  const scored = candidates.map((candidate) => {
    const candidateName = normalizeRepoName(candidate.name);
    const candidateFullName = normalizeRepoName(candidate.full_name);
    const homepageHostname = getHostname(candidate.homepage);

    let score = 0;

    if (candidateName === normalizedToolName) score += 6;
    if (candidateFullName.endsWith(`/${normalizedToolName}`.replace('/', ''))) score += 2;
    if (candidateName.includes(normalizedToolName) || normalizedToolName.includes(candidateName)) score += 2;
    if (toolHostname && homepageHostname && toolHostname === homepageHostname) score += 5;
    if (toolHostname && candidate.homepage && candidate.homepage.includes(toolHostname)) score += 2;

    return { candidate, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return b.candidate.stargazers_count - a.candidate.stargazers_count;
  });

  return scored[0].score > 0 ? scored[0].candidate : null;
}

async function resolveGitHubRepoForTool(tool: Tool, githubToken: string): Promise<GitHubRepoResponse | null> {
  const directRepo = extractGitHubRepo(tool.url) || extractGitHubRepoFromText(tool.description);

  if (directRepo) {
    return fetchGitHubRepo(directRepo, githubToken);
  }

  const candidates = await searchGitHubRepositories(tool, githubToken);
  const bestCandidate = pickBestGitHubRepoMatch(tool, candidates);

  return bestCandidate;
}

async function syncToolGitHubMetadata(supabase: any, toolId: string, repo: GitHubRepoResponse): Promise<void> {
  const licenseValue = repo.license?.spdx_id || repo.license?.name || null;

  const { error } = await supabase
    .from('open_source_tools')
    .update({
      github_stars: repo.stargazers_count,
      language: repo.language,
      license: licenseValue
    })
    .eq('id', toolId);

  if (error) {
    console.warn(`⚠️ Failed to persist GitHub metadata for tool ${toolId}: ${error.message}`);
  }
}

async function enrichToolWithGitHubMetadata(
  supabase: any,
  tool: Tool,
  githubToken: string | null
): Promise<Tool> {
  const normalizedTool = normalizeToolForStorage(tool);
  const needsGitHubData =
    normalizedTool.github_stars === null ||
    normalizedTool.github_stars <= 0 ||
    !normalizedTool.language ||
    !normalizedTool.license;

  if (!githubToken || !needsGitHubData) {
    return normalizedTool;
  }

  try {
    const repo = await resolveGitHubRepoForTool(normalizedTool, githubToken);

    if (!repo) {
      return normalizedTool;
    }

    const enrichedTool: Tool = {
      ...normalizedTool,
      github_stars: repo.stargazers_count,
      language: repo.language,
      license: repo.license?.spdx_id || repo.license?.name || null
    };

    await syncToolGitHubMetadata(supabase, normalizedTool.id, repo);
    await delay(GITHUB_REQUEST_DELAY_MS);

    return enrichedTool;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️ GitHub enrichment failed for ${normalizedTool.name}: ${message}`);
    return normalizedTool;
  }
}

function getGroqDelayMs() {
  const value = Number(process.env.GROQ_DELAY_MS || DEFAULT_GROQ_DELAY_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_GROQ_DELAY_MS;
}

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

async function generateSummaryWithGroq(tool: Tool): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const prompt = `Write a compelling 1-2 sentence summary for a weekly developer tools roundup. Make it engaging and highlight why developers should care.

Tool: ${tool.name}
Category: ${tool.category}
Description: ${tool.description}
GitHub Stars: ${tool.github_stars}

Write only the summary paragraph, no titles or extra formatting.`;

  for (let attempt = 0; attempt <= GROQ_MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GroqResponse;
      return data.choices[0].message.content.trim();
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt < GROQ_MAX_RETRIES) {
      const retryDelayMs = getRetryDelayMs(response, attempt);
      console.warn(
        `⚠️ Groq rate limit for ${tool.name}. Retry ${attempt + 1}/${GROQ_MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`Groq API error: exhausted retries for ${tool.name}`);
}

async function generateComparisonWithGroq(tools: ComparisonTool[], category: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const toolsText = tools
    .map(
      t =>
        `${t.name}: ${t.github_stars} stars, ${t.language}, ${t.license} license`
    )
    .join('\n');

  const prompt = `Create a brief 2-3 sentence comparison of these ${category} tools for developers. Be specific about use cases.

${toolsText}

Write only the comparison paragraph, no titles.`;

  for (let attempt = 0; attempt <= GROQ_MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GroqResponse;
      return data.choices[0].message.content.trim();
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt < GROQ_MAX_RETRIES) {
      const retryDelayMs = getRetryDelayMs(response, attempt);
      console.warn(
        `⚠️ Groq rate limit for comparison. Retry ${attempt + 1}/${GROQ_MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`Groq API error: exhausted retries for comparison`);
}

async function generateEditorNoteWithGroq(context: RoundupNarrativeContext): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const featuredText = context.featuredTools
    .map((tool) => `- ${tool.name} (${tool.category || "Unknown category"}): ${tool.summary}`)
    .join('\n');

  const comparisonText = context.comparisonTools
    .map((tool) => `- ${tool.name}: ${tool.github_stars ?? 0} stars, ${tool.language || "Unknown language"}, ${tool.license || "Unknown license"}`)
    .join('\n');

  const newsText = context.newsItems.length > 0
    ? context.newsItems.map((item) => `- ${item.title}: ${item.summary}`).join('\n')
    : '- No news items were included this week.';

  const prompt = `Write an editor's note for a weekly open-source tools roundup.
It should feel like a concise editorial introduction for developers, 2 short paragraphs, around 120-180 words total.
Focus on patterns, why the selection matters, and how a reader should think about this issue.

Roundup title: ${context.title}
Comparison category: ${context.comparisonCategory}

Featured tools:
${featuredText}

Comparison tools:
${comparisonText}

News items:
${newsText}

Write only the editor's note. No heading, no bullet points.`;

  for (let attempt = 0; attempt <= GROQ_MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 260,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GroqResponse;
      return data.choices[0].message.content.trim();
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt < GROQ_MAX_RETRIES) {
      const retryDelayMs = getRetryDelayMs(response, attempt);
      console.warn(
        `⚠️ Groq rate limit for editor note. Retry ${attempt + 1}/${GROQ_MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  throw new Error('Groq API error: exhausted retries for editor note');
}

async function generateNewsSummaryWithGroq(title: string, description: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const prompt = `Summarize this tech news in 1-2 developer-friendly sentences. Keep it simple and focused.

Title: ${title}
Description: ${description}

Write only the summary, no extra formatting.`;

  for (let attempt = 0; attempt <= GROQ_MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GroqResponse;
      return data.choices[0].message.content.trim();
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt < GROQ_MAX_RETRIES) {
      const retryDelayMs = getRetryDelayMs(response, attempt);
      console.warn(
        `⚠️ Groq rate limit for news summary. Retry ${attempt + 1}/${GROQ_MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`Groq API error: exhausted retries for news summary`);
}

async function fetchTechNews(): Promise<NewsItem[]> {
  const gNewsApiKey = process.env.GNEWS_API_KEY;

  if (!gNewsApiKey) {
    console.warn(
      '⚠️ GNEWS_API_KEY not set. Skipping tech news. Set GNEWS_API_KEY to enable news summaries.'
    );
    return [];
  }

  try {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const query = `open source developer tools ${month} ${year}`;
    const { dateString } = getWeekStartDate();
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&from=${dateString}&apikey=${gNewsApiKey}`
    );

    if (!response.ok) {
      console.warn(`⚠️ GNews API error: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { articles?: any[] };
    const articles = data.articles || [];

    const newsItems: NewsItem[] = [];
    for (const article of articles.slice(0, 3)) {
      if (article.title && article.description) {
        try {
          const summary = await generateNewsSummaryWithGroq(article.title, article.description);
          newsItems.push({
            title: article.title,
            summary,
            source: article.source?.name || 'GNews'
          });
          await delay(getGroqDelayMs());
        } catch (err) {
          console.warn(`⚠️ Failed to summarize news: ${article.title}`);
        }
      }
    }

    return newsItems;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.warn(`⚠️ Failed to fetch news: ${errorMessage}`);
    return [];
  }
}

async function getFeaturedTools(
  supabase: any,
  count: number = 5
): Promise<Tool[]> {
  // First, get total number of approved tools
  const totalRes = await supabase
    .from('open_source_tools')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');

  const totalCount = totalRes.count as number || 0;
  const randomOffset = Math.floor(Math.random() * Math.max(0, totalCount - count));

  // Then fetch a random slice of tools based on the offset
  const { data, error } = await supabase
    .from('open_source_tools')
    .select('id, name, description, category, url, github_stars, language, license, slug')
    .eq('status', 'approved')
    .range(randomOffset, randomOffset + count - 1);

  if (error) {
    throw new Error(`Failed to fetch tools: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No approved tools found for featured selection');
  }

  return (data as Tool[]).map(normalizeToolForStorage);
}

async function getCategoryWithSufficientTools(
  supabase: any,
  minToolCount: number = 3
): Promise<string> {
  // Fetch all tool categories
  const { data: allTools, error } = await supabase
    .from('open_source_tools')
    .select('category')
    .eq('status', 'approved');

  if (error || !allTools) {
    throw new Error(`Failed to fetch categories: ${error?.message}`);
  }

  // Build category counts
  const categoryCounts: { [key: string]: number } = {};
  allTools.forEach((tool: any) => {
    if (tool.category) {
      categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
    }
  });

  // Unique list of categories
  const allCategories = Object.keys(categoryCounts);

  // Compute rotating category based on week number
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const rotated = allCategories[weekNum % allCategories.length];

  if (rotated && categoryCounts[rotated] >= minToolCount) {
    console.log(`✅ Selected rotating category: ${rotated} (${categoryCounts[rotated]} tools)`);
    return rotated;
  }

  // Fallback: choose the category with the highest count that meets the minimum
  const validCategories = Object.entries(categoryCounts)
    .filter(([_, count]) => count >= minToolCount)
    .map(([category, _]) => category);

  if (validCategories.length === 0) {
    throw new Error(`No categories found with at least ${minToolCount} tools`);
  }

  const highestCountCategory = Object.entries(categoryCounts)
    .filter(([category]) => validCategories.includes(category))
    .sort(([_, a], [__, b]) => b - a)[0];

  console.log(`✅ Selected fallback category: ${highestCountCategory[0]} (${highestCountCategory[1]} tools)`);
  return highestCountCategory[0];
}

async function getComparisonTools(
  supabase: any,
  category: string,
  count: number = 3,
  githubToken: string | null = null
): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('open_source_tools')
    .select('id, name, description, category, url, github_stars, language, license, slug')
    .eq('status', 'approved')
    .eq('category', category)
    .order('github_stars', { ascending: false })
    .limit(Math.max(count * 3, 8));

  if (error) {
    throw new Error(`Failed to fetch tools for comparison: ${error.message}`);
  }

  const normalizedTools = ((data || []) as Tool[]).map(normalizeToolForStorage);
  const enrichedTools: Tool[] = [];

  for (const tool of normalizedTools) {
    enrichedTools.push(await enrichToolWithGitHubMetadata(supabase, tool, githubToken));
  }

  return enrichedTools
    .sort((a, b) => {
      const starDelta = (b.github_stars || 0) - (a.github_stars || 0);
      if (starDelta !== 0) {
        return starDelta;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, count);
}

async function saveWeeklyRoundup(
  supabase: any,
  roundupData: {
    title: string;
    slug: string;
    week_date: string;
    featured_tools: FeaturedTool[];
    editor_note: string | null;
    comparison_table: ComparisonData;
    comparison_summary: string | null;
    news_summaries: NewsItem[];
  }
): Promise<void> {
  const { error } = await supabase
    .from('weekly_roundups')
    .insert({
      title: roundupData.title,
      slug: roundupData.slug,
      week_date: roundupData.week_date,
      featured_tools: roundupData.featured_tools,
      editor_note: roundupData.editor_note,
      comparison_table: roundupData.comparison_table,
      comparison_summary: roundupData.comparison_summary,
      news_summaries: roundupData.news_summaries,
      status: 'draft',
      created_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(`Failed to save weekly roundup: ${error.message}`);
  }
}

function getWeekStartDate(): { dateString: string; dateObj: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToThursday = dayOfWeek === 0 ? 4 : (4 - dayOfWeek + 7) % 7;
  const thursday = new Date(now);
  thursday.setDate(thursday.getDate() + (daysToThursday === 0 ? -3 : daysToThursday));
  thursday.setHours(0, 0, 0, 0);

  const year = thursday.getFullYear();
  const month = String(thursday.getMonth() + 1).padStart(2, '0');
  const day = String(thursday.getDate()).padStart(2, '0');

  return {
    dateString: `${year}-${month}-${day}`,
    dateObj: thursday
  };
}

function generateSlug(dateString: string): string {
  return `weekly-roundup-${dateString}`;
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
      messages: [
        {
          role: 'user',
          content: 'Reply with OK.',
        },
      ],
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const githubToken = process.env.GITHUB_TOKEN?.trim() || null;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set'
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: {
      transport: ws as unknown as WebSocketLikeConstructor
    }
  });

  console.log('🚀 Generating weekly roundup content...');
  console.log(`🤖 Using Groq model: ${groqModel}`);
  console.log(`⏱️ Groq delay between requests: ${getGroqDelayMs()}ms`);
  console.log(githubToken ? '🐙 GitHub enrichment enabled for comparison tools.' : '⚠️ GitHub enrichment disabled: GITHUB_TOKEN not set.');
  console.log('🔎 Checking Groq model availability...');
  await validateGroqModel(groqModel);
  console.log('✅ Groq model is available.\n');

  const { dateString, dateObj } = getWeekStartDate();
  const slug = generateSlug(dateString);
  const title = `Weekly Roundup - ${dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

  console.log(`📅 Generating roundup for week of: ${title}`);

  try {
    // 1. Fetch featured tools (5 tools)
    console.log('\n📝 Fetching featured tools...');
    const featuredTools = await getFeaturedTools(supabase, 5);

    if (featuredTools.length === 0) {
      throw new Error('No tools available for featured selection');
    }

    console.log(`✅ Got ${featuredTools.length} featured tools`);

    // 2. Generate summaries for featured tools
    console.log('\n✍️ Generating summaries for featured tools...');
    const featuredToolsWithSummaries: FeaturedTool[] = [];

    for (let i = 0; i < featuredTools.length; i++) {
      const tool = featuredTools[i];
      try {
        console.log(`⏳ Summarizing: ${tool.name} (${i + 1}/${featuredTools.length})`);
        const summary = await generateSummaryWithGroq(tool);

        featuredToolsWithSummaries.push({
          name: tool.name,
          slug: tool.slug,
          category: tool.category,
          github_stars: tool.github_stars || 0,
          summary,
          url: tool.url
        });

        console.log(`✅ Summarized: ${tool.name}`);

        if (i < featuredTools.length - 1) {
          await delay(getGroqDelayMs());
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Failed to summarize ${tool.name}: ${errorMessage}`);
      }
    }

    console.log(`\n✅ Generated ${featuredToolsWithSummaries.length} feature summaries`);

    // 3. Fetch tools for comparison (2-3 from one category)
    console.log('\n🔍 Selecting category for comparison...');
    const selectedCategory = await getCategoryWithSufficientTools(supabase, 3);
    const comparisonTools = await getComparisonTools(supabase, selectedCategory, 3, githubToken);

    let comparisonText = '';
    if (comparisonTools.length >= 2) {
      console.log(
        `⏳ Generating comparison for category: ${selectedCategory} (${comparisonTools.length} tools)`
      );
      comparisonText = await generateComparisonWithGroq(
        comparisonTools.map(t => ({
          name: t.name,
          slug: t.slug,
          github_stars: t.github_stars,
          language: t.language,
          license: t.license,
          url: t.url
        })),
        selectedCategory
      );
      console.log('✅ Generated comparison');
      await delay(getGroqDelayMs());
    } else {
      console.log(`⚠️ Not enough tools in category ${selectedCategory} for comparison`);
    }

    // 4. Fetch and summarize tech news
    console.log('\n📰 Fetching tech news...');
    const newsItems = await fetchTechNews();

    let editorNote: string | null = null;

    if (newsItems.length > 0) {
      console.log(`✅ Generated summaries for ${newsItems.length} news items`);
    } else {
      console.log('⚠️ No news items generated (GNEWS_API_KEY may not be set)');
    }

    try {
      console.log('\n📝 Generating editor note...');
      editorNote = await generateEditorNoteWithGroq({
        title,
        featuredTools: featuredToolsWithSummaries,
        comparisonCategory: selectedCategory,
        comparisonTools: comparisonTools.map((tool) => ({
          name: tool.name,
          slug: tool.slug,
          github_stars: tool.github_stars,
          language: tool.language,
          license: tool.license,
          url: tool.url
        })),
        newsItems
      });
      console.log('✅ Generated editor note');
      await delay(getGroqDelayMs());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`⚠️ Failed to generate editor note: ${errorMessage}`);
    }

    // 5. Save roundup to Supabase
    console.log('\n💾 Saving weekly roundup to Supabase...');
    const comparisonData: ComparisonData = {
      category: selectedCategory,
      tools: comparisonTools.map(t => ({
        name: t.name,
        stars: t.github_stars,
        language: sanitizeComparisonStat(t.language),
        license: sanitizeComparisonStat(t.license),
        url: t.url
      }))
    };

    await saveWeeklyRoundup(supabase, {
      title,
      slug,
      week_date: dateString,
      featured_tools: featuredToolsWithSummaries,
      editor_note: editorNote,
      comparison_table: comparisonData,
      comparison_summary: comparisonText || null,
      news_summaries: newsItems
    });

    console.log(`✅ Weekly roundup saved! Slug: ${slug}`);

    console.log('\n🎉 Weekly content generation complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Featured tools: ${featuredToolsWithSummaries.length}`);
    console.log(`   - Comparison tools: ${comparisonTools.length}`);
    console.log(`   - News items: ${newsItems.length}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`\n❌ Fatal error: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
