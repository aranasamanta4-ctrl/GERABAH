import { createCustomer } from "@/lib/actions/customers";
import { customerTypeLabel } from "@/lib/labels";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";

const TYPES = ["New", "Returning", "Reseller", "Wholesale", "Other"];

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="Tambah Pelanggan" subtitle="Simpan kontak pembeli" back="/customers" />

      <form action={createCustomer} className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="label mb-1.5 block">Nama</span>
              <input name="name" required autoFocus className="field" />
            </label>
            <label className="block">
              <span className="label mb-1.5 block">Nomor HP</span>
              <input name="phone" type="tel" inputMode="tel" placeholder="08…" className="field" />
            </label>
            <label className="block">
              <span className="label mb-1.5 block">Email</span>
              <input name="email" type="email" className="field" />
            </label>
            <label className="block">
              <span className="label mb-1.5 block">Alamat</span>
              <textarea name="address" rows={2} className="field" />
            </label>
            <label className="block">
              <span className="label mb-1.5 block">Jenis pelanggan</span>
              <select name="type" className="field">
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {customerTypeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <button type="submit" className="btn btn-primary w-full">
          Simpan Pelanggan
        </button>
      </form>
    </>
  );
}
