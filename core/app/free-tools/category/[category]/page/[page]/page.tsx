import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FreeToolsPageClient from "@/app/free-tools/FreeToolsPageClient";
import { buildFreeToolsRoute, getCategoryPageBySlug, getFreeToolsPageData } from "@/app/free-tools/free-tools-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

type PageProps = {
  params: {
    category: string;
    page: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoryPage = getCategoryPageBySlug(params.category);
  const page = Number(params.page);

  if (!categoryPage || !Number.isFinite(page) || page < 2) {
    return {};
  }

  const title = `${categoryPage.title} - Page ${page} | The Cloud Rain`;
  const description = `${categoryPage.description} Browse page ${page} of this category directory.`;

  return {
    title,
    description,
    alternates: {
      canonical: buildFreeToolsRoute(categoryPage.slug, page)
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${buildFreeToolsRoute(categoryPage.slug, page)}`
    }
  };
}

export default async function FreeToolsCategoryPaginationPage({ params }: PageProps) {
  const categoryPage = getCategoryPageBySlug(params.category);
  const page = Number(params.page);

  if (!categoryPage || !Number.isFinite(page) || page < 2) {
    notFound();
  }

  const { initialTools, initialCount, initialTotalPages, currentPage } = await getFreeToolsPageData({
    page,
    category: categoryPage.category
  });

  if (currentPage > initialTotalPages) {
    notFound();
  }

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialCount}
      initialTotalPages={initialTotalPages}
      initialPage={currentPage}
      initialCategory={categoryPage.category}
    />
  );
}
