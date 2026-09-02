import { getCurrentBusiness, getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/page-header";
import { Card, SectionTitle } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-[14px]">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="truncate text-right font-medium text-charcoal">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const [user, business] = await Promise.all([getCurrentUser(), getCurrentBusiness()]);
  if (!user || !business) return null;

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Profil usaha dan akun" />

      <SectionTitle>Usaha</SectionTitle>
      <Card>
        <DetailRow label="Nama usaha" value={business.name} />
        <DetailRow label="Lokasi" value={business.location ?? "-"} />
        <DetailRow label="Jenis usaha" value={business.categoryDefault} />
      </Card>

      <SectionTitle>Akun</SectionTitle>
      <Card>
        <DetailRow label="Nama" value={user.name} />
        <DetailRow label="Email" value={user.email} />
        {user.phone && <DetailRow label="Nomor HP" value={user.phone} />}
      </Card>

      <SectionTitle>Pasang di Layar Utama</SectionTitle>
      <Card>
        <p className="text-[13px] leading-relaxed text-muted">
          Aplikasi ini bisa dipasang seperti aplikasi biasa. Buka menu browser di HP, lalu pilih{" "}
          <strong className="text-charcoal">&ldquo;Tambahkan ke Layar Utama&rdquo;</strong> (Android) atau{" "}
          <strong className="text-charcoal">&ldquo;Add to Home Screen&rdquo;</strong> (iPhone). Setelah itu GERABAH
          bisa dibuka langsung dari ikon, tanpa mengetik alamat lagi.
        </p>
      </Card>

      <div className="mt-6">
        <LogoutButton className="btn btn-secondary w-full text-muted" />
      </div>
    </>
  );
}
