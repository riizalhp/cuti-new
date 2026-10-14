# Rencana Perbaikan — Dashboard User (`apps/dashboard`)
**ID Dokumen:** `plan-005-2026-10-02`  
**Sumber temuan:** `audit-005-2026-10-01.md` (skor saat ini 41/100, 29 temuan)  
**Target:** skor ≥85, WCAG 2.1 AA (Grade B) untuk komponen yang disentuh, tanpa mengubah keputusan `zoom: 0.8`.  
**Status:** fase fondasi dan migrasi tab selesai sebagian; checkpoint terbaru **69/100** (audit-009, 3 Oktober 2026). K1–K8 tetap disetujui.  
**Pelaksana:** developer tim. Dokumen ini menjadi rencana kerja dan changelog progres; detail pengukuran ada di `audit-005` sampai `audit-009`. Daftar tugas lengkapnya ada di **§13**.

> ✅ **Catatan git:** `.playwright-mcp/` dan `apps/dashboard/.cache/` sudah masuk `.gitignore`. Pastikan `git status` tetap bersih dari screenshot, log, snapshot, dan model AI sebelum commit. Lihat tugas **P.0**.

---

## 1. Batasan dan prinsip

- **Zoom 0.8 dan root 14px tetap.** Semua ukuran di rencana ini dihitung dalam CSS, dan hasil visualnya = CSS × 0.8 di layar ≥1024px.
- **Perbaiki sumbernya, bukan pemakaiannya satu per satu.** Masalah terbesar berasal dari sedikit sumber: token skala, `Button`, `GooeyNav`, pola overlay manual, dan API client yang menelan error. Sumber-sumber itu diperbaiki dulu, baru pemakaiannya dimigrasikan.
- **Tanpa dependency baru kecuali benar-benar perlu.** `@radix-ui/react-dialog`, `react-tabs`, dan `react-dropdown-menu` sudah terpasang.
- **Setiap fase bisa di-merge sendiri** dan diverifikasi dengan skrip audit yang sudah ada (`.playwright-mcp/scripts/`).
- **Perilaku bisnis tidak berubah.** Yang diubah adalah tampilan, aksesibilitas, dan penanganan state. Logika simpan, kirim, dan hitung tidak disentuh.

### Ukuran sumber masalah (hitungan di `components/` + `app/`)

| Pola | Jumlah | File |
|---|---:|---:|
| `text-xs` | 2.493 | 98 |
| `text-[9px]` / `[10px]` / `[11px]` | 1.290 | 89 |
| `text-slate-400` | 1.237 | 92 |
| `<button>` mentah | 715 | 87 |
| `<Button>` (komponen) | 24 | 9 |
| `font-black` / `font-extrabold` | 461 / 450 | 37 / 61 |
| `bg-[#1738D1]` (hex hardcode) | 354 | 66 |
| `fixed inset-0` (overlay manual) | 54 | 33 |
| `bg-orange-500` + `text-white` | 47 | 22 |
| `animate-pulse` | 25 | 16 |
| `py-0.2` (kelas tidak valid) | 20 | 9 |

### Global atau manual: dipilih berdasarkan hasil, bukan kecepatan

Setiap tugas di §13 diberi label **Global**, **Codemod**, atau **Manual**, beserta alasannya. Aturan yang dipakai:

- **Global (token):** dipilih bila masalahnya memang sistemik dan hasil yang benar adalah *seragam*. Contoh: batas bawah ukuran teks. Konsistensi justru tujuannya, dan perubahan di satu tempat mencegah nilai yang menyimpang.
- **Codemod:** dipilih bila perubahannya **setara 1:1** dan tidak butuh penilaian konteks. Contoh: `bg-[#1738D1]` → `bg-cobalt-500` menghasilkan warna yang identik. Hasil codemod tetap direview di PR.
- **Manual:** dipilih bila setiap tempat butuh penilaian. Contoh: apakah `text-slate-400` itu teks atau icon dekoratif, apakah tombol oranye itu CTA utama atau aksen, dan bagaimana overlay seharusnya bisa ditutup. Global di kasus seperti ini justru menurunkan kualitas.

Perubahan global tidak membebaskan dari review per halaman. Di Fase 2, setiap halaman tetap dicek manual, dan tempat yang butuh ukuran lain dari default token disesuaikan di situ.

---

## 2. Keputusan yang perlu disetujui sebelum mulai

| # | Keputusan | Pilihan | Status |
|---|---|---|---|
| K1 | Cara menaikkan skala teks kecil | **Global:** override token `--text-xs`/`--text-sm` di `@theme`, ditambah token baru `text-caption`. Ini dipilih karena kualitasnya: masalahnya adalah batas bawah yang terlalu rendah di seluruh app, dan batas bawah yang benar memang harus seragam. Mengganti 2.493 kelas satu per satu justru berisiko menghasilkan ukuran yang tidak konsisten lagi. Tempat yang butuh ukuran berbeda disesuaikan manual di Fase 2. | ✅ **Disetujui** |
| K2 | Skala minimum teks (CSS / visual desktop) | Caption 12 / 9.6px, label interaktif 13 / 10.4px, isi 14 / 11.2px | ✅ **Disetujui** |
| K3 | Warna CTA utama | CTA primer → cobalt `#1738D1` (≈8:1 dengan putih). Oranye hanya untuk aksen dan badge. Penentuan mana CTA primer dan mana aksen dilakukan **manual** per tempat. | ✅ **Disetujui** |
| K4 | Weight tombol, tab, dan label | 600 di semua tempat. `font-black`/`font-extrabold` hanya untuk heading dan angka besar | ✅ **Disetujui** |
| K5 | Basis komponen tab | Bangun ulang di atas `@radix-ui/react-tabs`, dengan efek gooey dipertahankan sebagai lapisan visual. Keyboard dan ARIA ditangani Radix. | ✅ **Disetujui** |
| K6 | Popover notifikasi | `@radix-ui/react-dialog` non-modal, tanpa dependency baru | ✅ **Disetujui** |
| K7 | Test otomatis | Vitest + Testing Library + `jest-axe` untuk komponen dasar dan API client, ditambah skrip Playwright untuk perilaku dan visual (lihat §8) | ✅ **Disetujui** |
| K8 | Kecepatan Career Intelligence | Resolve role paralel (`Promise.all`) di server | ✅ **Disetujui** |

Semua keputusan K1–K8 sudah disetujui pemilik produk pada 2 Oktober 2026. Perubahan keputusan setelah ini dicatat di bagian ini beserta tanggalnya, lalu tugas terkait di §13 diperbarui.

---

## 3. Gambaran fase

| Fase | Isi | Estimasi | Perkiraan skor |
|---|---|---|---:|
| 0 | Quick wins: bug kontras, state palsu, label aksesibel | 1–1.5 hari | ~55 |
| 1 | Fondasi: token skala, `Button`, `IconButton`, `Tabs`, `Dialog`/`Sheet`/`AlertDialog`, `Field`, pola async state | 3–4 hari | ~65 |
| 2 | Migrasi bertahap per halaman (4 gelombang) | 6–9 hari | ~82 |
| 3 | Penguncian: lint rule, CI, regresi visual, dokumentasi | 1.5–2 hari | ≥85 |
| **Total** | | **±12–16 hari kerja** | |

Urutan ini dipilih karena Fase 0 langsung terasa oleh pengguna, Fase 1 membuat Fase 2 menjadi pekerjaan mekanis, dan Fase 3 mencegah masalah yang sama muncul lagi.

