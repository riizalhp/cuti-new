/**
 * Mock data untuk PortalKerja / AmbilCUTI Career Information Portal
 * Menyediakan data terstruktur untuk Lowongan, Artikel, Sertifikasi, Course, Event, dan Trending Topics
 * Full backward-compatibility untuk semua existing dynamic routes
 */

export interface LowonganItem {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  geo: string; // kota / provinsi
  type: string; // Full Time, Part Time, Magang, Kontrak, Remote
  experience: string; // Fresh Graduate, Entry Level, Mid Level, Senior
  category: string; // Perbankan, IT, Marketing, Design, Finance, HR
  salary: string;
  postedAt: string;
  deadline?: string;
  badge?: string; // Baru, Hot, Urgent, Rekomendasi
  image: string;
  source: string; // Website Resmi Perusahaan, LinkedIn Jobs, Karir.com, Kemnaker
  sourceUrl: string;
  description: string;
  qualifications: string[];
  skills: string[];
  benefits: string[];
  companyAbout: string;
}
export type Lowongan = LowonganItem;

export interface ArtikelItem {
  id: string;
  slug: string;
  title: string;
  category: string; // Tips Karier, CV & Interview, Dunia Kerja, Industri, Pengembangan Diri, Remote Work, Lifestyle
  author: string;
  authorRole: string;
  authorAvatar?: string;
  date: string;
  readTime: string;
  views?: string;
  rank?: number;
  featured?: boolean;
  image: string;
  excerpt: string;
  content: string[];
  tags: string[];
}
export type Artikel = ArtikelItem;

export interface SertifikasiItem {
  id: string;
  slug: string;
  title: string;
  provider: string;
  issuer: string;
  logo?: string;
  level: string; // Beginner, Intermediate, Advanced
  category: string; // Data, IT, Cloud, Bisnis, Marketing, Desain
  duration: string;
  format: string; // Online, Hybrid, Offline
  type: string;
  price: string;
  rating: string;
  students: string;
  validity: string;
  geo: string;
  image: string;
  officialUrl: string;
  description: string;
  skills: string[];
  benefits: string[];
  requirements: string[];
  schedule: string;
}
export type Sertifikat = SertifikasiItem;

export interface CourseItem {
  id: string;
  slug: string;
  title: string;
  provider: string;
  level: string;
  category: string;
  duration: string;
  price: string;
  originalPrice?: string;
  rating: string;
  students: string;
  language: string;
  geoTag: string;
  image: string;
  officialUrl: string;
  description: string;
  certificate: boolean;
  benefits: string[];
  modules: { title: string; lessons: string; duration: string }[];
}
export type Kursus = CourseItem;

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  type: string; // Job Fair, Webinar, Workshop, Conference, Seminar
  dateDay: string;
  dateMonth: string;
  dateYear: string;
  day: string;
  month: string;
  time: string;
  fullDate: string;
  date: string;
  location: string;
  geo: string;
  format: string; // Offline, Online, Hybrid
  attendeesCount?: string;
  companiesCount?: string;
  companies?: string;
  price: string;
  badge?: string;
  image: string;
  officialUrl: string;
  description: string;
  highlights: string[];
  agenda?: { time: string; title?: string; desc?: string; activity?: string }[];
  exhibitors?: string[];
}
export type JobFair = EventItem;

export interface TrendingTopic {
  rank: number;
  name: string;
  reads: string;
  slug: string;
}

// --------------------------------------------------------------------------
// DATA MOCK IMPLEMENTATION
// --------------------------------------------------------------------------

