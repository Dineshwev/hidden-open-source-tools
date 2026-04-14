import { Metadata } from "next";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = getAdmin();
  const { data: article } = await supabase
    .from("articles")
    .select("title, mystery_intro, published_at, tags")
    .eq("slug", params.slug)
    .single();

  if (!article) {
    return {
      title: "Article Not Found | The Cloud Rain"
    };
  }

  const description = article.mystery_intro ? article.mystery_intro.substring(0, 160) : "Deep dive into open source history.";

  return {
    title: `${article.title} | Article Museum`,
    description: description,
    openGraph: {
      title: `${article.title} | The Cloud Rain`,
      description: description,
      type: "article",
      publishedTime: article.published_at,
      tags: article.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description,
    }
  };
}

export default function ArticleMuseumSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
