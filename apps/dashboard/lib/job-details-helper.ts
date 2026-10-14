/**
 * Helper untuk menyusun Deskripsi Pekerjaan & Kualifikasi Persyaratan Loker
 * Mengatasi kendala data hasil agregasi scraper yang sering kali hanya memiliki
 * satu baris ("Lowongan X di Y") dan array requirements bernilai null/kosong.
 */

export interface ResolvedJobDetails {
  description: string;
  responsibilities: string[];
  requirements: string[];
}

function cleanHtml(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isTrivialDescription(raw: string, title: string, company: string): boolean {
  if (!raw || raw.trim().length === 0) return true;
  const cleaned = raw.trim();
  if (cleaned.length < 75) {
    const pattern = /^Lowongan\s+(?:Kerja\s+)?(.+?)\s+di\s+(.+)$/i;
    if (pattern.test(cleaned)) return true;
  }
  return false;
}

export function resolveJobDetails(
  title: string,
  company: string,
  location: string = 'Indonesia',
  workType: string = 'Full-time',
  rawDesc?: string | null,
  rawReqs?: string[] | null
): ResolvedJobDetails {
  const normTitle = (title || '').toLowerCase();
  const cleanedDesc = cleanHtml(rawDesc);
  const hasSubstantiveDesc = !isTrivialDescription(cleanedDesc, title, company);

  let defaultDesc = '';
  let responsibilities: string[] = [];
  let requirements: string[] = [];

  // 1. Tentukan Pola Bidang Berdasarkan Judul Pekerjaan
  if (
    normTitle.includes('customer service') ||
    normTitle.includes('cs ') ||
    normTitle.includes('call center') ||
    normTitle.includes('helpdesk') ||
    normTitle.includes('telemarketing') ||
    normTitle.includes('contact center')
  ) {
    defaultDesc = `Posisi ${title} di ${company} bertanggung jawab untuk memberikan layanan komunikasi terbaik kepada pelanggan, menangani pertanyaan maupun kendala dengan ramah dan solutif, serta menjaga tingkat kepuasan dan loyalitas pengguna layanan perusahaan.`;
    responsibilities = [
      'Merespons pertanyaan, permintaan, dan keluhan pelanggan secara cepat, tepat, dan ramah.',
      'Melakukan pencatatan riwayat interaksi dan tiket pengaduan ke dalam sistem operasional.',
      'Berkoordinasi dengan tim teknis atau divisi terkait untuk eskalasi kendala yang membutuhkan penanganan khusus.',
      'Memastikan standar kualitas komunikasi dan target kepuasan layanan (SLA) tercapai.',
    ];
    requirements = [
      'Pendidikan minimal SMA/SMK, D3, atau S1 semua jurusan.',
      'Kemampuan komunikasi verbal dan interpersonal yang baik, sopan, dan persuasif.',
      'Memiliki kesabaran, empati, dan keterampilan pemecahan masalah (problem solving).',
      'Mampu mengoperasikan komputer dan aplikasi spreadsheet dasar.',
      `Bersedia ditempatkan di unit kerja ${location} (${workType}).`,
    ];
  } else if (
    normTitle.includes('sales') ||
    normTitle.includes('marketing') ||
    normTitle.includes('account executive') ||
    normTitle.includes('promotor') ||
    normTitle.includes('spg') ||
    normTitle.includes('spb') ||
    normTitle.includes('business development') ||
    normTitle.includes('penjualan')
  ) {
    defaultDesc = `Sebagai ${title} di ${company}, kamu akan berperan langsung dalam mengenalkan keunggulan produk/layanan kepada calon konsumen, memperluas jangkauan pasar, dan mendorong pertumbuhan transaksi bisnis sesuai target perusahaan.`;
    responsibilities = [
      'Membangun komunikasi dan hubungan kerja sama yang baik dengan calon pembeli maupun klien lama.',
      'Mempresentasikan nilai keunggulan produk atau layanan secara percaya diri dan menarik.',
      'Melakukan negosiasi, follow-up prospek, dan menindaklanjuti proses transaksi hingga tuntas.',
      'Menyusun laporan aktivitas harian dan pembaruan pencapaian target penjualan.',
    ];
    requirements = [
      'Pendidikan minimal SMA/SMK atau D3/S1 diutamakan.',
      'Percaya diri, komunikatif, dan memiliki keterampilan negosiasi yang kuat.',
      'Berorientasi pada target, gigih, dan memiliki semangat belajar yang tinggi.',
      'Pengalaman kerja di bidang penjualan/promosi menjadi nilai tambah (fresh graduate dipersilakan).',
      `Siap bekerja secara ${workType} dengan penempatan di area ${location}.`,
    ];
  } else if (
    normTitle.includes('admin') ||
    normTitle.includes('data entry') ||
    normTitle.includes('administrasi') ||
    normTitle.includes('resepsionis') ||
    normTitle.includes('front desk')
  ) {
    defaultDesc = `Posisi ${title} di ${company} bertanggung jawab mengelola tata kelola administrasi dokumen harian, memastikan akurasi pencatatan data operasional, dan mendukung kelancaran koordinasi internal kantor.`;
    responsibilities = [
      'Melakukan pengarsipan berkas dokumen fisik maupun digital secara tertib dan terstruktur.',
      'Menginput data transaksi atau operasional ke dalam sistem spreadsheet/database perusahaan.',
      'Membantu korespondensi surat-menyurat dan penjadwalan aktivitas operasional kantor.',
      'Menyusun laporan rekapitulasi data administratif berkala untuk kebutuhan manajemen.',
    ];
    requirements = [
      'Pendidikan minimal SMA/SMK (Administrasi Perkantoran/Akuntansi diutamakan) atau D3/S1.',
      'Teliti, rapi, teratur, dan memiliki konsentrasi tinggi terhadap akurasi data.',
      'Menguasai Microsoft Office (Word, Excel) atau Google Workspace (Docs, Sheets).',
      'Mampu bekerja mandiri maupun berkoordinasi dalam tim.',
      `Bersedia bekerja di area ${location} (${workType}).`,
    ];
  } else if (
    normTitle.includes('akuntan') ||
    normTitle.includes('accounting') ||
    normTitle.includes('kasir') ||
    normTitle.includes('finance') ||
    normTitle.includes('keuangan') ||
    normTitle.includes('pajak') ||
    normTitle.includes('tax')
  ) {
    defaultDesc = `Posisi ${title} di ${company} memegang peranan krusial dalam mencatat sirkulasi keuangan, mengelola bukti transaksi, dan memastikan akurasi laporan pembukuan operasional sesuai prinsip akuntansi yang berlaku.`;
    responsibilities = [
      'Mencatat setiap transaksi pemasukan dan pengeluaran secara tepat waktu dan akurat.',
      'Melakukan pencocokan (rekonsiliasi) bukti pembayaran, kas, dan rekening koran.',
      'Menyimpan dan mengarsipkan faktur, kuitansi, serta dokumen perpajakan dengan rapi.',
      'Membantu penyusunan laporan keuangan harian, mingguan, maupun bulanan.',
    ];
    requirements = [
      'Pendidikan minimal SMK Akuntansi, D3, atau S1 Akuntansi / Keuangan / Manajemen.',
      'Memahami dasar-dasar siklus akuntansi, pembukuan, dan jurnal transaksi.',
      'Mahir mengoperasikan Microsoft Excel (fungsi VLOOKUP, SUMIFS, Pivot Table) atau software akuntansi.',
      'Jujur, memiliki integritas tinggi, dan teliti terhadap perhitungan angka.',
      `Penempatan kerja di wilayah ${location} (${workType}).`,
    ];
  } else if (
    normTitle.includes('developer') ||
    normTitle.includes('programmer') ||
    normTitle.includes('software') ||
    normTitle.includes('engineer') ||
    normTitle.includes('it ') ||
    normTitle.includes('frontend') ||
    normTitle.includes('backend') ||
    normTitle.includes('fullstack')
  ) {
    defaultDesc = `Sebagai ${title} di ${company}, kamu akan berkontribusi dalam merancang, membangun, dan memelihara aplikasi digital yang andal, aman, dan mudah digunakan untuk mendukung pertumbuhan ekosistem bisnis perusahaan.`;
    responsibilities = [
      'Menulis kode yang bersih, efisien, dan terdokumentasi dengan baik sesuai standar arsitektur.',
      'Mengembangkan fitur-fitur baru dan mengintegrasikan API dengan layanan backend/pihak ketiga.',
      'Melakukan identifikasi, debugging, dan perbaikan kendala performa sistem.',
      'Bekerja sama erat dengan tim produk, desainer UI/UX, dan QA untuk iterasi berkala.',
    ];
    requirements = [
      'Pendidikan SMK Rekayasa Perangkat Lunak, D3, atau S1 Teknik Informatika / Ilmu Komputer / pengalaman setara.',
      'Memahami logika algoritma pemrograman, struktur data, dan version control Git.',
      'Familiar dengan teknologi pengembangan web/mobile modern dan konsumsi REST API.',
      'Memiliki kemampuan pemecahan masalah yang baik dan kemauan belajar mandiri yang tinggi.',
      `Sistem kerja ${workType} dengan koordinasi di area ${location}.`,
    ];
  } else if (
    normTitle.includes('driver') ||
    normTitle.includes('kurir') ||
    normTitle.includes('gudang') ||
    normTitle.includes('logistik') ||
    normTitle.includes('operator') ||
    normTitle.includes('packer') ||
    normTitle.includes('packing')
  ) {
    defaultDesc = `Posisi ${title} di ${company} bertanggung jawab atas kelancaran alur logistik dan operasional pengiriman/pergudangan barang agar sampai ke tujuan dengan aman, utuh, dan tepat waktu.`;
    responsibilities = [
      'Menjalankan proses pemilahan, pemeriksaan kondisi, dan pengemasan barang sesuai SOP.',
      'Mengantar paket atau muatan ke alamat tujuan dengan rute yang efisien dan aman.',
      'Memastikan kelengkapan dokumen pengiriman (surat jalan/tanda terima) ditandatangani dengan benar.',
      'Menjaga kebersihan dan perawatan kendaraan/peralatan kerja operasional.',
    ];
    requirements = [
      'Pendidikan minimal SMP/SMA/SMK sederajat.',
      'Memiliki SIM aktif (SIM A/B/C) yang masih berlaku sesuai jenis armada yang digunakan.',
      'Kondisi fisik prima, jujur, disiplin, dan bertanggung jawab terhadap keutuhan barang.',
      'Menguasai area rute jalan lokal di sekitar wilayah penempatan.',
      `Lokasi penempatan: ${location} (${workType}).`,
    ];
  } else if (
    normTitle.includes('barista') ||
    normTitle.includes('waiter') ||
    normTitle.includes('kasir resto') ||
    normTitle.includes('kitchen') ||
    normTitle.includes('cook') ||
    normTitle.includes('crew store') ||
    normTitle.includes('pramuniaga')
  ) {
    defaultDesc = `Sebagai ${title} di ${company}, kamu menjadi garda terdepan dalam menyajikan produk makanan/minuman berkualitas tinggi, menjaga kebersihan outlet, dan memberikan pelayanan yang ramah bagi setiap pelanggan.`;
    responsibilities = [
      'Menyiapkan dan menyajikan produk sesuai standar resep, takaran, dan higienitas restoran.',
      'Menyambut pelanggan, mencatat pesanan dengan ramah, dan memproses pembayaran transaksi.',
      'Menjaga kebersihan, kerapian, dan sanitasi area dapur maupun dining area secara berkala.',
      'Melakukan pengecekan stok bahan baku dan mencatat kebutuhan persediaan outlet.',
    ];
    requirements = [
      'Pendidikan minimal SMA/SMK sederajat (Jurusan Tata Boga/Perhotelan menjadi nilai plus).',
      'Penampilan rapi, ramah, komunikatif, dan memiliki etos kerja yang positif.',
      'Cekatan, disiplin, dan bersedia bekerja dalam skema shift (termasuk akhir pekan/hari libur).',
      'Terbuka untuk lulusan baru (fresh graduate) yang bersemangat di bidang F&B / retail.',
      `Penempatan outlet: ${location} (${workType}).`,
    ];
  } else {
    defaultDesc = `Posisi ${title} di ${company} memegang peranan penting dalam menjalankan operasional harian, memastikan kelancaran alur kerja dan standar kualitas perusahaan, serta berkolaborasi aktif dengan anggota tim untuk mencapai target yang ditetapkan.`;
    responsibilities = [
      'Melaksanakan tugas operasional harian dan koordinasi kerja sesuai instruksi kerja (SOP).',
      'Memelihara standar kualitas hasil kerja dan memastikan penyelesaian tugas tepat waktu.',
      'Berkoordinasi dengan rekan kerja dan atasan langsung untuk memecahkan kendala teknis lapangan.',
      'Menyusun laporan singkat mengenai progres kerja dan pencapaian tugas secara berkala.',
    ];
    requirements = [
      'Pendidikan minimal SMA/SMK sederajat atau D3/S1 sesuai bidang terkait.',
      'Memiliki motivasi kerja yang tinggi, jujur, disiplin, dan mampu beradaptasi cepat.',
      'Mampu berkomunikasi dengan baik dan bekerja secara mandiri maupun dalam tim.',
      'Pengalaman kerja di bidang terkait menjadi nilai tambah (fresh graduate dipersilakan melamar).',
      `Penempatan kerja: ${location} (${workType}).`,
    ];
  }

  // Final Output
  const finalDescription = hasSubstantiveDesc ? cleanedDesc : defaultDesc;
  const finalRequirements =
    Array.isArray(rawReqs) && rawReqs.length > 0 ? rawReqs : requirements;

  return {
    description: finalDescription,
    responsibilities,
    requirements: finalRequirements,
  };
}
