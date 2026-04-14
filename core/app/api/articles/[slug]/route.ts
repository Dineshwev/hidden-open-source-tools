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
      await supabase
        .from("articles")
        .update({ views: (article.views || 0) + 1 })
        .eq("id", article.id);
    }

    return NextResponse.json({ success: true, data: article });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
