import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createSale } from "@/lib/actions/sales";
import { PageHeader } from "@/components/page-header";
import { Card, EmptyState, Tip } from "@/components/ui";

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
    <>
      <PageHeader title="Catat Penjualan" subtitle="Stok dan keuangan tercatat otomatis" back="/sales" />

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          body="Tambahkan produk terlebih dahulu, karena penjualan dicatat berdasarkan produk yang terjual."
          actionLabel="Tambah Produk"
          actionHref="/products/new"
        />
      ) : (
        <>
          <form action={createSale} className="flex flex-col gap-4">
            <Card>
              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="label mb-1.5 block">Produk yang terjual</span>
                  <select name="productId" required className="field">
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — stok {p.stock} — Rp{p.sellingPrice.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="label mb-1.5 block">Jumlah</span>
                    <input
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      defaultValue={1}
                      required
                      className="field tnum"
                    />
                  </label>
                  <label className="block">
                    <span className="label mb-1.5 block">Harga satuan (Rp)</span>
                    <input
                      name="unitPrice"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      required
                      defaultValue={products[0]?.sellingPrice ?? 0}
                      className="field tnum"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="label mb-1.5 block">Diskon (Rp)</span>
                  <input
                    name="discount"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    defaultValue={0}
                    className="field tnum"
                  />
                </label>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="label mb-1.5 block">Pembeli</span>
                  <select name="customerId" className="field">
                    <option value="">Pelanggan umum</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="label mb-1.5 block">Dijual lewat mana</span>
                  <input
                    name="channel"
                    list="channel-options"
                    placeholder="Toko / WhatsApp / Pameran"
                    className="field"
                  />
                  <datalist id="channel-options">
                    {channels.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </label>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="label mb-1.5 block">Status bayar</span>
                    <select name="paymentStatus" defaultValue="Paid" className="field">
                      <option value="Paid">Lunas</option>
                      <option value="Partially Paid">Dibayar sebagian</option>
                      <option value="Unpaid">Belum bayar</option>
                    </select>
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
                  <span className="label mb-1.5 block">Sudah dibayar berapa (Rp)</span>
                  <input
                    name="amountPaid"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    defaultValue={0}
                    className="field tnum"
                  />
                  <span className="mt-1 block text-[12px] text-muted">
                    Isi hanya jika status bayar &ldquo;Dibayar sebagian&rdquo;.
                  </span>
                </label>

                <label className="block">
                  <span className="label mb-1.5 block">Catatan</span>
                  <textarea name="notes" rows={2} className="field" />
                </label>
              </div>
            </Card>

            <button type="submit" className="btn btn-primary w-full">
              Simpan Penjualan
            </button>
          </form>

          <div className="mt-5">
            <Tip>
              Setelah tersimpan, invoice PDF bisa langsung dibuat dari halaman detail penjualan dan dikirim ke
              pembeli.
            </Tip>
          </div>
        </>
      )}
    </>
  );
}
