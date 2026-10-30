import { MetadataRoute } from 'next';
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/control-room/',
          '/admin/',
          '/api/admin/',
          '/api/internal/',
          '/*?search=*',
          '/*?filter=*',
          '/*?sort=*',
        ],
      },
      {
        // Explicitly welcome AI Search & Answer Engine Bots for live indexing and citations
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Claude-SearchBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: [
          '/control-room/',
          '/admin/',
          '/api/admin/',
          '/api/internal/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
