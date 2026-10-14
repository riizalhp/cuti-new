import { CvPurpose } from './cv-purpose-scoring-engine';
import { getSectionOrderForPurpose } from './cv-section-scoring-matrix';
import { cleanBulletText } from './cv-bullets';
import { CVData, InternshipItem, SkillItem, ProjectItem, OrganizationItem, EducationItem, CertificationItem, CourseItem, ScholarshipItem, VolunteerItem, ReferenceItem, LanguageItem, PublicationItem, AwardItem, PortfolioLinkItem, OtherRelevantItem } from '@/components/CVView';

export interface StarterPresetOptions {
  purpose: CvPurpose;
  targetRole: string;
  templateId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userLocation?: string;
}

export function generateStarterCvPreset(options: StarterPresetOptions): Partial<CVData> {
  const {
    purpose = 'job',
    targetRole = '',
    userName = 'Alexander Pratama, S.Kom.',
    userEmail = 'alexander.pratama@email.com',
    userPhone = '+62 812-3456-7890',
    userLocation = 'Jakarta, Indonesia',
  } = options;

  const resolvedUserName = userName.trim() || 'Alexander Pratama, S.Kom.';
  const resolvedUserEmail = userEmail.trim() || 'alexander.pratama@email.com';
  const resolvedUserPhone = userPhone.trim() || '+62 812-3456-7890';
  const resolvedUserLocation = userLocation.trim() || 'Jakarta, Indonesia';

  const roleLower = targetRole.toLowerCase();

  // 1. Deteksi Kategori Profesi
  let category: 'tech' | 'admin' | 'marketing' | 'creative' | 'hospitality' | 'education' | 'healthcare' | 'general' = 'general';

  if (/(developer|engineer|software|frontend|backend|fullstack|web|mobile|android|ios|programmer|devops|it|qa|tester|data|machine learning|ai|sistem)/i.test(roleLower)) {
    category = 'tech';
  } else if (/(perawat|nurse|ners|dokter|doctor|bidan|midwife|apoteker|pharmacist|farmasi|rekam medis|medis|kesehatan|nakes|fisioterapi|radiologi|laboratorium medis|analis kesehatan|gizi|nutritionist)/i.test(roleLower) || purpose === 'healthcare') {
    category = 'healthcare';
  } else if (/(admin|administrasi|office|sekretaris|secretary|receptionist|data entry|operasional|operational|finance|keuangan|akuntansi|accounting|tax|pajak|hr|hrd|human resource|personalia|customer service|cs)/i.test(roleLower)) {
    category = 'admin';
  } else if (/(marketing|sales|digital marketing|pemasaran|penjualan|business development|bizdev|account executive|social media|socmed|content|copywriter|seo|brand|pr\b|public relations)/i.test(roleLower)) {
    category = 'marketing';
  } else if (/(desain|design|ui|ux|graphic|grafis|illustrator|animator|video|editor|fotografer|photographer|multimedia|kreatif|creative)/i.test(roleLower)) {
    category = 'creative';
  } else if (/(barista|chef|cook|waiter|pelayan|kasir|cashier|hotel|restoran|f&b|toko|store|retail|pramuniaga)/i.test(roleLower)) {
    category = 'hospitality';
  } else if (/(guru|teacher|tutor|pengajar|dosen|instruktur|educator|pendidikan)/i.test(roleLower)) {
    category = 'education';
  }

  const roleTitle = targetRole.trim() || getDefaultRoleTitle(category, purpose);

  // 2. Data Kontekstual per Kategori Profesi
  const basePreset = buildCategoryPreset(category, purpose, roleTitle, {
    userName: resolvedUserName,
    userEmail: resolvedUserEmail,
    userPhone: resolvedUserPhone,
    userLocation: resolvedUserLocation,
  });

  // 3. Penyesuaian section & konten sesuai tujuan (matrix scoring per profil)
  const result = applyPurposePreset(basePreset, purpose, roleTitle, resolvedUserLocation);
  result.purpose = purpose;
  result.sectionOrder = getSectionOrderForPurpose(purpose);
  return result;
}

type PresetContext = {
  userName: string;
  userEmail: string;
  userPhone: string;
  userLocation: string;
};

