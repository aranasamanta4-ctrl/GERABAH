# GERABAH — Status Proyek & Catatan Lanjutan

Dokumen ini rangkuman pengembangan sampai titik ini, supaya bisa dilanjutkan kapan saja.

**Terakhir diperbarui:** 2 September 2026

---

## Ringkasan Proyek

**GERABAH** — aplikasi pencatatan keuangan sederhana untuk UMKM kerajinan gerabah, dipakai langsung dari HP. Dirancang mengikuti proposal pengabdian masyarakat PPMI KKSIK ITB: *"Pemberdayaan UMKM Kerajinan Gerabah melalui Literasi Keuangan dan Pemanfaatan Aplikasi Digital untuk Pencatatan Keuangan di Desa Sitiwinangun, Kabupaten Cirebon"*.

Sasaran penggunanya pelaku usaha dengan literasi digital terbatas, jadi prioritas desainnya: bahasa awam (bukan istilah akuntansi), tombol besar, alur pendek, dan bisa dipasang di layar utama HP.

**Dokumen referensi** (lihat juga `docs/README.md`):
- `docs/reference/Proposal-PPMI-2026.pdf` — proposal PPMI, sumber kebenaran untuk cakupan fitur
- `docs/archive/Bisa.docx` — master prompt/requirement awal
- `docs/archive/UIUX-Spec-Stage2.md` — spesifikasi UI/UX awal (**sudah banyak berubah**, lihat catatan di bawah)
- `docs/archive/Database-Schema-Stage3.md` — draft skema awal (**sudah berbeda**; sumber kebenaran terbaru adalah `prisma/schema.prisma`)

> File di `docs/reference/` (`Proposal-PPMI-2026.pdf`, `Booklet-StudioMastori-K02.pdf`, `GERABAH-Data-AppSheet.xlsx`) **sengaja tidak di-commit** ke git (file besar / dokumen referensi, bukan kode). Isi `docs/archive/` di-commit karena kecil dan berguna sebagai jejak sejarah.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions)
- **Database**: PostgreSQL di **Supabase**
- **ORM**: Prisma 7 (driver adapter `@prisma/adapter-pg`)
- **Styling**: Tailwind CSS v4, palet terracotta/clay/cream
- **PDF**: `pdf-lib` (generate invoice di server, tanpa browser)
- **Auth**: custom (bukan NextAuth) — JWT di httpOnly cookie, password di-hash bcrypt
- **Font**: Plus Jakarta Sans (teks) + Instrument Serif (judul)
- **Bahasa UI**: Bahasa Indonesia

## Fitur yang Sudah Selesai

1. **Auth & Onboarding** — signup/login/logout, buat usaha dengan kategori/channel/metode pembayaran default (auto-seed saat usaha dibuat)
2. **Keuangan** — catat Uang Masuk / Uang Keluar, kategori bisa custom, daftar transaksi dikelompokkan per tanggal, saldo kas usaha
3. **Produk** — katalog, biaya produksi per komponen (bahan baku/tenaga kerja/kemasan/lain-lain), untung & margin per barang dihitung otomatis, upload foto/video, penyesuaian stok cepat (+/− atau input jumlah)
4. **Penjualan** — pencatatan penjualan yang otomatis mengurangi stok produk **dan** membuat transaksi uang masuk di Keuangan
5. **Pesanan** — pipeline status (Baru→Dikonfirmasi→Diproses→Siap→Selesai), DP & sisa pembayaran, saat "Selesai" otomatis membuat Penjualan
6. **Pelanggan** — CRM ringan, riwayat pembelian, total belanja, piutang
7. **Beranda** — untung/rugi periode berjalan, uang masuk vs keluar, pesanan jatuh tempo, produk terlaris, penjualan per tempat jualan, insight otomatis berbasis aturan
8. **Laporan** — **Laba Rugi Sederhana** (pendapatan & pengeluaran per kategori → laba bersih + margin) dan **Arus Kas Sederhana** (saldo awal → kas masuk/keluar → saldo akhir), periode mingguan/bulanan/tahunan, export CSV
9. **Invoice PDF** — generate invoice (penjualan) dan nota pesanan, lengkap dengan rincian barang, total, status bayar, **terbilang**, dan kolom tanda tangan. Bisa diunduh atau dikirim langsung ke WhatsApp lewat Web Share API
10. **Aplikasi HP (PWA)** — bisa dipasang ke layar utama (standalone, ikon gerabah, shortcut "Catat uang masuk/keluar"), tab bar bawah dengan tombol catat di tengah, aman terhadap notch/gesture bar
11. **Delete produk yang aman** — produk dengan riwayat transaksi diarsipkan (bukan dihapus permanen) supaya laporan lama tetap benar

