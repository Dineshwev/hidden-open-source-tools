import { createClient } from '@supabase/supabase-js';
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
  github_stars: number;
  language: string;
  license: string;
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
  github_stars: number;
  language: string;
  license: string;
  url: string;
}

interface ComparisonData {
  category: string;
  tools: Array<{
    name: string;
    stars: number;
    language: string;
    license: string;
    url: string;
  }>;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
}

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const DEFAULT_GROQ_DELAY_MS = 5500;
const GROQ_MAX_RETRIES = 3;

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
  const newsApiKey = process.env.NEWS_API_KEY;

  if (!newsApiKey) {
    console.warn(
      '⚠️ NEWS_API_KEY not set. Skipping tech news. Set NEWS_API_KEY to enable news summaries.'
    );
    return [];
  }

  const keywords = [
    'open source tools',
    'developer tools',
    'self-hosted',
    'developer productivity',
    'AI tools'
  ];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(randomKeyword)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${newsApiKey}`
    );

    if (!response.ok) {
      console.warn(`⚠️ News API error: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { articles?: NewsArticle[] };
    const articles = data.articles || [];

    const newsItems: NewsItem[] = [];
    for (const article of articles.slice(0, 3)) {
      if (article.title && article.description) {
        try {
          const summary = await generateNewsSummaryWithGroq(article.title, article.description);
          newsItems.push({
            title: article.title,
            summary,
            source: article.source?.name || 'Tech News'
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
  const { data, error } = await supabase
    .from('open_source_tools')
    .select('id, name, description, category, url, github_stars, language, license, slug')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    throw new Error(`Failed to fetch tools: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No approved tools found for featured selection');
  }

  return data as Tool[];
}

async function getComparisonTools(
  supabase: any,
  category: string,
  count: number = 3
): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('open_source_tools')
    .select('id, name, description, category, url, github_stars, language, license, slug')
    .eq('status', 'approved')
    .eq('category', category)
    .order('github_stars', { ascending: false })
    .limit(count);

  if (error) {
    throw new Error(`Failed to fetch tools for comparison: ${error.message}`);
  }

  return data as Tool[];
}

async function saveWeeklyRoundup(
  supabase: any,
  roundupData: {
    title: string;
    slug: string;
    week_date: string;
    featured_tools: FeaturedTool[];
    comparison_table: ComparisonData;
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
      comparison_table: roundupData.comparison_table,
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

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set'
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🚀 Generating weekly roundup content...');
  console.log(`🤖 Using Groq model: ${groqModel}`);
  console.log(`⏱️ Groq delay between requests: ${getGroqDelayMs()}ms`);
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
          github_stars: tool.github_stars,
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
    const selectedCategory = featuredTools[0].category;
    const comparisonTools = await getComparisonTools(supabase, selectedCategory, 3);

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

    if (newsItems.length > 0) {
      console.log(`✅ Generated summaries for ${newsItems.length} news items`);
    } else {
      console.log('⚠️ No news items generated (NEWS_API_KEY may not be set)');
    }

    // 5. Save roundup to Supabase
    console.log('\n💾 Saving weekly roundup to Supabase...');
    const comparisonData: ComparisonData = {
      category: selectedCategory,
      tools: comparisonTools.map(t => ({
        name: t.name,
        stars: t.github_stars,
        language: t.language,
        license: t.license,
        url: t.url
      }))
    };

    await saveWeeklyRoundup(supabase, {
      title,
      slug,
      week_date: dateString,
      featured_tools: featuredToolsWithSummaries,
      comparison_table: comparisonData,
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
