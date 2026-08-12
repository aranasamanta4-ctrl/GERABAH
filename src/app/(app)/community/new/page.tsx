import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createPost } from "@/lib/actions/community-posts";

const POST_TYPES = ["Karya", "Produk", "Di Balik Layar", "Inspirasi", "Cerita"];

export default async function NewPostPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const products = await prisma.product.findMany({
    where: { businessId: business.id, status: { not: "inactive" } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">Buat Post</h1>

      <form
        action={createPost}
        encType="multipart/form-data"
        className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Foto atau Video</label>
          <input
            name="media"
            type="file"
            accept="image/*,video/*"
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-clay focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Judul</label>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Deskripsi</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Tipe Post</label>
          <select
            name="type"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          >
            {POST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Kategori</label>
            <input
              name="category"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Material</label>
            <input
              name="material"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>
        </div>

        {products.length > 0 && (
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Hubungkan ke Produk (opsional)</label>
            <select
              name="productId"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            >
              <option value="">Tidak ada</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          Publikasikan
        </button>
      </form>
    </div>
  );
}
