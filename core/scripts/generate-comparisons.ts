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

interface Comparison {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  status: string;
  content?: string | null;
}

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

async function generateContentWithCerebras(toolA: string, toolB: string): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  const model = process.env.CEREBRAS_MODEL || "gpt-oss-120b";

  if (!apiKey) {
    throw new Error('CEREBRAS_API_KEY environment variable not set');
  }

  const prompt = `You are a senior technical writer for The Cloud Rain, a developer-focused open source discovery platform.

Write a detailed, honest comparison page between ${toolA} and ${toolB}.

Write in markdown with these exact sections:

## ${toolA} vs ${toolB}: Which Should You Choose? (2026)

One paragraph overview explaining what both tools do and who this comparison is for.

## Quick Verdict
Two lines:
- Choose ${toolA} if: [specific use case]
- Choose ${toolB} if: [specific use case]

## Side-by-Side Comparison

A markdown table with these rows:
| Feature | ${toolA} | ${toolB} |
|---------|----------|----------|
| Pricing | | |
| Open Source | | |
| Self-hostable | | |
| Best for | | |
| Learning curve | | |
| Community size | | |

## What is ${toolA}?
2 paragraphs. Explain what it is, who made it, what problem it solves.

## What is ${toolB}?
2 paragraphs. Same format.

## Head to Head

### Performance
1 paragraph comparing performance.

### Pricing
1 paragraph comparing pricing. Include specific numbers where possible.

### Self-Hosting
1 paragraph. Can you self-host? How hard is it?

### Developer Experience
1 paragraph comparing DX, docs, community.

## Pros and Cons

### ${toolA}
Pros:
- 3 specific pros

Cons:
- 2 specific cons

### ${toolB}
Pros:
- 3 specific pros

Cons:
- 2 specific cons

## Who Should Use ${toolA}?
1 paragraph. Be specific about the ideal user profile.

## Who Should Use ${toolB}?
1 paragraph. Be specific about the ideal user profile.

## Final Verdict
2-3 paragraphs. Give an honest recommendation. Do not sit on the fence — pick a winner for each use case.

Be technical, honest, and opinionated. Avoid generic marketing language.`;

  for (let attempt = 0; attempt <= API_MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
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
        `⚠️ Cerebras rate limit for ${toolA} vs ${toolB}. Retry ${attempt + 1}/${API_MAX_RETRIES} after ${retryDelayMs}ms.`
      );
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`Cerebras API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`Cerebras API error: exhausted retries for ${toolA} vs ${toolB}`);
}

async function saveContentToSupabase(
  supabase: any,
  id: string,
  content: string
): Promise<void> {
  const { error } = await (supabase.from('comparisons') as any)
    .update({ content, status: 'published' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to save content for comparison ${id}: ${error.message}`);
  }
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
    throw new Error(`Cerebras model preflight failed for ${model}: ${response.status} - ${error}`);
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cerebrasModel = process.env.CEREBRAS_MODEL || "gpt-oss-120b";

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

  console.log('🚀 Fetching pending comparisons from Supabase...');
  console.log(`🤖 Using Cerebras model: ${cerebrasModel}`);
  console.log(`⏱️ Delay between calls: ${CEREBRAS_DELAY_MS}ms`);
  console.log('🔎 Checking Cerebras model availability...');
  await validateCerebrasModel(cerebrasModel);
  console.log('✅ Cerebras model is available.');

  // Fetch all pending comparisons
  const { data: comparisons, error } = await supabase
    .from('comparisons')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Failed to fetch comparisons: ${error.message}`);
  }

  if (!comparisons || comparisons.length === 0) {
    console.log('✅ No pending comparisons need content generation.');
    return;
  }

  console.log(`📝 Found ${comparisons.length} comparisons to generate content for.\n`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < comparisons.length; i++) {
    const comparison = comparisons[i] as Comparison;

    try {
      console.log(`⏳ Generating content for: ${comparison.tool_a} vs ${comparison.tool_b} (${i + 1}/${comparisons.length})`);

      // Generate content
      const content = await generateContentWithCerebras(comparison.tool_a, comparison.tool_b);

      // Save to Supabase
      await saveContentToSupabase(supabase, comparison.id, content);

      console.log(`✅ Generated: ${comparison.slug} (${i + 1}/${comparisons.length})\n`);
      successCount++;

      if (i < comparisons.length - 1) {
        await delay(CEREBRAS_DELAY_MS);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Failed to generate content for ${comparison.slug}: ${errorMessage}\n`);
      failureCount++;

      if (i < comparisons.length - 1) {
        await delay(CEREBRAS_DELAY_MS);
      }
    }
  }

  console.log('\n🎉 Content generation complete!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${comparisons.length}`);
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
