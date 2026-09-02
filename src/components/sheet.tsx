"use client";

import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 sm:flex sm:items-center sm:justify-center">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-charcoal/35 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[22px] border-t border-border bg-card pb-safe shadow-[0_-8px_40px_rgba(35,32,29,0.16)] sm:relative sm:inset-auto sm:w-[min(28rem,92vw)] sm:rounded-[18px] sm:border"
      >
        <div className="sticky top-0 z-10 rounded-t-[22px] bg-card px-5 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
          <h2 className="font-display text-xl text-charcoal">{title}</h2>
        </div>
        <div className="px-3 pb-5">{children}</div>
      </div>
    </div>
  );
}
