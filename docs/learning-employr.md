# Employr Learning Academy (`learning.employr`) — Dokumentasi Arsitektur & Fitur

> **Domain / Port**: `learning.employr.id` / `http://localhost:3004`  
> **Aplikasi**: `apps/learning`  
> **Tech Stack**: Next.js 15 (App Router), Tailwind CSS v4, TypeScript 5, `next-themes` (Dark & Light Mode), `lucide-react`.

---

## 1. Ikhtisar & Tujuan

`learning.employr` adalah portal akademi dan platform pembelajaran daring terintegrasi (*Coursera-level experience*) yang dirancang khusus untuk ekosistem **Employr**. Platform ini menyediakan kurikulum terstruktur dari mitra global dan universitas (seperti Stanford, Google, Meta, DeepLearning.AI, Universitas Indonesia, dan IBM), ruang kelas interaktif, evaluasi kuis dengan *passing grade*, transkrip video tersinkronisasi, asisten AI (*Employr Coach*), serta sertifikat kelulusan digital resmi yang terverifikasi.

---

## 2. Struktur 5 Modul Utama

```
apps/learning/
├── app/
│   ├── layout.tsx                     # Root layout + Providers + Font Geist/Inter
│   ├── globals.css                    # Tailwind v4 variables, dark/light theme, print CSS
│   ├── page.tsx                       # Modul 1: Katalog & Eksplorasi Kursus (Discovery)
│   ├── kursus/
│   │   └── [slug]/
│   │       ├── page.tsx               # Modul 2: Detail Kursus & Silabus Mingguan
│   │       └── belajar/[lessonId]/
│   │           └── page.tsx           # Modul 3 & 4: Ruang Kelas, Transkrip Sinkron, Kuis, AI Coach
│   ├── saya/
│   │   └── page.tsx                   # Modul 5: Dasbor Belajar Siswa (My Learning & Streak)
│   └── sertifikat/
│       └── [certId]/
│           └── page.tsx               # Modul 5: Sertifikat Kelulusan Digital & Cetak PDF
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 # Header global, search bar, dark/light toggle, profile dropdown
│   │   ├── Sidebar.tsx                # Collapsible sidebar desktop + weekly study target card
│   │   └── BottomNav.tsx              # 5-Tab mobile navigation
│   └── Providers.tsx                  # Next-themes provider
└── lib/
    ├── courses-data.ts                # Dataset lengkap: Stanford, Google, Meta, video, transcript, kuis
    └── utils.ts                       # Class merging utility (clsx + tailwind-merge)
```

---

## 3. Rincian Fitur Per-Modul

### 1. Navigasi & Eksplorasi Katalog (`/` & `/katalog`)
- **Pencarian Multi-Kriteria**: Pencarian real-time berdasarkan judul, keahlian, topik, institusi, atau nama instruktur.
- **Filter Fleksibel**:
  - Subjek: *AI & Machine Learning*, *Data Science*, *Computer Science*, *UI/UX Design*, *Business & Career*.
  - Tingkat: *Beginner*, *Intermediate*, *Advanced*.
  - Tipe Kredensial: *Specialization*, *Professional Certificate*, *Course*.
- **Bento Course Cards**:
  - Badge mitra & verifikasi.
  - Rating bintang dinamis & jumlah ulasan.
  - Estimasi total jam belajar.
  - Tombol simpan/bookmark interaktif.

### 2. Halaman Detail Kursus (`/kursus/[slug]`)
- **Hero Header**: Judul program, mitra penyelenggara, level, durasi, total pendaftar, dan rating.
- **Yang Akan Dipelajari (*Learning Outcomes*)**: Grid checklist kompetensi siap kerja.
- **Daftar Keahlian (*Skills Gained*)**: Badge keahlian yang dapat langsung dimasukkan ke CV ATS.
- **Silabus Modular Mingguan**: Accordion interaktif yang merinci materi video, bacaan, dan kuis evaluasi.
- **Profil Instruktur**: Biografi singkat dan pengalaman industri dari tenaga pengajar.

### 3. Ruang Kelas Interaktif (`/kursus/[slug]/belajar/[lessonId]`)
- **Pemutar Video Kustom**:
  - Kontrol kecepatan putar (0.75x, 1x, 1.25x, 1.5x, 2x).
  - Tombol lompat waktu mundur/maju 10 detik.
  - Seek bar responsif dan toggle audio/mute.
