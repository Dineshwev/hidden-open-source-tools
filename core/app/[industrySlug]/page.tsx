import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export const revalidate = 86400;

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(\[.*?\]\(.*?\)\)/g, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateStaticParams() {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("industry_pages")
      .select("slug")
      .eq("status", "published");

    if (error || !Array.isArray(data)) return [];

    return data
      .map((row) => String(row?.slug || "").trim())
      .filter(Boolean)
      .map((slug) => ({ industrySlug: slug.startsWith('best-') ? slug : `best-${slug}` }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { industrySlug: string } }): Promise<Metadata> {
  if (!params.industrySlug.startsWith('best-')) {
    return {};
  }

  const slug = params.industrySlug;

  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("industry_pages")
      .select("meta_title, meta_description")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) return {};

    const page = data as any;
    return {
      title: String(page.meta_title || "Best Developer Tools"),
      description: String(page.meta_description || "Discover the best tools."),
      alternates: {
        canonical: `/best-${slug}`
      }
    };
  } catch {
    return {};
  }
}

export default async function IndustrySlugPage({ params }: { params: { industrySlug: string } }) {
  if (!params.industrySlug.startsWith('best-')) {
    notFound();
  }

  const slug = params.industrySlug;

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("industry_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    notFound();
  }

  const page = data as any;

  let tools: any[] = [];
  if (Array.isArray(page.tool_ids) && page.tool_ids.length > 0) {
    const { data: toolsData, error: toolsError } = await supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, logo_url")
      .in("id", page.tool_ids);

    if (!toolsError && Array.isArray(toolsData)) {
      tools = toolsData;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <section>
        <h1 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">{page.h1_title}</h1>
        {page.intro_paragraph && (
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70">
            {page.intro_paragraph}
          </p>
        )}
      </section>

      {tools.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-3xl text-white">Recommended Tools</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {tools.map((tool: any) => {
              const toolUrl = tool.slug ? `/tools/${tool.slug}` : (tool.url || "#");

              return (
                <div key={tool.id} className="group relative rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8 transition-colors hover:bg-white/[0.05]">
                  <Link href={toolUrl} className="absolute inset-0 z-10" />
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-2">
                      {tool.logo_url ? (
                        <Image
                          src={tool.logo_url}
                          alt={`${tool.name || 'Tool'} logo`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="font-display text-2xl text-white">{tool.name?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="space-y-2 pt-1">
                      <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                        {tool.category || "Resource"}
                      </span>
                      <h3 className="font-display text-2xl text-white transition-colors group-hover:text-cyan-400">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/70 line-clamp-3 relative z-20">
                    {stripMarkdown(tool.description ?? "")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(page.cta_text || page.cta_href) && (
        <section className="text-center">
          <Link
            href={page.cta_href || "#"}
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
          >
            {page.cta_text || "Learn More"}
          </Link>
        </section>
      )}
    </div>
  );
}