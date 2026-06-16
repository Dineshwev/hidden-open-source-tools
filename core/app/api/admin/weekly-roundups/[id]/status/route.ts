import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { verifyAdmin } from "@/lib/utils/admin-auth";
import { catchError, errorJson } from "@/lib/utils/api-response";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req))) {
    return errorJson("Unauthorized", 401);
  }

  try {
    const { status } = await req.json();
    const allowedStatuses = new Set(["draft", "published"]);

    if (!allowedStatuses.has(status)) {
      return errorJson("Invalid status.", 400);
    }

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("weekly_roundups")
      .update({ status })
      .eq("id", params.id)
      .select("id, title, slug, week_date, status, created_at")
      .single();

    if (error) {
      return errorJson(error.message, 400);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return catchError(err);
  }
}
