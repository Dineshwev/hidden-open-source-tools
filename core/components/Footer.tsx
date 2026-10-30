import Link from "next/link";
import Logo from "./Logo";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/free-tools", label: "Explore Tools" },
  { href: "/alternatives", label: "Alternatives" },
  { href: "/vs", label: "Comparisons" },
  { href: "/article-museum", label: "Articles" },
  { href: "/weekly-roundups", label: "Weekly Roundups" },
  { href: "/upload", label: "Submit a Tool" }
];

const communityLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/general-queries", label: "General Queries" },
  { href: "/upload", label: "Submit a Tool" }
];

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/about#methodology", label: "Ranking Methodology" },
  { href: "/security", label: "Security & Trust" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/copyright", label: "Copyright" },
  { href: "/license", label: "License" },
  { href: "/contact", label: "Contact Support" },
  { href: "/dmca", label: "DMCA Claim" }
];

const seoLinks = [
  { href: "/free-tools", label: "Open-Source Tools Directory" },
  { href: "/alternatives", label: "SaaS Alternatives" },
  { href: "/vs", label: "Tool Comparisons" },
  { href: "/best-free-developer-tools", label: "Developer Tool Comparisons" },
  { href: "/article-museum", label: "Tool Deep Dives & Articles" }
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
            A curated directory of lightweight open-source tools, self-hosted software, and practical SaaS alternatives for developers and makers.
          </p>
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Curation Standard</p>
            <p className="mt-2 text-sm text-white/70">
              Every tool is evaluated for open-source license integrity, active maintenance, and transparent developer utility.
            </p>
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
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Explore</p>
          <ul className="flex flex-col gap-3">
            {seoLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-cyan-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Legal & Trust</p>
          <ul className="flex flex-col gap-3">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-cyan-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} The Cloud Rain. Handcrafted for open-source builders and indie hackers.
      </div>
    </footer>
  );
}
