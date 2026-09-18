# Daftar Sumber Scraping (Acuan Link)

Dokumen ini adalah acuan utama untuk bot scraper Employr. Semua link di bawah
adalah sumber data yang akan di-scrape secara berkala (cron 01.00 WIB) untuk
konten berbasis artikel: **lowongan kerja, event/job fair, artikel blog, dan
sertifikasi/pelatihan**.

Aturan umum:

- Hanya scrape halaman publik / feed publik. Tidak bypass login, CAPTCHA,
  atau anti-bot. Hormati `robots.txt` dan TOS masing-masing situs.
- Dedupe berdasarkan `external_url` / slug; jangan simpan duplikat.
- Hanya simpan lowongan yang **masih buka**. Otomatis nonaktifkan/hapus saat
  lowongan sudah tutup (deadline lewat / halaman 404 / status tutup).
- Cantumkan atribusi sumber (`Sumber: <nama portal>` + link balik).
- JobStreet sudah terintegrasi dan **tidak** termasuk dalam daftar ini.

---

## A. Portal Lowongan — Bisa Discrape dari Halaman Publik (Aktif)

| # | Portal | URL Base | Metode Ekstraksi | Status |
|---|--------|----------|------------------|--------|
| 1 | Glints | https://glints.com/id/opportunities/jobs/explore | `__NEXT_DATA__` → `initialJobs.jobsInPage` | ✅ Siap discrape |
| 2 | Dealls | https://dealls.com/jobs | `__NEXT_DATA__` → `dehydratedState` | ✅ Siap discrape |
| 3 | Talent.com | https://id.talent.com/jobs | SSR kartu `data-testid="job-card-unified"` | ✅ Siap discrape |
| 4 | LinkedIn | https://www.linkedin.com/jobs | Sesi login pengguna sendiri (`linkedin-scraper`) | ✅ Siap discrape |
| 5 | Kalibrr | https://www.kalibrr.com | `__NEXT_DATA__` → `pageProps.jobs` | ✅ Siap discrape |
| 6 | Jobindo | https://jobindo.com/cari-lowongan-kerja | Inertia `data-page` di `<div id="app">` | ✅ Siap discrape |
| 7 | Jora | https://id.jora.com/jobs | SSR kartu `data-braze-job-panel-view` | ✅ Siap discrape |
| 8 | Jobinaja | https://www.jobinaja.com | Feed Blogger `?alt=json&q=` | ✅ Siap discrape |
| 9 | Lokernas | https://www.lokernas.com | Feed Blogger `?alt=json&q=` | ✅ Siap discrape |
| 10 | OfficialKarir | https://www.officialkarir.com | Feed Blogger `?alt=json&q=` | ✅ Siap discrape |
| 11 | LogKerja | https://www.logkerja.id | Feed Blogger `?alt=json&q=` | ✅ Siap discrape |
| 12 | Loker HeadOffice | https://lokerho.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 13 | SejakKemarin | https://sejakkemarin.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 14 | LamarLangsung | https://lamarlangsung.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 15 | InfoLokerKerja | https://informasilowongankerja.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 16 | SolusiKerja | https://solusikerja.net | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 17 | BursaKerjaDepnaker | https://bursakerjadepnaker.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 18 | Loker Anak Medan | https://lokeranakmedan.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 19 | Info Loker Jabar | https://infolokerjabar.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 20 | Info Loker Banten | https://infolokerbanten.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 21 | Info Loker Karawang | https://infolokerkarawang.com | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 22 | LokerMuslim | https://www.lokermuslim.id | WordPress `?s=` + tag | ✅ Siap discrape |
| 23 | Lowker Jogja | https://lowkerjogja.co.id | WordPress `?s=` + halaman daftar | ✅ Siap discrape |
| 24 | **Disnakerja.com** | https://www.disnakerja.com | WordPress RSS `?s={kw}&feed=rss2` | ✅ Siap discrape (baru) |

> Catatan: daftar ini sudah teruji bisa di-scrape dari halaman publik tanpa
> login (Agustus 2026), sesuai komentar di `apps/dashboard/lib/job-scraper.ts`.
> Disnakerja.com baru ditambahkan (Sep 2026) — judul post-nya = nama
> perusahaan, jadi memakai parser RSS khusus `scrapeDisnakerja` di
> `apps/dashboard/lib/job-scraper.ts`, bukan pola WordPress biasa.

---

