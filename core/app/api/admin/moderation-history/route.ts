import { NextResponse } from "next/server";
import * as adminService from "@/lib/services/admin.service.js";
import { errorResponse } from "@/lib/utils/authHelper";
import { isAuthorizedBySession } from "@/lib/utils/admin-auth";
import { handleSupabaseConnectionError } from "@/lib/utils/api-response";

export async function GET(req: Request) {
  try {
    const auth = await isAuthorizedBySession(req);
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
  } catch (error: unknown) {
    return handleSupabaseConnectionError(error) ?? errorResponse(error);
  }
}
