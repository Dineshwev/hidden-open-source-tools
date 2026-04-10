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
const OPEN_SOURCE_ID_PREFIX = "ost__";

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
    logo_url: row?.logo_url ?? null,
    webpage_url: String(row?.webpage_url || ""),
    category: normalizeCategory(row?.category),
    source_site: row?.source_site ?? null,
    status: normalizeStatus(row?.status),
    scraped_at: String(row?.scraped_at || new Date().toISOString()),
    reviewed_at: row?.reviewed_at ?? null,
    moderation_note: row?.moderation_note ?? null
  };
}

function mapOpenSourceTool(row: any): ScrapedTool {
  const rawId = String(row?.id || "").trim();
  const rawUrl = String(row?.url || row?.webpage_url || "").trim();
  const fallbackTitle = String(row?.name || row?.title || "Untitled").trim();
  const scrapedAt =
    row?.scraped_at ||
    row?.created_at ||
    row?.inserted_at ||
    row?.updated_at ||
    "1970-01-01T00:00:00.000Z";

  return {
    id: `${OPEN_SOURCE_ID_PREFIX}${rawId}`,
    title: fallbackTitle || "Untitled",
    description: row?.description ?? null,
    image_url: row?.image_url ?? row?.image ?? null,
    logo_url: row?.logo_url ?? null,
    webpage_url: rawUrl,
    category: normalizeCategory(row?.category),
    source_site: row?.source_site ?? null,
    status: normalizeStatus(row?.status),
    scraped_at: String(scrapedAt),
    reviewed_at: row?.reviewed_at ?? null,
    moderation_note: row?.moderation_note ?? null
  };
}

function isPendingLike(statusValue: unknown) {
  const raw = String(statusValue || "").trim().toLowerCase();
  return !raw || raw === "pending";
}

function isApprovedLike(statusValue: unknown) {
  const raw = String(statusValue || "").trim().toLowerCase();
  return !raw || raw === "approved";
}

function splitToolId(compositeId: string) {
  if (compositeId.startsWith(OPEN_SOURCE_ID_PREFIX)) {
    return {
      table: "open_source_tools" as const,
      id: compositeId.slice(OPEN_SOURCE_ID_PREFIX.length)
    };
  }

  return {
    table: "scraped_tools" as const,
    id: compositeId
  };
}

function isMissingReviewedAtColumnError(error: any) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("reviewed_at") && message.includes("column");
}

function isMissingModerationNoteColumnError(error: any) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("moderation_note") && message.includes("column");
}

function buildUpdatePayloadVariants(status: AdminUpdatePayload["status"], note?: string) {
  const trimmedNote = note?.trim();
  const reviewedAtIso = new Date().toISOString();
  const baseWithReviewedAt: Record<string, string> = { status, reviewed_at: reviewedAtIso };
  const baseWithoutReviewedAt: Record<string, string> = { status };

  if (!trimmedNote) {
    return [baseWithReviewedAt, baseWithoutReviewedAt];
  }

  return [
    {
      ...baseWithReviewedAt,
      moderation_note: trimmedNote
    },
    {
      ...baseWithoutReviewedAt,
      moderation_note: trimmedNote
    },
    {
      ...baseWithReviewedAt
    },
    {
      ...baseWithoutReviewedAt
    }
  ];
}

function shouldRetryWithFallback(error: any, payload: Record<string, string>) {
  if (isMissingReviewedAtColumnError(error) && "reviewed_at" in payload) {
    return true;
  }

  if (isMissingModerationNoteColumnError(error) && "moderation_note" in payload) {
    return true;
  }

  return false;
}

async function updateToolByIdWithFallback(
  table: "scraped_tools" | "open_source_tools",
  id: string,
  status: AdminUpdatePayload["status"],
  note?: string
) {
  const payloadVariants = buildUpdatePayloadVariants(status, note);
  let lastResult: Awaited<ReturnType<typeof supabaseAdmin.from>> | null = null;

  for (const payload of payloadVariants) {
    const result = await supabaseAdmin.from(table).update(payload).eq("id", id).select("*").single();

    if (!result.error) {
      return result;
    }

    lastResult = result as any;

    if (!shouldRetryWithFallback(result.error, payload)) {
      return result;
    }
  }

  return lastResult as any;
}

async function bulkUpdateToolsWithFallback(
  table: "scraped_tools" | "open_source_tools",
  ids: string[],
  status: AdminUpdatePayload["status"],
  note?: string
) {
  const payloadVariants = buildUpdatePayloadVariants(status, note);
  let lastResult: Awaited<ReturnType<typeof supabaseAdmin.from>> | null = null;

  for (const payload of payloadVariants) {
    const result = await supabaseAdmin.from(table).update(payload).in("id", ids).select("id");

    if (!result.error) {
      return result;
    }

    lastResult = result as any;

    if (!shouldRetryWithFallback(result.error, payload)) {
      return result;
    }
  }

  return lastResult as any;
}

async function updateOpenSourceToolById(id: string, status: AdminUpdatePayload["status"], note?: string) {
  return updateToolByIdWithFallback("open_source_tools", id, status, note);
}

