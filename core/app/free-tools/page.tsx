import type { Metadata } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import FreeToolsPageClient from "./FreeToolsPageClient";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const pagePath = "/free-tools";
const pageTitle = "153+ Free Developer Resources | The Cloud Rain";
const pageDescription =
  "Free UI kits, courses, templates, AI tools curated for developers. Updated daily.";
const INITIAL_LIMIT = 24;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "free developer resources",
    "free ui kits",
    "free developer courses",
    "developer templates",
    "ai tools for developers",
    "The Cloud Rain"
  ],
  alternates: {
    canonical: pagePath
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${siteUrl}${pagePath}`,
    images: [
      {
        url: `${siteUrl}/og/free-tools.png`,
        width: 1200,
        height: 630,
        alt: "153+ Free Developer Resources"
      }
    ]
  }
};

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

async function getInitialTools() {
  try {
    const supabase = getAdmin();
    const { data: rows, error } = await supabase.from("open_source_tools").select("*");

    if (error) {
      throw error;
    }

    const filteredRows = (Array.isArray(rows) ? rows : [])
      .filter((row) => isApprovedLike(row?.status))
      .map(mapOpenSourceTool)
      .sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());

    const count = filteredRows.length;
    const totalPages = count > 0 ? Math.ceil(count / INITIAL_LIMIT) : 1;

    return {
      initialTools: filteredRows.slice(0, INITIAL_LIMIT),
      initialCount: count,
      initialTotalPages: totalPages
    };
  } catch {
    return {
      initialTools: [] as ScrapedTool[],
      initialCount: null as number | null,
      initialTotalPages: 1
    };
  }
}

export default async function FreeToolsPage() {
  const { initialTools, initialCount, initialTotalPages } = await getInitialTools();

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialCount}
      initialTotalPages={initialTotalPages}
    />
  );
}
