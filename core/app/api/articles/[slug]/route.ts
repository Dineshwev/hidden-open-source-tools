import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const supabase = getAdmin();

    // Fetch the article
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    // Increment views (naively using update)
    if (article) {
      const articleRow = article as { id: string; views?: number | null };

      await supabase
        .from("articles")
        .update({ views: (articleRow.views || 0) + 1 })
        .eq("id", articleRow.id);
    }

    return NextResponse.json({ success: true, data: article });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
