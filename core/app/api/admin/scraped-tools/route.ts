import { NextResponse } from "next/server";
import { getPendingTools } from "@/lib/services/scraped-tools.service";
import { isAuthorizedByHeader } from "@/lib/utils/admin-auth";
import { catchError } from "@/lib/utils/api-response";
import type { PaginatedResponse, ScrapedTool, ToolStatus } from "@/lib/types/scraped-tools.types";

export async function GET(req: Request) {
  try {
    const auth = isAuthorizedByHeader(req);
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
  } catch (error: unknown) {
    return catchError(error);
  }
}
