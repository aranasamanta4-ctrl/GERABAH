import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { resolveRange, previousRange } from "@/lib/date-range";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const PERIODS = [
  { key: "week", label: "Mingguan" },
  { key: "month", label: "Bulanan" },
  { key: "year", label: "Tahunan" },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const periodKey = period === "week" || period === "year" ? period : "month";
  const business = await getCurrentBusiness();
  if (!business) return null;

  const { from, to } = resolveRange(periodKey);
  const prev = previousRange(from, to);

  const [sales, txs, prevTxs, orders, prevOrders, customers, prevCustomers] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
      include: { items: { include: { product: true } }, channel: true },
    }),
    prisma.financialTransaction.findMany({ where: { businessId: business.id, date: { gte: from, lte: to } } }),
    prisma.financialTransaction.findMany({ where: { businessId: business.id, date: { gte: prev.from, lte: prev.to } } }),
    prisma.order.findMany({ where: { businessId: business.id, date: { gte: from, lte: to } } }),
    prisma.order.findMany({ where: { businessId: business.id, date: { gte: prev.from, lte: prev.to } } }),
    prisma.customer.count({ where: { businessId: business.id, createdAt: { gte: from, lte: to } } }),
    prisma.customer.count({ where: { businessId: business.id, createdAt: { gte: prev.from, lte: prev.to } } }),
  ]);

  const revenue = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const prevRevenue = prevTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const profit = revenue - expenses;
  const prevProfit = prevRevenue - prevExpenses;

  const unitsSold = sales.reduce((s, sale) => s + sale.items.reduce((u, i) => u + i.quantity, 0), 0);
  const outstanding = sales.reduce((s, sale) => s + sale.outstandingBalance, 0);

  const channelTotals = new Map<string, number>();
  for (const s of sales) {
    const name = s.channel?.name ?? "Lainnya";
    channelTotals.set(name, (channelTotals.get(name) ?? 0) + s.total);
  }

  const productTotals = new Map<string, number>();
  for (const s of sales) {
    for (const item of s.items) {
      productTotals.set(item.product.name, (productTotals.get(item.product.name) ?? 0) + item.lineTotal);
    }
  }
  const topProducts = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Laporan</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <Link
                key={p.key}
                href={`/reports?period=${p.key}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  periodKey === p.key ? "bg-terracotta text-white" : "text-charcoal/60 hover:bg-beige/60"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
          <a
            href={`/api/reports/export?period=${periodKey}`}
            className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-charcoal hover:bg-beige/50"
          >
            Unduh CSV
          </a>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-charcoal/50">Pendapatan</p>
          <p className="text-lg font-semibold text-sage">{formatIDR(revenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-charcoal/50">Pengeluaran</p>
          <p className="text-lg font-semibold text-terracotta">{formatIDR(expenses)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-charcoal/50">Laba</p>
          <p className="text-lg font-semibold text-charcoal">{formatIDR(profit)}</p>
          {prevProfit !== 0 && (
            <p className={`text-[11px] ${profit >= prevProfit ? "text-sage" : "text-red-500"}`}>
              {pctChange(profit, prevProfit) >= 0 ? "▲" : "▼"} {Math.abs(pctChange(profit, prevProfit)).toFixed(0)}%
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-charcoal/50">Pesanan</p>
          <p className="text-lg font-semibold text-charcoal">{orders.length}</p>
          <p className="text-[11px] text-charcoal/40">
            {pctChange(orders.length, prevOrders.length).toFixed(0)}% vs periode lalu
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-beige/40 p-4">
          <p className="text-xs text-charcoal/50">Unit Terjual</p>
          <p className="text-lg font-semibold text-charcoal">{unitsSold}</p>
        </div>
        <div className="rounded-xl bg-beige/40 p-4">
          <p className="text-xs text-charcoal/50">Tagihan Belum Lunas</p>
          <p className="text-lg font-semibold text-terracotta">{formatIDR(outstanding)}</p>
        </div>
        <div className="rounded-xl bg-beige/40 p-4">
          <p className="text-xs text-charcoal/50">Pelanggan Baru</p>
          <p className="text-lg font-semibold text-charcoal">{customers}</p>
          <p className="text-[11px] text-charcoal/40">
            {pctChange(customers, prevCustomers).toFixed(0)}% vs periode lalu
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-charcoal">Channel Penjualan</h2>
          {channelTotals.size === 0 ? (
            <p className="text-sm text-charcoal/40">Belum cukup data untuk periode ini.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...channelTotals.entries()].map(([name, amount]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-charcoal/70">{name}</span>
                  <span className="text-charcoal">{formatIDR(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-charcoal">Produk Terlaris</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-charcoal/40">Belum cukup data untuk periode ini.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topProducts.map(([name, amount]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-charcoal/70">{name}</span>
                  <span className="text-charcoal">{formatIDR(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
