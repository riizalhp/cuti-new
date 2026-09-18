import { CvPurpose } from './cv-purpose-scoring-engine';
import { CVData, ProjectItem, OrganizationItem, EducationItem, CertificationItem, CourseItem, ScholarshipItem, VolunteerItem, ReferenceItem, LanguageItem, PublicationItem, AwardItem, PortfolioLinkItem, OtherRelevantItem } from '@/components/CVView';

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
  let category: 'tech' | 'admin' | 'marketing' | 'creative' | 'hospitality' | 'education' | 'general' = 'general';

  if (/(developer|engineer|software|frontend|backend|fullstack|web|mobile|android|ios|programmer|devops|it|qa|tester|data|machine learning|ai|sistem)/i.test(roleLower)) {
    category = 'tech';
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
  return applyPurposePreset(basePreset, purpose, roleTitle, resolvedUserLocation);
}

type PresetContext = {
  userName: string;
  userEmail: string;
  userPhone: string;
  userLocation: string;
};

function buildCategoryPreset(
  category: 'tech' | 'admin' | 'marketing' | 'creative' | 'hospitality' | 'education' | 'general',
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
          : `Profesional ${roleTitle} berdedikasi dalam membangun arsitektur perangkat lunak yang scalable, efisien, dan ramah pengguna. Berpengalaman dalam metodologi Agile dan otomatisasi proses pengembangan.`,
        skills: ['TypeScript', 'React.js', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Git & GitHub', 'RESTful API', 'Agile / Scrum', 'Problem Solving'],
        experience: [
          {
            id: 'exp-1',
            company: 'PT GoTo Gojek Tokopedia Tbk',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengembangkan dan mengoptimalkan fitur platform utama, meningkatkan kecepatan response time hingga 40%.\n• Berkolaborasi dalam tim lintas divisi untuk merilis 12+ fitur baru sesuai timeline sprint.\n• Menerapkan best practices Clean Architecture dan code review rutin untuk meminimalisir bug hingga 25%.',
          },
          {
            id: 'exp-2',
            company: 'PT Midtrans Digital Kreasi',
            role: 'Junior Software Engineer',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Membangun antarmuka responsif dan integrasi API untuk 5+ modul aplikasi web pengguna aktif.\n• Memperbaiki 50+ issue teknis dan meningkatkan stabilitas sistem secara konsisten.',
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
          : `Tenaga profesional ${roleTitle} yang teliti, terorganisir, dan handal dalam pengelolaan dokumen, korespondensi bisnis, serta efisiensi alur operasional kantor. Terbiasa menangani data bervolume tinggi dengan tingkat akurasi 99%.`,
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
            description: '• Memproses entri data transaksi harian dan menyusun laporan operasional mingguan untuk pimpinan unit.\n• Melayani pertanyaan administratif dari 20+ klien per hari dengan standar kepuasan tinggi.',
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
            description: '• Melakukan riset pasar kompetitor dan mengkoordinasikan program promosi musiman bersama 15+ mitra bisnis.\n• Mengelola akun media sosial perusahaan hingga mencapai pertumbuhan 15.000+ followers organik.',
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
            description: '• Memproduksi 100+ aset visual promosi media sosial, banner cetak, dan presentasi klien korporat.\n• Berkolaborasi dengan tim marketing untuk menjaga konsistensi brand guidelines pada seluruh materi kampanye.',
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
      };

    case 'hospitality':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: `Tenaga ${roleTitle} yang ramah, berorientasi pada kepuasan pelanggan, dan disiplin dalam standar kebersihan serta kecepatan layanan. Terbiasa bekerja dalam ritme dinamis dan jam sibuk.`,
        skills: ['Customer Service Prima', 'Point of Sales (POS)', 'Cash Handling & Kasir', 'Food & Beverage Preparation', 'Manajemen Stok / Inventory', 'Komunikasi Ramah', 'Kebersihan & Sanitasi (HACCP)', 'Kerjasama Tim'],
        experience: [
          {
            id: 'exp-1',
            company: 'Hotel Indonesia Kempinski Jakarta',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Melayani 150+ pesanan pelanggan per hari dengan standar keramahan tinggi dan akurasi pesanan 99%.\n• Mengoperasikan mesin espresso, menjaga standar kalibrasi rasa harian, dan mengelola stok bahan baku.\n• Memastikan kebersihan area kerja dan kasir sesuai SOP sanitasi baku.',
          },
          {
            id: 'exp-2',
            company: 'Kopi Kenangan Senopati',
            role: 'Barista & Shift Leader',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memproses transaksi pembayaran tunai & non-tunai dengan tepat tanpa selisih kas.\n• Memberikan rekomendasi menu favorit kepada pelanggan, mendukung kenaikan penjualan rata-rata per transaksi.',
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
      };

    case 'education':
      return {
        fullName: userName,
        headline: roleTitle,
        email: userEmail,
        phone: userPhone,
        location: userLocation,
        summary: `Pendidik / ${roleTitle} berdedikasi dengan pendekatan pengajaran yang interaktif, komunikatif, dan memotivasi. Mampu merancang kurikulum materi pembelajaran yang adaptif sesuai kebutuhan belajar siswa.`,
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
            description: '• Memandu 120+ siswa mempersiapkan ujian seleksi masuk perguruan tinggi dengan tingkat kelulusan 88%.\n• Mengembangkan bank soal kontekstual dan strategi pemecahan masalah cepat.',
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
            description: 'Pendidikan Profesi Guru & Psikologi Pendidikan Anak.',
          },
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
          : `Profesional ${roleTitle} yang berdedikasi, adaptif, dan memiliki kemampuan komunikasi serta pemecahan masalah yang baik. Siap memberikan kontribusi optimal untuk pertumbuhan organisasi.`,
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
            description: '• Mengkoordinasikan pelaksanaan program kerja operasional yang melibatkan 100+ staf aktif.\n• Menyusun laporan akuntabilitas performa berkala secara transparan dan terstruktur kepada pimpinan.',
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

  const sampleProject = (name: string, desc: string): ProjectItem => ({
    id: 'proj-1',
    name,
    role: roleTitle,
    startDate: '2024',
    description: desc,
  });

  switch (purpose) {
    case 'internship':
    case 'fresh_graduate': {
      // Pengalaman kerja formal minim; fokus proyek + organisasi + pendidikan
      preset.experience = [];
      preset.projects = [
        sampleProject(
          'Sistem Pelacakan Inventaris Gudang Digital',
          '• Merancang dan membangun aplikasi manajemen stok berbasis web bersama tim 4 orang.\n• Meningkatkan efisiensi waktu rekonsiliasi data inventaris sebesar 35% dibandingkan proses manual sebelumnya.\n• Mengimplementasikan automated unit testing dengan tingkat code coverage mencapai 85%.'
        ),
        sampleProject(
          'Aplikasi Portal Registrasi & Tiket Acara Kampus',
          '• Mengembangkan platform registrasi online mandiri yang memproses 1.200+ pendaftar seminar tahunan tanpa downtime.\n• Mengintegrasikan payment gateway otomatis dan sistem e-tiket QR Code via email.'
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
      ];
      break;
    }

    case 'freelance':
    case 'startup_founder': {
      // Proyek + portofolio + tautan adalah inti; pengalaman formal diringkas
      preset.projects = [
        sampleProject(
          purpose === 'freelance' ? 'Platform E-Commerce & Retail Point of Sale' : 'Produk Finansial & POS Retail Terintegrasi',
          '• Masalah: alur pembukuan dan penjualan toko ritel mitra masih manual dan lambat.\n• Solusi: merancang dan membangun platform kasir & toko online end-to-end terintegrasi katalog 2.000+ produk.\n• Hasil: meningkatkan tingkat konversi checkout sebesar 22% dan mempercepat proses transaksi harian 40%.'
        ),
        sampleProject(
          'Aplikasi Manajemen Reservasi Layanan Kreatif',
          '• Mengembangkan aplikasi pemesanan jadwal berbasis web yang aktif digunakan oleh 300+ klien per bulan.\n• Mengurangi waktu koordinasi jadwal manual sebesar 50% via sinkronisasi otomatis Google Calendar API.'
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
      break;
    }

    case 'executive': {
      // Fokus pencapaian besar + penghargaan; detail teknis dikurangi
      preset.awards = [
        { id: 'awd-exec-1', name: 'Best Operational Leadership Award', issuer: 'Indonesia Business Transformation Council', date: '2024', description: 'Atas pencapaian memimpin restrukturisasi alur operasional lintas divisi yang meningkatkan efisiensi 25%.' } as AwardItem,
        { id: 'awd-exec-2', name: 'Top 10 Emerging Business Leaders', issuer: 'Asosiasi Manajemen Indonesia (AMA)', date: '2023', description: 'Apresiasi kepemimpinan dalam program transformasi proses bisnis tingkat korporasi.' } as AwardItem,
      ];
      preset.summary = `Pemimpin ${roleTitle} dengan rekam jejak strategi tingkat organisasi: memimpin tim lintas divisi 50+ orang, mengelola anggaran operasional multi-miliar, dan menghasilkan pertumbuhan kinerja terukur. Berfokus pada transformasi proses, pembangunan kapabilitas tim, dan hasil bisnis jangka panjang.`;
      break;
    }

    case 'volunteer_ngo': {
      // Volunteer adalah inti CV; pengalaman komersial diringkas
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
      preset.summary = `Aktivis sosial dan relawan berdedikasi dengan pengalaman memimpin program pemberdayaan masyarakat, mengelola tim relawan, dan menghasilkan dampak sosial terukur. Berkomitmen pada keberlanjutan program dan kolaborasi lintas lembaga nirlaba.`;
      break;
    }

    case 'government': {
      // Administratif lengkap: pendidikan formal + sertifikasi resmi
      preset.education = [
        {
          id: 'edu-gov-1',
          institution: 'Universitas Indonesia',
          degree: 'S1 Ilmu Administrasi Negara',
          year: '2019 - 2023',
          location: userLocation,
          gpa: '3.65 / 4.00',
          description: 'Fokus pada Kebijakan Publik, Tata Kelola Pemerintahan yang Baik (Good Governance), dan Manajemen Pelayanan Publik.',
        } as EducationItem,
      ];
      preset.certifications = [
        { id: 'cert-gov-1', name: 'TOEFL ITP (Skor: 580)', issuer: 'Indonesian International Education Foundation (IIEF)', issueDate: '2024' } as CertificationItem,
        { id: 'cert-gov-2', name: 'Sertifikasi Tingkat Dasar Pengadaan Barang dan Jasa Pemerintah (PBJP)', issuer: 'Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP)', issueDate: '2024' } as CertificationItem,
      ];
      break;
    }

    case 'academic_scholarship': {
      // Publikasi + penghargaan akademik + beasiswa
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
        { id: 'sch-1', name: 'Beasiswa Unggulan Prestasi Akademik Nasional', provider: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', period: '2021 - 2023', description: 'Diberikan penuh untuk mahasiswa berprestasi dengan IPK di atas 3.75 selama masa studi.' } as ScholarshipItem,
      ];
      preset.summary = `${base.summary || ''}`.trim() || `Calon penerima beasiswa dengan rekam jejak akademik kuat (IPK 3.7+), pengalaman riset, dan publikasi ilmiah. Berkomitmen mengembangkan keilmuan dan memberikan kontribusi bagi masyarakat.`;
      break;
    }

    case 'career_break': {
      // Bukti skill tetap ter-update selama jeda: pelatihan + aktivitas produktif
      preset.courses = [
        { id: 'crs-cb-1', courseName: 'Kursus Online Upskilling (Bidang Keahlian Terkini)', institution: 'Platform Pembelajaran Online', period: '2024', description: 'Menyegarkan dan memperbarui keterampilan selama masa jeda karier.' } as CourseItem,
      ];
      preset.otherRelevant = [
        { id: 'orel-cb-1', title: 'Freelance / Proyek Mandiri Selama Jeda', period: '2023 - 2024', description: '• Tetap aktif mengerjakan proyek kecil untuk menjaga kemampuan tetap tajam.\n• Mengelola waktu belajar mandiri dan komunitas profesional.' } as OtherRelevantItem,
      ];
      preset.summary = `Profesional ${roleTitle} yang kembali ke dunia kerja setelah jeda karier dengan keterampilan yang tetap ter-update melalui kursus, sertifikasi, dan proyek mandiri. Siap berkontribusi kembali secara full-time dengan energi dan perspektif yang lebih matang.`;
      break;
    }

    case 'overseas': {
      // Bahasa asing menonjol
      preset.languages = [
        { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Native' },
        { id: 'lang-2', language: 'English', level: 'Professional' },
      ] as LanguageItem[];
      break;
    }

    case 'career_switch': {
      // Pengalaman relevan lainnya menjembatani skill lama → bidang baru
      preset.otherRelevant = [
        { id: 'orel-cs-1', title: `Transisi Karier ke ${roleTitle}`, period: '2024 - Sekarang', description: '• Memetakan keahlian dari bidang sebelumnya ke bidang tujuan.\n• Mengerjakan proyek nyata di bidang baru untuk membangun portofolio transisi.' } as OtherRelevantItem,
      ];
      break;
    }

    case 'general':
    default: {
      // Master CV: isi semua section ringan sebagai repositori
      if (!preset.publications) preset.publications = [];
      if (!preset.awards) preset.awards = [];
      if (!preset.portfolioLinks) preset.portfolioLinks = [];
      if (!preset.otherRelevant) preset.otherRelevant = [];
      break;
    }
  }

  return preset;
}

function getDefaultRoleTitle(category: string, purpose: CvPurpose): string {
  if (purpose === 'internship') {
    switch (category) {
      case 'tech': return 'Software Engineer Intern';
      case 'admin': return 'Staf Administrasi Intern';
      case 'marketing': return 'Marketing Intern';
      case 'creative': return 'UI/UX Design Intern';
      case 'hospitality': return 'F&B Service Crew';
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
    default: return 'Project Associate / Staf';
  }
}
