# Employr — Design System & Art Direction

## I. Landing Page Design System & Art Direction

### 1. Ringkasan Produk

Employr adalah **Career Operating System** untuk siswa SMA/SMK, mahasiswa, dan fresh graduate Indonesia usia 16–24 tahun. Pengalaman visualnya harus terasa seperti perpaduan platform karier yang terpercaya, gamifikasi yang menyenangkan, dan produk fintech Indonesia yang rapi.

**Persona merek:** friendly, optimistis, youthful, career-focused, dan trustworthy.

**Janji utama:** seluruh perjalanan menuju pekerjaan pertama—membuat CV, menemukan peluang, melacak lamaran, meningkatkan kemampuan, dan menyelesaikan misi—tersedia dalam satu tempat.

### 2. Arah Visual

Arah utama adalah **Youth Career Editorial**: layout editorial berukuran besar dipadukan dengan komponen produk yang jelas dan fotografi talenta muda Indonesia.

Inspirasi dari tiga referensi diterjemahkan sebagai berikut:

1. **Landing sinematik:** hero visual besar, fotografi aspiratif, headline langsung, dan ruang putih yang lega.
2. **Portfolio editorial cobalt:** tipografi display berskala ekstrem, grid tegas, garis tipis, dan komposisi asimetris.
3. **Poster teknologi ultramarine:** warna biru dominan, energi visual tinggi, kartu seperti poster cetak, dan kontras putih–biru yang kuat.

Employr tidak menyalin identitas referensi secara literal. Sistem ini mengadaptasi ritme, skala, dan keberanian visualnya agar relevan dengan audiens muda Indonesia.

### 3. Prinsip Desain

#### Berani tetapi tidak mengintimidasi

Gunakan headline besar, cobalt yang tegas, dan fotografi penuh energi. Navigasi, body copy, serta alur CTA harus tetap sederhana.

#### Terasa seperti progres

Setiap elemen produk perlu mengomunikasikan kemajuan: skor ATS, status lamaran, progress bar, tahapan journey, dan reward.

#### Editorial bertemu produk

Judul menggunakan komposisi editorial, sementara mockup CV, Kanban, kartu loker, dan misi harus tetap terbaca seperti antarmuka produk nyata.

#### Lokal dan aspiratif

Fotografi menampilkan talenta muda Indonesia dengan pakaian smart-casual, ekspresi percaya diri, dan suasana persiapan karier yang optimistis.

### 4. Color System (Landing Page)

Sistem dibatasi ke lima warna agar identitas kuat dan konsisten.

| Token | Nilai | Fungsi |
|---|---:|---|
| `--ink` | `#101114` | Teks utama, garis, section gelap, tombol kontras |
| `--paper` | `#F5F6F2` | Latar utama, permukaan kartu, teks pada cobalt/ink |
| `--cobalt` | `#1738D1` | Warna merek utama, hero visual, CTA, section akses |
| `--periwinkle` | `#C9D0FF` | Permukaan pendukung dan kartu CV |
| `--lime` | `#C8F55B` | Status sukses, progres, reward, dan aksen interaktif |

#### Aturan penggunaan

- Cobalt adalah warna dominan dan dipakai untuk membangun pengenalan merek.
- Lime hanya digunakan sebagai aksen bermakna: status aktif, progres, reward, dan keberhasilan.
- Paper menggantikan putih murni agar tampilan lebih lembut tetapi tetap bersih.
- Ink menggantikan hitam murni agar kontras tidak terasa terlalu keras.
- Jangan menambahkan gradient dekoratif atau warna baru tanpa kebutuhan produk yang jelas.

### 5. Typography (Landing Page)

#### Font aktif

- **Inter Tight** — heading sans, body, navigasi, label, tombol, dan elemen produk.
- **Instrument Serif** — kata beraksen, angka display, harga, dan momen emosional pada headline.

```css
--sans: 'Inter Tight', sans-serif;
--serif: 'Instrument Serif', serif;
```

**Bodoni Moda** merupakan bagian dari referensi awal, tetapi tidak dipakai pada implementasi aktif agar sistem tetap maksimal dua keluarga font, lebih cepat dimuat, dan tidak kehilangan konsistensi. Jika dipakai untuk materi kampanye, Bodoni Moda hanya boleh menggantikan Instrument Serif—bukan menjadi font ketiga.

#### Hierarki

