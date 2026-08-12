import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { createCommunityOrder } from "@/lib/actions/community-order";
import { MediaPreview } from "@/components/media-preview";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function OrderProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  const { id } = await params;
  const { post } = await searchParams;

  const product = await prisma.product.findUnique({ where: { id }, include: { business: true } });
  if (!product || product.stock <= 0) notFound();

  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="mb-4 text-sm text-charcoal/70">
            Masuk atau daftar dulu untuk memesan {product.name}.
          </p>
          <Link
            href={`/login?redirect=/product/${id}/order${post ? `?post=${post}` : ""}`}
            className="inline-block rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            Masuk untuk Memesan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-10 sm:px-12">
      <div className="mx-auto w-full max-w-md">
        <Link href={`/product/${id}${post ? `?post=${post}` : ""}`} className="mb-6 block text-sm text-charcoal/60">
          ← Kembali
        </Link>

        <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">Buat Pesanan</h1>

        <div className="mb-6 flex items-center gap-4 rounded-xl bg-beige/40 p-4">
          <MediaPreview
            src={product.photoUrl}
            alt={product.name}
            className="h-16 w-16 shrink-0 rounded-lg"
            emojiClassName="text-3xl"
          />
          <div>
            <p className="font-medium text-charcoal">{product.name}</p>
            <p className="text-sm text-terracotta">{formatIDR(product.sellingPrice)}</p>
            <p className="text-xs text-charcoal/50">@{product.business?.name}</p>
          </div>
        </div>

        <form action={createCommunityOrder} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <input type="hidden" name="productId" value={product.id} />
          {post && <input type="hidden" name="postId" value={post} />}

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Jumlah</label>
            <input
              name="quantity"
              type="number"
              min={1}
              max={product.stock}
              defaultValue={1}
              required
              className="w-24 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Nama Penerima</label>
            <input
              name="name"
              required
              defaultValue={user.name}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">No. HP</label>
            <input
              name="phone"
              defaultValue={user.phone ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Alamat</label>
            <textarea
              name="address"
              rows={2}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
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
            Kirim Pesanan
          </button>
        </form>
      </div>
    </div>
  );
}
