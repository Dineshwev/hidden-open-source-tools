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

  return NextResponse.json({
    tools: toolsResult.data ?? [],
    total: countResult.count ?? 357,
  });
}