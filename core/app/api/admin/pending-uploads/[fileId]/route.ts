import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as adminService from "@/lib/services/admin.service.js";
import { getServerUser, errorResponse } from "@/lib/utils/authHelper";
import { getAdmin } from "@/lib/backend_lib/supabase-server.ts";
import {
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminSecret,
  getLegacyAdminToken,
  isValidAdminSessionCookieValue,
  isValidLegacyAdminToken
} from "@/lib/admin-session";

type RouteContext = {
  params: {
    fileId: string;
  };
};

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

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await isAuthorized(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await getServerUser(req);
    let adminId = user?.role === "ADMIN" ? user.userId : null;

    if (!adminId) {
      const { data: fallbackAdmin, error: fallbackAdminError } = await getAdmin()
        .from("users")
        .select("id")
        .eq("role", "ADMIN")
        .limit(1)
        .maybeSingle();

      if (fallbackAdminError) {
        return NextResponse.json(
          { error: fallbackAdminError.message || "Failed to fetch admin account." },
          { status: 503 }
        );
      }

      if (!fallbackAdmin) {
        return NextResponse.json(
          { error: "No admin account found. Create at least one ADMIN user first." },
          { status: 503 }
        );
      }

      adminId = fallbackAdmin.id;
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "Invalid status. Expected APPROVED or REJECTED." },
        { status: 400 }
      );
    }

    const data = await adminService.moderateUpload({
      adminId,
      fileId: params.fileId,
      status
    });

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
