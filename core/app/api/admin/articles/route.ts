import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

// Authentication check for admin routes
function verifyAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  const validSecret = process.env.ADMIN_SECRET;
  return validSecret && secret === validSecret;
}

export async function GET(req: Request) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const supabase = getAdmin();

    const { data, error } = await supabase
      .from("articles")
      .insert([body])
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
