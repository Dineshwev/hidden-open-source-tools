import { NextResponse } from "next/server";
import { getApprovedTools } from "@/lib/services/scraped-tools.service";
import type { PaginatedResponse, ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

export const revalidate = 3600;

function normalizePage(value: string | null) {
  const parsed = Number(value || "1");
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsed));
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value || "12");
  if (!Number.isFinite(parsed)) {
    return 12;
  }

  return Math.max(1, Math.min(100, Math.floor(parsed)));
}

function normalizeCategory(value: string | null): ToolCategory | undefined {
  const raw = (value || "").trim().toLowerCase();

  if (["ui-kit", "ui kits", "ui kit"].includes(raw)) return "ui-kit";
  if (["course", "courses"].includes(raw)) return "course";
  if (["template", "templates"].includes(raw)) return "template";
  if (["ai-tool", "ai tools", "ai tool"].includes(raw)) return "ai-tool";
  if (["ui-component", "ui components", "component", "components"].includes(raw)) return "ui-component";
  if (["other"].includes(raw)) return "other";
  return undefined;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = normalizePage(url.searchParams.get("page"));
    const limit = normalizeLimit(url.searchParams.get("limit"));
    const category = normalizeCategory(url.searchParams.get("category"));

    const { data, totalPages, count, currentPage } = await getApprovedTools(category, page, limit);
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
      {
        success: false,
        error: error?.message || "Internal Server Error"
      },
      { status: 500 }
    );
  }
}