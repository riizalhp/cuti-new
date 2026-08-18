# Employr Dashboard Design System

**Version**: 2.0 (Official Standardized)  
**Last Updated**: 2026-08-16  
**Stack**: Next.js 15 (App Router), Tailwind CSS 4, Lucide React

---

## 1. Brand Identity

```
Name: Employr (Official Domain: employr.id)
Tagline: Career Operating System untuk Talenta Muda Indonesia
Personality: Friendly, Optimis, Terpercaya, Cepat
Anti-Pattern: Corporate, Enterprise kaku
```

---

## 2. Color Palette (Dashboard User)

### Core Tokens
```css
/* Primary Action CTA (SELALU COBALT BLUE) */
--color-cobalt-500: #1738D1;
--color-cobalt-600: #132EA8;

/* Brand Identity (Navy) */
--color-navy-700:   #1F3578;
--color-navy-500:   #3B5CC4;

/* Canvas & Borders (Light / Dark) */
--bg-light:         #F8FAFC; /* slate-50 */
--card-light:       #FFFFFF;
--border-light:     #E2E8F0; /* slate-200 */

--bg-dark:          #020617; /* slate-950 */
--card-dark:        #0F172A; /* slate-900 */
--border-dark:      #1E293B; /* slate-800 */
```

### Semantic Status
```css
--success:          #10B981; /* emerald-500 */
--warning:          #F59E0B; /* amber-500 */
--error:            #EF4444; /* rose-500 */
--info:             #3B82F6; /* blue-500 */
```

---

## 3. Typography Hierarchy

- **Font Family**: `Geist` (Headings & Display) + `Inter` (Body, UI, Forms) + `JetBrains Mono` (Code & Tokens).
- **H1 / Page Title**: `text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white`
- **H2 / Section Title**: `text-lg font-bold text-slate-900 dark:text-white`
- **H3 / Card Header**: `text-base font-bold text-slate-900 dark:text-white`
- **Body**: `text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed`
- **Caption & Meta**: `text-xs text-slate-500 dark:text-slate-400`
- **Badge & Label**: `text-[10px]` atau `text-[11px] font-bold uppercase tracking-wider rounded-[10px]`

---

## 4. Button & Action Hierarchy

| Tipe Tombol | Class Tailwind | Kegunaan |
|---|---|---|
| **Primary Action (CTA)** | `px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition` | Submit formulir, Simpan lamaran, Upgrade paket, Beli membership, Mulai latihan. (Hanya 1 per card/view). |
| **Secondary Brand** | `px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition` | Filter data, ganti tab, navigasi sekunder. |
| **Secondary Ghost** | `px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition` | Aksi pendukung, detail view, toggle filter. |
| **Tertiary / Batal** | `px-3.5 py-2 rounded-[10px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition` | Batal, Tutup drawer. |

---

## 5. Visual Score Standard (Kotak vs Bulat)

1. **Format Kotak (`rounded-[10px]`) + Horizontal Bar**:
   - Standar untuk semua kartu **Bento Grid Beranda**, daftar list item, dan tabel.
   - Contoh: Badge angka `86/100` di pojok kartu, status `Sangat Baik`, bar horizontal `h-2 bg-slate-100 rounded-full`.
2. **Radial SVG Progress Ring (Bulat)**:
   - Khusus untuk **Master Hero Score** di header halaman diagnostik mendalam (seperti Evaluasi CV atau Tes Career Readiness).
   - Wajib memiliki animasi meter SVG melingkar sesuai persentase angka.

---

## 6. Layout & Navigasi Mobile-First

- **Desktop (≥ 1024px)**: Sidebar kiri 256px (`md:w-64`) / 80px (`md:w-20`) collapsed.
- **Mobile (< 1024px)**: Fixed **Bottom Navigation Bar (64px + safe area)** dengan 5 tab:
  1. *Beranda* (`/beranda`)
  2. *CV Saya* (`/cv`)
  3. *Tracker* (`/tracker`)
  4. *Misi & Cuan* (`/misi-cuan`)
  5. *Akun* (`/pengaturan`)
- Dilarang menggunakan menu hamburger fullscreen yang memblokir layar di mobile.

---

## 7. Interactive Right-Hand Drawer

Seluruh formulir interaktif kompleks (Tambah Lamaran, Edit CV, Detail ATS) menggunakan drawer samping kanan:
- Backdrop: `fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end`
- Drawer Panel: `w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300`
