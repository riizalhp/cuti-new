/**
 * Kamus Normalisasi Kata Gaul, Singkatan (Slang), dan Sinonim Karir
 * Terinspirasi dari repositori open-source NLP Bahasa Indonesia
 * (nasalsabila/kamus-alay & fendiirfan/Kamus-Alay) yang disesuaikan
 * dengan domain aplikasi Employr (CV, Tracker, Loker, Misi, Referral).
 */

export const SLANG_AND_SYNONYM_MAP: Record<string, string> = {
  // === 1. Pertanyaan, Aksi & Kata Kerja Percakapan ===
  gmn: "cara",
  gmana: "cara",
  gemana: "cara",
  gimana: "cara",
  gimane: "cara",
  bgmn: "cara",
  bgm: "cara",
  bgaimana: "cara",
  bagaimna: "cara",
  gimanakah: "cara",
  caranya: "cara",
  tutorial: "cara",
  panduan: "cara",
  petunjuk: "cara",
  tips: "cara",
  tutor: "cara",

  bikin: "buat",
  bkin: "buat",
  bwat: "buat",
  mbikin: "buat",
  mbuat: "buat",
  bikinin: "buat",
  membuat: "buat",
  pembuatan: "buat",
  susun: "buat",
  menyusun: "buat",

  donlot: "cetak",
  donlod: "cetak",
  dowlod: "cetak",
  download: "cetak",
  unduh: "cetak",
  unduhan: "cetak",
  ngunduh: "cetak",
  save: "cetak",
  nyimpen: "cetak",
  simpan: "cetak",
  ngeprint: "cetak",
  print: "cetak",
  printer: "cetak",
  mencetak: "cetak",
  ekspor: "cetak",
  export: "cetak",

  liat: "lihat",
  lhat: "lihat",
  ngeliat: "lihat",
  nengok: "lihat",
  view: "lihat",
  preview: "lihat",
  intip: "lihat",
  melihat: "lihat",
  tinjau: "lihat",

  ganti: "ubah",
  ngedit: "ubah",
  edit: "ubah",
  revisi: "ubah",
  rubah: "ubah",
  merubah: "ubah",
  rombak: "ubah",
  perbarui: "ubah",
  update: "ubah",
  mengubah: "ubah",

  ilang: "hapus",
  hilang: "hapus",
  hlg: "hapus",
  lenyap: "hapus",
  kehapus: "hapus",
  terhapus: "hapus",
  kebuang: "hapus",
  delete: "hapus",
  menghapus: "hapus",

  gabisa: "kendala",
  gbs: "kendala",
  gabz: "kendala",
  eror: "kendala",
  error: "kendala",
  rusak: "kendala",
  bug: "kendala",
  trouble: "kendala",
  gangguan: "kendala",
  gagal: "kendala",
  crash: "kendala",
  stuck: "kendala",
  hang: "kendala",
  lemot: "kendala",
  loading: "kendala",
  masalah: "kendala",

  blm: "belum",
  belom: "belum",
  blom: "belum",
  bleum: "belum",

  udh: "sudah",
  uda: "sudah",
  udah: "sudah",
  sdh: "sudah",

  gak: "tidak",
  ga: "tidak",
  gk: "tidak",
  ngga: "tidak",
  nggak: "tidak",
  tdk: "tidak",
  enggak: "tidak",

  bs: "bisa",
  bza: "bisa",
  bisaan: "bisa",
  dpt: "dapat",
  dapet: "dapat",
  dpat: "dapat",
  dapetnya: "dapat",
  mendapatkan: "dapat",
  peroleh: "dapat",

  pengen: "ingin",
  mau: "ingin",
  mw: "ingin",
  pgn: "ingin",
  pgen: "ingin",

  hubungi: "kontak",
  hub: "kontak",
  cs: "kontak",
  admin: "kontak",
  helpdesk: "kontak",
  support: "kontak",
  komplain: "kontak",
  pengaduan: "kontak",
  lapor: "kontak",
  chat: "kontak",
  wa: "kontak",
  whatsapp: "kontak",
  threads: "kontak",

  // === 2. Domain CV, ATS, Resume & Format ===
  resume: "cv",
  riwayat: "cv",
  biodata: "cv",
  curriculum: "cv",
  vitae: "cv",
  portofolio: "cv",
  porto: "cv",
  portofolionya: "cv",
  curiculum: "cv",

  ats: "ats",
  atsfriendly: "ats",
  score: "ats",
  skor: "ats",
  nilai: "ats",
  screener: "ats",
  evaluasi: "ats",
  review: "ats",
  analisis: "ats",
  analisa: "ats",
  penilaian: "ats",
  optimasi: "ats",
  optimalkan: "ats",

  template: "desain",
  layout: "desain",
  tampilan: "desain",
  model: "desain",
  tema: "desain",
  warna: "desain",

  pdf: "pdf",
  dokumen: "pdf",
  file: "pdf",
  kertas: "pdf",
  a4: "pdf",

  // === 3. Domain Loker, Lamaran & Tracker ===
  loker: "loker",
  lowongan: "loker",
  lowker: "loker",
  job: "loker",
  jobs: "loker",
  karir: "loker",
  karier: "loker",
  pekerjaan: "loker",
  kerja: "loker",
  kerjaan: "loker",
  posisi: "loker",
  magang: "loker",
  internship: "loker",
  intern: "loker",
  parttime: "loker",
  fulltime: "loker",
  freelance: "loker",

  ngelamar: "lamaran",
  melamar: "lamaran",
  lamar: "lamaran",
  apply: "lamaran",
  kiriman: "lamaran",
  pengajuan: "lamaran",
  submit: "lamaran",

  tracker: "tracker",
  tracking: "tracker",
  pelacak: "tracker",
  kanban: "tracker",
  tahapan: "tracker",
  progress: "tracker",
  progres: "tracker",
  pantau: "tracker",
  memantau: "tracker",
  catat: "tracker",
  mencatat: "tracker",

  interview: "interview",
  wawancara: "interview",
  user: "interview",
  hrd: "interview",
  jadwal: "jadwal",
  agenda: "jadwal",
  reminder: "pengingat",
  pengingat: "pengingat",
  star: "star",

  offering: "offering",
  offer: "offering",
  penawaran: "offering",
  diterima: "offering",
  lolos: "offering",
  tawaran: "offering",
  gaji: "gaji",
  salary: "gaji",
  upah: "gaji",
  remunerasi: "gaji",
  kontrak: "kontrak",
  probation: "probation",
  percobaan: "probation",
  negosiasi: "negosiasi",
  nego: "negosiasi",
  counteroffer: "negosiasi",
  bpjs: "bpjs",
  jamsostek: "bpjs",
  thr: "thr",
  denda: "denda",
  penalty: "denda",

  ditolak: "ditolak",
  gugur: "ditolak",
  reject: "ditolak",
  rejection: "ditolak",
  rejek: "ditolak",

  // === 3b. Domain Career Intelligence, Mailer & Lapor Bug ===
  intel: "intelligence",
  intelligence: "intelligence",
  benchmark: "benchmark",
  radar: "kompetensi",
  kompetensi: "kompetensi",
  skillgap: "skill",

  mailer: "mailer",
  surel: "email",
  email: "email",
  subjek: "subject",
  subject: "subject",
  lampiran: "lampiran",
  attachment: "lampiran",

  laporbug: "lapor",
  tiket: "tiket",
  screenshot: "screenshot",
  saran: "saran",
  aspirasi: "saran",
  usul: "saran",
  usulan: "saran",
  roadmap: "roadmap",
  upvote: "saran",

  restore: "restore",
  unhide: "restore",
  munculkan: "restore",
  herdi: "herdi",
  pdp: "pdp",
  portabilitas: "pdp",
  dark: "tema",
  gelap: "tema",
  terang: "tema",
  theme: "tema",

  impor: "scraper",
  import: "scraper",
  psikotes: "kuis",
  tpa: "kuis",
  assessment: "kuis",
  asesmen: "kuis",
  tryout: "kuis",

  // === 4. Domain Misi, Saldo, Cuan, Referral & Payout ===
  cuan: "saldo",
  duit: "saldo",
  uang: "saldo",
  penghasilan: "saldo",
  bonus: "saldo",
  income: "saldo",
  komisi: "saldo",
  reward: "saldo",
  hadiah: "saldo",
  point: "saldo",
  poin: "saldo",
  koin: "saldo",
  coin: "saldo",

  misi: "misi",
  task: "misi",
  quest: "misi",
  tugas: "misi",
  daily: "misi",
  harian: "misi",
  checkin: "misi",
  absen: "misi",
  absensi: "misi",

  wd: "pencairan",
  withdraw: "pencairan",
  withdrawal: "pencairan",
  narik: "pencairan",
  tarik: "pencairan",
  cair: "pencairan",
  cairkan: "pencairan",
  pencairan: "pencairan",
  tariktunai: "pencairan",

  tf: "rekening",
  transfer: "rekening",
  rekening: "rekening",
  rek: "rekening",
  bank: "rekening",
  bca: "rekening",
  mandiri: "rekening",
  bri: "rekening",
  bni: "rekening",
  dana: "rekening",
  gopay: "rekening",
  ovo: "rekening",
  shopeepay: "rekening",
  ewallet: "rekening",
  dompet: "rekening",

  ref: "referral",
  referal: "referral",
  refeal: "referral",
  referral: "referral",
  afiliasi: "referral",
  affiliate: "referral",
  ajak: "referral",
  teman: "referral",
  kawan: "referral",
  kode: "referral",
  koderef: "referral",
  link: "referral",
  tautan: "referral",
  undangan: "referral",

  // === 5. Domain Pembayaran & Membership ===
  beli: "pembayaran",
  bayar: "pembayaran",
  transaksi: "pembayaran",
  checkout: "pembayaran",
  midtrans: "pembayaran",
  qris: "pembayaran",
  harga: "pembayaran",
  biaya: "pembayaran",
  tarif: "pembayaran",
  tagihan: "pembayaran",
  invoice: "pembayaran",

  paket: "membership",
  member: "membership",
  membership: "membership",
  langganan: "membership",
  upgrade: "membership",
  berbayar: "membership",
  pro: "membership",
  premium: "membership",
  lifetime: "membership",
  selamanya: "membership",
  vip: "membership",

  gratis: "gratis",
  free: "gratis",
  gratisan: "gratis",
  trial: "gratis",
  coba: "gratis",
  freemium: "gratis",

  refund: "refund",
  batal: "refund",
  batalkan: "refund",
  kembali: "refund",
  kembalian: "refund",

  // === 6. Domain Akun, Autentikasi & Profil ===
  login: "akun",
  masuk: "akun",
  signin: "akun",
  daftar: "akun",
  register: "akun",
  signup: "akun",
  registrasi: "akun",
  gabung: "akun",

  lupa: "password",
  reset: "password",
  sandi: "password",
  password: "password",
  pass: "password",
  katasandi: "password",
  otp: "password",
  pin: "password",

  profil: "profil",
  profile: "profil",
  avatar: "profil",
  foto: "profil",
  identitas: "profil",
  nama: "profil",
  bio: "profil",
  kontakprofil: "profil",
};