| Elemen | Gaya |
|---|---|
| Hero H1 | Inter Tight, `clamp(4rem, 7.2vw, 8rem)`, line-height `0.84`, tracking rapat |
| Section H2 | Inter Tight dengan aksen Instrument Serif, line-height `0.88` |
| Feature H3 | Inter Tight dengan aksen Instrument Serif, line-height `0.9` |
| Body besar | Inter Tight 18–23px, line-height 1.45–1.5 |
| Body reguler | Inter Tight 16px, line-height 1.5–1.6 |
| Kicker/label | Inter Tight 12px bold, uppercase, tracking `0.14em` |

Aksen serif selalu digunakan secara selektif melalui `<em>` untuk kata emosional seperti “kariermu”, “siap kerja”, atau “investasi karier”.

### 6. Grid & Spacing (Landing Page)

- Pendekatan **mobile-first**.
- Padding horizontal desktop: `3vw`.
- Padding section desktop: `130px 3vw`.
- Padding section mobile: `90px 20px`.
- Header desktop: 78px; mobile: 68px.
- Border sistem: `1px solid var(--ink)`.
- Radius digunakan hemat: pill CTA, avatar, badge, dan status. Kartu editorial utama tetap bersudut tegas.

#### Breakpoint utama

- Desktop/tablet besar: `> 900px`
- Mobile/tablet kecil: `≤ 900px`
- Mobile sempit: `≤ 480px`

### 7. Struktur Landing Page

#### Header

Sticky header transparan dengan blur ringan. Logo berbentuk monogram serif di dalam lingkaran cobalt, navigasi anchor, CTA lifetime, dan menu mobile.

#### Hero

Split layout dua kolom:

- Kiri: status brand, headline besar, lede, CTA, dan target audience.
- Kanan: fotografi hero penuh, dua sticker data produk, serta caption editorial.
- Di bawah hero terdapat ticker cobalt untuk memperkenalkan fitur utama.

#### Feature Grid

Grid 2×2 desktop dan satu kolom mobile. Setiap kartu memiliki indeks, mockup produk, headline, dan penjelasan.

1. **CV Builder:** periwinkle + mockup CV di atas bidang cobalt.
2. **Job Tracker:** Kanban gelap dengan status lamaran.
3. **Misi:** lime + visual koin dan progress bar.
4. **Loker:** fotografi talenta muda + kartu lowongan melayang.

#### Career Journey

Section ink dengan empat tahapan besar. Hover menambahkan perpindahan horizontal dan aksen lime untuk menyampaikan progres.

#### Lifetime Access

Section cobalt dua kolom. Kiri menjelaskan manfaat; kanan menggunakan price card paper yang sedikit berotasi dan memiliki bayangan offset bergaya poster.

#### FAQ

Layout dua kolom dengan disclosure native `<details>`. Ikon plus berotasi saat item dibuka.

#### Footer

CTA berskala ekstrem pada latar ink, round link lime, kemudian informasi produk dan navigasi sekunder.

### 8. Komponen Inti (Landing Page)

#### Primary Button

- Bentuk pill.
- Tinggi minimum 54px.
- Latar cobalt, teks paper.
- Hover: naik 3px, latar paper, teks cobalt.
- Gunakan label yang berorientasi aksi, misalnya “Mulai perjalananmu”.

#### Dark Purchase Button

- Latar ink dan lebar penuh di dalam price card.
- Hover menggunakan lime untuk menegaskan keputusan pembelian.

#### Editorial Sticker

- Latar paper, border ink, bayangan offset 6px.
- Rotasi antara −5° sampai 4°.
- Hanya untuk data yang membantu keputusan, bukan dekorasi kosong.

#### Feature Card

- Border membentuk grid terpadu.
- Warna permukaan mengikuti konteks fitur.
- Tidak menggunakan rounded card generik.
- Mockup harus menjelaskan fungsi sebelum pengguna membaca paragraf.

### 9. Imagery

#### Gaya fotografi

- Talenta muda Indonesia usia 18–24 tahun.
- Smart-casual, percaya diri, hangat, dan autentik.
- Direct flash atau pencahayaan studio editorial.
- Dominasi cobalt/periwinkle dengan detail lime secukupnya.
- Tidak menggunakan foto kantor korporat generik atau pose berjabat tangan.

#### Aset aktif

