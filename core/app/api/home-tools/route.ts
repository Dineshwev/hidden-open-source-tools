import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export const revalidate = 3600;

export async function GET() {
  const supabase = getAdmin();
  const [toolsResult, countResult] = await Promise.all([
    supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, logo_url, github_stars")
      .eq("status", "approved")
      .in("slug", ["gitea", "plausible", "uptime-kuma", "meilisearch", "appwrite", "coolify"])
      .limit(6),
    supabase
      .from("open_source_tools")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  let tools = toolsResult.data ?? [];

  // Fallback if specific slugs don't return enough tools
  if (tools.length < 6) {
    const { data: fallbackTools } = await supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, logo_url, github_stars")
      .eq("status", "approved")
      .order("github_stars", { ascending: false, nullsFirst: false })
      .limit(6);

    if (fallbackTools && fallbackTools.length > 0) {
      const existingSlugs = new Set(tools.map((t) => t.slug));
      for (const t of fallbackTools) {
        if (!existingSlugs.has(t.slug) && tools.length < 6) {
          tools.push(t);
        }
      }
    }
  }

  return NextResponse.json({
    tools,
    total: countResult.count ?? 375,
  });
}
