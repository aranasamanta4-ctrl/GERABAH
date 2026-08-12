import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { MediaPreview } from "@/components/media-preview";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

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
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          {showArchived ? "Produk Diarsipkan" : "Produk"}
        </h1>
        <Link
          href="/products/new"
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          + Tambah Produk
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">
            {showArchived ? "Belum ada produk yang diarsipkan." : "Belum ada produk."}
          </p>
          {!showArchived && (
            <Link
              href="/products/new"
              className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
            >
              + Tambah Produk
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const hpp = p.costComponents.reduce((sum, c) => sum + c.amount, 0);
            const profit = p.sellingPrice - hpp;
            const margin = p.sellingPrice > 0 ? (profit / p.sellingPrice) * 100 : 0;
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className={`group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md ${
                  showArchived ? "opacity-60" : ""
                }`}
              >
                <MediaPreview src={p.photoUrl} alt={p.name} className="aspect-square w-full" />
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-charcoal">{p.name}</p>
                  <p className="text-xs text-charcoal/50">{p.category?.name ?? "Tanpa kategori"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-terracotta">
                      {formatIDR(p.sellingPrice)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        margin >= 0 ? "bg-sage/15 text-sage" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {margin.toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-charcoal/50">Stok: {p.stock}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!showArchived && archivedCount > 0 && (
        <Link
          href="/products?archived=1"
          className="mt-6 inline-block text-xs text-charcoal/50 hover:text-charcoal"
        >
          Lihat {archivedCount} produk yang diarsipkan →
        </Link>
      )}
      {showArchived && (
        <Link href="/products" className="mt-6 inline-block text-xs text-charcoal/50 hover:text-charcoal">
          ← Kembali ke Produk
        </Link>
      )}
    </div>
  );
}
