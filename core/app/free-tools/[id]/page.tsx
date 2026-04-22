import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft, ExternalLink, Globe, Tag, Calendar, ShieldCheck } from "lucide-react";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23161616'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='700' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a7a7a7' font-family='Arial,sans-serif' font-size='34'%3ENo preview available%3C/text%3E%3C/svg%3E";

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
    title: String(row?.name || row?.title || "Untitled"),
    description: row?.description ?? null,
    image_url: row?.image_url ?? row?.image ?? null,
    logo_url: row?.logo_url ?? null,
    webpage_url: String(row?.url || row?.webpage_url || ""),
    category: normalizeDbCategory(row?.category),
    source_site: row?.source_site ?? null,
    status: (row?.status as any) || "approved",
    scraped_at: String(row?.scraped_at || row?.created_at || new Date(0).toISOString()),
    reviewed_at: row?.reviewed_at ?? null,
    moderation_note: row?.moderation_note ?? null
  };
}

async function getTool(id: string): Promise<ScrapedTool | null> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapOpenSourceTool(data);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tool = await getTool(params.id);
  if (!tool) return {};

  const title = `${tool.title} | Free Developer Resource`;
  const description = tool.description || `Download ${tool.title} and other free developer resources on The Cloud Rain.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: tool.image_url ? [tool.image_url] : [],
      url: `${siteUrl}/free-tools/${tool.id}`,
    },
    alternates: {
      canonical: `/free-tools/${tool.id}`,
    }
  };
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const tool = await getTool(params.id);

  if (!tool) {
    notFound();
  }

  const formattedDate = new Date(tool.scraped_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link 
        href="/free-tools" 
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
      >
        <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Directory
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl">
            <Image
              src={tool.image_url || FALLBACK_IMAGE}
              alt={tool.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                <Tag className="h-3 w-3" />
                {tool.category.replace("-", " ")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                Verified Tool
              </span>
            </div>
            
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl tracking-tight">
              {tool.title}
            </h1>
            
            <p className="text-xl leading-relaxed text-white/70">
              {tool.description}
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 space-y-8 sticky top-24">
            <div className="space-y-4">
               <div className="flex items-center justify-between text-sm">
                <span className="text-white/40 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Added on
                </span>
                <span className="text-white/80 font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Source
                </span>
                <span className="text-white/80 font-medium">{tool.source_site || "External Repository"}</span>
              </div>
            </div>

            <a
              href={tool.webpage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 font-display text-sm font-black uppercase tracking-widest text-black transition hover:bg-zinc-200 active:scale-95 shadow-glow-light"
            >
              Access Resource
              <ExternalLink className="h-4 w-4" />
            </a>

            <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Safety Note</p>
              <p className="text-xs text-white/50 leading-relaxed">
                This resource has been manually reviewed and verified by The Cloud Rain moderators for quality and safety.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
