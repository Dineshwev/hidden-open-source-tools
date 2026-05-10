import type { Metadata } from "next";
import FreeToolsPageClient from "./FreeToolsPageClient";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const pagePath = "/free-tools";
const pageTitle = "No-Cost Developer Resources and Open Source Tools";
const pageDescription =
  "Browse no-cost developer resources, open-source tools, UI kits, courses, templates, and components curated for practical engineering work.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "no-cost developer tools",
    "open-source resources",
    "developer templates"
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
        alt: "No-Cost Developer Resources Directory"
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
    status: "approved",
    scraped_at: String(row?.created_at || row?.scraped_at || row?.inserted_at || row?.updated_at || new Date(0).toISOString()),
    reviewed_at: row?.reviewed_at ?? null,
    moderation_note: row?.moderation_note ?? null
  };
}

export default async function FreeToolsPage() {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("open_source_tools")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const initialTools = error ? [] : (Array.isArray(data) ? data.map(mapOpenSourceTool) : []);

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialTools.length}
    />
  );
}
