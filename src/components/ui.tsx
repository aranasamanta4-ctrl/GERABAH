import Link from "next/link";
import { IconChevronRight } from "./icons";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">{children}</h2>
      {action}
    </div>
  );
}

const TONE = {
  neutral: "text-charcoal",
  positive: "text-sage",
  negative: "text-terracotta",
  warning: "text-amber",
} as const;

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof TONE;
  href?: string;
}) {
  const inner = (
    <>
      <p className="label">{label}</p>
      <p className={`tnum mt-1.5 text-[19px] font-bold leading-tight ${TONE[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card p-3.5 active:bg-sand">
      {inner}
    </Link>
  ) : (
    <div className="card p-3.5">{inner}</div>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-[14px] border border-dashed border-border bg-card px-6 py-10 text-center">
      <p className="font-display text-xl text-charcoal">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">{body}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

const PILL = {
  positive: "bg-sage-soft text-sage",
  negative: "bg-rose-soft text-rose",
  warning: "bg-amber-soft text-amber",
  neutral: "bg-sand text-muted",
} as const;

export function Pill({ tone, children }: { tone: keyof typeof PILL; children: React.ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${PILL[tone]}`}>
      {children}
    </span>
  );
}

/** A tappable list row: primary line, supporting line, right-aligned amount. */
export function Row({
  href,
  title,
  meta,
  amount,
  amountTone = "neutral",
  trailing,
}: {
  href?: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  amount?: string;
  amountTone?: keyof typeof TONE;
  trailing?: React.ReactNode;
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-charcoal">{title}</p>
        {meta && <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>}
      </div>
      {amount && <p className={`tnum shrink-0 text-[15px] font-semibold ${TONE[amountTone]}`}>{amount}</p>}
      {trailing}
      {href && <IconChevronRight className="h-4 w-4 shrink-0 text-border" />}
    </>
  );

  const cls = "flex items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0";
  return href ? (
    <Link href={href} className={`${cls} active:bg-sand`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function List({ children }: { children: React.ReactNode }) {
  return <div className="card overflow-hidden p-0">{children}</div>;
}

/** Short plain-language note — the training programme leans on these. */
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[14px] bg-sand px-4 py-3 text-[13px] leading-relaxed text-clay">{children}</p>
  );
}
