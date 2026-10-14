# Agent Rules Index — Employr Workspace

> **PENTING UNTUK SEMUA AGENT**:
> 5 aturan di bawah ini **OTOMATIS AKTIF (ALWAYS-ON)** pada SETIAP PROMPT pengguna.
> **JANGAN PERNAH** meminta pengguna memanggil slash command `/antislop-ui`, `/antislop-human`, `/humanizer`, `/caveman`, atau `/ponytail` secara manual.
> **JANGAN PERNAH** menanyakan "kapan antislop diterapkan" — semua filter dan aturan ini aktif secara default sejak awal hingga selesai.

---

## ⚡ 1. Ponytail Rule (Anti-Overengineering & Simplicity)
- **YAGNI (You Aren't Gonna Need It)**: Tulis kode seefisien dan seminimal mungkin. Jangan buat abstraksi, wrapper, atau utility baru jika belum mendesak.
- **Native Platform First**: Utamakan fitur bawaan platform (native HTML/JS/CSS seperti `<dialog>`, `<details>`, `fetch`, CSS Grid/Flexbox) daripada membuat komponen rumit atau menginstal package baru.
- **Maksimalkan Dependency yang Ada**: Gunakan library yang sudah terpasang di `package.json` sebelum mempertimbangkan `pnpm add`.
- **Non-Negotiables**: Keamanan/Auth, Aksesibilitas (WCAG), Error Handling, dan TypeScript Strict Typing tidak boleh dikorbankan.

---

## ⚡ 2. Caveman Rule (Komunikasi Ringkas & Hemat Token)
- **No Fluff / Preamble**: Dilarang menggunakan basa-basi pembuka (*"Tentu, saya akan membantu..."*, *"Baik, berikut penjelasannya..."*) atau penutup sopan santun klise.
- **Telegraphic & Point-to-Point**: Langsung ke inti teknis, lokasi file, diff/kode yang diubah, dan langkah verifikasi secara ringkas dan lugas.
- **Efisiensi Token Maksimal**: Berikan output padat informasi tanpa mengorbankan ketepatan teknis atau keamanan kode.

---

## ⚡ 3. Antislop-UI (Anti-Slop Visual, Warna & Layout)
- **Warna & Palet**: Maksimal 2–3 warna inti + 1 warna aksen (ikuti `business-rules.md` / `design.md` / `GEMINI.md`). Dilarang gradien biru-ungu generik, palet neon/pastel acak, atau radial glow/blur di belakang hero.
- **No Glassmorphism & Shadow Berlebih**: Maksimal 1–2 elemen ber-glass. Shadow hanya sebagai penanda elevasi fungsional, bukan mengambang di seluruh elemen.
- **Bespoke SVG Icons Only**: Dilarang generic Lucide icon-sprawl di setiap baris/tombol/badge. Dilarang menggunakan emoji/emoticon pada antarmuka dashboard. Jika teks sudah jelas, jangan tambahkan ikon.
- **Struktur Layout Berdasarkan Kebutuhan**: Hindari template generik kaku (Hero -> Feature Grid -> Testimonial -> FAQ). Gunakan Bento Grid hanya jika konten memiliki variasi ukuran nyata yang membutuhkan penekanan hierarki.
- **Theme**: Light mode default (slate-50 canvas, kartu putih) kecuali eksplisit diperintahkan dark mode.

---

## ⚡ 4. Antislop-Human (Aksesibilitas & Standar Kenyamanan Manusia)
- **Kontras WCAG AA Mutlak**: Rasio kontras teks minimal 4.5:1 untuk teks normal dan 3:1 untuk teks besar (>=18px) serta batas komponen interaktif.
- **No Grey-on-Grey Hallucination**: Jangan pernah berasumsi teks abu-abu di atas latar putih/abu-abu lolos kontras tanpa perhitungan pasti (misal `#555555` di latar gelap gagal).
- **Keyboard & Fokus**: Semua elemen interaktif wajib bisa diakses via keyboard (`Tab`, `Enter`, `Space`, `Escape`) dengan cincin fokus (`focus-visible:ring`) yang terlihat jelas.
- **Touch Target**: Ukuran tombol dan target sentuh di layar mobile minimal 44x44px.
- **Motion Accessibility**: Hormati `prefers-reduced-motion` untuk semua transisi dan animasi.

---

## ⚡ 5. Humanizer (Gaya Bahasa Alami Manusia)
- **Hapus Pola Tulisan Khas AI**:
  - Dilarang pola "Bukan X, melainkan Y" atau "Not only X, but Y".
  - Dilarang pembuka klise (*"Di era digital yang serba cepat..."*, *"Dalam lanskap persaingan kerja..."*).
  - Dilarang penutup kesimpulan satu kalimat (*"Pada akhirnya..."*, *"Dengan demikian, ini membuktikan..."*).
  - Dilarang pola kalimat bertiga (triads) yang dipaksakan dan penggunaan em-dash (—) di setiap kalimat.
  - Dilarang kata-kata buzzword AI (e.g. *menapaki, merambah, tonggak sejarah, menyelami, elevate, delve, seamless, testament, landscape*).
- **Tone of Voice**: Bahasa Indonesia kasual, bersahabat seperti kakak kelas suportif (gunakan "kamu" di dashboard), lugas, jujur, dan tidak melebih-lebihkan klaim.

---

## ⚡ 6. Status Fitur Non-Aktif (STRICT BLACKLIST — HIDE & JANGAN DIPANGGIL)
- **Misi / Cuan Tambahan (`/misi-cuan`)**: **BELUM ADA / BELUM SIAP**. WAJIB di-hide dari seluruh UI. Dilarang keras mengusulkan, menampilkan di navigasi, grid beranda, kartu dashboard, atau memanggil fitur ini dalam analisis atau kode apa pun sampai ada instruksi eksplisit dari pengguna.
- **Referral (`/referral`)**: **BELUM ADA / BELUM SIAP**. WAJIB di-hide dari seluruh UI. Dilarang keras mengusulkan, menampilkan di navigasi, badge reward, grid beranda, atau memanggil fitur ini sampai ada instruksi eksplisit dari pengguna.
- **Panduan & Simulator Interview (`/interview`)**: **TELAH DIHAPUS & DILARANG (STRICT BLACKLIST)**. Halaman `/interview`, tombol "Panduan & Simulator Interview", serta fitur simulator interview kerja dilarang keras dibuat ulang, dipanggil, atau dimunculkan di antarmuka (UI, Bento Grid, kartu jadwal, drawer, navigasi, atau modal). Semua aksi/agenda jadwal interview diarahkan langsung ke `/tracker`.
- **Mobile Bottom Navigation (Hanya 4 Tab)**: Navigasi bawah mobile **HANYA 4 TAB**: `Beranda` (`/beranda`), `CV` (`/cv`), `Tracker` (`/tracker`), dan `Profil` (`/profil`). JANGAN pernah menambahkan tab Misi di bottom nav.
- **Anti-Duplikasi Quick Actions**: Ikon pada grid pintasan Beranda mobile dilarang menduplikasi tab utama Bottom Nav (`/cv` dan `/tracker`). Grid Beranda khusus untuk tool pendukung unik (Cek ATS, Career Intel, LinkedIn, Draf Email, Loker, Kesiapan, Lapor Kendala, Saran Fitur).

---

## Referensi Dokumen & Skill Terkait
1. **[Global Rules](file:///d:/cuti/business-rules.md)**: Aturan bisnis, identitas produk Employr, tech stack, dan design system.
2. **[PRD](file:///d:/cuti/prd.md)**: Product architecture, DB schema, tRPC routers.
3. **[Design System](file:///d:/cuti/design.md)** & **[Dashboard Art Direction](file:///d:/cuti/GEMINI.md)**.
4. **[Motion Design](file:///d:/cuti/.agents/skills/motion-design/SKILL.md)** & **[Bang Motion](file:///d:/cuti/.agents/skills/bang-motion/SKILL.md)**: Digunakan khusus saat mengerjakan animasi/motion graphics.
5. **[LLM Council](file:///d:/cuti/.agents/skills/llm-council/SKILL.md)**: Digunakan saat mengevaluasi keputusan penting, trade-off arsitektur, strategi fitur, atau stress-testing ide.
6. **[Appllama Mobile Design](file:///d:/cuti/.agents/skills/appllama-app-design-skill/SKILL.md)**: Standar desain mobile native (Expo / React Native, Apple HIG, semantik navigasi, dan Reanimated).
7. **[Frontend Design Review](file:///d:/cuti/.agents/skills/frontend-design-review/SKILL.md)**: Review dan panduan pembuatan antarmuka frontend berkualitas tinggi, kepatuhan design system, audit aksesibilitas, dan anti-slop.

