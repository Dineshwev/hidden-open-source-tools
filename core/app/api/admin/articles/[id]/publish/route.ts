import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import {
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminSecret,
  getLegacyAdminToken,
  isValidAdminSessionCookieValue,
  isValidLegacyAdminToken
} from "@/lib/admin-session";

async function verifyAdmin(req: Request) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (await isValidAdminSessionCookieValue(sessionCookie)) {
    return true;
  }

  if (!getConfiguredAdminSecret()) {
    return false;
  }

  return isValidLegacyAdminToken(getLegacyAdminToken(req));
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req))) {
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
