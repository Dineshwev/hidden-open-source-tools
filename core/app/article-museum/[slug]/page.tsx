import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import ArticleMuseumArticleClient, { type ArticleRelatedData } from "@/components/article-museum/ArticleMuseumArticleClient";

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

const siteUrl = getSiteUrl();

function buildArticleOgImage(article: Article, title: string, description: string): string {
  if (article.image_url) return article.image_url;
  return `${siteUrl}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description.slice(0, 110))}&badge=${encodeURIComponent("DEEP DIVE")}&category=${encodeURIComponent(article.tool_name || "Open Source")}`;
}

export const revalidate = 3600;

async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getAdmin();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return (article as Article | null) || null;
}

async function getPublishedArticleSlugs(): Promise<string[]> {
  const supabase = getAdmin();
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("is_published", true)
    .not("slug", "is", null);

  return (Array.isArray(data) ? data : [])
    .map((entry: any) => String(entry?.slug || "").trim())
    .filter(Boolean);
}

const ARTICLE_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  "changedetection-io-the-open-source-website-watcher": {
    title: "Changedetection.io (2026): Free Self-Hosted Website Watcher",
    description:
      "Monitor any webpage for visual, text, or price changes with Changedetection.io. Free open-source VisualPing alternative with Docker setup and instant alerts.",
  },
  "appwrite-the-open-source-backend-that-replaced-firebase": {
    title: "Appwrite (2026): Open-Source Firebase Alternative Review",
    description:
      "Self-host auth, databases, storage, and serverless functions with Appwrite. See how it replaces Firebase without vendor lock-in or surprise cloud bills.",
  },
  "authentik-the-identity-provider-that-replaced-auth0": {
    title: "Authentik (2026): Self-Hosted Auth0 & Okta Alternative",
    description:
      "Replace pricey Auth0 and Okta plans with Authentik. Deploy SSO, SAML, OIDC, and MFA in Docker with visual authentication flows.",
  },
  "plane-the-open-source-linear-alternative": {
    title: "Plane (2026): Open-Source Jira & Linear Alternative Review",
    description:
      "Fast issue tracking, sprint cycles, and roadmaps without per-seat SaaS bills. See why engineering teams are deploying Plane with Docker.",
  },
  "postiz-the-self-hosted-ai-social-scheduler": {
    title: "Postiz (2026): Free Self-Hosted AI Social Media Scheduler",
    description:
      "Schedule posts to Twitter, LinkedIn, Reddit, and Instagram with AI assistance. Self-host Postiz on your own VPS with zero monthly subscription limits.",
  },
};

function getArticleTitle(article: Article): string {
  return ARTICLE_SEO_OVERRIDES[article.slug]?.title || article.title;
}

