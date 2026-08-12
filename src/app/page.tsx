import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MediaPreview } from "@/components/media-preview";

// Shows live community posts, so it must not be frozen at build time
// (also avoids the build depending on database reachability).
export const dynamic = "force-dynamic";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const FEATURES = [
  {
    title: "Keuangan Sederhana",
    desc: "Catat pemasukan, pengeluaran, dan lihat arus kas bisnismu tanpa istilah akuntansi yang rumit.",
  },
  {
    title: "Produk & Stok",
    desc: "Kelola katalog produk, hitung HPP dan profit otomatis, dan atur stok produk dengan mudah.",
  },
  {
    title: "Komunitas Gerabah",
    desc: "Pamerkan karyamu ke komunitas pencinta gerabah, dan dapatkan pesanan langsung dari sana.",
  },
];

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: { business: true, product: true, likes: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-12">
        <span className="font-serif text-xl font-semibold tracking-tight text-charcoal">
          GERABAH
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/explore" className="text-charcoal/80 hover:text-charcoal">
            Jelajahi Komunitas
          </Link>
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

      <main className="flex-1">
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
          <span className="rounded-full bg-beige px-4 py-1 text-xs font-medium tracking-wide text-clay uppercase">
            Untuk UMKM Gerabah &amp; Keramik Indonesia
          </span>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-charcoal sm:text-6xl">
            Ubah Karyamu Menjadi Bisnis yang Berkembang.
          </h1>
          <p className="max-w-2xl text-lg text-charcoal/70 sm:text-xl">
            Kelola bisnis gerabahmu, pantau penjualan dan keuangan, serta pamerkan karyamu ke
            komunitas pengrajin dan pencinta gerabah.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-terracotta px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-terracotta-dark"
            >
              Mulai Bisnismu
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-border bg-white px-8 py-3 text-base font-medium text-charcoal hover:bg-beige/50"
            >
              Jelajahi Komunitas
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="font-serif text-lg font-semibold text-charcoal">{f.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{f.desc}</p>
            </div>
          ))}
        </section>

        {posts.length > 0 && (
          <section className="mx-auto max-w-5xl px-6 pb-24">
            <h2 className="mb-4 text-center font-serif text-xl font-semibold text-charcoal">
              Dari Komunitas Gerabah
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={post.productId ? `/product/${post.productId}?post=${post.id}` : "/explore"}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
                >
                  <MediaPreview src={post.imageUrl} alt={post.title} className="aspect-square w-full" />
                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-terracotta">
                      @{post.business?.name ?? "Gerabah"}
                    </p>
                    <p className="truncate text-sm text-charcoal">{post.title}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-charcoal/50">
                      <span>❤️ {post.likes.length}</span>
                      {post.product && (
                        <span className="font-medium text-terracotta">
                          {formatIDR(post.product.sellingPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-border bg-beige/40 px-6 py-16 text-center">
          <p className="mx-auto max-w-xl font-serif text-2xl text-charcoal">
            &ldquo;Kelola uangmu. Kelola karyamu. Bagikan karyamu. Kembangkan bisnismu.&rdquo;
          </p>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-charcoal/50">
        GERABAH — dibuat untuk pengrajin gerabah Indonesia.
      </footer>
    </div>
  );
}