---

## 4. Fase 0: Quick wins (1–1.5 hari)

Semua item kecil, terisolasi, dan aman di-merge dalam satu PR.

| # | Perubahan | File | Temuan | Kriteria selesai |
|---|---|---|---|---|
| 0.1 | Tab tidak aktif misi-cuan: `bg-white/10 text-white` → `bg-slate-100 text-slate-700 hover:bg-slate-200` (dark: `dark:bg-slate-800 dark:text-slate-300`) | `MisiCuanView.tsx` L313, L325 | 18 | Kontras ≥4.5:1 |
| 0.2 | `PageHeader` stats: ganti `colorClass` gelap ke varian terang (`text-sky-300`, `text-indigo-300`, `text-emerald-300`), atau abaikan `colorClass` dan pakai `text-white` | `ui/PageHeader.tsx` L63, pemanggil di `TrackerView` L1153–1155, `MisiCuanView` L284–287, `InterviewView` L347 | 02, 18 | Angka stat di hero ≥4.5:1 |
| 0.3 | Icon tab mewarisi warna label: tambah `[&_svg]:text-current` di label GooeyNav, hapus warna di icon yang dikirim | `ui/gooey-nav.tsx` L185–195, `LinkedInAnalysisView` ~L1942, `MisiCuanView` L349, L373 | 03 | Icon tab aktif terlihat putih |
| 0.4 | `trackerApi.getAll` melempar error (hapus `catch { return [] }`). Pemanggil lain (`Header.tsx` ~L173) tetap aman karena sudah punya `.catch(() => [])` sendiri | `lib/api.ts` L249–256 | 16 | Mock 500 menampilkan alert `role="alert"` yang sudah ada di `TrackerView` L1205–1218, bukan empty state |
| 0.5 | Pesan error tracker dibedakan per operasi: "Gagal memuat", "Gagal menyimpan", "Gagal menghapus", "Gagal memperbarui", dan tombol **Coba lagi** untuk load | `TrackerView.tsx` L432, L682, L715, L929, L969, L1010, L1047 | 16 | Pesan sesuai aksi |
| 0.6 | Guard `isLoading` untuk stats header dan banner pengingat (`value: isLoading ? '–' : …`, banner dirender hanya saat `!isLoading`) | `TrackerView.tsx` L1151–1156, L1198–1202 | 17 | Tidak ada "TOTAL: 0" saat loading |
| 0.7 | Widget Career Readiness di sidebar menampilkan skeleton saat data belum ada (bukan "0%") | `Sidebar.tsx` (lokasi persis ditentukan saat implementasi) | 17 | Tidak ada "0%" palsu |
| 0.8 | `$\rightarrow$` → `→` | `CareerIntelligenceView.tsx` L543 | 24 | Chip menampilkan panah |
| 0.9 | `aria-label` untuk 11 tombol tutup icon-only, plus `type="button"` di 2 tombol mailer | tabel temuan 21 | 21 | 0 tombol tanpa nama di layer |
| 0.10 | `htmlFor`/`id` untuk 3 field batch mailer, label untuk input file CSV, label untuk input chat Herdi | `MailerView.tsx` L712–767, `FloatingAiAssistant.tsx` L320–328 | 21 | 0 input tanpa label |
| 0.11 | `aria-label` + `aria-pressed` pada 8 checkbox Checklist interview; pindahkan `onClick` dari `<div>` ke `<button>` | `InterviewView.tsx` L767–780 | 21 | Checklist bisa dioperasikan keyboard |
| 0.12 | Ring fokus untuk 6 kontrol tanpa indikator | `CareerIntelligenceView` L199, L234; `JobTitleSearchSelect` L184; `RoleCombobox` L233; `BulletPointListInput` L119; `onboarding/page.tsx` L1485 | 22 | Recheck fokus: 0 missing |
| 0.13 | `motion-reduce:animate-none` pada titik pulse | `TrackerView` L1446–1449, `JobScraperView` L295, `AiCvScreenerView` L4402 | 27 | 0 animasi infinite saat reduced motion |
| 0.14 | `py-0.2` → `py-0.5` (20 kemunculan, kelas tidak valid) | 9 file | — | 0 kemunculan |
| 0.15 | Career Intelligence: resolve role paralel (`Promise.all`) | `app/api/career-intelligence/route.ts` L311–316 | 24 | Load pertama dengan role baru <5 detik |
| 0.16 | Angka dekoratif "404" `aria-hidden="true"` | `app/not-found.tsx` | 29 | — |

**Verifikasi Fase 0:** lint + `tsc --noEmit` + `next build`, lalu jalankan ulang `03-tabs-states.js` (state), `04-responsive-a11y.js` (motion), dan `05-focus-recheck.js`.

---

## 5. Fase 1: Fondasi (3–4 hari)

### 1.1 Token skala dan warna (`app/globals.css`)

**Skala teks** (keputusan K1–K2). Tailwind v4 membaca skala dari `@theme`, jadi override di sini mengubah semua pemakaian `text-xs`/`text-sm` sekaligus:

```css
@theme {
  /* Root 14px, zoom 0.8 di desktop. Komentar = hasil visual desktop. */
  --text-caption: 0.8571rem;  /* 12px CSS → 9.6px  (metadata, badge) */
  --text-xs: 0.9286rem;       /* 13px CSS → 10.4px (label tombol/tab)  — sebelumnya 10.5px */
  --text-xs--line-height: 1.25;
  --text-sm: 1rem;            /* 14px CSS → 11.2px (isi)               — sebelumnya 12.25px */
  --text-sm--line-height: 1.45;
}
```

Untuk `text-[9px]`/`[10px]`/`[11px]` (1.290 pemakaian) dipakai **codemod dengan review**: semuanya diubah ke `text-caption`. Ini menaikkan teks terkecil dari 7.2–8.8px menjadi 9.6px visual. Alasannya kualitas, bukan kecepatan: ukuran arbitrer ini adalah sumber inkonsistensi (ada 9, 10, dan 11px untuk peran yang sama), sehingga menyatukannya ke satu token caption memang hasil yang diinginkan. Diff codemod direview per file. Tempat yang pecah (badge di ruang sempit, label sumbu chart) diperbaiki manual dengan menyesuaikan layout, bukan dengan mengembalikan ukuran kecil.

**Warna:**
- Tambah token semantik: `--color-cta: var(--color-cobalt-500)`, `--color-cta-hover: var(--color-cobalt-600)`, `--color-text-muted: #64748B` (slate-500), `--color-text-muted-dark: #94A3B8` (slate-400).
- Codemod `bg-[#1738D1]` → `bg-cobalt-500` dan `hover:bg-[#132EA8]` → `hover:bg-cobalt-600` (354 pemakaian, tampilan tidak berubah).
- **`text-slate-400` (1.237 pemakaian) tidak di-codemod buta**, karena banyak dipakai sebagai warna icon atau dalam `dark:`. Aturannya: teks di permukaan terang → `text-slate-500`; icon dekoratif tetap. Ini dikerjakan per gelombang di Fase 2, dibantu lint rule di Fase 3.
- Pindahkan `--radius-*` dan `--space-*` dari `:root` ke `@theme`, sehingga tersedia sebagai kelas Tailwind (temuan 11).
- `letter-spacing: -0.015em` dipindah dari `body` ke `h1`–`h3` (temuan 12).

