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

const siteUrl = "https://thecloudrain.site";
const fallbackOgImage = `${siteUrl}/thumb1.svg`;

export const revalidate = 86400;

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

function getArticleDescription(article: Article) {
  return article.mystery_intro?.slice(0, 160) || "Deep dive into open source history.";
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
      title: "Article Not Found | The Cloud Rain",
      alternates: {
        canonical: canonicalUrl
      }
    };
  }

  const description = getArticleDescription(article);
  const imageUrl = article.image_url || fallbackOgImage;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: article.title,
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
      title: article.title,
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
