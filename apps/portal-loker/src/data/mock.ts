/**
 * Mock data — SEO + GEO friendly slugs
 * Pola slug: {judul-slug}-{perusahaan/lokasi/kategori}-{kota} untuk GEO signal
 * Contoh: frontend-engineer-react-pt-teknologi-nusantara-jakarta-selatan
 */

export type Lowongan = {
  slug: string;
  title: string;
  company: string;
  location: string;
  geo: string; // kota / provinsi
  type: string;
  salary: string;
  badge?: string;
  postedAt: string;
  skills: string[];
  description: string;
  qualifications: string[];
  benefits: string[];
  companyAbout: string;
};

export const lowonganList: Lowongan[] = [
  {
    slug: "frontend-engineer-react-pt-teknologi-nusantara-jakarta-selatan",
    title: "Frontend Engineer (React)",
    company: "PT Teknologi Nusantara",
    location: "Jakarta Selatan, DKI Jakarta",
    geo: "Jakarta Selatan",
    type: "Full-time",
    salary: "Rp 12–18 jt/bln",
    badge: "Baru",
    postedAt: "2 hari lalu",
    skills: ["React", "TypeScript", "Next.js", "Tailwind"],
    description: "Bangun antarmuka produk B2B dengan performa tinggi untuk 1,2jt pengguna aktif. Kolaborasi lintas tim product, design, dan backend untuk shipped fitur mingguan.",
    qualifications: [
      "1–3 tahun pengalaman React / Next.js",
      "Paham state management (Zustand/Redux) & REST API",
      "Portofolio GitHub / komponen reusable",
      "Terbiasa code review dan testing (Jest/Playwright)",
    ],
    benefits: ["BPJS + asuransi swasta", "Hybrid 3 hari WFO", "Tunjangan belajar Rp 1jt/bln", "THR & bonus tahunan"],
    companyAbout: "PT Teknologi Nusantara adalah startup SaaS logistik dengan 180+ karyawan, kantor di SCBD, dan budaya engineering yang kuat.",
  },
  {
    slug: "digital-marketing-specialist-sinar-media-group-bandung",
    title: "Digital Marketing Specialist",
    company: "Sinar Media Group",
    location: "Bandung, Jawa Barat",
    geo: "Bandung",
    type: "Full-time",
    salary: "Rp 7–9 jt/bln",
    postedAt: "5 hari lalu",
    skills: ["SEO", "Google Ads", "Meta Ads", "Analytics"],
    description: "Kelola kampanye performance untuk 15+ klien UMKM dan ritel. Optimasi ROAS dan reporting mingguan.",
    qualifications: ["Pengalaman 2th di agency / in-house", "Sertifikasi Google Ads diutamakan", "Bisa copywriting & briefing kreatif"],
    benefits: ["Kerja hybrid", "Budget sertifikasi", "Jenjang ke Lead"],
    companyAbout: "Agency digital di Bandung dengan 40+ klien nasional.",
  },
  {
    slug: "ui-ux-designer-kreasi-digital-studio-remote-indonesia",
    title: "UI/UX Designer",
    company: "Kreasi Digital Studio",
    location: "Remote — Indonesia",
    geo: "Remote",
    type: "Kontrak",
    salary: "Rp 10–14 jt/bln",
    badge: "Remote",
    postedAt: "1 minggu lalu",
    skills: ["Figma", "Design System", "Prototyping"],
    description: "Desain sistem untuk aplikasi fintech. Riset, wireframe, hingga handoff developer.",
    qualifications: ["Portofolio Figma minimal 3 studi kasus", "Paham aksesibilitas WCAG", "Bisa motion dasar (Framer/Principle)"],
    benefits: ["Remote penuh", "Alat kerja disediakan", "Kontrak 6 bulan diperpanjang"],
    companyAbout: "Studio desain untuk klien startup & enterprise.",
  },
  {
    slug: "data-analyst-pt-ritel-sejahtera-jakarta-barat",
    title: "Data Analyst",
    company: "PT Ritel Sejahtera",
    location: "Jakarta Barat, DKI Jakarta",
    geo: "Jakarta Barat",
    type: "Full-time",
    salary: "Rp 9–13 jt/bln",
    postedAt: "3 hari lalu",
    skills: ["SQL", "Looker Studio", "Excel", "Python"],
    description: "Analisis performa 120+ gerai ritel. Dashboard omzet, stok, dan churn pelanggan.",
    qualifications: ["SQL intermediate, Excel advance", "Pengalaman dashboarding", "Bisa storytelling data"],
    benefits: ["Kantor di Puri Indah", "Tunjangan transport", "Pelatihan data bulanan"],
    companyAbout: "Ritel modern dengan jaringan nasional.",
  },
];