**Risiko:** layout melebar. Tab dengan label panjang, tabel tracker, dan chip `/scrape-jobs` paling rentan. Mitigasi: jalankan regresi visual di 1280px dan 1440px (§8) sebelum merge. Kalau ada yang pecah, perbaiki di Fase 2 per halaman, bukan dengan mengembalikan token.

### 1.2 `components/ui/button.tsx`

```ts
// Nilai CSS; komentar = visual desktop (× 0.8).
size: {
  sm: "h-10      px-3.5 gap-1.5 text-xs   [&_svg]:size-4",      // 28px · teks 10.4 · icon 11.2
  md: "h-[40px]  px-4   gap-2   text-sm   [&_svg]:size-[16px]", // 32px · teks 11.2 · icon 12.8
  lg: "h-[48px]  px-5   gap-2   text-[15px] [&_svg]:size-[18px]", // 38px · teks 12   · icon 14.4
},
```

- Basis: `font-semibold`, `[&_svg]:shrink-0 [&_svg]:pointer-events-none`, ring fokus yang sudah ada, `forced-colors:border forced-colors:border-[ButtonText]`.
- Varian: tetap `primary`, `secondary`, `brand`, `ghost`, `danger`, `outline`, ditambah `subtle` (untuk tombol di atas hero navy: `bg-white/10 text-white border-white/20`) dan `link`.
- `loading`: label tetap terlihat, spinner di depan, `aria-busy="true"`, dan teks "Loading..." dihapus.
- Hapus size `default` dan `icon` lama. Default size → `md`.
- `<Link>` bergaya tombol memakai `buttonVariants()` langsung pada `className`, yang sudah diekspor. Prop `asChild` hanya ditambahkan jika diperlukan, dan itu berarti menambahkan `@radix-ui/react-slot` sebagai dependency eksplisit (versi dipin), bukan mengandalkan dependency transitif.

### 1.3 `components/ui/icon-button.tsx` (baru)
- Prop `label` **wajib** (menjadi `aria-label`, dan opsional `title`).
- Size `sm` = `size-[30px]` (24px visual, batas WCAG 2.5.8), `md` = `size-[40px]` (32px). Icon diatur oleh komponen.
- Dipakai untuk semua tombol tutup, hapus, refresh, edit, dan aksi item notifikasi.