export const lowonganList: LowonganItem[] = [
  {
    id: "job-1",
    slug: "rekrutmen-fresh-graduate-pt-bank-mandiri-jakarta",
    title: "PT Bank Mandiri Buka Rekrutmen Fresh Graduate 2025",
    company: "PT Bank Mandiri (Persero) Tbk",
    location: "Jakarta Pusat, DKI Jakarta",
    geo: "Jakarta",
    type: "Full Time",
    experience: "Fresh Graduate",
    category: "Perbankan",
    salary: "Rp 8.000.000 - Rp 12.000.000",
    postedAt: "Dibuka 2 hari lalu",
    deadline: "30 Okt 2025",
    badge: "Baru",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    source: "Portal Resmi Bank Mandiri Career",
    sourceUrl: "https://bankmandiri.co.id/career",
    description: "Program Officer Development Program (ODP) dan Staf Khusus untuk lulusan baru universitas terkemuka. Dapatkan kesempatan rotasi kerja komprehensif, pelatihan kepemimpinan, dan jenjang karier akseleratif di salah satu bank terbesar di Indonesia.",
    qualifications: [
      "Pendidikan minimal S1 dari universitas terakreditasi A/B",
      "IPK minimal 3.00 dari skala 4.00",
      "Fresh graduate atau pengalaman kerja maksimal 2 tahun",
      "Usia maksimal 24 tahun (S1) atau 26 tahun (S2)",
      "Kemampuan komunikasi dan analisis logika yang kuat",
      "Bersedia ditempatkan di seluruh unit kerja Bank Mandiri",
    ],
    skills: ["Banking", "Financial Analysis", "Customer Relations", "Communication", "Leadership"],
    benefits: ["BPJS Ketenagakerjaan & Kesehatan", "Asuransi Rawat Inap Swasta", "Bonus Kinerja Tahunan", "Pelatihan Kepemimpinan Berjenjang"],
    companyAbout: "PT Bank Mandiri (Persero) Tbk adalah salah satu bank BUMN terbesar di Indonesia yang menyediakan solusi keuangan menyeluruh bagi nasabah korporasi, komersial, dan ritel.",
  },
  {
    id: "job-2",
    slug: "ui-ux-designer-kreasi-digital-studio-remote-indonesia",
    title: "UI/UX Designer Produk Digital",
    company: "Kreasi Digital Studio",
    location: "Remote (Seluruh Indonesia)",
    geo: "Remote",
    type: "Kontrak",
    experience: "Entry Level",
    category: "Design",
    salary: "Rp 10.000.000 - Rp 14.000.000",
    postedAt: "Dibuka 3 hari lalu",
    deadline: "15 Nov 2025",
    badge: "Remote",
    image: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80",
    source: "LinkedIn Official Page",
    sourceUrl: "https://linkedin.com",
    description: "Merancang antarmuka aplikasi seluler dan web dengan fokus pada kemudahan penggunaan, design system modern, dan aksesibilitas.",
    qualifications: [
      "Portofolio Figma minimal 2 studi kasus produk digital",
      "Memahami prinsip User-Centered Design, Wireframing, dan Interactive Prototyping",
      "Familiar dengan auto-layout, components, dan tokens",
      "Mampu bekerja secara mandiri dan kolaboratif via async tools (Slack, Notion)",
    ],
    skills: ["Figma", "UI Design", "Design System", "User Research", "Wireframing"],
    benefits: ["Kerja remote 100%", "Tunjangan perangkat kerja & internet", "Jadwal kerja fleksibel", "Alokasi budget kursus desain"],
    companyAbout: "Startup studio teknologi yang berfokus membangun produk SaaS dan aplikasi fintech bagi generasi muda Indonesia.",
  },
  {
    id: "job-3",
    slug: "frontend-engineer-react-pt-teknologi-nusantara-jakarta-selatan",
    title: "Frontend Engineer (React / Next.js)",
    company: "PT Teknologi Nusantara",
    location: "Jakarta Selatan, DKI Jakarta",
    geo: "Jakarta Selatan",
    type: "Full Time",
    experience: "Fresh Graduate",
    category: "IT",
    salary: "Rp 12.000.000 - Rp 18.000.000",
    postedAt: "Dibuka 1 hari lalu",
    badge: "Baru",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    source: "Karirhub Kemnaker",
    sourceUrl: "https://karirhub.kemnaker.go.id",
    description: "Bangun antarmuka produk B2B dengan performa tinggi untuk 1,2jt pengguna aktif. Kolaborasi lintas tim product, design, dan backend untuk shipped fitur mingguan.",
    qualifications: [
      "Menguasai dasar HTML, CSS, JavaScript modern (ES6+), dan TypeScript",
      "Pernah membuat project dengan React atau Next.js",
      "Paham integrasi RESTful API dan state management",
    ],
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Git"],
    benefits: ["BPJS + asuransi swasta", "Hybrid 3 hari WFO", "Tunjangan belajar Rp 1jt/bln", "THR & bonus tahunan"],
    companyAbout: "PT Teknologi Nusantara adalah startup SaaS logistik dengan 180+ karyawan, kantor di SCBD, dan budaya engineering yang kuat.",
  },
  {
    id: "job-4",
    slug: "digital-marketing-specialist-sinar-media-group-bandung",
    title: "Digital Marketing Specialist",
    company: "Sinar Media Group",
    location: "Bandung, Jawa Barat",
    geo: "Bandung",
    type: "Full Time",
    experience: "Entry Level",
    category: "Marketing",
    salary: "Rp 7.000.000 - Rp 9.000.000",
    postedAt: "Dibuka 4 hari lalu",
    badge: "Baru",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    source: "Jobstreet Indonesia",
    sourceUrl: "https://jobstreet.co.id",
    description: "Kelola kampanye performance untuk klien UMKM dan ritel. Optimasi ROAS dan reporting mingguan.",
    qualifications: [
      "Pengalaman 1-2 tahun di agency / in-house",
      "Sertifikasi Google Ads atau Meta Blueprint diutamakan",
      "Kemampuan copywriting dan briefing kreatif yang tajam",
    ],
    skills: ["SEO", "Google Ads", "Meta Ads", "Analytics"],
    benefits: ["Kerja hybrid 2 hari WFH", "Budget sertifikasi tahunan", "Jenjang karier cepat ke Campaign Lead"],
    companyAbout: "Agency digital di Bandung dengan 40+ klien nasional di bidang ritel dan edukasi.",
  },
  {
    id: "job-5",
    slug: "data-analyst-pt-ritel-sejahtera-jakarta-barat",
    title: "Data Analyst & Business Intelligence",
    company: "PT Ritel Sejahtera",
    location: "Jakarta Barat, DKI Jakarta",
    geo: "Jakarta Barat",
    type: "Full Time",
    experience: "Entry Level",
    category: "Data",
    salary: "Rp 9.000.000 - Rp 13.000.000",
    postedAt: "Dibuka 3 hari lalu",
    badge: "Hot",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    source: "Portal Resmi Ritel Sejahtera",
    sourceUrl: "https://ambilcuti.id",
    description: "Analisis performa 120+ gerai ritel. Bangun dashboard omzet harian, perputaran stok, dan retensi pelanggan.",
    qualifications: ["SQL intermediate, Excel advance", "Pengalaman dashboarding Tableau atau Power BI", "Kemampuan storytelling data yang baik"],
    skills: ["SQL", "Looker Studio", "Excel", "Python"],
    benefits: ["Kantor di Puri Indah", "Tunjangan transport", "Pelatihan data bulanan"],
    companyAbout: "Ritel modern dengan jaringan nasional di seluruh Indonesia.",
  },
];

