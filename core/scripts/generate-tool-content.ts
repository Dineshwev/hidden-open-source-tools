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

  // Build a rich context from all known facts
  const hasStars = tool.github_stars && tool.github_stars > 0;
  const starsLabel = hasStars ? `${tool.github_stars.toLocaleString()} GitHub stars` : null;
  const licenseLabel = tool.license && tool.license !== 'NOASSERTION' ? tool.license : null;
  const knownFacts = [
    starsLabel && `Community traction: ${starsLabel}`,
    licenseLabel && `License: ${licenseLabel}`,
    tool.language && `Primary language: ${tool.language}`,
  ].filter(Boolean).join('\n');

  const toolSlug = tool.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const prompt = `You are a senior technical writer for a developer-focused open source directory called The Cloud Rain. Your audience is developers, DevOps engineers, and technical founders evaluating tools.

Write a comprehensive, accurate, SEO-friendly guide about the open source tool below. The page must be substantive (aim for 700–1000 words of body text across all sections) and genuinely useful for someone deciding whether to adopt the tool.

GROUNDING RULES:
- Base ALL factual claims on the supplied "Known facts" and "Description" fields. You may expand on these facts with common, well-established knowledge about the tool (e.g. if the description says "written in Rust" you may note memory safety; if it says "Docker support" you may show a docker run example).
- Do NOT invent integrations, benchmarks, pricing, or specific version numbers that are not mentioned.
- Do NOT use phrases like "as of my knowledge cutoff" or "I cannot verify".
- Write in a direct, technical, opinionated voice. Avoid marketing fluff.

TOOL DATA:
Name: ${tool.name}
Category: ${tool.category}
URL: ${tool.url}
Description: ${tool.description}
Known facts:
${knownFacts || '(none beyond description)'}

---

Write the following sections in markdown. Include ALL sections below, even if brief. Never omit a section.

## What is ${tool.name}?
2–3 sentences: what the tool does, what problem it solves, and who it is for. Lead with the strongest claim.

## Core Capabilities
Bullet list of 5–8 concrete features or capabilities. Each bullet should be a specific capability, not a vague adjective. If a feature is especially noteworthy, give one sentence of context after the bullet.

## Architecture & How It Works
1–2 paragraphs explaining the technical design: how data flows, what the runtime model is, what protocol or storage layer it uses, etc. If the language is known, mention why that choice matters for performance or safety.

## Self-Hosting & Deployment
Explain what it takes to run this in production: Docker, Kubernetes, bare-metal, cloud-agnostic? Include a minimal Docker example if the tool is known to support Docker. Mention resource requirements if known.

\`\`\`bash
# Minimal example – verify against official docs before use
docker run -d --name ${toolSlug} \\
  -p 3000:3000 \\
  ghcr.io/example/${toolSlug}:latest
\`\`\`

## Who Should Use ${tool.name}?
Describe the ideal adopter profile: team size, existing stack, use case. Also mention who should NOT use it (a team that needs X, or a scale where Y breaks down).

## Strengths
3–5 bullet points of genuine advantages. Be specific — reference star count, license, language, or technical properties from the known facts.

## Trade-offs & Limitations
3–5 bullet points of honest limitations or situations where this tool is a poor fit. Do not be vague. If self-hosting complexity is real, say so.

## Alternatives & When to Choose Them
Name 2–3 alternatives (open-source or commercial) and in one sentence each explain when you would pick the alternative over ${tool.name}.

Write in markdown only. No frontmatter. No horizontal rules between sections.`;

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
        // Increased token budget for comprehensive content
        max_tokens: 3000,
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
  content: string,
  toolDescription: string
): Promise<void> {
  // Extract a better description from the "What is X?" section of the AI content
  // if the existing description is too short (< 80 chars)
  const updatePayload: Record<string, string> = { ai_content: content };

  if (toolDescription.length < 80) {
    // Parse the first paragraph after "## What is" heading
    const whatIsMatch = content.match(/##\s+What is [^\n]+\n+([\s\S]+?)(?=\n##|$)/i);
    if (whatIsMatch) {
      const extractedPara = whatIsMatch[1].trim().split('\n')[0].trim();
      if (extractedPara && extractedPara.length > toolDescription.length) {
        // Strip any markdown links
        const cleanPara = extractedPara.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
        if (cleanPara.length > 50) {
          updatePayload.description = cleanPara.slice(0, 500);
          console.log(`  ↳ Backfilled description from AI content (${cleanPara.length} chars)`);
        }
      }
    }
  }

  const { error } = await (supabase.from('open_source_tools') as any)
    .update(updatePayload)
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

      // Save to Supabase (also backfills description if it was too short)
      await saveContentToSupabase(supabase, tool.id, content, tool.description || '');

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
