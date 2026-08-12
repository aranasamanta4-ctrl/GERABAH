import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createSale } from "@/lib/actions/sales";

export default async function NewSalePage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const [products, customers, channels, paymentMethods] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id, status: "active" }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.salesChannel.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">Tambah Penjualan</h1>

      {products.length === 0 ? (
        <p className="rounded-xl bg-beige/40 p-4 text-sm text-charcoal/60">
          Belum ada produk aktif. Tambahkan produk terlebih dahulu di halaman Produk.
        </p>
      ) : (
        <form
          action={createSale}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Produk</label>
            <select
              name="productId"
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Stok {p.stock} — Rp{p.sellingPrice.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Pelanggan (opsional)</label>
            <select
              name="customerId"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            >
              <option value="">Tanpa nama</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">Jumlah</label>
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">Harga Satuan (Rp)</label>
              <input
                name="unitPrice"
                type="number"
                min={0}
                required
                defaultValue={products[0]?.sellingPrice ?? 0}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Diskon (Rp)</label>
            <input
              name="discount"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full max-w-[10rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Channel Penjualan</label>
            <input
              name="channel"
              list="channel-options"
              placeholder="Store / WhatsApp / Instagram ..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
            <datalist id="channel-options">
              {channels.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">Status Pembayaran</label>
              <select
                name="paymentStatus"
                defaultValue="Paid"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
              >
                <option value="Paid">Lunas</option>
                <option value="Partially Paid">Dibayar Sebagian</option>
                <option value="Unpaid">Belum Lunas</option>
              </select>
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
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">
              Jumlah Dibayar (jika Dibayar Sebagian)
            </label>
            <input
              name="amountPaid"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full max-w-[10rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
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
            Simpan Penjualan
          </button>
        </form>
      )}
    </div>
  );
}
