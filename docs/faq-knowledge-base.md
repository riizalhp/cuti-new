# Employr FAQ — Pusat Bantuan (faq.employr.id) & Chat Customer Service

Dokumen ini menjelaskan sistem **Pusat Bantuan / Knowledge Base** Employr:

1. **Situs dokumentasi** `faq.employr.id` (blog panduan penggunaan sistem — lengkap tanpa terlewat satu fitur pun).
2. **Chat Customer Service (Herdi)** di pojok kanan bawah dashboard user — yang menjawab **tanpa AI/LLM**, memakai retrieval (RAG klasik: TF-IDF + cosine similarity) atas konten Pusat Bantuan yang sama.

---

## 1. Arsitektur Singkat

```
packages/faq/            ← SUMBER KEBENARAN (satu konten, dua konsumen)
├── content/*.md         ← 27 artikel panduan (frontmatter + markdown)
└── src/
    ├── loader.ts        ← baca & parse artikel dari disk
    ├── markdown.ts      ← renderer markdown minimal (tanpa dependency)
    ├── search.ts        ← TF-IDF + cosine similarity (retrieval, BUKAN LLM)
    ├── categories.ts    ← 8 kategori artikel
    └── index.ts         ← export publik

apps/faq/                ← SITUS FAQ (faq.employr.id) — Next.js, port 3005
├── app/                 ← halaman: /, /kategori/[slug], /artikel/[slug], /cari
└── lib/site.ts          ← konfigurasi environment (development/staging/production)

apps/dashboard/          ← DASHBOARD USER (port 3000)
└── app/api/faq-chat/    ← endpoint chat CS (memakai packages/faq search)
└── components/ai/FloatingAiAssistant.tsx  ← widget Herdi (klien chat)
```

**Alur chat CS:**

```
Pengguna ketik pertanyaan di widget Herdi
        ↓  POST /api/faq-chat  { query }
packages/faq → searchFaq(query)
        ↓  TF-IDF + cosine similarity atas 27 artikel
Artikel paling relevan (skor ≥ 0.15 & ada kata cocok)
        ↓
Balasan teks + saran artikel terkait + tautan ke faq.employr.id/artikel/[slug]
```

Tidak ada panggilan ke API AI eksternal, tidak ada biaya per token, deterministik,
offline, dan selalu merujuk ke sumber resmi.

---

## 2. Konten Knowledge Base

### 2.1 Kategori & artikel (27 artikel)

| Kategori | Slug | Jumlah | Topik |
|---|---|---|---|
| Memulai | `memulai` | 4 | Apa itu Employr, daftar & masuk, onboarding, profil & pengaturan |
| CV & Dokumen | `cv-dokumen` | 5 | CV Builder, cetak PDF, skor ATS, CV by HRD, surat lamaran |
| Evaluasi & Optimasi | `evaluasi-optimasi` | 3 | Evaluasi CV (11 persona), kecocokan lowongan, optimasi LinkedIn |
| Lamaran Kerja | `lamaran-kerja` | 4 | Tracker, scraper lowongan, cari lowongan, panduan interview |
| Misi, Reward & Referral | `misi-reward` | 2 | Misi & Cuan, referral |
| Pengembangan Karier | `pengembangan-karier` | 3 | Career Readiness, kursus & sertifikasi, latihan soal |
| Membership & Pembayaran | `membership-pembayaran` | 3 | Paket & harga, cara pembayaran, voucher & promo |
| Akun & Bantuan | `akun-bantuan` | 3 | Keamanan akun, kendala umum, hubungi CS |

### 2.2 Format artikel

Setiap artikel adalah file markdown dengan frontmatter YAML sederhana:

```md
---
title: Judul Artikel
description: Ringkasan untuk kartu & hasil pencarian chat.
category: lamaran-kerja        # slug kategori di categories.ts
order: 1                        # urutan dalam kategori
updatedAt: 2026-08-18
keywords: tracker, lamaran, kanban, status
---

Isi artikel dalam markdown (heading, list, bold, link, blockquote, dll).
```

> Mengubah/menambah artikel di `packages/faq/content/` **langsung** memperbarui
> situs FAQ dan kemampuan jawab chat Herdi — tanpa langkah tambahan.

### 2.3 Validasi konten

```bash
cd packages/faq
npx tsx scripts/validate.mts
```

Memeriksa: jumlah artikel, kategori valid, slug unik, frontmatter lengkap,
render markdown sukses, dan hasil pencarian untuk query umum.

---

## 3. Situs FAQ — faq.employr.id (dev / staging / production)

Satu aplikasi `apps/faq` dipakai untuk ketiga environment. Yang membedakan hanya
variabel `NEXT_PUBLIC_*` (di-bundle saat build, jadi setiap environment di-build terpisah).

### 3.1 Environment & domain

| Environment | `NEXT_PUBLIC_ENV` | Contoh URL | Badge di header |
|---|---|---|---|
| Development | `development` | `http://localhost:3005` / `dev.faq.employr.id` | `DEV` (hijau) |
| Staging | `staging` | `staging.faq.employr.id` | `STAGING` (kuning) |
| Production | `production` | `https://faq.employr.id` | `PROD` (biru) |

Badge environment tampil di header situs agar tester tidak salah membedakan versi.

### 3.2 Variabel env

