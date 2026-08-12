import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createFinancialTransaction } from "@/lib/actions/finance";
import { todayISO } from "@/lib/date-range";

export default async function NewFinancialTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const txType = type === "INCOME" ? "INCOME" : "EXPENSE";

  const [incomeCategories, expenseCategories, paymentMethods] = await Promise.all([
    prisma.incomeCategory.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.expenseCategory.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
  ]);

  const categories = txType === "INCOME" ? incomeCategories : expenseCategories;

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">
        Tambah {txType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
      </h1>

      <form
        action={createFinancialTransaction}
        className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <input type="hidden" name="type" value={txType} />

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Tanggal</label>
          <input
            name="date"
            type="date"
            defaultValue={todayISO()}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Kategori</label>
          <input
            name="category"
            list="category-options"
            placeholder="Pilih atau ketik baru"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Deskripsi</label>
          <input
            name="description"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Jumlah (Rp)</label>
          <input
            name="amount"
            type="number"
            min={0}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Metode Pembayaran</label>
          <input
            name="paymentMethod"
            list="payment-options"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
          <datalist id="payment-options">
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Catatan</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
}