export type Artikel = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  content: string[]; // paragraf
};

export const artikelList: Artikel[] = [
  {
    slug: "7-kesalahan-cv-fresh-graduate-ditolak-hrd-tips-lolos-ats-2026",
    title: "7 Kesalahan CV yang Membuat Pelamar Fresh Graduate Ditolak",
    category: "Tips CV",
    date: "18 Agu 2026",
    readTime: "8 menit baca",
    excerpt: "HRD hanya butuh 6 detik untuk scan CV. Hindari 7 kesalahan fatal ini agar CV-mu lolos ke interview.",
    tags: ["CV", "Fresh Graduate", "ATS"],
    content: [
      "Banyak pelamar fresh graduate menulis CV terlalu panjang, penuh jargon, dan tanpa angka. Padahal ATS dan HRD mencari kejelasan: peran, hasil, dan relevansi.",
      "Kesalahan #1: Foto tidak profesional. Kesalahan #2: Email alay. Kesalahan #3: Daftar tanggung jawab tanpa metrik. Ubah 'Mengelola media sosial' menjadi 'Meningkatkan engagement Instagram 42% dalam 3 bulan'.",
      "Gunakan format ATS-friendly: header jelas, font standar, tanpa tabel/gambar, dan simpan sebagai PDF. Satu halaman cukup untuk 0–2 tahun pengalaman.",
      "Akhiri dengan cek ejaan dan minta feedback mentor. CV yang rapi = sinyal profesional.",
    ],
  },
  {
    slug: "format-cv-ats-friendly-lolos-sistem-penyaring-otomatis-2026",
    title: "ATS-Friendly: Format CV yang Lolos Sistem Penyaring Otomatis",
    category: "Tips CV",
    date: "5 Agu 2026",
    readTime: "6 menit baca",
    excerpt: "Kenali cara kerja ATS dan struktur CV yang bisa dibaca mesin tanpa kehilangan sentuhan human.",
    tags: ["ATS", "CV", "Karier"],
    content: ["ATS memindai keyword dari deskripsi lowongan. Selaraskan skill-mu dengan kata kunci di job post.", "Struktur ideal: Kontak — Ringkasan — Pengalaman — Pendidikan — Skill."],
  },
  {
    slug: "cara-menjawab-ceritakan-tentang-diri-anda-interview-hrd",
    title: 'Cara Menjawab "Ceritakan Tentang Diri Anda"',
    category: "Wawancara",
    date: "21 Jul 2026",
    readTime: "5 menit baca",
    excerpt: "Jawaban 90 detik yang menjual: present — past — future. Contoh skrip siap pakai.",
    tags: ["Interview", "Wawancara"],
    content: ["Buka dengan peran sekarang, sorot 1–2 pencapaian, tutup dengan alasan melamar di perusahaan ini."],
  },
  {
    slug: "panduan-negosiasi-gaji-1-3-tahun-pengalaman-indonesia-2026",
    title: "Panduan Negosiasi Gaji 1–3 Tahun Pengalaman",
    category: "Gaji",
    date: "14 Jul 2026",
    readTime: "7 menit baca",
    excerpt: "Riset UMR, siapkan range, dan negosiasi tanpa takut. Template kalimat sopan included.",
    tags: ["Gaji", "Negosiasi"],
    content: ["Jangan sebut angka pertama. Tanyakan range perusahaan, lalu jawab dengan range berbasis data."],
  },
];