### 1.4 `components/ui/tabs.tsx` (baru, keputusan K5)
- Dibangun di atas `@radix-ui/react-tabs`: `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, navigasi panah/Home/End, dan roving tabindex sudah ditangani.
- Varian `pill` (memakai visual GooeyNav yang ada, efek gooey dipertahankan sebagai lapisan dekoratif `aria-hidden`) dan `underline`.
- Size: `sm` `h-10 px-3.5 text-xs [&_svg]:size-4`, `md` `h-[40px] px-4 text-sm [&_svg]:size-[16px]`. Size `xs` hanya untuk filter chip: `h-[30px] px-3 text-caption`.
- Icon `[&_svg]:text-current`. Teks tidak aktif `text-slate-600`.
- High contrast: `forced-colors:data-[state=active]:bg-[Highlight] forced-colors:data-[state=active]:text-[HighlightText]`, dan item diberi `forced-colors:border`.
- Untuk navigasi berbasis route (`href`), sediakan `NavPills` terpisah dengan `aria-current="page"` (bukan role tab).
- `GooeyNav` lama tetap ada sebagai wrapper tipis sampai migrasi selesai, lalu dihapus di Fase 3.

### 1.5 `components/ui/dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx` (baru)
- Semua di atas `@radix-ui/react-dialog`. Focus trap, Escape, `aria-modal`, `Dialog.Title`/`Description`, pengembalian fokus, dan scroll lock sudah ditangani.
- `Sheet`: panel kanan (`max-w-md sm:max-w-lg`), header dengan `IconButton` tutup berlabel, body scroll, footer sticky. Menggantikan pola drawer yang diulang di 10+ file.
- `Dialog`: modal tengah, size `sm`/`md`/`lg`.
- `AlertDialog`: `role="alertdialog"`, fokus awal di aksi aman ("Batal"/"Kembali Periksa"), dan tidak tertutup lewat klik backdrop.
- `ConfirmDialog.tsx` yang ada di-refactor memakai `AlertDialog`, tanpa mengubah API context `confirm`/`alert`.
- Animasi `slide-in`/`zoom-in` yang ada dipertahankan lewat `data-[state=open]`.

### 1.6 `components/ui/field.tsx` (baru)
- `Field` membungkus `<label htmlFor>`, kontrol, hint, dan error. `id`, `aria-describedby`, dan `aria-invalid` di-wire otomatis (pakai `useId`).
- Kelas input standar: `h-[40px] px-3.5 text-sm rounded-[10px] border … focus-visible:ring-2 focus-visible:ring-cobalt-500`.
- Error: `text-caption text-rose-700` dengan icon. Saat submit gagal, fokus dipindah ke field pertama yang salah.
- Validasi: `react-hook-form` + `@hookform/resolvers` **sudah terpasang**, jadi dipakai untuk form yang dimigrasi. Form lain cukup memakai `noValidate` + validasi manual.

### 1.7 Pola async state
- API client (`lib/api.ts`): hapus pola `catch { return [] / null }` di `trackerApi` dan `careerIntelligenceApi`. Error dilempar dan pemanggil yang memutuskan. Pemanggil yang sengaja ingin fallback memakai `.catch()` eksplisit.
- Komponen `AsyncState` kecil (`loading` → skeleton, `error` → pesan + Coba lagi + `role="alert"`, `empty` → slot empty state, `ready` → children), dipakai di halaman dengan data utama: tracker, career intelligence, CV list, riwayat linkedin/screener.
- Audit semua method lain di `lib/api.ts` yang menelan error. Daftarnya disusun di awal fase ini, dan masing-masing diputuskan: lempar atau tetap fallback.

### 1.8 Halaman `/design-system`
- Diperbarui untuk menampilkan komponen baru (Button, IconButton, Tabs, Dialog, Sheet, Field, AsyncState). Halaman ini menjadi acuan visual selama migrasi, karena tidak ada Figma.
- Perbaiki juga hydration mismatch di halaman ini (temuan 29).

**Verifikasi Fase 1:** test komponen (§8), lint, build, dan cek `/design-system` di light, dark, forced-colors, serta 390px.

---

## 6. Fase 2: Migrasi per halaman (6–9 hari)

Setiap gelombang = satu PR. Di setiap file yang disentuh, checklist yang sama diterapkan:

1. Overlay `fixed inset-0` → `Sheet`/`Dialog`/`AlertDialog`.
2. `<button>` aksi → `Button`/`IconButton`. Hapus override `h-*`, `py-*`, `px-*`, `text-*`, serta `font-black`/`font-extrabold` pada tombol.
3. Icon di dalam tombol/tab: hapus `w-*`/`h-*`/`size={}` dan `mr-*`/`ml-*`, karena ukuran diatur komponen.
4. Tab → `Tabs`/`NavPills`.
5. Field → `Field`.
6. `text-slate-400` pada teks di permukaan terang → `text-slate-500`.
7. CTA `bg-orange-500 text-white` → `Button variant="primary"` (K3).
8. `<div onClick>` yang interaktif → `<button>` atau `<Link>`.
9. Target klik <30px CSS → minimal `size-[30px]`.

### Gelombang A: jalur paling sering dipakai (2–3 hari)
| Area | Pekerjaan utama | Temuan |
|---|---|---|
| `Header.tsx` | Popover notifikasi → `Dialog` non-modal (K6): judul tidak terpotong ("Tandai dibaca" pindah ke footer), icon badge `size-3.5`, aksi item `IconButton sm`, `aria-expanded` di bell, Escape | 19, 15 |
| `FloatingAiAssistant.tsx` | Panel chat → `Dialog` non-modal, `aria-live="polite"` untuk pesan baru, Escape, fokus ke input saat dibuka. Di mobile, beri ruang di bawah konten supaya FAB tidak menutupi kartu | 15, 25 |
| `TrackerView.tsx` + `TrackerReminderHub` + `ApplicationDetailDrawer` + `OfferingPreparationModal` + `InterviewScheduleModal` + `PostInterviewReviewModal` | 6 overlay → `Sheet`/`Dialog`. Hapus handler Escape global L447–462 (sudah ditangani Radix), sehingga masalah Escape dobel ikut hilang. Form Tambah Lamaran → `Field` + validasi inline. Tab Kanban/Tabel dan filter status → `Tabs`. Dot pagination pengingat → `IconButton sm` dengan dot 6px. Carousel pengingat mobile tidak meluber (temuan 13) | 15, 17, 20, 04, 13 |
| `BerandaView` + kartu modul + `LatestJobsList` | Drawer detail loker → `Sheet`, kartu `role="button"` → `<button>`, CTA hero oranye → `primary`. Link aksi kecil ("Lihat Detail" 11px) diberi area klik | 02, 04, 15 |
| `Sidebar` / `BottomNav` | State aktif terlihat di forced-colors (`forced-colors:bg-[Highlight]`) | 28 |

### Gelombang B: fitur evaluasi (2–3 hari)
| Area | Pekerjaan utama | Temuan |
|---|---|---|
| `CareerIntelligenceView` + `EvidenceSlideOver` | Modal custom role → `Dialog`, evidence → `Sheet`. 2 `<select>` → `Select` dengan tinggi `h-[40px]` (Radix select sudah terpasang). Tombol tambah dan refresh → `IconButton`. Tab Ringkasan/Kecocokan/Kesenjangan/Arah → `Tabs` | 15, 22, 24 |
| `AiCvScreenerView` (+ `/cv-screener/report`) | Drawer Riwayat Screening dan Ganti CV → `Sheet`. Kartu CV `<div onClick>` → `<button>`. Mode A/B → `Tabs`. 17 chip tujuan → `Tabs xs` atau radio group. Halaman report: teks <9px dinaikkan lewat codemod `text-caption`, label skor ke `text-slate-500` | 15, 21, 23 |
| `CvMatchAnalysisView` | Tab Detail/Komparasi dan Overview/Keywords/Gap/Insight → `Tabs`, satu nav tidak lagi mencampur item dengan dan tanpa icon | 08 |
| `LinkedInAnalysisView` | Drawer Riwayat, modal Bookmarklet, dan preview gambar → `Sheet`/`Dialog`. Item riwayat → `<button>`. Tombol hapus → `IconButton`. Tab input → `Tabs`. CTA disabled dark mode: `opacity-60` dari warna normal + hint "Masukkan link dulu" | 15, 21, 10 |
| `InterviewView` | 4 tab → `Tabs`. Checklist sudah dikerjakan di 0.11 | 08 |

### Gelombang C: editor CV (2 hari)
`CVView.tsx` (9.000+ baris, 117 tombol mentah, 28 field border-only) dikerjakan terpisah karena risikonya paling tinggi.
- `ATSAnalysisDrawer`, `AiAssistantDrawer`, `CvHrdModal`, `CvPromoModal`, dan preview draf → `Sheet`/`Dialog`.
- Field editor → kelas input standar dengan ring fokus.
- Tombol section → `Button`/`IconButton`.
- **Tidak** memecah file atau mengubah logika autosave. Itu di luar cakupan dan akan memperbesar risiko.

### Gelombang D: sisanya (1–2 hari)
`MailerView` / `surat-lamaran` (2 drawer, form batch → `Field`), `ProfileView` (drawer edit + modal hapus akun → `AlertDialog`), `LatihanSoalView` (Konfirmasi Selesai Ujian → `AlertDialog`, override `Button` L655–1479 dibersihkan), `MisiCuanView`, `ReadinessView` (pill hero → `Tabs`), `BugReportView` dan `FeatureRequestView` (tab manual → `Tabs`), `JobScraperView` (`/scrape-jobs`: chip 18px → `Tabs xs`, kontras), `DesignSystemView`, `ReferralView`, serta halaman auth (`Field` + pesan error inline di login, register, forgot, reset).

### Pekerjaan lintas halaman di Fase 2
- **CTA oranye** (47 pemakaian di 22 file) habis di akhir gelombang D.
- **Icon:** `CustomIcons.tsx` diberi API yang sama dengan lucide (`className`, ukuran mewarisi induk), atau pemanggilnya diganti ke lucide.
- **Label tab panjang** dipendekkan ("Daftar Latihan Soal (Katalog)" → "Katalog", "Mode B: Target Lowongan (Tempel JD)" → "Target Lowongan"). Teks final disepakati bersama product owner.

---

## 7. Fase 3: Penguncian (1.5–2 hari)

1. **ESLint rule** (`no-restricted-syntax` + aturan kecil di `eslint.config`):
   - `<Button>` dengan `className` berisi `h-`, `py-`, `px-`, `text-`, atau `font-black`.
   - `text-[9px]`, `text-[10px]`, dan `text-[11px]` di mana pun.
   - `bg-orange-500` bersama `text-white`.
   - Hex yang sudah punya token (`#1738D1`, `#132EA8`).
   - `className` berisi `fixed inset-0` di luar `components/ui/`.
   - `<div onClick>` tanpa `role`/`onKeyDown`, lewat `jsx-a11y` (plugin ini biasanya ikut `eslint-config-next`; dicek saat implementasi).
2. **Hapus** `GooeyNav` lama, `.btn-neo-skeuo*` legacy di `globals.css` jika sudah tidak dipakai, dan size `Button` lama.
3. **Regresi visual:** skrip `.playwright-mcp/scripts/` dipindah ke `apps/dashboard/e2e/` dan dijadikan `pnpm --filter @employr/dashboard test:visual`. Baseline 19 route × (390, 1280, 1440) × (light, dark), ditambah forced-colors untuk 5 route.
4. **Audit ulang:** jalankan ulang skrip 01–05, lalu perbarui `audit-005` dengan skor baru.
5. **Uji manual screen reader** (NVDA di Windows) untuk: Tabs, satu `Sheet`, `AlertDialog` ujian, form Tambah Lamaran, dan popover notifikasi.
6. **Dokumentasi:** `/design-system` menjadi referensi resmi. Tambah README singkat di `components/ui/` berisi aturan skala (tabel konversi zoom).

---

## 8. Strategi verifikasi

| Lapisan | Alat | Kapan |
|---|---|---|
| Statis | `pnpm --filter @employr/dashboard lint`, `tsc --noEmit`, `next build` | Setiap PR |
| Unit komponen (K7, disetujui) | Vitest + Testing Library + `jest-axe`, untuk: `Button` (size, loading, `aria-busy`), `IconButton` (label wajib), `Tabs` (panah/Home/End, `aria-selected`), `Dialog`/`Sheet` (fokus masuk, Escape, fokus kembali), `Field` (`aria-invalid`/`describedby`), `trackerApi.getAll` (melempar error) | Fase 1, lalu dijalankan di setiap PR |
| Perilaku | Skrip Playwright yang sudah ada: `02-layers` (fokus/Escape/role semua overlay), `03-tabs-states` (state + auth), `04-responsive-a11y` (mobile, 1280, motion, forced), `05-focus-recheck` | Setiap gelombang |
| Visual | Screenshot baseline (Fase 3), sementara itu dibandingkan manual dengan `.playwright-mcp/review/` | Setiap gelombang |
| Manual | NVDA, keyboard-only, Windows High Contrast | Fase 3 |