/**
 * Normalisasi satu kata ke bentuk kanonikal (jika ada di kamus slang).
 */
export function normalizeSlang(token: string): string {
  const lower = token.toLowerCase();
  return SLANG_AND_SYNONYM_MAP[lower] || lower;
}

/**
 * Lemmatizer ringan Bahasa Indonesia (menghilangkan klitika & afiks umum)
 * untuk memperluas pencocokan kata berimbuhan tanpa bergantung pada library eksternal.
 */
export function simpleIndonesianStem(word: string): string[] {
  let w = word.toLowerCase();
  if (w.length <= 3) return [w];

  const variants: string[] = [w];

  // 1. Klitika kepunyaan & partikel: -lah, -kah, -pun, -nya, -ku, -mu
  const cliticRe = /(?:lah|kah|pun|nya|ku|mu)$/;
  if (cliticRe.test(w) && w.length > 5) {
    w = w.replace(cliticRe, "");
    variants.push(w);
  }

  // 2. Sufiks: -kan, -an, -i
  if (w.endsWith("kan") && w.length > 5) {
    variants.push(w.slice(0, -3));
  } else if (w.endsWith("an") && w.length > 4) {
    variants.push(w.slice(0, -2));
  } else if (w.endsWith("i") && w.length > 4) {
    variants.push(w.slice(0, -1));
  }

  // 3. Prefiks umum: me(ng/ny/m/n)-, pe(ng/ny/m/n)-, di-, ter-, ber-, per-
  for (const base of [...variants]) {
    if (base.length <= 4) continue;
    if (base.startsWith("meng") && base.length > 6) {
      variants.push(base.slice(4));
      variants.push("k" + base.slice(4));
    } else if (base.startsWith("meny") && base.length > 6) {
      variants.push("s" + base.slice(4));
    } else if (base.startsWith("mem") && base.length > 5) {
      variants.push(base.slice(3));
      variants.push("p" + base.slice(3));
    } else if (base.startsWith("men") && base.length > 5) {
      variants.push(base.slice(3));
      variants.push("t" + base.slice(3));
    } else if (base.startsWith("peng") && base.length > 6) {
      variants.push(base.slice(4));
    } else if (base.startsWith("peny") && base.length > 6) {
      variants.push("s" + base.slice(4));
    } else if (base.startsWith("pem") && base.length > 5) {
      variants.push(base.slice(3));
      variants.push("p" + base.slice(3));
    } else if (base.startsWith("pen") && base.length > 5) {
      variants.push(base.slice(3));
    } else if (base.startsWith("per") && base.length > 5) {
      variants.push(base.slice(3));
    } else if (base.startsWith("pe") && base.length > 4) {
      variants.push(base.slice(2));
    } else if (base.startsWith("ber") && base.length > 5) {
      variants.push(base.slice(3));
    } else if (base.startsWith("ter") && base.length > 5) {
      variants.push(base.slice(3));
    } else if (base.startsWith("di") && base.length > 4) {
      variants.push(base.slice(2));
    }
  }

  return Array.from(new Set(variants.filter((v) => v.length >= 2)));
}

/**
 * Ekspansi token: menghasilkan token asli + bentuk dasar (stem) + token kanonikal slang
 * agar pencocokan leksikal & semantik bekerja optimal dua arah.
 */
export function expandTokensWithSlang(tokens: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const add = (w: string) => {
    if (w && !seen.has(w)) {
      result.push(w);
      seen.add(w);
    }
  };

  for (const t of tokens) {
    add(t);

    const normalized = normalizeSlang(t);
    if (normalized !== t) {
      add(normalized);
    }

    const stems = simpleIndonesianStem(t);
    for (const s of stems) {
      add(s);
      const stemNorm = normalizeSlang(s);
      if (stemNorm !== s) {
        add(stemNorm);
      }
    }
  }

  return result;
}

