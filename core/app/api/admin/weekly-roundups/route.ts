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

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("weekly_roundups")
      .select("id, title, slug, week_date, status, created_at")
      .order("week_date", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
