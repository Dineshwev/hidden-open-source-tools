import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { verifyAdmin } from "@/lib/utils/admin-auth";
import { catchError, errorJson } from "@/lib/utils/api-response";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req))) {
    return errorJson("Unauthorized", 401);
  }

  try {
    const id = params.id;
    const { is_published } = await req.json();
    const supabase = getAdmin();

    const updateData: any = { is_published };
    if (is_published) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorJson(error.message, 400);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return catchError(err);
  }
}
