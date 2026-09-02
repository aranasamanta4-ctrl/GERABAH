import Link from "next/link";
import { IconChart, IconPot, IconShare, IconWallet } from "@/components/icons";

const FEATURES = [
  {
    Icon: IconWallet,
    title: "Catat Uang Masuk & Keluar",
    desc: "Cukup dua tombol. Tidak perlu paham istilah akuntansi untuk mulai membukukan usaha.",
  },
  {
    Icon: IconChart,
    title: "Laba Rugi & Arus Kas",
    desc: "Laporan tersusun sendiri dari catatan harian, lengkap dengan saldo kas dan margin keuntungan.",
  },
  {
    Icon: IconPot,
    title: "Biaya Produksi per Barang",
    desc: "Hitung tanah liat, upah, kayu bakar, dan kemasan — supaya harga jual tidak lagi ditebak.",
  },
  {
    Icon: IconShare,
    title: "Invoice PDF Siap Kirim",
    desc: "Buat invoice rapi lengkap dengan terbilang, lalu kirim ke pembeli lewat WhatsApp.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <span className="font-display text-2xl leading-none text-charcoal">GERABAH</span>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="px-3 py-2 font-medium text-charcoal">
            Masuk
          </Link>
          <Link href="/signup" className="btn btn-primary !min-h-[40px] !text-sm">
            Daftar
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 pb-14 pt-10 text-center sm:pt-16">
          <span className="inline-block rounded-full bg-sand px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-clay">
            Untuk UMKM Kerajinan Gerabah
          </span>
          <h1 className="mt-5 font-display text-[38px] leading-[1.08] text-charcoal sm:text-[56px]">
            Pembukuan usaha gerabah, cukup dari HP.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-lg">
            Catat setiap uang masuk dan keluar, ketahui untung ruginya, dan cetak invoice untuk pembeli — tanpa perlu
            komputer atau pelatihan akuntansi.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn btn-primary">
              Mulai Gratis
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sudah Punya Akun
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-3xl gap-3 px-5 pb-16 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-[15px] font-bold text-charcoal">{title}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border bg-sand px-5 py-14 text-center">
          <p className="mx-auto max-w-lg font-display text-[26px] leading-snug text-charcoal">
            &ldquo;Usaha yang tercatat rapi lebih mudah berkembang — dan lebih dipercaya saat mengajukan
            pembiayaan.&rdquo;
          </p>
        </section>
      </main>

      <footer className="px-5 py-8 text-center text-[12px] leading-relaxed text-muted">
        GERABAH — pendampingan literasi keuangan digital untuk pengrajin gerabah
        <br />
        Desa Sitiwinangun, Kabupaten Cirebon.
      </footer>
    </div>
  );
}
