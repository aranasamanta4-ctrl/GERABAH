import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { resolveRange, previousRange, daysFromNow } from "@/lib/date-range";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const RANGES: { key: string; label: string }[] = [
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "Minggu Ini" },
  { key: "month", label: "Bulan Ini" },
  { key: "year", label: "Tahun Ini" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const { from, to, label } = resolveRange(range);
  const prev = previousRange(from, to);

  const [sales, txs, prevTxs, orders, products] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
      include: { items: { include: { product: true } }, channel: true },
    }),
    prisma.financialTransaction.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
    }),
    prisma.financialTransaction.findMany({
      where: { businessId: business.id, date: { gte: prev.from, lte: prev.to } },
    }),
    prisma.order.findMany({
      where: { businessId: business.id },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.product.findMany({ where: { businessId: business.id } }),
  ]);

  const revenue = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const prevRevenue = prevTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const profit = revenue - expenses;
  const prevProfit = prevRevenue - prevExpenses;
  const cashFlow = revenue - expenses;

  const totalOrders = orders.length;
  const outstandingOrders = orders.filter((o) => o.remainingPayment > 0 && o.status !== "Cancelled");
  const outstandingAmount = outstandingOrders.reduce((s, o) => s + o.remainingPayment, 0);

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  const channelTotals = new Map<string, number>();
  for (const s of sales) {
    const name = s.channel?.name ?? "Lainnya";
    channelTotals.set(name, (channelTotals.get(name) ?? 0) + s.total);
  }
  const totalChannelSales = [...channelTotals.values()].reduce((a, b) => a + b, 0) || 1;

  const productTotals = new Map<string, { units: number; revenue: number }>();
  for (const s of sales) {
    for (const item of s.items) {
      const entry = productTotals.get(item.product.name) ?? { units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.lineTotal;
      productTotals.set(item.product.name, entry);
    }
  }
  const topProducts = [...productTotals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const dueSoonCutoff = daysFromNow(3);
  const dueSoonOrders = orders.filter(
    (o) => o.dueDate && o.status !== "Completed" && o.status !== "Cancelled" && o.dueDate <= dueSoonCutoff
  );

  const insights: string[] = [];
  const revenueDelta = pctChange(revenue, prevRevenue);
  if (prevRevenue > 0) {
    insights.push(
      `Pendapatan ${revenueDelta >= 0 ? "meningkat" : "menurun"} ${Math.abs(revenueDelta).toFixed(0)}% dibanding periode sebelumnya.`
    );
  }
  if (topProducts.length > 0) {
    insights.push(`${topProducts[0][0]} menghasilkan pendapatan tertinggi periode ini.`);
  }
  if (channelTotals.size > 0) {
    const [topChannel, amount] = [...channelTotals.entries()].sort((a, b) => b[1] - a[1])[0];
    insights.push(`${topChannel} menyumbang ${((amount / totalChannelSales) * 100).toFixed(0)}% dari total penjualan.`);
  }
  if (outstandingOrders.length > 0) {
    insights.push(`${outstandingOrders.length} pembayaran order belum lunas.`);
  }
  if (lowStock.length > 0) {
    insights.push(`${lowStock.map((p) => p.name).join(", ")} stoknya di bawah batas minimum.`);
  }

  const hasAnyData = sales.length > 0 || txs.length > 0 || orders.length > 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          Selamat datang, {business.name}
        </h1>
        <div className="flex gap-1 rounded-full border border-border bg-card p-1">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/dashboard?range=${r.key}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                (range ?? "month") === r.key ? "bg-terracotta text-white" : "text-charcoal/60 hover:bg-beige/60"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {!hasAnyData ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">Belum ada data. Catat penjualan pertamamu.</p>
          <Link
            href="/sales/new"
            className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            + Tambah Penjualan
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-charcoal/40">Periode: {label}</p>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pendapatan", value: revenue, delta: revenueDelta, color: "text-sage" },
              { label: "Pengeluaran", value: expenses, delta: pctChange(expenses, prevExpenses), color: "text-terracotta" },
              { label: "Laba", value: profit, delta: pctChange(profit, prevProfit), color: "text-charcoal" },
              { label: "Arus Kas", value: cashFlow, delta: null, color: "text-charcoal" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-charcoal/50">{k.label}</p>
                <p className={`mt-1 text-lg font-semibold ${k.color}`}>{formatIDR(k.value)}</p>
                {k.delta !== null && (
                  <p className={`text-[11px] ${k.delta >= 0 ? "text-sage" : "text-red-500"}`}>
                    {k.delta >= 0 ? "▲" : "▼"} {Math.abs(k.delta).toFixed(0)}% vs periode lalu
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <Link href="/orders" className="rounded-xl border border-border bg-card p-4 hover:bg-beige/30">
              <p className="text-xs text-charcoal/50">Total Pesanan</p>
              <p className="text-lg font-semibold text-charcoal">{totalOrders}</p>
            </Link>
            <Link href="/orders?filter=unpaid" className="rounded-xl border border-border bg-card p-4 hover:bg-beige/30">
              <p className="text-xs text-charcoal/50">Tagihan Belum Lunas</p>
              <p className="text-lg font-semibold text-terracotta">{formatIDR(outstandingAmount)}</p>
            </Link>
            <Link href="/products" className="rounded-xl border border-border bg-card p-4 hover:bg-beige/30">
              <p className="text-xs text-charcoal/50">Stok Menipis</p>
              <p className="text-lg font-semibold text-amber-600">{lowStock.length} produk</p>
            </Link>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-medium text-charcoal">Penjualan per Channel</h2>
              {channelTotals.size === 0 ? (
                <p className="text-sm text-charcoal/40">Belum ada data.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...channelTotals.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, amount]) => (
                      <div key={name}>
                        <div className="mb-1 flex justify-between text-xs text-charcoal/60">
                          <span>{name}</span>
                          <span>{formatIDR(amount)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-beige">
                          <div
                            className="h-full rounded-full bg-terracotta"
                            style={{ width: `${(amount / totalChannelSales) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-medium text-charcoal">Produk Terlaris</h2>
              {topProducts.length === 0 ? (
                <p className="text-sm text-charcoal/40">Belum ada data.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {topProducts.map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-charcoal/70">{name}</span>
                      <span className="text-charcoal">
                        {data.units} unit · {formatIDR(data.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {dueSoonOrders.length > 0 && (
            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-medium text-charcoal">Pesanan Belum Lunas</h2>
              <div className="flex flex-col gap-2">
                {dueSoonOrders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between text-sm hover:text-terracotta"
                  >
                    <span className="text-charcoal/70">
                      {o.customer?.name ?? "Tanpa nama"} · {o.items.map((i) => i.product.name).join(", ")}
                    </span>
                    <span className="text-charcoal">
                      {formatIDR(o.remainingPayment)} · {o.dueDate?.toLocaleDateString("id-ID")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {insights.length > 0 && (
            <div className="rounded-xl border border-border bg-beige/30 p-4">
              <h2 className="mb-3 text-sm font-medium text-charcoal">Insight Bisnis</h2>
              <ul className="flex flex-col gap-2">
                {insights.map((text, i) => (
                  <li key={i} className="flex gap-2 text-sm text-charcoal/70">
                    <span className="text-terracotta">•</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
