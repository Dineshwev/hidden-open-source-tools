import { NextResponse } from "next/server";

export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(request.url);
  const label = searchParams.get("label") || "FEATURED ON";
  const rightText = searchParams.get("text") || "The Cloud Rain ★ Verified OSS";

  const safeLeft = escapeXml(label.slice(0, 24));
  const safeRight = escapeXml(rightText.slice(0, 38));

  const leftWidth = Math.max(88, safeLeft.length * 7 + 22);
  const rightWidth = Math.max(156, safeRight.length * 6.5 + 24);
  const totalWidth = Math.round(leftWidth + rightWidth);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" viewBox="0 0 ${totalWidth} 28" role="img" aria-label="${safeLeft}: ${safeRight}">
  <title>${safeLeft}: ${safeRight} (${escapeXml(params.slug || "")})</title>
  <defs>
    <linearGradient id="bgLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="bgRight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#083344"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${totalWidth}" height="28" rx="6" fill="url(#bgLeft)"/>
  <path d="M${leftWidth} 0 H${totalWidth - 6} A6 6 0 0 1 ${totalWidth} 6 V22 A6 6 0 0 1 ${totalWidth - 6} 28 H${leftWidth} Z" fill="url(#bgRight)"/>
  <rect x="0.5" y="0.5" width="${totalWidth - 1}" height="27" rx="5.5" fill="none" stroke="#22d3ee" stroke-opacity="0.35"/>
  <line x1="${leftWidth}" y1="0" x2="${leftWidth}" y2="28" stroke="#22d3ee" stroke-opacity="0.25"/>
  <g font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" text-anchor="middle">
    <text x="${Math.round(leftWidth / 2)}" y="18" fill="#94a3b8" font-weight="600" letter-spacing="0.6">${safeLeft}</text>
    <text x="${Math.round(leftWidth + rightWidth / 2)}" y="18" fill="#67e8f9" font-weight="700" letter-spacing="0.2">${safeRight}</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
