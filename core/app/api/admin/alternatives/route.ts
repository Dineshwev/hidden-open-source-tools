import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export async function GET() {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("alternatives")
    .select("id, saas_name, saas_slug, saas_description, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alternatives: data ?? [] });
}