**Target angka per fase** (diukur dengan skrip yang sama seperti audit):

| Metrik | Sekarang | Setelah Fase 0 | Setelah Fase 2 |
|---|---|---|---|
| Overlay dengan fokus masuk + trap + Escape + kembali | 0 / 19 | 0 / 19 | 19 / 19 |
| Teks terkecil visual desktop | 7.2px | 7.2px | ≥9.6px |
| Label tombol/tab visual desktop | 8.4px | 8.4px | ≥10.4px |
| Kontrol <24px visual (beranda / tracker) | 22 / 21 | ±18 / 15 | 0 / 0 (kecuali link inline) |
| Teks gagal AA (beranda / tracker / readiness, light) | 20 / 15 / 16 | ≤8 / ≤5 / ≤10 | 0 / 0 / 0 |
| Error API tampil sebagai kosong | ya | tidak | tidak |
| Tombol/input tanpa nama aksesibel di overlay | 15+ | 0 | 0 |

---

## 9. Pemetaan temuan → langkah

| Temuan | Langkah |
|---|---|
| 01 Skala global | 1.1 (token), 1.2, 1.4, codemod `text-caption` |
| 02 Kontras | 0.2, 1.1 (warna), Fase 2 item 6–7 |
| 03 Icon tab / forced-colors tab | 0.3, 1.4 |
| 04 Target klik | 1.2, 1.3, Fase 2 item 9, gelombang A (dot pagination) |
| 05 `Button` cva | 1.2 |
| 06 Padding/weight | 1.2, 1.1 (K4), Fase 2 item 2 |
| 07 Icon tombol | 1.2, 1.3, Fase 2 item 3, `CustomIcons` |
| 08 Empat gaya tab | 1.4, Fase 2 item 4 |
| 09 (dikoreksi) | — |
| 10 CTA disabled dark | Gelombang B (LinkedIn), varian disabled di 1.2 |
| 11 Token spacing/radius | 1.1 |
| 12 Letter-spacing | 1.1 |
| 13 Carousel mobile | Gelombang A |
| 14 / 24 Career Intelligence | 0.8, 0.15, gelombang B |
| 15 Overlay fokus | 1.5, Fase 2 item 1 (semua gelombang) |
| 16 Error sebagai kosong | 0.4, 0.5, 1.7 |
| 17 Kosong palsu saat loading | 0.6, 0.7, 1.7 |
| 18 Teks tak terlihat | 0.1, 0.2 |
| 19 Notifikasi | Gelombang A |
| 20 Validasi form | 1.6, gelombang A (tracker) dan D (auth) |
| 21 Tanpa nama aksesibel | 0.9–0.11, 1.3 |
| 22 Fokus field | 0.12, 1.6, gelombang C (CVView), lint Fase 3 |
| 23 Laporan screener | Codemod `text-caption`, gelombang B |
| 25 Mobile FAB / scrape-jobs | Gelombang A (FAB), gelombang D (scrape-jobs) |
| 26 1280px | Tercakup oleh 1.1 dan regresi visual |
| 27 Reduced motion | 0.13 |
| 28 Forced-colors | 1.2, 1.4, gelombang A (sidebar) |
| 29 Error boundary / 404 / hydration | 0.16, 1.8 |

---

## 10. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Token skala (1.1) membuat layout melebar atau terpotong | Tinggi, menyentuh semua halaman | PR tersendiri, regresi visual 1280/1440 sebelum merge, perbaikan per halaman di Fase 2. Rollback cukup 1 file. |
| Migrasi overlay mengubah perilaku tutup (mis. klik backdrop di modal yang sengaja tidak bisa ditutup) | Sedang | Catat perilaku tiap overlay sebelum migrasi (tabel temuan 15). `AlertDialog` tidak tertutup lewat backdrop. |
| `CVView.tsx` sangat besar dan punya autosave | Tinggi | Gelombang tersendiri, perubahan hanya tampilan, tanpa refactor struktur. Uji autosave manual setelah migrasi. |
| `trackerApi` melempar error memengaruhi pemanggil lain | Sedang | Cari semua pemanggil `trackerApi.*` sebelum 0.4. Pemanggil yang butuh fallback diberi `.catch()` eksplisit. |
| Konflik merge dengan pekerjaan fitur paralel | Sedang | PR per gelombang tetap kecil, dan codemod dijalankan di PR terpisah saat tidak ada PR besar terbuka. |
| Radix menambah ukuran bundle | Rendah | Paket sudah terpasang, dan sebagian sudah dipakai di app. |

---

## 11. Di luar cakupan
- `/onboarding` dan `/pembayaran` (belum diaudit).
- App lain di monorepo (`audit-006`). `packages/ui` bersama baru dipertimbangkan setelah komponen dashboard stabil.
- Refactor struktur file besar (`CVView`, `AiCvScreenerView`).
- Klaim metrik dan copywriting (`audit-004`).
- Mengubah keputusan zoom 0.8.

---

## 12. Urutan PR yang disarankan

1. `fix(dashboard): kontras, state error/loading, label aksesibel` (Fase 0)
2. `feat(ui): token skala & warna` (1.1, tanpa codemod)
3. `feat(ui): Button, IconButton, Field` (1.2, 1.3, 1.6) + setup Vitest
4. `feat(ui): Tabs, Dialog, Sheet, AlertDialog, AsyncState` (1.4, 1.5, 1.7) + halaman `/design-system`
5. `chore: codemod text-caption & token cobalt` (terpisah, mekanis)
6–9. `refactor(dashboard): migrasi gelombang A / B / C / D`
10. `chore(dashboard): lint rules, regresi visual, hapus komponen lama` (Fase 3)

---

## 13. Daftar tugas implementasi

Format: `[ ] ID — tugas · **Metode** (alasan) · File · Selesai bila`. Kerjakan berurutan per PR (§12). Tugas dalam satu PR boleh dikerjakan dalam urutan apa pun, kecuali ada catatan *butuh*.

### Persiapan (sebelum PR 1)

- [ ] **P.0** Tambahkan `.playwright-mcp/` ke `.gitignore` di root repo, lalu jalankan `git status` untuk memastikan tidak ada file dari folder itu yang ter-stage. Kalau ada yang sudah terlanjur ter-track, lepaskan dari index dengan `git rm -r --cached .playwright-mcp` (file lokal tetap ada).
- [ ] **P.1** Pastikan lingkungan lokal jalan: Docker/Postgres di port 5440, `pnpm dev`, login dengan akun uji.
- [ ] **P.2** Pindahkan skrip audit `.playwright-mcp/scripts/` (`lib.js`, `01`–`05`) ke repo, misalnya ke `apps/dashboard/e2e/audit/`. Skrip ini read-only: semua request tulis ke `/api/*` diblokir kecuali login. Sesuaikan path `require` Playwright di `lib.js`. Yang dipindah hanya **skrip** (`*.js`). Screenshot dan JSON hasil tetap di `.playwright-mcp/` yang di-ignore (P.0). Kalau skrip nanti menulis output di folder baru, folder output itu juga ditambahkan ke `.gitignore`.
- [ ] **P.3** Jalankan skrip `02`–`05` sekali dan simpan hasilnya sebagai **baseline sebelum perbaikan**. Ini pembanding untuk setiap PR.
- [x] **P.4** ~~Konfirmasi K2, K4, K5, K6, K8~~. Semua disetujui sesuai rekomendasi (2 Oktober 2026).
- [ ] **P.5** Cari semua pemanggil `trackerApi.*` dan `careerIntelligenceApi.*` (dibutuhkan oleh 0.4 dan 1.7.1).

