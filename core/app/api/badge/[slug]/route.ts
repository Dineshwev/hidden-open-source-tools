import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/backend_lib/supabase-server";

export const revalidate = 86400; // Cache badge for 24 hours

function formatStars(stars: unknown): string {
  const num = typeof stars === "number" ? stars : Number(stars);
  if (!num || isNaN(num) || num <= 0) return "OPEN SOURCE";
  if (num >= 1000) {
    return `⭐ ${(num / 1000).toFixed(1)}k`;
  }
  return `⭐ ${num}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  let rightText = "VERIFIED OPEN SOURCE";

  try {
    const supabase = getAdmin();
    const { data: tool } = await supabase
      .from("open_source_tools")
      .select("name, github_stars")
      .eq("slug", slug)
      .single();

    if (tool?.github_stars) {
      rightText = formatStars(tool.github_stars);
    }
  } catch {
    // Graceful fallback to default text
  }

  const leftText = "THE CLOUD RAIN";
  const leftWidth = 115;
  const rightWidth = Math.max(90, rightText.length * 8 + 16);
  const totalWidth = leftWidth + rightWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="24" viewBox="0 0 ${totalWidth} 24" role="img" aria-label="${leftText}: ${rightText}">
  <title>${leftText}: ${rightText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".15"/>
    <stop offset="1" stop-opacity=".15"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="24" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="24" fill="#111827"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="24" fill="#0891b2"/>
    <rect width="${totalWidth}" height="24" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" text-rendering="geometricPrecision" font-size="11" font-weight="600">
    <text aria-hidden="true" x="${leftWidth / 2}" y="16" fill="#010101" fill-opacity=".3">${leftText}</text>
    <text x="${leftWidth / 2}" y="15" fill="#f3f4f6">${leftText}</text>
    <text aria-hidden="true" x="${leftWidth + rightWidth / 2}" y="16" fill="#010101" fill-opacity=".3">${rightText}</text>
    <text x="${leftWidth + rightWidth / 2}" y="15" fill="#ffffff">${rightText}</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
