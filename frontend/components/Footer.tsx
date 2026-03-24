import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/upload", label: "Upload" },
  { href: "/admin", label: "Admin" }
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-gradient">Portfolio Universe</p>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            A futuristic community platform for mystery downloads, creator uploads, and moderation-first discovery.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
