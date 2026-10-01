import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { verifyAdmin } from "@/lib/utils/admin-auth";
import { catchError, errorJson } from "@/lib/utils/api-response";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) {
    return errorJson("Unauthorized", 401);
  }

  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("weekly_roundups")
      .select("id, title, slug, week_date, status, created_at")
      .order("week_date", { ascending: false });

    if (error) {
      return errorJson(error.message, 400);
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: unknown) {
    return catchError(err);
  }
}
