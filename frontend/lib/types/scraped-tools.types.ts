export type ToolCategory = "ui-kit" | "course" | "template" | "ai-tool" | "ui-component" | "other";

export type ToolStatus = "pending" | "approved" | "rejected";

export interface ScrapedTool {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  webpage_url: string;
  category: ToolCategory;
  source_site: string | null;
  status: ToolStatus;
  scraped_at: string;
  reviewed_at: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
}

export interface AdminUpdatePayload {
  status: "approved" | "rejected";
}