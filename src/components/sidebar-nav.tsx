"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { AddMenu } from "./add-menu";
import { LogoutButton } from "./logout-button";

export function SidebarNav({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card px-4 py-6 sm:flex">
      <Link href="/dashboard" className="mb-1 font-serif text-lg font-semibold text-charcoal">
        GERABAH
      </Link>
      <p className="mb-6 truncate text-xs text-charcoal/50">{businessName}</p>

      <div className="mb-6">
        <AddMenu variant="sidebar" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-terracotta/10 text-terracotta"
                  : "text-charcoal/70 hover:bg-beige/60 hover:text-charcoal"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        <Link
          href="/settings"
          className="rounded-lg px-3 py-2 text-sm text-charcoal/60 hover:bg-beige/60"
        >
          Pengaturan
        </Link>
        <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm text-charcoal/60 hover:bg-beige/60" />
      </div>
    </aside>
  );
}
