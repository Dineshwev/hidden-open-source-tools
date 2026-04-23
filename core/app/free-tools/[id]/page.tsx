import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft, ExternalLink, Globe, Tag, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23161616'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='700' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a7a7a7' font-family='Arial,sans-serif' font-size='34'%3ENo preview available%3C/text%3E%3C/svg%3E";

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

function formatCategoryLabel(category: ToolCategory) {
  switch (category) {
    case "ui-kit":
      return "UI Kit";
    case "course":
      return "Course";
    case "template":
      return "Template";
    case "ai-tool":
      return "AI Tool";
    case "ui-component":
      return "UI Component";
    default:
      return "Developer Resource";
  }
}

function getUseCaseCopy(category: ToolCategory) {
  switch (category) {
    case "ui-kit":
      return "Best for designers and frontend teams who want reusable interface patterns, faster layout iteration, and cleaner starting points for landing pages or dashboards.";
    case "course":
      return "Best for developers who want to learn a topic quickly through guided material, practical lessons, and project-based examples.";
    case "template":
      return "Best for shipping faster with a stronger project starting point, especially when you want working structure instead of a blank setup.";
    case "ai-tool":
      return "Best for developers who want to automate repetitive work, speed up drafting, or improve research and coding workflows.";
    case "ui-component":
      return "Best for product teams who need reusable building blocks for frontend systems, dashboards, and production-ready interfaces.";
    default:
      return "Best for developers looking for a practical free resource that can reduce setup time, improve workflows, or expand their toolkit.";
  }
}

function getReviewCopy(tool: ScrapedTool) {
  const categoryLabel = formatCategoryLabel(tool.category).toLowerCase();
  return `This ${categoryLabel} is listed in The Cloud Rain free tools directory after a manual review for clarity, basic trust signals, and fit with the public resource library.`;
}

async function getTool(id: string): Promise<ScrapedTool | null> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase.from("open_source_tools").select("*").eq("id", id).single();

    if (error || !data) return null;
    return mapOpenSourceTool(data);
  } catch {
    return null;
  }
}

async function getRelatedTools(tool: ScrapedTool): Promise<ScrapedTool[]> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("*")
      .neq("id", tool.id)
      .eq("category", tool.category)
      .or("status.eq.approved,status.is.null")
      .order("scraped_at", { ascending: false })
      .limit(3);

    if (error) return [];
    return (Array.isArray(data) ? data : []).map(mapOpenSourceTool);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tool = await getTool(params.id);
  if (!tool) return {};

  const categoryLabel = formatCategoryLabel(tool.category);
  const title = `${tool.title} | Free ${categoryLabel} for Developers`;
  const description =
    tool.description ||
    `${tool.title} is a free ${categoryLabel.toLowerCase()} featured on The Cloud Rain free tools directory for developers.`;

  return {
    title,
    description,
    keywords: [
      tool.title,
      `free ${categoryLabel.toLowerCase()}`,
      "free developer tools",
      "open source software",
      "developer resources"
    ],
    openGraph: {
      title,
      description,
      images: tool.image_url ? [{ url: tool.image_url, alt: tool.title }] : [],
      url: `${siteUrl}/free-tools/${tool.id}`,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    alternates: {
      canonical: `/free-tools/${tool.id}`
    }
  };
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const tool = await getTool(params.id);

  if (!tool) {
    notFound();
  }

  const relatedTools = await getRelatedTools(tool);
  const formattedDate = new Date(tool.scraped_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const categoryLabel = formatCategoryLabel(tool.category);
  const description =
    tool.description ||
    `${tool.title} is a free ${categoryLabel.toLowerCase()} listed in The Cloud Rain developer resource directory.`;
  const pageUrl = `${siteUrl}/free-tools/${tool.id}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: tool.title,
        url: pageUrl,
        description,
        isPartOf: {
          "@type": "WebSite",
          name: "The Cloud Rain",
          url: siteUrl
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Free Tools",
            item: `${siteUrl}/free-tools`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.title,
            item: pageUrl
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        name: tool.title,
        applicationCategory: categoryLabel,
        operatingSystem: "Web",
        description,
        url: tool.webpage_url,
        image: tool.image_url || undefined,
        publisher: {
          "@type": "Organization",
          name: tool.source_site || "External publisher"
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        }
      }
    ]
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Link
        href="/free-tools"
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
      >
        <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Directory
      </Link>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_350px]">
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                <Tag className="h-3 w-3" />
                {categoryLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Verified Tool
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {tool.title}
            </h1>

            <p className="text-xl leading-relaxed text-white/70">{description}</p>
          </div>

          <section className="grid gap-5 md:grid-cols-2">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">What it is</p>
              <h2 className="mt-2 text-2xl text-white">A curated {categoryLabel.toLowerCase()} for developers</h2>
              <p className="mt-3 text-sm leading-7 text-white/68">{description}</p>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Best for</p>
              <h2 className="mt-2 text-2xl text-white">Practical workflow use</h2>
              <p className="mt-3 text-sm leading-7 text-white/68">{getUseCaseCopy(tool.category)}</p>
            </article>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Review note</p>
            <h2 className="mt-2 text-2xl text-white">Why this listing exists in the directory</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{getReviewCopy(tool)}</p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              The goal of this page is to give developers enough context to decide whether the tool is worth opening, without making them rely only on a title or a raw outbound link.
            </p>
          </section>

          {relatedTools.length > 0 ? (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl">Related {categoryLabel}s</h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
                If you are comparing options in the same category, these related listings can help you continue browsing without going back to the main directory.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedTools.map((relatedTool) => (
                  <article key={relatedTool.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <h3 className="text-lg text-white">{relatedTool.title}</h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/65">
                      {relatedTool.description || `Explore another ${categoryLabel.toLowerCase()} from the free tools directory.`}
                    </p>
                    <Link
                      href={`/free-tools/${relatedTool.id}`}
                      className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/90"
                    >
                      View tool
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/40">
                  <Calendar className="h-4 w-4" /> Added on
                </span>
                <span className="font-medium text-white/80">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/40">
                  <Globe className="h-4 w-4" /> Source
                </span>
                <span className="font-medium text-right text-white/80">{tool.source_site || "External Repository"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/40">
                  <Tag className="h-4 w-4" /> Category
                </span>
                <span className="font-medium text-white/80">{categoryLabel}</span>
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

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Safety Note</p>
              <p className="text-xs leading-relaxed text-white/50">
                This resource has been manually reviewed and verified by The Cloud Rain moderators for quality and safety.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Keep browsing</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/free-tools" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
                  Free Tools
                </Link>
                <Link href="/best-free-developer-tools" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
                  Best Free Tools
                </Link>
                <Link href="/open-source-software" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
                  Open Source Software
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