## B. Portal Lowongan — Butuh Sesi Login Pengguna

Portal ini butuh browser + sesi login milik pengguna sendiri (pola sama dengan
LinkedIn, tanpa bypass CAPTCHA — lihat `lib/browser-portals.ts`).

| # | Portal | URL Base | Status |
|---|--------|----------|--------|
| 1 | KitaLulus | https://www.kitalulus.com | 🔒 Perlu sesi login |
| 2 | Karir.com | https://www.karir.com | 🔒 Perlu sesi login |
| 3 | Indeed | https://id.indeed.com | 🔒 Perlu sesi login |
| 4 | Cake (CakeResume) | https://www.cake.me | 🔒 Perlu sesi login |
| 5 | Jooble | https://id.jooble.org | 🔒 Perlu sesi login |
| 6 | Loker.id | https://loker.id | 🔒 Perlu sesi login |

---

## C. Disnakerja.com (Sumber Utama Baru)

Sumber yang diminta user: **https://www.disnakerja.com** — situs lowongan
BUMN, CPNS & Swasta, berbasis WordPress (terverifikasi, generator WP 7.1).

| # | Sumber | URL Base | Metode Ekstraksi | Jenis Konten |
|---|--------|----------|------------------|--------------|
| 1 | Disnakerja.com (beranda) | https://www.disnakerja.com | Feed RSS `https://www.disnakerja.com/feed/` | Lowongan kerja |
| 2 | Disnakerja.com (pencarian) | https://www.disnakerja.com/?s={keyword}&feed=rss2 | Feed RSS hasil pencarian | Lowongan kerja |

Detail feed RSS:

- Setiap `<item>` berisi `title` (nama perusahaan), `link` (URL lowongan),
  `pubDate`, dan `<category>` (Full Time / Part Time, lokasi, pendidikan
  seperti S1/D3, sektor seperti BUMN/Teknik).
- Judul post = **nama perusahaan**, bukan posisi → parser RSS khusus
  (`scrapeDisnakerja` di `apps/dashboard/lib/job-scraper.ts`) dipakai karena
  pola WordPress biasa memfilter judul yang mengandung kata lowongan.
- Kategori dipakai untuk menebak: `jobType` (Full-time/Contract/Internship),
  `location` (kota/provinsi), dan `experience`.
- Dedupe by `portalUrl` (link item). Hanya simpan lowongan yang masih buka.

---

## D. Sumber Event / Job Fair (tabel `events`)

| # | Sumber | URL Base | Catatan |
|---|--------|----------|---------|
| 1 | Job Fair Kemnaker | https://jobfair.kemnaker.go.id/web/events | Kalender job fair resmi |
| 2 | Disnakerja.com | https://www.disnakerja.com | Kadang memuat info rekrutmen/event perusahaan |
| 3 | Eventbrite Indonesia | https://www.eventbrite.com/d/indonesia/job-fair/ | Karir fair, workshop |

---

## E. Sumber Artikel / Berita Karier (tabel `articles`)

| # | Sumber | URL Base | Catatan |
|---|--------|----------|---------|
| 1 | Kemnaker | https://kemnaker.go.id | Berita resmi ketenagakerjaan |
| 2 | Pasker ID | https://paskerid.kemnaker.go.id | Berita terkini pasar kerja |
| 3 | Portal blog loker (12 situs WordPress) | lihat bagian A | Artikel lowongan + tips |
| 4 | Portal Blogger (4 situs) | lihat bagian A | Artikel lowongan |
| 5 | Glints Blog | https://glints.com/id/blog | Tips karier (kualitas tinggi) |
| 6 | Kalibrr Blog | https://www.kalibrr.com/advice | Tips karier |

---

## F. Sumber Sertifikasi / Pelatihan (tabel `certifications`)

| # | Sumber | URL Base | Catatan |
|---|--------|----------|---------|
| 1 | Kemnaker — Sertifikasi Profesi | https://kemnaker.go.id | Info sertifikasi profesi & LSP |
| 2 | BNSP (Badan Nasional Sertifikasi Profesi) | https://bnsp.go.id | Skema sertifikasi resmi |
| 3 | SIAPkerja — Pelatihan | https://siapkerja.kemnaker.go.id | Program pelatihan |
| 4 | Pasker ID — Pelatihan | https://paskerid.kemnaker.go.id | Dataset pelatihan |
| 5 | Disnaker daerah | lihat bagian C | Pelatihan & sertifikasi daerah |