### PR 1: Fase 0, quick wins

- [ ] **0.1** Tab tidak aktif misi-cuan → `bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300` · **Manual** · `MisiCuanView.tsx` L313, L325 · kontras ≥4.5:1 di light dan dark.
- [ ] **0.2** Warna stat di `PageHeader` dibuat kontras di navy · **Manual** (tiap stat punya makna warna sendiri; pilih varian `-300`, atau `text-white` jika warna tidak bermakna) · `ui/PageHeader.tsx` L63 + pemanggil di `TrackerView` L1153–1155, `MisiCuanView` L284–287, `InterviewView` L347, dan pemanggil `PageHeader` lainnya · semua angka stat ≥4.5:1.
- [ ] **0.3** `[&_svg]:text-current` di label `GooeyNav` dan hapus kelas warna pada icon yang dikirim ke nav · **Global** di komponen + **Manual** di pemanggil · `ui/gooey-nav.tsx` L185–195, `LinkedInAnalysisView` ~L1942, `MisiCuanView` L349, L373 · icon tab aktif putih.
- [ ] **0.4** `trackerApi.getAll` melempar error · **Manual** · `lib/api.ts` L249–256 · *butuh P.5* · mock 500 menampilkan alert error, bukan empty state.
- [ ] **0.5** Pesan error per operasi + tombol **Coba lagi** untuk load · **Manual** · `TrackerView.tsx` L432, L682, L715, L929, L969, L1010, L1047 · teks pesan sesuai aksi.
- [ ] **0.6** Guard `isLoading` untuk stats header dan banner pengingat · **Manual** · `TrackerView.tsx` L1151–1156, L1198–1202 · tidak ada "TOTAL: 0" saat loading.
- [ ] **0.7** Skeleton untuk widget Career Readiness di sidebar · **Manual** · `Sidebar.tsx` · tidak ada "0%" saat loading.
- [ ] **0.8** `$\rightarrow$` → `→` · **Manual** · `CareerIntelligenceView.tsx` L543.
- [ ] **0.9** `aria-label` untuk 11 tombol tutup icon-only, dan `type="button"` di 2 tombol mailer · **Manual** · tabel temuan 21 di `audit-005` · skrip `02-layers`: 0 tombol tanpa nama.
- [ ] **0.10** `htmlFor`/`id` di 3 field batch mailer, label untuk input file CSV, dan `aria-label` untuk input chat Herdi · **Manual** · `MailerView.tsx` L712–767, `FloatingAiAssistant.tsx` L320–328.
- [ ] **0.11** Checklist interview: `onClick` dipindah ke `<button>`, ditambah `aria-pressed` dan `aria-label` · **Manual** · `InterviewView.tsx` L767–780 · bisa dicentang dengan keyboard.
- [ ] **0.12** Ring fokus untuk 6 kontrol tanpa indikator · **Manual** · `CareerIntelligenceView` L199, L234, `JobTitleSearchSelect` L184, `RoleCombobox` L233, `BulletPointListInput` L119, `onboarding/page.tsx` L1485 · skrip `05`: 0 missing.
- [ ] **0.13** `motion-reduce:animate-none` pada titik pulse · **Manual** · `TrackerView` L1446–1449, `JobScraperView` L295, `AiCvScreenerView` L4402 · 0 animasi infinite saat reduced motion.
- [ ] **0.14** `py-0.2` → `py-0.5` · **Codemod** (kelas tidak valid; setara dengan maksud aslinya) · 20 kemunculan di 9 file.
- [ ] **0.15** Resolve role paralel di Career Intelligence · **Manual** · `app/api/career-intelligence/route.ts` L311–316 · urutan `userDefinedRoles` tetap sama dengan sebelumnya.
- [ ] **0.16** `aria-hidden="true"` pada angka dekoratif "404" · **Manual** · `app/not-found.tsx`.
- [ ] **0.V** Verifikasi: lint, `tsc --noEmit`, `next build`, skrip `03`, `04`, `05`. Bandingkan dengan baseline P.3.

### PR 2: token skala dan warna (1.1)

- [ ] **1.1.1** Token skala `--text-caption`, `--text-xs`, `--text-sm` beserta line-height · **Global** (K1, disetujui) · `app/globals.css` `@theme`.
- [ ] **1.1.2** Token semantik `--color-cta`, `--color-cta-hover`, `--color-text-muted`, dan pasangan dark-nya · **Global**.
- [ ] **1.1.3** Pindahkan `--radius-*` dan `--space-*` ke `@theme` · **Global** · temuan 11.
- [ ] **1.1.4** `letter-spacing` dipindah dari `body` ke `h1`–`h3` · **Global** · temuan 12.
- [ ] **1.1.5** Review visual di 1280 dan 1440px, light dan dark, untuk 19 route. Catat halaman yang pecah sebagai tugas di gelombang Fase 2 terkait (jangan diperbaiki dengan mengembalikan token).
- [ ] **1.1.V** Lint, build, dan screenshot sebelum/sesudah dilampirkan di PR.

### PR 3: Button, IconButton, Field, dan setup test (1.2, 1.3, 1.6, K7)

- [ ] **T.1** Pasang Vitest, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, dan `jest-axe` sebagai devDependency **dengan versi dipin**. Pastikan versi yang dipilih kompatibel dengan React 19 dan Next 16.
- [ ] **T.2** `vitest.config.ts` (environment `jsdom`, alias `@/`), file setup, dan script `"test": "vitest run"` di `apps/dashboard/package.json`. Turbo sudah punya task `test`, jadi tinggal dipastikan terbaca.
- [ ] **1.2.1** Size dan varian `Button` baru (`sm`/`md`/`lg`, varian `subtle` dan `link`), `font-semibold`, aturan `[&_svg]`, `forced-colors` · **Global** di komponen · `ui/button.tsx`.
- [ ] **1.2.2** State `loading`: label tetap terlihat dan `aria-busy="true"`.
- [ ] **1.2.3** Perbarui 9 file yang sudah memakai `<Button>` dengan size lama, dan hapus override yang tidak perlu lagi · **Manual**.
- [ ] **1.2.T** Test: setiap size menghasilkan kelas yang benar, `loading` men-disable tombol dan memberi `aria-busy`, dan axe tanpa pelanggaran.
- [ ] **1.3.1** `IconButton` dengan prop `label` wajib (TypeScript menolak jika tidak diisi) · `ui/icon-button.tsx` (baru).
- [ ] **1.3.T** Test: `aria-label` terpasang, dan ukuran `sm` ≥30px CSS.
- [ ] **1.6.1** `Field` (label, kontrol, hint, error) dengan `useId` · `ui/field.tsx` (baru).
- [ ] **1.6.2** Kelas input standar dengan `focus-visible:ring-2`.
- [ ] **1.6.T** Test: label terhubung (`getByLabelText` berhasil), `aria-invalid` dan `aria-describedby` muncul saat error.

