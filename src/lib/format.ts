const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatIDR(n: number) {
  return IDR.format(n);
}

/** Plain "Rp 1.250.000" — no non-breaking space, safe for PDF fonts and CSV. */
export function formatIDRPlain(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.abs(n))}`;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateLong(d: Date) {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(d: Date) {
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short, human invoice number derived from a cuid + date, e.g. INV/2026/03/K7F2QX. */
export function invoiceNumber(prefix: "INV" | "ORD", id: string, date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${prefix}/${y}/${m}/${id.slice(-6).toUpperCase()}`;
}