---

## G. Ringkasan & Aturan Scraping

> Catatan: bagian "sumber pemerintah Kemnaker/Disnaker daerah" sempat masuk
> daftar ini, tapi bukan itu yang dimaksud — sumber yang diminta adalah
> **disnakerja.com** (bagian C).

1. **Jadwal:** cron hybrid manual, jam **01.00 WIB** setiap hari (bisa
   di-trigger manual juga dari admin).
2. **Cakupan:** lowongan kerja, event/job fair, artikel blog, sertifikasi —
   semua konten berbasis artikel.
3. **Dedupe:** kunci unik = `external_url` / slug per sumber. Jangan simpan
   duplikat antar sumber maupun dalam satu sumber.
4. **Umur data:** simpan lowongan selama masih buka. Saat tutup (deadline
   lewat / halaman hilang / status tutup) → auto nonaktifkan lalu hapus.
5. **Hanya yang buka:** lowongan yang sudah tutup tidak ikut discrape.
6. **Atribusi:** selalu cantumkan `Sumber: <nama portal>` + link balik, sesuai
   etika scraping (lihat `SESSION_MAGANGHUB.md` bagian Etika).
7. **`/scrape-jobs` (dashboard):** cukup membaca/mengaudit data yang sudah
   tersimpan di database system — bukan scrape internet langsung.

---

## H. Implementasi (Status: Terpasang — Sep 2026)

| Komponen | File | Fungsi |
|----------|------|--------|
| Scraper portal | `apps/dashboard/lib/job-scraper.ts` | 24 portal publik + 6 portal sesi + Disnakerja (RSS khusus) |
| Sync ke DB | `apps/dashboard/lib/job-sync.ts` | Upsert dedupe by `source`+`external_url`, auto-nonaktif lowongan tutup |
| Scraper konten | `apps/dashboard/lib/content-scraper.ts` | Artikel (Kalibrr blog + Disnakerja RSS) & sertifikasi (BNSP) → tabel `articles`/`certifications` |
| Cron harian | `apps/dashboard/instrumentation.ts` | Scrape 5 kata kunci umum + sync lowongan + konten tiap **01.00 WIB** saat server jalan |
| API sync | `apps/dashboard/app/api/job-sync/route.ts` | `GET` statistik audit, `POST` sinkronisasi manual (bisa dipanggil cron eksternal) |
| API konten | `apps/dashboard/app/api/content-sync/route.ts` | `GET` statistik artikel/event/sertifikasi, `POST` sync konten manual |
| Halaman audit | `apps/dashboard/app/(user)/scrape-jobs/page.tsx` → `components/JobScraperView.tsx` | Baca DB, trigger sync manual, unduh JSON |
| Skema DB | `packages/db/prisma/schema.prisma` | `jobs`, `articles`, `events`, `certifications`: kolom `source` (default `manual`) + `last_synced_at` + index `[source, external_url]` |

Catatan implementasi:

- Dedupe: kombinasi `source` (nama portal) + `external_url` (link lowongan).
- Lowongan hasil scrape disimpan dengan `source = <portal>`; lowongan admin
  (`source = manual`) tidak pernah disentuh sync.
- Auto-nonaktif: lowongan scraping yang tidak muncul lagi di hasil scrape
  terbaru dianggap tutup → `is_active = false` (bukan delete hard, agar data
  lamaran yang terhubung tetap utuh).
- Cron: dijadwalkan via `instrumentation.ts` (cek tiap 5 menit, jalan sekali
  per hari pada jam 17:00 UTC = 01:00 WIB). Alternatif: cron eksternal dapat
  memanggil `POST /api/job-sync` dengan kata kunci tersendiri.
- Artikel: feed WordPress `neo-blog.kalibrr.com/blog/id/feed` (tips karier) +
  feed utama Disnakerja; dedupe by `source`+`external_url`, `is_published=true`.
- Sertifikasi: beranda BNSP (link berisi `skema`/`sertifikasi`); harga & durasi
  diisi 0 (detail per skema menyusul bila perlu).
- Event: `jobfair.kemnaker.go.id` murni SPA (data via API internal tanpa SSR),
  jadi scraper event ditunda sampai ada sumber publik yang stabil — kolom DB
  (`source`, `last_synced_at`) sudah siap.
- Belum diimplementasi (next): scraper MagangHub (lihat `SESSION_MAGANGHUB.md`).