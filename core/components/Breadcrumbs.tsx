import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Visible breadcrumb navigation trail.
 * Matches the JSON-LD BreadcrumbList schema already injected on each page.
 * The last item renders as plain text (current page).
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-white/50">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <span key={idx} className="inline-flex items-center gap-1">
            {idx > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-white/25" aria-hidden="true" />
            )}
            {isLast || !item.href ? (
              <span className="truncate max-w-[200px] text-white/70 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="truncate max-w-[200px] transition-colors hover:text-cyan-200"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
