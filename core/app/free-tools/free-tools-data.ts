import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

export const FREE_TOOLS_PAGE_SIZE = 12;

export type FreeToolsCategoryPage = {
  slug: string;
  label: string;
  category: ToolCategory;
  title: string;
  description: string;
};

export const FREE_TOOLS_CATEGORY_PAGES: FreeToolsCategoryPage[] = [
  {
    slug: "ui-kits",
    label: "UI Kits",
    category: "ui-kit",
    title: "Free UI Kits for Developers",
    description: "Browse free UI kits, interface packs, and design resources curated for frontend teams and product builders."
  },
  {
    slug: "courses",
    label: "Courses",
    category: "course",
    title: "Free Developer Courses",
    description: "Browse free developer courses and practical learning resources curated for developers who want to build faster."
  },
  {
    slug: "templates",
    label: "Templates",
    category: "template",
    title: "Free Templates for Developers",
    description: "Browse free templates, starters, and reusable project foundations curated for developers."
  },
  {
    slug: "ai-tools",
    label: "AI Tools",
    category: "ai-tool",
    title: "Free AI Tools for Developers",
    description: "Browse free AI tools and automation resources curated for coding, research, and workflow acceleration."
  },
  {
    slug: "components",
    label: "Components",
    category: "ui-component",
    title: "Free UI Components for Developers",
    description: "Browse free UI components and reusable interface building blocks for modern frontend teams."
  },
  {
    slug: "other",
    label: "Other",
    category: "other",
    title: "More Free Developer Resources",
    description: "Browse additional free developer resources that do not fit a primary category but still offer practical value."
  }
];

export function getCategoryPageBySlug(slug?: string | null) {
  if (!slug) return null;
  return FREE_TOOLS_CATEGORY_PAGES.find((entry) => entry.slug === slug) || null;
}

export function getCategoryPageByCategory(category?: ToolCategory | null) {
  if (!category) return null;
  return FREE_TOOLS_CATEGORY_PAGES.find((entry) => entry.category === category) || null;
}

export function buildFreeToolsRoute(categorySlug?: string | null, page = 1) {
  const safePage = Math.max(1, Math.floor(page));

  if (categorySlug) {
    return safePage <= 1
      ? `/free-tools/category/${categorySlug}`
      : `/free-tools/category/${categorySlug}/page/${safePage}`;
  }

  return safePage <= 1 ? "/free-tools" : `/free-tools/page/${safePage}`;
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

export async function getFreeToolsPageData({
  page = 1,
  category
}: {
  page?: number;
  category?: ToolCategory;
}) {
  const safePage = Math.max(1, Math.floor(page));

  try {
    const supabase = getAdmin();
    const { data: rows, error } = await supabase.from("open_source_tools").select("*");

    if (error) {
      throw error;
    }

    const filteredRows = (Array.isArray(rows) ? rows : [])
      .filter((row) => isApprovedLike(row?.status))
      .map(mapOpenSourceTool)
      .filter((tool) => (category ? tool.category === category : true))
      .sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());

    const count = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(count / FREE_TOOLS_PAGE_SIZE));
    const start = (safePage - 1) * FREE_TOOLS_PAGE_SIZE;
    const initialTools = filteredRows.slice(start, start + FREE_TOOLS_PAGE_SIZE);

    return {
      initialTools,
      initialCount: count,
      initialTotalPages: totalPages,
      currentPage: safePage
    };
  } catch {
    return {
      initialTools: [] as ScrapedTool[],
      initialCount: null as number | null,
      initialTotalPages: 1,
      currentPage: safePage
    };
  }
}
