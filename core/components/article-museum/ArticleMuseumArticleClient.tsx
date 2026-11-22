import Link from "next/link";
import { marked } from "marked";
import {
  Zap,
  BookOpen,
  Lightbulb,
  Code2,
  Search,
  Briefcase,
  ExternalLink,
  Star,
  Scale,
  List,
  ShieldCheck,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareButton from "@/components/ShareButton";
import CopyCodeBlock from "@/components/article-museum/CopyCodeBlock";
import ArchitectureFlowchart from "@/components/tools/ArchitectureFlowchart";
import VpsSizingEstimator from "@/components/tools/VpsSizingEstimator";
import { formatLicense } from "@/lib/utils/license";

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
  related_tool_url?: string | null;
};

export type ArticleRelatedData = {
  tool?: {
    name: string;
    slug: string;
    category?: string | null;
    github_stars?: number | null;
    license?: string | null;
    url?: string | null;
    language?: string | null;
  } | null;
  comparisons?: { slug: string; tool_a: string; tool_b: string }[];
  alternatives?: { saas_name: string; saas_slug: string }[];
  moreArticles?: { slug: string; tool_name: string; title: string }[];
};

function renderMarkdown(text: string): string {
  return marked(text || "", { async: false, breaks: true }) as string;
}

function firstSentence(text: string): string {
  const cleaned = (text || "").replace(/[*_`#]/g, "").replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : cleaned.slice(0, 180).trim();
}

const PROSE_CLASSES =
  "prose prose-invert max-w-none text-[16px] sm:text-[17px] leading-[1.8] " +
  "prose-headings:font-display prose-headings:text-white prose-headings:font-semibold " +
  "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 " +
  "prose-p:text-slate-200/90 prose-p:leading-[1.8] prose-p:my-4 " +
  "prose-li:text-slate-200/90 prose-li:my-1.5 " +
  "prose-strong:text-white prose-strong:font-semibold " +
  "prose-code:text-cyan-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm " +
  "prose-a:text-cyan-300 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-cyan-200";

export default function ArticleMuseumArticleClient({
  article,
  related,
}: {
  article: Article;
  related?: ArticleRelatedData;
}) {
  const toolName = article.tool_name || "This Tool";
  const officialUrl = related?.tool?.url || article.related_tool_url || null;

  const sections = [
    { id: "overview", label: `What ${toolName} Solves`, present: Boolean(article.mystery_intro?.trim()) },
    { id: "capabilities", label: "Key Capabilities & Architecture", present: Boolean(article.superpower?.trim()) },
    { id: "use-cases", label: "Real-World Use Cases", present: Boolean(article.user_case?.trim()) },
    { id: "background", label: "Project Background & Ecosystem", present: Boolean(article.origin_story?.trim()) },
    { id: "verdict", label: "Why It Matters & Verdict", present: Boolean(article.why_care?.trim()) },
    { id: "quickstart", label: "Quickstart & Self-Hosting", present: Boolean(article.hands_on_code?.trim()) },
  ].filter((s) => s.present);

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl pb-20 pt-6">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Deep Dives", href: "/article-museum" },
            { label: article.tool_name || article.title },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main Article Column */}
        <article className="min-w-0 max-w-3xl space-y-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                {toolName}
              </span>
              {related?.tool?.category && (
                <span className="inline-flex rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-[11px] font-medium text-slate-300">
                  {related.tool.category}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm text-slate-400">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link href="/about" className="font-medium text-slate-200 hover:text-cyan-300 transition">
                  By Dinesh Regar
                </Link>
                <span>·</span>
                <span>{article.read_time || "5 min read"}</span>
                {formattedDate && (
                  <>
                    <span>·</span>
                    <time dateTime={article.published_at}>{formattedDate}</time>
                  </>
                )}
              </div>

              <ShareButton title={`${article.title} | The Cloud Rain`} />
            </div>

            {/* Quick Summary & Specs Card (TL;DR) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Quick Overview &amp; Specs
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {related?.tool?.github_stars && related.tool.github_stars > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 font-semibold text-amber-300">
                      <Star className="h-3 w-3 fill-amber-300/30 text-amber-300" />
                      {related.tool.github_stars.toLocaleString()} stars
                    </span>
                  )}
                  {related?.tool?.license && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-slate-200">
                      <Scale className="h-3 w-3 text-slate-400" />
                      {formatLicense(related.tool.license)}
                    </span>
                  )}
                  {related?.tool?.language && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-slate-300">
                      {related.tool.language}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-200">
                {firstSentence(article.superpower || article.mystery_intro)}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {related?.tool && (
                  <Link
                    href={`/tools/${related.tool.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    <span>View {related.tool.name} Specs →</span>
                  </Link>
                )}
                {officialUrl && (
                  <a
                    href={officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-200"
                  >
                    <span>Official Site / Repo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {related?.comparisons?.slice(0, 2).map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/vs/${comp.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/50 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                  >
                    <span>
                      {comp.tool_a} vs {comp.tool_b} →
                    </span>
                  </Link>
                ))}
                {related?.alternatives?.slice(0, 1).map((alt) => (
                  <Link
                    key={alt.saas_slug}
                    href={`/alternatives/${alt.saas_slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/50 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                  >
                    <span>{alt.saas_name} Alternatives →</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile / Tablet Inline Jump Links */}
            {sections.length > 2 && (
              <nav
                aria-label="Table of contents"
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 lg:hidden"
              >
                <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <List className="h-3.5 w-3.5 text-cyan-400" />
                  <span>In This Guide</span>
                </p>
                <ul className="flex flex-wrap gap-2">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="inline-flex rounded-lg border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200 transition"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </header>

          {/* Article Body Sections (Markdown Rendered) */}
          <div className="space-y-12">
            {article.mystery_intro?.trim() && (
              <section id="overview" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <Search className="h-5 w-5 text-cyan-400 shrink-0" />
                  <h2 className="font-display text-2xl font-bold text-white">
                    What {toolName} Solves
                  </h2>
                </div>
                <div
                  className={PROSE_CLASSES}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.mystery_intro) }}
                />
              </section>
            )}

            {article.superpower?.trim() && (
              <section id="capabilities" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                  <h2 className="font-display text-2xl font-bold text-white">
                    Key Capabilities &amp; Architecture
                  </h2>
                </div>
                <div
                  className={PROSE_CLASSES}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.superpower) }}
                />
              </section>
            )}

            {article.user_case?.trim() && (
              <section id="use-cases" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-blue-400 shrink-0" />
                  <h2 className="font-display text-2xl font-bold text-white">
                    Real-World Use Cases
                  </h2>
                </div>
                <div
                  className={PROSE_CLASSES}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.user_case) }}
                />
              </section>
            )}

            {article.origin_story?.trim() && (
              <section id="background" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-emerald-400 shrink-0" />
                  <h2 className="font-display text-2xl font-bold text-white">
                    Project Background &amp; Ecosystem
                  </h2>
                </div>
                <div
                  className={PROSE_CLASSES}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.origin_story) }}
                />
              </section>
            )}

            {article.why_care?.trim() && (
              <section id="verdict" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-300 shrink-0" />
                  <h2 className="font-display text-2xl font-bold text-white">
                    Why It Matters &amp; Verdict
                  </h2>
                </div>
                <div
                  className={PROSE_CLASSES}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.why_care) }}
                />
              </section>
            )}

            {article.hands_on_code?.trim() && (
              <section id="quickstart" className="scroll-mt-24 space-y-6">
                <div className="mb-4 flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-cyan-400 shrink-0" />
                  <h2 className="font-display text-2xl font-bold text-white">
                    Quickstart &amp; Self-Hosting Setup
                  </h2>
                </div>
                <ArchitectureFlowchart
                  toolName={toolName}
                  slug={
                    related?.tool?.slug ||
                    toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                  }
                  language={related?.tool?.language}
                  category={related?.tool?.category}
                />
                <VpsSizingEstimator
                  toolName={toolName}
                  slug={
                    related?.tool?.slug ||
                    toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                  }
                  language={related?.tool?.language}
                  saasSlug={related?.alternatives?.[0]?.saas_slug || null}
                />
                <CopyCodeBlock
                  code={article.hands_on_code}
                  label={`${toolName} Quickstart`}
                />
              </section>
            )}
          </div>

          {/* Author & Editorial Verification (E-E-A-T) */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 font-display text-sm font-bold text-cyan-200">
                  DR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Dinesh Regar</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      Editor &amp; Maintainer
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    Founder of The Cloud Rain. Curating and reviewing self-hostable open-source software, licenses, and SaaS alternatives for developers.
                  </p>
                </div>
              </div>
              <Link
                href="/about#methodology"
                className="shrink-0 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition"
              >
                Review Methodology →
              </Link>
            </div>
          </section>

          {/* Footer: Tags, Related Comparisons, Alternatives, More Deep Dives */}
          <footer className="space-y-8 border-t border-slate-800 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Topics:
                </span>
                {(article.tags || []).map((tag) => (
                  <Link
                    key={tag}
                    href={`/article-museum?search=${encodeURIComponent(tag)}`}
                    className="rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[11px] uppercase tracking-wider text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200 transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {related?.tool && (
                  <Link
                    href={`/tools/${related.tool.slug}`}
                    className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                  >
                    Explore {related.tool.name} Specifications →
                  </Link>
                )}
                <Link
                  href="/free-tools"
                  className="inline-flex rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                >
                  Browse All Open-Source Tools
                </Link>
              </div>
            </div>

            {related?.comparisons && related.comparisons.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">
                  Head-to-Head
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-white">
                  Compare {toolName} Against Commercial SaaS
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.comparisons.map((comp) => (
                    <Link
                      key={comp.slug}
                      href={`/vs/${comp.slug}`}
                      className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-200"
                    >
                      <span>
                        {comp.tool_a} vs {comp.tool_b}
                      </span>
                      <span className="text-cyan-300 group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {related?.alternatives && related.alternatives.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                  SaaS Replacements
                </p>
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
                </div>
              </div>
            )}

            {related?.moreArticles && related.moreArticles.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                  More Deep Dives
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-white">
                  Continue Reading
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {related.moreArticles.map((art) => (
                    <Link
                      key={art.slug}
                      href={`/article-museum/${art.slug}`}
                      className="group rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-cyan-400/40"
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

        {/* Sticky Desktop Table of Contents */}
        {sections.length > 1 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <nav
                aria-label="On this page"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <List className="h-3.5 w-3.5 text-cyan-400" />
                  <span>On This Page</span>
                </p>
                <ul className="space-y-2 border-l border-slate-800 pl-3">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block text-xs leading-snug text-slate-300 transition hover:text-cyan-300"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {related?.tool && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Tool Page
                  </p>
                  <p className="text-sm font-semibold text-white">{related.tool.name}</p>
                  <Link
                    href={`/tools/${related.tool.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Open Full Specs →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
