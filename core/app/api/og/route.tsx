import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "The Cloud Rain";
    const subtitle = searchParams.get("subtitle") || "Curated Directory of Open Source SaaS Alternatives & Self-Hosted Software";
    const badge = searchParams.get("badge") || "VERIFIED OPEN SOURCE";
    const category = searchParams.get("category") || "Open Source";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#050811",
            padding: "60px 70px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-150px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(5, 8, 17, 0) 70%)",
            }}
          />

          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#22d3ee",
                }}
              />
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: "#f8fafc",
                }}
              >
                THE CLOUD RAIN
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "rgba(34, 211, 238, 0.12)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#67e8f9",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {category}
              </span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "1050px",
            }}
          >
            <div
              style={{
                fontSize: title.length > 45 ? "50px" : "62px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.65)",
                lineHeight: 1.4,
                maxWidth: "920px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom Trust & Feature Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#34d399", fontSize: "16px" }}>✓</span>
                <span style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
                  {badge}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#38bdf8", fontSize: "16px" }}>✓</span>
                <span style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
                  Self-Hostable
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#fbbf24", fontSize: "16px" }}>✓</span>
                <span style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
                  $0 Subscriptions
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#22d3ee",
              }}
            >
              thecloudrain.org
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
