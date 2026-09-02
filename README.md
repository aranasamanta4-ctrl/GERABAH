# GERABAH

Aplikasi pencatatan keuangan sederhana untuk UMKM kerajinan gerabah, dipakai langsung dari HP (PWA). Dibangun untuk program pengabdian masyarakat PPMI KKSIK ITB di Desa Sitiwinangun, Kabupaten Cirebon.

## Tech stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **PostgreSQL di Supabase** + **Prisma 7** (`@prisma/adapter-pg`)
- **Tailwind CSS v4**, palet terracotta/clay/cream
- Auth custom (JWT di httpOnly cookie, bcrypt) — bukan NextAuth
- Invoice PDF via `pdf-lib` (generate di server)
- Bahasa UI: Bahasa Indonesia

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:3000
```

Butuh file `.env` dengan `DATABASE_URL` (Supabase) dan `AUTH_SECRET`. Database menyambung ke Supabase, jadi datanya persistent.

Kalau skema database berubah:

```bash
npx prisma migrate dev --name <nama_perubahan>   # butuh Session pooler, port 5432
npx prisma generate
```

## Dokumentasi

| | |
|--|--|
| [`docs/STATUS-PROYEK.md`](./docs/STATUS-PROYEK.md) | Status lengkap: fitur, struktur kode, infrastruktur, cara lanjut. **Mulai dari sini.** |
| [`docs/PENDING.md`](./docs/PENDING.md) | Yang belum selesai & blocker sebelum production. |
| [`docs/`](./docs/) | Indeks dokumentasi lain. |

## Deploy

Vercel (region `icn1`/Seoul, dekat database). `postinstall` menjalankan `prisma generate`. Lihat `docs/PENDING.md` untuk hal yang wajib diselesaikan sebelum production (upload media, `AUTH_SECRET`, env Vercel).
