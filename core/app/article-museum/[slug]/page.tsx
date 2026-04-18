import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

export const revalidate = 3600;

async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getAdmin();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  return (article as Article | null) || null;
}

function getArticleDescription(article: Article) {
  return article.mystery_intro?.slice(0, 160) || "Deep dive into open source history.";
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
      type: "article"
    }
  };
}

export default async function ArticleMuseumSinglePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return <ArticleMuseumArticleClient article={article} />;
}
