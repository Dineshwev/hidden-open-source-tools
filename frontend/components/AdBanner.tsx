"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type AdBannerProps = {
  adKey?: string;
  scriptSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
  description?: string;
  cta?: string;
  href?: string;
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
  title = "Sponsored Lane",
  description = "A lightweight sponsor slot that keeps the page moving without blocking the user.",
  cta = "Open Offer",
  href = "/upload"
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!adKey || !scriptSrc || !width || !height) {
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
            inlineScript.text = `window.atOptions = { key: '${adKey}', format: 'iframe', height: ${height}, width: ${width}, params: {} };`;

            const externalScript = document.createElement("script");
            externalScript.type = "text/javascript";
            externalScript.async = true;
            externalScript.src = scriptSrc;

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
  }, [adKey, scriptSrc, width, height]);

  if (!adKey || !scriptSrc || !width || !height) {
    return (
      <div className={`flex w-full justify-center ${className}`}>
        <div className="relative w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10233b] to-[#14304d] p-5 shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-blue-300/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-100/70">Advertisement</p>
              <h3 className="mt-2 font-display text-xl font-bold text-white md:text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cyan-100/80">{description}</p>
            </div>
            <Link
              href={href}
              className="inline-flex items-center justify-center rounded-full border border-cyan-100/30 bg-cyan-100/90 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.02]"
            >
              {cta}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div className="relative flex w-full max-w-full flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/35">Advertisement</span>
        <div
          ref={containerRef}
          className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
          style={{ width: "100%", maxWidth: `${width}px`, minHeight: `${height}px` }}
        />
        {failed && (
          <p className="text-xs text-white/40">Ad unit did not render. Check publisher approval or browser blocking.</p>
        )}
      </div>
    </div>
  );
}