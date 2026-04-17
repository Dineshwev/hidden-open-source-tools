import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as adminService from "@/lib/services/admin.service.js";
import { errorResponse } from "@/lib/utils/authHelper";
import {
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminSecret,
  getLegacyAdminToken,
  isValidAdminSessionCookieValue,
  isValidLegacyAdminToken
} from "@/lib/admin-session";

async function isAuthorized(req: Request) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (await isValidAdminSessionCookieValue(sessionCookie)) {
    return { ok: true as const };
  }

  if (!getConfiguredAdminSecret()) {
    return { ok: false, status: 503, error: "Admin panel is not configured. Set ADMIN_SECRET." };
  }

  if (!isValidLegacyAdminToken(getLegacyAdminToken(req))) {
    return { ok: false, status: 401, error: "Invalid admin secret." };
  }

  return { ok: true as const };
}

export async function GET(req: Request) {
  try {
    const auth = await isAuthorized(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid or missing status parameter. Expected APPROVED or REJECTED." },
        { status: 400 }
      );
    }

    const data = await adminService.getModerationHistory(status);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    if (String(error?.message || "").includes("Can't reach database server")) {
      return NextResponse.json(
        {
          error: "Supabase configuration error. Check SUPABASE_SERVICE_ROLE_KEY."
        },
        { status: 503 }
      );
    }

    return errorResponse(error);
  }
}
