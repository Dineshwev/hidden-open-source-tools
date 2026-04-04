"use client";

import { useEffect, useRef, useState } from "react";

type AdBannerProps = {
  adKey: string;
  scriptSrc: string;
  width: number;
  height: number;
  className?: string;
};

type AdQueueWindow = Window & {
  __adBannerQueue?: Promise<void>;
};

export default function AdBanner({ adKey, scriptSrc, width, height, className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
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