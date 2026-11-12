import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import ArticleMuseumArticleClient from "@/components/article-museum/ArticleMuseumArticleClient";

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

const siteUrl = getSiteUrl();
const fallbackOgImage = `${siteUrl}/thumb1.svg`;

export const dynamic = 'force-static';
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
  const imageUrl = article.image_url || fallbackOgImage;

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
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630
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

export default async function ArticleMuseumSinglePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.mystery_intro,
        image: article.image_url || fallbackOgImage,
        datePublished: article.published_at,
        author: {
          "@type": "Organization",
          name: "The Cloud Rain"
        },
        mainEntityOfPage: `${siteUrl}/article-museum/${article.slug}`
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Articles", item: `${siteUrl}/article-museum` },
          { "@type": "ListItem", position: 3, name: article.tool_name || article.title, item: `${siteUrl}/article-museum/${article.slug}` }
        ]
      }
    ]
  };

  return (
    <>
      <Script
        id={`article-json-ld-${article.slug}`}
        strategy="beforeInteractive"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ArticleMuseumArticleClient article={article} />
    </>
  );
}
