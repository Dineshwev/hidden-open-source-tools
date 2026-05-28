import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

export const FREE_TOOLS_PAGE_SIZE = 12;

export type FreeToolsCategoryPage = {
  slug: string;
  label: string;
  title: string;
  description: string;
  matchValues: string[];
};

export const FREE_TOOLS_CATEGORY_PAGES: FreeToolsCategoryPage[] = [
  {
    slug: "developer-tools",
    label: "Developer Tools",
    title: "No-Cost Developer Tools",
    description: "Browse no-cost developer tools and open-source utilities curated for practical engineering workflows.",
    matchValues: ["developer tools", "developer-tools", "dev tools", "ui-kit", "template", "ai-tool", "ui-component"]
  },
  {
    slug: "self-hosting-infrastructure",
    label: "Self-Hosting & Infrastructure",
    title: "No-Cost Self-Hosting and Infrastructure Tools",
    description: "Browse no-cost self-hosting and infrastructure tools for deployment, orchestration, and operations.",
    matchValues: ["self-hosting & infrastructure", "self-hosting", "infrastructure", "self-hosting-infrastructure"]
  },
  {
    slug: "analytics-search",
    label: "Analytics & Search",
    title: "No-Cost Analytics and Search Tools",
    description: "Browse no-cost analytics, observability, and search tools for engineering teams.",
    matchValues: ["analytics & search", "analytics", "search", "analytics-search"]
  },
  {
    slug: "media-utilities",
    label: "Media & Utilities",
    title: "No-Cost Media and Utility Tools",
    description: "Browse no-cost media and utility tools that support production and developer workflows.",
    matchValues: ["media & utilities", "media", "utilities", "media-utilities"]
  },
  {
    slug: "productivity",
    label: "Productivity",
    title: "No-Cost Productivity Tools",
    description: "Browse no-cost productivity tools for planning, workflows, and day-to-day developer efficiency.",
    matchValues: ["productivity", "course", "courses"]
  },
  {
    slug: "community-events",
    label: "Community & Events",
    title: "No-Cost Community and Event Resources",
    description: "Browse no-cost community and event resources that help developers discover, learn, and collaborate.",
    matchValues: ["community & events", "community", "events", "community-events"]
  },
  {
    slug: "business-tools",
    label: "Business Tools",
    title: "No-Cost Business Tools for Builders",
    description: "Browse no-cost business tools used by product teams, founders, and engineering organizations.",
    matchValues: ["business tools", "business", "business-tools"]
  },
  {
    slug: "security",
    label: "Security",
    title: "No-Cost Security Tools",
    description: "Browse no-cost security tools for identity, hardening, scanning, and developer safety workflows.",
    matchValues: ["security"]
  },
  {
    slug: "miscellaneous",
    label: "Miscellaneous",
    title: "More No-Cost Developer Resources",
    description: "Browse additional no-cost developer resources that do not fit a primary category but still offer practical value.",
    matchValues: ["miscellaneous", "other"]
  }
];

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
    slug: row?.slug ? String(row.slug) : null,
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
  categorySlug
}: {
  page?: number;
  categorySlug?: string;
}) {
  const safePage = Math.max(1, Math.floor(page));

  try {
    const supabase = getAdmin();
    const { data: rows, error } = await supabase.from("open_source_tools").select("*");

    if (error) {
      throw error;
    }

    const toolRows = (Array.isArray(rows) ? rows : []) as Array<{ status?: unknown }>;

    const filteredRows = toolRows
      .filter((row) => isApprovedLike(row?.status))
      .map(mapOpenSourceTool)
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