async function bulkUpdateOpenSourceTools(ids: string[], status: AdminUpdatePayload["status"], note?: string) {
  return bulkUpdateToolsWithFallback("open_source_tools", ids, status, note);
}

async function updateScrapedToolById(id: string, status: AdminUpdatePayload["status"], note?: string) {
  return updateToolByIdWithFallback("scraped_tools", id, status, note);
}

async function bulkUpdateScrapedTools(ids: string[], status: AdminUpdatePayload["status"], note?: string) {
  return bulkUpdateToolsWithFallback("scraped_tools", ids, status, note);
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

    const { data: scrapedRows, error } = await supabaseAdmin
      .from("scraped_tools")
      .select("*")
      .or("status.eq.pending,status.eq.PENDING,status.is.null")
      .order("scraped_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending tools: ${error.message}`);
    }

    const { data: openSourceRows, error: openSourceError } = await supabaseAdmin
      .from("open_source_tools")
      .select("*");

    if (openSourceError) {
      throw new Error(`Failed to fetch open source tools: ${openSourceError.message}`);
    }

    const mappedScraped = Array.isArray(scrapedRows) ? scrapedRows.map(mapDbTool) : [];
    const mappedOpenSource = Array.isArray(openSourceRows)
      ? openSourceRows.filter((row) => isPendingLike(row?.status)).map(mapOpenSourceTool)
      : [];

    const merged = [...mappedScraped, ...mappedOpenSource].sort((a, b) => {
      const aTime = new Date(a.scraped_at).getTime();
      const bTime = new Date(b.scraped_at).getTime();
      return bTime - aTime;
    });

    const count = merged.length;
    const { start, end } = getPaginationRange(safePage, safeLimit);
    const pageRows = merged.slice(start, end + 1);

    return toPaginatedResult(pageRows, count, safeLimit, safePage);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch pending tools");
  }
}

export async function getApprovedTools(category?: ToolCategory, page?: number, limit?: number): Promise<PaginatedToolsResult> {
  try {
    const safePage = normalizePage(page);
    const safeLimit = normalizeLimit(limit);
    const { data: scrapedRows, error } = await supabaseAdmin
      .from("scraped_tools")
      .select("*")
      .or("status.eq.approved,status.eq.APPROVED")
      .order("scraped_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch approved tools: ${error.message}`);
    }

    const { data: openSourceRows, error: openSourceError } = await supabaseAdmin
      .from("open_source_tools")
      .select("*");

    if (openSourceError) {
      throw new Error(`Failed to fetch open source tools: ${openSourceError.message}`);
    }

    const mappedScraped = Array.isArray(scrapedRows) ? scrapedRows.map(mapDbTool) : [];
    const mappedOpenSource = Array.isArray(openSourceRows)
      ? openSourceRows.filter((row) => isApprovedLike(row?.status)).map(mapOpenSourceTool)
      : [];

    const merged = [...mappedScraped, ...mappedOpenSource]
      .filter((tool) => (category ? tool.category === category : true))
      .sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());

    const count = merged.length;
    const { start, end } = getPaginationRange(safePage, safeLimit);
    const pageRows = merged.slice(start, end + 1);

    return toPaginatedResult(pageRows, count, safeLimit, safePage);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch approved tools");
  }
}

export async function updateToolStatus(id: string, status: AdminUpdatePayload["status"], note?: string): Promise<ScrapedTool> {
  try {
    const toolRef = splitToolId(id);

    if (toolRef.table === "open_source_tools") {
      const { data: openSourceData, error: openSourceError } = await updateOpenSourceToolById(toolRef.id, status, note);

      if (openSourceError) {
        throw new Error(`Failed to update tool status: ${openSourceError.message}`);
      }

      return mapOpenSourceTool(openSourceData);
    }

    const { data, error } = await updateScrapedToolById(toolRef.id, status, note);

    if (error) {
      throw new Error(`Failed to update tool status: ${error.message}`);
    }

    return mapDbTool(data);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update tool status");
  }
}

export async function bulkUpdateStatus(ids: string[], status: AdminUpdatePayload["status"], note?: string): Promise<number> {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }

    const splitIds = ids.reduce(
      (acc, rawId) => {
        const parsed = splitToolId(rawId);
        if (parsed.table === "open_source_tools") {
          acc.openSource.push(parsed.id);
        } else {
          acc.scraped.push(parsed.id);
        }

        return acc;
      },
      { scraped: [] as string[], openSource: [] as string[] }
    );

    let affected = 0;

    if (splitIds.scraped.length > 0) {
      const { data, error } = await bulkUpdateScrapedTools(splitIds.scraped, status, note);

      if (error) {
        throw new Error(`Failed to bulk update tool status: ${error.message}`);
      }

      affected += Array.isArray(data) ? data.length : 0;
    }

    if (splitIds.openSource.length > 0) {
      const { data, error } = await bulkUpdateOpenSourceTools(splitIds.openSource, status, note);

      if (error) {
        throw new Error(`Failed to bulk update tool status: ${error.message}`);
      }

      affected += Array.isArray(data) ? data.length : 0;
    }

    return affected;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to bulk update tool status");
  }
}
