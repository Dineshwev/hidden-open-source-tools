import { NextResponse } from "next/server";
import * as adminService from "@/lib/services/admin.service.js";
import { getServerUser, errorResponse } from "@/lib/utils/authHelper";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { isAuthorizedBySession } from "@/lib/utils/admin-auth";
import { handleSupabaseConnectionError } from "@/lib/utils/api-response";
import type { RouteContext } from "@/lib/types/api.types";

export async function PATCH(req: Request, { params }: RouteContext<"fileId">) {
  try {
    const auth = await isAuthorizedBySession(req);
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

      const fallbackAdminId = typeof fallbackAdmin.id === "string" ? fallbackAdmin.id : null;

      if (!fallbackAdminId) {
        return NextResponse.json(
          { error: "Admin account is missing a valid string ID." },
          { status: 503 }
        );
      }

      adminId = fallbackAdminId;
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
  } catch (error: unknown) {
    return handleSupabaseConnectionError(error) ?? errorResponse(error);
  }
}
