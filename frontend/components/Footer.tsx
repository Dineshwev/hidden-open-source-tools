import Link from "next/link";
import AdBanner from "./AdBanner";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/upload", label: "Upload" }
];

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/ads-disclosure", label: "Ads Disclosure" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/copyright", label: "Copyright" },
  { href: "/license", label: "License" },
  { href: "/contact", label: "Contact Support" },
  { href: "/dmca", label: "DMCA Claim" }
];

export default function Footer() {
  return (
    <footer className="relative z-20 mt-20 border-t border-white/10 bg-[#08182a]/90">
      <div className="px-4 pt-6 md:px-6">
        <div className="hidden md:block">
          <AdBanner
            width={468}
            height={60}
          />
        </div>
        <div className="md:hidden">
          <AdBanner
            width={320}
            height={50}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-5">
          <p className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-white">
            <span className="h-8 w-8 rounded-lg border border-white/20 bg-gradient-to-br from-cyan-300 to-blue-400" />
            The Cloud Rain
          </p>
          <p className="max-w-md text-sm leading-relaxed text-white/65">
            A sponsor-powered download platform built with clear disclosures, moderation controls, and legal pages that make the product feel like a real company.
          </p>
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Company Standard</p>
            <p className="mt-2 text-sm text-white/70">Every unlock flow is transparent, moderated, and designed to avoid unnecessary user frustration.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Platform</p>
          <ul className="flex flex-col gap-3">
            {mainLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-cyan-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Company & Legal</p>
          <ul className="flex flex-col gap-3">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-white/10 px-6 py-6 md:flex-row md:items-center">
        <p className="text-xs text-white/45">© {new Date().getFullYear()} The Cloud Rain. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">Fast Unlocks</span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">Verified Files</span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">Global Traffic</span>
        </div>
      </div>
    </footer>
  );
}