export type Kursus = {
  slug: string;
  title: string;
  provider: string;
  price: string;
  originalPrice?: string;
  rating: string;
  level: string;
  duration: string;
  language: string;
  students: string;
  geoTag: string;
  benefits: string[];
  modules: { title: string; lessons: string; duration: string }[];
};

export const kursusList: Kursus[] = [
  {
    slug: "digital-marketing-fundamental-digital-academy-indonesia-online",
    title: "Digital Marketing Fundamental",
    provider: "Digital Academy Indonesia",
    price: "Rp 450.000",
    originalPrice: "Rp 650.000",
    rating: "4,6",
    level: "Pemula",
    duration: "8 jam · 24 modul",
    language: "Indonesia",
    students: "12.400+ peserta",
    geoTag: "Online · Nasional",
    benefits: ["Sertifikat penyelesaian", "Akses seumur hidup", "Studi kasus UMKM lokal"],
    modules: [
      { title: "Dasar Funnel & Persona", lessons: "4 pelajaran", duration: "60 menit" },
      { title: "SEO & Content", lessons: "6 pelajaran", duration: "120 menit" },
      { title: "Meta & Google Ads", lessons: "8 pelajaran", duration: "180 menit" },
      { title: "Analytics & Optimasi", lessons: "6 pelajaran", duration: "90 menit" },
    ],
  },
  {
    slug: "seo-lanjutan-website-bisnis-digital-academy-indonesia",
    title: "SEO Lanjutan untuk Website Bisnis",
    provider: "Digital Academy Indonesia",
    price: "Rp 550.000",
    rating: "4,7",
    level: "Menengah",
    duration: "10 jam",
    language: "Indonesia",
    students: "8.200+ peserta",
    geoTag: "Online",
    benefits: ["Template audit SEO", "Checklist on-page"],
    modules: [{ title: "Technical SEO", lessons: "5 pelajaran", duration: "120 menit" }],
  },
  {
    slug: "social-media-specialist-class-kreatifhub-jakarta",
    title: "Social Media Specialist Class",
    provider: "KreatifHub",
    price: "Rp 400.000",
    rating: "4,5",
    level: "Pemula",
    duration: "6 jam",
    language: "Indonesia",
    students: "9.800+ peserta",
    geoTag: "Jakarta · Hybrid",
    benefits: ["Portfolio review", "Grup alumni"],
    modules: [{ title: "Content Pillars", lessons: "4 pelajaran", duration: "90 menit" }],
  },
];

export type Sertifikat = {
  slug: string;
  title: string;
  issuer: string;
  price: string;
  validity: string;
  type: string;
  level: string;
  geo: string;
  benefits: string[];
  requirements: string[];
  schedule: string;
};

export const sertifikatList: Sertifikat[] = [
  {
    slug: "sertifikasi-digital-marketing-bnsp-lsp-nasional-indonesia",
    title: "Sertifikasi Digital Marketing — BNSP",
    issuer: "BNSP via LSP",
    price: "Rp 1,5–3 jt",
    validity: "Berlaku 3 tahun",
    type: "Diakui nasional",
    level: "Skema Okupasi",
    geo: "Nasional — 22 TUK",
    benefits: ["Diakui BNSP", "Nilai jual untuk tender & rekrutmen", "Materi sesuai SKKNI"],
    requirements: ["KTP", "CV", "Portofolio kampanye / sertifikat pelatihan"],
    schedule: "Ujian terjadwal tiap bulan — daftar H-7",
  },
  {
    slug: "google-ads-certification-google-skillshop-gratis-online",
    title: "Google Ads Certification",
    issuer: "Google Skillshop",
    price: "Gratis",
    validity: "Berlaku 1 tahun",
    type: "Online",
    level: "Associate",
    geo: "Online · Global",
    benefits: ["Gratis", "Self-paced", "Badge Google"],
    requirements: ["Akun Google", "Lulus assessment 75%"],
    schedule: "On-demand — ujian online 75 menit",
  },
  {
    slug: "sertifikasi-kompetensi-programmer-bnsp-jakarta-surabaya",
    title: "Sertifikasi Kompetensi Programmer — BNSP",
    issuer: "BNSP",
    price: "Rp 1–2 jt",
    validity: "Berlaku 3 tahun",
    type: "Tulis + praktik",
    level: "Junior Programmer",
    geo: "Jakarta · Surabaya · Bandung",
    benefits: ["Diakui nasional", "Asesmen portofolio"],
    requirements: ["Ijazah SMK/D3/S1", "Portofolio coding"],
    schedule: "Tiap kuartal",
  },
  {
    slug: "toefl-itp-syarat-kerja-pusat-bahasa-jakarta-bandung",
    title: "TOEFL ITP untuk Syarat Kerja",
    issuer: "Pusat Bahasa Berlisensi",
    price: "Rp 500–650 rb",
    validity: "2 tahun",
    type: "Skor resmi",
    level: "A2–C1",
    geo: "Jakarta · Bandung · Surabaya",
    benefits: ["Sertifikat resmi ETS", "Diterima BUMN/Swasta"],
    requirements: ["KTP", "Pas foto"],
    schedule: "Tiap bulan — daftar online",
  },
];

