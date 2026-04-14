import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

// Force fresh data on every visit
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArticleMuseumPage() {
  const supabase = getAdmin();
  
  // Fetch directly from database to bypass all API caching
  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="mb-10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Digital Archaeology
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">
          Article Museum
        </h1>
        <p className="mt-3 text-white/60 max-w-2xl text-lg leading-relaxed">
          The hidden stories behind open source software. Why was it built? Who built it? And why should you care?
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          Error loading articles: {error.message}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {!articles || articles.length === 0 ? (
          <div className="col-span-1 md:col-span-2 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="font-display text-xl text-white">First article coming soon...</h2>
            <p className="mt-2 text-white/50">Stay tuned for deep dives into open-source history.</p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="glass-panel flex flex-col justify-between rounded-[1.5rem] border border-white/10 p-6 transition-colors hover:border-white/20"
            >
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    {article.tool_name}
                  </span>
                  <span className="text-xs text-white/40">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recently'}
                  </span>
                  <span className="text-xs text-white/40">• {article.read_time || "5 min read"}</span>
                </div>
                <h2 className="mb-3 font-display text-2xl font-semibold text-white">
                  {article.title}
                </h2>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-white/60">
                  {article.mystery_intro}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {(article.tags || []).map((tag: string) => (
                    <span key={tag} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] uppercase text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/article-museum/${article.slug}`}
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                Read Story <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