### PR 4: Tabs, Dialog, Sheet, AlertDialog, AsyncState, `/design-system` (1.4, 1.5, 1.7, 1.8)

- [ ] **1.4.1** `Tabs` berbasis `@radix-ui/react-tabs` dengan varian `pill`/`underline` dan size `xs`/`sm`/`md` · `ui/tabs.tsx` (baru).
- [ ] **1.4.2** Efek gooey dipindah dari `GooeyNav` sebagai lapisan dekoratif `aria-hidden`.
- [ ] **1.4.3** `NavPills` untuk navigasi berbasis route (`aria-current="page"`).
- [ ] **1.4.4** Gaya `forced-colors` untuk tab aktif.
- [ ] **1.4.T** Test: panah, Home, End; `aria-selected`; satu tab di tab order; axe.
- [ ] **1.5.1** `Dialog`, `Sheet`, `AlertDialog` berbasis `@radix-ui/react-dialog` · `ui/dialog.tsx`, `ui/sheet.tsx`, `ui/alert-dialog.tsx` (baru).
- [ ] **1.5.2** Refactor `ConfirmDialog.tsx` ke `AlertDialog` tanpa mengubah API context `confirm`/`alert` · **Manual**.
- [ ] **1.5.T** Test: fokus masuk saat dibuka, Tab terkurung, Escape menutup (kecuali `AlertDialog` lewat backdrop), fokus kembali ke pembuka, axe.
- [ ] **1.7.1** Hapus pola `catch { return [] / null }` di `lib/api.ts`. Setiap method diputuskan satu per satu (lempar atau tetap fallback), dan alasannya ditulis sebagai komentar · **Manual** · *butuh P.5*.
- [ ] **1.7.2** Komponen `AsyncState` (loading/error/empty/ready) · `ui/async-state.tsx` (baru).
- [ ] **1.7.T** Test: `trackerApi.getAll` melempar error saat respons 500; `AsyncState` merender `role="alert"` saat error.
- [ ] **1.8.1** `/design-system` menampilkan semua komponen baru dalam light, dark, dan semua size.
- [ ] **1.8.2** Perbaiki hydration mismatch di `/design-system`.

### PR 5: codemod mekanis

- [ ] **C.1** `text-[9px]`, `text-[10px]`, `text-[11px]` → `text-caption` · **Codemod + review per file** (K1) · 1.290 pemakaian di 89 file. Tempat yang pecah diperbaiki layout-nya secara manual.
- [ ] **C.2** `bg-[#1738D1]` → `bg-cobalt-500`, `hover:bg-[#132EA8]` → `hover:bg-cobalt-600`, dan pasangan `text-`/`border-`/`ring-` dengan hex yang sama · **Codemod** (warna identik).
- [ ] **C.V** Screenshot sebelum/sesudah untuk 19 route. C.2 harus menghasilkan diff piksel nol.

### PR 6–9: migrasi gelombang A–D (Fase 2)

Checklist ini dipakai di **setiap file** yang disentuh, dan semuanya **Manual** karena butuh penilaian per konteks:

- [ ] Overlay `fixed inset-0` → `Sheet`/`Dialog`/`AlertDialog`. Pertahankan perilaku tutup yang disengaja.
- [ ] `<button>` aksi → `Button`/`IconButton`, tanpa override ukuran dan weight.
- [ ] Icon di tombol dan tab tanpa `w-*`/`h-*`/`size={}`/`mr-*`/`ml-*`.
- [ ] Tab → `Tabs`/`NavPills`.
- [ ] Field → `Field`, dengan validasi inline untuk form yang punya `required`.
- [ ] `text-slate-400` pada **teks** di permukaan terang → `text-slate-500` (icon dekoratif dibiarkan).
- [ ] CTA `bg-orange-500 text-white` → `Button variant="primary"` jika CTA primer; jika aksen, pakai teks gelap atau `orange-700` (K3).
- [ ] `<div onClick>` interaktif → `<button>`/`<Link>`.
- [ ] Target klik ≥30px CSS.
- [ ] Cek halaman di 390, 1280, dan 1440px, light dan dark.

**Gelombang A (PR 6)**
- [ ] **A.1** `Header.tsx`: notifikasi → `Dialog` non-modal (K6); "Tandai dibaca" ke footer; icon badge `size-3.5`; aksi item `IconButton sm`; bell `aria-expanded`.
- [ ] **A.2** `FloatingAiAssistant.tsx`: `Dialog` non-modal, `aria-live="polite"`, fokus ke input saat dibuka, ruang bawah di mobile supaya FAB tidak menutupi konten.
- [ ] **A.3** `TrackerView.tsx`: 6 overlay → `Sheet`/`Dialog`; hapus handler Escape global L447–462; form Tambah Lamaran → `Field`; Kanban/Tabel dan filter → `Tabs`; dot pagination → `IconButton sm`; carousel mobile tidak meluber.
- [ ] **A.4** `TrackerReminderHub`, `ApplicationDetailDrawer`, `OfferingPreparationModal`, `InterviewScheduleModal`, `PostInterviewReviewModal` → `Sheet`/`Dialog`. Tab internal Offering → `Tabs underline`.
- [ ] **A.5** `BerandaView` + kartu modul + `LatestJobsList`: drawer loker → `Sheet`; kartu `role="button"` → `<button>`; CTA hero → `primary`.
- [ ] **A.6** `Sidebar`/`BottomNav`: state aktif di forced-colors.
- [ ] **A.V** Skrip `02`–`05` untuk `/beranda` dan `/tracker`: semua overlay lolos fokus/Escape/role; kontras 0 gagal.

**Gelombang B (PR 7)**
- [ ] **B.1** `CareerIntelligenceView` + `EvidenceSlideOver`: `Dialog`/`Sheet`, 2 select → Radix `Select` `h-[40px]`, `IconButton`, `Tabs`.
- [ ] **B.2** `AiCvScreenerView` + report: 2 `Sheet`, kartu CV → `<button>`, Mode A/B → `Tabs`, 17 chip tujuan → `Tabs xs` atau radio group, kontras label skor.
- [ ] **B.3** `CvMatchAnalysisView`: `Tabs` dan konsistensi icon dalam satu nav.
- [ ] **B.4** `LinkedInAnalysisView`: 3 overlay, item riwayat → `<button>`, hapus → `IconButton`, tab input → `Tabs`, CTA disabled dark.
- [ ] **B.5** `InterviewView`: 4 tab → `Tabs`.
- [ ] **B.V** Skrip `02`–`05` untuk route gelombang B.

**Gelombang C (PR 8)**
- [ ] **C8.1** `CVView.tsx`: `ATSAnalysisDrawer`, `AiAssistantDrawer`, `CvHrdModal`, `CvPromoModal`, dan preview → `Sheet`/`Dialog`.
- [ ] **C8.2** 28 field border-only → kelas input standar dengan ring.
- [ ] **C8.3** Tombol section → `Button`/`IconButton`.
- [ ] **C8.4** Uji manual autosave (edit, tunggu, reload, data tetap ada) sebelum dan sesudah. Jangan ubah struktur file maupun logika autosave.
- [ ] **C8.V** Skrip `01` (route `/cv/[id]`) dan `02`.