| Variabel | Fungsi | Default |
|---|---|---|
| `NEXT_PUBLIC_ENV` | `development` / `staging` / `production` | dari `NODE_ENV` |
| `NEXT_PUBLIC_SITE_URL` | Base URL situs FAQ (canonical/OG) | `https://faq.employr.id` |
| `NEXT_PUBLIC_APP_URL` | URL dashboard user (tombol "Buka Dashboard") | `http://localhost:3000` (dev) / `https://app.employr.id` (prod) |
| `FAQ_CONTENT_DIR` | Override lokasi folder konten (untuk deploy mandiri) | auto-resolve dari monorepo |

### 3.3 Menjalankan

```bash
# Development (lokal)
pnpm --filter @cuti/faq-site dev          # → http://localhost:3005

# Build per environment
NEXT_PUBLIC_ENV=production NEXT_PUBLIC_SITE_URL=https://faq.employr.id NEXT_PUBLIC_APP_URL=https://app.employr.id \
  pnpm --filter @cuti/faq-site build

NEXT_PUBLIC_ENV=staging NEXT_PUBLIC_SITE_URL=https://staging.faq.employr.id NEXT_PUBLIC_APP_URL=https://staging.app.employr.id \
  pnpm --filter @cuti/faq-site build

# Jalankan hasil build
pnpm --filter @cuti/faq-site start
```

### 3.4 Halaman situs

| Halaman | Keterangan |
|---|---|
| `/` | Hero + pencarian + grid 8 kategori + artikel terbaru + CTA tanya Herdi |
| `/kategori/[slug]` | Daftar artikel per kategori |
| `/artikel/[slug]` | Halaman artikel (markdown ter-render, breadcrumb, artikel terkait) |
| `/cari?q=...` | Hasil pencarian (menggunakan mesin yang sama dengan chat CS) |

---

## 4. Chat Customer Service (Herdi) — tanpa AI

### 4.1 Cara kerja

Widget **Herdi** (karakter di pojok kanan bawah dashboard) memanggil endpoint
`POST /api/faq-chat` dengan body `{ "query": "..." }`. Endpoint ini:

1. Menjalankan `searchFaq(query)` dari `packages/faq` — TF-IDF + cosine similarity.
2. Jika ada artikel dengan skor ≥ `0.15` **dan** minimal 1 kata kunci query cocok
   dengan artikel → balasan berisi: ringkasan panduan, langkah penting (poin-poin
   dari artikel), dan tautan "Baca panduan lengkap" ke situs FAQ.
3. Jika tidak ada yang cocok → balasan fallback yang menyarankan kata kunci lain
   dan saluran kontak CS (email).
4. Selalu mengembalikan `suggestions` (judul artikel terkait) yang tampil sebagai
   chip di widget — sekali klik, pertanyaan baru otomatis diajukan.

### 4.2 Kenapa bukan AI?

- **Murah & gratis** — tidak ada biaya token/API.
- **Cepat & offline** — murni perhitungan lokal, respons instan.
- **Deterministik** — jawaban sama untuk pertanyaan yang sama (mudah diuji).
- **Akurat & terarah** — selalu merujuk ke artikel resmi, tidak berhalusinasi.
- **Privasi** — pertanyaan tidak dikirim ke pihak ketiga.

### 4.3 Uji endpoint

```bash
curl -X POST http://localhost:3000/api/faq-chat \
  -H "Content-Type: application/json" \
  -d '{"query":"cara cetak CV ke PDF"}'
```

Contoh respons:

```json
{
  "text": "Berikut panduan singkatnya (CV & Dokumen):\n\n**Cara Cetak / Download CV ke PDF**\n\n...",
  "answered": true,
  "title": "Cara Cetak / Download CV ke PDF",
  "slug": "cara-cetak-cv-pdf",
  "score": 0.25,
  "hits": [ ... ],
  "suggestions": [ ... ]
}
```

### 4.4 Tuning

- Ambang relevansi: `MIN_SCORE` di `packages/faq/src/search.ts` (default `0.15`).
- Stopword Bahasa Indonesia di file yang sama.
- Bobot judul/deskripsi/keyword lebih tinggi daripada body artikel (lihat
  `documentText()`), sehingga kecocokan topik diutamakan.

---

## 5. Peta file

```
packages/faq/
├── package.json / tsconfig.json
├── content/                     ← 27 artikel markdown
├── scripts/validate.mts         ← validasi konten & uji pencarian
└── src/
    ├── types.ts  categories.ts  loader.ts  markdown.ts  search.ts  index.ts

apps/faq/
├── package.json  next.config.ts  tsconfig.json  postcss.config.mjs
├── README.md                     ← panduan deploy dev/staging/prod
├── app/  layout.tsx  globals.css  page.tsx
│   ├── artikel/[slug]/page.tsx
│   ├── kategori/[slug]/page.tsx
│   └── cari/page.tsx
├── components/  Header.tsx  Footer.tsx  ArticleCard.tsx  SearchBox.tsx  ThemeToggle.tsx  Providers.tsx
└── lib/site.ts

apps/dashboard/
├── app/api/faq-chat/route.ts     ← endpoint chat CS (RAG, tanpa LLM)
└── components/ai/FloatingAiAssistant.tsx  ← widget Herdi (diperbarui)
```

---

## 6. Roadmap / pengembangan lanjut

- **Pelacakan feedback** — tambahkan tombol "Jawaban membantu?" pada balasan chat
  untuk memperbaiki konten.
- **Analitik pencarian** — catat query yang tidak terjawab agar artikel baru
  dibuat untuk topik tersebut.
- **Multi-bahasa** — struktur konten sudah mendukung; tinggal tambah field `lang`.
- **Sinonim / stemming ringan** — jika kualitas pencarian perlu ditingkatkan tanpa
  AI, bisa tambah kamus sinonim Bahasa Indonesia di `search.ts`.
