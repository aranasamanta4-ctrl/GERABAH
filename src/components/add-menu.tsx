"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ADD_ACTIONS } from "./nav-items";

export function AddMenu({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
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
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "sidebar"
            ? "flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
            : "flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-2xl text-white shadow-lg"
        }
        aria-label="Tambah"
      >
        + {variant === "sidebar" && "Tambah"}
      </button>
      {open && (
        <div
          className={
            variant === "sidebar"
              ? "absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg"
              : "absolute bottom-full left-1/2 z-20 mb-3 w-44 -translate-x-1/2 rounded-xl border border-border bg-card p-1 shadow-lg"
          }
        >
          {ADD_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-beige/60"
            >
              + {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
