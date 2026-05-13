import type { Metadata } from "next";
import FreeToolsPageClient from "./FreeToolsPageClient";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";
const pagePath = "/free-tools";
const pageTitle = "250+ Free Open Source Developer Tools | The Cloud Rain";
const pageDescription =
  "Browse 250+ free open-source developer tools, self-hosted software, AI utilities, and practical components. No paywalls, no vendor lock-in. Curated for builders.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "free open source tools",
    "free developer tools",
    "open source software",
    "self-hosted software",
    "developer utilities",
    "open source discovery",
    "open source alternatives",
    "self-hosted tools",
    "no cost resources",
    "developer utilities",
    "free software directory"
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

  // Fetch exact category values and compute counts server-side
  const { data: categoryRows } = await supabase.from("open_source_tools").select("category").eq("status", "approved");

  const rawCounts = Array.isArray(categoryRows)
    ? categoryRows.reduce<Record<string, number>>((acc, r) => {
        const key = String((r as any).category || "").trim();
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    : {};

  const counts: Record<string, number> = {
    All: initialTools.length,
    "Developer Tools": rawCounts["Developer Tools"] || 0,
    "Self-Hosting & Infrastructure": rawCounts["Self-Hosting & Infrastructure"] || 0,
    "Analytics & Search": rawCounts["Analytics & Search"] || 0,
    "Media & Utilities": rawCounts["Media & Utilities"] || 0,
    Productivity: rawCounts["Productivity"] || 0,
    "Community & Events": rawCounts["Community & Events"] || 0,
    "Business Tools": rawCounts["Business Tools"] || 0,
    Security: rawCounts["Security"] || 0,
    Miscellaneous: rawCounts["Miscellaneous"] || 0
  };

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialTools.length}
      categoryCounts={counts}
    />
  );
}
