import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { dedupeToolRowsBySlug } from "@/lib/tool-records";
import { cleanToolMarkdownContent } from "@/lib/clean-tool-content";

export const revalidate = 3600;

function cleanDescription(text: string): string {
  return cleanToolMarkdownContent(text)
    .replace(/\s+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .trim();
}

export async function GET() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const supabase = getAdmin();

  let allTools: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("id, slug, name, category, description, url")
      .or("status.eq.approved,status.eq.APPROVED")
      .not("slug", "is", null)
      .neq("slug", "")
      .order("name", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allTools = allTools.concat(data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  const dedupedTools = dedupeToolRowsBySlug(allTools);

  // Group by category
  const categoriesMap = new Map<string, any[]>();
  for (const tool of dedupedTools) {
    const cat = String(tool.category || "Developer Tools").trim();
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)!.push(tool);
  }

  const sortedCategories = Array.from(categoriesMap.keys()).sort();

  let body = `# The Cloud Rain – Complete Open-Source Directory (LLM Full Index)

> Comprehensive plain-text catalog of ${dedupedTools.length}+ production-vetted open-source tools, developer software, and self-hosted infrastructure. Machine-readable export for LLMs, AI agents, and RAG pipelines.
> Canonical Homepage: ${siteUrl}
> Concise Index: ${siteUrl}/llms.txt
> Generated: ${new Date().toISOString()}

`;

  for (const cat of sortedCategories) {
    const toolsInCat = categoriesMap.get(cat) || [];
    body += `## ${cat} (${toolsInCat.length} tools)\n\n`;

    for (const tool of toolsInCat) {
      const name = String(tool.name || "Untitled").trim();
      const slug = String(tool.slug || "").trim();
      const rawDesc = String(tool.description || "").trim();
      const desc = cleanDescription(rawDesc) || "Curated open-source developer tool.";
      const toolDetailUrl = `${siteUrl}/tools/${slug}`;
      const officialUrl = String(tool.url || "").trim();

      body += `### [${name}](${toolDetailUrl})\n`;
      body += `- Description: ${desc}\n`;
      if (officialUrl) {
        body += `- Website: ${officialUrl}\n`;
      }
      body += `- Details & Quickstart: ${toolDetailUrl}\n\n`;
    }
  }

  return new Response(body.trim(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400",
    },
  });
}
