"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddMenu } from "./add-menu";

const ITEMS = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/finance", label: "Bisnis" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur sm:hidden">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
              active ? "text-terracotta" : "text-charcoal/60"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <div className="-mt-8">
        <AddMenu variant="mobile" />
      </div>

      <Link
        href="/community"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
          pathname.startsWith("/community") || pathname.startsWith("/explore")
            ? "text-terracotta"
            : "text-charcoal/60"
        }`}
      >
        Komunitas
      </Link>
      <Link
        href="/orders"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
          pathname.startsWith("/orders") ? "text-terracotta" : "text-charcoal/60"
        }`}
      >
        Aktivitas
      </Link>
    </nav>
  );
}
