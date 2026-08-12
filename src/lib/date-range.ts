export type RangeKey = "today" | "week" | "month" | "year";

export function resolveRange(key: string | undefined): { from: Date; to: Date; label: string } {
  const now = new Date();
  const to = now;

  if (key === "today") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from, to, label: "Hari Ini" };
  }
  if (key === "week") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return { from, to, label: "Minggu Ini" };
  }
  if (key === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from, to, label: "Tahun Ini" };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from, to, label: "Bulan Ini" };
}

export function previousRange(from: Date, to: Date): { from: Date; to: Date } {
  const span = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - span), to: new Date(from.getTime()) };
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
