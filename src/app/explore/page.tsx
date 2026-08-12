import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MediaPreview } from "@/components/media-preview";

const CATEGORIES = [
  "Vas",
  "Pot",
  "Cangkir",
  "Piring",
  "Patung",
  "Dekorasi Rumah",
  "Tradisional",
  "Modern",
  "Eksperimental",
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const posts = await prisma.post.findMany({
    where: {
      productId: { not: null },
      product: { status: { not: "inactive" } },
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { material: { contains: q } },
              { category: { contains: q } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    },
    include: { product: true, business: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-12">
        <Link href="/" className="font-serif text-xl font-semibold text-charcoal">
          GERABAH
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-charcoal/80 hover:text-charcoal">
            Masuk
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark"
          >
            Mulai Bisnismu
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16 sm:px-12">
        <h1 className="mb-4 font-serif text-2xl font-semibold text-charcoal">Jelajahi</h1>

        <form className="mb-4" action="/explore">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama produk, kategori, atau material..."
            className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta"
          />
        </form>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/explore"
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              !category ? "bg-terracotta text-white" : "border border-border text-charcoal/60"
            }`}
          >
            Semua
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/explore?category=${encodeURIComponent(c)}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                category === c ? "bg-terracotta text-white" : "border border-border text-charcoal/60"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-charcoal/60">Tidak ditemukan. Coba kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/product/${post.productId}?post=${post.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <MediaPreview src={post.imageUrl} alt={post.title} className="aspect-square w-full" />
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-charcoal">{post.title}</p>
                  <p className="text-xs text-charcoal/50">@{post.business?.name ?? "Gerabah"}</p>
                  {post.product && (
                    <p className="mt-1 text-sm font-semibold text-terracotta">
                      {formatIDR(post.product.sellingPrice)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