export const artikelList: ArtikelItem[] = [
  {
    id: "art-1",
    slug: "10-cara-membangun-karier-yang-kamu-sukai-bukan-sekadar-gaji",
    title: "10 Cara Membangun Karier yang Kamu Sukai, Bukan Sekadar Gaji",
    category: "Pengembangan Diri",
    author: "Rizka Amanda",
    authorRole: "Career Coach & HR Consultant",
    date: "12 Okt 2025",
    readTime: "6 menit baca",
    views: "18.2K",
    featured: true,
    rank: 1,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    excerpt: "Karier yang bermakna dimulai dari mengenal diri sendiri. Berikut langkah praktis untuk menemukan arah karier yang sesuai dengan minat, nilai, dan tujuan hidupmu.",
    tags: ["Karier", "Pengembangan Diri", "Career Path", "Motivasi"],
    content: [
      "Banyak pencari kerja pemula terjebak pada persepsi bahwa gaji adalah satu-satunya tolok ukur kesuksesan.",
      "Pertama, lakukan audit minat dan keahlian nyata tanpa menghakimi diri sendiri. Tuliskan apa saja aktivitas yang membuat energimu terisi.",
      "Kedua, pelajari ekosistem industri yang relevan. Dunia kerja berkembang pesat dan banyak profesi baru yang belum ada 5 tahun lalu.",
      "Ketiga, bangun reputasi lewat portofolio nyata dan relasi profesional yang saling mendukung.",
    ],
  },
  {
    id: "art-2",
    slug: "10-skill-yang-paling-dicari-perusahaan-di-tahun-2026",
    title: "10 Skill yang Paling Dicari Perusahaan di Tahun 2026",
    category: "Industri & Teknologi",
    author: "Tim Riset Karier",
    authorRole: "Editorial Team",
    date: "12 Okt 2025",
    readTime: "5 menit baca",
    views: "24.5K",
    featured: true,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    excerpt: "Mulai dari literasi kecerdasan buatan, data analytics, hingga adaptive problem solving: inilah kompetensi wajib generasi muda.",
    tags: ["Skill", "Tren Kerja", "Teknologi", "Masa Depan"],
    content: [
      "Perkembangan otomatisasi dan digitalisasi menuntut kemampuan adaptasi yang lebih tinggi.",
      "Skill teknis seperti analisis data dan pemrograman tetap krusial, namun kemampuan berpikir kritis dan empati kepemimpinan menjadi pembeda utama.",
    ],
  },
  {
    id: "art-3",
    slug: "7-kesalahan-cv-fresh-graduate-ditolak-hrd-tips-lolos-ats-2026",
    title: "7 Kesalahan CV yang Membuat Pelamar Fresh Graduate Ditolak",
    category: "CV & Interview",
    author: "Dian Prasetyo",
    authorRole: "Talent Acquisition Specialist",
    date: "8 Okt 2025",
    readTime: "5 menit baca",
    views: "10.1K",
    rank: 2,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    excerpt: "HRD rata-rata hanya meluangkan 6 detik untuk screening awal CV. Hindari kesalahan format, typo fatal, dan deskripsi tugas tanpa dampak.",
    tags: ["CV", "Resume", "HRD", "Seleksi Kerja"],
    content: [
      "Banyak pelamar fresh graduate menulis CV terlalu panjang, penuh jargon, dan tanpa angka nyata.",
      "Gunakan format ATS-friendly: struktur satu kolom bersih, tanpa gambar tabel kompleks, dan lengkapi aksi nyata dengan metrik persentase.",
    ],
  },
  {
    id: "art-4",
    slug: "tips-sukses-bekerja-remote-disiplin-tools-dan-manajemen-waktu",
    title: "Tips Sukses Bekerja Remote: Disiplin, Tools, dan Manajemen Waktu",
    category: "Remote Work",
    author: "Budi Santoso",
    authorRole: "Senior Remote Engineer",
    date: "6 Okt 2025",
    readTime: "7 menit baca",
    views: "8.9K",
    rank: 3,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    excerpt: "Kerja dari mana saja butuh kematangan komunikasi tertulis, batasan jam kerja yang sehat, dan penguasaan perangkat kerja kolaboratif.",
    tags: ["Remote Work", "Work Life Balance", "Produktivitas"],
    content: ["Komunikasi asinkron adalah kunci. Tulis update kerja dengan jelas dan prioritaskan dokumentasi."],
  },
  {
    id: "art-5",
    slug: "10-industri-dengan-prospek-karier-tertinggi-di-indonesia-2026",
    title: "10 Industri dengan Prospek Karier Tertinggi di Indonesia 2026",
    category: "Dunia Kerja",
    author: "Farhan Malik",
    authorRole: "Economic & Career Analyst",
    date: "5 Okt 2025",
    readTime: "6 menit baca",
    views: "15.7K",
    rank: 4,
    image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=800&q=80",
    excerpt: "Sektor energi baru terbarukan, logistik pintar, teknologi kesehatan, dan fintech diprediksi mencetak rekrutmen terbesar dalam 2 tahun ke depan.",
    tags: ["Industri", "Prospek Karier", "Gaji", "Ekonomi"],
    content: ["Kebutuhan tenaga ahli di sektor keberlanjutan dan transformasi digital tumbuh di atas 20% per tahun."],
  },
  {
    id: "art-6",
    slug: "cara-menjawab-ceritakan-tentang-diri-anda-interview-hrd",
    title: 'Cara Menjawab "Ceritakan Tentang Diri Anda" dengan Meyakinkan',
    category: "CV & Interview",
    author: "Sarah Putri",
    authorRole: "HR Manager",
    date: "3 Okt 2025",
    readTime: "5 menit baca",
    views: "12.3K",
    rank: 5,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    excerpt: "Gunakan formula Present-Past-Future untuk merangkum identitas profesionalmu dalam waktu 90 detik tanpa terdengar menghafal.",
    tags: ["Interview", "Wawancara", "Pertanyaan HRD"],
    content: ["Buka dengan peran saat ini, ceritakan 1 atau 2 pencapaian terbaikmu di masa lalu, dan kaitkan dengan kontribusimu di masa depan."],
  },
  {
    id: "art-7",
    slug: "format-cv-ats-friendly-lolos-sistem-penyaring-otomatis-2026",
    title: "ATS-Friendly: Format CV yang Lolos Sistem Penyaring Otomatis",
    category: "CV & Interview",
    author: "Dian Prasetyo",
    authorRole: "Talent Acquisition",
    date: "10 Okt 2025",
    readTime: "5 menit baca",
    views: "9.4K",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    excerpt: "Panduan praktis menyusun layout sederhana, tata letak teks bersih, dan kata kunci relevan agar CV terbaca sempurna oleh mesin penyaring ATS.",
    tags: ["ATS", "CV", "HR"],
    content: ["Gunakan heading standar: Kontak, Ringkasan, Pengalaman, Pendidikan, Keahlian."],
  },
  {
    id: "art-8",
    slug: "panduan-negosiasi-gaji-1-3-tahun-pengalaman-indonesia-2026",
    title: "Panduan Negosiasi Gaji 1–3 Tahun Pengalaman",
    category: "Dunia Kerja",
    author: "Rizka Amanda",
    authorRole: "Coach",
    date: "5 Okt 2025",
    readTime: "6 menit baca",
    views: "7.1K",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    excerpt: "Riset UMR, siapkan rentang realistis, dan bernegosiasi dengan sopan berbasis data pencapaian.",
    tags: ["Gaji", "Negosiasi", "Karier"],
    content: ["Tanyakan rentang kompensasi yang dialokasikan perusahaan, lalu beri jawaban dengan dasar nilai kontribusimu."],
  },
];

