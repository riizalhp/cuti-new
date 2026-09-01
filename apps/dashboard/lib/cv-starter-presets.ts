import { CvPurpose } from './cv-purpose-scoring-engine';
import { CVData } from '@/components/CVView';

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
    templateId = 'ats-modern',
    userName = '',
    userEmail = '',
    userPhone = '',
    userLocation = 'Indonesia',
  } = options;

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

  // 2. Data Kontekstual per Kategori & Tujuan
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
            company: 'PT Teknologi Digital Nusantara',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengembangkan dan mengoptimalkan fitur platform utama, meningkatkan kecepatan load waktu respon hingga 40%.\n• Berkolaborasi dalam tim lintas divisi untuk merilis 12+ fitur baru sesuai timeline sprint.\n• Menerapkan best practices Clean Architecture dan code review rutin untuk meminimalisir bug hingga 25%.',
          },
          {
            id: 'exp-2',
            company: 'Inovasi Media Kreasi',
            role: 'Junior Developer',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Membangun antarmuka responsif dan integrasi API untuk 5+ modul aplikasi web pengguna aktif.\n• Memperbaiki 50+ issue teknis dan meningkatkan stabilitas sistem secara konsisten.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Indonesia / Institut Teknologi',
            degree: 'S1 Teknik Informatika / Ilmu Komputer',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.75 / 4.00',
            description: 'Fokus pada Rekayasa Perangkat Lunak. Aktif dalam Komunitas Pengembang Perangkat Lunak Mahasiswa.',
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
            company: 'PT Dinamika Sukses Abadi',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengelola dan merekapitulasi 400+ dokumen administratif per bulan dengan tingkat akurasi pencatatan 99.5%.\n• Mengoptimalkan sistem pengarsipan digital kantor, mempercepat proses temu kembali berkas hingga 30%.\n• Mengkoordinasikan jadwal rapat, inventaris kantor, dan korespondensi resmi dengan pihak internal maupun eksternal.',
          },
          {
            id: 'exp-2',
            company: 'CV Mitra Sejahtera',
            role: 'Staf Administrasi',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memproses entri data transaksi harian dan menyusun laporan operasional mingguan untuk pimpinan unit.\n• Melayani pertanyaan administratif dari 20+ klien per hari dengan standar kepuasan tinggi.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas / Politeknik Negeri',
            degree: 'S1 Manajemen / D3 Administrasi Perkantoran',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.65 / 4.00',
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
            company: 'PT Sinergi Kreatif Pemasaran',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Merancang dan mengeksekusi kampanye pemasaran digital terpadu yang meningkatkan qualified leads sebesar 35% dalam 6 bulan.\n• Mengelola anggaran iklan berbayar dengan ROI rata-rata 3.2x dan menurunkan Cost per Acquisition (CPA) sebesar 20%.\n• Memproduksi 20+ konten kreatif per bulan dengan engagement rate melampaui target industri sebesar 4.8%.',
          },
          {
            id: 'exp-2',
            company: 'Brand Mandiri Nusantara',
            role: 'Marketing Associate',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Melakukan riset pasar kompetitor dan mengkoordinasikan program promosi musiman bersama 15+ mitra bisnis.\n• Mengelola akun media sosial perusahaan hingga mencapai pertumbuhan 15.000+ followers organik.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Terkemuka',
            degree: 'S1 Ilmu Komunikasi / Manajemen Pemasaran',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.70 / 4.00',
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
            company: 'Studio Desain Cipta Ruang',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Merancang wireframe, user flow, dan antarmuka high-fidelity untuk 4 aplikasi web & mobile berskala komersial.\n• Membangun Design System terpadu yang memangkas waktu kerja tim pengembang sebesar 30%.\n• Melakukan usability testing berkala pada 50+ user untuk memvalidasi kenyamanan dan keterbacaan antarmuka.',
          },
          {
            id: 'exp-2',
            company: 'Kreasi Visual Utama',
            role: 'Junior Graphic Designer',
            period: '2021 - 2023',
            location: userLocation,
            description: '• Memproduksi 100+ aset visual promosi media sosial, banner cetak, dan presentasi klien korporat.\n• Berkolaborasi dengan tim marketing untuk menjaga konsistensi brand guidelines pada seluruh materi kampanye.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Institut Seni / Universitas Kreatif',
            degree: 'S1 Desain Komunikasi Visual (DKV)',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.72 / 4.00',
            description: 'Fokus pada Desain Media Interaktif dan Tipografi Terapan.',
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
            company: 'Kopi Kenangan Senja / Outlet Kuliner',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Melayani 150+ pesanan pelanggan per hari dengan standar keramahan tinggi dan akurasi pesanan 99%.\n• Mengoperasikan mesin espresso, menjaga standar kalibrasi rasa harian, dan mengelola stok bahan baku.\n• Memastikan kebersihan area kerja dan kasir sesuai SOP sanitasi baku.',
          },
          {
            id: 'exp-2',
            company: 'Resto Rasa Nusantara',
            role: 'Service Crew / Kasir',
            period: '2022 - 2023',
            location: userLocation,
            description: '• Memproses transaksi pembayaran tunai & non-tunai dengan tepat tanpa selisih kas.\n• Memberikan rekomendasi menu favorit kepada pelanggan, mendukung kenaikan penjualan rata-rata per transaksi.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'SMK / Akademi Pariwisata & Perhotelan',
            degree: 'Tata Boga / Perhotelan / Pariwisata',
            year: '2020 - 2023',
            location: userLocation,
            description: 'Pelatihan Pelayanan Prima, Barista Dasar, dan Manajemen Restoran.',
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
            company: 'Sekolah Mandiri / Lembaga Belajar Prima',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Mengajar 80+ siswa dengan metode pembelajaran aktif yang meningkatkan nilai rata-rata ujian siswa sebesar 20%.\n• Menyusun modul materi belajar interaktif berbasis digital dan lembar evaluasi berkala.\n• Menjalin komunikasi konstruktif dengan orang tua murid mengenai perkembangan belajar siswa.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Pendidikan Indonesia',
            degree: 'S1 Pendidikan / Ilmu Keguruan',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.80 / 4.00',
            description: 'Pendidikan Profesi Guru & Psikologi Pendidikan.',
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
            company: 'Perusahaan Maju Gemilang',
            role: roleTitle,
            period: '2023 - Sekarang',
            location: userLocation,
            isCurrent: true,
            description: '• Melaksanakan tugas dan tanggung jawab operasional utama dengan akurasi dan efisiensi tinggi.\n• Berkolaborasi dengan tim lintas fungsi untuk mencapai target unit kerja tepat waktu.\n• Mengusulkan inisiatif perbaikan proses kerja yang meningkatkan produktivitas tim sebesar 15%.',
          },
          {
            id: 'exp-2',
            company: 'Organisasi / Inisiatif Komunitas',
            role: 'Koordinator Proyek',
            period: '2022 - 2023',
            location: userLocation,
            description: '• Mengkoordinasikan pelaksanaan program kerja yang melibatkan 100+ partisipan aktif.\n• Menyusun laporan pertanggungjawaban kegiatan secara transparan dan terstruktur.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas / Perguruan Tinggi',
            degree: 'Sarjana (S1) / Diploma (D3)',
            year: '2019 - 2023',
            location: userLocation,
            gpa: '3.60 / 4.00',
            description: 'Aktif dalam kegiatan akademik dan organisasi kemahasiswaan.',
          },
        ],
      };
  }
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
