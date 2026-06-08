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
  github_stars: number;
  language: string;
  license: string;
  ai_content?: string | null;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const DEFAULT_GROQ_DELAY_MS = 8000;
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

async function generateContentWithGroq(tool: Tool): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const prompt = `You are a senior technical writer for a developer-focused open source discovery platform called The Cloud Rain.

Your job is to write a detailed, honest, and developer-friendly page about an open source tool. The tone is direct, technical, and opinionated — like a senior engineer explaining a tool to a teammate, not a marketing copy.

Tool: ${tool.name}
Category: ${tool.category}
Description: ${tool.description}
GitHub Stars: ${tool.github_stars}
Language: ${tool.language}
License: ${tool.license}
URL: ${tool.url}

Write the following sections in this exact order using markdown. Each section must be detailed and specific to this tool — do NOT write generic content that could apply to any tool.

## What is ${tool.name}?
Write 2-3 paragraphs. Explain what problem it solves, what kind of developer or team would use it, and what makes it different from mainstream alternatives. Be specific about its architecture or approach if relevant.

## Key Features
List exactly 6 features. Each must be a real, specific feature of this tool — not generic claims like "easy to use" or "open source". Format as bullet points.

## Who Should Use ${tool.name}?
Write 1-2 paragraphs. Be specific about the ideal user — solo developer, startup, agency, enterprise, DevOps team, etc. Mention what stack or use case it fits best.

## Pros
List 4 honest pros. Be specific.

## Cons
List 3 honest cons or limitations. Be specific. Do not skip this section — developers trust honest reviews.

## Self-Hosting vs Managed Alternatives
Write 1-2 paragraphs comparing self-hosting this tool vs using a paid managed alternative. Include rough cost comparison if possible.

## Quick Start
Provide the most common installation command or setup steps. Use a code block with the appropriate language tag. Keep it minimal — just enough to get started.

## Alternatives to ${tool.name}
List 3-4 alternatives (can be open source or paid). One line each explaining when you would choose that alternative instead.

Write in markdown. Be technical, honest, and opinionated. Avoid generic marketing language.`;

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
        max_tokens: 2048,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GroqResponse;
      return data.choices[0].message.content;
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

async function saveContentToSupabase(
  supabase: any,
  toolId: string,
  content: string
): Promise<void> {
  const { error } = await (supabase.from('open_source_tools') as any)
    .update({ ai_content: content })
    .eq('id', toolId);

  if (error) {
    throw new Error(`Failed to save content for tool ${toolId}: ${error.message}`);
  }
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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: {
      transport: ws as unknown as WebSocketLikeConstructor
    }
  });

  console.log('🚀 Fetching approved tools from Supabase...');
  console.log(`🤖 Using Groq model: ${groqModel}`);
  console.log(`⏱️ Groq delay between tools: ${getGroqDelayMs()}ms`);
  console.log('🔎 Checking Groq model availability...');
  await validateGroqModel(groqModel);
  console.log('✅ Groq model is available.');

  // Fetch all approved tools where ai_content is empty
  const { data: tools, error } = await supabase
    .from('open_source_tools')
    .select('id, name, description, category, url, github_stars, language, license, ai_content')
    .eq('status', 'approved')
    .or('ai_content.is.null,ai_content.eq.');

  if (error) {
    throw new Error(`Failed to fetch tools: ${error.message}`);
  }

  if (!tools || tools.length === 0) {
    console.log('✅ No tools need content generation.');
    return;
  }

  console.log(`📝 Found ${tools.length} tools to generate content for.\n`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i] as Tool;

    try {
      console.log(`⏳ Generating content for: ${tool.name} (${i + 1}/${tools.length})`);

      // Generate content
      const content = await generateContentWithGroq(tool);

      // Save to Supabase
      await saveContentToSupabase(supabase, tool.id, content);

      console.log(`✅ Generated: ${tool.name} (${i + 1}/${tools.length})\n`);
      successCount++;

      // Rate limiting: delay between API calls to stay within TPM budget
      if (i < tools.length - 1) {
        await delay(getGroqDelayMs());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Failed to generate content for ${tool.name}: ${errorMessage}\n`);
      failureCount++;

      // Continue to next tool on error
      if (i < tools.length - 1) {
        await delay(getGroqDelayMs());
      }
    }
  }

  console.log('\n🎉 Content generation complete!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${tools.length}`);
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