export const sertifikasiList: SertifikasiItem[] = [
  {
    id: "cert-1",
    slug: "google-data-analytics-professional-certificate",
    title: "Google Data Analytics Professional Certificate",
    provider: "Google Career Certificates",
    issuer: "Google via Coursera",
    level: "Beginner",
    category: "Data",
    duration: "6 Bulan (10 jam/minggu)",
    format: "Online",
    type: "Sertifikasi Global",
    price: "Tersedia Bantuan Finansial",
    rating: "4.8",
    students: "1.200.000+ Lulusan",
    validity: "Berlaku Seumur Hidup",
    geo: "Online · Global",
    image: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://grow.google/certificates/data-analytics/",
    description: "Program pelatihan resmi dari Google untuk mempersiapkan karier sebagai Junior Data Analyst. Mempelajari pembersihan data, visualisasi, analisis SQL, dan pemrograman R.",
    skills: ["Spreadsheets", "SQL", "Tableau", "R Programming", "Data Cleaning"],
    benefits: ["Sertifikat resmi bertaraf global dari Google", "Akses ke Google Career Consortium (perusahaan mitra)", "Proyek portofolio berbasis industri"],
    requirements: ["Koneksi internet stabil", "Komputer atau laptop untuk analisis data", "Komitmen belajar minimal 5 jam per minggu"],
    schedule: "Dapat dimulai kapan saja (Self-paced online)",
  },
  {
    id: "cert-2",
    slug: "sertifikasi-digital-marketing-bnsp-lsp-nasional-indonesia",
    title: "Sertifikasi Digital Marketing — BNSP",
    provider: "Badan Nasional Sertifikasi Profesi (BNSP)",
    issuer: "BNSP via LSP",
    level: "Intermediate",
    category: "Marketing",
    duration: "Ujian Terjadwal Tiap Bulan",
    format: "Online & TUK",
    type: "Diakui nasional",
    price: "Rp 1.500.000",
    rating: "4.7",
    students: "25.000+ Pemegang Sertifikat",
    validity: "Berlaku 3 tahun",
    geo: "Nasional — 22 TUK",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://bnsp.go.id",
    description: "Sertifikasi profesi resmi berstandar SKKNI yang diakui secara legal oleh instansi pemerintah dan BUMN di seluruh Indonesia.",
    skills: ["SEO", "Content Marketing", "Performance Marketing", "Social Media Analytics", "SKKNI"],
    benefits: ["Diakui secara legal oleh BNSP & BUMN", "Nilai jual tinggi untuk seleksi CPNS, BUMN, dan tender", "Materi uji kompetensi sesuai standar SKKNI"],
    requirements: ["KTP WNI", "CV terbaru", "Portofolio kampanye digital atau sertifikat pelatihan terkait"],
    schedule: "Ujian terjadwal tiap bulan (Pendaftaran H-7)",
  },
  {
    id: "cert-3",
    slug: "google-ads-certification-google-skillshop-gratis-online",
    title: "Google Ads Certification",
    provider: "Google",
    issuer: "Google Skillshop",
    level: "Associate",
    category: "Marketing",
    duration: "On-demand (ujian 75 menit)",
    format: "Online",
    type: "Online Exam",
    price: "Gratis",
    rating: "4.9",
    students: "800.000+ Peserta",
    validity: "Berlaku 1 tahun",
    geo: "Online · Global",
    image: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://skillshop.exceedlms.com/",
    description: "Sertifikasi resmi Google untuk menguji kemahiran dalam merancang dan mengoptimalkan kampanye Google Search, Display, Video, dan Apps.",
    skills: ["Google Ads", "Search Engine Marketing", "Display Advertising", "Campaign Measurement"],
    benefits: ["100% gratis tanpa biaya", "Badge resmi Google untuk profil LinkedIn", "Meningkatkan kredibilitas di hadapan agency digital"],
    requirements: ["Akun Google aktif", "Nilai lulus assessment minimal 80%"],
    schedule: "Tersedia 24/7 di Google Skillshop",
  },
  {
    id: "cert-4",
    slug: "sertifikasi-kompetensi-programmer-bnsp-jakarta-surabaya",
    title: "Sertifikasi Kompetensi Programmer — BNSP",
    provider: "BNSP",
    issuer: "BNSP via LSP Informatika",
    level: "Junior Programmer",
    category: "IT",
    duration: "Tiap Kuartal",
    format: "Tulis & Praktik",
    type: "Sertifikasi Profesi",
    price: "Rp 1.000.000 - Rp 2.000.000",
    rating: "4.8",
    students: "15.000+ Lulusan",
    validity: "Berlaku 3 tahun",
    geo: "Jakarta · Surabaya · Bandung",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://bnsp.go.id",
    description: "Validasi keahlian pemrograman aplikasi menggunakan algoritma terstruktur, debugging kode, dan integrasi basis data.",
    skills: ["Coding", "Database SQL", "Algorithm", "Unit Testing", "Debugging"],
    benefits: ["Sertifikasi profesi resmi negara", "Poin penilaian unggulan untuk BUMN dan instansi pemerintahan"],
    requirements: ["Ijazah SMK/D3/S1 jurusan terkait", "Dokumen portofolio kode aplikasi yang pernah dibangun"],
    schedule: "Ujian batch tiap kuartal di TUK terdaftar",
  },
  {
    id: "cert-5",
    slug: "toefl-itp-syarat-kerja-pusat-bahasa-jakarta-bandung",
    title: "TOEFL ITP untuk Syarat Rekrutmen Kerja",
    provider: "ETS Indonesia",
    issuer: "Pusat Bahasa Berlisensi",
    level: "A2–C1",
    category: "Bahasa",
    duration: "Ujian 2 Jam",
    format: "Online & Offline",
    type: "Skor Resmi",
    price: "Rp 500.000 - Rp 650.000",
    rating: "4.9",
    students: "100.000+ Peserta",
    validity: "Berlaku 2 tahun",
    geo: "Jakarta · Bandung · Surabaya",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://ets.org",
    description: "Tes kecakapan bahasa Inggris resmi yang diakui oleh Kementerian, BUMN, institusi pendidikan, dan korporasi swasta.",
    skills: ["Listening Comprehension", "Structure & Written Expression", "Reading Comprehension"],
    benefits: ["Sertifikat fisik dan digital resmi ETS", "Dokumen wajib untuk seleksi BUMN dan beasiswa nasional"],
    requirements: ["KTP asli", "Pas foto terbaru"],
    schedule: "Jadwal ujian mingguan di lembaga resmi",
  },
];
export const sertifikatList = sertifikasiList;

