import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MediaPreview } from "@/components/media-preview";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function PublicProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  const { id } = await params;
  const { post } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { business: true, category: true },
  });
  if (!product || product.status === "inactive") notFound();

  const relatedPosts = await prisma.post.findMany({
    where: { businessId: product.businessId, id: { not: post } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const orderHref = `/product/${product.id}/order${post ? `?post=${post}` : ""}`;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-12">
        <Link href="/" className="font-serif text-xl font-semibold text-charcoal">
          GERABAH
        </Link>
        <Link href="/explore" className="text-sm text-charcoal/70 hover:text-charcoal">
          ← Kembali ke Jelajahi
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24 sm:px-12">
        <MediaPreview
          src={product.photoUrl}
          alt={product.name}
          className="aspect-square w-full rounded-2xl"
          emojiClassName="text-7xl"
        />

        <div className="mt-6">
          <p className="text-sm font-medium text-terracotta">@{product.business?.name}</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-charcoal">{product.name}</h1>
          <p className="text-sm text-charcoal/50">
            {product.category?.name ?? "Gerabah"}
            {product.material ? ` · ${product.material}` : ""}
          </p>

          {product.description && (
            <p className="mt-3 text-sm text-charcoal/70">{product.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-xl font-semibold text-terracotta">
              {formatIDR(product.sellingPrice)}
            </span>
            <span className="text-sm text-charcoal/50">
              {product.stock > 0 ? `${product.stock} tersedia` : "Stok habis"}
            </span>
          </div>

          <div className="sticky bottom-4 mt-6">
            {product.stock > 0 ? (
              <Link
                href={orderHref}
                className="block w-full rounded-full bg-terracotta px-6 py-3 text-center text-base font-medium text-white shadow-lg hover:bg-terracotta-dark sm:w-auto sm:inline-block"
              >
                Pesan Sekarang
              </Link>
            ) : (
              <span className="inline-block rounded-full bg-charcoal/10 px-6 py-3 text-center text-base font-medium text-charcoal/40">
                Stok Habis
              </span>
            )}
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-medium text-charcoal">Lainnya dari {product.business?.name}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={p.productId ? `/product/${p.productId}?post=${p.id}` : `/community/${p.id}`}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <MediaPreview src={p.imageUrl} alt={p.title} className="aspect-square w-full" emojiClassName="text-3xl" />
                  <p className="truncate p-2 text-xs text-charcoal/70">{p.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
