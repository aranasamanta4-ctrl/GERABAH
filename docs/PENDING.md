# GERABAH — Hal yang Masih Pending

**Terakhir diperbarui:** 3 September 2026

Daftar pekerjaan yang belum selesai / perlu diperhatikan. Urutan kira-kira dari yang paling penting. Konteks lengkap tiap fitur ada di [`STATUS-PROYEK.md`](./STATUS-PROYEK.md).

---

## 🔴 Blocker sebelum production

### 1. Upload foto/video belum jalan di production
- **Masalah:** `src/lib/upload.ts` menyimpan file ke `public/uploads/` di disk server. Filesystem Vercel serverless tidak permanen — file hilang antar-request/deploy. Foto produk sekarang tampil menonjol di katalog, jadi ini terasa.
- **Solusi termudah:** pindah ke **Supabase Storage** (sudah pakai Supabase untuk database, tidak perlu layanan baru).
- **Alternatif:** hosting dengan volume permanen (Railway) — kode tidak berubah, tinggal mount volume ke `public/uploads`.
- **Status:** belum dikerjakan.

### 2. `AUTH_SECRET` masih nilai dev
- Di `.env` masih `dev-only-insecure-secret-change-me`.
- **Wajib:** ganti dengan string acak kuat sebelum production, lalu set juga di Environment Variables Vercel.
- **Status:** belum diganti.

### 3. Environment variables di Vercel
- Pastikan `DATABASE_URL` (Transaction pooler, port `6543`, `?pgbouncer=true`) dan `AUTH_SECRET` sudah diset di Vercel.
- Redeploy setiap kali skema database berubah.

---

## 🟡 Perlu verifikasi

### 4. Layar setelah login belum diverifikasi visual di browser
- Build, typecheck, dan lint bersih. Halaman publik (landing/login/signup) sudah dicek.
- **Belum pernah dilihat dengan data asli:** Beranda, Keuangan, Laporan, detail Penjualan, detail Pesanan.
- Perlu login + data contoh untuk mengecek.

### 5. Invoice PDF di HP asli
- Sudah diuji lewat `scripts/preview-invoice.ts`, belum dites end-to-end (unduh + share ke WhatsApp) di HP asli.

---

## 🟢 Kebersihan / nice-to-have

### 6. Tabel orphan di skema Prisma
- Model `Post` / `PostLike` / `PostComment` / `PostSave` dan `Order.sourcePostId` masih ada di `prisma/schema.prisma` walau fitur Komunitas sudah dihapus.
- Dibiarkan karena menghapusnya butuh migrasi berisiko. Tabel menganggur tidak mengganggu. Bersihkan kalau nanti ada migrasi lain sekalian.

### 7. Branch `mobile-ui-invoice-pdf` sudah tidak dipakai
- Sudah di-merge ke `main`. Hapus lokal + remote:
  ```bash
  git branch -d mobile-ui-invoice-pdf && git push origin --delete mobile-ui-invoice-pdf
  ```

### 8. Dokumen lama di `docs/archive/`
- `UIUX-Spec-Stage2.md` (16 layar, termasuk Komunitas) dan `Database-Schema-Stage3.md` **sudah tidak sesuai** aplikasi sekarang. Disimpan hanya sebagai jejak sejarah. Sumber kebenaran: `prisma/schema.prisma` dan kode.

### 9. `README.md` root
- Sebelumnya isi boilerplate `create-next-app`. Sudah diganti ringkas — cek apakah perlu ditambah.

---

## Catatan akun & akses

- **Supabase:** akun `a.fhardhanwijaya14@gmail.com`, project ref `xmzvuyuklhdxxwmuvbtk`, region Seoul (`ap-northeast-2`).
- **GitHub repo:** https://github.com/aranasamanta4-ctrl/GERABAH — dua akun (`mamamam111` = identitas git default di komputer ini, `aranasamanta4-ctrl` = pemilik repo), keduanya orang yang sama.
- **Hosting:** Vercel, region dikunci ke `icn1` (Seoul) lewat `vercel.json`.
- **Migrasi database:** butuh Session pooler (port `5432`, tanpa `?pgbouncer=true`) — lihat catatan lengkap di `STATUS-PROYEK.md`.
