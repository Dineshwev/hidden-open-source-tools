import { NextResponse } from "next/server";
import { getPendingTools } from "@/lib/services/scraped-tools.service";
import type { PaginatedResponse, ScrapedTool, ToolStatus } from "@/lib/types/scraped-tools.types";

function isAuthorized(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET?.trim() || process.env.ADMIN_PANEL_ACCESS_KEY?.trim();
  const authHeader = req.headers.get("authorization") || "";
  const accessKeyHeader = req.headers.get("x-admin-access-key") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim() || accessKeyHeader.trim();

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

export async function GET(req: Request) {
  try {
    const auth = isAuthorized(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");
    const status = ((url.searchParams.get("status") || "pending").trim().toLowerCase() as ToolStatus);

    if (status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Invalid status. Only 'pending' is supported in this endpoint." },
        { status: 400 }
      );
    }

    const { data, count, totalPages, currentPage } = await getPendingTools(page, limit);
    const payload: PaginatedResponse<ScrapedTool> = {
      success: true,
      data,
      totalPages,
      count,
      currentPage
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
