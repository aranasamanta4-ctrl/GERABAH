import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createOrder } from "@/lib/actions/orders";
import { PageHeader } from "@/components/page-header";
import { Card, EmptyState, Tip } from "@/components/ui";

export default async function NewOrderPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const [products, customers, channels] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id, status: { not: "inactive" } },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.salesChannel.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Catat Pesanan" subtitle="Dikerjakan dulu, dibayar belakangan" back="/orders" />

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          body="Tambahkan produk terlebih dahulu, karena pesanan dicatat berdasarkan produk yang dipesan."
          actionLabel="Tambah Produk"
          actionHref="/products/new"
        />
      ) : (
        <>
          <form action={createOrder} className="flex flex-col gap-4">
            <Card>
              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="label mb-1.5 block">Produk yang dipesan</span>
                  <select name="productId" required className="field">
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Rp{p.sellingPrice.toLocaleString("id-ID")}
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
                      name="price"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      required
                      defaultValue={products[0]?.sellingPrice ?? 0}
                      className="field tnum"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                  <label className="block">
                    <span className="label mb-1.5 block">Uang muka / DP (Rp)</span>
                    <input
                      name="downPayment"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      defaultValue={0}
                      className="field tnum"
                    />
                  </label>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="label mb-1.5 block">Pemesan</span>
                  <select name="customerId" className="field">
                    <option value="">Belum ada nama</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="label mb-1.5 block">Jatuh tempo</span>
                    <input name="dueDate" type="date" className="field" />
                  </label>
                  <label className="block">
                    <span className="label mb-1.5 block">Pesan lewat mana</span>
                    <input
                      name="channel"
                      list="channel-options"
                      placeholder="WhatsApp"
                      className="field"
                    />
                    <datalist id="channel-options">
                      {channels.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </label>
                </div>

                <label className="block">
                  <span className="label mb-1.5 block">Catatan</span>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="mis. warna gelap, tanpa glasir"
                    className="field"
                  />
                </label>
              </div>
            </Card>

            <button type="submit" className="btn btn-primary w-full">
              Simpan Pesanan
            </button>
          </form>

          <div className="mt-5">
            <Tip>
              Saat pesanan ditandai Selesai, penjualan dan uang masuk akan tercatat otomatis. Stok baru berkurang di
              tahap itu, bukan sekarang.
            </Tip>
          </div>
        </>
      )}
    </>
  );
}
