import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { resolveRange, previousRange } from "@/lib/date-range";
import { formatIDR, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, EmptyState, SectionTitle, Stat, Tip } from "@/components/ui";
import { IconDownload } from "@/components/icons";

const PERIODS = [
  { key: "week", label: "Mingguan" },
  { key: "month", label: "Bulanan" },
  { key: "year", label: "Tahunan" },
];

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function StatementRow({
  label,
  value,
  tone = "neutral",
  bold,
  divider,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "negative";
  bold?: boolean;
  divider?: boolean;
}) {
  const color = tone === "positive" ? "text-sage" : tone === "negative" ? "text-terracotta" : "text-charcoal";
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${
        divider ? "mt-1 border-t border-border pt-3" : ""
      }`}
    >
      <span className={`text-[14px] ${bold ? "font-bold text-charcoal" : "text-muted"}`}>{label}</span>
      <span className={`tnum shrink-0 text-[14px] ${bold ? "font-bold" : "font-medium"} ${color}`}>
        {formatIDR(value)}
      </span>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const periodKey = period === "week" || period === "year" ? period : "month";
  const business = await getCurrentBusiness();
  if (!business) return null;

  const { from, to, label } = resolveRange(periodKey);
  const prev = previousRange(from, to);

  const [sales, txs, prevTxs, openingTxs, orders, newCustomers] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
      include: { items: { include: { product: true } }, channel: true },
    }),
    prisma.financialTransaction.findMany({
      where: { businessId: business.id, date: { gte: from, lte: to } },
      include: { incomeCategory: true, expenseCategory: true },
    }),
    prisma.financialTransaction.findMany({
      where: { businessId: business.id, date: { gte: prev.from, lte: prev.to } },
    }),
    // Everything before the period start — the opening cash balance.
    prisma.financialTransaction.findMany({
      where: { businessId: business.id, date: { lt: from } },
      select: { type: true, amount: true },
    }),
    prisma.order.count({ where: { businessId: business.id, date: { gte: from, lte: to } } }),
    prisma.customer.count({ where: { businessId: business.id, createdAt: { gte: from, lte: to } } }),
  ]);

  const income = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  const prevIncome = prevTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const prevProfit = prevIncome - prevExpense;

  const opening = openingTxs.reduce((s, t) => s + (t.type === "INCOME" ? t.amount : -t.amount), 0);
  const closing = opening + profit;

  const groupBy = (kind: "INCOME" | "EXPENSE") => {
    const map = new Map<string, number>();
    for (const t of txs.filter((x) => x.type === kind)) {
      const name = (kind === "INCOME" ? t.incomeCategory?.name : t.expenseCategory?.name) ?? "Lainnya";
      map.set(name, (map.get(name) ?? 0) + t.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  };

  const incomeByCategory = groupBy("INCOME");
  const expenseByCategory = groupBy("EXPENSE");

  const unitsSold = sales.reduce((s, sale) => s + sale.items.reduce((u, i) => u + i.quantity, 0), 0);
  const outstanding = sales.reduce((s, sale) => s + sale.outstandingBalance, 0);
  const margin = income > 0 ? (profit / income) * 100 : 0;

  const hasData = txs.length > 0 || sales.length > 0;

  return (
    <>
      <PageHeader
        title="Laporan"
        subtitle={`${label} · ${formatDate(from)} – ${formatDate(to)}`}
        action={
          <a
            href={`/api/reports/export?period=${periodKey}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-charcoal active:bg-sand"
            aria-label="Unduh CSV"
          >
            <IconDownload className="h-[18px] w-[18px]" />
          </a>
        }
      />

      <div className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/reports?period=${p.key}`}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${
              periodKey === p.key
                ? "bg-charcoal text-cream"
                : "border border-border bg-card text-muted active:bg-sand"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {!hasData ? (
        <EmptyState
          title="Laporan belum bisa dibuat"
          body="Laporan laba rugi dan arus kas muncul otomatis begitu ada catatan uang masuk atau keluar pada periode ini."
          actionLabel="Catat Transaksi"
          actionHref="/finance/new?type=INCOME"
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Uang Masuk" value={formatIDR(income)} tone="positive" />
            <Stat label="Uang Keluar" value={formatIDR(expense)} tone="negative" />
            <Stat
              label={profit >= 0 ? "Untung" : "Rugi"}
              value={formatIDR(profit)}
              hint={prevProfit !== 0 ? `${pctChange(profit, prevProfit) >= 0 ? "▲" : "▼"} ${Math.abs(pctChange(profit, prevProfit)).toFixed(0)}% vs lalu` : undefined}
              tone={profit >= 0 ? "neutral" : "negative"}
            />
          </div>

          {/* Laporan laba-rugi sederhana */}
          <SectionTitle>Laba Rugi Sederhana</SectionTitle>
          <Card>
            <p className="mb-2 text-[13px] text-muted">
              Berapa untung usaha setelah semua biaya dikurangi.
            </p>

            <p className="label mt-3">Pendapatan</p>
            {incomeByCategory.length === 0 ? (
              <p className="py-2 text-[13px] text-muted">Belum ada pemasukan periode ini.</p>
            ) : (
              incomeByCategory.map(([name, amount]) => (
                <StatementRow key={name} label={name} value={amount} tone="positive" />
              ))
            )}
            <StatementRow label="Total Pendapatan" value={income} bold divider />

            <p className="label mt-5">Pengeluaran</p>
            {expenseByCategory.length === 0 ? (
              <p className="py-2 text-[13px] text-muted">Belum ada pengeluaran periode ini.</p>
            ) : (
              expenseByCategory.map(([name, amount]) => (
                <StatementRow key={name} label={name} value={amount} tone="negative" />
              ))
            )}
            <StatementRow label="Total Pengeluaran" value={expense} bold divider />

            <div className="mt-4 flex items-baseline justify-between gap-4 rounded-xl bg-sand px-3.5 py-3">
              <span className="text-[14px] font-bold text-charcoal">
                {profit >= 0 ? "Laba Bersih" : "Rugi Bersih"}
              </span>
              <span className={`tnum text-[17px] font-bold ${profit >= 0 ? "text-sage" : "text-rose"}`}>
                {formatIDR(profit)}
              </span>
            </div>
            <p className="mt-2 text-[12px] text-muted">
              Margin keuntungan {margin.toFixed(0)}% dari pendapatan.
            </p>
          </Card>

          {/* Laporan arus kas sederhana */}
          <SectionTitle>Arus Kas Sederhana</SectionTitle>
          <Card>
            <p className="mb-2 text-[13px] text-muted">
              Berapa uang tunai yang benar-benar ada di tangan.
            </p>
            <StatementRow label="Saldo awal periode" value={opening} />
            <StatementRow label="Kas masuk" value={income} tone="positive" />
            <StatementRow label="Kas keluar" value={expense} tone="negative" />
            <StatementRow label="Saldo akhir periode" value={closing} bold divider />
          </Card>

          <SectionTitle>Ringkasan Penjualan</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Unit Terjual" value={String(unitsSold)} />
            <Stat label="Pesanan" value={String(orders)} />
            <Stat label="Pelanggan Baru" value={String(newCustomers)} />
          </div>
          {outstanding > 0 && (
            <div className="mt-2.5">
              <Stat label="Piutang Belum Tertagih" value={formatIDR(outstanding)} tone="negative" href="/sales" />
            </div>
          )}

          <div className="mt-6">
            <Tip>
              Laporan ini bisa diunduh sebagai file CSV lewat tombol di atas, lalu dibuka di Excel atau Google Sheets
              — berguna saat mengajukan pembiayaan ke bank atau koperasi.
            </Tip>
          </div>
        </>
      )}
    </>
  );
}
