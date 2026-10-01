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
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return errorJson(error.message, 400);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return catchError(err);
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) {
    return errorJson("Unauthorized", 401);
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
      return errorJson(error.message, 400);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return catchError(err);
  }
}
