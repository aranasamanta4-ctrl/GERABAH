import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { resolveRange, previousRange, daysFromNow } from "@/lib/date-range";
import { formatIDR, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, EmptyState, List, Row, SectionTitle, Stat, Tip } from "@/components/ui";
import { IconArrowDown, IconArrowUp } from "@/components/icons";

const RANGES = [
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "Minggu Ini" },
  { key: "month", label: "Bulan Ini" },
  { key: "year", label: "Tahun Ini" },
];

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const activeRange = range ?? "month";
  const { from, to, label } = resolveRange(activeRange);
  const prev = previousRange(from, to);

  const [sales, txs, prevTxs, orders, products] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
      include: { items: { include: { product: true } }, channel: true },
    }),
    prisma.financialTransaction.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
      orderBy: { date: "desc" },
      include: { incomeCategory: true, expenseCategory: true },
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

  const income = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  const outstandingOrders = orders.filter((o) => o.remainingPayment > 0 && o.status !== "Cancelled");
  const outstandingAmount = outstandingOrders.reduce((s, o) => s + o.remainingPayment, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  const channelTotals = new Map<string, number>();
  for (const s of sales) {
    const name = s.channel?.name ?? "Lainnya";
    channelTotals.set(name, (channelTotals.get(name) ?? 0) + s.total);
  }
  const channelTotal = [...channelTotals.values()].reduce((a, b) => a + b, 0) || 1;

  const productTotals = new Map<string, { units: number; revenue: number }>();
  for (const s of sales) {
    for (const item of s.items) {
      const e = productTotals.get(item.product.name) ?? { units: 0, revenue: 0 };
      e.units += item.quantity;
      e.revenue += item.lineTotal;
      productTotals.set(item.product.name, e);
    }
  }
  const topProducts = [...productTotals.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 4);

  const dueSoon = orders.filter(
    (o) => o.dueDate && o.status !== "Completed" && o.status !== "Cancelled" && o.dueDate <= daysFromNow(3)
  );

  const insights: string[] = [];
  if (prevIncome > 0) {
    const d = pctChange(income, prevIncome);
    insights.push(
      `Uang masuk ${d >= 0 ? "naik" : "turun"} ${Math.abs(d).toFixed(0)}% dibanding periode sebelumnya.`
    );
  }
  if (profit < 0) insights.push("Pengeluaran lebih besar dari pemasukan periode ini. Cek biaya produksi.");
  if (topProducts.length > 0) insights.push(`${topProducts[0][0]} paling banyak menghasilkan uang periode ini.`);
  if (channelTotals.size > 1) {
    const [name, amount] = [...channelTotals.entries()].sort((a, b) => b[1] - a[1])[0];
    insights.push(`${name} menyumbang ${((amount / channelTotal) * 100).toFixed(0)}% dari penjualan.`);
  }
  if (outstandingOrders.length > 0) insights.push(`${outstandingOrders.length} pesanan belum lunas.`);
  if (lowStock.length > 0) insights.push(`Stok menipis: ${lowStock.map((p) => p.name).join(", ")}.`);

  const hasData = sales.length > 0 || txs.length > 0 || orders.length > 0;

  return (
    <>
      <PageHeader title={business.name} subtitle={`Ringkasan ${label.toLowerCase()}`} />

      <div className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/dashboard?range=${r.key}`}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${
              activeRange === r.key
                ? "bg-charcoal text-cream"
                : "border border-border bg-card text-muted active:bg-sand"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {!hasData ? (
        <EmptyState
          title="Mulai dari satu catatan"
          body="Catat uang yang masuk dan keluar hari ini. Setelah beberapa catatan, untung rugi usaha akan terlihat sendiri di sini."
          actionLabel="Catat Uang Masuk"
          actionHref="/finance/new?type=INCOME"
        />
      ) : (
        <>
          {/* Profit leads — it is the number the training programme wants owners to read first. */}
          <Card className="mb-3">
            <p className="label">{profit >= 0 ? "Untung" : "Rugi"} {label.toLowerCase()}</p>
            <p
              className={`tnum mt-1 font-display text-[40px] leading-none ${
                profit >= 0 ? "text-charcoal" : "text-rose"
              }`}
            >
              {formatIDR(profit)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
                  <IconArrowDown className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="label block">Uang Masuk</span>
                  <span className="tnum block truncate text-[15px] font-bold text-sage">{formatIDR(income)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
                  <IconArrowUp className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="label block">Uang Keluar</span>
                  <span className="tnum block truncate text-[15px] font-bold text-terracotta">
                    {formatIDR(expense)}
                  </span>
                </span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Pesanan" value={String(orders.length)} href="/orders" />
            <Stat
              label="Belum Lunas"
              value={formatIDR(outstandingAmount)}
              tone={outstandingAmount > 0 ? "negative" : "neutral"}
              href="/orders"
            />
            <Stat
              label="Stok Menipis"
              value={`${lowStock.length}`}
              hint="produk"
              tone={lowStock.length > 0 ? "warning" : "neutral"}
              href="/products"
            />
          </div>

          {dueSoon.length > 0 && (
            <>
              <SectionTitle>Segera Jatuh Tempo</SectionTitle>
              <List>
                {dueSoon.slice(0, 4).map((o) => (
                  <Row
                    key={o.id}
                    href={`/orders/${o.id}`}
                    title={o.customer?.name ?? "Tanpa nama"}
                    meta={`${o.items.map((i) => i.product.name).join(", ")} · ${
                      o.dueDate ? formatDate(o.dueDate) : "-"
                    }`}
                    amount={formatIDR(o.remainingPayment)}
                    amountTone="negative"
                  />
                ))}
              </List>
            </>
          )}

          {topProducts.length > 0 && (
            <>
              <SectionTitle action={<Link href="/products" className="text-xs font-medium text-terracotta">Semua</Link>}>
                Produk Terlaris
              </SectionTitle>
              <List>
                {topProducts.map(([name, d]) => (
                  <Row key={name} title={name} meta={`${d.units} unit terjual`} amount={formatIDR(d.revenue)} />
                ))}
              </List>
            </>
          )}

          {channelTotals.size > 0 && (
            <>
              <SectionTitle>Penjualan per Tempat Jualan</SectionTitle>
              <Card>
                <div className="flex flex-col gap-3">
                  {[...channelTotals.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, amount]) => (
                      <div key={name}>
                        <div className="mb-1.5 flex justify-between text-[13px]">
                          <span className="text-charcoal">{name}</span>
                          <span className="tnum font-medium text-muted">{formatIDR(amount)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                          <div
                            className="h-full rounded-full bg-terracotta"
                            style={{ width: `${Math.max((amount / channelTotal) * 100, 3)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </>
          )}

          {txs.length > 0 && (
            <>
              <SectionTitle action={<Link href="/finance" className="text-xs font-medium text-terracotta">Semua</Link>}>
                Catatan Terakhir
              </SectionTitle>
              <List>
                {txs.slice(0, 5).map((t) => (
                  <Row
                    key={t.id}
                    title={t.description || t.incomeCategory?.name || t.expenseCategory?.name || "Transaksi"}
                    meta={`${formatDate(t.date)} · ${t.incomeCategory?.name ?? t.expenseCategory?.name ?? "Lainnya"}`}
                    amount={`${t.type === "INCOME" ? "+" : "−"}${formatIDR(t.amount)}`}
                    amountTone={t.type === "INCOME" ? "positive" : "negative"}
                  />
                ))}
              </List>
            </>
          )}

          {insights.length > 0 && (
            <>
              <SectionTitle>Yang Perlu Diperhatikan</SectionTitle>
              <Card>
                <ul className="flex flex-col gap-2.5">
                  {insights.map((text, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-charcoal/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          <div className="mt-6">
            <Tip>
              Pisahkan uang usaha dari uang pribadi. Kalau ambil uang usaha untuk keperluan rumah, catat sebagai
              uang keluar supaya untung rugi usaha tetap terbaca benar.
            </Tip>
          </div>
        </>
      )}
    </>
  );
}
