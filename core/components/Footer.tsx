import Link from "next/link";
import Logo from "./Logo";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/upload", label: "Upload" }
];

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/security", label: "Security & Trust" },
  { href: "/ads-disclosure", label: "Ads Disclosure" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/copyright", label: "Copyright" },
  { href: "/license", label: "License" },
  { href: "/contact", label: "Contact Support" },
  { href: "/dmca", label: "DMCA Claim" }
];

const seoLinks = [
  { href: "/best-free-developer-tools", label: "Best Free Developer Tools" },
  { href: "/weekly-roundups", label: "Weekly Roundups" },
  { href: "/open-source-software", label: "Open Source Software" },
  { href: "/hidden-tools", label: "Hidden Tools" },
  { href: "/free-tools", label: "Free Tools" }
];

const socialLinks = [
  { href: "https://github.com/dineshwev", label: "GitHub" },
  { href: "https://x.com/TheCloudRain_", label: "X" }
];

export default function Footer() {
  return (
    <footer className="relative z-20 mt-20 border-t border-white/10 bg-[#070707]/95">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <p className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-white">
            <Logo size={32} />
            The Cloud Rain
          </p>
          <p className="max-w-md text-sm leading-relaxed text-white/65">
            A free download platform built with clear disclosures, moderation controls, and legal pages that make the product feel like a real company.
          </p>
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Company Standard</p>
            <p className="mt-2 text-sm text-white/70">Every unlock flow is transparent, moderated, and designed to avoid unnecessary user frustration.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
              >
                {link.label}
              </a>
            ))}
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
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Contact Us
          </Link>
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

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Popular Searches</p>
          <ul className="flex flex-col gap-3">
            {seoLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-emerald-200">
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