export const courseList: CourseItem[] = [
  {
    id: "course-1",
    slug: "belajar-ui-ux-design-untuk-pemula",
    title: "Belajar UI/UX Design untuk Pemula dari Nol",
    provider: "KreatifLab Indonesia",
    level: "Pemula",
    category: "Design",
    duration: "12 Jam · 32 Video",
    price: "Gratis",
    originalPrice: "Rp 450.000",
    rating: "4.9",
    students: "34.500+ Siswa",
    language: "Indonesia",
    geoTag: "Online · Nasional",
    image: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://kreatiflab.id",
    description: "Pelajari riset pengguna, wireframing di Figma, pemilihan tipografi, hierarki visual, hingga membuat prototype yang siap diuji ke user nyata.",
    certificate: true,
    benefits: ["Akses video seumur hidup", "File latihan Figma siap pakai", "Sertifikat kelulusan digital"],
    modules: [
      { title: "Pengenalan UI/UX & Mindset Desainer", lessons: "4 video", duration: "60 menit" },
      { title: "Wireframing & Arsitektur Informasi", lessons: "6 video", duration: "90 menit" },
      { title: "Visual Design & Komponen Figma", lessons: "12 video", duration: "180 menit" },
      { title: "Prototyping & User Testing", lessons: "10 video", duration: "120 menit" },
    ],
  },
  {
    id: "course-2",
    slug: "digital-marketing-fundamental-digital-academy-indonesia-online",
    title: "Digital Marketing Fundamental",
    provider: "Digital Academy Indonesia",
    level: "Pemula",
    category: "Marketing",
    duration: "8 jam · 24 modul",
    price: "Rp 450.000",
    originalPrice: "Rp 650.000",
    rating: "4.6",
    students: "12.400+ peserta",
    language: "Indonesia",
    geoTag: "Online · Nasional",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://growthacademy.id",
    description: "Kuasai strategi funnel digital marketing, riset persona pelanggan, optimasi kampanye media sosial, dan metrik Google Analytics.",
    certificate: true,
    benefits: ["Sertifikat penyelesaian", "Akses seumur hidup", "Studi kasus UMKM lokal"],
    modules: [
      { title: "Dasar Funnel & Persona", lessons: "4 pelajaran", duration: "60 menit" },
      { title: "SEO & Content", lessons: "6 pelajaran", duration: "120 menit" },
      { title: "Meta & Google Ads", lessons: "8 pelajaran", duration: "180 menit" },
      { title: "Analytics & Optimasi", lessons: "6 pelajaran", duration: "90 menit" },
    ],
  },
  {
    id: "course-3",
    slug: "python-dan-sql-untuk-data-analyst",
    title: "Python dan SQL Lengkap untuk Data Analyst",
    provider: "DataNusantara",
    level: "Pemula",
    category: "Programming",
    duration: "16 Jam",
    price: "Gratis",
    rating: "4.9",
    students: "42.000+ Siswa",
    language: "Indonesia",
    geoTag: "Online",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://datanusantara.id",
    description: "Mulai dari sintaks dasar Python, Pandas DataFrame, query database PostgreSQL, hingga visualisasi Matplotlib dan Seaborn.",
    certificate: true,
    benefits: ["Notebook Google Colab siap pakai", "Latihan dataset riil e-commerce", "Sertifikat digital"],
    modules: [
      { title: "Dasar Logika Pemrograman Python", lessons: "6 video", duration: "120 menit" },
      { title: "Manipulasi Data dengan Pandas & NumPy", lessons: "8 video", duration: "180 menit" },
      { title: "Query Database dengan PostgreSQL", lessons: "8 video", duration: "180 menit" },
    ],
  },
  {
    id: "course-4",
    slug: "seo-lanjutan-website-bisnis-digital-academy-indonesia",
    title: "SEO Lanjutan untuk Website Bisnis",
    provider: "Digital Academy Indonesia",
    price: "Rp 550.000",
    originalPrice: "Rp 850.000",
    rating: "4.7",
    level: "Menengah",
    category: "Marketing",
    duration: "10 jam",
    language: "Indonesia",
    students: "8.200+ peserta",
    geoTag: "Online",
    image: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://digitalacademy.id",
    description: "Mendalami technical SEO, arsitektur informasi website, link building etis, dan optimasi core web vitals.",
    certificate: true,
    benefits: ["Template audit SEO", "Checklist on-page", "Grup konsultasi"],
    modules: [{ title: "Technical SEO & Schema", lessons: "5 pelajaran", duration: "120 menit" }],
  },
  {
    id: "course-5",
    slug: "social-media-specialist-class-kreatifhub-jakarta",
    title: "Social Media Specialist Class",
    provider: "KreatifHub",
    price: "Rp 400.000",
    rating: "4.5",
    level: "Pemula",
    category: "Marketing",
    duration: "6 jam",
    language: "Indonesia",
    students: "9.800+ peserta",
    geoTag: "Jakarta · Hybrid",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://kreatifhub.id",
    description: "Strategi content pillars, copywriting engagement tinggi, dan analisis performa media sosial.",
    certificate: true,
    benefits: ["Portfolio review langsung", "Grup alumni seumur hidup"],
    modules: [{ title: "Content Pillars & Storytelling", lessons: "4 pelajaran", duration: "90 menit" }],
  },
];
export const kursusList = courseList;