- **Transkrip Interaktif Tersinkronisasi**:
  - Transkrip berjalan otomatis mengikuti menit & detik video.
  - **Fitur Jump-Seek**: Menekan baris kalimat pada transkrip akan langsung melompatkan posisi video ke detik yang bersangkutan.
- **Materi Bacaan & Teori Akademis**: Tata letak bacaan terstruktur dengan dukungan formula matematika LaTeX dan kode.
- **Catatan Waktu Nyata (*Timestamped Notes*)**: Fitur mencatat rangkuman yang otomatis menangkap penanda waktu video saat ini.
- **Forum Diskusi Kursus (Q&A)**: Wadah interaksi bertanya, upvoting pertanyaan, dan diskusi antar peserta.

### 4. Mesin Penilaian & AI Tutor (*Quiz Engine & Coach*)
- **Quiz Engine**:
  - Kuis pilihan ganda evaluatif dengan ambang kelulusan standar industri (**Passing Grade 80%**).
  - Koreksi instan dengan indikator Lulus (Hijau) atau Gagal (Merah).
  - Pembahasan detail pada setiap opsi jawaban untuk memperdalam pemahaman.
  - Kemampuan mengulang kuis (*Retake Quiz*).
- **Employr Coach (AI Learning Assistant)**:
  - Tombol aksi cepat: *Rangkum Video Ini*, *Sederhanakan Konsep Rumit*, *Beri Contoh Industri Indonesia (Gojek, Bibit, Shopee)*.
  - Input dialog bebas untuk berkonsultasi mengenai materi apa pun.

### 5. Dasbor Belajar & Sertifikat Resmi (`/saya` & `/sertifikat/[id]`)
- **Pelacak Target Belajar Mingguan**: Menghitung jam belajar dan persentase pencapaian mingguan.
- **Rentetan Hari (*Study Streak* 🔥)**: Motivasi gamifikasi harian untuk membangun kebiasaan belajar.
- **Manajemen Tab Belajar**:
  - *Sedang Berjalan*: Kartu kursus aktif dengan bar progres & tombol cepat *"Lanjutkan Belajar"*.
  - *Selesai & Sertifikat*: Daftar kursus yang telah diselesaikan 100% dengan link ke sertifikat resmi.
  - *Tersimpan*: Bookmark kursus untuk dipelajari di masa mendatang.
- **Sertifikat Digital Terverifikasi**:
  - Tata letak resmi berstandar universitas dengan stempel institusi mitra.
  - ID Kredensial unik terverifikasi (misal: `EMP-2026-META-7712`).
  - QR Code verifikasi.
  - Tombol **Cetak / Unduh PDF** menggunakan `@media print` CSS.
  - Tombol **Bagikan ke LinkedIn**.

---

## 4. Standar Desain & Konsistensi UI

Platform ini menerapkan standar desain yang sama persis dengan Dashboard Pengguna:
- **Warna Utama**: Cobalt (`#1738D1`), Navy (`#1F3578`), Slate-50/950 backgrounds, Emerald (`#059669`), Amber (`#D97706`), Rose (`#EF4444`).
- **Sudut & Bento Grid**: Seluruh kontainer, kartu, dan tombol menggunakan `rounded-[10px]`.
- **Dukungan Dark & Light Mode**: Peralihan tema instan via `next-themes` tanpa refresh halaman.
- **Ikonografi**: 100% menggunakan `lucide-react` (tidak menggunakan emoji mentah pada UI interaktif).
- **Tipografi**: Heading `Geist`, Body `Inter`, Monospace `JetBrains Mono`.
- **Navigasi Responsif**: Sidebar dapat diciutkan (*collapsible*) pada desktop dan Bottom Navigation (5 tab) pada layar ponsel (< 1024px).

---

## 5. Menjalankan di Lingkungan Lokal

Untuk menjalankan aplikasi secara mandiri:
```bash
cd d:\cuti
pnpm --filter @cuti/learning dev
```
Atau jalankan seluruh ekosistem sekaligus melalui skrip startup:
```powershell
.\dev.ps1
```
Aplikasi akan aktif di **`http://localhost:3004`**.
