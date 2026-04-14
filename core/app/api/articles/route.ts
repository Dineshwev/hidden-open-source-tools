import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