export const eventList: EventItem[] = [
  {
    id: "evt-1",
    slug: "jakarta-career-expo-2026-jcc-hall-a-jakarta-pusat",
    title: "Jakarta Career Expo 2026",
    organizer: "Maxxindo & Asosiasi HRD Indonesia",
    type: "Job Fair",
    dateDay: "12",
    dateMonth: "Sep",
    dateYear: "2026",
    day: "12",
    month: "Sep",
    time: "09.00–17.00 WIB",
    fullDate: "12 - 13 September 2026",
    date: "12 Sep 2026",
    location: "Jakarta Convention Center — Hall A, Jakarta Pusat",
    geo: "Jakarta Pusat, DKI Jakarta",
    format: "Offline",
    companiesCount: "80+ Perusahaan",
    companies: "80+ perusahaan",
    price: "Gratis",
    badge: "Terdekat",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://jakartacareerexpo.com",
    description: "Bertemu langsung dengan 80+ perusahaan ternama dari berbagai industri dalam satu acara akbar. Bawa CV terbaikmu dan ikuti walk-in interview langsung di tempat.",
    highlights: ["Walk-in interview langsung dengan HRD", "Konsultasi CV review gratis", "Talkshow tips lolos seleksi BUMN"],
    agenda: [
      { time: "09:00", title: "Registrasi & Open Gate", desc: "Check-in QR, cetak kartu peserta" },
      { time: "10:00", title: "Talkshow: CV ATS-Friendly", desc: "Speaker: HR Lead Gojek" },
      { time: "13:00", title: "Walk-in Interview", desc: "Bawa 3 CV cetak dan portofolio" },
      { time: "15:30", title: "Networking Session", desc: "Kenalan dengan rekruter" },
    ],
    exhibitors: ["PT Bank Mandiri", "PT Teknologi Nusantara", "Sinar Media Group", "Kreasi Digital Studio"],
  },
  {
    id: "evt-2",
    slug: "bandung-job-fair-kampus-itb-sasana-budaya-ganesha-bandung",
    title: "Bandung Job Fair — Kampus ITB",
    organizer: "Career Center ITB",
    type: "Job Fair",
    dateDay: "25",
    dateMonth: "Sep",
    dateYear: "2026",
    day: "25",
    month: "Sep",
    time: "08.30–16.00 WIB",
    fullDate: "25 September 2026",
    date: "25 Sep 2026",
    location: "Sasana Budaya Ganesha, Bandung",
    geo: "Bandung, Jawa Barat",
    format: "Offline",
    companiesCount: "40+ Perusahaan",
    companies: "40+ perusahaan",
    price: "Gratis",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://itb.ac.id",
    description: "Job fair terbuka untuk seluruh lulusan SMA/SMK, D3, dan S1 dengan fokus industri teknologi, manufaktur, dan perbankan.",
    highlights: ["Semua jurusan terbuka", "Lowongan magang dan full-time", "Career talk bersama alumni"],
    agenda: [{ time: "09:00", title: "Pembukaan Resmi", desc: "Sambutan rektor dan pameran dibuka" }],
    exhibitors: ["Telkom Indonesia", "Kreasi Digital", "Startup Bandung"],
  },
  {
    id: "evt-3",
    slug: "personal-branding-for-career-growth",
    title: "Personal Branding for Career Growth",
    organizer: "Dicoding Indonesia & Employer Job",
    type: "Webinar",
    dateDay: "18",
    dateMonth: "Jan",
    dateYear: "2026",
    day: "18",
    month: "Jan",
    time: "19.30–21.00 WIB",
    fullDate: "18 Januari 2026 · 19.30 WIB",
    date: "18 Jan 2026",
    location: "Online (Zoom Meeting)",
    geo: "Online",
    format: "Online",
    attendeesCount: "2.500+ Pendaftar",
    price: "Gratis",
    image: "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://dicoding.com/events",
    description: "Pelajari cara membangun personal branding yang kuat di LinkedIn dan media profesional dari para praktisi industri teknologi.",
    highlights: ["Sesi tanya jawab langsung", "E-certificate resmi", "Template profil LinkedIn"],
  },
  {
    id: "evt-4",
    slug: "cv-portfolio-workshop-surabaya",
    title: "CV & Portfolio Workshop Surabaya",
    organizer: "Employer Job Komunitas Jawa Timur",
    type: "Workshop",
    dateDay: "24",
    dateMonth: "Jan",
    dateYear: "2026",
    day: "24",
    month: "Jan",
    time: "09.00–15.00 WIB",
    fullDate: "24 Januari 2026 · 09.00 - 15.00 WIB",
    date: "24 Jan 2026",
    location: "Gedung Siola Coworking, Surabaya, Jawa Timur",
    geo: "Surabaya, Jawa Timur",
    format: "Offline",
    attendeesCount: "120 Kursi Terbatas",
    price: "Rp 50.000",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://ambilcuti.id",
    description: "Bedah CV satu per satu bersama certified HR coach. Pastikan berkas lamaranmu menarik perhatian rekruter dalam hitungan detik.",
    highlights: ["Review CV one-on-one", "Sesi latihan interview singkat", "Konsumsi dan sertifikat"],
  },
  {
    id: "evt-5",
    slug: "virtual-job-fair-nasional-online-3-hari-oktober-2026",
    title: "Virtual Job Fair — Nasional",
    organizer: "PortalKerja & Kemnaker",
    type: "Job Fair",
    dateDay: "03",
    dateMonth: "Okt",
    dateYear: "2026",
    day: "03",
    month: "Okt",
    time: "10.00–15.00 WIB",
    fullDate: "03 - 05 Oktober 2026",
    date: "03 Okt 2026",
    location: "Online — Zoom & PortalKerja",
    geo: "Online — Nasional",
    format: "Online",
    companiesCount: "120+ Perusahaan",
    companies: "120+ perusahaan",
    price: "Gratis",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    officialUrl: "https://ambilcuti.id",
    description: "Akses ratusan lowongan dari kenyamanan rumahmu dengan fasilitas live video interview bersama rekruter.",
    highlights: ["Live chat rekruter", "Webinar persiapan karier", "Pengumuman seleksi instan"],
    agenda: [{ time: "10:00", title: "Keynote Virtual Hiring", desc: "Tren rekrutmen kerja jarak jauh di Indonesia" }],
    exhibitors: ["Perusahaan Remote", "BUMN", "Unicorn Startup"],
  },
];
export const jobFairList = eventList;

