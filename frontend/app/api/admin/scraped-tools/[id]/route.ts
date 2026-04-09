import { NextResponse } from "next/server";
import { updateToolStatus } from "@/lib/services/scraped-tools.service";
import type { AdminUpdatePayload } from "@/lib/types/scraped-tools.types";

type RouteContext = {
  params: {
    id: string;
  };
};

function isAuthorized(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET?.trim() || process.env.ADMIN_PANEL_ACCESS_KEY?.trim();
  const authHeader = req.headers.get("authorization") || "";
  const accessKeyHeader = req.headers.get("x-admin-access-key") || "";
  const tokenFromAccessHeader = accessKeyHeader.trim();
  const tokenFromBearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  const tokenFromRawAuth = !authHeader.toLowerCase().startsWith("bearer ") ? authHeader.trim() : "";
  const token = tokenFromAccessHeader || tokenFromBearer || tokenFromRawAuth;

  if (!adminSecret) {
    return {
      ok: false,
      status: 503,
      error: "Admin auth is not configured. Set ADMIN_SECRET or ADMIN_PANEL_ACCESS_KEY."
    };
  }

  if (!token || token !== adminSecret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true as const };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = isAuthorized(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status as AdminUpdatePayload["status"] | undefined;
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : undefined;

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { success: false, error: "Invalid status value. Expected 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const tool = await updateToolStatus(params.id, status, note);

    return NextResponse.json(
      {
        success: true,
        tool
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
