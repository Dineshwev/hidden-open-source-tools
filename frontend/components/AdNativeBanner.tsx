"use client";
import { useEffect, useRef, useState } from "react";

const CONTAINER_ID = "container-5a4d086b51b32fe710349dc77b6dc6d9";
const NATIVE_SCRIPT_SRC = "https://pl29057276.profitablecpmratenetwork.com/5a4d086b51b32fe710349dc77b6dc6d9/invoke.js";
const SPONSOR_LINK = "https://www.profitablecpmratenetwork.com/eyxbqyzk?key=dc62ef4d3d7d7672be4a64e11612ea8c";

export default function AdNativeBanner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;

    if (!wrapper || !container) {
      return;
    }

    setShowFallback(false);
    container.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = NATIVE_SCRIPT_SRC;

    script.onerror = () => {
      setShowFallback(true);
    };

    wrapper.appendChild(script);

    const checkTimer = window.setTimeout(() => {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      const hasRenderedAd = container.childElementCount > 0 || (container.textContent || "").trim().length > 0;

      if (isLocalhost || !hasRenderedAd) {
        setShowFallback(true);
      }
    }, 6000);

    return () => {
      window.clearTimeout(checkTimer);
      script.remove();
    };
  }, []);

  return (
    <div className="w-full flex justify-center py-6 border-y border-white/5 bg-void/50 my-8">
      <div ref={wrapperRef} className="max-w-[728px] min-h-[90px] w-full relative">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[150%] text-[10px] text-white/30 tracking-widest uppercase">Advertisement</span>
        <div id={CONTAINER_ID} ref={containerRef} />

        {showFallback && (
          <a
            href={SPONSOR_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-center text-sm text-cyan-100 hover:bg-cyan-300/15"
          >
            Sponsor Spotlight: Open partner offer
            <span className="block mt-1 text-[11px] text-cyan-100/70">Localhost/ad blockers may hide network banners.</span>
          </a>
        )}
      </div>
    </div>
  );
}