export type JobFair = {
  slug: string;
  title: string;
  location: string;
  geo: string;
  date: string; // 12 Sep 2026
  day: string;
  month: string;
  time: string;
  price: string;
  badge?: string;
  companies: string;
  highlights: string[];
  agenda: { time: string; title: string; desc: string }[];
  exhibitors: string[];
};

export const jobFairList: JobFair[] = [
  {
    slug: "jakarta-career-expo-2026-jcc-hall-a-jakarta-pusat",
    title: "Jakarta Career Expo 2026",
    location: "Jakarta Convention Center — Hall A, Jakarta Pusat",
    geo: "Jakarta Pusat, DKI Jakarta",
    date: "12 Sep 2026",
    day: "12",
    month: "Sep",
    time: "09.00–17.00 WIB",
    price: "Gratis",
    badge: "Terdekat",
    companies: "80+ perusahaan",
    highlights: ["Walk-in interview", "CV review gratis", "Talkshow karier"],
    agenda: [
      { time: "09:00", title: "Registrasi & Open Gate", desc: "Check-in QR, cetak kartu peserta" },
      { time: "10:00", title: "Talkshow: CV ATS-Friendly", desc: "Speaker: HR Lead Gojek" },
      { time: "13:00", title: "Walk-in Interview", desc: "Bawa 3 CV cetak + portofolio" },
      { time: "15:30", title: "Networking Session", desc: "Kenalan dengan rekruter" },
    ],
    exhibitors: ["PT Teknologi Nusantara", "Sinar Media Group", "Bank BUMN", "Kreasi Digital Studio"],
  },
  {
    slug: "bandung-job-fair-kampus-itb-sasana-budaya-ganesha-bandung",
    title: "Bandung Job Fair — Kampus ITB",
    location: "Sasana Budaya Ganesha, Bandung",
    geo: "Bandung, Jawa Barat",
    date: "25 Sep 2026",
    day: "25",
    month: "Sep",
    time: "08.30–16.00 WIB",
    price: "Gratis",
    companies: "40+ perusahaan",
    highlights: ["Semua jurusan", "Magang & full-time"],
    agenda: [{ time: "09:00", title: "Pembukaan", desc: "Sambutan rektor" }],
    exhibitors: ["Telkom", "Kreasi Digital", "Startup Bandung"],
  },
  {
    slug: "virtual-job-fair-nasional-online-3-hari-oktober-2026",
    title: "Virtual Job Fair — Nasional",
    location: "Online — Zoom & PortalKerja",
    geo: "Online — Nasional",
    date: "03 Okt 2026",
    day: "03",
    month: "Okt",
    time: "10.00–15.00 WIB",
    price: "Gratis",
    companies: "120+ perusahaan",
    highlights: ["Live chat rekruter", "Webinar karier"],
    agenda: [{ time: "10:00", title: "Keynote Virtual Hiring", desc: "Tren rekrutmen remote" }],
    exhibitors: ["Perusahaan Remote", "BUMN"],
  },
];
