# PRD: User Dashboard & CV Creation (cuti.online)

## 1. Flow & User Journey

```
[Template Select] ➔ [Isi Form (6 Step)] ➔ [Checkout / Upgrade] ➔ [Queue Processing] ➔ [CV Ready] ➔ [Ctrl+P Print]
```

1. **Pilih Template**: User pilih layout CV (Simple ATS / Modern).
2. **Wizard Isi Form**: Input data personal, pengalaman, pendidikan, skill, proyek.
3. **Checkout & Add-on**: Pilih paket & opsi Express (Proses 1 jam vs 5 jam).
4. **Halaman Processing**: Tampil status "Sedang Disusun", progress bar palsu, countdown.
5. **Halaman Ready**: CV Terbuka. User bisa edit, tambah cover letter (Pro+), lihat AI score (Premium+).
6. **Download / Print**: Render HTML di browser ➔ User tekan tombol Print (Ctrl+P / `window.print()`).

---

## 2. Step-by-Step Form Wizard (7 Langkah)

### Langkah 1: Pilih Template
* Tampil daftar template ATS-friendly.
* Default: *Simple ATS* (1 kolom, margin aman).
* Status gratis: Ada watermark di bawah. Status bayar: Tanpa watermark.

### Langkah 2: Info Pribadi
* Input: Nama Lengkap, Email, Telepon, Alamat, LinkedIn (opsional), Ringkasan Profil (AI-assisted).
* Ringkasan Profil: Ada tombol "Tulis Pakai AI" (memakai resume singkat user).

### Langkah 3: Pengalaman Kerja
* Input dinamis (bisa tambah/hapus row):
  * Nama Perusahaan/Instansi
  * Posisi/Jabatan
  * Periode Kerja (Bulan/Tahun Mulai - Selesai atau "Masih Bekerja")
  * Deskripsi Pekerjaan (AI generator untuk mengubah bahasa sehari-hari menjadi profesional ATS).

### Langkah 4: Pendidikan
* Input dinamis:
  * Nama Sekolah/Universitas
  * Jurusan/Program Studi
  * Periode Belajar
  * Nilai Akhir / IPK (opsional).

### Langkah 5: Keahlian (Skills)
* Tag input: User ketik & tekan Enter (misal: "Microsoft Excel", "Negosiasi").
* AI suggestion chip berdasarkan *target_position*.

### Langkah 6: Proyek & Organisasi
* Input dinamis (opsional):
  * Nama Proyek / Organisasi
  * Peran/Jabatan
  * Deskripsi kontribusi.

### Langkah 7: Checkout & Opsi Tambahan
* Ringkasan Harga paket terpilih:
  * Basic (19k): Lifetime edit & download.
  * Pro (59k): + Cover Letter generator.
  * Premium (99k): + AI Match Score & ATS feedback.
* **Opsi Express Add-on**: Tambah Rp10.000 untuk proses instan 1 jam (Standard: 5 jam).
* Integrasi pembayaran: Midtrans Snap JS SDK.

---

## 3. Queue Processing & Lock UI

### Status: PROCESSING
* User dilarang melihat data mentah atau preview CV sebelum waktu `ready_at` tercapai.
* UI menampilkan:
  * Pesan: *"Tim profesional kami sedang menyusun & menyelaraskan CV Anda..."*
  * Progress Bar: Bergerak lambat dari 0% ke 99% (tidak boleh 100% sebelum waktunya).
  * Countdown Timer: Sisa jam & menit berdasarkan `ready_at`.
* Status di database: `cv_projects.status = 'PROCESSING'`.

### Status: READY
* Terbuka otomatis via polling worker setiap 1 menit (saat `now >= ready_at`).
* UI menampilkan:
  * Tombol: *"Lihat CV"* & *"Cetak PDF"* aktif.
  * Preview interaktif.
* Status di database: `cv_projects.status = 'READY'`.

---

## 4. Client-side Print Layout (Ctrl+P)

* **ZERO SERVER-SIDE PDF GENERATION**.
* Menggunakan CSS Media Query `@media print` untuk cetak instan ke PDF asli lewat browser.

```css
/* apps/dashboard/src/app/cv/[id]/print/page.tsx - Print Styles */
@media print {
  body {
    background: #FFFFFF;
    color: #1A1A1A;
    font-size: 11pt;
    line-height: 1.3;
  }
  @page {
    size: A4;
    margin: 1.5cm 1.5cm 1.5cm 1.5cm;
  }
  .no-print {
    display: none !important;
  }
  .page-break {
    page-break-before: always;
  }
  a {
    text-decoration: none;
    color: #1A1A1A;
  }
}
```

* UI menyertakan tombol trigger:
  ```tsx
  <button onClick={() => window.print()} className="bg-action text-white px-4 py-2 rounded">
    Cetak PDF (Ctrl+P)
  </button>
  ```

---

## 5. Skema Fitur (Free vs Paid Tiers)

| Fitur | Free | Basic (19k) | Pro (59k) | Premium (99k) |
|---|---|---|---|---|
| Masa Aktif Edit Draft | 7 Hari | Selamanya | Selamanya | Selamanya |
| Watermark CV | ✅ Ya | ❌ Tidak | ❌ Tidak | ❌ Tidak |
| Download PDF (Browser Print) | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya |
| Cover Letter Generator | ❌ Tidak | ❌ Tidak | ✅ Ya | ✅ Ya |
| AI Match Score | 🔒 Lock | 🔒 Lock | 🔒 Lock | ✅ Ya |
| ATS Insight & Tips | 🔒 Lock | 🔒 Lock | 🔒 Lock | ✅ Ya |
| Alternatif Lowongan | 🔒 Lock | 🔒 Lock | 🔒 Lock | ✅ Ya |
| **Waktu Tunggu Standard** | - | 5 Jam | 5 Jam | 5 Jam |
| **Waktu Tunggu Express (+10k)**| - | 1 Jam | 1 Jam | 1 Jam |
