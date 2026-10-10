import { NextResponse } from "next/server";
import { bulkUpdateStatus } from "@/lib/services/scraped-tools.service";
import { isAuthorizedByHeader } from "@/lib/utils/admin-auth";
import { catchError } from "@/lib/utils/api-response";
import type { AdminUpdatePayload } from "@/lib/types/scraped-tools.types";

export async function PATCH(req: Request) {
  try {
    const auth = isAuthorizedByHeader(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const ids = body?.ids;
    const status = body?.status as AdminUpdatePayload["status"] | undefined;
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : undefined;

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id.trim())) {
      return NextResponse.json(
        { success: false, error: "Invalid ids value. Expected a non-empty array of strings." },
        { status: 400 }
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { success: false, error: "Invalid status value. Expected 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const updated = await bulkUpdateStatus(ids, status, note);

    return NextResponse.json(
      {
        success: true,
        updated
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return catchError(error);
  }
}
