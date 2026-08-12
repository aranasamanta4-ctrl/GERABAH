import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createProduct } from "@/lib/actions/products";

export default async function NewProductPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const categories = await prisma.productCategory.findMany({
    where: { businessId: business.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl p-6 sm:p-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">Tambah Produk</h1>

      <form
        action={createProduct}
        encType="multipart/form-data"
        className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Nama Produk</label>
          <input
            name="name"
            required
            placeholder="Contoh: Minimalist Vase"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Foto atau Video (opsional)</label>
          <input
            name="photo"
            type="file"
            accept="image/*,video/*"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-clay focus:border-terracotta"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Kategori</label>
            <input
              name="category"
              list="category-options"
              placeholder="Pilih atau ketik baru"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Material</label>
            <input
              name="material"
              placeholder="Contoh: Tanah liat"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Deskripsi</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Harga Jual (Rp)</label>
            <input
              name="sellingPrice"
              type="number"
              min={0}
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-charcoal/70">Stok Awal</label>
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Stok Minimum</label>
          <input
            name="minStock"
            type="number"
            min={0}
            defaultValue={0}
            className="w-full max-w-[10rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>

        <div className="rounded-xl bg-beige/40 p-4">
          <p className="mb-3 text-sm font-medium text-charcoal">Komponen HPP (opsional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-charcoal/60">Material Cost</label>
              <input name="materialCost" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-charcoal/60">Labor Cost</label>
              <input name="laborCost" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-charcoal/60">Packaging Cost</label>
              <input name="packagingCost" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-charcoal/60">Other Cost</label>
              <input name="otherCost" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          Simpan Produk
        </button>
      </form>
    </div>
  );
}
