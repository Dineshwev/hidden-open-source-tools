"use client";

import { getAdsterraSmartlinkUrl } from "@/lib/adsterra";

type AdSmartlinkSlotProps = {
  title?: string;
  description?: string;
  cta?: string;
  href?: string;
  compact?: boolean;
};

export default function AdSmartlinkSlot({
  title = "Featured Spotlight",
  description = "Explore curated updates and keep discovering new resources.",
  cta = "Explore Now",
  href,
  compact = false
}: AdSmartlinkSlotProps) {
  const resolvedHref = href ?? getAdsterraSmartlinkUrl();
  const isExternal = /^https?:\/\//i.test(resolvedHref);

  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-gradient-to-r from-[#0f2a44] to-[#12324f] p-5 md:p-7">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-blue-300/20 blur-3xl" />

      <div className={`relative flex ${compact ? "flex-col gap-4 md:flex-row md:items-center md:justify-between" : "flex-col gap-5 md:flex-row md:items-end md:justify-between"}`}>
        <div className={compact ? "max-w-2xl" : "max-w-3xl"}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/85">Platform Highlight</p>
          <h3 className={`mt-2 font-display text-white ${compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"}`}>{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-cyan-100/80">{description}</p>
        </div>

        {resolvedHref ? (
          <a
            href={resolvedHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center rounded-full border border-cyan-100/30 bg-cyan-100/90 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.02]"
          >
            {cta}
          </a>
        ) : (
          <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/45">
            Smartlink pending
          </div>
        )}
      </div>
    </section>
  );
}