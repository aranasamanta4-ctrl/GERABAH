import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteProduct, adjustProductStock } from "@/lib/actions/products";
import { shareProductToCommunity } from "@/lib/actions/community";
import { MediaPreview } from "@/components/media-preview";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      costComponents: true,
      posts: true,
      _count: { select: { saleItems: true, orderItems: true } },
    },
  });
  if (!product) notFound();

  const hpp = product.costComponents.reduce((sum, c) => sum + c.amount, 0);
  const profit = product.sellingPrice - hpp;
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;
  const alreadyShared = product.posts.length > 0;
  const hasHistory = alreadyShared || product._count.saleItems > 0 || product._count.orderItems > 0;

  const deleteProductWithId = deleteProduct.bind(null, product.id);
  const shareProduct = shareProductToCommunity.bind(null, product.id);

  const statusLabel =
    product.status === "inactive" ? "Diarsipkan" : product.status === "active" ? "Aktif" : "Stok Habis";
  const statusClass =
    product.status === "active"
      ? "bg-sage/15 text-sage"
      : product.status === "inactive"
      ? "bg-charcoal/10 text-charcoal/50"
      : "bg-red-100 text-red-600";

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <MediaPreview
          src={product.photoUrl}
          alt={product.name}
          className="aspect-square w-full rounded-2xl sm:w-56 sm:shrink-0"
          emojiClassName="text-6xl"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-charcoal">{product.name}</h1>
              <p className="text-sm text-charcoal/50">
                {product.category?.name ?? "Tanpa kategori"}
                {product.material ? ` · ${product.material}` : ""}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
              {statusLabel}
            </span>
          </div>

          {product.description && (
            <p className="mt-3 text-sm text-charcoal/70">{product.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-beige/40 p-3">
              <p className="text-[11px] text-charcoal/50">Harga Jual</p>
              <p className="text-sm font-semibold text-charcoal">{formatIDR(product.sellingPrice)}</p>
            </div>
            <div className="rounded-xl bg-beige/40 p-3">
              <p className="text-[11px] text-charcoal/50">HPP</p>
              <p className="text-sm font-semibold text-charcoal">{formatIDR(hpp)}</p>
            </div>
            <div className="rounded-xl bg-beige/40 p-3">
              <p className="text-[11px] text-charcoal/50">Profit</p>
              <p className="text-sm font-semibold text-terracotta">{formatIDR(profit)}</p>
            </div>
            <div className="rounded-xl bg-beige/40 p-3">
              <p className="text-[11px] text-charcoal/50">Margin</p>
              <p className="text-sm font-semibold text-sage">{margin.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-charcoal/50">Stok Saat Ini</p>
                <p className="text-lg font-semibold text-charcoal">{product.stock}</p>
              </div>
              <p className="text-xs text-charcoal/50">Min. Stok: {product.minStock}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={adjustProductStock}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="delta" value={-1} />
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg font-medium text-charcoal hover:bg-beige/60"
                >
                  −
                </button>
              </form>
              <form action={adjustProductStock}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="delta" value={1} />
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg font-medium text-charcoal hover:bg-beige/60"
                >
                  +
                </button>
              </form>
              <form action={adjustProductStock} className="flex items-center gap-2">
                <input type="hidden" name="productId" value={product.id} />
                <input
                  name="delta"
                  type="number"
                  placeholder="Jumlah (mis. 10 atau -5)"
                  className="w-44 rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-terracotta"
                />
                <button
                  type="submit"
                  className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-beige/60"
                >
                  Sesuaikan Stok
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <form action={shareProduct}>
              <button
                type="submit"
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
              >
                {alreadyShared ? "Bagikan Lagi ke Komunitas" : "Bagikan ke Komunitas"}
              </button>
            </form>
            {product.status !== "inactive" && (
              <form action={deleteProductWithId}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-charcoal/70 hover:bg-beige/60"
                >
                  {hasHistory ? "Arsipkan Produk" : "Hapus Produk"}
                </button>
              </form>
            )}
          </div>

          {hasHistory && product.status !== "inactive" && (
            <p className="mt-2 text-xs text-charcoal/50">
              Produk ini punya riwayat penjualan/order{alreadyShared ? " atau sudah dibagikan ke Komunitas" : ""},
              jadi tidak bisa dihapus permanen — akan diarsipkan (disembunyikan dari katalog) sebagai gantinya.
            </p>
          )}
          {product.status === "inactive" && (
            <p className="mt-2 text-xs text-charcoal/50">Produk ini sudah diarsipkan.</p>
          )}
        </div>
      </div>

      {product.costComponents.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-charcoal">Rincian Komponen HPP</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            {product.costComponents.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-border bg-card px-4 py-2 text-sm last:border-b-0"
              >
                <span className="text-charcoal/70">{c.label}</span>
                <span className="font-medium text-charcoal">{formatIDR(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
