import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

// Authentication check for admin routes
function verifyAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  const validSecret = process.env.ADMIN_SECRET;
  return validSecret && secret === validSecret;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
