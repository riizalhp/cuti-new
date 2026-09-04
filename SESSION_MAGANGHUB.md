# SESSION_MAGANGHUB — lanjutkan besok

Tanggal: 3 Sep 2026 (Batch 2 Magang Nasional dibuka 3–8 Sep 2026)

## 1. Yang sudah ditemukan (reverse-engineer)
- Halaman target: `https://maganghub.kemnaker.go.id/magang-nasional/lowongan?keyword=jahit`
- Stack MagangHub: Next.js 16.2.9 + Turbopack, data di-load via JS (`/_next/static/chunks/*.js`), HTML awal cuma shell + spinner.
- Proteksi: Cloudflare + Alibaba WAF (`Set-Cookie: acw_tc`), direct `curl`/`python requests`/`webfetch` dari environment ini → `404 page not found` / timeout. Subdomain `organizer.maganghub.kemnaker.go.id` masih `200 OK` (bukan internet mati).
- API lama mati untuk publik: `GET /be/v1/api/list/vacancies-aktif` → `{"failed":"...","type":"UnauthorizedException"}`. Berlaku juga untuk `/companies`, `/provinces`, `/cities`.
- API baru: base `https://api.kemnaker.go.id`, path terlihat di chunk JS:
  - `/maganghub/onboarding/v2/provinces`, `/cities`, `/companies/search`
  - `/maganghub/vacancy/v2/study-programs`
  - `/maganghub/recruitment/v2/vacancies/{id}/applications/me`
  - Endpoint LIST lowongan tidak ada di JS client → kemungkinan Server Component/Server Action + `accessToken`. Tebakan `/vacancy/v2/vacancies` dan `/recruitment/v2/vacancies` → `404`.
- `?keyword=jahit` adalah state frontend (Next.js searchParams), bukan param backend 1:1. Param backend asli harus disadap via DevTools > Network > XHR.
- Cache Google masih dapat homepage (Perawat, Asisten Produksi, Data Analytics BRI, Pengelola Data) → data memang bisa di-scrape dari browser lokal Indonesia.

## 2. Data yang bisa diambil
- List: `positionName`, `organizer.name`, lokasi, kuota (`jumlah_kuota`), pendidikan (Diploma/Sarjana/Profesi), hari kerja (5/6 hari/minggu), URL detail.
- Detail: deskripsi, kualifikasi, skill, hari libur, durasi 6 bulan, bidang, tunjangan/UMK/BPJS/sertifikat, maps, profil perusahaan, alur lamaran, batch/cohort.
- Butuh login SIAPkerja: tombol `Lamar Sekarang`, status lamaran.

## 3. Keputusan user (jawab via prompt)
- Sumber: **semua lowongan** (scrape banyak, filter keyword lokal di portal/API).
- Jadwal: **cron backend**.
- Portal: **tetap Astro** (`apps/portal-loker`), tidak ganti framework.

## 4. Rencana integrasi ke D:\cuti
- DB siap: `packages/db/prisma/schema.prisma` → `jobs` (342) + `companies` (260). Mapping: `title→jobs.title`, `organizer→companies.name`, `lokasi→jobs.location`, `kuota/pendidikan/hari kerja→jobs.requirements (JSON)`, `url detail→jobs.external_url`, `deskripsi→jobs.description`.
- Backend: buat `apps/api/src/maganghub/` (service + controller + cron `@nestjs/schedule` tiap 4–6 jam, upsert dedupe by `external_url`/`slug`). `GET /maganghub/lowongan` baca dari DB lokal, jangan hit MagangHub tiap request.
- Portal: `apps/portal-loker/src/components/LowonganSection.astro` (sekarang hardcode 4 card) → ubah jadi terima `props jobs` dan loop ke `.card.card-row` yang sama + badge `MagangHub` + link `target=_blank rel=nofollow`. `src/pages/index.astro:30` fetch API pas build.
- Etika: cantum `Sumber: MagangHub Kemnaker` + link balik, rate-limit, hormati TOS/robots, siap hapus jika diminta.

## 5. Next step besok
1. Cari endpoint list asli via browser lokal (DevTools Network, filter `vacanc`/`api.kemnaker` sambil ketik keyword).
2. Scaffold `apps/api/src/maganghub/` + tambah ke `app.module.ts`.
3. Refactor `LowonganSection.astro` + `index.astro`.
4. Tambah kolom `source` di `jobs` bila perlu (atau pakai `requirements` JSON dulu).
