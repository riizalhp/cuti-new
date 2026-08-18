# Pusat Bantuan Employr — faq.employr.id

Situs **Pusat Bantuan / FAQ** untuk platform Employr, sekaligus sumber jawaban untuk
**Chat Customer Service (Herdi)** di pojok kanan bawah dashboard pengguna.

- Konten artikel: `../../packages/faq/content/*.md` (satu sumber kebenaran)
- Mesin pencari jawaban: `../../packages/faq/src/search.ts` (TF-IDF + cosine similarity — tanpa LLM/AI)
- Runtime: Next.js 15+ (App Router) di port `3005`

## Development (lokal)

```bash
pnpm --filter @cuti/faq-site dev
# → http://localhost:3005
```

### Env untuk development lokal

Buat `.env.local` di `apps/faq/` (opsional — nilai default sudah benar untuk dev):

```env
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3005
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Environment (DEV / STAGING / PROD)

Situs yang sama dipakai untuk tiga environment. Yang membedakan hanya variabel env:

| Environment | `NEXT_PUBLIC_ENV` | Contoh URL | Badge di header |
|---|---|---|---|
| Development | `development` | `dev.faq.employr.id` atau `localhost:3005` | `DEV` (hijau) |
| Staging | `staging` | `staging.faq.employr.id` | `STAGING` (kuning) |
| Production | `production` | `https://faq.employr.id` | `PROD` (biru) |

Badge environment tampil di header agar tester/developer tidak salah membedakan versi.

### Build & deploy per environment

```bash
# Production
NEXT_PUBLIC_ENV=production NEXT_PUBLIC_SITE_URL=https://faq.employr.id NEXT_PUBLIC_APP_URL=https://app.employr.id pnpm --filter @cuti/faq-site build

# Staging
NEXT_PUBLIC_ENV=staging NEXT_PUBLIC_SITE_URL=https://staging.faq.employr.id NEXT_PUBLIC_APP_URL=https://staging.app.employr.id pnpm --filter @cuti/faq-site build

# Development
NEXT_PUBLIC_ENV=development NEXT_PUBLIC_SITE_URL=https://dev.faq.employr.id NEXT_PUBLIC_APP_URL=http://localhost:3000 pnpm --filter @cuti/faq-site build
```

> Catatan penting: variabel `NEXT_PUBLIC_*` di-bundle saat build. Setiap environment
> harus di-build terpisah dengan env-nya masing-masing (sesuai praktik Vercel/VPS).

### Cara menjalankan hasil build

```bash
pnpm --filter @cuti/faq-site start   # → http://localhost:3005
```

## Struktur halaman

- `/` — beranda: hero + pencarian + kategori + artikel terbaru
- `/kategori/[slug]` — daftar artikel per kategori
- `/artikel/[slug]` — halaman artikel (render markdown)
- `/cari?q=...` — hasil pencarian (memakai mesin yang sama dengan chat CS)

## Menambah / mengedit artikel

Artikel adalah file markdown di `packages/faq/content/`. Format:

```md
---
title: Judul Artikel
description: Ringkasan singkat untuk kartu & hasil pencarian.
category: lamaran-kerja
order: 1
updatedAt: 2026-08-18
keywords: tracker, lamaran, kanban, status
---

# (isi markdown di sini)
```

- `category` harus salah satu dari `packages/faq/src/categories.ts`.
- `order` mengontrol urutan di dalam kategori.
- Artikel langsung dipakai oleh situs FAQ **dan** chat Herdi (tanpa perlu build terpisah).

## Integrasi dengan Chat Customer Service

Chat Herdi di dashboard (`apps/dashboard`) memanggil endpoint
`POST /api/faq-chat` yang mengimpor paket `@cuti/faq` yang sama. Jadi:

- Setiap artikel baru langsung memperluas kemampuan jawab chat.
- Tidak ada biaya API/AI — murni pencarian kata kunci statistik (IR klasik).
- Jawaban chat selalu menyertakan tautan ke artikel lengkap di situs ini.
