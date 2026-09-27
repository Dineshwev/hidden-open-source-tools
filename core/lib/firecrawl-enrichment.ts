import FirecrawlApp from "@mendable/firecrawl-js";

const WEBSITE_MAX_CHARS = 12000;

export function getFirecrawlDelayMs(): number {
  const configuredDelayMs = Number.parseInt(process.env.FIRECRAWL_DELAY_MS ?? "12000", 10);
  return Number.isFinite(configuredDelayMs) && configuredDelayMs >= 0 ? configuredDelayMs : 12000;
}

export const WEBSITE_ENRICHMENT_GROUNDING_RULES = `
Extract pricing information, key features, and third-party integrations ONLY if they are literally present in the scraped website content below. If pricing is not mentioned, set pricing_info to null — do not guess a price or say "free" unless the site states it. Only list key features and integrations that the website explicitly names. If information is absent, use an empty array or null. Never invent, estimate, or infer facts.
`;

let lastFirecrawlRequestAt = 0;

function formatErrorDetails(error: unknown): string {
  if (!error || typeof error !== "object") return `message=${String(error)}`;

  const value = error as {
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
    response?: { data?: unknown };
  };
  const details: string[] = [];
  if (value.message !== undefined) details.push(`message=${String(value.message)}`);
  if (value.status !== undefined) details.push(`status=${String(value.status)}`);
  if (value.statusCode !== undefined) details.push(`statusCode=${String(value.statusCode)}`);
  if (value.response?.data !== undefined) {
    details.push(`response.data=${JSON.stringify(value.response.data)}`);
  }
  return details.join("; ") || `details=${JSON.stringify(error)}`;
}

function isGithubUrl(url: string | null | undefined): boolean {
  return Boolean(url?.toLowerCase().includes("github.com"));
}

function findPricingLink(homepageUrl: string, result: any): string | null {
  try {
    const homepage = new URL(homepageUrl);
    const links = Array.isArray(result?.links) ? result.links : [];
    const markdownLinks = String(result?.markdown ?? "").matchAll(
      /\[[^\]]*(?:pricing|plans?)\b[^\]]*\]\((https?:\/\/[^)]+|\/[^)]+)\)/gi,
    );
    const candidates = [...links, ...Array.from(markdownLinks, (match) => match[1])];

    for (const candidate of candidates) {
      try {
        const url = new URL(String(candidate), homepage.origin);
        if (url.origin === homepage.origin && /\/(pricing|plans?)(?:\/|$)/i.test(url.pathname)) {
          return url.toString();
        }
      } catch {
        // Ignore malformed links in scraped content.
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function waitForFirecrawlRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastFirecrawlRequestAt;
  const waitMs = Math.max(0, getFirecrawlDelayMs() - elapsed);
  if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastFirecrawlRequestAt = Date.now();
}

export async function scrapeWebsiteContent(url: string, toolName: string): Promise<string> {
  if (isGithubUrl(url)) return "";

  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    console.warn(`  ⚠️ Firecrawl API key missing for ${toolName}; using non-website sources`);
    return "";
  }

  try {
    const firecrawl = new FirecrawlApp({ apiKey });
    await waitForFirecrawlRateLimit();

    let homepage: any;
    try {
      homepage = await firecrawl.scrapeUrl(url, { formats: ["markdown"] }) as any;
    } catch (error) {
      console.warn(`  ⚠️ Firecrawl homepage request threw for ${toolName}: ${formatErrorDetails(error)}`);
      return "";
    }

    if (!homepage?.markdown || homepage.markdown.trim().length === 0) {
      console.warn(`  ⚠️ Firecrawl homepage response was empty for ${toolName}: response=${JSON.stringify(homepage)}`);
      return "";
    }

    let content = String(homepage.markdown);
    const pricingUrl = findPricingLink(url, homepage);
    if (pricingUrl) {
      try {
        await waitForFirecrawlRateLimit();
        const pricing = await firecrawl.scrapeUrl(pricingUrl, { formats: ["markdown"] }) as any;
        if (pricing?.markdown && pricing.markdown.trim().length > 0) {
          content += `\n\n## Pricing page\n${pricing.markdown}`;
        } else {
          console.warn(`  ⚠️ Firecrawl pricing response was empty for ${toolName}: response=${JSON.stringify(pricing)}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Firecrawl pricing request failed for ${toolName}: ${formatErrorDetails(error)}`);
      }
    }

    return content.slice(0, WEBSITE_MAX_CHARS);
  } catch (error) {
    console.warn(`  ⚠️ Firecrawl failed for ${toolName} (${url}): ${formatErrorDetails(error)}`);
    return "";
  }
}
