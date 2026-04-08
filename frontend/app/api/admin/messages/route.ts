import { NextResponse } from "next/server";
import { getAllMessagesAdmin } from "@/lib/services/contact.service";

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

export async function GET(req: Request) {
  try {
    const auth = isAuthorized(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    const data = await getAllMessagesAdmin(page, limit);

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}