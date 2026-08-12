import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

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
  const netCashFlow = totalIncome - totalExpense;

  const activeTab = type === "EXPENSE" ? "EXPENSE" : type === "INCOME" ? "INCOME" : "ALL";
  const filtered = activeTab === "ALL" ? allTx : allTx.filter((t) => t.type === activeTab);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Keuangan</h1>
        <div className="flex gap-2">
          <Link
            href="/finance/new?type=INCOME"
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            + Pemasukan
          </Link>
          <Link
            href="/finance/new?type=EXPENSE"
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-beige/50"
          >
            + Pengeluaran
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-beige/40 p-4">
          <p className="text-xs text-charcoal/50">Total Pemasukan</p>
          <p className="text-lg font-semibold text-sage">{formatIDR(totalIncome)}</p>
        </div>
        <div className="rounded-xl bg-beige/40 p-4">
          <p className="text-xs text-charcoal/50">Total Pengeluaran</p>
          <p className="text-lg font-semibold text-terracotta">{formatIDR(totalExpense)}</p>
        </div>
        <div className="rounded-xl bg-beige/40 p-4">
          <p className="text-xs text-charcoal/50">Arus Kas Bersih</p>
          <p className={`text-lg font-semibold ${netCashFlow >= 0 ? "text-sage" : "text-red-600"}`}>
            {formatIDR(netCashFlow)}
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-border">
        {[
          { key: "ALL", label: "Semua" },
          { key: "INCOME", label: "Pemasukan" },
          { key: "EXPENSE", label: "Pengeluaran" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "ALL" ? "/finance" : `/finance?type=${tab.key}`}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-terracotta text-terracotta"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">Belum ada transaksi keuangan.</p>
          <Link
            href="/finance/new"
            className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            + Tambah Pemasukan/Pengeluaran
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-b border-border bg-card px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <p className="font-medium text-charcoal">
                  {t.description || t.incomeCategory?.name || t.expenseCategory?.name || "-"}
                </p>
                <p className="text-xs text-charcoal/50">
                  {t.date.toLocaleDateString("id-ID")} ·{" "}
                  {t.incomeCategory?.name ?? t.expenseCategory?.name ?? "Lainnya"} ·{" "}
                  {t.paymentMethod?.name ?? "-"}
                </p>
              </div>
              <span className={`font-semibold ${t.type === "INCOME" ? "text-sage" : "text-terracotta"}`}>
                {t.type === "INCOME" ? "+" : "-"}
                {formatIDR(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
