export interface RegionWageBenchmark {
  no: number;
  id: string;
  city: string;
  province: string;
  searchQuery: string;
  umk2026: number;
  umkExact: number;
  skReference: string;
  livingCostSingle: number;
  rentEstimate: number;
  foodEstimate: number;
  transportUtilityEstimate: number;
  zoneLabel: string;
}

interface RawUmkEntry {
  no: number;
  province: string;
  city: string;
  umkExact: number;
  skReference: string;
  zoneLabel: string;
  rentEstimate: number;
  foodEstimate: number;
  transportUtilityEstimate: number;
}

const SK_JABAR = 'Kepgub Jawa Barat No. 561.7/Kep.862-Kesra/2025';
const SK_BANTEN = 'Kepgub Banten No. 703 Tahun 2025';
const SK_JATENG = 'Kepgub Jawa Tengah No. 100.3.3.1/505 Tahun 2025';
const SK_DIY = 'Kepgub DI Yogyakarta No. 443 Tahun 2025';
const SK_JATIM = 'Kepgub Jawa Timur No. 100.3.3.1/937/013/2025';
const SK_BALI = 'Kepgub Bali No. 1021/03-M/HK/2025';
const SK_BATAM = 'Surat Walikota Batam No. 1134/500.15.14.1/XII/2025';
const SK_RIAU = 'Kepgub Riau No. Kpts.1164/XII/2025';
const SK_BINTAN = 'Kepgub Kepulauan Riau No. 1333 Tahun 2025';
const SK_TANJUNGPINANG = 'Kepgub Kepulauan Riau No. 1332 Tahun 2025';
const SK_BENGKULU = 'Kepgub Bengkulu No. K.647.DKKTRANS Tahun 2025';
const SK_KALSEL = 'Kepgub Kalimantan Selatan No. 100.3.3.1/01107/KUM/2025';
const SK_SULSEL = 'Kepgub Sulawesi Selatan No. 2142/XII/Tahun 2025';
const SK_SULTENG = 'Kepgub Sulawesi Tengah No. 500.15.14.1/486/DIS.NAKERTRANS-G.A/2025';