### Perubahan dari rencana awal

- **Inventory (bahan baku) dihapus** atas permintaan user — stok dikelola langsung per-produk di halaman Produk. Tabel `InventoryItem`/`InventoryTransaction`/`InventoryUnit` sudah dibuang dari skema.
- **Komunitas / social commerce dihapus** atas permintaan user, karena di luar cakupan proposal PPMI. Yang dihapus: halaman `community`, `explore`, halaman produk publik + alur "Pesan Sekarang", dan server action terkait.
  **Catatan:** model `Post`/`PostLike`/`PostComment`/`PostSave` **sengaja dibiarkan** di `prisma/schema.prisma`. Menghapusnya butuh migrasi dan berisiko, sementara tabel yang menganggur tidak mengganggu apa pun. `Order.sourcePostId` juga masih ada tapi tidak pernah diisi lagi.
- `UIUX-Spec-Stage2.md` menjelaskan 16 layar termasuk Komunitas — **sudah tidak sesuai** dengan aplikasi sekarang.

## Struktur Kode Penting

**Data & logika**
- `prisma/schema.prisma` — skema database (PostgreSQL)
- `src/lib/prisma.ts` — koneksi Prisma Client via adapter `@prisma/adapter-pg`
- `src/lib/auth.ts` — session/JWT helpers
- `src/lib/actions/*.ts` — server actions per modul (products, sales, orders, finance, customers)
- `src/lib/labels.ts` — mapping status internal (Inggris, dipakai di logic) ke label tampilan (Indonesia)
- `src/lib/format.ts` — format Rupiah, tanggal, dan nomor invoice
- `src/lib/upload.ts` — simpan file upload ke `public/uploads/` (⚠️ bermasalah di hosting serverless — lihat di bawah)

**Invoice PDF**
- `src/lib/invoice-pdf.ts` — layout invoice + fungsi `terbilang()`
- `src/lib/invoice-response.ts` — bungkus PDF jadi HTTP response
- `src/app/api/invoice/sale/[id]/route.ts` dan `.../order/[id]/route.ts` — endpoint-nya. Tambahkan `?download=1` untuk memaksa unduh, tanpa itu PDF dibuka inline (lebih enak di HP karena bisa langsung di-share)
- `scripts/preview-invoice.ts` — generate invoice contoh tanpa perlu database, untuk mengecek desainnya:
  ```bash
  npx tsx scripts/preview-invoice.ts   # hasil: scripts/preview-invoice.pdf
  ```

**UI**
- `src/app/globals.css` — design token + class dasar (`.card`, `.btn`, `.field`, `.label`)
- `src/components/ui.tsx` — komponen tampilan dipakai ulang (Card, Stat, Row, List, Pill, EmptyState, Tip)
- `src/components/icons.tsx` — set ikon SVG inline
- `src/components/page-header.tsx`, `sheet.tsx`, `mobile-nav.tsx`, `sidebar-nav.tsx` — kerangka navigasi
- `src/app/manifest.ts` + `public/icon-*.png` + `src/app/apple-icon.png` — PWA
- `scripts/make-icons.py` — generate ulang semua ikon PWA (jalankan kalau warna/logo berubah):
  ```bash
  python scripts/make-icons.py
  ```
- `src/app/(app)/` — halaman yang butuh login (sidebar di desktop, tab bar di HP)

## Infrastruktur Saat Ini

- **Database**: Supabase Postgres, akun **a.fhardhanwijaya14@gmail.com**, project ref `xmzvuyuklhdxxwmuvbtk`, region `ap-northeast-2` (Seoul). Connection string ada di `.env` lokal (**tidak ditulis di sini demi keamanan** — ambil dari dashboard Supabase → Connect → ORMs → Prisma).
- **Kode**: https://github.com/aranasamanta4-ctrl/GERABAH
- **Hosting**: Vercel sudah dikonfigurasi (`vercel.json` mengunci region ke `icn1`/Seoul supaya dekat database, `postinstall` menjalankan `prisma generate` saat deploy). Cek status deploy terakhir di dashboard Vercel.
- **Git lokal**: repo dibuat khusus di dalam folder project ini (bukan repo lama yang root-nya di `C:\Users\LENOVO` — itu sengaja dihindari karena berisiko ikut nge-track file pribadi).

