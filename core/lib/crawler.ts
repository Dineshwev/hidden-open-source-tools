import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function crawlUrl(url: string): Promise<string> {
  try {
    const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown'] });
    
    if (!(scrapeResult as any).success) {
      throw new Error(`Scrape failed: ${(scrapeResult as any).error}`);
    }

    let content = scrapeResult.markdown || '';
    
    if (content.length > 4000) {
      content = content.substring(0, 4000);
    }
    
    return content;
  } catch (error) {
    console.error(`Failed to crawl URL ${url}:`, error);
    return '';
  }
}

export async function crawlMultipleUrls(urls: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  const validUrls = urls.filter(url => url && url.trim().length > 0);
  
  const crawlPromises = validUrls.map(async (url) => {
    const content = await crawlUrl(url);
    if (content) {
      results[url] = content;
    }
  });

  await Promise.all(crawlPromises);
  
  return results;
}