- `/public/images/cuti-hero.png` — hero landscape berisi tiga talenta muda.
- `/public/images/cuti-career.png` — portrait editorial untuk kartu loker.

Semua gambar harus memiliki alt text deskriptif, dimensi eksplisit, dan `loading="lazy"` untuk gambar di bawah fold.

### 10. Motion

Motion harus menunjukkan energi dan progres, bukan menjadi dekorasi acak.

#### Reveal on scroll

Elemen `[data-reveal]` dimulai dengan opacity 0 dan translasi vertikal 45px. Saat masuk viewport, elemen bergerak ke posisi akhir selama 750ms menggunakan easing `cubic-bezier(.2,.75,.25,1)`.

#### Marquee

Ticker fitur bergerak linear selama 24 detik dengan konten yang diduplikasi untuk loop tanpa jeda.

#### Floating sticker

Sticker hero bergerak vertikal 10px selama empat detik. Delay berbeda menciptakan ritme tanpa terasa ramai.

#### Hover

- Hero image zoom maksimal 1.025.
- Button naik 3px.
- Journey row bergeser 20px.
- Footer round link berotasi 45° dan membesar sedikit.

Seluruh animasi wajib menghormati `prefers-reduced-motion` dengan menonaktifkan transisi dan menampilkan konten secara langsung.

### 11. Tone of Voice

Gunakan Bahasa Indonesia kasual, ringkas, dan membangun kepercayaan.

**Gunakan:**

- “Semua urusan kariermu, di satu tempat.”
- “Dari bingung jadi berani.”
- “CV bagus, peluang naik.”
- “Sekali bayar. Selamanya punya.”

**Hindari:**

- Bahasa HR yang terlalu formal.
- Janji pekerjaan yang tidak realistis.
- Istilah teknis tanpa penjelasan.
- Copy yang menggurui atau membuat pengguna merasa tertinggal.

### 12. Accessibility

- Kontras utama menggunakan pasangan ink–paper, cobalt–paper, dan ink–lime.
- Struktur harus memakai elemen semantik: `header`, `main`, `section`, `article`, `footer`.
- Menu mobile memakai `aria-expanded` dan label yang jelas.
- Mockup dekoratif yang membawa informasi diberi `aria-label`.
- Fokus keyboard tidak boleh dihapus.
- Teks body tidak boleh lebih kecil dari 14px.
- Informasi status tidak boleh hanya bergantung pada warna.
- Semua animasi menyediakan reduced-motion fallback.

### 13. Batasan Konsistensi

- Maksimal lima warna inti.
- Maksimal dua keluarga font aktif.
- Hindari rounded cards generik, glow, blob, dan gradient dekoratif.
- Jangan menambahkan statistik tanpa sumber atau fungsi yang jelas.
- Pertahankan garis tipis, skala tipografi besar, fotografi editorial, dan satu aksen lime yang bermakna.
- Elemen baru harus terasa seba## II. Dashboard User Design System (`http://localhost:3000/design-system`)

### 1. 5 Pilar Utama Design System Dashboard User

1. **Strict Lucide Icons Only**:
   - Dilarang keras memakai emoji/emoticon kasar pada UI antarmuka dashboard.
   - Seluruh visual indicator dan status menggunakan ikon SVG terukur dari `lucide-react`.

2. **Bento Grid Architecture & Rounded 10px**:
   - Pengelompokan informasi secara modular menggunakan Tailwind Grid (`grid-cols-12` atau `grid-cols-1 md:grid-cols-3`).
   - Hirarki visual jelas dengan padding proporsional (`p-5`, `p-6`), batas border bersih (`border-slate-200 dark:border-slate-800`), dan sudut terstandarisasi (`rounded-[10px]`).

3. **Standardisasi Skor (Kotak vs Radial Ring)**:
   - **Format Kotak (`rounded-[10px]`) + Horizontal Bar**: Standar untuk 90% widget Bento Grid, kartu Beranda, list, dan tabel.
   - **Radial SVG Progress Ring**: Khusus untuk 1 Master Hero Score di header halaman diagnostik mendalam (seperti Evaluasi CV & Career Readiness).

