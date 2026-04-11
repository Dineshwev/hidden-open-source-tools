import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

function normalizeDbCategory(value: unknown): ToolCategory {
  const raw = String(value || "").trim().toLowerCase();

  if (["ui-kit", "ui kits", "ui kit"].includes(raw)) return "ui-kit";
  if (["course", "courses"].includes(raw)) return "course";
  if (["template", "templates"].includes(raw)) return "template";
  if (["ai-tool", "ai tools", "ai tool"].includes(raw)) return "ai-tool";
  if (["ui-component", "ui components", "component", "components"].includes(raw)) return "ui-component";
  return "other";
}

function normalizeDbStatus(value: unknown) {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "approved" || raw === "rejected" || raw === "pending" ? raw : "approved";
}

function isApprovedLike(value: unknown) {
  const raw = String(value || "").trim().toLowerCase();
  return !raw || raw === "approved";
}

function getSupabaseRouteClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Expected NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function mapOpenSourceTool(row: any): ScrapedTool {
  return {
    id: String(row?.id || ""),
    title: String(row?.name || row?.title || "Untitled"),
    description: row?.description ?? null,
    image_url: row?.image_url ?? row?.image ?? null,
    logo_url: row?.logo_url ?? null,
    webpage_url: String(row?.url || row?.webpage_url || ""),
    category: normalizeDbCategory(row?.category),
    source_site: row?.source_site ?? null,
    status: normalizeDbStatus(row?.status),
    scraped_at: String(
      row?.scraped_at || row?.created_at || row?.inserted_at || row?.updated_at || new Date(0).toISOString()
    ),
    reviewed_at: row?.reviewed_at ?? null,
    moderation_note: row?.moderation_note ?? null
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = normalizePage(url.searchParams.get("page"));
    const limit = normalizeLimit(url.searchParams.get("limit"));
    const category = normalizeCategory(url.searchParams.get("category"));
    const supabase = getSupabaseRouteClient();
    const { data: rows, error } = await supabase.from("open_source_tools").select("*");

    if (error) {
      throw new Error(`Failed to fetch approved tools: ${error.message}`);
    }

    const filteredRows = (Array.isArray(rows) ? rows : [])
      .filter((row) => isApprovedLike(row?.status))
      .map(mapOpenSourceTool)
      .filter((tool) => (category ? tool.category === category : true))
      .sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());

    const start = (page - 1) * limit;
    const data = filteredRows.slice(start, start + limit);
    const safeCount = filteredRows.length;
    const totalPages = safeCount > 0 ? Math.ceil(safeCount / limit) : 0;
    const payload: PaginatedResponse<ScrapedTool> = {
      success: true,
      data,
      totalPages,
      count: safeCount,
      currentPage: page
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
