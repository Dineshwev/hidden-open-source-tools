import Link from "next/link";
import { Zap, BookOpen, Lightbulb, Code2, Search, Briefcase } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareButton from "@/components/ShareButton";

type Article = {
  id: string;
  slug: string;
  tool_name: string;
  title: string;
  mystery_intro: string;
  superpower: string;
  origin_story: string;
  why_care: string;
  user_case?: string;
  hands_on_code: string;
  read_time: string;
  tags: string[];
  published_at: string;
  image_url?: string;
};

export type ArticleRelatedData = {
  tool?: { name: string; slug: string; category?: string | null; github_stars?: number | null } | null;
  comparisons?: { slug: string; tool_a: string; tool_b: string }[];
  alternatives?: { saas_name: string; saas_slug: string }[];
  moreArticles?: { slug: string; tool_name: string; title: string }[];
};

export default function ArticleMuseumArticleClient({
  article,
  related,
}: {
  article: Article;
  related?: ArticleRelatedData;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-12 pb-20 pt-6">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Articles", href: "/article-museum" },
        { label: article.tool_name || article.title },
      ]} />

      <header className="space-y-4">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          {article.tool_name}
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/40 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span>{article.read_time || "5 min read"}</span>
            <span>|</span>
            <span>{new Date(article.published_at).toLocaleDateString()}</span>
          </div>

          <ShareButton
            title={`${article.title} | The Cloud Rain`}
          />
        </div>

        {(related?.tool || (related?.comparisons && related.comparisons.length > 0) || (related?.alternatives && related.alternatives.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {related?.tool && (
              <Link
                href={`/tools/${related.tool.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                <span>View {related.tool.name} Tool Page →</span>
              </Link>
            )}
            {related?.comparisons?.slice(0, 2).map((comp) => (
              <Link
                key={comp.slug}
                href={`/vs/${comp.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/80 transition hover:border-cyan-400/30 hover:text-cyan-200"
              >
                <span>{comp.tool_a} vs {comp.tool_b} →</span>
              </Link>
            ))}
            {related?.alternatives?.slice(0, 1).map((alt) => (
              <Link
                key={alt.saas_slug}
                href={`/alternatives/${alt.saas_slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/80 transition hover:border-cyan-400/30 hover:text-cyan-200"
              >
                <span>{alt.saas_name} Alternatives →</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-16">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Search className="h-6 w-6 text-purple-400" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">The Mystery</h2>
          </div>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white/70">{article.mystery_intro}</p>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">The Superpower</h2>
          </div>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white/70">{article.superpower}</p>
        </section>

        {article.user_case && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-blue-400" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">Use Case</h2>
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-white/70">{article.user_case}</p>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">Origin Story</h2>
          </div>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white/70">{article.origin_story}</p>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-amber-400" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">Why You Should Care</h2>
          </div>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white/70">{article.why_care}</p>
        </section>

        {article.hands_on_code && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Code2 className="h-6 w-6 text-blue-400" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">Get Hands-On</h2>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-6 font-mono text-sm leading-relaxed text-green-400 shadow-xl">
              <code>{article.hands_on_code}</code>
            </pre>
          </section>
        )}
      </div>

      <footer className="mt-12 space-y-8 border-t border-white/10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            <span className="mr-2 text-sm font-semibold text-white/40">Tags:</span>
            {(article.tags || []).map((tag) => (
              <span key={tag} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/60">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {related?.tool ? (
              <Link
                href={`/tools/${related.tool.slug}`}
                className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                Explore {related.tool.name} Specifications →
              </Link>
            ) : null}
            <Link
              href="/free-tools"
              className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30"
            >
              Browse All Open-Source Tools
            </Link>
          </div>
        </div>

        {(related?.comparisons && related.comparisons.length > 0) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">Head-to-Head</p>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              Compare {article.tool_name} Against Commercial SaaS
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.comparisons.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/vs/${comp.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/85 transition hover:border-cyan-400/40 hover:text-cyan-200"
                >
                  <span>{comp.tool_a} vs {comp.tool_b}</span>
                  <span className="text-cyan-300 group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(related?.alternatives && related.alternatives.length > 0) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">SaaS Replacements</p>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              Related Open-Source Alternatives Hubs
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {related.alternatives.map((alt) => (
                <Link
                  key={alt.saas_slug}
                  href={`/alternatives/${alt.saas_slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  <span>Best Open-Source {alt.saas_name} Alternatives →</span>
                </Link>
              ))}
              <Link
                href="/best-free-developer-tools"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30"
              >
                <span>Best Free Developer Tools →</span>
              </Link>
            </div>
          </div>
        )}

        {(related?.moreArticles && related.moreArticles.length > 0) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">More Deep Dives</p>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              Continue Reading in the Article Museum
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.moreArticles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/article-museum/${art.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-400/40"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                    {art.tool_name}
                  </span>
                  <p className="mt-1 text-xs font-semibold leading-snug text-white group-hover:text-cyan-200 line-clamp-2">
                    {art.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </footer>
    </article>
  );
}