4. **Right-Hand Slide-in Drawer**:
   - Seluruh formulir interaktif kompleks (misalnya: *Tambah Lamaran*, *Detail ATS*, *Edit Profil*) WAJIB menggunakan slide-in drawer yang meluncur dari kanan layar (`fixed inset-0 z-50 justify-end slide-in-from-right`), BUKAN modal pop-up di tengah.
   - Dilengkapi backdrop blur kustom (`bg-slate-950/60 backdrop-blur-xs`), header bertitel dengan tombol tutup, body dengan scroll independen (`overflow-y-auto`), serta sticky footer action.

5. **Mobile-First Bottom Navigation (5 Tab)**:
   - Di layar mobile (< 1024px), gunakan fixed **Bottom Navigation (64px + safe area)**: *Beranda, CV, Tracker, Misi, Akun*.
   - Tidak menggunakan menu hamburger yang memblokir layar di mobile dashboard.

---

### 2. Palet Warna Dashboard User

| Peran / Token | Light Mode | Dark Mode | Fungsi Utama |
|---|---|---|---|
| **CTA Utama (Cobalt)** | `#1738D1` (`cobalt-500` / `#1738D1`) | `#3B82F6` / `cobalt-400` | Tombol aksi utama (submit, upgrade, buat CV, lamar) |
| **Brand Primary (Navy)** | `#1F3578` (`navy-700`) | `#3B5CC4` (`navy-500`) | Brand identity, sidebar header, badge brand |
| **Success Emerald** | `#059669` / `#10B981` (`emerald-600`/`emerald-500`) | `emerald-400` / `bg-emerald-950` | Status Offering, reward referral, indikator pencapaian |
| **Warning Amber** | `#D97706` / `#F59E0B` (`amber-600`/`amber-500`) | `amber-400` / `bg-amber-950` | Sesi interview mendatang, deadline pending, misi aktif |
| **Danger Rose/Red** | `#E11D48` / `#EF4444` (`rose-600`/`rose-500`) | `rose-400` / `bg-rose-950` | Status Ditolak, konfirmasi hapus, error state |
| **Info / Stage Blue** | `#2563EB` / `#3B82F6` (`blue-600`/`blue-500`) | `blue-400` / `bg-blue-950` | Status Lamaran Terkirim, pengumuman, info tracker |
| **Background Canvas** | `#F8FAFC` (`slate-50`) / `#FFFFFF` | `#020617` (`slate-950`) / `#0F172A` | Canvas utama dan card background |
| **Border & Divider** | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | Garis pemisah card dan modul bento |
| **Text Hierarchy** | Primary: `#0F172A` (`slate-900`) / Muted: `#64748B` (`slate-500`) | Primary: `#F8FAFC` (`slate-50`) / Muted: `#94A3B8` (`slate-400`) | Teks judul, body, dan caption metadata |

---

### 3. Skala Tipografi Dashboard User

- **Font Family**: `Geist` (headings/display) + `Inter` (body/UI) + `JetBrains Mono` (kode/token).
- **Hero / Page Title**: `text-2xl font-extrabold` (24px, line-height 1.25, tracking-tight).
- **Section / Card Header**: `text-base font-bold` (16px, line-height 1.4).
- **Body Text**: `text-sm font-medium` (14px, line-height 1.5).
- **Metadata / Small**: `text-xs` (12px, line-height 1.5).
- **Labels / Badges**: `text-[10px]` atau `text-[11px]` `font-bold uppercase tracking-wider rounded-[10px]`.
- **Monospace Code / Referral Tokens**: `font-mono font-bold text-sm tracking-wider`.

---

### 4. Komponen UI Dashboard User

#### Button Styles

- **Primary Cobalt CTA Button**: `px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer`
- **Secondary Navy/Dark Button**: `px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer`
- **Secondary Ghost Button**: `px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer`
- **Success Outline Button**: `px-3.5 py-2 rounded-[10px] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/60 transition flex items-center gap-1`
- **Danger Action Button**: `px-3.5 py-2 rounded-[10px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200/80 dark:border-rose-800/60 transition flex items-center gap-1`

#### Badges & Live Status Indicators (All `rounded-[10px]`)

- **Recommendation Badge**: `px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1`
- **Status Offering Badge**: `px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800`
- **Status Interview Badge**: `px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800`
- **ATS Score Badge (Kotak)**: `px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800`

#### Right-Hand Slide-in Drawer Spec

- **Overlay Backdrop**: `fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity`
- **Drawer Panel**: `relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300`
- **Header**: `p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30`
- **Sticky Footer**: `p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5`
