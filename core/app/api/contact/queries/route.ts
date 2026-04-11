import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/backend_lib/supabase-scraper";
import { getPublicQueries } from "@/lib/services/contact.service";

function normalizePage(value: string | null) {
  const parsed = Number(value || "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value || "10");
  return Number.isFinite(parsed) ? Math.max(1, Math.min(100, Math.floor(parsed))) : 10;
}

export async function GET(req: Request) {
  try {
    if (!supabasePublic) {
      return NextResponse.json(
        { success: false, error: "Supabase public client is not configured." },
        { status: 503 }
      );
    }

    const url = new URL(req.url);
    const page = normalizePage(url.searchParams.get("page"));
    const limit = normalizeLimit(url.searchParams.get("limit"));
    const { count, error } = await supabasePublic
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("mode", "anonymous")
      .eq("is_private", false)
      .is("thread_id", null);

    if (error) {
      throw error;
    }

    const dataRows = await getPublicQueries(page, limit);
    const totalCount = count ?? 0;

    return NextResponse.json(
      {
        success: true,
        data: dataRows,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        count: totalCount
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}