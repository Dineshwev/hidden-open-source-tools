import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { cleanToolMarkdownContent } from "@/lib/clean-tool-content";
import { dedupeToolRowsBySlug } from "@/lib/tool-records";

export const revalidate = 3600; // 1 hour cache

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripXmlIllegalChars(input: string): string {
  // Strips ASCII control chars except \t, \n, \r
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function GET() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const supabase = getAdmin();

  let tools: any[] = [];
  try {
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("id, slug, name, category, description, created_at, url")
      .or("status.eq.approved,status.eq.APPROVED")
      .order("created_at", { ascending: false })
      .limit(60);

    if (!error && Array.isArray(data)) {
      tools = dedupeToolRowsBySlug(data).slice(0, 50);
    }
  } catch (e) {
    console.error("Failed to fetch tools for RSS feed:", e);
  }

  const buildDate = new Date().toUTCString();

  const itemsXml = tools
    .map((tool) => {
      const slug = String(tool.slug || "").trim();
      const name = String(tool.name || "Open-Source Tool").trim();
      const category = String(tool.category || "Developer Tools").trim();
      const toolUrl = `${siteUrl}/tools/${slug}`;

      // Clean description and remove volatile stats
      const rawDesc = String(tool.description || "").trim();
      const cleanedDesc = cleanToolMarkdownContent(rawDesc)
        .replace(/\s+/g, " ")
        .slice(0, 300)
        .trim();

      const pubDate = tool.created_at
        ? new Date(tool.created_at).toUTCString()
        : buildDate;

      return `    <item>
      <title>${escapeXml(`${name} – Open-Source ${category} Alternative`)}</title>
      <link>${escapeXml(toolUrl)}</link>
      <guid isPermaLink="true">${escapeXml(toolUrl)}</guid>
      <category>${escapeXml(category)}</category>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${stripXmlIllegalChars(cleanedDesc || `${name} is a curated open-source developer tool on The Cloud Rain.`)}]]></description>
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Cloud Rain | Curated Open-Source Tools &amp; SaaS Alternatives</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Discover curated open-source software, self-hosted developer tools, and privacy-focused SaaS alternatives.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`.trim();

  return new Response(rssFeed, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400",
    },
  });
}