export const trendingTopics: TrendingTopic[] = [
  { rank: 1, name: "Fresh Graduate", reads: "12.4K pembaca", slug: "fresh-graduate" },
  { rank: 2, name: "Interview Kerja", reads: "10.1K pembaca", slug: "interview-kerja" },
  { rank: 3, name: "Remote Work", reads: "8.9K pembaca", slug: "remote-work" },
  { rank: 4, name: "Career Switch", reads: "7.6K pembaca", slug: "career-switch" },
  { rank: 5, name: "Pengembangan Diri", reads: "6.8K pembaca", slug: "pengembangan-diri" },
];

export const topPicks = [
  {
    type: "LOWONGAN",
    badgeColor: "bg-blue-600 text-white",
    date: "Dibuka 2 hari lalu",
    title: "PT Bank Mandiri Buka Rekrutmen Fresh Graduate 2025",
    meta1: "Jakarta",
    meta2: "Full Time",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    link: "/lowongan/rekrutmen-fresh-graduate-pt-bank-mandiri-jakarta",
  },
  {
    type: "ARTIKEL",
    badgeColor: "bg-emerald-600 text-white",
    date: "12 Okt 2025",
    title: "10 Skill yang Paling Dicari Perusahaan di Tahun 2026",
    meta1: "5 menit baca",
    meta2: "Tren Industri",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    link: "/career/10-skill-yang-paling-dicari-perusahaan-di-tahun-2026",
  },
  {
    type: "EVENT",
    badgeColor: "bg-purple-600 text-white",
    date: "20 Okt 2025",
    title: "Jakarta Career Fair 2025 Siap Digelar Bulan Depan",
    meta1: "Jakarta Convention Center",
    meta2: "Offline",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
    link: "/event/jakarta-career-expo-2026-jcc-hall-a-jakarta-pusat",
  },
  {
    type: "SERTIFIKASI",
    badgeColor: "bg-amber-500 text-white",
    date: "15 Okt 2025",
    title: "Google Data Analytics Professional Certificate",
    meta1: "Online",
    meta2: "Google Certified",
    image: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=600&q=80",
    link: "/sertifikasi/google-data-analytics-professional-certificate",
  },
];
