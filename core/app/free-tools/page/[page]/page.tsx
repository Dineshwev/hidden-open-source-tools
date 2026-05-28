import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

type PageProps = {
  params: {
    page: string;
  };
};

export default async function FreeToolsPaginationPage({ params }: PageProps) {
  const page = Number(params.page);

  if (!Number.isFinite(page) || page < 2) {
    notFound();
  }

  notFound();
}