function getArticleDescription(article: Article): string {
  const override = ARTICLE_SEO_OVERRIDES[article.slug]?.description;
  if (override) return override;
  const raw = (article.mystery_intro || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Deep dive into open source software, architecture, and self-hosting.";
  if (raw.length <= 160) return raw;
  const sliced = raw.slice(0, 157);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 100 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}...`;
}

export async function generateStaticParams() {
  const slugs = await getPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  const canonicalUrl = `${siteUrl}/article-museum/${params.slug}`;

  if (!article) {
    return {
      title: "Article Not Found",
      alternates: {
        canonical: canonicalUrl
      }
    };
  }

  const title = getArticleTitle(article);
  const description = getArticleDescription(article);
  const imageUrl = buildArticleOgImage(article, title, description);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "The Cloud Rain",
      type: "article",
      publishedTime: article.published_at || undefined,
      authors: ["Dinesh Regar"],
      tags: Array.isArray(article.tags) ? article.tags : undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

async function getArticleRelatedData(article: Article): Promise<ArticleRelatedData> {
  try {
    const supabase = getAdmin();
    const rawName = (article.tool_name || "").trim();
    const normSlug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const compactSlug = rawName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const [toolsRes, vsRes, altsRes, moreArtsRes] = await Promise.all([
      supabase
        .from("open_source_tools")
        .select("name, slug, category, github_stars, license, url, language")
        .or("status.eq.approved,status.eq.APPROVED")
        .or(`slug.eq.${normSlug},slug.eq.${compactSlug},name.ilike.${rawName}`)
        .limit(1),
      supabase
        .from("comparisons")
        .select("slug, tool_a, tool_b")
        .eq("status", "published")
        .or(`tool_a.ilike.%${rawName}%,tool_b.ilike.%${rawName}%`)
        .limit(6),
      supabase
        .from("alternatives")
        .select("saas_name, saas_slug, content")
        .or("status.eq.approved,status.eq.published"),
      supabase
        .from("articles")
        .select("slug, tool_name, title")
        .eq("is_published", true)
        .neq("slug", article.slug)
        .order("published_at", { ascending: false })
        .limit(3),
    ]);

    const rawTool = toolsRes.data?.[0] as any;
    const tool = rawTool
      ? {
          name: String(rawTool.name || ""),
          slug: String(rawTool.slug || ""),
          category: rawTool.category ? String(rawTool.category) : null,
          github_stars: typeof rawTool.github_stars === "number" ? rawTool.github_stars : null,
          license: rawTool.license ? String(rawTool.license) : null,
          url: rawTool.url ? String(rawTool.url) : null,
          language: rawTool.language ? String(rawTool.language) : null,
        }
      : null;

    const comparisons = (vsRes.data || []).map((c: any) => ({
      slug: String(c.slug || ""),
      tool_a: String(c.tool_a || ""),
      tool_b: String(c.tool_b || ""),
    }));

    const matchedAlts: { saas_name: string; saas_slug: string }[] = [];
    for (const alt of altsRes.data || []) {
      const list = (alt as any)?.content?.alternatives;
      if (Array.isArray(list)) {
        const hit = list.some(
          (item: any) =>
            String(item?.slug || "").toLowerCase() === normSlug ||
            String(item?.slug || "").toLowerCase() === compactSlug ||
            String(item?.name || "").toLowerCase() === rawName.toLowerCase()
        );
        if (hit && alt.saas_name && alt.saas_slug) {
          matchedAlts.push({ saas_name: String(alt.saas_name), saas_slug: String(alt.saas_slug) });
        }
      }
    }

    const moreArticles = (moreArtsRes.data || []).map((a: any) => ({
      slug: String(a.slug || ""),
      tool_name: String(a.tool_name || ""),
      title: String(a.title || ""),
    }));

    return {
      tool,
      comparisons,
      alternatives: matchedAlts.slice(0, 4),
      moreArticles,
    };
  } catch {
    return {};
  }
}

export default async function ArticleMuseumSinglePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const related = await getArticleRelatedData(article);
  const seoTitle = getArticleTitle(article);
  const seoDesc = getArticleDescription(article);
  const ogImageUrl = buildArticleOgImage(article, seoTitle, seoDesc);
  const combinedText = [
    article.mystery_intro,
    article.superpower,
    article.user_case,
    article.origin_story,
    article.why_care,
    article.hands_on_code,
  ]
    .filter(Boolean)
    .join(" ");
  const wordCount = combinedText.trim().split(/\s+/).filter(Boolean).length;

  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: seoTitle,
        description: seoDesc,
        image: ogImageUrl,
        datePublished: article.published_at,
        dateModified: article.published_at,
        wordCount,
        keywords: Array.isArray(article.tags) ? article.tags.join(", ") : undefined,
        author: {
          "@type": "Person",
          name: "Dinesh Regar",
          url: `${siteUrl}/about`,
          sameAs: [
            "https://github.com/Dineshwev",
            "https://x.com/TheCloudRain_",
          ],
        },
        publisher: {
          "@type": "Organization",
          name: "The Cloud Rain",
          url: siteUrl,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/icon.svg`,
          },
        },
        about: {
          "@type": "SoftwareApplication",
          name: article.tool_name || article.title,
          applicationCategory: related.tool?.category || "DeveloperApplication",
          ...(related.tool?.url ? { url: related.tool.url } : {}),
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${siteUrl}/article-museum/${article.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Deep Dives", item: `${siteUrl}/article-museum` },
          { "@type": "ListItem", position: 3, name: article.tool_name || article.title, item: `${siteUrl}/article-museum/${article.slug}` }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ArticleMuseumArticleClient article={article} related={related} />
    </>
  );
}