### Status branch

Pekerjaan UI mobile + invoice PDF + hapus Komunitas **sudah di-merge ke `main`** (PR #1 dan #2, commit terakhir `c77dd1a`). `main` lokal sejajar dengan `origin/main`.

Branch `mobile-ui-invoice-pdf` (lokal + remote) sudah tidak dipakai dan aman dihapus:
```bash
git branch -d mobile-ui-invoice-pdf && git push origin --delete mobile-ui-invoice-pdf
```

Daftar hal yang belum selesai ada di [`PENDING.md`](./PENDING.md).

## Yang PERLU Diperhatikan

1. **⚠️ Upload foto/video belum akan jalan di production.** `src/lib/upload.ts` menyimpan file ke `public/uploads/` di disk server, padahal filesystem Vercel serverless tidak permanen — file hilang antar-request/deploy. Karena foto produk sekarang tampil menonjol di katalog, ini jadi masalah yang cukup terasa.
   Solusi termudah: pindah ke **Supabase Storage** (sudah pakai Supabase untuk database, jadi tidak perlu layanan baru). Alternatif: hosting dengan volume permanen (Railway) — kode tidak perlu diubah, tinggal mount volume ke `public/uploads`.
2. **`AUTH_SECRET`** di `.env` masih nilai dev (`dev-only-insecure-secret-change-me`) — **wajib diganti** string acak yang kuat sebelum production, dan diset juga di environment variables Vercel.
3. **Layar setelah login belum pernah diverifikasi visual di browser.** Build, typecheck, dan lint bersih, dan halaman publik (landing/login/signup) sudah dicek langsung. Tapi Beranda, Keuangan, Laporan, dan detail Penjualan/Pesanan belum pernah dilihat dengan data asli — perlu login untuk mengeceknya.
4. **Dua akun GitHub**: `mamamam111` (identitas git default di komputer ini) dan `aranasamanta4-ctrl` (pemilik repo GERABAH) — keduanya milik orang yang sama. Push pertama dulu baru berhasil setelah credential lama (`mamamam111`) dihapus dari Windows Credential Manager supaya bisa login ulang sebagai `aranasamanta4-ctrl`.

## Cara Lanjutkan Development Lokal

```bash
cd "C:\Users\LENOVO\Downloads\APK Cata Uang UMKM Gerabah"
npm run dev
```
Buka `http://localhost:3000`. Database menyambung ke Supabase (bukan SQLite lokal lagi), jadi datanya persistent walau server di-restart.

Untuk mencoba tampilan HP: buka DevTools → toggle device toolbar → pilih ukuran ponsel. Breakpoint `sm:` (640px) yang memisahkan tampilan HP dan desktop.

Kalau ada perubahan skema database:
```bash
npx prisma migrate dev --name <nama_perubahan>
npx prisma generate
```

### ⚠️ Penting: dua mode koneksi Supabase pooler

`DATABASE_URL` yang dipakai sehari-hari (di `.env` lokal dan di Vercel) pakai **Transaction pooler (port 6543, `?pgbouncer=true`)** — cocok untuk banyak koneksi pendek dari aplikasi yang jalan. **Session pooler (port 5432)** sempat dipakai di awal tapi limitnya cuma 15 koneksi bersamaan, gampang penuh (pernah kejadian error `EMAXCONNSESSION` / "max clients reached").

`prisma migrate dev`/`migrate deploy` **butuh Session pooler (port 5432)**, bukan Transaction pooler, karena migrasi butuh fitur level-session yang tidak didukung mode transaction. Kalau mau jalankan migrasi baru:
1. Sementara ganti `DATABASE_URL` di `.env` ke versi port `5432` (tanpa `?pgbouncer=true`)
2. Jalankan `npx prisma migrate dev --name ...`
3. Balikin lagi `DATABASE_URL` ke versi port `6543` (`?pgbouncer=true`) untuk pemakaian normal
4. Jangan lupa update juga `DATABASE_URL` di Vercel kalau skemanya berubah (redeploy setelahnya)
