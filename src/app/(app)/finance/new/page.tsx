import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createFinancialTransaction } from "@/lib/actions/finance";
import { todayISO } from "@/lib/date-range";
import { PageHeader } from "@/components/page-header";
import { Card, Tip } from "@/components/ui";

export default async function NewFinancialTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const txType = type === "INCOME" ? "INCOME" : "EXPENSE";
  const isIncome = txType === "INCOME";

  const [incomeCategories, expenseCategories, paymentMethods] = await Promise.all([
    prisma.incomeCategory.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.expenseCategory.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
  ]);

  const categories = isIncome ? incomeCategories : expenseCategories;

  return (
    <>
      <PageHeader
        title={isIncome ? "Catat Uang Masuk" : "Catat Uang Keluar"}
        subtitle={isIncome ? "Uang yang diterima usaha" : "Uang yang dikeluarkan usaha"}
        back="/finance"
      />

      <form action={createFinancialTransaction} className="flex flex-col gap-4">
        <input type="hidden" name="type" value={txType} />

        <Card>
          <label className="block">
            <span className="label mb-1.5 block">Jumlah (Rp)</span>
            <input
              name="amount"
              type="number"
              inputMode="numeric"
              min={0}
              required
              autoFocus
              placeholder="0"
              className={`field tnum !min-h-[64px] !text-[30px] font-bold ${
                isIncome ? "text-sage" : "text-terracotta"
              }`}
            />
          </label>
        </Card>

        <Card>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="label mb-1.5 block">Untuk apa</span>
              <input
                name="description"
                placeholder={isIncome ? "mis. Penjualan kendi ke Bu Ani" : "mis. Beli tanah liat 2 karung"}
                className="field"
              />
            </label>

            <label className="block">
              <span className="label mb-1.5 block">Kategori</span>
              <input
                name="category"
                list="category-options"
                placeholder="Pilih atau ketik baru"
                className="field"
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label mb-1.5 block">Tanggal</span>
                <input name="date" type="date" defaultValue={todayISO()} className="field" />
              </label>
              <label className="block">
                <span className="label mb-1.5 block">Bayar pakai</span>
                <input name="paymentMethod" list="payment-options" placeholder="Tunai" className="field" />
                <datalist id="payment-options">
                  {paymentMethods.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </label>
            </div>

            <label className="block">
              <span className="label mb-1.5 block">Catatan tambahan</span>
              <textarea name="notes" rows={2} className="field" />
            </label>
          </div>
        </Card>

        <button type="submit" className="btn btn-primary w-full">
          Simpan
        </button>
      </form>

      <div className="mt-5">
        <Tip>
          {isIncome
            ? "Catat hanya uang yang benar-benar diterima. Kalau pembeli masih berhutang, catat lewat menu Penjualan atau Pesanan agar piutangnya terpantau."
            : "Termasuk pengeluaran kecil: bensin antar barang, tali, plastik, upah harian. Semakin lengkap, semakin akurat perhitungan untung ruginya."}
        </Tip>
      </div>
    </>
  );
}
