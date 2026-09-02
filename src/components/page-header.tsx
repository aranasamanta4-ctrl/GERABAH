import Link from "next/link";
import { IconArrowLeft } from "./icons";

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-border/70 bg-cream/90 px-4 pb-3 pt-safe-header backdrop-blur-md sm:static sm:mx-0 sm:mb-6 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:backdrop-blur-none">
      <div className="flex items-start gap-3">
        {back && (
          <Link
            href={back}
            aria-label="Kembali"
            className="-ml-2 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal active:bg-sand"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[26px] leading-tight text-charcoal sm:text-[32px]">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 pt-0.5">{action}</div>}
      </div>
    </header>
  );
}
