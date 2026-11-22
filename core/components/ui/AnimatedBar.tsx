"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedBar({
  pct,
  className,
}: {
  pct: number;
  className: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${className}`}
        style={{ width: `${visible ? clamped : 0}%` }}
      />
    </div>
  );
}
