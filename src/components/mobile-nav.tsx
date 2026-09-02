"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADD_ACTIONS, MORE_ITEMS } from "./nav-items";
import { Sheet } from "./sheet";
import { IconChart, IconChevronRight, IconGrid, IconHome, IconPlus, IconWallet } from "./icons";

const TABS = [
  { href: "/dashboard", label: "Beranda", Icon: IconHome },
  { href: "/finance", label: "Keuangan", Icon: IconWallet },
  { href: "/reports", label: "Laporan", Icon: IconChart },
];

export function MobileNav() {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<"add" | "more" | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = MORE_ITEMS.some((i) => isActive(i.href));

  const tabClass = (active: boolean) =>
    `flex h-full w-16 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
      active ? "text-terracotta" : "text-muted"
    }`;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur-md sm:hidden">
        <div className="mx-auto flex h-[60px] max-w-md items-stretch justify-between px-3">
          {TABS.slice(0, 2).map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={tabClass(isActive(href))}>
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive(href) ? 1.9 : 1.6} />
              {label}
            </Link>
          ))}

          <button
            onClick={() => setSheet("add")}
            aria-label="Catat transaksi"
            className="relative -top-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-terracotta text-white shadow-[0_6px_18px_rgba(189,91,56,0.42)] active:bg-terracotta-dark"
          >
            <IconPlus className="h-7 w-7" strokeWidth={2} />
          </button>

          {TABS.slice(2).map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={tabClass(isActive(href))}>
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive(href) ? 1.9 : 1.6} />
              {label}
            </Link>
          ))}

          <button onClick={() => setSheet("more")} className={tabClass(moreActive)}>
            <IconGrid className="h-[22px] w-[22px]" strokeWidth={moreActive ? 1.9 : 1.6} />
            Lainnya
          </button>
        </div>
      </nav>

      <Sheet open={sheet === "add"} onClose={() => setSheet(null)} title="Mau catat apa?">
        <div className="flex flex-col">
          {ADD_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={() => setSheet(null)}
              className="flex items-center gap-3 rounded-xl px-2 py-3 active:bg-sand"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
                <IconPlus className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-charcoal">{a.label}</span>
                <span className="block truncate text-xs text-muted">{a.hint}</span>
              </span>
              <IconChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "more"} onClose={() => setSheet(null)} title="Menu lainnya">
        <div className="flex flex-col">
          {MORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSheet(null)}
              className="flex items-center gap-3 rounded-xl px-2 py-3 active:bg-sand"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-charcoal">{item.label}</span>
                <span className="block truncate text-xs text-muted">{item.desc}</span>
              </span>
              <IconChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      </Sheet>
    </>
  );
}
