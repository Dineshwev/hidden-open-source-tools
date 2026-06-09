import { NextResponse } from "next/server";
import { updateToolStatus } from "@/lib/services/scraped-tools.service";
import { isAuthorizedByHeader } from "@/lib/utils/admin-auth";
import { catchError } from "@/lib/utils/api-response";
import type { AdminUpdatePayload } from "@/lib/types/scraped-tools.types";
import type { RouteContext } from "@/lib/types/api.types";

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = isAuthorizedByHeader(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status as AdminUpdatePayload["status"] | undefined;
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : undefined;
    const category = typeof body?.category === "string" && body.category.trim() ? body.category.trim() : undefined;

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { success: false, error: "Invalid status value. Expected 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const tool = await updateToolStatus(params.id, status, note, category);

    return NextResponse.json(
      {
        success: true,
        tool
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return catchError(error);
  }
}
