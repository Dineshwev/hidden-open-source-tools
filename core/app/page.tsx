import { getSiteUrl } from "@/lib/site-url";
import { getApprovedSuccessToolCount } from "@/lib/tool-count";
import type { Metadata } from "next";
import HomeMobileLanding from "@/components/home/HomeMobileLanding";
import HomeDesktopLanding from "@/components/home/HomeDesktopLanding";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const title = "Open-Source Tools and Comparisons | The Cloud Rain";
  const description = `Explore ${toolCount}+ open-source tools and developer resources. Compare projects and read practical guides to help evaluate software for your workflow.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "The Cloud Rain",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default function HomePage() {
  return (
    <div>
      <div className="block lg:hidden">
        <HomeMobileLanding />
      </div>
      <div className="hidden lg:block">
        <HomeDesktopLanding />
      </div>
    </div>
  );
}