const RAW_UMK_2026: RawUmkEntry[] = [
  // ==================== JAWA BARAT (1 - 27) ====================
  { no: 1, province: 'Jawa Barat', city: 'Kota Bekasi', umkExact: 5999443.00, skReference: SK_JABAR, zoneLabel: 'Kawasan Industri & Komuter', rentEstimate: 1350000, foodEstimate: 1850000, transportUtilityEstimate: 950000 },
  { no: 2, province: 'Jawa Barat', city: 'Kabupaten Karawang', umkExact: 5886853.00, skReference: SK_JABAR, zoneLabel: 'Sentra Manufaktur Otomotif', rentEstimate: 1100000, foodEstimate: 1750000, transportUtilityEstimate: 900000 },
  { no: 3, province: 'Jawa Barat', city: 'Kabupaten Bekasi', umkExact: 5938885.00, skReference: SK_JABAR, zoneLabel: 'Kawasan Industri Cikarang', rentEstimate: 1200000, foodEstimate: 1800000, transportUtilityEstimate: 900000 },
  { no: 4, province: 'Jawa Barat', city: 'Kabupaten Purwakarta', umkExact: 5052856.00, skReference: SK_JABAR, zoneLabel: 'Kawasan Industri Bukit Indah', rentEstimate: 900000, foodEstimate: 1550000, transportUtilityEstimate: 750000 },
  { no: 5, province: 'Jawa Barat', city: 'Kabupaten Subang', umkExact: 3737482.00, skReference: SK_JABAR, zoneLabel: 'Manufaktur Baru & Pelabuhan Patimban', rentEstimate: 700000, foodEstimate: 1350000, transportUtilityEstimate: 650000 },
  { no: 6, province: 'Jawa Barat', city: 'Kota Depok', umkExact: 5522662.00, skReference: SK_JABAR, zoneLabel: 'Komuter, Jasa & Pendidikan', rentEstimate: 1300000, foodEstimate: 1750000, transportUtilityEstimate: 900000 },
  { no: 7, province: 'Jawa Barat', city: 'Kota Bogor', umkExact: 5437203.00, skReference: SK_JABAR, zoneLabel: 'Jasa, Pariwisata & Komuter', rentEstimate: 1150000, foodEstimate: 1700000, transportUtilityEstimate: 850000 },
  { no: 8, province: 'Jawa Barat', city: 'Kabupaten Bogor', umkExact: 5161769.00, skReference: SK_JABAR, zoneLabel: 'Manufaktur Cibinong & Gunung Putri', rentEstimate: 1000000, foodEstimate: 1650000, transportUtilityEstimate: 800000 },
  { no: 9, province: 'Jawa Barat', city: 'Kabupaten Sukabumi', umkExact: 3831926.00, skReference: SK_JABAR, zoneLabel: 'Manufaktur Padat Karya & Agribisnis', rentEstimate: 650000, foodEstimate: 1350000, transportUtilityEstimate: 650000 },
  { no: 10, province: 'Jawa Barat', city: 'Kabupaten Cianjur', umkExact: 3316191.00, skReference: SK_JABAR, zoneLabel: 'Agribisnis, Garmen & Pariwisata', rentEstimate: 600000, foodEstimate: 1250000, transportUtilityEstimate: 600000 },
  { no: 11, province: 'Jawa Barat', city: 'Kota Sukabumi', umkExact: 3192807.00, skReference: SK_JABAR, zoneLabel: 'Perdagangan & Jasa Regional', rentEstimate: 650000, foodEstimate: 1250000, transportUtilityEstimate: 600000 },
  { no: 12, province: 'Jawa Barat', city: 'Kota Bandung', umkExact: 4737678.00, skReference: SK_JABAR, zoneLabel: 'Pusat Ekonomi Kreatif, IT & Jasa', rentEstimate: 1150000, foodEstimate: 1650000, transportUtilityEstimate: 800000 },
  { no: 13, province: 'Jawa Barat', city: 'Kota Cimahi', umkExact: 4090568.00, skReference: SK_JABAR, zoneLabel: 'Industri Tekstil, Farmasi & Kreatif', rentEstimate: 850000, foodEstimate: 1500000, transportUtilityEstimate: 700000 },
  { no: 14, province: 'Jawa Barat', city: 'Kabupaten Bandung Barat', umkExact: 3984711.00, skReference: SK_JABAR, zoneLabel: 'Industri Padalarang & Pariwisata', rentEstimate: 750000, foodEstimate: 1450000, transportUtilityEstimate: 700000 },
  { no: 15, province: 'Jawa Barat', city: 'Kabupaten Sumedang', umkExact: 3949856.00, skReference: SK_JABAR, zoneLabel: 'Kawasan Industri Rancaekek & Pendidikan', rentEstimate: 750000, foodEstimate: 1400000, transportUtilityEstimate: 650000 },
  { no: 16, province: 'Jawa Barat', city: 'Kabupaten Bandung', umkExact: 3972202.00, skReference: SK_JABAR, zoneLabel: 'Sentra Tekstil, Garmen & Pangan', rentEstimate: 750000, foodEstimate: 1450000, transportUtilityEstimate: 700000 },
  { no: 17, province: 'Jawa Barat', city: 'Kabupaten Indramayu', umkExact: 2910254.00, skReference: SK_JABAR, zoneLabel: 'Kilang Energi Migas & Pertanian', rentEstimate: 600000, foodEstimate: 1200000, transportUtilityEstimate: 550000 },
  { no: 18, province: 'Jawa Barat', city: 'Kota Cirebon', umkExact: 2878646.00, skReference: SK_JABAR, zoneLabel: 'Hub Perdagangan & Pelabuhan Pantura', rentEstimate: 650000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 19, province: 'Jawa Barat', city: 'Kabupaten Cirebon', umkExact: 2880798.00, skReference: SK_JABAR, zoneLabel: 'Industri Rotan, Furnitur & Manufaktur', rentEstimate: 550000, foodEstimate: 1200000, transportUtilityEstimate: 550000 },
  { no: 20, province: 'Jawa Barat', city: 'Kabupaten Majalengka', umkExact: 2595368.00, skReference: SK_JABAR, zoneLabel: 'Kawasan Rebana, Bandara Kertajati & Garmen', rentEstimate: 500000, foodEstimate: 1100000, transportUtilityEstimate: 500000 },
  { no: 21, province: 'Jawa Barat', city: 'Kabupaten Kuningan', umkExact: 2369380.00, skReference: SK_JABAR, zoneLabel: 'Pariwisata, Pertanian & UMKM', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 22, province: 'Jawa Barat', city: 'Kota Tasikmalaya', umkExact: 2980336.00, skReference: SK_JABAR, zoneLabel: 'Pusat Niaga Priangan Timur', rentEstimate: 600000, foodEstimate: 1200000, transportUtilityEstimate: 550000 },
  { no: 23, province: 'Jawa Barat', city: 'Kabupaten Tasikmalaya', umkExact: 2871874.00, skReference: SK_JABAR, zoneLabel: 'Kerajinan, Agribisnis & Perdagangan', rentEstimate: 500000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 24, province: 'Jawa Barat', city: 'Kabupaten Garut', umkExact: 2472227.00, skReference: SK_JABAR, zoneLabel: 'Manufaktur Alas Kaki, Kulit & Wisata', rentEstimate: 500000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 25, province: 'Jawa Barat', city: 'Kabupaten Ciamis', umkExact: 2373644.00, skReference: SK_JABAR, zoneLabel: 'Agribisnis & Pengolahan Pangan', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 26, province: 'Jawa Barat', city: 'Kabupaten Pangandaran', umkExact: 2351250.00, skReference: SK_JABAR, zoneLabel: 'Pariwisata Bahari & Perikanan', rentEstimate: 500000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 27, province: 'Jawa Barat', city: 'Kota Banjar', umkExact: 2361241.00, skReference: SK_JABAR, zoneLabel: 'Perdagangan & Jasa Lintas Selatan', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },

  // ==================== BANTEN (28 - 35) ====================
  { no: 28, province: 'Banten', city: 'Kabupaten Pandeglang', umkExact: 3360078.06, skReference: SK_BANTEN, zoneLabel: 'Pariwisata KEK Tanjung Lesung & Agribisnis', rentEstimate: 600000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 29, province: 'Banten', city: 'Kabupaten Lebak', umkExact: 3330010.62, skReference: SK_BANTEN, zoneLabel: 'Agribisnis, Pertambangan & Komuter Maja', rentEstimate: 600000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 30, province: 'Banten', city: 'Kabupaten Tangerang', umkExact: 5210377.00, skReference: SK_BANTEN, zoneLabel: 'Kawasan Industri Cikupa, Balaraja & Curug', rentEstimate: 1050000, foodEstimate: 1700000, transportUtilityEstimate: 850000 },
  { no: 31, province: 'Banten', city: 'Kabupaten Serang', umkExact: 5178521.19, skReference: SK_BANTEN, zoneLabel: 'Kawasan Industri Modern Cikande', rentEstimate: 900000, foodEstimate: 1600000, transportUtilityEstimate: 750000 },
  { no: 32, province: 'Banten', city: 'Kota Tangerang', umkExact: 5399405.69, skReference: SK_BANTEN, zoneLabel: 'Manufaktur, Logistik Bandara & Jasa', rentEstimate: 1250000, foodEstimate: 1750000, transportUtilityEstimate: 850000 },
  { no: 33, province: 'Banten', city: 'Kota Cilegon', umkExact: 5469922.59, skReference: SK_BANTEN, zoneLabel: 'Industri Baja, Petrokimia & Pelabuhan', rentEstimate: 1050000, foodEstimate: 1700000, transportUtilityEstimate: 800000 },
  { no: 34, province: 'Banten', city: 'Kota Serang', umkExact: 4665927.94, skReference: SK_BANTEN, zoneLabel: 'Pusat Pemerintahan, Jasa & Pendidikan', rentEstimate: 850000, foodEstimate: 1500000, transportUtilityEstimate: 700000 },
  { no: 35, province: 'Banten', city: 'Kota Tangerang Selatan', umkExact: 5247870.00, skReference: SK_BANTEN, zoneLabel: 'Korporasi BSD, Teknologi & Perdagangan', rentEstimate: 1450000, foodEstimate: 1850000, transportUtilityEstimate: 900000 },

  // ==================== JAWA TENGAH (36 - 70) ====================
  { no: 36, province: 'Jawa Tengah', city: 'Kabupaten Cilacap', umkExact: 2773184.00, skReference: SK_JATENG, zoneLabel: 'Kilang Migas, Semen & Pelabuhan Selatan', rentEstimate: 550000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 37, province: 'Jawa Tengah', city: 'Kabupaten Banyumas', umkExact: 2474598.99, skReference: SK_JATENG, zoneLabel: 'Pendidikan Purwokerto, Jasa & Pariwisata', rentEstimate: 550000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 38, province: 'Jawa Tengah', city: 'Kabupaten Purbalingga', umkExact: 2474721.94, skReference: SK_JATENG, zoneLabel: 'Sentra Industri Rambut Palsu & Knalpot', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 39, province: 'Jawa Tengah', city: 'Kabupaten Banjarnegara', umkExact: 2327813.08, skReference: SK_JATENG, zoneLabel: 'Agribisnis, Energi Panas Bumi & Keramik', rentEstimate: 420000, foodEstimate: 1000000, transportUtilityEstimate: 430000 },
  { no: 40, province: 'Jawa Tengah', city: 'Kabupaten Kebumen', umkExact: 2400000.00, skReference: SK_JATENG, zoneLabel: 'Pertanian, Genteng Sokka & Pariwisata Geopark', rentEstimate: 450000, foodEstimate: 1020000, transportUtilityEstimate: 450000 },
  { no: 41, province: 'Jawa Tengah', city: 'Kabupaten Purworejo', umkExact: 2401961.91, skReference: SK_JATENG, zoneLabel: 'Penyangga Bandara YIA & Agribisnis', rentEstimate: 450000, foodEstimate: 1030000, transportUtilityEstimate: 450000 },
  { no: 42, province: 'Jawa Tengah', city: 'Kabupaten Wonosobo', umkExact: 2455038.01, skReference: SK_JATENG, zoneLabel: 'Pariwisata Dieng & Hortikultura', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 43, province: 'Jawa Tengah', city: 'Kabupaten Magelang', umkExact: 2607790.00, skReference: SK_JATENG, zoneLabel: 'Pariwisata Borobudur & Manufaktur', rentEstimate: 500000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 44, province: 'Jawa Tengah', city: 'Kabupaten Boyolali', umkExact: 2537949.00, skReference: SK_JATENG, zoneLabel: 'Manufaktur Tekstil, Garmen & Susu', rentEstimate: 500000, foodEstimate: 1080000, transportUtilityEstimate: 480000 },
  { no: 45, province: 'Jawa Tengah', city: 'Kabupaten Klaten', umkExact: 2538691.00, skReference: SK_JATENG, zoneLabel: 'Manufaktur Pangan, Cor Logam & Pertanian', rentEstimate: 480000, foodEstimate: 1080000, transportUtilityEstimate: 470000 },
  { no: 46, province: 'Jawa Tengah', city: 'Kabupaten Sukoharjo', umkExact: 2500000.00, skReference: SK_JATENG, zoneLabel: 'Industri Tekstil, Farmasi & Komuter Solo Baru', rentEstimate: 550000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 47, province: 'Jawa Tengah', city: 'Kabupaten Wonogiri', umkExact: 2335126.00, skReference: SK_JATENG, zoneLabel: 'Garmen Padat Karya, Jamu & Pertanian', rentEstimate: 420000, foodEstimate: 1000000, transportUtilityEstimate: 430000 },
  { no: 48, province: 'Jawa Tengah', city: 'Kabupaten Karanganyar', umkExact: 2592154.06, skReference: SK_JATENG, zoneLabel: 'Sentra Industri Tekstil, Kertas & Wisata', rentEstimate: 500000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 49, province: 'Jawa Tengah', city: 'Kabupaten Sragen', umkExact: 2337700.00, skReference: SK_JATENG, zoneLabel: 'Manufaktur Garmen, Tekstil & Pertanian', rentEstimate: 430000, foodEstimate: 1000000, transportUtilityEstimate: 440000 },
  { no: 50, province: 'Jawa Tengah', city: 'Kabupaten Grobogan', umkExact: 2399186.00, skReference: SK_JATENG, zoneLabel: 'Sentra Pangan Kedelai, Jagung & Manufaktur Baru', rentEstimate: 450000, foodEstimate: 1020000, transportUtilityEstimate: 450000 },
  { no: 51, province: 'Jawa Tengah', city: 'Kabupaten Blora', umkExact: 2345695.00, skReference: SK_JATENG, zoneLabel: 'Migas Blok Cepu, Kehutanan Jati & Pertanian', rentEstimate: 450000, foodEstimate: 1020000, transportUtilityEstimate: 450000 },
  { no: 52, province: 'Jawa Tengah', city: 'Kabupaten Rembang', umkExact: 2386305.00, skReference: SK_JATENG, zoneLabel: 'Perikanan Pantura, Semen & Industri Sepatu', rentEstimate: 450000, foodEstimate: 1030000, transportUtilityEstimate: 450000 },
  { no: 53, province: 'Jawa Tengah', city: 'Kabupaten Pati', umkExact: 2485000.00, skReference: SK_JATENG, zoneLabel: 'Pengolahan Hasil Laut, Tapioka & Kuningan', rentEstimate: 480000, foodEstimate: 1050000, transportUtilityEstimate: 470000 },
  { no: 54, province: 'Jawa Tengah', city: 'Kabupaten Kudus', umkExact: 2818585.00, skReference: SK_JATENG, zoneLabel: 'Industri Rokok, Kertas, Elektronik & Percetakan', rentEstimate: 600000, foodEstimate: 1200000, transportUtilityEstimate: 520000 },
  { no: 55, province: 'Jawa Tengah', city: 'Kabupaten Jepara', umkExact: 2756501.00, skReference: SK_JATENG, zoneLabel: 'Industri Furnitur Ekspor, Sepatu & Garmen', rentEstimate: 550000, foodEstimate: 1180000, transportUtilityEstimate: 520000 },
  { no: 56, province: 'Jawa Tengah', city: 'Kabupaten Demak', umkExact: 3122805.00, skReference: SK_JATENG, zoneLabel: 'Kawasan Industri Sayung & Penyangga Semarang', rentEstimate: 650000, foodEstimate: 1280000, transportUtilityEstimate: 580000 },
  { no: 57, province: 'Jawa Tengah', city: 'Kabupaten Semarang', umkExact: 2940088.00, skReference: SK_JATENG, zoneLabel: 'Manufaktur Ungaran, Bawen & Garmen', rentEstimate: 620000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 58, province: 'Jawa Tengah', city: 'Kabupaten Temanggung', umkExact: 2397000.00, skReference: SK_JATENG, zoneLabel: 'Pengolahan Kayu Lapis, Tembakau & Kopi', rentEstimate: 450000, foodEstimate: 1030000, transportUtilityEstimate: 450000 },
  { no: 59, province: 'Jawa Tengah', city: 'Kabupaten Kendal', umkExact: 2992994.00, skReference: SK_JATENG, zoneLabel: 'Kawasan Ekonomi Khusus (KEK) Industri Kendal', rentEstimate: 650000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 60, province: 'Jawa Tengah', city: 'Kabupaten Batang', umkExact: 2708520.00, skReference: SK_JATENG, zoneLabel: 'Kawasan Industri Terpadu Batang (KITB)', rentEstimate: 580000, foodEstimate: 1150000, transportUtilityEstimate: 520000 },
  { no: 61, province: 'Jawa Tengah', city: 'Kabupaten Pekalongan', umkExact: 2633700.00, skReference: SK_JATENG, zoneLabel: 'Industri Tekstil, Batik & Garmen', rentEstimate: 500000, foodEstimate: 1120000, transportUtilityEstimate: 480000 },
  { no: 62, province: 'Jawa Tengah', city: 'Kabupaten Pemalang', umkExact: 2433254.00, skReference: SK_JATENG, zoneLabel: 'Garmen, Konveksi & Perikanan Pantura', rentEstimate: 460000, foodEstimate: 1050000, transportUtilityEstimate: 460000 },
  { no: 63, province: 'Jawa Tengah', city: 'Kabupaten Tegal', umkExact: 2484162.00, skReference: SK_JATENG, zoneLabel: 'Industri Pengecoran Logam & Manufaktur', rentEstimate: 480000, foodEstimate: 1080000, transportUtilityEstimate: 470000 },
  { no: 64, province: 'Jawa Tengah', city: 'Kabupaten Brebes', umkExact: 2400350.47, skReference: SK_JATENG, zoneLabel: 'Kawasan Industri Brebes, Alas Kaki & Agribisnis', rentEstimate: 480000, foodEstimate: 1050000, transportUtilityEstimate: 460000 },
  { no: 65, province: 'Jawa Tengah', city: 'Kota Magelang', umkExact: 2429285.00, skReference: SK_JATENG, zoneLabel: 'Jasa, Pendidikan & Perdagangan Kedu', rentEstimate: 520000, foodEstimate: 1080000, transportUtilityEstimate: 480000 },
  { no: 66, province: 'Jawa Tengah', city: 'Kota Surakarta', umkExact: 2570000.00, skReference: SK_JATENG, zoneLabel: 'Pusat Niaga, Kreatif, Pendidikan & Budaya Solo', rentEstimate: 650000, foodEstimate: 1180000, transportUtilityEstimate: 520000 },
  { no: 67, province: 'Jawa Tengah', city: 'Kota Salatiga', umkExact: 2698273.24, skReference: SK_JATENG, zoneLabel: 'Pendidikan Tinggi, Industri Sepatu & Pangan', rentEstimate: 600000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 68, province: 'Jawa Tengah', city: 'Kota Semarang', umkExact: 3701709.00, skReference: SK_JATENG, zoneLabel: 'Ibu Kota Provinsi, Pelabuhan & Kawasan Industri', rentEstimate: 850000, foodEstimate: 1450000, transportUtilityEstimate: 650000 },
  { no: 69, province: 'Jawa Tengah', city: 'Kota Pekalongan', umkExact: 2700926.00, skReference: SK_JATENG, zoneLabel: 'Sentra Batik, Tekstil & Perikanan Pelabuhan', rentEstimate: 550000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 70, province: 'Jawa Tengah', city: 'Kota Tegal', umkExact: 2526510.00, skReference: SK_JATENG, zoneLabel: 'Perdagangan, Galangan Kapal & Jasa Pantura', rentEstimate: 520000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },

  // ==================== DI YOGYAKARTA (71 - 75) ====================
  { no: 71, province: 'DI Yogyakarta', city: 'Kota Yogyakarta', umkExact: 2827593.00, skReference: SK_DIY, zoneLabel: 'Pendidikan, Pariwisata, Kreatif & Digital', rentEstimate: 800000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 72, province: 'DI Yogyakarta', city: 'Kabupaten Sleman', umkExact: 2624387.00, skReference: SK_DIY, zoneLabel: 'Kampus, Startup IT, Perhotelan & Garmen', rentEstimate: 750000, foodEstimate: 1200000, transportUtilityEstimate: 520000 },
  { no: 73, province: 'DI Yogyakarta', city: 'Kabupaten Bantul', umkExact: 2509001.00, skReference: SK_DIY, zoneLabel: 'Kerajinan Ekspor, Kreatif & Pariwisata', rentEstimate: 600000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 74, province: 'DI Yogyakarta', city: 'Kabupaten Kulon Progo', umkExact: 2504520.00, skReference: SK_DIY, zoneLabel: 'Kawasan Bandara Internasional YIA & Logistik', rentEstimate: 550000, foodEstimate: 1080000, transportUtilityEstimate: 480000 },
  { no: 75, province: 'DI Yogyakarta', city: 'Kabupaten Gunungkidul', umkExact: 2468378.00, skReference: SK_DIY, zoneLabel: 'Pariwisata Geopark, Kuliner & Agribisnis', rentEstimate: 480000, foodEstimate: 1050000, transportUtilityEstimate: 460000 },

  // ==================== JAWA TIMUR (76 - 113) ====================
  { no: 76, province: 'Jawa Timur', city: 'Kota Surabaya', umkExact: 5288796.00, skReference: SK_JATIM, zoneLabel: 'Pusat Niaga, Pelabuhan & Industri SIER', rentEstimate: 1150000, foodEstimate: 1750000, transportUtilityEstimate: 850000 },
  { no: 77, province: 'Jawa Timur', city: 'Kabupaten Gresik', umkExact: 5195401.00, skReference: SK_JATIM, zoneLabel: 'KEK JIIPE, Smelter, Petrokimia & Semen', rentEstimate: 950000, foodEstimate: 1650000, transportUtilityEstimate: 800000 },
  { no: 78, province: 'Jawa Timur', city: 'Kabupaten Sidoarjo', umkExact: 5191541.00, skReference: SK_JATIM, zoneLabel: 'Manufaktur, Pergudangan & Bandara Juanda', rentEstimate: 950000, foodEstimate: 1650000, transportUtilityEstimate: 800000 },
  { no: 79, province: 'Jawa Timur', city: 'Kabupaten Pasuruan', umkExact: 5187681.00, skReference: SK_JATIM, zoneLabel: 'Kawasan Industri PIER, Pangan & Farmasi', rentEstimate: 850000, foodEstimate: 1550000, transportUtilityEstimate: 750000 },
  { no: 80, province: 'Jawa Timur', city: 'Kabupaten Mojokerto', umkExact: 5176101.00, skReference: SK_JATIM, zoneLabel: 'Kawasan Industri Ngoro (NIP) & Manufaktur', rentEstimate: 800000, foodEstimate: 1500000, transportUtilityEstimate: 750000 },
  { no: 81, province: 'Jawa Timur', city: 'Kabupaten Malang', umkExact: 3802862.00, skReference: SK_JATIM, zoneLabel: 'Manufaktur Rokok, Kertas, Pangan & Wisata', rentEstimate: 650000, foodEstimate: 1300000, transportUtilityEstimate: 600000 },
  { no: 82, province: 'Jawa Timur', city: 'Kota Malang', umkExact: 3736101.00, skReference: SK_JATIM, zoneLabel: 'Pendidikan Tinggi, IT, Kreatif & Kuliner', rentEstimate: 800000, foodEstimate: 1350000, transportUtilityEstimate: 620000 },
  { no: 83, province: 'Jawa Timur', city: 'Kota Batu', umkExact: 3562484.00, skReference: SK_JATIM, zoneLabel: 'Destinasi Pariwisata, Perhotelan & Hortikultura', rentEstimate: 700000, foodEstimate: 1300000, transportUtilityEstimate: 580000 },
  { no: 84, province: 'Jawa Timur', city: 'Kota Pasuruan', umkExact: 3555301.00, skReference: SK_JATIM, zoneLabel: 'Industri Mebel, Logam & Perdagangan', rentEstimate: 600000, foodEstimate: 1250000, transportUtilityEstimate: 550000 },
  { no: 85, province: 'Jawa Timur', city: 'Kabupaten Jombang', umkExact: 3320770.00, skReference: SK_JATIM, zoneLabel: 'Manufaktur Alas Kaki, Pangan & Pendidikan', rentEstimate: 550000, foodEstimate: 1200000, transportUtilityEstimate: 520000 },
  { no: 86, province: 'Jawa Timur', city: 'Kabupaten Tuban', umkExact: 3229092.00, skReference: SK_JATIM, zoneLabel: 'Industri Semen, Petrokimia & Kilang Migas', rentEstimate: 600000, foodEstimate: 1200000, transportUtilityEstimate: 550000 },
  { no: 87, province: 'Jawa Timur', city: 'Kota Mojokerto', umkExact: 3208556.00, skReference: SK_JATIM, zoneLabel: 'Perdagangan, Jasa & Kerajinan Alas Kaki', rentEstimate: 580000, foodEstimate: 1200000, transportUtilityEstimate: 520000 },
  { no: 88, province: 'Jawa Timur', city: 'Kabupaten Lamongan', umkExact: 3196328.00, skReference: SK_JATIM, zoneLabel: 'Industri Maritim Pantura, Perikanan & Manufaktur', rentEstimate: 550000, foodEstimate: 1180000, transportUtilityEstimate: 520000 },
  { no: 89, province: 'Jawa Timur', city: 'Kabupaten Probolinggo', umkExact: 3164526.00, skReference: SK_JATIM, zoneLabel: 'Pembangkit Energi Paiton, Kertas & Agribisnis', rentEstimate: 550000, foodEstimate: 1180000, transportUtilityEstimate: 520000 },
  { no: 90, province: 'Jawa Timur', city: 'Kota Probolinggo', umkExact: 3045172.00, skReference: SK_JATIM, zoneLabel: 'Pelabuhan, Perdagangan & Pengolahan Ikan', rentEstimate: 550000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 91, province: 'Jawa Timur', city: 'Kabupaten Jember', umkExact: 3012197.00, skReference: SK_JATIM, zoneLabel: 'Pusat Pendidikan Tapal Kuda & Perkebunan', rentEstimate: 580000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 92, province: 'Jawa Timur', city: 'Kabupaten Banyuwangi', umkExact: 2989145.00, skReference: SK_JATIM, zoneLabel: 'Pariwisata, Pelabuhan Ketapang & Industri Kereta', rentEstimate: 580000, foodEstimate: 1150000, transportUtilityEstimate: 500000 },
  { no: 93, province: 'Jawa Timur', city: 'Kota Kediri', umkExact: 2742806.00, skReference: SK_JATIM, zoneLabel: 'Pusat Industri Tembakau Nasional & Niaga', rentEstimate: 580000, foodEstimate: 1120000, transportUtilityEstimate: 480000 },
  { no: 94, province: 'Jawa Timur', city: 'Kabupaten Bojonegoro', umkExact: 2685983.00, skReference: SK_JATIM, zoneLabel: 'penghasil Migas Blok Cepu & Agribisnis', rentEstimate: 550000, foodEstimate: 1100000, transportUtilityEstimate: 480000 },
  { no: 95, province: 'Jawa Timur', city: 'Kabupaten Kediri', umkExact: 2651603.00, skReference: SK_JATIM, zoneLabel: 'Kawasan Bandara Dhoho, Agribisnis & Pangan', rentEstimate: 500000, foodEstimate: 1080000, transportUtilityEstimate: 470000 },
  { no: 96, province: 'Jawa Timur', city: 'Kota Blitar', umkExact: 2639518.00, skReference: SK_JATIM, zoneLabel: 'Perdagangan, Jasa & Wisata Sejarah', rentEstimate: 480000, foodEstimate: 1080000, transportUtilityEstimate: 460000 },
  { no: 97, province: 'Jawa Timur', city: 'Kabupaten Tulungagung', umkExact: 2628190.00, skReference: SK_JATIM, zoneLabel: 'Industri Marmer, Konveksi & Pengolahan Pangan', rentEstimate: 480000, foodEstimate: 1080000, transportUtilityEstimate: 460000 },
  { no: 98, province: 'Jawa Timur', city: 'Kota Madiun', umkExact: 2588794.00, skReference: SK_JATIM, zoneLabel: 'Industri Perkeretaapian (INKA) & Pusat Niaga Barat', rentEstimate: 520000, foodEstimate: 1080000, transportUtilityEstimate: 480000 },
  { no: 99, province: 'Jawa Timur', city: 'Kabupaten Lumajang', umkExact: 2578320.00, skReference: SK_JATIM, zoneLabel: 'Pengolahan Kayu, Pangan & Agribisnis', rentEstimate: 460000, foodEstimate: 1050000, transportUtilityEstimate: 460000 },
  { no: 100, province: 'Jawa Timur', city: 'Kabupaten Blitar', umkExact: 2567744.00, skReference: SK_JATIM, zoneLabel: 'Sentra Peternakan Unggas, Perkebunan & Perikanan', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 101, province: 'Jawa Timur', city: 'Kabupaten Nganjuk', umkExact: 2564627.00, skReference: SK_JATIM, zoneLabel: 'Kawasan Industri Nganjuk (KING) & Pertanian', rentEstimate: 460000, foodEstimate: 1050000, transportUtilityEstimate: 460000 },
  { no: 102, province: 'Jawa Timur', city: 'Kabupaten Ngawi', umkExact: 2556815.00, skReference: SK_JATIM, zoneLabel: 'Manufaktur Alas Kaki, Mainan & Lumbung Pangan', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 103, province: 'Jawa Timur', city: 'Kabupaten Magetan', umkExact: 2553866.00, skReference: SK_JATIM, zoneLabel: 'Industri Kerajinan Kulit, Pariwisata & Pertanian', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 104, province: 'Jawa Timur', city: 'Kabupaten Sumenep', umkExact: 2553688.00, skReference: SK_JATIM, zoneLabel: 'Migas Lepas Pantai, Garam & Perikanan Madura', rentEstimate: 460000, foodEstimate: 1050000, transportUtilityEstimate: 460000 },
  { no: 105, province: 'Jawa Timur', city: 'Kabupaten Madiun', umkExact: 2553221.00, skReference: SK_JATIM, zoneLabel: 'Manufaktur, Agribisnis & Logistik Tol Trans-Jawa', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 106, province: 'Jawa Timur', city: 'Kabupaten Bangkalan', umkExact: 2550274.00, skReference: SK_JATIM, zoneLabel: 'Penyangga Suramadu, Galangan Kapal & Perdagangan', rentEstimate: 480000, foodEstimate: 1060000, transportUtilityEstimate: 460000 },
  { no: 107, province: 'Jawa Timur', city: 'Kabupaten Ponorogo', umkExact: 2549876.00, skReference: SK_JATIM, zoneLabel: 'Perdagangan, Pendidikan & Agribisnis', rentEstimate: 450000, foodEstimate: 1050000, transportUtilityEstimate: 450000 },
  { no: 108, province: 'Jawa Timur', city: 'Kabupaten Trenggalek', umkExact: 2530313.00, skReference: SK_JATIM, zoneLabel: 'Perikanan Pesisir Selatan, UMKM & Perkebunan', rentEstimate: 440000, foodEstimate: 1030000, transportUtilityEstimate: 450000 },
  { no: 109, province: 'Jawa Timur', city: 'Kabupaten Pamekasan', umkExact: 2528004.00, skReference: SK_JATIM, zoneLabel: 'Perdagangan Madura, Batik & Tembakau', rentEstimate: 450000, foodEstimate: 1040000, transportUtilityEstimate: 450000 },
  { no: 110, province: 'Jawa Timur', city: 'Kabupaten Pacitan', umkExact: 2514892.00, skReference: SK_JATIM, zoneLabel: 'Pembangkit Energi, Pariwisata Pantai & Perikanan', rentEstimate: 440000, foodEstimate: 1030000, transportUtilityEstimate: 450000 },
  { no: 111, province: 'Jawa Timur', city: 'Kabupaten Bondowoso', umkExact: 2496886.00, skReference: SK_JATIM, zoneLabel: 'Perkebunan Kopi, Agribisnis & Wisata Ijen', rentEstimate: 430000, foodEstimate: 1020000, transportUtilityEstimate: 440000 },
  { no: 112, province: 'Jawa Timur', city: 'Kabupaten Sampang', umkExact: 2484443.00, skReference: SK_JATIM, zoneLabel: 'Pertanian, Garam & Perikanan Pesisir', rentEstimate: 430000, foodEstimate: 1020000, transportUtilityEstimate: 440000 },
  { no: 113, province: 'Jawa Timur', city: 'Kabupaten Situbondo', umkExact: 2483962.00, skReference: SK_JATIM, zoneLabel: 'Budidaya Perikanan, Pelabuhan Panarukan & Tebu', rentEstimate: 430000, foodEstimate: 1020000, transportUtilityEstimate: 440000 },

  // ==================== BALI (114 - 117) ====================
  { no: 114, province: 'Bali', city: 'Kabupaten Badung', umkExact: 3791002.57, skReference: SK_BALI, zoneLabel: 'Pusat Pariwisata Internasional, Hotel & Bandara', rentEstimate: 1350000, foodEstimate: 1550000, transportUtilityEstimate: 700000 },
  { no: 115, province: 'Bali', city: 'Kota Denpasar', umkExact: 3499878.78, skReference: SK_BALI, zoneLabel: 'Ibu Kota Provinsi, Jasa, Perdagangan & Kreatif', rentEstimate: 1150000, foodEstimate: 1450000, transportUtilityEstimate: 650000 },
  { no: 116, province: 'Bali', city: 'Kabupaten Gianyar', umkExact: 3316798.48, skReference: SK_BALI, zoneLabel: 'Pariwisata Budaya Ubud, Seni & Hospitality', rentEstimate: 1000000, foodEstimate: 1380000, transportUtilityEstimate: 620000 },
  { no: 117, province: 'Bali', city: 'Kabupaten Tabanan', umkExact: 3287678.87, skReference: SK_BALI, zoneLabel: 'Pariwisata, Agribisnis & Penyangga Denpasar', rentEstimate: 850000, foodEstimate: 1300000, transportUtilityEstimate: 600000 },

  // ==================== KEPULAUAN RIAU & RIAU (118 - 130) ====================
  { no: 118, province: 'Kepulauan Riau', city: 'Kota Batam', umkExact: 5357982.00, skReference: SK_BATAM, zoneLabel: 'Kawasan Perdagangan Bebas, Elektronik & Galangan', rentEstimate: 1150000, foodEstimate: 1850000, transportUtilityEstimate: 850000 },
  { no: 119, province: 'Riau', city: 'Kota Pekanbaru', umkExact: 3998179.46, skReference: SK_RIAU, zoneLabel: 'Pusat Perdagangan, Jasa, Migas & Sawit Riau', rentEstimate: 850000, foodEstimate: 1500000, transportUtilityEstimate: 700000 },
  { no: 120, province: 'Riau', city: 'Kota Dumai', umkExact: 4431174.69, skReference: SK_RIAU, zoneLabel: 'Kilang Migas, Pelabuhan Ekspor CPO & Industri', rentEstimate: 850000, foodEstimate: 1550000, transportUtilityEstimate: 720000 },
  { no: 121, province: 'Riau', city: 'Kabupaten Kampar', umkExact: 3819353.01, skReference: SK_RIAU, zoneLabel: 'Perkebunan Kelapa Sawit, Karet & Penyangga Pekanbaru', rentEstimate: 650000, foodEstimate: 1350000, transportUtilityEstimate: 650000 },
  { no: 122, province: 'Riau', city: 'Kabupaten Rokan Hulu', umkExact: 3988406.32, skReference: SK_RIAU, zoneLabel: 'Industri Pengolahan Kelapa Sawit & Agribisnis', rentEstimate: 650000, foodEstimate: 1380000, transportUtilityEstimate: 650000 },
  { no: 123, province: 'Riau', city: 'Kabupaten Indragiri Hulu', umkExact: 3898210.70, skReference: SK_RIAU, zoneLabel: 'Perkebunan Sawit, Pertambangan & Logistik', rentEstimate: 650000, foodEstimate: 1350000, transportUtilityEstimate: 650000 },
  { no: 124, province: 'Riau', city: 'Kabupaten Bengkalis', umkExact: 4155317.75, skReference: SK_RIAU, zoneLabel: 'Blok Migas Rokan (Duri), Sawit & Pelabuhan', rentEstimate: 750000, foodEstimate: 1500000, transportUtilityEstimate: 700000 },
  { no: 125, province: 'Riau', city: 'Kabupaten Siak', umkExact: 4001327.33, skReference: SK_RIAU, zoneLabel: 'Industri Pulp & Kertas, Kawasan Industri Tanjung Buton', rentEstimate: 700000, foodEstimate: 1450000, transportUtilityEstimate: 680000 },
  { no: 126, province: 'Riau', city: 'Kabupaten Pelalawan', umkExact: 3894260.59, skReference: SK_RIAU, zoneLabel: 'Sentra Industri Pulp & Kertas Pangkalan Kerinci', rentEstimate: 700000, foodEstimate: 1420000, transportUtilityEstimate: 660000 },
  { no: 127, province: 'Riau', city: 'Kabupaten Kuantan Singingi', umkExact: 3949466.98, skReference: SK_RIAU, zoneLabel: 'Perkebunan Sawit, Karet & Pertambangan', rentEstimate: 650000, foodEstimate: 1380000, transportUtilityEstimate: 650000 },
  { no: 128, province: 'Riau', city: 'Kabupaten Rokan Hilir', umkExact: 3783052.90, skReference: SK_RIAU, zoneLabel: 'Perikanan Laut, Perkebunan Sawit & Migas', rentEstimate: 620000, foodEstimate: 1350000, transportUtilityEstimate: 630000 },
  { no: 129, province: 'Kepulauan Riau', city: 'Kabupaten Bintan', umkExact: 4583221.00, skReference: SK_BINTAN, zoneLabel: 'Kawasan Industri Lobam, KEK Galang Batang & Resort', rentEstimate: 950000, foodEstimate: 1650000, transportUtilityEstimate: 750000 },
  { no: 130, province: 'Kepulauan Riau', city: 'Kota Tanjungpinang', umkExact: 3879520.00, skReference: SK_TANJUNGPINANG, zoneLabel: 'Ibu Kota Provinsi Kepri, Jasa & Perdagangan Maritim', rentEstimate: 800000, foodEstimate: 1480000, transportUtilityEstimate: 680000 },

  // ==================== BENGKULU (131 - 135) ====================
  { no: 131, province: 'Bengkulu', city: 'Kabupaten Mukomuko', umkExact: 3217086.00, skReference: SK_BENGKULU, zoneLabel: 'Industri Pengolahan CPO & Perkebunan Sawit', rentEstimate: 550000, foodEstimate: 1200000, transportUtilityEstimate: 550000 },
  { no: 132, province: 'Bengkulu', city: 'Kota Bengkulu', umkExact: 3089218.66, skReference: SK_BENGKULU, zoneLabel: 'Ibu Kota Provinsi, Perdagangan, Jasa & Pelabuhan', rentEstimate: 650000, foodEstimate: 1250000, transportUtilityEstimate: 580000 },
  { no: 133, province: 'Bengkulu', city: 'Kabupaten Bengkulu Tengah', umkExact: 2945142.20, skReference: SK_BENGKULU, zoneLabel: 'Pertambangan Batu Bara, Perkebunan & Penyangga Kota', rentEstimate: 520000, foodEstimate: 1150000, transportUtilityEstimate: 520000 },
  { no: 134, province: 'Bengkulu', city: 'Kabupaten Bengkulu Utara', umkExact: 2906158.92, skReference: SK_BENGKULU, zoneLabel: 'Perkebunan Kelapa Sawit, Karet & Pertambangan', rentEstimate: 520000, foodEstimate: 1150000, transportUtilityEstimate: 520000 },
  { no: 135, province: 'Bengkulu', city: 'Kabupaten Rejang Lebong', umkExact: 2841749.59, skReference: SK_BENGKULU, zoneLabel: 'Sentra Hortikultura, Kopi & Perdagangan Curup', rentEstimate: 500000, foodEstimate: 1120000, transportUtilityEstimate: 500000 },

  // ==================== KALIMANTAN SELATAN (136 - 140) ====================
  { no: 136, province: 'Kalimantan Selatan', city: 'Kota Banjarmasin', umkExact: 3855894.00, skReference: SK_KALSEL, zoneLabel: 'Pusat Niaga, Pelabuhan Trisakti & Logistik Sungai', rentEstimate: 850000, foodEstimate: 1500000, transportUtilityEstimate: 680000 },
  { no: 137, province: 'Kalimantan Selatan', city: 'Kota Banjarbaru', umkExact: 3843037.66, skReference: SK_KALSEL, zoneLabel: 'Ibu Kota Provinsi Kalsel, Bandara Syamsudin Noor & Jasa', rentEstimate: 850000, foodEstimate: 1480000, transportUtilityEstimate: 680000 },
  { no: 138, province: 'Kalimantan Selatan', city: 'Kabupaten Tanah Bumbu', umkExact: 3736000.00, skReference: SK_KALSEL, zoneLabel: 'Pertambangan Batu Bara, Pelabuhan Batulicin & Sawit', rentEstimate: 750000, foodEstimate: 1450000, transportUtilityEstimate: 650000 },
  { no: 139, province: 'Kalimantan Selatan', city: 'Kabupaten Kotabaru', umkExact: 3904645.00, skReference: SK_KALSEL, zoneLabel: 'Industri Semen, Pelabuhan Laut Dalam, Tambang & Sawit', rentEstimate: 750000, foodEstimate: 1480000, transportUtilityEstimate: 680000 },
  { no: 140, province: 'Kalimantan Selatan', city: 'Kabupaten Tabalong', umkExact: 3827935.00, skReference: SK_KALSEL, zoneLabel: 'Pertambangan Batu Bara, Migas Tanjung & Logistik IKN', rentEstimate: 750000, foodEstimate: 1450000, transportUtilityEstimate: 650000 },

  // ==================== SULAWESI SELATAN (141) ====================
  { no: 141, province: 'Sulawesi Selatan', city: 'Kota Makassar', umkExact: 4148179.00, skReference: SK_SULSEL, zoneLabel: 'Hub Niaga, Industri KIMA & Pelabuhan Indonesia Timur', rentEstimate: 950000, foodEstimate: 1550000, transportUtilityEstimate: 700000 },

  // ==================== SULAWESI TENGAH (142) ====================
  { no: 142, province: 'Sulawesi Tengah', city: 'Kota Palu', umkExact: 3619466.72, skReference: SK_SULTENG, zoneLabel: 'Ibu Kota Provinsi, KEK Palu, Logistik & Perdagangan', rentEstimate: 750000, foodEstimate: 1400000, transportUtilityEstimate: 650000 },
];

function slugifyCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function cleanSearchQuery(city: string): string {
  return city.replace(/^(Kota|Kabupaten)\s+/i, '').trim();
}

export const REGION_WAGE_BENCHMARKS: RegionWageBenchmark[] = RAW_UMK_2026.map((item) => ({
  no: item.no,
  id: slugifyCity(item.city),
  city: item.city,
  province: item.province,
  searchQuery: cleanSearchQuery(item.city),
  umk2026: Math.round(item.umkExact),
  umkExact: item.umkExact,
  skReference: item.skReference,
  livingCostSingle: item.rentEstimate + item.foodEstimate + item.transportUtilityEstimate,
  rentEstimate: item.rentEstimate,
  foodEstimate: item.foodEstimate,
  transportUtilityEstimate: item.transportUtilityEstimate,
  zoneLabel: item.zoneLabel,
}));

export const PROVINCE_LIST: string[] = Array.from(
  new Set(REGION_WAGE_BENCHMARKS.map((r) => r.province))
);
