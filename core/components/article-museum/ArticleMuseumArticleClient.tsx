"use client";

import Link from "next/link";
import { ChevronLeft, Zap, BookOpen, Lightbulb, Code2, Search, Briefcase } from "lucide-react";

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

export default function ArticleMuseumArticleClient({ article }: { article: Article }) {
  return (
    <article className="mx-auto max-w-3xl space-y-12 pb-20 pt-6">
      <Link
        href="/article-museum"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Museum
      </Link>

      <header className="space-y-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.mystery_intro,
              image: article.image_url || "",
              datePublished: article.published_at,
              author: {
                "@type": "Organization",
                name: "The Cloud Rain"
              }
            })
          }}
        />
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          {article.tool_name}
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/40">
          <span>{article.read_time || "5 min read"}</span>
          <span>|</span>
          <span>{new Date(article.published_at).toLocaleDateString()}</span>
        </div>
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

      <footer className="mt-12 border-t border-white/10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            <span className="mr-2 text-sm font-semibold text-white/40">Tags:</span>
            {(article.tags || []).map((tag) => (
              <span key={tag} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/60">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">Related Tool:</span>
            <Link
              href="/free-tools"
              className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
            >
              Explore directory
            </Link>
          </div>
        </div>
      </footer>
    </article>
  );
}
