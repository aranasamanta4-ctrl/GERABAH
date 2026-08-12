import { getCurrentBusiness, getCurrentUser } from "@/lib/current-user";

export default async function SettingsPage() {
  const [user, business] = await Promise.all([getCurrentUser(), getCurrentBusiness()]);
  if (!user || !business) return null;

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-charcoal">Pengaturan</h1>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-charcoal">Akun</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/50">Nama</span>
            <span className="text-charcoal">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/50">Email</span>
            <span className="text-charcoal">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/50">No. HP</span>
            <span className="text-charcoal">{user.phone ?? "-"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-charcoal">Bisnis</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/50">Nama Bisnis</span>
            <span className="text-charcoal">{business.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/50">Lokasi</span>
            <span className="text-charcoal">{business.location ?? "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/50">Kategori</span>
            <span className="text-charcoal">{business.categoryDefault}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
