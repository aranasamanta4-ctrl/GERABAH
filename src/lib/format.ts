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

/**
 * Short form for narrow stat tiles: "Rp 1,5 jt". Exact figures stay on the
 * detail and report screens — this is only so a number never outgrows its box.
 */
export function formatIDRCompact(n: number) {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);

  const trim = (value: number, unit: string) => {
    const rounded = Math.round(value * 10) / 10;
    const text = rounded % 1 === 0 ? String(rounded) : String(rounded).replace(".", ",");
    return `${sign}Rp ${text} ${unit}`;
  };

  if (abs < 10_000) return `${sign}Rp ${new Intl.NumberFormat("id-ID").format(Math.round(abs))}`;

  // Compare against the rounded value, so 999.999.999 becomes "Rp 1 M" rather
  // than rolling over into a nonsense "Rp 1000 jt".
  const ribu = abs / 1_000;
  if (ribu < 999.5) return `${sign}Rp ${Math.round(ribu)} rb`;

  const juta = abs / 1_000_000;
  if (juta < 999.95) return trim(juta, "jt");

  return trim(abs / 1_000_000_000, "M");
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
