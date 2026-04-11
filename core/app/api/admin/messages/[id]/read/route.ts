import { NextResponse } from "next/server";
import { markAsRead } from "@/lib/services/contact.service";

type RouteContext = {
  params: {
    id: string;
  };
};

function isAuthorized(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET?.trim() || "";
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.trim();

  if (!adminSecret) {
    return {
      ok: false,
      status: 503,
      error: "Admin auth is not configured. Set ADMIN_SECRET."
    };
  }

  if (!token || token !== adminSecret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true as const };
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const auth = isAuthorized(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await markAsRead(params.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}