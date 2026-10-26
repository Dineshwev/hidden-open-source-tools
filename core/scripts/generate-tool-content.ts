import ws from 'ws';
import { createClient } from '@supabase/supabase-js';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';
import * as fs from 'fs';
import * as path from 'path';
import { getGroqModel } from './ai-config';
import { fetchAllSupabaseRows } from './fetch-all-supabase-rows';

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
  const model = getGroqModel();

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const prompt = `You are a senior technical writer for a developer-focused open source discovery platform called The Cloud Rain.

Your job is to write a concise, accurate, developer-friendly page about an open source tool. The tone is direct and factual.

SOURCE RULES:
- Use ONLY the facts explicitly present in the tool fields below. You do not have access to the repository README or website content in this generation path.
- Do not infer or invent features, architecture, supported languages, integrations, deployment methods, activity, audience, limitations, security claims, setup commands, alternatives, prices, or benchmarks.
- If the supplied fields do not support a section, omit that section. Never fill space with typical category assumptions or generic pros and cons.
- Do not turn missing metadata (including a null language) into a claim about how the tool works.
- Do not include cost comparisons or Quick Start commands unless those exact details are in the supplied fields.
- Write only what a reader can safely conclude from the supplied fields. Do not claim the page is comprehensive or independently verified.

Tool: ${tool.name}
Category: ${tool.category}
Description: ${tool.description}
GitHub Stars: ${tool.github_stars}
Language: ${tool.language}
License: ${tool.license}
URL: ${tool.url}

Write only sections supported by the supplied facts, using markdown. Do not pad the page to meet a section count.

## What is ${tool.name}?
Write one short paragraph that restates the supplied description without adding claims. If the description is empty, omit this section.

## Key Features
List only features explicitly present in the supplied description. If none are explicit, omit this section.

## Who Should Use ${tool.name}?
Include this section only when the supplied description explicitly identifies a user or use case.

## Pros
Include only factual advantages explicitly supported by the supplied fields. Omit this section if none are supported.

## Cons
Include only limitations explicitly supported by the supplied fields. Do not invent drawbacks to make the page appear balanced. Omit this section if none are supported.

## Self-Hosting vs Managed Alternatives
Omit this section unless the supplied fields explicitly describe deployment options and a managed alternative. Never estimate prices.

## Quick Start
Omit this section. No verified installation instructions are supplied to this generator.

## Alternatives to ${tool.name}
Omit this section unless alternatives are explicitly named in the supplied fields.

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
  const groqModel = getGroqModel();

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
  const tools = await fetchAllSupabaseRows<Tool>(() => supabase
    .from('open_source_tools')
    .select('id, name, description, category, url, github_stars, language, license, ai_content')
    .eq('status', 'approved')
    .or('ai_content.is.null,ai_content.eq.')
    .order('id', { ascending: true }));

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
