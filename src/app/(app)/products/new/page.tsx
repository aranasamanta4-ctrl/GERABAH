import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { createProduct } from "@/lib/actions/products";
import { PageHeader } from "@/components/page-header";
import { Card, Tip } from "@/components/ui";

const COST_FIELDS = [
  { name: "materialCost", label: "Bahan baku", hint: "tanah liat, glasir, cat" },
  { name: "laborCost", label: "Tenaga kerja", hint: "upah membentuk & membakar" },
  { name: "packagingCost", label: "Kemasan", hint: "kardus, jerami, plastik" },
  { name: "otherCost", label: "Lain-lain", hint: "kayu bakar, listrik, ongkos" },
];

export default async function NewProductPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const categories = await prisma.productCategory.findMany({
    where: { businessId: business.id },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader title="Tambah Produk" subtitle="Lengkap dengan biaya produksinya" back="/products" />

      <form action={createProduct} encType="multipart/form-data" className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="label mb-1.5 block">Nama produk</span>
              <input name="name" required autoFocus placeholder="mis. Kendi Air Sitiwinangun" className="field" />
            </label>

            <label className="block">
              <span className="label mb-1.5 block">Foto produk</span>
              <input
                name="photo"
                type="file"
                accept="image/*,video/*"
                className="field !py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-sand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-clay"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label mb-1.5 block">Kategori</span>
                <input name="category" list="category-options" placeholder="Pilih / ketik" className="field" />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="label mb-1.5 block">Bahan</span>
                <input name="material" placeholder="Tanah liat" className="field" />
              </label>
            </div>

            <label className="block">
              <span className="label mb-1.5 block">Keterangan</span>
              <textarea name="description" rows={3} className="field" />
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="label mb-1.5 block">Harga jual (Rp)</span>
              <input
                name="sellingPrice"
                type="number"
                inputMode="numeric"
                min={0}
                required
                placeholder="0"
                className="field tnum !min-h-[56px] !text-[24px] font-bold"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label mb-1.5 block">Stok saat ini</span>
                <input
                  name="stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={0}
                  className="field tnum"
                />
              </label>
              <label className="block">
                <span className="label mb-1.5 block">Batas stok minimum</span>
                <input
                  name="minStock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={0}
                  className="field tnum"
                />
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-[15px] font-bold text-charcoal">Biaya Produksi</p>
          <p className="mb-4 mt-0.5 text-[13px] leading-relaxed text-muted">
            Perkiraan biaya untuk membuat <strong>satu</strong> barang. Dari sini untung per barang dihitung otomatis.
          </p>
          <div className="flex flex-col gap-3">
            {COST_FIELDS.map((f) => (
              <label key={f.name} className="block">
                <span className="label mb-1.5 block">
                  {f.label} <span className="normal-case tracking-normal">— {f.hint}</span>
                </span>
                <input
                  name={f.name}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={0}
                  className="field tnum"
                />
              </label>
            ))}
          </div>
        </Card>

        <button type="submit" className="btn btn-primary w-full">
          Simpan Produk
        </button>
      </form>

      <div className="mt-5">
        <Tip>
          Tidak perlu langsung tepat. Isi perkiraan yang paling masuk akal dulu, lalu perbaiki setelah beberapa kali
          produksi — yang penting biayanya mulai tercatat.
        </Tip>
      </div>
    </>
  );
}
