# Employr Dashboard — Design System UI Primitives

Dokumentasi resmi komponen primitif antarmuka (`apps/dashboard/components/ui/`) berdasarkan Design System Employr dan spesifikasi Anti-Slop (Plan 005).

---

## 1. Aturan Skala, Root Font Size, & Konversi Zoom

Dashboard Employr menggunakan konfigurasi tipografi global yang dioptimalkan untuk kepadatan informasi visual (*dense editorial bento layout*):

- **Root Font Size**: `html { font-size: 87.5%; }` (1rem = 14px)
- **Desktop Zoom**: `@media (min-width: 1024px) { body { zoom: 0.8; } }` (Chromium desktop render)
- **Mobile (< 1024px)**: Tanpa zoom (`zoom: 1`), 100% responsif mobile-first dengan safe area bottom navigation.

### Tabel Konversi Skala Teks

| Token / Kelas | CSS Size | Line Height | Mobile Fisik (`zoom: 1`) | Desktop Fisik (`zoom: 0.8`) | Fungsi Utama |
|---|---|---|---|---|---|
| `text-caption` | 11px (`0.785rem`) | 13px | 11px | 8.8px | Badge status, metadata kecil, label form pembantu, chip |
| `text-xs` | 12px (`0.857rem`) | 16px | 12px | 9.6px | Metadata kartu, teks caption sekunder, tanggal |
| `text-sm` | 14px (`1rem`) | 20px | 14px | 11.2px | Body text utama, input form, tombol standar |
| `text-base` | 16px (`1.143rem`) | 24px | 16px | 12.8px | Header section, judul modul kartu bento |
| `text-lg` | 18px (`1.285rem`) | 28px | 18px | 14.4px | Judul dialog modal, sub-heading halaman |
| `text-xl` | 20px (`1.428rem`) | 28px | 20px | 16px | Stat metrics hero, total counter |
| `text-2xl` | 24px (`1.714rem`) | 32px | 24px | 19.2px | Judul halaman utama, page header hero |

> **Catatan Anti-Slop**: Dilarang menggunakan arbitrer `text-[9px]`, `text-[10px]`, atau `text-[11px]`. Selalu gunakan semantik token `text-caption`.

---

## 2. Aturan Target Klik & Aksesibilitas (WCAG 2.1 AA)

1. **Target Sentuh & Klik Minimum**:
   - Semua elemen interaktif (`<button>`, `<a>`, `<input>`, kontrol tab) memiliki tinggi/area minimum **≥ 30px CSS** (misal `h-[30px]`, `py-1.5 px-3`, `min-h-[30px]`).
   - `IconButton` size `sm` terstandarisasi `size-[30px]` (30x30px), size `md` `size-[36px]`, size `lg` `size-[44px]`.
2. **Kontras Warna Teks**:
   - Seluruh teks pada permukaan terang (`bg-white`, `bg-slate-50`, `bg-slate-100`) memiliki rasio kontras minimal **≥ 4.5:1**.
   - Dilarang memakai `text-slate-400` untuk teks konten di atas latar terang (gunakan `text-slate-500` atau `text-slate-600`).
3. **Fokus Keyboard & Reduced Motion**:
   - Semua kontrol interaktif memiliki `focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-1`.
   - Semua animasi CSS dan transisi wajib menyertakan kelas `motion-reduce:animate-none` dan `motion-reduce:transition-none`.

---

## 3. Komponen Fondasi

### `Button` (`@/components/ui/button`)
Tombol standar dengan varian semantik konsisten:
- **Variants**:
  - `primary`: Background `cobalt-500` (`#1738D1`), teks putih. Digunakan untuk CTA primer.
  - `secondary`: Slate-900 di light mode, slate-100 di dark mode.
  - `outline`: Border `slate-200 dark:border-slate-800`, latar belakang transparan.
  - `ghost`: Transparan dengan efek hover halus.
  - `danger`: Aksi destruktif (misal hapus akun / konfirmasi fatal).
  - `subtle`: Latar belakang bernuansa lembut (`bg-slate-100 text-slate-700`).
  - `link`: Tampilan link teks dengan gaya underline hover.
- **Sizes**: `sm` (h-8 / 32px), `md` (h-10 / 40px), `lg` (h-12 / 48px).

### `IconButton` (`@/components/ui/icon-button`)
Tombol ikon dengan atribut aksesibilitas wajib:
- **Prop Wajib**: `label` (string untuk `aria-label`).
- **Sizes**: `sm` (30px), `md` (36px), `lg` (44px).

### `Field` & `Input` (`@/components/ui/field`)
Wrapper form dengan binding otomatis:
- Mengikat `id` input dengan `htmlFor` label.
- Mengikat `hint` dan `error` ke `aria-describedby`.
- Menandai `aria-invalid="true"` saat error terjadi.

### `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (`@/components/ui/tabs`)
Implementasi tab berbasis `@radix-ui/react-tabs`:
- Mendukung navigasi panah keyboard penuh, Home, End, `aria-selected`.
- **Variants**: `pill` (bento box pill), `underline` (line underline).
- **Sizes (pada TabsTrigger)**: `xs` (28px tinggi untuk filter padat), `sm` (32px), `md` (38px).

### `Dialog`, `Sheet`, `AlertDialog` (`@/components/ui/dialog`, `sheet`, `alert-dialog`)
Modal dan slide-over drawer berbasis `@radix-ui/react-dialog`:
- Backdrop blur standar `bg-slate-950/60 backdrop-blur-xs`.
- Focus trapping otomatis, Escape handling, restorasi fokus saat ditutup.
- `Sheet`: Right-hand slide-in drawer untuk semua formulir detail kompleks.
- `AlertDialog`: Konfirmasi aksi penting (ujian selesai, hapus data permanen).

### `AsyncState` (`@/components/ui/async-state`)
Penangan status asinkron modular:
- `loading`: Menampilkan skeleton / loader dengan `role="status"`.
- `error`: Menampilkan pesan kendala ramah pengguna dengan tombol "Coba Lagi" (`role="alert"`).
- `empty`: State kosong informatif dengan CTA tindakan relevan.
- `ready`: Merender konten anak utama saat data telah berhasil dimuat.
