"use client";

import { useEffect, useState } from "react";
import { getAdsterraSmartlinkUrl } from "@/lib/adsterra";
import { isMobileUserAgent } from "@/lib/utils/device";

type SponsorFallbackCardProps = {
  title?: string;
  description?: string;
  cta?: string;
  href?: string;
  className?: string;
  compact?: boolean;
  horizontal?: boolean;
};

export default function SponsorFallbackCard({
  title = "Sponsor Spotlight",
  description = "Ads are unavailable in this browser right now. You can still continue through a sponsor offer that opens in a new tab.",
  cta = "Open Sponsor Offer",
  href,
  className = "",
  compact = false,
  horizontal = false
}: SponsorFallbackCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileUserAgent(globalThis.navigator?.userAgent));
  }, []);

  const resolvedHref = href ?? (isMobile ? "" : getAdsterraSmartlinkUrl());
  const isExternal = /^https?:\/\//i.test(resolvedHref);

  return (
    <div
      className={`relative overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(8,8,8,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.45)] ${horizontal ? "rounded-[1.2rem] p-4" : "rounded-[1.75rem] p-5"} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className={`pointer-events-none absolute rounded-full bg-white/5 blur-3xl ${horizontal ? "-right-10 -top-10 h-24 w-24" : "-right-16 top-0 h-40 w-40"}`} />
      <div className={`relative ${horizontal ? "flex flex-col gap-3 md:flex-row md:items-center md:justify-between" : "flex flex-col gap-4"}`}>
        <div className={horizontal ? "min-w-0 flex-1" : "space-y-2"}>
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Advertisement</p>
          {title ? (
            <h3 className={`font-display font-bold text-white ${horizontal ? "mt-1 text-base md:text-lg" : compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
          ) : null}
          {description ? (
            <p className={`text-white/65 ${horizontal ? "mt-1 text-xs leading-relaxed md:text-sm" : "text-sm leading-relaxed"}`}>{description}</p>
          ) : null}
        </div>

        {resolvedHref ? (
          <a
            href={resolvedHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={`inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent font-semibold text-black transition hover:scale-[1.02] ${horizontal ? "w-full px-4 py-2 text-sm md:w-auto" : "w-fit px-5 py-3 text-sm"}`}
          >
            {cta}
          </a>
        ) : (
          <div className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 font-semibold text-white/45 ${horizontal ? "w-full px-4 py-2 text-sm md:w-auto" : "w-fit px-5 py-3 text-sm"}`}>
            {isMobile ? "Mobile ad experience active" : "Sponsor offer unavailable"}
          </div>
        )}
      </div>
    </div>
  );
}


