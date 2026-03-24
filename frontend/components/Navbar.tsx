"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, LayoutDashboard, LockKeyhole, ShieldCheck, Upload } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/mystery-box", label: "Mystery Box", icon: Box },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/login", label: "Login", icon: LockKeyhole }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-void/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-wide text-gradient">
          Portfolio Universe
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-nebula-500 text-white shadow-glow"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
