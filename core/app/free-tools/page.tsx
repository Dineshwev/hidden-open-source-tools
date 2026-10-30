import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import slugify from "slugify";
import FreeToolsPageClient from "./FreeToolsPageClient";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { dedupeToolRowsBySlug } from "@/lib/tool-records";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

import { getApprovedSuccessToolCount } from "@/lib/tool-count";

const pagePath = "/free-tools";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const pageTitle = `Open-Source Developer Tools & SaaS Alternatives Directory`;
  const pageDescription = `Browse ${toolCount}+ curated open-source developer tools, self-hosted software, and privacy-focused SaaS alternatives. Discover GitHub repos, ratings, and deployment options.`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: pagePath
    },
    openGraph: {
      title: `${pageTitle} | The Cloud Rain`,
      description: pageDescription,
      url: `${siteUrl}${pagePath}`,
      images: [
        {
          url: `${siteUrl}/og/free-tools.png`,
          width: 1200,
          height: 630,
          alt: "Open-Source Tools Directory"
        }
      ]
    }
  };
}

function normalizeSearchTerm(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildToolSlug(row: any) {
  const explicitSlug = String(row?.slug || "").trim();
  if (explicitSlug) return explicitSlug;

  return slugify(String(row?.name || row?.title || ""), {
    lower: true,
    strict: true,
    trim: true
  });
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

function mapOpenSourceTool(row: any): ScrapedTool {
  return {
    id: String(row?.id || ""),
    slug: buildToolSlug(row) || null,
    title: String(row?.name || row?.title || "Untitled"),
    description: row?.description ?? null,
    image_url: row?.image_url ?? row?.image ?? null,
    logo_url: row?.logo_url ?? null,
    webpage_url: String(row?.url || row?.webpage_url || ""),
    category: normalizeDbCategory(row?.category),
    raw_category: row?.category ? String(row.category) : null,
    github_stars: typeof row?.github_stars === "number" ? row.github_stars : null,
    source_site: row?.source_site ?? null,
    status: "approved",
    scraped_at: String(row?.created_at || row?.scraped_at || row?.inserted_at || row?.updated_at || new Date(0).toISOString()),
    reviewed_at: row?.reviewed_at ?? null,
    moderation_note: row?.moderation_note ?? null
  };
}

export default async function FreeToolsPage({
  searchParams
}: {
  searchParams?: { search?: string | string[]; category?: string | string[] };
}) {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("open_source_tools")
    .select("*")
    .eq("status", "approved")
    .order("github_stars", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Supabase error in FreeToolsPage:", JSON.stringify(error));
  }

  const searchTerm = normalizeSearchTerm(searchParams?.search)?.trim() || "";
  const categoryParam = normalizeSearchTerm(searchParams?.category)?.trim() || "";

  const uniqueRows = error || !Array.isArray(data) ? [] : dedupeToolRowsBySlug(data);
  const initialTools = uniqueRows.map(mapOpenSourceTool);

  const uniqueCategoryRows = dedupeToolRowsBySlug(
    (Array.isArray(data) ? data : []).filter((row: any) => String(row?.status).toLowerCase() === "approved")
  );
  const rawCounts = uniqueCategoryRows.reduce<Record<string, number>>((acc, r: any) => {
    const key = String(r?.category || "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

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
      initialCategory={categoryParam || "all"}
      initialSearch={searchTerm}
      categoryCounts={counts}
    />
  );
}
