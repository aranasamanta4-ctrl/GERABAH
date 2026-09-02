import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center px-5 pb-10 pt-safe">
      <div className="mx-auto w-full max-w-sm py-10">
        <Link href="/" className="mb-8 block text-center font-display text-3xl leading-none text-charcoal">
          GERABAH
        </Link>
        <div className="card p-6">
          <h1 className="font-display text-[26px] leading-tight text-charcoal">{title}</h1>
          {subtitle && <p className="mb-5 mt-1 text-[13px] leading-relaxed text-muted">{subtitle}</p>}
          <div className={subtitle ? "" : "mt-5"}>{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-[14px] text-muted">{footer}</div>}
      </div>
    </div>
  );
}
