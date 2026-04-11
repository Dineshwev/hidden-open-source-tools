"use client";

import { useEffect, useRef, useState } from "react";
import { getAdsterraBannerKeyForSize, getAdsterraBannerScriptUrlForSize } from "@/lib/adsterra";
import SponsorFallbackCard from "@/components/SponsorFallbackCard";

type AdBannerProps = {
  adKey?: string;
  scriptSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
  description?: string;
};

type AdQueueWindow = Window & {
  __adBannerQueue?: Promise<void>;
};

export default function AdBanner({
  adKey,
  scriptSrc,
  width,
  height,
  className = "",
  title = "",
  description = ""
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const resolvedAdKey = adKey ?? getAdsterraBannerKeyForSize(width, height);
  const resolvedScriptSrc = scriptSrc ?? getAdsterraBannerScriptUrlForSize(width, height);
  const resolvedWidth = width;
  const resolvedHeight = height;
  const shouldRenderFallback = !mounted || !resolvedAdKey || !resolvedScriptSrc || !resolvedWidth || !resolvedHeight || failed;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !resolvedAdKey || !resolvedScriptSrc || !resolvedWidth || !resolvedHeight) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    let isActive = true;
    const queueWindow = window as AdQueueWindow;
    const previousQueue = queueWindow.__adBannerQueue ?? Promise.resolve();

    setFailed(false);
    container.innerHTML = "";

    queueWindow.__adBannerQueue = previousQueue
      .catch(() => undefined)
      .then(
        () =>
          new Promise<void>((resolve) => {
            if (!isActive || !container.isConnected) {
              resolve();
              return;
            }

            const inlineScript = document.createElement("script");
            inlineScript.type = "text/javascript";
            inlineScript.text = `window.atOptions = { key: '${resolvedAdKey}', format: 'iframe', height: ${resolvedHeight}, width: ${resolvedWidth}, params: {} };`;

            const externalScript = document.createElement("script");
            externalScript.type = "text/javascript";
            externalScript.async = true;
            externalScript.src = resolvedScriptSrc;

            externalScript.onload = () => {
              window.setTimeout(resolve, 0);
            };

            externalScript.onerror = () => {
              if (isActive) {
                setFailed(true);
              }
              resolve();
            };

            container.appendChild(inlineScript);
            container.appendChild(externalScript);

            window.setTimeout(() => {
              const hasRenderedFrame = container.querySelector("iframe") !== null || container.querySelector("img") !== null;

              if (isActive && !hasRenderedFrame) {
                setFailed(true);
              }
              resolve();
            }, 10000);
          })
      )
      .catch(() => undefined);

    return () => {
      isActive = false;
      container.innerHTML = "";
    };
  }, [mounted, resolvedAdKey, resolvedScriptSrc, resolvedWidth, resolvedHeight]);

  if (shouldRenderFallback) {
    return (
      <div className={`flex w-full justify-center ${className}`}>
        <SponsorFallbackCard
          title={title}
          description={failed ? "Banner unavailable in this browser. Continue with the sponsor offer instead." : description}
          cta="Open Sponsor"
          className="w-full max-w-full"
          compact={Boolean(resolvedWidth && resolvedWidth <= 320)}
          horizontal
        />
      </div>
    );
  }

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div className="relative flex w-full max-w-full flex-col items-center gap-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/20">Sponsored Content</span>
        <div
          ref={containerRef}
          className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
          style={{ width: "100%", maxWidth: `${resolvedWidth}px`, minHeight: `${resolvedHeight}px` }}
        />
      </div>
    </div>
  );
}
