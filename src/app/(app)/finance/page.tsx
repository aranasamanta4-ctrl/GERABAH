import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { formatIDR, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, EmptyState, List, Row, Tip } from "@/components/ui";
import { IconPlus } from "@/components/icons";

const TABS = [
  { key: "ALL", label: "Semua", href: "/finance" },
  { key: "INCOME", label: "Uang Masuk", href: "/finance?type=INCOME" },
  { key: "EXPENSE", label: "Uang Keluar", href: "/finance?type=EXPENSE" },
];

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const allTx = await prisma.financialTransaction.findMany({
    where: { businessId: business.id },
    include: { incomeCategory: true, expenseCategory: true, paymentMethod: true },
    orderBy: { date: "desc" },
  });

  const totalIncome = allTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = allTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const activeTab = type === "EXPENSE" ? "EXPENSE" : type === "INCOME" ? "INCOME" : "ALL";
  const filtered = activeTab === "ALL" ? allTx : allTx.filter((t) => t.type === activeTab);

  const byDay = new Map<string, typeof filtered>();
  for (const t of filtered) {
    const key = t.date.toISOString().slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), t]);
  }

  return (
    <>
      <PageHeader title="Keuangan" subtitle="Semua uang masuk dan keluar usaha" />

      <Card className="mb-4">
        <p className="label">Saldo Kas Usaha</p>
        <p
          className={`tnum mt-1 truncate font-display text-[clamp(26px,9vw,36px)] leading-none ${
            balance >= 0 ? "text-charcoal" : "text-rose"
          }`}
        >
          {formatIDR(balance)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3.5 text-[13px]">
          <div className="min-w-0">
            <span className="label block">Total Masuk</span>
            <span className="tnum block truncate font-bold text-cobalt">{formatIDR(totalIncome)}</span>
          </div>
          <div className="min-w-0">
            <span className="label block">Total Keluar</span>
            <span className="tnum block truncate font-bold text-terracotta">{formatIDR(totalExpense)}</span>
          </div>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <Link href="/finance/new?type=INCOME" className="btn btn-primary">
          <IconPlus className="h-4 w-4" strokeWidth={2.2} />
          Uang Masuk
        </Link>
        <Link href="/finance/new?type=EXPENSE" className="btn btn-secondary">
          <IconPlus className="h-4 w-4" strokeWidth={2.2} />
          Uang Keluar
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${
              activeTab === tab.key
                ? "bg-charcoal text-cream"
                : "border border-border bg-card text-muted active:bg-sand"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada catatan"
          body="Setiap kali menerima atau mengeluarkan uang untuk usaha, catat di sini. Cukup sekali sehari juga tidak apa-apa."
          actionLabel="Catat Sekarang"
          actionHref="/finance/new?type=INCOME"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {[...byDay.entries()].map(([day, items]) => {
            const dayNet = items.reduce((s, t) => s + (t.type === "INCOME" ? t.amount : -t.amount), 0);
            return (
              <div key={day}>
                <div className="mb-1.5 flex items-baseline justify-between px-1">
                  <span className="text-[13px] font-semibold text-charcoal">{formatDate(items[0].date)}</span>
                  <span className={`tnum shrink-0 text-xs font-medium ${dayNet >= 0 ? "text-cobalt" : "text-terracotta"}`}>
                    {dayNet >= 0 ? "+" : "−"}
                    {formatIDR(Math.abs(dayNet))}
                  </span>
                </div>
                <List>
                  {items.map((t) => (
                    <Row
                      key={t.id}
                      title={t.description || t.incomeCategory?.name || t.expenseCategory?.name || "Transaksi"}
                      meta={`${t.incomeCategory?.name ?? t.expenseCategory?.name ?? "Lainnya"} · ${
                        t.paymentMethod?.name ?? "Tunai"
                      }`}
                      amount={`${t.type === "INCOME" ? "+" : "−"}${formatIDR(t.amount)}`}
                      amountTone={t.type === "INCOME" ? "income" : "expense"}
                    />
                  ))}
                </List>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Tip>
          Catat pengeluaran sekecil apa pun — tanah liat, kayu bakar, ongkos kirim, upah harian. Dari sinilah biaya
          produksi dan harga jual yang pas bisa dihitung.
        </Tip>
      </div>
    </>
  );
}
