"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ADD_ACTIONS } from "./nav-items";
import { IconPlus } from "./icons";

export function AddMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="btn btn-primary w-full">
        <IconPlus className="h-4 w-4" strokeWidth={2.2} />
        Catat
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-border bg-card p-1.5 shadow-[0_12px_32px_rgba(35,32,29,0.12)]">
          {ADD_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 hover:bg-sand"
            >
              <span className="block text-sm font-semibold text-charcoal">{a.label}</span>
              <span className="block truncate text-xs text-muted">{a.hint}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
