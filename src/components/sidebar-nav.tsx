"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { AddMenu } from "./add-menu";
import { LogoutButton } from "./logout-button";
import { IconChart, IconHome, IconOrders, IconPot, IconSettings, IconUsers, IconWallet } from "./icons";

const ICONS: Record<string, (p: { className?: string }) => React.ReactElement> = {
  "/dashboard": IconHome,
  "/finance": IconWallet,
  "/sales": IconChart,
  "/orders": IconOrders,
  "/products": IconPot,
  "/customers": IconUsers,
  "/reports": IconChart,
};

export function SidebarNav({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6 sm:flex">
      <Link href="/dashboard" className="mb-0.5 flex items-baseline gap-2 px-2">
        <span className="font-display text-2xl leading-none text-charcoal">GERABAH</span>
      </Link>
      <p className="mb-6 truncate px-2 text-xs text-muted">{businessName}</p>

      <div className="mb-6 px-1">
        <AddMenu />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = ICONS[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-terracotta-soft text-terracotta" : "text-charcoal/75 hover:bg-sand"
              }`}
            >
              {Icon && <Icon className="h-[18px] w-[18px]" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-sand"
        >
          <IconSettings className="h-[18px] w-[18px]" />
          Pengaturan
        </Link>
        <LogoutButton className="rounded-xl px-3 py-2.5 text-left text-sm text-muted hover:bg-sand" />
      </div>
    </aside>
  );
}
