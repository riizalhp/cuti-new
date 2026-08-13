/**
 * Dataset Jurusan & Program Studi Terpisah Berdasarkan Jenjang Pendidikan
 * (SMA, SMK, Diploma D3/D4, S1/S2 Kemdiktisaintek PDDikti)
 */

export const SMA_MAJORS: string[] = [
  'IPA (Ilmu Pengetahuan Alam)',
  'IPS (Ilmu Pengetahuan Sosial)',
  'Bahasa dan Budaya',
  'Kurikulum Merdeka (Umum / Pilihan)',
  'Keagamaan / Agama Islam',
];

export const SMK_MAJORS: string[] = [
  'Teknik Komputer dan Jaringan (TKJ)',
  'Rekayasa Perangkat Lunak (RPL)',
  'Multimedia / Desain Grafis',
  'Akuntansi dan Keuangan Lembaga (AKL)',
  'Otomatisasi dan Tata Kelola Perkantoran (OTKP)',
  'Bisnis Daring dan Pemasaran (BDP)',
  'Teknik Kendaraan Ringan Otomotif (TKRO)',
  'Teknik dan Bisnis Sepeda Motor (TBSM)',
  'Teknik Elektronika Industri (TEI)',
  'Teknik Pemesinan',
  'Teknik Instalasi Tenaga Listrik (TITL)',
  'Teknik Konstruksi dan Perumahan',
  'Tata Boga / Kuliner',
  'Tata Busana / Fesyen',
  'Perhotelan & Tata Graha',
  'Kecantikan dan Spa',
  'Farmasi Klinis dan Komunitas',
  'Keperawatan Kesehatan',
  'Agribisnis Tanaman dan Hortikultura',
  'Nautika Kapal Penangkap Ikan',
];

export const DIPLOMA_MAJORS: string[] = [
  'D3 Akuntansi',
  'D3 Manajemen Informatika',
  'D3 Administrasi Bisnis',
  'D3 Perbankan dan Keuangan',
  'D3 Keperawatan',
  'D3 Kebidanan',
  'D3 Penyiaran (Broadcasting)',
  'D3 Public Relations / Humas',
  'D3 Rekam Medis & Informasi Kesehatan',
  'D3 Teknik Mesin',
  'D3 Teknik Sipil',
  'D3 Teknik Elektro',
  'D3 Farmasi',
  'D3 Analis Kesehatan / TLM',
  'D3 Perpajakan',
  'D3 Perhotelan',
  'D3 Pariwisata / Usaha Perjalanan Wisata',
  'D4 Teknik Komputer',
  'D4 Rekayasa Sistem Siber',
  'D4 Manajemen Pemasaran Digital',
  'D4 Manajemen Keuangan Sektor Publik',
  'D4 Pertanahan',
];

export const COLLEGE_MAJORS: string[] = [
  // Teknologi & Komputer
  'Teknik Informatika',
  'Sistem Informasi',
  'Ilmu Komputer',
  'Teknologi Informasi',
  'Software Engineering / Rekayasa Perangkat Lunak',
  'Data Science / Sains Data',
  'Cyber Security / Keamanan Siber',
  'Artificial Intelligence / Kecerdasan Buatan',
  'Teknik Elektro',
  'Teknik Sipil',
  'Teknik Mesin',
  'Teknik Industri',
  'Teknik Kimia',
  'Teknik Lingkungan',
  'Teknik Biomedis',
  'Arsitektur',
  'Perencanaan Wilayah dan Kota (PWK)',
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Statistika',

  // Ekonomi & Bisnis
  'Manajemen',
  'Akuntansi',
  'Ilmu Ekonomi',
  'Ekonomi Pembangunan',
  'Bisnis Digital',
  'Pemasaran / Marketing',
  'Keuangan & Perbankan',
  'Kewirausahaan / Entrepreneurship',
  'Ekonomi Syariah / Perbankan Syariah',
  'Manajemen Logistik & Rantai Pasok',

  // Sosial & Hukum
  'Ilmu Hukum',
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Ilmu Pemerintahan',
  'Administrasi Publik / Negara',
  'Administrasi Bisnis / Niaga',
  'Psikologi',
  'Sosiologi',
  'Ilmu Politik',
  'Criminology / Kriminologi',
  'Jurnalistik / Penyiaran',

  // Kesehatan
  'Kedokteran',
  'Kedokteran Gigi',
  'Farmasi',
  'Ilmu Keperawatan',
  'Kesehatan Masyarakat',
  'Gizi / Ilmu Gizi',
  'Fisioterapi',
  'Radiologi',
  'Kedokteran Hewan',

  // Pendidikan
  'Pendidikan Guru Sekolah Dasar (PGSD)',
  'Pendidikan Guru PAUD',
  'Pendidikan Bahasa Inggris',
  'Pendidikan Bahasa Indonesia',
  'Pendidikan Matematika',
  'Pendidikan Olahraga & Kesehatan',

  // Seni & Desain
  'Desain Komunikasi Visual (DKV)',
  'Desain Produk',
  'Desain Interior',
  'Sastra Inggris',
  'Sastra Jepang',
  'Sastra Indonesia',
  'Sastra Korea',
  'Seni Rupa',
  'Film & Televisi',
];

export const INDONESIAN_MAJORS: string[] = [
  ...SMA_MAJORS,
  ...SMK_MAJORS,
  ...DIPLOMA_MAJORS,
  ...COLLEGE_MAJORS,
];
