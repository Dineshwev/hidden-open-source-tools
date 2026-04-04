import Link from "next/link";
import AdNativeBanner from "./AdNativeBanner";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/upload", label: "Upload" },
  { href: "/admin", label: "Admin" }
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact Support" },
  { href: "/dmca", label: "DMCA Claim" }
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#030712] relative z-20">
      
      {/* High Visibility Ad Slot Above Footer Core */}
      <AdNativeBanner />

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between">
        <div className="space-y-4 max-w-sm">
          <p className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-glow-sm" /> 
            Portfolio Universe
          </p>
          <p className="text-sm leading-relaxed text-white/50 font-light">
            An industry-leading mystery-powered digital asset economy. 
            Built for enterprise-grade asset discovery, verified by the community.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">Platform</p>
            <ul className="flex flex-col gap-3">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-cyan-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">Legal</p>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/5 mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between">
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Portfolio Universe. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0 opacity-40">
           {/* Placeholder Social Icons */}
           <div className="w-5 h-5 rounded-full bg-white/50" />
           <div className="w-5 h-5 rounded-full bg-white/50" />
           <div className="w-5 h-5 rounded-full bg-white/50" />
        </div>
      </div>
    </footer>
  );
}