**Gelombang D (PR 9)**
- [ ] **D.1** `MailerView` / `surat-lamaran`: 2 `Sheet`, form batch → `Field`.
- [ ] **D.2** `ProfileView`: drawer edit → `Sheet`, hapus akun → `AlertDialog`.
- [ ] **D.3** `LatihanSoalView`: Konfirmasi Selesai Ujian → `AlertDialog` (fokus awal "Kembali Periksa"), bersihkan override `Button` L655–1479.
- [ ] **D.4** `MisiCuanView`, `ReadinessView` (pill hero → `Tabs`), `BugReportView`, `FeatureRequestView` (tab manual → `Tabs`).
- [ ] **D.5** `JobScraperView` (`/scrape-jobs`): chip → `Tabs xs`, kontras, target klik.
- [ ] **D.6** `DesignSystemView`, `ReferralView`.
- [ ] **D.7** Halaman auth (login, register, forgot, reset): `Field` + pesan error inline.
- [ ] **D.8** Sisa CTA oranye (47 pemakaian di 22 file) habis, dan sisa overlay `fixed inset-0` di luar `components/ui/` = 0.
- [ ] **D.9** `CustomIcons.tsx`: API diselaraskan dengan lucide, atau pemanggil diganti ke lucide.
- [ ] **D.10** Label tab panjang dipendekkan, teksnya disepakati dengan product owner.
- [ ] **D.V** Skrip `01`–`05` untuk semua route.

### PR 10: Fase 3, penguncian

- [ ] **L.1** ESLint rule untuk 6 pola terlarang (§7 butir 1). Pastikan `jsx-a11y` aktif.
- [ ] **L.2** Hapus `GooeyNav` lama, `.btn-neo-skeuo*` yang tidak terpakai, dan size `Button` lama.
- [ ] **L.3** Skrip audit menjadi `pnpm --filter @employr/dashboard test:visual` dengan baseline 19 route × 3 lebar × 2 tema + forced-colors 5 route.
- [ ] **L.4** Audit ulang lengkap dan perbarui skor di `audit-005`.
- [ ] **L.5** Uji manual NVDA: Tabs, satu `Sheet`, `AlertDialog` ujian, form Tambah Lamaran, popover notifikasi. Uji Windows High Contrast.
- [ ] **L.6** README `components/ui/` berisi aturan skala dan tabel konversi zoom.

### Definisi selesai keseluruhan
- [ ] Semua metrik di tabel target §8 tercapai.
- [ ] Test unit hijau di CI, dan lint tanpa pelanggaran baru.
- [ ] Skor audit ulang ≥85.


---

## 14. Update progres checkpoint — 3 Oktober 2026

### Status keseluruhan

| Checkpoint | Skor | Status |
|---|---:|---|
| `audit-005` — baseline setelah audit awal | 41/100 | selesai |
| `audit-007` — setelah fondasi awal | 61/100 | selesai |
| `audit-008` — setelah tab/focus/test dasar | 65/100 | selesai |
| `audit-009` — pembaruan terbaru | **69/100** | checkpoint aktif |
| Target fase migrasi | ≥85/100 | belum tercapai |
| Target akhir | 95–100/100 | belum tercapai |

### Yang sudah selesai

- [x] K1–K8 disetujui.
- [x] Token skala teks: caption 12px CSS, label 13px CSS, isi 14px CSS.
- [x] Codemod ukuran `text-[9px]`/`[10px]`/`[11px]` menjadi `text-caption`.
- [x] Codemod hardcoded `#1738D1` menjadi token cobalt.
- [x] `py-0.2` dihapus.
- [x] Komponen `Button`, `IconButton`, `Field`, `Tabs`, `Dialog`, `Sheet`, `AlertDialog`, dan `AsyncState` tersedia.
- [x] Semua pemakaian GooeyNav di komponen dashboard dimigrasikan ke Radix Tabs.
- [x] Tracker membedakan loading, error, dan empty state.
- [x] Focus return `Tambah Lamaran` dan overlay yang terjangkau fixture audit berhasil.
- [x] `.playwright-mcp/` dan `apps/dashboard/.cache/` sudah di-ignore.
- [x] Vitest + Testing Library + jest-axe terpasang dengan versi pinned yang kompatibel.
- [x] **17/17 test lulus** dalam 4 file.
- [x] Production build lulus.
- [x] Mobile sampled routes tidak horizontal overflow.
- [x] Forced-colors Radix Tabs membedakan state aktif/nonaktif.

### Validasi terbaru

- `pnpm test`: **17/17 pass**.
- `pnpm build`: **pass**.
- Build menghasilkan 2 warning Turbopack NFT tracing pada jalur Prisma mailer; tidak memblokir build.
- ESLint: **901 error / 458 warning**, mayoritas legacy (`no-explicit-any`, unused-vars, dan React rules). Lint belum menjadi gate hijau.
- Playwright fallback audit: tabs, overlay focus, Tracker error state, light/dark, mobile, dan forced-colors sudah diuji. MCP panel juga terverifikasi `playwright Connected (25 tools)`; saat backend browser suspend, audit dilanjutkan dengan Playwright Node yang sama-sama read-only.

### Sisa pekerjaan berurutan

#### Checkpoint berikutnya: target 75–80

1. Review manual seluruh CTA `bg-orange-500 text-white`; pindahkan CTA primer ke cobalt atau gunakan orange-700.
2. Perbaiki kontras pada `/beranda`, `/tracker`, `/readiness`, `/misi-cuan`, `/cv-screener/report`, dan `/scrape-jobs`.
3. Ubah teks `slate-400` di permukaan terang menjadi `slate-500` hanya pada konteks teks, bukan icon dekoratif.
4. Perbesar target kecil di `/scrape-jobs`, screener report, pagination, dan action icon.

#### Checkpoint berikutnya: target 80–85

5. Uji focus return dengan fixture untuk Offering, Interview Schedule, CV HRD, ATS drawer, dan drawer editor CV.
6. Perbaiki hydration mismatch `/cv/[id]` dan `/design-system`.
7. Tambahkan test API client, regression test seluruh Tracker, dan test overlay yang belum terjangkau.
8. Pastikan semua pulse berhenti saat reduced motion, termasuk `/match-cv`.
9. Hapus konflik token radius lama di `globals.css`.

#### Checkpoint akhir: target 85–100

10. Buat baseline lint legacy, lalu aktifkan lock-in rule untuk ukuran teks kecil, CTA oranye, overlay manual, dan interactive `<div>`.
11. Turunkan error lint secara bertahap sampai lint dashboard menjadi pass atau baseline exception terdokumentasi.
12. Jalankan regresi visual pada 390px, 1280px, 1440px; light, dark, forced-colors, dan reduced motion.
13. Uji manual NVDA/Narrator untuk Tabs, Sheet, AlertDialog, form Tracker, notifikasi, dan icon button.
14. Jalankan audit-001 sampai audit-009 versi final, perbarui skor, dan cek `git status` sebelum commit.

### Definition of Done akhir

- [ ] Skor audit ≥95/100.
- [ ] 0 kegagalan kontras AA pada route target yang diaudit.
- [ ] 0 overlay yang gagal focus-in, focus-trap, Escape, atau focus-return.
- [ ] 0 `<GooeyNav>` legacy.
- [ ] 0 CTA primer putih di atas orange-500.
- [ ] 0 input tanpa label atau `aria-describedby` ketika error.
- [ ] 0 target interaktif kritis di bawah 24px visual.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass tanpa warning baru.
- [ ] Lint pass atau semua exception legacy terdokumentasi dan disetujui.
- [ ] Tidak ada hydration mismatch pada route target.
- [ ] `.playwright-mcp/` dan semua cache/model lokal tidak ter-track git.
- [ ] Audit manual keyboard dan screen reader selesai.
