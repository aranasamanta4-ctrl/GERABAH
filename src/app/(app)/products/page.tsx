import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { formatIDR } from "@/lib/format";
import { MediaPreview } from "@/components/media-preview";
import { PageHeader } from "@/components/page-header";
import { EmptyState, Tip } from "@/components/ui";
import { IconPlus } from "@/components/icons";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const { archived } = await searchParams;
  const showArchived = archived === "1";
  const business = await getCurrentBusiness();
  if (!business) return null;

  const [products, archivedCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        businessId: business.id,
        status: showArchived ? "inactive" : { not: "inactive" },
      },
      include: { category: true, costComponents: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { businessId: business.id, status: "inactive" } }),
  ]);

  return (
    <>
      <PageHeader
        title={showArchived ? "Produk Diarsipkan" : "Produk"}
        subtitle={showArchived ? "Tidak tampil di penjualan" : "Katalog, stok, dan biaya produksi"}
        back={showArchived ? "/products" : undefined}
        action={
          !showArchived ? (
            <Link
              href="/products/new"
              aria-label="Tambah produk"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-white active:bg-terracotta-dark"
            >
              <IconPlus className="h-5 w-5" strokeWidth={2.2} />
            </Link>
          ) : undefined
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title={showArchived ? "Tidak ada arsip" : "Belum ada produk"}
          body={
            showArchived
              ? "Produk yang pernah terjual tidak dihapus permanen, melainkan diarsipkan supaya riwayat penjualan tetap utuh."
              : "Tambahkan produk beserta rincian biaya produksinya, supaya untung per barang langsung terhitung."
          }
          actionLabel={showArchived ? undefined : "Tambah Produk"}
          actionHref={showArchived ? undefined : "/products/new"}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => {
            const hpp = p.costComponents.reduce((sum, c) => sum + c.amount, 0);
            const margin = p.sellingPrice > 0 ? ((p.sellingPrice - hpp) / p.sellingPrice) * 100 : 0;
            const lowStock = p.stock <= p.minStock;
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className={`card overflow-hidden p-0 active:bg-sand ${showArchived ? "opacity-60" : ""}`}
              >
                <MediaPreview src={p.photoUrl} alt={p.name} className="aspect-square w-full bg-sand" />
                <div className="p-3">
                  <p className="truncate text-[14px] font-semibold text-charcoal">{p.name}</p>
                  <p className="truncate text-[11px] text-muted">{p.category?.name ?? "Tanpa kategori"}</p>
                  <p className="tnum mt-2 text-[15px] font-bold text-charcoal">{formatIDR(p.sellingPrice)}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-medium ${lowStock ? "text-amber" : "text-muted"}`}>
                      Stok {p.stock}
                    </span>
                    {hpp > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          margin >= 0 ? "bg-sage-soft text-sage" : "bg-rose-soft text-rose"
                        }`}
                      >
                        untung {margin.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!showArchived && (
        <>
          <div className="mt-6">
            <Tip>
              Isi biaya produksi tiap produk — tanah liat, upah, bakar, kemasan. Aplikasi akan menghitung sendiri
              berapa untung per barang, sehingga harga jual tidak lagi ditebak-tebak.
            </Tip>
          </div>
          {archivedCount > 0 && (
            <Link href="/products?archived=1" className="mt-4 block text-center text-[13px] text-muted">
              Lihat {archivedCount} produk yang diarsipkan
            </Link>
          )}
        </>
      )}
    </>
  );
}
