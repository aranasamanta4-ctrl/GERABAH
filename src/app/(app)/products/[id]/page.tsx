import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { deleteProduct, adjustProductStock } from "@/lib/actions/products";
import { formatIDR } from "@/lib/format";
import { MediaPreview } from "@/components/media-preview";
import { PageHeader } from "@/components/page-header";
import { Card, Pill, SectionTitle, Tip } from "@/components/ui";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const product = await prisma.product.findFirst({
    where: { id, businessId: business.id },
    include: {
      category: true,
      costComponents: true,
      _count: { select: { saleItems: true, orderItems: true } },
    },
  });
  if (!product) notFound();

  const hpp = product.costComponents.reduce((sum, c) => sum + c.amount, 0);
  const profit = product.sellingPrice - hpp;
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;
  const hasHistory = product._count.saleItems > 0 || product._count.orderItems > 0;
  const lowStock = product.stock <= product.minStock;

  const deleteProductWithId = deleteProduct.bind(null, product.id);

  const status =
    product.status === "inactive"
      ? { label: "Diarsipkan", tone: "neutral" as const }
      : lowStock
      ? { label: "Stok Menipis", tone: "warning" as const }
      : { label: "Aktif", tone: "positive" as const };

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={[product.category?.name ?? "Tanpa kategori", product.material].filter(Boolean).join(" · ")}
        back="/products"
      />

      <MediaPreview
        src={product.photoUrl}
        alt={product.name}
        className="mb-4 aspect-[4/3] w-full rounded-[14px] bg-sand"
        emojiClassName="text-6xl"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="label">Harga Jual</p>
          <p className="tnum font-display text-[32px] leading-none text-charcoal">
            {formatIDR(product.sellingPrice)}
          </p>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>

      {product.description && (
        <p className="mb-4 text-[14px] leading-relaxed text-charcoal/80">{product.description}</p>
      )}

      <SectionTitle>Hitungan Untung</SectionTitle>
      <Card>
        {hpp === 0 ? (
          <p className="text-[13px] leading-relaxed text-muted">
            Biaya produksi belum diisi, jadi untung per barang belum bisa dihitung. Tambahkan rincian biaya saat
            mengubah produk ini.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between py-1.5 text-[14px]">
              <span className="text-muted">Harga jual</span>
              <span className="tnum font-medium">{formatIDR(product.sellingPrice)}</span>
            </div>
            <div className="flex items-baseline justify-between py-1.5 text-[14px]">
              <span className="text-muted">Biaya produksi (HPP)</span>
              <span className="tnum font-medium text-terracotta">−{formatIDR(hpp)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-[15px] font-bold text-charcoal">Untung per barang</span>
              <span className={`tnum text-[17px] font-bold ${profit >= 0 ? "text-sage" : "text-rose"}`}>
                {formatIDR(profit)}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              Setara {margin.toFixed(0)}% dari harga jual.
              {margin < 20 && margin >= 0 && " Margin ini tipis — pertimbangkan menaikkan harga."}
            </p>

            <div className="mt-4 border-t border-border pt-3.5">
              <p className="label mb-1.5">Rincian Biaya</p>
              {product.costComponents.map((c) => (
                <div key={c.id} className="flex justify-between py-1 text-[13px]">
                  <span className="text-muted">{c.label}</span>
                  <span className="tnum font-medium">{formatIDR(c.amount)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <SectionTitle>Stok</SectionTitle>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Tersedia Sekarang</p>
            <p className={`tnum text-[28px] font-bold leading-tight ${lowStock ? "text-amber" : "text-charcoal"}`}>
              {product.stock}
            </p>
            <p className="text-[12px] text-muted">Batas minimum {product.minStock}</p>
          </div>
          <div className="flex items-center gap-2">
            <form action={adjustProductStock}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="delta" value={-1} />
              <button
                type="submit"
                aria-label="Kurangi satu"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-2xl text-charcoal active:bg-sand"
              >
                −
              </button>
            </form>
            <form action={adjustProductStock}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="delta" value={1} />
              <button
                type="submit"
                aria-label="Tambah satu"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-2xl text-charcoal active:bg-sand"
              >
                +
              </button>
            </form>
          </div>
        </div>

        <form action={adjustProductStock} className="mt-4 flex items-end gap-2 border-t border-border pt-4">
          <input type="hidden" name="productId" value={product.id} />
          <label className="min-w-0 flex-1">
            <span className="label mb-1.5 block">Sesuaikan banyak sekaligus</span>
            <input
              name="delta"
              type="number"
              inputMode="numeric"
              placeholder="mis. 10 atau -5"
              className="field tnum"
            />
          </label>
          <button type="submit" className="btn btn-secondary shrink-0">
            Simpan
          </button>
        </form>
      </Card>

      {product.status !== "inactive" && (
        <>
          <SectionTitle>Kelola</SectionTitle>
          <Card>
            <form action={deleteProductWithId}>
              <button type="submit" className="btn btn-secondary w-full text-muted">
                {hasHistory ? "Arsipkan Produk" : "Hapus Produk"}
              </button>
            </form>
            {hasHistory && (
              <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
                Produk ini sudah punya riwayat penjualan, jadi tidak dihapus permanen — hanya disembunyikan dari
                katalog supaya laporan lama tetap benar.
              </p>
            )}
          </Card>
        </>
      )}

      {product.status === "inactive" && (
        <div className="mt-4">
          <Tip>Produk ini sudah diarsipkan dan tidak muncul saat mencatat penjualan baru.</Tip>
        </div>
      )}
    </>
  );
}
