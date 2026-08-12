import { createCustomer } from "@/lib/actions/customers";
import { customerTypeLabel } from "@/lib/labels";

const TYPES = ["New", "Returning", "Reseller", "Wholesale", "Other"];

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-md p-6 sm:p-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">Tambah Pelanggan</h1>

      <form action={createCustomer} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Nama</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-charcoal/70">No. HP</label>
          <input
            name="phone"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-charcoal/70">Email</label>
          <input
            name="email"
            type="email"
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
          <label className="mb-1 block text-sm text-charcoal/70">Tipe</label>
          <select
            name="type"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {customerTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          Simpan Pelanggan
        </button>
      </form>
    </div>
  );
}
