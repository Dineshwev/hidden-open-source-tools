import { supabaseAdmin } from "@/lib/backend_lib/supabase-scraper";
import type {
  AdminUpdatePayload,
  PaginatedResponse,
  ScrapedTool,
  ToolCategory,
  ToolStatus
} from "@/lib/types/scraped-tools.types";

type PaginatedToolsResult = Omit<PaginatedResponse<ScrapedTool>, "success">;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const CATEGORY_DB_VALUES: Record<ToolCategory, string[]> = {
  "ui-kit": ["ui-kit", "UI Kits", "ui kits", "ui kit"],
  course: ["course", "Courses", "course"],
  template: ["template", "Templates", "template"],
  "ai-tool": ["ai-tool", "AI Tools", "ai tools", "ai tool"],
  "ui-component": ["ui-component", "Components", "ui components", "component"],
  other: ["other", "Other"]
};

function normalizeCategory(value: unknown): ToolCategory {
  const raw = String(value || "").trim().toLowerCase();

  if (["ui-kit", "ui kits", "ui kit"].includes(raw)) return "ui-kit";
  if (["course", "courses"].includes(raw)) return "course";
  if (["template", "templates"].includes(raw)) return "template";
  if (["ai-tool", "ai tools", "ai tool"].includes(raw)) return "ai-tool";
  if (["ui-component", "ui components", "component", "components"].includes(raw)) return "ui-component";
  return "other";
}

function normalizeStatus(value: unknown): ToolStatus {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "pending" || raw === "approved" || raw === "rejected") {
    return raw;
  }

  return "pending";
}

function mapDbTool(row: any): ScrapedTool {
  return {
    id: String(row?.id || ""),
    title: String(row?.title || "Untitled"),
    description: row?.description ?? null,
    image_url: row?.image_url ?? null,
    webpage_url: String(row?.webpage_url || ""),
    category: normalizeCategory(row?.category),
    source_site: row?.source_site ?? null,
    status: normalizeStatus(row?.status),
    scraped_at: String(row?.scraped_at || new Date().toISOString()),
    reviewed_at: row?.reviewed_at ?? null
  };
}

function normalizePage(value?: number) {
  const parsed = Number(value ?? DEFAULT_PAGE);
  if (!Number.isFinite(parsed)) return DEFAULT_PAGE;
  return Math.max(1, Math.floor(parsed));
}

function normalizeLimit(value?: number) {
  const parsed = Number(value ?? DEFAULT_LIMIT);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(100, Math.floor(parsed)));
}

function getPaginationRange(page: number, limit: number) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  return { start, end };
}

function toPaginatedResult(data: ScrapedTool[] | null, count: number | null, limit: number, page: number): PaginatedToolsResult {
  const safeData = Array.isArray(data) ? data : [];
  const safeCount = typeof count === "number" ? count : 0;

  return {
    data: safeData,
    count: safeCount,
    totalPages: safeCount > 0 ? Math.ceil(safeCount / limit) : 0,
    currentPage: page
  };
}

export async function getPendingTools(page: number, limit: number): Promise<PaginatedToolsResult> {
  try {
    const safePage = normalizePage(page);
    const safeLimit = normalizeLimit(limit);
    const { start, end } = getPaginationRange(safePage, safeLimit);

    const { data, count, error } = await supabaseAdmin
      .from("scraped_tools")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .order("scraped_at", { ascending: false })
      .range(start, end);

    if (error) {
      throw new Error(`Failed to fetch pending tools: ${error.message}`);
    }

    const mappedData = Array.isArray(data) ? data.map(mapDbTool) : [];
    return toPaginatedResult(mappedData, count, safeLimit, safePage);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch pending tools");
  }
}

export async function getApprovedTools(category?: ToolCategory, page?: number, limit?: number): Promise<PaginatedToolsResult> {
  try {
    const safePage = normalizePage(page);
    const safeLimit = normalizeLimit(limit);
    const { start, end } = getPaginationRange(safePage, safeLimit);

    let query = supabaseAdmin
      .from("scraped_tools")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .order("scraped_at", { ascending: false });

    if (category) {
      query = query.in("category", CATEGORY_DB_VALUES[category]);
    }

    const { data, count, error } = await query.range(start, end);

    if (error) {
      throw new Error(`Failed to fetch approved tools: ${error.message}`);
    }

    const mappedData = Array.isArray(data) ? data.map(mapDbTool) : [];
    return toPaginatedResult(mappedData, count, safeLimit, safePage);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch approved tools");
  }
}

export async function updateToolStatus(id: string, status: AdminUpdatePayload["status"]): Promise<ScrapedTool> {
  try {
    const { data, error } = await supabaseAdmin
      .from("scraped_tools")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update tool status: ${error.message}`);
    }

    return mapDbTool(data);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update tool status");
  }
}

export async function bulkUpdateStatus(ids: string[], status: AdminUpdatePayload["status"]): Promise<number> {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }

    const { data, error } = await supabaseAdmin
      .from("scraped_tools")
      .update({ status, reviewed_at: new Date().toISOString() })
      .in("id", ids)
      .select("id");

    if (error) {
      throw new Error(`Failed to bulk update tool status: ${error.message}`);
    }

    return Array.isArray(data) ? data.length : 0;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to bulk update tool status");
  }
}