function buildCategoryPreset(
  category: 'tech' | 'admin' | 'marketing' | 'creative' | 'hospitality' | 'education' | 'healthcare' | 'general',
  purpose: CvPurpose,
  roleTitle: string,
  ctx: PresetContext
): Partial<CVData> {
  const { userName, userEmail, userPhone, userLocation } = ctx;

  switch (category) {
    case 'tech':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: purpose === 'internship'
          ? `Mahasiswa IT yang antusias mengembangkan aplikasi web & mobile modern. Memiliki dasar pemrograman yang kuat, terbiasa berkolaborasi menggunakan Git, dan siap memberikan kontribusi nyata dalam program magang.`
          : purpose === 'academic_scholarship'
          ? `Lulusan/Mahasiswa Ilmu Komputer berprestasi dengan fokus riset pada rekayasa perangkat lunak dan komputasi cerdas. Berkomitmen mengembangkan solusi teknologi untuk kemajuan masyarakat.`
          : `Profesional ${roleTitle} berdedikasi dalam membangun arsitektur perangkat lunak yang scalable, efisien, dan ramah pengguna. Berpengalaman dalam metodologi Agile, cloud deployment, dan optimasi performa sistem.`,
        skills: ['TypeScript', 'React.js', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'RESTful API', 'Git & GitHub', 'Agile / Scrum', 'System Design', 'Problem Solving'],
        experience: [
          {
            id: 'exp-1',
            company: 'PT GoTo Gojek Tokopedia Tbk',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Memimpin pengembangan arsitektur frontend & backend pada platform utama, meningkatkan kecepatan response time sistem hingga 40%.\n• Berkolaborasi dalam tim lintas divisi untuk merilis 12+ modul fitur baru sesuai target sprint tanpa regresi teknis.\n• Mengimplementasikan automated testing dan code review rutin yang meminimalisir production bug hingga 25%.',
          },
          {
            id: 'exp-2',
            company: 'PT Midtrans Digital Kreasi',
            role: 'Junior Software Engineer',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Membangun antarmuka responsif dan integrasi API mikroservis sistem pembayaran untuk 100.000+ pengguna aktif bulanan.\n• Mengoptimalkan query database PostgreSQL dan caching Redis, memangkas latensi transaksi sebesar 30%.\n• Memperbaiki 50+ issue teknis dan meningkatkan stabilitas sistem secara konsisten.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Platform E-Commerce Microservices',
            role: 'Lead Developer',
            tech: 'React, Next.js, Node.js, PostgreSQL, Tailwind CSS',
            startDate: 'Jan 2023',
            endDate: 'Mar 2024',
            description: '• Merancang arsitektur sistem belanja online dengan integrasi payment gateway otomatis dan dashboard analitik real-time.\n• Menerapkan caching Redis dan load balancing yang mendukung lonjakan traffic hingga 10.000 concurrent users.',
          },
          {
            id: 'proj-2',
            name: 'Aplikasi Mobile Pelayanan Publik & Tracking Dokumen',
            role: 'Fullstack Developer',
            tech: 'TypeScript, React Native, REST API',
            startDate: 'Feb 2022',
            endDate: 'Des 2022',
            description: '• Mengembangkan aplikasi pelacakan dokumen warga secara transparan yang terintegrasi dengan sistem notifikasi otomatis.\n• Mempercepat proses verifikasi berkas antar unit kerja sebesar 35% dibandingkan proses konvensional.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Indonesia',
            degree: 'S1 Ilmu Komputer',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.75 / 4.00',
            description: 'Fokus pada Rekayasa Perangkat Lunak & Sistem Terdistribusi. Lulus dengan predikat Sangat Memuaskan (Cum Laude).',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'AWS Certified Solutions Architect - Associate',
            issuer: 'Amazon Web Services',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Google Professional Cloud Developer',
            issuer: 'Google Cloud / Coursera',
            issueDate: '2024',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Himpunan Mahasiswa Ilmu Komputer (Fasilkom UI)',
            role: 'Ketua Divisi Pengembangan Teknologi',
            period: '2022 - 2023',
            description: '• Mengkoordinasikan pelaksanaan konferensi teknologi nasional tahunan yang diikuti oleh 600+ peserta mahasiswa dan praktisi.\n• Memimpin tim pengembang beranggotakan 8 orang dalam merancang portal digital pendaftaran dan sistem tiket acara.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };

    case 'admin':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: purpose === 'internship'
          ? `Mahasiswa Manajemen / Administrasi yang terorganisir, teliti, dan menguasai Microsoft Office Suite. Siap mendukung kelancaran operasional harian kantor melalui manajemen dokumen yang rapi.`
          : `Tenaga profesional ${roleTitle} yang teliti, terorganisir, dan handal dalam pengelolaan dokumen, korespondensi bisnis, serta efisiensi alur operasional kantor. Terbiasa menangani data bervolume tinggi dengan tingkat akurasi 99.5%.`,
        skills: ['Microsoft Excel (VLOOKUP, Pivot)', 'Microsoft Office Suite', 'Manajemen Dokumen & Arsip', 'Data Entry & Rekapitulasi', 'Korespondensi Bisnis', 'Time Management', 'Komunikasi Interpersonal', 'Customer Service', 'Problem Solving'],
        experience: [
          {
            id: 'exp-1',
            company: 'PT Bank Central Asia Tbk (BCA)',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengelola dan merekapitulasi 400+ dokumen administratif per bulan dengan tingkat akurasi pencatatan 99.5%.\n• Mengoptimalkan sistem pengarsipan digital kantor, mempercepat proses temu kembali berkas hingga 30%.\n• Mengkoordinasikan jadwal rapat, inventaris kantor, dan korespondensi resmi dengan pihak internal maupun eksternal.',
          },
          {
            id: 'exp-2',
            company: 'PT Telekomunikasi Selular (Telkomsel)',
            role: 'Staf Administrasi & Operasional',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memproses entri data transaksi harian dan menyusun laporan operasional mingguan untuk pimpinan unit.\n• Melayani pertanyaan administratif dari 20+ klien per hari dengan standar kepuasan tinggi.\n• Menyusun rekonsiliasi pengeluaran operasional bulanan tanpa selisih pembukuan.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Digitalisasi Sistem Pengarsipan & Alur Dokumen Kantor',
            role: 'Koordinator Proyek Administrasi',
            tech: 'Google Workspace, Cloud Storage, Spreadsheet Automation',
            startDate: '2023',
            endDate: '2023',
            description: '• Merancang struktur repositori berkas digital yang memudahkan pencarian 1.500+ dokumen kontrak dan legalitas perusahaan.\n• Mengurangi penggunaan kertas operasional (paperless initiative) hingga 45% dalam tahun pertama penerapan.',
          },
          {
            id: 'proj-2',
            name: 'Dashboard Rekapitulasi Keuangan & Anggaran Operasional',
            role: 'Lead Administrator',
            tech: 'Microsoft Excel Advanced, Power BI',
            startDate: '2022',
            endDate: '2022',
            description: '• Membangun template lembar kerja otomatis untuk tracking anggaran pengadaan barang kantor.\n• Mempercepat waktu pelaporan bulanan kepada direksi dari 5 hari kerja menjadi 1 hari kerja.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Gadjah Mada',
            degree: 'S1 Manajemen Bisnis & Administrasi',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.68 / 4.00',
            description: 'Mempelajari Manajemen Operasional, Tata Kelola Arsip Elektronik, dan Komunikasi Bisnis.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Certified Administrative Professional (CAP)',
            issuer: 'International Association of Administrative Professionals',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Microsoft Office Specialist (MOS) Expert',
            issuer: 'Microsoft Corporation',
            issueDate: '2022',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Himpunan Mahasiswa Manajemen & Administrasi Bisnis UGM',
            role: 'Sekretaris Umum',
            period: '2021 - 2022',
            description: '• Mengelola korespondensi resmi, notulensi rapat pleno, dan pengarsipan berkas legalitas organisasi untuk 15 program kerja.\n• Mengkoordinasikan perizinan tempat dan logistik kegiatan kemahasiswaan tingkat fakultas.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };

    case 'marketing':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: purpose === 'internship'
          ? `Mahasiswa Komunikasi / Pemasaran yang kreatif dan melek tren media sosial. Menguasai riset audiens dan pembuatan konten engaging, siap mendukung kampanye pemasaran tim.`
          : `Profesional ${roleTitle} berorientasi data dan hasil dengan keahlian dalam strategi pemasaran digital, akuisisi pelanggan, dan peningkatan brand engagement. Terbukti meningkatkan leads dan konversi penjualan secara berkelanjutan.`,
        skills: ['Digital Marketing Strategy', 'Social Media Management', 'Google Analytics & Ads', 'Meta Ads', 'Content Strategy & Copywriting', 'Market Research', 'SEO Basics', 'Negosiasi & Sales Pitching', 'CRM Tools'],
        experience: [
          {
            id: 'exp-1',
            company: 'PT Paragon Technology and Innovation',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Merancang dan mengeksekusi kampanye pemasaran digital terpadu yang meningkatkan qualified leads sebesar 35% dalam 6 bulan.\n• Mengelola anggaran iklan berbayar dengan ROI rata-rata 3.2x dan menurunkan Cost per Acquisition (CPA) sebesar 20%.\n• Memproduksi 20+ konten kreatif per bulan dengan engagement rate melampaui target industri sebesar 4.8%.',
          },
          {
            id: 'exp-2',
            company: 'PT Shopee International Indonesia',
            role: 'Digital Marketing Associate',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Melakukan riset pasar kompetitor dan mengkoordinasikan program promosi musiman bersama 15+ mitra bisnis.\n• Mengelola akun media sosial perusahaan hingga mencapai pertumbuhan 15.000+ followers organik.\n• Menganalisis metrik traffic kampanye mingguan dan menyajikan actionable insights kepada tim produk.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Kampanye Peluncuran Produk & Brand Awareness 2024',
            role: 'Campaign Lead',
            tech: 'Meta Ads Manager, Google Analytics 4, TikTok Ads',
            startDate: '2023',
            endDate: '2024',
            description: '• Mengorkestrasi kampanye omni-channel peluncuran lini produk baru yang menjangkau 250.000+ impresi unik.\n• Menghasilkan konversi penjualan awal sebesar 120% melampaui estimasi target awal peluncuran.',
          },
          {
            id: 'proj-2',
            name: 'Optimalisasi Strategi SEO & Akuisisi Konten Organik',
            role: 'Content Strategist',
            tech: 'Ahrefs, Google Search Console, WordPress',
            startDate: '2022',
            endDate: '2022',
            description: '• Melakukan audit kata kunci dan optimasi on-page pada 30+ artikel edukasi bernilai tinggi.\n• Mendorong kenaikan organic search traffic sebesar 65% dalam kurun waktu 4 bulan.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Padjadjaran',
            degree: 'S1 Ilmu Komunikasi (Pemasaran Digital)',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.72 / 4.00',
            description: 'Aktif dalam Himpunan Mahasiswa Pemasaran dan Juara Lomba Brand Strategy Nasional.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Google Analytics Individual Qualification (GA4)',
            issuer: 'Google Skillshop',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Meta Certified Digital Marketing Associate',
            issuer: 'Meta Blueprint',
            issueDate: '2024',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Himpunan Mahasiswa Ilmu Komunikasi & Pemasaran UNPAD',
            role: 'Kepala Biro Media & Publikasi',
            period: '2021 - 2022',
            description: '• Memimpin tim kreatif berisi 10 staf dalam memproduksi konten edukasi dan promosi kegiatan kampus.\n• Mengembangkan strategi distribusi konten media sosial yang melipatgandakan jangkauan akun resmi himpunan.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };

    case 'creative':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: purpose === 'internship'
          ? `Mahasiswa DKV / Desain yang berfokus pada estetika fungsional dan UI/UX modern. Menguasai Figma dan Adobe Creative Suite dengan portofolio proyek visual yang terstruktur.`
          : `Desainer ${roleTitle} kreatif yang mengedepankan estetika fungsional dan pengalaman pengguna optimal. Berpengalaman merancang identitas visual, antarmuka produk digital, dan aset kreatif bernilai tinggi bagi bisnis.`,
        skills: ['Figma / FigJam', 'UI/UX Design', 'Adobe Photoshop & Illustrator', 'Visual Identity & Branding', 'Design System', 'Wireframing & Prototyping', 'User Journey Mapping', 'Motion Graphics Basics', 'Typography'],
        experience: [
          {
            id: 'exp-1',
            company: 'PT Tokopedia (Product Design)',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Merancang wireframe, user flow, dan antarmuka high-fidelity untuk 4 aplikasi web & mobile berskala komersial.\n• Membangun Design System terpadu yang memangkas waktu kerja tim pengembang sebesar 30%.\n• Melakukan usability testing berkala pada 50+ user untuk memvalidasi kenyamanan dan keterbacaan antarmuka.',
          },
          {
            id: 'exp-2',
            company: 'Studio Desain Cipta Ruang',
            role: 'Junior UI/UX Designer',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memproduksi 100+ aset visual promosi media sosial, banner cetak, dan presentasi klien korporat.\n• Berkolaborasi dengan tim marketing untuk menjaga konsistensi brand guidelines pada seluruh materi kampanye.\n• Mengembangkan prototipe interaktif clickable untuk validasi kebutuhan fitur sebelum masuk tahap coding.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Revamp Design System & Mobile Banking App',
            role: 'Lead UI/UX Designer',
            tech: 'Figma, FigJam, Maze Usability Testing',
            startDate: '2023',
            endDate: '2023',
            description: '• Merestrukturisasi 120+ komponen antarmuka dengan token warna, tipografi, dan varian state yang konsisten.\n• Meningkatkan System Usability Scale (SUS) aplikasi mobile dari skor 64 menjadi 82.',
          },
          {
            id: 'proj-2',
            name: 'Identitas Visual & Brand Guidelines UMKM Nasional',
            role: 'Brand Identity Designer',
            tech: 'Adobe Illustrator, Photoshop, InDesign',
            startDate: '2022',
            endDate: '2022',
            description: '• Merancang identitas visual lengkap mencakup logo, pedoman warna, kemasan produk, dan template media sosial.\n• Membantu mitra bisnis meningkatkan persepsi profesional brand di mata konsumen ritel.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Institut Teknologi Bandung',
            degree: 'S1 Desain Komunikasi Visual (DKV)',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.70 / 4.00',
            description: 'Fokus pada Desain Media Interaktif, Pengalaman Pengguna (UX), dan Tipografi Terapan.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Google UX Design Professional Certificate',
            issuer: 'Google / Coursera',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Adobe Certified Professional (Visual Design)',
            issuer: 'Adobe Certified Associate',
            issueDate: '2022',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Asosiasi Desainer Grafis Indonesia (ADGI) Chapter Mahasiswa',
            role: 'Koordinator Divisi Pameran & Workshop',
            period: '2021 - 2022',
            description: '• Mengelola penyelenggaraan pameran karya visual mahasiswa bertaraf regional yang dihadiri 400+ pengunjung.\n• Menginisiasi workshop desain grafis dan UI/UX bersertifikat bagi siswa SMA/SMK se-Bandung Raya.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };

    case 'hospitality':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: `Tenaga ${roleTitle} yang ramah, berorientasi pada kepuasan pelanggan, dan disiplin dalam standar kebersihan serta kecepatan layanan. Terbiasa bekerja dalam ritme dinamis dan jam sibuk dengan standar pelayanan bintang lima.`,
        skills: ['Customer Service Prima', 'Point of Sales (POS)', 'Cash Handling & Kasir', 'Food & Beverage Preparation', 'Manajemen Stok / Inventory', 'Komunikasi Ramah', 'Kebersihan & Sanitasi (HACCP)', 'Kerjasama Tim'],
        experience: [
          {
            id: 'exp-1',
            company: 'Hotel Indonesia Kempinski Jakarta',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Melayani 150+ pesanan pelanggan per hari dengan standar keramahan tinggi dan akurasi pesanan 99%.\n• Mengoperasikan mesin espresso, menjaga standar kalibrasi rasa harian, dan mengelola stok bahan baku.\n• Memastikan kebersihan area kerja dan kasir sesuai SOP sanitasi baku bertaraf internasional.',
          },
          {
            id: 'exp-2',
            company: 'Kopi Kenangan Senopati',
            role: 'Barista & Shift Leader',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memproses transaksi pembayaran tunai & non-tunai dengan tepat tanpa selisih kas.\n• Memberikan rekomendasi menu favorit kepada pelanggan, mendukung kenaikan penjualan rata-rata per transaksi sebesar 18%.\n• Memimpin briefing harian kru dan memastikan kepatuhan jadwal operasional gerai.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Standarisasi SOP Kecepatan Layanan Jam Sibuk',
            role: 'Inisiator Proyek Layanan',
            tech: 'Workflow Optimization, POS System Tracking',
            startDate: '2023',
            endDate: '2023',
            description: '• Merancang alur pembagian tugas kasir dan barista saat peak hours, memangkas waktu tunggu antrean pelanggan dari 7 menit menjadi 3.5 menit.\n• Meningkatkan kepuasan ulasan pelanggan di Google Maps menjadi rating 4.8 bintang.',
          },
          {
            id: 'proj-2',
            name: 'Program Loyalitas Pelanggan & Upselling Menu Musiman',
            role: 'Shift Coordinator',
            tech: 'CRM Loyalty, Inventory Control',
            startDate: '2022',
            endDate: '2022',
            description: '• Mengkampanyekan program reward pelanggan tetap yang berkontribusi pada peningkatan repeat order bulanan sebesar 22%.\n• Mengelola pelaporan sisa stok harian untuk meminimalisir pemborosan bahan baku hingga 15%.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Politeknik Pariwisata NHI Bandung',
            degree: 'D4 Manajemen Tata Hidang & Perhotelan',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.65 / 4.00',
            description: 'Pelatihan Pelayanan Prima, Manajemen Restoran Internasional, dan Standar Sanitasi Pangan.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Sertifikasi Kompetensi Barista BNSP',
            issuer: 'Badan Nasional Sertifikasi Profesi (BNSP)',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'HACCP Food Safety & Hygiene Certification',
            issuer: 'Lembaga Sertifikasi Profesi Perhotelan',
            issueDate: '2022',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Komunitas Barista & Specialty Coffee Indonesia',
            role: 'Anggota Aktif & Relawan Event',
            period: '2022 - Sekarang',
            description: '• Berpartisipasi dalam penyelenggaraan kompetisi seduh kopi tahunan tingkat nasional dan workshop teknik cupping kopi nusantara.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Conversational' },
        ],
      };

    case 'education':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: `Pendidik / ${roleTitle} berdedikasi dengan pendekatan pengajaran yang interaktif, komunikatif, dan memotivasi. Mampu merancang kurikulum materi pembelajaran yang adaptif sesuai kebutuhan belajar siswa dan perkembangan kurikulum nasional.`,
        skills: ['Penyusunan RPP & Kurikulum', 'Metode Pembelajaran Interaktif', 'Evaluasi & Penilaian Belajar', 'Public Speaking & Komunikasi', 'Classroom Management', 'Media Pembelajaran Digital', 'Bimbingan Siswa', 'Kesabaran & Empati'],
        experience: [
          {
            id: 'exp-1',
            company: 'SMA Labschool Rawamangun Jakarta',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengajar 80+ siswa dengan metode pembelajaran aktif yang meningkatkan nilai rata-rata ujian siswa sebesar 20%.\n• Menyusun modul materi belajar interaktif berbasis digital dan lembar evaluasi berkala.\n• Menjalin komunikasi konstruktif dengan orang tua murid mengenai perkembangan belajar siswa.',
          },
          {
            id: 'exp-2',
            company: 'Bimbingan Belajar Ruangguru',
            role: 'Tutor Pengajar Senior',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memandu 120+ siswa mempersiapkan ujian seleksi masuk perguruan tinggi dengan tingkat kelulusan 88%.\n• Mengembangkan bank soal kontekstual dan strategi pemecahan masalah cepat.\n• Menerima evaluasi kepuasan siswa dengan predikat Tutor Teladan semester ganjil 2022.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Pengembangan Modul Pembelajaran Digital Interaktif Berbasis Gamifikasi',
            role: 'Lead Educator',
            tech: 'Canva for Education, Quizizz, Google Classroom',
            startDate: '2023',
            endDate: '2023',
            description: '• Merancang materi ajar kontekstual yang memadukan kuis interaktif dan studi kasus nyata.\n• Meningkatkan tingkat partisipasi aktif siswa di dalam kelas dari 60% menjadi 92%.',
          },
          {
            id: 'proj-2',
            name: 'Program Mentoring & Bimbingan Belajar Siswa Berprestasi',
            role: 'Koordinator Mentor',
            tech: 'Modul Bimbingan Intensif, Lembar Asesmen Diagnostik',
            startDate: '2022',
            endDate: '2022',
            description: '• Membimbing kelompok belajar intensif untuk persiapan olimpiade akademik tingkat kota.\n• Mengantarkan 3 siswa bimbingan meraih medali perak dan perunggu tingkat provinsi.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Pendidikan Indonesia',
            degree: 'S1 Pendidikan Bahasa & Sastra Indonesia',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.80 / 4.00',
            description: 'Pendidikan Profesi Guru & Psikologi Pendidikan Anak. Lulus dengan predikat Cum Laude.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Sertifikat Pendidik Profesional (PPG Kemendikbud)',
            issuer: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Microsoft Certified Educator (MCE)',
            issuer: 'Microsoft Education',
            issueDate: '2022',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Forum Guru & Pendidik Muda Indonesia (FGPMI)',
            role: 'Koordinator Bidang Pengembangan Kurikulum',
            period: '2022 - Sekarang',
            description: '• Menyelenggarakan webinar berkala mengenai pemanfaatan teknologi kecerdasan buatan etis dalam pembelajaran yang diikuti 350+ guru se-Indonesia.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };

    case 'healthcare':
      return {
        fullName: userName.includes('S.') || userName.includes('Ners') || userName.includes('dr.') ? userName : `${userName}, S.Kep., Ners`,
        headline: roleTitle || 'Perawat Klinis (Staff Nurse)',
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: purpose === 'internship'
          ? `Mahasiswa Profesi Ners / Kesehatan yang berdedikasi tinggi dengan pengalaman stase di RS Tipe A. Memiliki ketelitian tinggi dalam asuhan keperawatan, keselamatan pasien (patient safety), dan siap menjalani praktik klinik dengan disiplin prima.`
          : `Tenaga kesehatan profesional ${roleTitle} ber-STR aktif dengan pengalaman klinis di rumah sakit terakreditasi paripurna. Tersertifikasi BTCLS dan K3 Rumah Sakit, terbiasa menangani tindakan keperawatan rawat inap & gawat darurat, kolaborasi interprofesional, serta dokumentasi rekam medis elektronik (SIMRS) dengan kepatuhan patient safety 100%.`,
        skills: [
          'Asuhan Keperawatan Pasien',
          'Triage & Kegawatdaruratan (BTCLS)',
          'Pemasangan Infus & Kateter',
          'Pemberian Terapi Obat (7 Benar)',
          'Patient Safety & K3 RS',
          'Pencegahan Pengendalian Infeksi (PPI)',
          'Dokumentasi SIMRS / SATUSEHAT',
          'Komunikasi Terapeutik Pasien',
          'Interpretasi EKG Dasar',
          'Kolaborasi Interprofesional'
        ],
        experience: [
          {
            id: 'exp-1',
            company: 'RSUP Nasional Dr. Cipto Mangunkusumo / RS Swasta',
            role: roleTitle || 'Perawat Rawat Inap (Staff Nurse)',
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Melakukan asuhan keperawatan komprehensif pada 15-20 pasien bedah dan penyakit dalam per shift dengan kepatuhan SOP 100%.\n• Mengidentifikasi dini kegawatan pasien menggunakan sistem Early Warning Score (EWS) dan berkolaborasi tanggap dengan dokter penanggung jawab (DPJP).\n• Mengoperasikan sistem rekam medis elektronik (SIMRS) untuk pencatatan tindakan medis secara akurat dan real-time.',
          },
          {
            id: 'exp-2',
            company: 'RS Mitra Keluarga / RSUD Kota',
            role: 'Junior Clinical Nurse',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Mengelola pemberian medikasi injeksi dan oral dengan prinsip 7 benar keselamatan pasien tanpa insiden medikasi (zero medication error).\n• Memberikan edukasi pemulangan pasien (discharge planning) dan perawatan luka modern bagi pasien pasca-operasi.\n• Berpartisipasi aktif dalam tim akreditasi mutu rumah sakit standar KARS/JCI.',
          },
        ],
        projects: [],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Indonesia / Poltekkes Kemenkes',
            degree: 'Profesi Ners (S.Kep., Ners)',
            year: '2021 - 2022',
            location: userLocation,
            gpa: '3.80 / 4.00',
            description: 'Lulus Uji Kompetensi Nasional (UKOM) dengan nilai sangat memuaskan. Menyelesaikan seluruh stase klinik komprehensif di RS Pendidikan Utama.',
          },
          {
            id: 'edu-2',
            institution: 'Universitas Indonesia / Poltekkes Kemenkes',
            degree: 'S1 Ilmu Keperawatan',
            year: '2017 - 2021',
            location: userLocation,
            gpa: '3.72 / 4.00',
            description: 'Fokus pada Keperawatan Medikal Bedah dan Manajemen Keselamatan Pasien Rumah Sakit.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Surat Tanda Registrasi (STR) Tenaga Keperawatan Aktif',
            issuer: 'Konsil Tenaga Kesehatan Indonesia (KTKI) / Kemenkes RI',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Basic Trauma Cardiac Life Support (BTCLS)',
            issuer: 'HIPGABI / Kemenkes RI',
            issueDate: '2023',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Persatuan Perawat Nasional Indonesia (PPNI)',
            role: 'Anggota Aktif Komisariat Rumah Sakit',
            period: '2022 - Sekarang',
            description: '• Aktif mengikuti seminar ilmiah tahunan dan program pengembangan keprofesian berkelanjutan (P2KB).',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };

    default: // general
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: purpose === 'internship'
          ? `Mahasiswa berprestasi dan cepat belajar yang siap menerapkan ilmu pengetahuan akademik dalam lingkungan kerja nyata melalui program magang.`
          : purpose === 'academic_scholarship'
          ? `Pendaftar beasiswa yang memiliki integritas, dedikasi tinggi pada bidang studi, dan komitmen kuat untuk mengabdi bagi kemajuan masyarakat dan bangsa.`
          : `Profesional ${roleTitle} yang berdedikasi, adaptif, dan memiliki kemampuan komunikasi serta pemecahan masalah yang baik. Terbiasa mengelola alur kerja operasional, berkolaborasi dengan tim lintas divisi, dan siap memberikan kontribusi optimal untuk pertumbuhan organisasi.`,
        skills: ['Komunikasi Efektif', 'Microsoft Office Suite', 'Problem Solving', 'Kerjasama Tim Lintas Divisi', 'Manajemen Waktu', 'Analisis Data Dasar', 'Critical Thinking', 'Adaptabilitas'],
        experience: [
          {
            id: 'exp-1',
            company: 'PT Bank Mandiri (Persero) Tbk',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengelola analisis kebutuhan operasional dan dokumentasi SOP alur kerja untuk 3 divisi internal.\n• Berkolaborasi dengan tim lintas fungsi untuk mencapai target unit kerja secara tepat waktu dan efisien.\n• Mengusulkan inisiatif perbaikan proses kerja yang meningkatkan produktivitas tim sebesar 20%.',
          },
          {
            id: 'exp-2',
            company: 'PT Astra International Tbk',
            role: 'Staf Manajemen Proyek Operasional',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Mengkoordinasikan pelaksanaan program kerja operasional yang melibatkan 100+ staf aktif.\n• Menyusun laporan akuntabilitas performa berkala secara transparan dan terstruktur kepada pimpinan.\n• Memfasilitasi komunikasi efektif antar vendor dan pihak pemangku kepentingan proyek.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Implementasi Sistem Otomasi Pelaporan Operasional Terpadu',
            role: 'Project Coordinator',
            tech: 'Google Workspace, Cloud Sheets, Workflow Automation',
            startDate: '2023',
            endDate: '2023',
            description: '• Mengembangkan template pelaporan terpusat yang memangkas waktu konsolidasi data dari berbagai cabang kerja sebesar 40%.\n• Mengurangi potensi kesalahan entri data manual hingga di bawah 1%.',
          },
          {
            id: 'proj-2',
            name: 'Inisiatif Efisiensi Logistik & Manajemen Vendor Pengadaan',
            role: 'Operations Analyst',
            tech: 'ERP System, Supply Chain Analysis',
            startDate: '2022',
            endDate: '2022',
            description: '• Melakukan tinjauan berkala terhadap performa 15+ vendor penyedia perlengkapan operasional.\n• Menghemat biaya pengadaan tahunan unit kerja hingga 12% melalui negosiasi kontrak strategis.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Indonesia',
            degree: 'S1 Sistem Informasi',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.65 / 4.00',
            description: 'Fokus pada Analisis Proses Bisnis, Manajemen Proyek Teknologi Informasi, dan Tata Kelola Data.',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'Certified ScrumMaster (CSM)',
            issuer: 'Scrum Alliance',
            issueDate: '2023',
          },
          {
            id: 'cert-2',
            name: 'Project Management Fundamentals Certification',
            issuer: 'Project Management Institute (PMI)',
            issueDate: '2022',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Himpunan Mahasiswa Bisnis & Teknologi Terapan UI',
            role: 'Kepala Divisi Hubungan Kerjasama Eksternal',
            period: '2021 - 2022',
            description: '• Menjalin kemitraan strategis dengan 10 perusahaan swasta nasional dalam penyelenggaraan career fair mahasiswa.\n• Menggalang dana sponsorship sebesar Rp45.000.000 untuk pendanaan program kerja tahunan.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
      };
  }
}

/**
 * Penyesuaian section & konten awal sesuai tujuan CV (matrix scoring).
 * Setiap profil mendapat section wajibnya terisi contoh realistis, dan
 * section tidak relevan dikosongkan agar tidak mengganggu fokus CV.
 */
function applyPurposePreset(
  base: Partial<CVData>,
  purpose: CvPurpose,
  roleTitle: string,
  userLocation: string
): Partial<CVData> {
  const preset: Partial<CVData> = { ...base };

  const sampleProject = (name: string, desc: string, tech = 'Web, Mobile, Cloud'): ProjectItem => ({
    id: `proj-${Math.random().toString(36).substring(2, 7)}`,
    name,
    role: roleTitle,
    tech,
    startDate: '2023',
    endDate: '2024',
    description: desc,
  });

  switch (purpose) {
    case 'job': {
      // Lamar Kerja Profesional: Ringkasan, Pengalaman Kerja, Keahlian, Pendidikan, Proyek, Sertifikasi
      preset.internships = [];
      preset.organizations = [];
      preset.languages = [];
      preset.courses = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'internship': {
      // Magang / Internship: Fokus Proyek, Organisasi, Pendidikan, Kursus, Keahlian, Pengalaman Magang
      preset.experience = [];
      preset.internships = [
        {
          id: 'int-intern-1',
          company: 'Laboratorium Riset & Inovasi Digital Kampus',
          role: `Asisten Praktikum / Intern ${roleTitle}`,
          period: '2023 - 2024',
          location: userLocation,
          description: '• Membantu pelaksanaan proyek praktikum dan riset terapan bersama tim mahasiswa.\n• Menyusun dokumentasi teknis dan laporan evaluasi kegiatan mingguan secara terstruktur.',
        } as InternshipItem,
      ];
      preset.projects = [
        sampleProject(
          'Sistem Pelacakan Inventaris Gudang Digital',
          '• Merancang dan membangun aplikasi manajemen stok berbasis web bersama tim 4 orang.\n• Meningkatkan efisiensi waktu rekonsiliasi data inventaris sebesar 35% dibandingkan proses manual sebelumnya.',
          'React.js, Node.js, PostgreSQL, Tailwind CSS'
        ),
        sampleProject(
          'Aplikasi Portal Registrasi & Tiket Acara Kampus',
          '• Mengembangkan platform registrasi online mandiri yang memproses 1.200+ pendaftar seminar tahunan tanpa downtime.',
          'Next.js, TypeScript, REST API, Tailwind CSS'
        ),
      ];
      preset.organizations = [
        {
          id: 'org-1',
          role: 'Koordinator Divisi Hubungan Masyarakat & Media',
          name: 'Himpunan Mahasiswa Jurusan / BEM Kampus',
          period: '2022 - 2023',
          description: '• Memimpin kepanitiaan konferensi tahunan yang dihadiri oleh 600+ peserta mahasiswa dan praktisi.\n• Menjalin kemitraan sponsor dengan 8 mitra industri.',
        } as OrganizationItem,
      ];
      preset.courses = [
        {
          id: 'crs-int-1',
          courseName: `Bootcamp Intensif Persiapan Karier ${roleTitle}`,
          institution: 'Program Kampus Merdeka / Studi Independen Bersertifikat',
          year: '2024',
          period: '2024',
          description: '• Menyelesaikan 900 jam pembelajaran terstruktur dan proyek capstone berbasis studi kasus industri nyata.',
        } as CourseItem,
      ];
      preset.certifications = [];
      preset.languages = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'fresh_graduate': {
      // Fresh Graduate: Ringkasan, Proyek, Pendidikan, Sertifikasi, Keahlian, Magang, Organisasi, Kursus
      preset.experience = [];
      preset.internships = [
        {
          id: 'int-fg-1',
          company: 'PT Solusi Teknologi Nusantara',
          role: `${roleTitle} Intern (MSIB Kampus Merdeka)`,
          period: 'Agustus 2023 - Desember 2023',
          location: userLocation,
          description: '• Berkolaborasi dengan tim divisi utama dalam menyelesaikan target proyek kuartalan dengan tingkat ketepatan waktu 98%.\n• Menyusun laporan analisis mingguan dan mempresentasikan rekomendasi perbaikan proses kerja kepada mentor.',
        } as InternshipItem,
      ];
      preset.projects = [
        sampleProject(
          'Sistem Pelacakan Inventaris Gudang Digital',
          '• Merancang dan membangun aplikasi manajemen stok berbasis web bersama tim 4 orang.\n• Meningkatkan efisiensi waktu rekonsiliasi data inventaris sebesar 35% dibandingkan proses manual sebelumnya.\n• Mengimplementasikan automated unit testing dengan tingkat code coverage mencapai 85%.',
          'React.js, Node.js, PostgreSQL, Tailwind CSS'
        ),
        sampleProject(
          'Aplikasi Portal Registrasi & Tiket Acara Kampus',
          '• Mengembangkan platform registrasi online mandiri yang memproses 1.200+ pendaftar seminar tahunan tanpa downtime.\n• Mengintegrasikan payment gateway otomatis dan sistem e-tiket QR Code via email.',
          'Next.js, TypeScript, REST API, Tailwind CSS'
        ),
      ];
      preset.organizations = [
        {
          id: 'org-1',
          role: 'Koordinator Divisi Hubungan Masyarakat & Media',
          name: 'Himpunan Mahasiswa Sistem Informasi (HMSI UI)',
          period: '2022 - 2023',
          description: '• Memimpin kepanitiaan 2 konferensi teknologi nasional yang dihadiri oleh 600+ peserta mahasiswa dan praktisi.\n• Menjalin kemitraan sponsor dengan 8 perusahaan teknologi terkemuka di Indonesia.',
        } as OrganizationItem,
      ];
      preset.certifications = [
        {
          id: 'cert-1',
          name: 'Google Project Management Professional Certificate',
          issuer: 'Google Career Certificates / Coursera',
          issueDate: '2024',
        } as CertificationItem,
        {
          id: 'cert-2',
          name: 'Certified Junior Associate Professional',
          issuer: 'Badan Nasional Sertifikasi Profesi (BNSP)',
          issueDate: '2023',
        } as CertificationItem,
      ];
      preset.courses = [
        {
          id: 'crs-fg-1',
          courseName: `Pelatihan Intensif & Studi Independen ${roleTitle}`,
          institution: 'Akademi Digital & Karier Nasional',
          year: '2023',
          period: '2023',
          description: '• Lulus dengan predikat Best Capstone Project dari 150 peserta lintas universitas.',
        } as CourseItem,
      ];
      preset.languages = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'smk_vokasi': {
      // Lulusan SMK & Vokasi: Ringkasan, Magang/PKL, Sertifikasi BNSP/UKK, Keahlian, Proyek, Pendidikan, Pelatihan
      preset.headline = `${roleTitle} | Lulusan SMK / Vokasi`;
      preset.summary = `Lulusan SMK kompetensi keahlian terkait ${roleTitle} dengan pengalaman Praktik Kerja Lapangan (PKL) industri selama 6 bulan. Memiliki sertifikasi kompetensi kejuruan resmi BNSP, terbiasa mengoperasikan peralatan dan standar kerja industri, disiplin tinggi, serta siap langsung berkontribusi secara produktif.`;
      preset.experience = [];
      preset.internships = [
        {
          id: 'int-pkl-1',
          company: 'PT Mitra Industri Presisi Indonesia',
          role: `Praktik Kerja Lapangan (PKL) - Teknisi ${roleTitle}`,
          period: 'Januari 2023 - Juni 2023',
          location: userLocation,
          description: `• Menjalankan operasional harian sesuai Standard Operating Procedure (SOP) dengan tingkat kepatuhan keselamatan kerja (K3) 100%.\n• Membantu tim teknisi menyelesaikan tugas pemeliharaan dan inspeksi teknis harian tepat waktu.\n• Meraih predikat penilaian PKL Sangat Baik (A) dari pembimbing industri.`,
        } as InternshipItem,
      ];
      preset.education = [
        {
          id: 'edu-smk-1',
          institution: 'SMK Negeri 1 Bidang Keahlian Teknologi & Rekayasa',
          degree: 'SMK (Sekolah Menengah Kejuruan)',
          year: '2020 - 2023',
          location: userLocation,
          description: 'Fokus pada Kompetensi Kejuruan Terapan, Praktik Bengkel/Lab Terstandar Industri, dan Keselamatan Kerja (K3).',
        } as EducationItem,
      ];
      preset.certifications = [
        {
          id: 'cert-bnsp-1',
          name: 'Sertifikat Kompetensi Kejuruan BNSP / LSP-P1',
          issuer: 'Badan Nasional Sertifikasi Profesi (BNSP)',
          issueDate: '2023',
        } as CertificationItem,
        {
          id: 'cert-ukk-1',
          name: 'Sertifikat Uji Kompetensi Keahlian (UKK) - Predikat Sangat Baik',
          issuer: 'Kementerian Pendidikan & Kebudayaan RI / Sekolah',
          issueDate: '2023',
        } as CertificationItem,
      ];
      preset.projects = [
        sampleProject(
          'Proyek Tugas Akhir / Pembuatan Modul Kerja Kejuruan',
          '• Merancang dan merakit prototipe kerja kejuruan sesuai spesifikasi teknis industri.\n• Lolos uji kelayakan fungsional dengan skor akurasi 96% pada sesi evaluasi tim penguji eksternal industri.',
          'Standar Industri, Peralatan Teknis, Prosedur K3'
        ),
      ];
      preset.courses = [
        {
          id: 'crs-smk-1',
          courseName: 'Pelatihan Keselamatan dan Kesehatan Kerja (K3) & Budaya Kerja 5R',
          institution: 'Balai Latihan Kerja (BLK) Industri',
          year: '2023',
          period: '2023',
          description: '• Menguasai prosedur pengoperasian alat kerja sesuai standar mutu dan keselamatan pabrik.',
        } as CourseItem,
      ];
      preset.organizations = [];
      preset.languages = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'healthcare': {
      // Tenaga Kesehatan & Medis: STR, Sertifikasi Klinis, Pendidikan Profesi, Pengalaman RS, Keahlian Medis
      preset.internships = [
        {
          id: 'int-hc-1',
          company: 'RSUP Nasional Dr. Cipto Mangunkusumo (RSCM)',
          role: 'Praktik Klinik & Stase Keperawatan Medikal Bedah',
          period: '2022 - 2023',
          location: userLocation,
          description: '• Menjalani rotasi stase di Bangsal Bedah dan IGD dengan total 600+ jam dinas pelayanan pasien.\n• Melakukan pengkajian klinis, tindakan invasif dasar sesuai kewenangan klinis, dan pencatatan asuhan keperawatan terstandar.',
        } as InternshipItem,
      ];
      preset.certifications = [
        {
          id: 'cert-hc-1',
          name: 'Surat Tanda Registrasi (STR) Tenaga Kesehatan Aktif',
          issuer: 'Konsil Tenaga Kesehatan Indonesia (KTKI) / Kemenkes RI',
          issueDate: '2023',
          credentialId: 'STR-ID-2023-XXXXX',
        } as CertificationItem,
        {
          id: 'cert-hc-2',
          name: 'Basic Trauma Cardiac Life Support (BTCLS)',
          issuer: 'Himpunan Perawat Gawat Darurat dan Bencana Indonesia (HIPGABI)',
          issueDate: '2023',
        } as CertificationItem,
      ];
      preset.courses = [
        {
          id: 'crs-hc-1',
          courseName: 'Pelatihan Pencegahan & Pengendalian Infeksi (PPI) Rumah Sakit',
          institution: 'Komite PPI Rumah Sakit',
          year: '2023',
          period: '2023',
          description: '• Standarisasi universal precautions, kebersihan tangan 5 momen WHO, dan penanganan limbah medis B3.',
        } as CourseItem,
      ];
      preset.organizations = [
        {
          id: 'org-hc-1',
          name: 'Persatuan Perawat Nasional Indonesia (PPNI)',
          role: 'Anggota Aktif Komisariat RS',
          period: '2023 - Sekarang',
          description: '• Berpartisipasi aktif dalam seminar pengembangan keprofesian berkelanjutan (P2KB) dan program pengabdian masyarakat.',
        } as OrganizationItem,
      ];
      preset.volunteers = [
        {
          id: 'vol-hc-1',
          role: 'Relawan Medis Tim Skrining Kesehatan Masyarakat',
          organization: 'Bakti Sosial Kesehatan Komunitas',
          location: userLocation,
          startYear: '2023',
          endYear: '2023',
          description: '• Melakukan pemeriksaan tanda-tanda vital dan penyuluhan hipertensi bagi 250+ warga lansia.',
        } as VolunteerItem,
      ];
      preset.references = [
        {
          id: 'ref-hc-1',
          fullName: 'Dr. dr. Hendra Wijaya, Sp.PD, K-GEH',
          title: 'Kepala Instalasi Rawat Inap & Dokter Penanggung Jawab Pasien (DPJP)',
          company: 'RSUP Nasional Dr. Cipto Mangunkusumo',
          email: 'hendra.wijaya@rscm.co.id',
          phone: '+62 811-9876-5432',
        } as ReferenceItem,
      ];
      preset.projects = [];
      preset.scholarships = [];
      preset.portfolioLinks = [];
      break;
    }

    case 'freelance':
    case 'startup_founder': {
      // Proyek + portofolio + referensi klien adalah inti; pengalaman komersial terbukti
      preset.projects = [
        sampleProject(
          purpose === 'freelance' ? 'Platform E-Commerce & Retail Point of Sale' : 'Produk Finansial & POS Retail Terintegrasi',
          '• Masalah: alur pembukuan dan penjualan toko ritel mitra masih manual dan lambat.\n• Solusi: merancang dan membangun platform kasir & toko online end-to-end terintegrasi katalog 2.000+ produk.\n• Hasil: meningkatkan tingkat konversi checkout sebesar 22% dan mempercepat proses transaksi harian 40%.',
          'Next.js, PostgreSQL, Midtrans Gateway, Tailwind CSS'
        ),
        sampleProject(
          'Aplikasi Manajemen Reservasi Layanan Kreatif',
          '• Mengembangkan aplikasi pemesanan jadwal berbasis web yang aktif digunakan oleh 300+ klien per bulan.\n• Mengurangi waktu koordinasi jadwal manual sebesar 50% via sinkronisasi otomatis Google Calendar API.',
          'React Native, Node.js, Express, Firebase'
        ),
      ];
      preset.portfolioLinks = [
        { id: 'plink-1', label: 'Portofolio Digital', url: 'https://alexanderpratama.dev' },
        { id: 'plink-2', label: 'GitHub Repositori', url: 'https://github.com/alexanderpratama' },
      ] as PortfolioLinkItem[];
      preset.references = [
        {
          id: 'ref-freelance-1',
          fullName: 'Budi Santoso, S.T.',
          title: 'Chief Technology Officer',
          company: 'PT Digital Niaga Mandiri',
          email: 'budi.santoso@digitalniaga.id',
          phone: '+62 811-9876-5432',
        } as ReferenceItem,
      ] as ReferenceItem[];
      preset.internships = [];
      preset.organizations = purpose === 'startup_founder' ? preset.organizations : [];
      preset.education = [];
      preset.certifications = purpose === 'freelance' ? preset.certifications : [];
      preset.languages = [];
      preset.courses = [];
      preset.scholarships = [];
      preset.volunteers = [];
      break;
    }

    case 'remote': {
      // Remote Job: Ringkasan, Pengalaman Kerja, Keahlian, Proyek, Bahasa Asing, Pendidikan
      preset.languages = [
        { id: 'lang-rem-1', language: 'Bahasa Indonesia', level: 'Native' },
        { id: 'lang-rem-2', language: 'English (Async & Written Communication)', level: 'Professional' },
      ] as LanguageItem[];
      preset.internships = [];
      preset.organizations = [];
      preset.certifications = [];
      preset.courses = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'promotion': {
      // Promosi Internal: Ringkasan, Pengalaman Kerja, Keahlian, Proyek Strategis, Organisasi/Komite, Pendidikan, Sertifikasi
      preset.internships = [];
      preset.languages = [];
      preset.courses = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'executive': {
      // Fokus pencapaian besar + kepemimpinan strategis + referensi eksekutif
      preset.awards = [
        { id: 'awd-exec-1', name: 'Best Operational Leadership Award', issuer: 'Indonesia Business Transformation Council', date: '2024', description: 'Atas pencapaian memimpin restrukturisasi alur operasional lintas divisi yang meningkatkan efisiensi 25%.' } as AwardItem,
        { id: 'awd-exec-2', name: 'Top 10 Emerging Business Leaders', issuer: 'Asosiasi Manajemen Indonesia (AMA)', date: '2023', description: 'Apresiasi kepemimpinan dalam program transformasi proses bisnis tingkat korporasi.' } as AwardItem,
      ];
      preset.summary = `Pemimpin ${roleTitle} dengan rekam jejak strategi tingkat organisasi: memimpin tim lintas divisi 50+ orang, mengelola anggaran operasional multi-miliar, dan menghasilkan pertumbuhan kinerja terukur. Berfokus pada transformasi proses, pembangunan kapabilitas tim, dan hasil bisnis jangka panjang.`;
      preset.references = [
        {
          id: 'ref-exec-1',
          fullName: 'Ir. Hendra Wijaya, M.B.A.',
          title: 'Managing Director',
          company: 'PT Korporasi Nusantara Group',
          email: 'hendra.wijaya@nusantaragroup.co.id',
          phone: '+62 811-2233-4455',
        } as ReferenceItem,
      ];
      preset.internships = [];
      preset.projects = [];
      preset.certifications = [];
      preset.languages = [];
      preset.courses = [];
      preset.scholarships = [];
      preset.volunteers = [];
      break;
    }

    case 'volunteer_ngo': {
      // Volunteer adalah inti CV; pengalaman dampak sosial nyata + organisasi + keahlian + referensi + pendidikan
      preset.volunteers = [
        {
          id: 'vol-1',
          role: 'Koordinator Program Pemberdayaan Komunitas',
          organization: 'Wahana Lingkungan & Edukasi Hijau Nusantara',
          location: userLocation,
          startYear: '2022',
          endYear: 'Sekarang',
          isCurrent: true,
          description: '• Memimpin program literasi digital dan lingkungan yang memberdayakan 500+ pemuda desa binaan.\n• Mengkoordinasikan 30 relawan aktif dan menjalin kemitraan dengan 5 lembaga donor nirlaba.\n• Mengelola alokasi dana program senilai Rp75.000.000 secara transparan dan akuntabel.',
        } as VolunteerItem,
        {
          id: 'vol-2',
          role: 'Fasilitator Kelas Belajar Anak Pesisir',
          organization: 'Komunitas Lentera Anak Nusantara',
          location: userLocation,
          startYear: '2021',
          endYear: '2022',
          description: '• Mengajar membaca, menulis, dan dasar teknologi untuk 60+ anak di kawasan pesisir.\n• Menghimpun 1.000+ buku donasi untuk pendirian perpustakaan ramah anak.',
        } as VolunteerItem,
      ];
      preset.organizations = [
        {
          id: 'org-soc-1',
          role: 'Pengurus Divisi Komunikasi Strategis',
          name: 'Komunitas Generasi Peduli Indonesia',
          period: '2021 - Sekarang',
          description: '• Menginisiasi kampanye advokasi publik melalui media sosial dengan jangkauan 40.000+ audiens muda.',
        } as OrganizationItem,
      ];
      preset.references = [
        {
          id: 'ref-ngo-1',
          fullName: 'Dra. Ratna Kusuma, M.Si.',
          title: 'Direktur Eksekutif Program',
          company: 'Yayasan Edukasi Hijau Nusantara',
          email: 'ratna.kusuma@edukasihijau.org',
          phone: '+62 812-8899-7766',
        } as ReferenceItem,
      ];
      preset.summary = `Aktivis sosial dan relawan berdedikasi dengan pengalaman memimpin program pemberdayaan masyarakat, mengelola tim relawan, dan menghasilkan dampak sosial terukur. Berkomitmen pada keberlanjutan program dan kolaborasi lintas lembaga nirlaba.`;
      preset.experience = [];
      preset.internships = [];
      preset.projects = [];
      preset.certifications = [];
      preset.languages = [];
      preset.courses = [];
      preset.scholarships = [];
      break;
    }

    case 'government': {
      // Administratif lengkap: pendidikan formal + pengalaman + sertifikasi resmi + organisasi + pelatihan + keahlian
      preset.education = [
        {
          id: 'edu-gov-1',
          institution: 'Universitas Indonesia',
          degree: 'S1 Ilmu Administrasi Negara',
          year: '2019 - 2023',
          location: userLocation,
          gpa: 'IPK: 3.65 / 4.00',
          description: 'Fokus pada Kebijakan Publik, Tata Kelola Pemerintahan yang Baik (Good Governance), dan Manajemen Pelayanan Publik.',
        } as EducationItem,
      ];
      preset.certifications = [
        { id: 'cert-gov-1', name: 'TOEFL ITP (Skor: 580)', issuer: 'Indonesian International Education Foundation (IIEF)', issueDate: '2024' } as CertificationItem,
        { id: 'cert-gov-2', name: 'Sertifikasi Tingkat Dasar Pengadaan Barang dan Jasa Pemerintah (PBJP)', issuer: 'Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP)', issueDate: '2024' } as CertificationItem,
      ];
      preset.courses = [
        {
          id: 'crs-gov-1',
          courseName: 'Pelatihan Tata Naskah Dinas & Kearsipan Elektronik Instansi',
          institution: 'Pusat Pendidikan dan Pelatihan Administrasi Publik',
          year: '2023',
          period: '2023',
          description: '• Mempelajari standar penyusunan dokumen resmi, pengelolaan arsip digital, dan pelayanan prima.',
        } as CourseItem,
      ];
      preset.internships = [];
      preset.projects = [];
      preset.languages = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'academic_scholarship': {
      // Beasiswa & Akademik: Ringkasan, Pendidikan, Beasiswa, Proyek Riset/Publikasi, Referensi Akademik, Organisasi, Bahasa
      preset.publications = [
        {
          id: 'pub-1',
          title: 'Analisis Efisiensi Tata Kelola Sistem Informasi pada Layanan Publik Berbasis Web',
          publisher: 'Jurnal Sistem Informasi & Manajemen Indonesia (SINTA 2)',
          authors: 'Alexander Pratama, S.Kom., Dr. Ir. Haryanto, M.Kom.',
          date: '2024',
          link: 'https://doi.org/10.xxxx/jsimi.2024.01',
          description: 'Penelitian skripsi mengenai optimalisasi antarmuka dan latensi arsitektur aplikasi pelayanan publik.',
        } as PublicationItem,
      ];
      preset.awards = [
        { id: 'awd-aca-1', name: 'Juara 1 Lomba Karya Tulis Ilmiah Nasional Bidang Rekayasa Teknologi', issuer: 'Kementerian Riset, Teknologi, dan Pendidikan Tinggi', date: '2023', description: '' } as AwardItem,
      ];
      preset.scholarships = [
        { id: 'sch-1', name: 'Beasiswa Unggulan Prestasi Akademik Nasional', provider: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', year: '2021 - 2023', period: '2021 - 2023', description: 'Diberikan penuh untuk mahasiswa berprestasi dengan IPK di atas 3.75 selama masa studi.' } as ScholarshipItem,
      ];
      preset.projects = [
        sampleProject(
          'Riset & Publikasi Ilmiah: Optimalisasi Layanan Publik Berbasis Web',
          '• Melakukan studi kuantitatif terhadap 450 responden pengguna layanan publik digital.\n• Dipublikasikan pada Jurnal Terakreditasi Nasional SINTA 2.',
          'Metodologi Riset Kuantitatif, SPSS, Analisis Sistem'
        ),
      ];
      preset.references = [
        {
          id: 'ref-aca-1',
          fullName: 'Prof. Dr. Ir. Haryanto, M.Kom.',
          title: 'Guru Besar & Dosen Pembimbing Utama',
          company: 'Fakultas Ilmu Komputer, Universitas Indonesia',
          email: 'haryanto.prof@cs.ui.ac.id',
          phone: '+62 811-1010-2020',
        } as ReferenceItem,
      ];
      preset.languages = [
        { id: 'lang-aca-1', language: 'Bahasa Indonesia', level: 'Native' },
        { id: 'lang-aca-2', language: 'English (IELTS Overall 7.5)', level: 'Fluent' },
      ] as LanguageItem[];
      preset.summary = `${base.summary || ''}`.trim() || `Calon penerima beasiswa dengan rekam jejak akademik kuat (IPK 3.7+), pengalaman riset, dan publikasi ilmiah. Berkomitmen mengembangkan keilmuan dan memberikan kontribusi bagi masyarakat.`;
      preset.experience = [];
      preset.internships = [];
      preset.certifications = [];
      preset.courses = [];
      preset.volunteers = [];
      preset.skills = [];
      preset.skillsList = [];
      break;
    }

    case 'career_break': {
      // Bukti skill tetap ter-update selama jeda: pelatihan + pengalaman + proyek mandiri + relawan + sertifikasi + keahlian + pendidikan
      preset.courses = [
        { id: 'crs-cb-1', courseName: 'Kursus Online Upskilling (Bidang Keahlian Terkini)', institution: 'Platform Pembelajaran Online Terakreditasi', year: '2024', period: '2024', description: 'Menyegarkan dan memperbarui keterampilan teknis serta tren metodologi kerja terkini selama masa jeda karier.' } as CourseItem,
      ];
      preset.volunteers = [
        {
          id: 'vol-cb-1',
          role: 'Mentor Sukarela Kelas Persiapan Karier',
          organization: 'Komunitas Belajar Profesional Muda',
          location: userLocation,
          startYear: '2023',
          endYear: '2024',
          description: '• Membimbing 30+ peserta dalam sesi diskusi studi kasus praktis selama masa jeda karier.',
        } as VolunteerItem,
      ];
      preset.otherRelevant = [
        { id: 'orel-cb-1', title: 'Freelance / Proyek Mandiri Selama Jeda', period: '2023 - 2024', description: '• Tetap aktif mengerjakan proyek kecil untuk menjaga kemampuan tetap tajam.\n• Mengelola waktu belajar mandiri dan komunitas profesional.' } as OtherRelevantItem,
      ];
      preset.summary = `Profesional ${roleTitle} yang kembali ke dunia kerja setelah jeda karier dengan keterampilan yang tetap ter-update melalui kursus, sertifikasi, dan proyek mandiri. Siap berkontribusi kembali secara full-time dengan energi dan perspektif yang lebih matang.`;
      preset.internships = [];
      preset.organizations = [];
      preset.languages = [];
      preset.scholarships = [];
      preset.references = [];
      break;
    }

    case 'overseas': {
      // Kerja di Luar Negeri: Ringkasan, Pengalaman Kerja, Bahasa Asing, Pendidikan, Keahlian, Sertifikasi, Referensi
      preset.languages = [
        { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
        { id: 'lang-2', language: 'English (Business & Technical)', level: 'Fluent' },
        { id: 'lang-3', language: 'Japanese (JLPT N3)', level: 'Conversational' },
      ] as LanguageItem[];
      preset.references = [
        {
          id: 'ref-ovs-1',
          fullName: 'Michael Tan, MBA',
          title: 'Regional Engineering Director',
          company: 'Asia Pacific Tech Hub',
          email: 'michael.tan@apactech.sg',
          phone: '+65 9123-4567',
        } as ReferenceItem,
      ];
      preset.internships = [];
      preset.projects = [];
      preset.organizations = [];
      preset.courses = [];
      preset.scholarships = [];
      preset.volunteers = [];
      break;
    }

    case 'career_switch': {
      // Pindah Jalur Karier: Ringkasan, Proyek Portofolio, Keahlian, Pengalaman Kerja, Organisasi, Pendidikan, Sertifikasi, Kursus/Bootcamp
      preset.courses = [
        {
          id: 'crs-cs-1',
          courseName: `Full-Stack Intensive Bootcamp: ${roleTitle}`,
          institution: 'Lembaga Pelatihan Industri Bersertifikat',
          year: '2024',
          period: '2024',
          description: '• Menyelesaikan 500+ jam pelatihan praktik intensif dan 4 proyek portofolio nyata untuk transisi karier.',
        } as CourseItem,
      ];
      preset.otherRelevant = [
        { id: 'orel-cs-1', title: `Transisi Karier ke ${roleTitle}`, period: '2024 - Sekarang', description: '• Memetakan keahlian dari bidang sebelumnya ke bidang tujuan.\n• Mengerjakan proyek nyata di bidang baru untuk membangun portofolio transisi.' } as OtherRelevantItem,
      ];
      preset.internships = [];
      preset.languages = [];
      preset.scholarships = [];
      preset.volunteers = [];
      preset.references = [];
      break;
    }

    case 'general':
    default: {
      // Master CV: semua section lengkap terisi
      preset.internships = [
        {
          id: 'int-gen-1',
          company: 'PT Inovasi Talenta Indonesia',
          role: `${roleTitle} Intern`,
          period: '2021 - 2022',
          location: userLocation,
          description: '• Mendukung operasional harian tim dan menyelesaikan proyek inisiatif divisi tepat waktu.',
        } as InternshipItem,
      ];
      preset.courses = [
        {
          id: 'crs-gen-1',
          courseName: `Pelatihan Profesional Lanjutan ${roleTitle}`,
          institution: 'Lembaga Pengembangan Manajemen Indonesia',
          year: '2023',
          period: '2023',
          description: '• Pendalaman metodologi kerja modern dan studi kasus pemecahan masalah industri.',
        } as CourseItem,
      ];
      preset.scholarships = [
        {
          id: 'sch-gen-1',
          name: 'Beasiswa Prestasi Akademik Kampus',
          provider: 'Universitas Indonesia',
          year: '2020',
          period: '2020',
          description: 'Apresiasi capaian indeks prestasi semester terbaik tingkat fakultas.',
        } as ScholarshipItem,
      ];
      preset.volunteers = [
        {
          id: 'vol-gen-1',
          role: 'Relawan Pengajar Literasi Digital',
          organization: 'Komunitas Muda Berdaya',
          location: userLocation,
          startYear: '2022',
          endYear: '2023',
          description: '• Mengedukasi masyarakat sekitar mengenai pemanfaatan perangkat produktivitas digital.',
        } as VolunteerItem,
      ];
      preset.references = [
        {
          id: 'ref-gen-1',
          fullName: 'Budi Santoso, M.M.',
          title: 'Head of Department',
          company: 'PT Nusantara Mandiri',
          email: 'budi.santoso@nusantaramandiri.id',
          phone: '+62 812-3344-5566',
        } as ReferenceItem,
      ];
      if (!preset.publications) preset.publications = [];
      if (!preset.awards) preset.awards = [];
      if (!preset.portfolioLinks) preset.portfolioLinks = [];
      if (!preset.otherRelevant) preset.otherRelevant = [];
      break;
    }
  }

  // Bersihkan semua karakter bullet (•, ▪, -, dll.) agar tidak terjadi double bullet
  const cleanPresetDesc = (item: any) => {
    if (item && typeof item.description === 'string') {
      item.description = cleanBulletText(item.description);
    }
  };

  if (Array.isArray(preset.experience)) preset.experience.forEach(cleanPresetDesc);
  if (Array.isArray(preset.projects)) preset.projects.forEach(cleanPresetDesc);
  if (Array.isArray(preset.organizations)) preset.organizations.forEach(cleanPresetDesc);
  if (Array.isArray(preset.internships)) preset.internships.forEach(cleanPresetDesc);
  if (Array.isArray(preset.courses)) preset.courses.forEach(cleanPresetDesc);
  if (Array.isArray(preset.volunteers)) preset.volunteers.forEach(cleanPresetDesc);
  if (Array.isArray(preset.otherRelevant)) preset.otherRelevant.forEach(cleanPresetDesc);

  return preset;
}

/**
 * Menghasilkan kerangka CV kosongan ("Mulai dari Lembar Bersih") yang mengikuti
 * PERSIS daftar section aktif dan urutan section (`sectionOrder`) dari "Mulai dengan Contoh"
 * berdasarkan Tujuan CV (`purpose`) yang dipilih di awal.
 */
export function generateEmptyCvPreset(options: StarterPresetOptions): Partial<CVData> {
  const {
    purpose,
    targetRole = '',
    userName = 'Nama Lengkap Kamu',
    userEmail = 'email@kamu.com',
    userPhone = '+62 812-xxxx-xxxx',
    userLocation = 'Jakarta, Indonesia',
  } = options;

  const examplePreset = generateStarterCvPreset(options);
  const roleTitle = targetRole.trim() || examplePreset.headline || 'Professional';

  const hasExp = Array.isArray(examplePreset.experience) && examplePreset.experience.length > 0;
  const hasIntern = Array.isArray(examplePreset.internships) && examplePreset.internships.length > 0;
  const hasProj = Array.isArray(examplePreset.projects) && examplePreset.projects.length > 0;
  const hasOrg = Array.isArray(examplePreset.organizations) && examplePreset.organizations.length > 0;
  const hasEdu = Array.isArray(examplePreset.education) && examplePreset.education.length > 0;
  const hasCert = Array.isArray(examplePreset.certifications) && examplePreset.certifications.length > 0;
  const hasSkills = Array.isArray(examplePreset.skills) && examplePreset.skills.length > 0;
  const hasLang = Array.isArray(examplePreset.languages) && examplePreset.languages.length > 0;
  const hasCourse = Array.isArray(examplePreset.courses) && examplePreset.courses.length > 0;
  const hasSch = Array.isArray(examplePreset.scholarships) && examplePreset.scholarships.length > 0;
  const hasVol = Array.isArray(examplePreset.volunteers) && examplePreset.volunteers.length > 0;
  const hasRef = Array.isArray(examplePreset.references) && examplePreset.references.length > 0;

  return {
    purpose,
    sectionOrder: examplePreset.sectionOrder || getSectionOrderForPurpose(purpose),
    firstName: examplePreset.firstName || userName.split(' ')[0] || 'Nama',
    lastName: examplePreset.lastName || userName.split(' ').slice(1).join(' ') || '',
    fullName: userName,
    headline: roleTitle,
    targetRole: roleTitle,
    email: userEmail,
    phone: userPhone,
    location: userLocation,
    city: examplePreset.city || userLocation.split(',')[0]?.trim() || 'Jakarta',
    province: examplePreset.province || 'DKI Jakarta',
    country: 'Indonesia',
    linkedin: '',
    website: '',
    github: '',
    photoUrl: '',
    showPhoto: false,
    summary: examplePreset.summary
      ? `Tuliskan ringkasan profil profesional, keahlian utama, dan tujuan karier kamu sebagai ${roleTitle} di bagian ini.`
      : '',
    skills: hasSkills ? ['Keahlian Inti 1', 'Keahlian Teknis 2', 'Perangkat / Tools'] : [],
    skillsList: hasSkills
      ? ([
          { id: 'sk-empty-1', name: 'Keahlian Inti 1', level: 'Advanced' },
          { id: 'sk-empty-2', name: 'Keahlian Teknis 2', level: 'Intermediate' },
          { id: 'sk-empty-3', name: 'Perangkat / Tools', level: 'Intermediate' },
        ] as SkillItem[])
      : [],
    experience: hasExp
      ? [
          {
            id: 'exp-empty-1',
            company: 'Nama Perusahaan / Instansi',
            role: roleTitle,
            period: 'Tahun Mulai - Sekarang',
            location: userLocation,
            description: 'Tuliskan tanggung jawab utama dan pencapaian terukur kamu pada posisi ini.',
          },
        ]
      : [],
    internships: hasIntern
      ? [
          {
            id: 'int-empty-1',
            company: 'Nama Perusahaan / Tempat Magang (PKL)',
            role: `${roleTitle} Intern`,
            period: 'Bulan Tahun - Bulan Tahun',
            location: userLocation,
            description: 'Tuliskan kegiatan praktik kerja atau kontribusi nyata selama program magang / PKL.',
          } as InternshipItem,
        ]
      : [],
    projects: hasProj
      ? [
          {
            id: 'proj-empty-1',
            name: 'Nama Proyek / Portofolio Unggulan',
            role: roleTitle,
            tech: 'Teknologi / Metode / Tools',
            period: 'Tahun',
            startDate: '',
            endDate: '',
            description: 'Jelaskan masalah yang diselesaikan, peran kamu, dan hasil terukur dari proyek ini.',
          } as ProjectItem,
        ]
      : [],
    organizations: hasOrg
      ? [
          {
            id: 'org-empty-1',
            name: 'Nama Organisasi / Himpunan / Komunitas',
            role: 'Jabatan / Pengurus Divisi',
            period: 'Tahun Mulai - Tahun Selesai',
            description: 'Tuliskan program kerja utama yang kamu pimpin dan dampaknya bagi organisasi.',
          } as OrganizationItem,
        ]
      : [],
    education: hasEdu
      ? [
          {
            id: 'edu-empty-1',
            institution: purpose === 'smk_vokasi' ? 'Nama SMK / Institusi Vokasi' : 'Nama Universitas / Perguruan Tinggi',
            degree: purpose === 'smk_vokasi' ? 'Kompetensi Keahlian / Jurusan' : 'Gelar & Program Studi',
            year: 'Tahun Masuk - Tahun Lulus',
            location: userLocation,
            gpa: '',
            description: '',
          } as EducationItem,
        ]
      : [],
    certifications: hasCert
      ? [
          {
            id: 'cert-empty-1',
            name: 'Nama Sertifikasi / Lisensi Kompetensi',
            issuer: 'Lembaga Penerbit Sertifikat',
            issueDate: 'Tahun',
          } as CertificationItem,
        ]
      : [],
    languages: hasLang
      ? [
          { id: 'lang-empty-1', language: 'Bahasa Indonesia', level: 'Native' } as LanguageItem,
          { id: 'lang-empty-2', language: 'Bahasa Inggris / Bahasa Asing', level: 'Professional' } as LanguageItem,
        ]
      : [],
    courses: hasCourse
      ? [
          {
            id: 'crs-empty-1',
            courseName: 'Nama Kursus / Pelatihan / Bootcamp',
            institution: 'Lembaga Penyelenggara Pelatihan',
            year: 'Tahun',
            period: 'Tahun',
            description: 'Tuliskan kompetensi teknis atau materi utama yang dipelajari dalam pelatihan ini.',
          } as CourseItem,
        ]
      : [],
    scholarships: hasSch
      ? [
          {
            id: 'sch-empty-1',
            name: 'Nama Beasiswa / Penghargaan Akademik',
            provider: 'Instansi / Lembaga Pemberi Beasiswa',
            year: 'Tahun',
            period: 'Tahun',
            description: 'Tuliskan pencapaian atau kriteria seleksi beasiswa yang berhasil diraih.',
          } as ScholarshipItem,
        ]
      : [],
    volunteers: hasVol
      ? [
          {
            id: 'vol-empty-1',
            role: 'Peran Relawan / Koordinator Program',
            organization: 'Nama Organisasi Sosial / NGO',
            location: userLocation,
            startYear: 'Tahun Mulai',
            endYear: 'Tahun Selesai',
            description: 'Tuliskan kegiatan pengabdian masyarakat dan dampak sosial yang dihasilkan.',
          } as VolunteerItem,
        ]
      : [],
    references: hasRef
      ? [
          {
            id: 'ref-empty-1',
            fullName: 'Nama Lengkap Pemberi Referensi',
            title: 'Jabatan / Posisi',
            company: 'Nama Perusahaan / Institusi',
            email: 'email.referensi@instansi.com',
            phone: '+62 812-xxxx-xxxx',
          } as ReferenceItem,
        ]
      : [],
  };
}

function getDefaultRoleTitle(category: string, purpose: CvPurpose): string {
  if (purpose === 'internship') {
    switch (category) {
      case 'tech': return 'Software Engineer Intern';
      case 'admin': return 'Staf Administrasi Intern';
      case 'marketing': return 'Marketing Intern';
      case 'creative': return 'UI/UX Design Intern';
      case 'hospitality': return 'F&B Service Crew';
      case 'healthcare': return 'Perawat / Asisten Medis Intern';
      default: return 'Management Trainee Intern';
    }
  }
  switch (category) {
    case 'tech': return 'Software Engineer';
    case 'admin': return 'Staf Administrasi & Operasional';
    case 'marketing': return 'Marketing Specialist';
    case 'creative': return 'UI/UX Designer';
    case 'hospitality': return 'Barista & Service Crew';
    case 'education': return 'Guru / Pendidik';
    case 'healthcare': return 'Perawat Klinis / Tenaga Medis';
    default: return 'Project Associate / Staf';
  }
}
