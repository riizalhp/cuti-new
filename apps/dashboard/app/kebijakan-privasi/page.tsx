'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Lock,
  Shield,
  ShieldCheck,
  Printer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Eye,
  UserCheck,
  Cookie,
  Share2,
  Cpu,
  History,
  Scale,
  Mail,
  ExternalLink,
  ChevronRight,
  Info,
  BookOpen,
} from 'lucide-react';

const LAST_UPDATED = '15 September 2026';
const DPO_EMAIL = 'help.employr@outlook.com';
const SUPPORT_EMAIL = 'help.employr@outlook.com';

const TOC_ITEMS = [
  { id: 'identitas', label: '1. Identitas & Ruang Lingkup' },
  { id: 'kategori-data', label: '2. Kategori Data yang Dikumpulkan' },
  { id: 'dasar-hukum', label: '3. Dasar Hukum Pemrosesan' },
  { id: 'tujuan-pemrosesan', label: '4. Tujuan Spesifik Pemrosesan Data' },
  { id: 'cookie-teknologi', label: '5. Cookie & Penyimpanan Lokal' },
  { id: 'pihak-ketiga', label: '6. Pengungkapan & Sub-Prosesor' },
  { id: 'pemrosesan-otomatis', label: '7. Analisis Algoritmik & Asistensi' },
  { id: 'retensi-data', label: '8. Masa Retensi & Pemusnahan Data' },
  { id: 'keamanan-data', label: '9. Standar Keamanan & Insiden Data' },
  { id: 'hak-subjek-data', label: '10. Hak-Hak Subjek Data (UU PDP)' },
  { id: 'tata-cara-klaim', label: '11. Tata Cara Pengajuan Hak Data' },
  { id: 'data-anak', label: '12. Perlindungan Pengguna Usia Muda' },
  { id: 'transfer-lintas-batas', label: '13. Transfer Data Lintas Batas' },
  { id: 'perubahan-kebijakan', label: '14. Perubahan Kebijakan Sewaktu-waktu' },
  { id: 'kontak-resmi', label: '15. Kontak Petugas Pelindungan Data' },
];

export default function KebijakanPrivasiPage() {
  const [activeSection, setActiveSection] = useState<string>('identitas');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1738D1]/10 selection:text-[#1738D1]">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/beranda" className="flex items-center gap-2 group" aria-label="Beranda Employr">
              <Image
                src="/logo.webp"
                alt="Employr Logo"
                width={112}
                height={32}
                className="h-7 w-auto object-contain dark:brightness-0 dark:invert transition group-hover:opacity-90"
                priority
              />
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={12} className="shrink-0" />
              UU PDP No. 27/2022
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Cetak atau simpan dokumen ini sebagai PDF"
            >
              <Printer size={14} />
              <span>Cetak / PDF</span>
            </button>
            <Link
              href="/syarat-ketentuan"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1738D1] dark:hover:text-blue-400 transition"
            >
              <Scale size={14} />
              <span>Syarat & Ketentuan</span>
            </Link>
            <Link
              href="/beranda"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold text-white bg-[#1738D1] hover:bg-[#132EA8] shadow-sm transition"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Sidebar / Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <BookOpen size={14} className="text-[#1738D1]" />
                <span>Daftar Isi Kebijakan</span>
              </div>
              <nav className="mt-3 space-y-1 text-xs" aria-label="Daftar Isi">
                {TOC_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-[10px] transition flex items-center justify-between font-medium cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 font-bold border-l-3 border-[#1738D1]'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <ChevronRight size={12} className={`shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" />
                  <span>Waktu baca: ±12 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-emerald-500" />
                  <span>Yurisdiksi: Republik Indonesia</span>
                </div>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/60 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400 flex items-center gap-1.5">
                <Mail size={14} />
                <span>Pertanyaan Data Pribadi?</span>
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Punya pertanyaan mengenai hak subjek data atau ingin mengajukan permohonan penghapusan riwayat data?
              </p>
              <a
                href={`mailto:${DPO_EMAIL}?subject=Permohonan%20Hak%20Subjek%20Data%20Pribadi%20UU%20PDP`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline"
              >
                <span>{DPO_EMAIL}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </aside>

          {/* Right Main Content Column */}
          <main className="lg:col-span-8 space-y-8">
            {/* Document Header Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-[10px] font-bold bg-[#1738D1]/10 text-[#1738D1] dark:text-blue-400 border border-[#1738D1]/20">
                  DOKUMEN HUKUM RESMI
                </span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock size={13} />
                  Terakhir diperbarui: {LAST_UPDATED}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Kebijakan Privasi & Pelindungan Data Pribadi
                </h1>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  Bagaimana Employr mengumpulkan, menggunakan, menyimpan, membagikan, dan melindungi data pribadimu dengan standar kepatuhan menyeluruh mengacu pada Undang-Undang Republik Indonesia No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
                </p>
              </div>

              {/* Quick Summary Cards (Poin Kunci) */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Data Milikmu</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                    Kamu memegang kendali penuh atas informasi riwayat hidup dan dokumen kariermu.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Bukan Broker Data</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                    Kami tidak pernah memperjualbelikan data profil atau kontakmu kepada pihak ketiga untuk kepentingan iklan.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Hak Subjek Data</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                    Hak akses, perbaikan, penarikan persetujuan, hingga penghapusan permanen dapat diajukan kapan saja.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Policy Sections */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {/* 1. Identitas & Ruang Lingkup */}
              <article id="identitas" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Info size={16} />
                  <span>Pasal 1</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  1. Identitas Pengendali Data & Ruang Lingkup Kebijakan
                </h2>
                <div className="space-y-3">
                  <p>
                    Layanan platform digital <strong>Employr</strong> diselenggarakan dan dioperasikan oleh <strong>Employr</strong> yang berkedudukan di Semarang, Jawa Tengah, Republik Indonesia (selanjutnya disebut &ldquo;<strong>Employr</strong>&rdquo;, &ldquo;<strong>Kami</strong>&rdquo;, atau &ldquo;<strong>Pengendali Data Pribadi</strong>&rdquo;).
                  </p>
                  <p>
                    Kebijakan Privasi ini merupakan wujud komitmen nyata kami dalam menghormati dan melindungi seluruh hak privasi Pengguna (&ldquo;<strong>Kamu</strong>&rdquo; atau &ldquo;<strong>Subjek Data</strong>&rdquo;) yang mengakses atau menggunakan ekosistem layanan Employr, termasuk namun tidak terbatas pada:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Situs publik dan peramban web pada domain resmi <code className="text-slate-800 dark:text-slate-200 font-mono">employr.id</code> dan subdomain terkait;</li>
                    <li>Aplikasi web dashboard karier terintegrasi pada <code className="text-slate-800 dark:text-slate-200 font-mono">app.employr.id</code> (termasuk akses lokal http://localhost:3000);</li>
                    <li>Alat bantu penyusunan kurikulum vitae berstandar ATS (<em>ATS CV Builder</em>), pengunduh format cetak, dan modul evaluasi kesiapan kerja;</li>
                    <li>Pusat pelacakan aplikasi pekerjaan (<em>Kanban Job Application Tracker</em>);</li>
                    <li>Program interaktif Misi Karier harian dan sistem referensi (<em>Referral Cuan</em>);</li>
                    <li>Seluruh saluran korespondensi email resmi, formulir pendaftaran, dan sistem bantuan pelanggan Employr.</li>
                  </ul>
                  <p>
                    Dengan mendaftarkan akun, mengakses fitur, atau menyetujui formulir elektronik pada platform kami, Kamu menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan pemrosesan data pribadi sebagaimana diuraikan dalam Kebijakan Privasi ini.
                  </p>
                </div>
              </article>

              {/* 2. Kategori Data yang Dikumpulkan */}
              <article id="kategori-data" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Database size={16} />
                  <span>Pasal 2</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  2. Kategori Data Pribadi yang Kami Kumpulkan
                </h2>
                <p>
                  Sesuai dengan prinsip pembatasan tujuan dan minimalisasi data yang diamanatkan dalam UU PDP, kami hanya mengumpulkan data pribadi yang relevan dan dibutuhkan untuk menjalankan layanan persiapan karier secara optimal:
                </p>

                <div className="space-y-4 mt-2">
                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck size={16} className="text-[#1738D1]" />
                      <span>a. Data Identitas Diri & Kontak</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Nama lengkap, nama panggilan, alamat surat elektronik (email), nomor telepon / WhatsApp aktif, kota domisili atau provinsi, dan tautan profil profesional (seperti LinkedIn, GitHub, atau situs portofolio personal).
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={16} className="text-[#1738D1]" />
                      <span>b. Data Riwayat Hidup & Karier (Isi Dokumen CV)</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tingkat pendidikan terakhir, nama institusi pendidikan/almamater, jurusan/bidang studi, tahun kelulusan, ringkasan profil pribadi, riwayat pengalaman kerja profesional atau magang, riwayat kegiatan organisasi/kepanitiaan, daftar keahlian teknis dan non-teknis, riwayat pelatihan, sertifikasi lisensi, bahasa yang dikuasai, serta deskripsi proyek yang kamu masukkan atau unggah dalam format dokumen.
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Eye size={16} className="text-[#1738D1]" />
                      <span>c. Data Pelacakan Lamaran Kerja</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Nama institusi atau perusahaan tujuan lamaran, nama posisi jabatan pekerjaan, tahapan seleksi (misal: Terkirim, Seleksi Berkas, Interview HR, Assessment, Offering, Ditolak), catatan pribadi terkait proses rekrutmen, ekspektasi penawaran kompensasi, tanggal jadwal wawancara, serta tautan sumber informasi lowongan eksternal.
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Scale size={16} className="text-[#1738D1]" />
                      <span>d. Data Preferensi Layanan & Pengaturan Akun</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Preferensi tampilan antarmuka (mode terang atau gelap), pengaturan bahasa, riwayat penyimpanan draf dokumen, serta preferensi konfigurasi akun pribadi yang kamu simpan di dashboard.
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu size={16} className="text-[#1738D1]" />
                      <span>e. Data Program Misi & Komisi Referral</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Catatan penyelesaian misi karier, lampiran tautan bukti partisipasi misi, riwayat pendaftaran rujukan teman (referral), catatan akumulasi saldo komisi, serta nomor rekening bank atau akun dompet digital (e-wallet) yang kamu berikan secara sukarela untuk keperluan penarikan reward.
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield size={16} className="text-[#1738D1]" />
                      <span>f. Data Teknis Perangkat & Keamanan Log</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Alamat Protokol Internet (IP address), jenis dan peramban peramban (user agent), sistem operasi perangkat, resolusi tampilan layar, bahasa perangkat, waktu akses, serta rekam log audit keamanan untuk mendeteksi ancaman peretasan akun.
                    </p>
                  </div>
                </div>

                {/* Sensitive Data Notice */}
                <div className="p-4 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Pernyataan Mengenai Data Pribadi yang Bersifat Sensitif / Spesifik</span>
                  </div>
                  <p>
                    Employr <strong>TIDAK PERNAH</strong> mewajibkan atau secara sengaja meminta Data Pribadi yang Bersifat Spesifik sebagaimana tercantum pada Pasal 4 ayat (2) UU PDP — seperti catatan rekam medis, data biometrik, data genetika, pandangan politik, orientasi seksual, atau catatan kejahatan. Kami mengimbau Kamu untuk tidak mencantumkan informasi sensitif tersebut ke dalam kolom publik atau ringkasan CV kamu.
                  </p>
                </div>
              </article>

              {/* 3. Dasar Hukum Pemrosesan */}
              <article id="dasar-hukum" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 3</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  3. Dasar Hukum Pemrosesan Data Pribadi
                </h2>
                <p>
                  Berdasarkan ketentuan Pasal 20 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, setiap tindakan pemrosesan yang kami lakukan didasarkan pada landasan hukum yang sah:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200">
                      <tr>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Dasar Hukum UU PDP</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Cakupan Data</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Uraian Penerapan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Persetujuan Sah & Eksplisit (Consent)
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Data akun pendaftaran, nomor WhatsApp, preferensi karier, pengunggahan dokumen CV.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Kamu memberikan persetujuan saat menyelesaikan pendaftaran akun atau menyusun profil di dashboard.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Pelaksanaan Kewajiban Perjanjian (Contractual Necessity)
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Data profil CV, data akun pengguna, pelacakan kanban lamaran, dan dokumen karier.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Dibutuhkan secara mendasar untuk menyediakan fungsi penyusunan dokumen, pelacak lamaran, dan akses fitur platform.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Pemenuhan Kewajiban Hukum (Legal Obligation)
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Data akun pengguna dan rekaman kepatuhan sistem.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Memenuhi ketentuan regulasi transaksi sistem elektronik (PP PSTE) dan peraturan perundang-undangan Republik Indonesia.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Kepentingan yang Sah (Legitimate Interest)
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Alamat IP, log audit keamanan, data telemetri penggunaan fitur aplikasi.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Mencegah serangan peretasan (brute-force), manipulasi penipuan transaksi referral, serta optimasi performa platform.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              {/* 4. Tujuan Spesifik Pemrosesan Data */}
              <article id="tujuan-pemrosesan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <CheckCircle2 size={16} />
                  <span>Pasal 4</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  4. Tujuan Spesifik Penggunaan Data Pribadi
                </h2>
                <p>Kami memproses data pribadimu untuk tujuan spesifik sebagai berikut:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Penyusunan Format CV ATS</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Merender data pengalaman, pendidikan, dan keahlianmu ke dalam komponen desain siap cetak yang ramah pemindai Applicant Tracking System.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Analisis Kecocokan Lowongan</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Membantu membandingkan kata kunci pada riwayat profilmu terhadap kualifikasi lowongan pekerjaan yang ingin kamu lamar.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Manajemen Pelacakan Lamaran</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Menyimpan, memperbarui, dan mengorganisasikan alur lamaran kerja secara visual pada kanban board pribadi.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Aktivasi Fitur & Akses Layanan</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Mengaktifkan hak akses fitur dashboard, alat bantu karier, dan pengunduhan dokumen secara instan.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Penyaluran Dana Reward & Misi</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Memverifikasi keabsahan bukti partisipasi misi karier dan memproses transfer saldo pencairan ke rekening/e-wallet pengguna.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Komunikasi Akun & Keamanan</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Mengirimkan email verifikasi akun, tautan pemulihan kata sandi, dan peringatan keamanan sistem.
                    </p>
                  </div>
                </div>
              </article>

              {/* 5. Cookie & Penyimpanan Lokal */}
              <article id="cookie-teknologi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Cookie size={16} />
                  <span>Pasal 5</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  5. Penggunaan Cookie, Token Sesi, dan Penyimpanan Lokal
                </h2>
                <p>
                  Platform Employr memanfaatkan cookie teknis dan media penyimpanan peramban (<em>localStorage / sessionStorage</em>) yang bersifat esensial demi kelancaran operasional fungsional. Kami <strong>tidak menggunakan cookie pelacak pihak ketiga (third-party advertising trackers)</strong> untuk tujuan periklanan lintas situs:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200">
                      <tr>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Kunci Penyimpanan</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Kategori</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Fungsi Teknis</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Masa Simpan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-bold text-[#1738D1] dark:text-blue-400">
                          better-auth.session_token
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">Cookie Aman (HttpOnly, Secure)</td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Menyimpan token sesi terenkripsi untuk otentikasi identitas akun lintas subdomain platform.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">Sesuai durasi sesi aktif login (maks. 30 hari)</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                          theme-mode
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">localStorage</td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Mengingat preferensi tampilan antarmuka pengguna (mode terang / mode gelap).
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">Permanen di browser hingga direset</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                          employr_draft_cv_cache
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">localStorage</td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Menyimpan sementara draf perubahan formulir CV di sisi klien agar tidak hilang saat koneksi terputus tiba-tiba.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">Hingga draf disimpan ke server</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kamu dapat menonaktifkan penyimpanan cookie melalui konfigurasi peramban web kamu. Namun, mohon diperhatikan bahwa menonaktifkan cookie esensial dapat mengakibatkan kamu tidak dapat masuk atau mengakses akun dashboard kamu.
                </p>
              </article>

              {/* 6. Pengungkapan & Sub-Prosesor */}
              <article id="pihak-ketiga" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Share2 size={16} />
                  <span>Pasal 6</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  6. Pengungkapan Data Pribadi kepada Pihak Ketiga & Sub-Prosesor
                </h2>
                <div className="space-y-3">
                  <p>
                    Employr <strong>TIDAK PERNAH MENJUAL, MENYEWAKAN, ATAU MEMPERDAGANGKAN</strong> data pribadimu kepada pihak mana pun untuk keperluan komersial periklanan pihak ketiga. Pengungkapan data hanya dilakukan secara terbatas kepada pihak yang memenuhi syarat hukum di bawah ini:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Penyedia Layanan Infrastruktur & Transmisi Email (Resend / SMTP Gateway):</strong> Alamat email dan nama akun digunakan semata-mata untuk mengirimkan pesan operasional sistem (kode verifikasi masuk, pemulihan kata sandi, dan pemberitahuan layanan penting).
                    </li>
                    <li>
                      <strong>Infrastruktur Komputasi Berkeamanan Tinggi:</strong> Penyedia basis data terkelola (PostgreSQL) dan penyimpanan terenkripsi yang beroperasi di bawah perjanjian kerahasiaan dan kepatuhan standar keamanan data industri.
                    </li>
                    <li>
                      <strong>Kewajiban Penegakan Hukum:</strong> Kami dapat membuka data pribadi jika diwajibkan secara tegas oleh perintah pengadilan yang berkekuatan hukum tetap, panggilan resmi dari kepolisian, kejaksaan, atau otoritas penegak hukum yang berwenang di Republik Indonesia berdasarkan prosedur peraturan perundang-undangan.
                    </li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Seluruh sub-prosesor yang bekerja sama dengan Employr terikat secara hukum melalui perjanjian pemrosesan data (<em>Data Processing Agreement</em>) untuk memastikan perlindungan data setara dengan standar UU PDP.
                  </p>
                </div>
              </article>

              {/* 7. Analisis Algoritmik & Asistensi */}
              <article id="pemrosesan-otomatis" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Cpu size={16} />
                  <span>Pasal 7</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  7. Transparansi Analisis Algoritmik & Fitur Bantuan Pemrosesan
                </h2>
                <div className="space-y-3">
                  <p>
                    Untuk mempermudah persiapan karier Pengguna, sistem Employr menyediakan fitur analisis otomatis dan perapian teks kurikulum vitae:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Sistem Skor Kompatibilitas ATS:</strong> Sistem algoritmik menganalisis susunan tata letak, keterbacaan teks, dan kepadatan kata kunci pada berkas CV kamu dibandingkan dengan format baku industri rekrutmen modern.
                    </li>
                    <li>
                      <strong>Rekomendasi Penyesuaian Kata Kunci:</strong> Sistem memberikan masukan kata kerja aksi dan keterampilan teknis yang disarankan untuk ditambahkan ke draf CV kamu.
                    </li>
                    <li>
                      <strong>Bukan Penentu Keputusan Seleksi:</strong> Hasil analisis skor atau evaluasi yang disajikan sistem bersifat <em>asistensi konsultatif murni</em> dan bukan merupakan keputusan hukum yang mengikat. Employr tidak menentukan kelulusan penerimaan kerja kamu pada perusahaan target.
                    </li>
                    <li>
                      <strong>Kontrol Manusia:</strong> Kamu memegang hak mutlak untuk menyetujui, menyunting, atau menolak setiap saran yang dihasilkan sistem sebelum berkas CV diunduh atau digunakan.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 8. Masa Retensi & Pemusnahan Data */}
              <article id="retensi-data" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <History size={16} />
                  <span>Pasal 8</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  8. Jangka Waktu Penyimpanan (Retensi) & Prosedur Pemusnahan Data
                </h2>
                <p>
                  Kami hanya menyimpan data pribadimu selama diperlukan untuk merealisasikan tujuan pengumpulan data, atau untuk mematuhi kewajiban hukum yang berlaku di Indonesia:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200">
                      <tr>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Kategori Data</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Periode Retensi Data</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Tindakan Pasca Kedaluwarsa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Draf CV Pengguna Gratis (Free Tier)
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          <strong>7 (tujuh) hari kalender</strong> sejak draf terakhir dibuat atau diperbarui.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Dibersihkan dan dihapus secara otomatis dari basis data aktif apabila tidak disimpan atau diperbarui.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Data Dokumen CV & Profil Akun Pengguna
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          <strong>Selama akun Pengguna berstatus aktif</strong> dalam platform Employr.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Dihapus permanen maksimal 14 hari kerja apabila Pengguna mengajukan permohonan penutupan akun resmi.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Data Pelacakan Kanban Lamaran
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Tanpa batas waktu (unlimited) selama akun Pengguna aktif.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Dihapus secara mandiri oleh Pengguna atau saat akun dihapus secara menyeluruh.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                          Log Keamanan & Audit IP
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Maksimal 12 (dua belas) bulan sejak rekaman dicatat.
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-800">
                          Dihapus secara rotasi otomatis oleh sistem pemeliharaan berkala.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              {/* 9. Standar Keamanan & Insiden Data */}
              <article id="keamanan-data" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Lock size={16} />
                  <span>Pasal 9</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  9. Standar Keamanan Data Teknis & Prosedur Tanggap Insiden
                </h2>
                <div className="space-y-3">
                  <p>
                    Kami menerapkan standar perlindungan keamanan fisik, teknis, dan administratif berlapis untuk mencegah akses tidak sah, kebocoran, pengubahan, atau perusakan data pribadi Pengguna:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Enkripsi Transit (In-Transit):</strong> Seluruh data yang ditransmisikan antara peramban Pengguna dan server Employr diamankan menggunakan protokol kriptografi Transport Layer Security (TLS 1.3 / HTTPS).
                    </li>
                    <li>
                      <strong>Pengamanan Kredensial Kata Sandi:</strong> Kata sandi akun tidak pernah disimpan dalam format teks biasa (plain text), melainkan dienkripsi menggunakan fungsi hash satu arah tingkat tinggi (salted hashing).
                    </li>
                    <li>
                      <strong>Pembatasan Hak Akses Minimum:</strong> Akses ke basis data produksi dibatasi hanya untuk staf teknis berwenang melalui jaringan terproteksi dan autentikasi multi-faktor.
                    </li>
                  </ul>

                  {/* Incident response banner */}
                  <div className="mt-3 p-4 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Prosedur Notifikasi Insiden Kebocoran Data (Pasal 46 UU PDP)</span>
                    </div>
                    <p>
                      Apabila terjadi insiden kegagalan perlindungan data pribadi (data breach) yang terkonfirmasi berdampak pada data akunmu, Employr berkomitmen mengirimkan pemberitahuan tertulis kepada Pengguna terdampak serta Lembaga Pelindungan Data Pribadi yang berwenang paling lambat dalam waktu <strong>3 x 24 jam kalender</strong> sejak insiden diketahui, disertai rincian data yang terkompromi dan langkah mitigasi pemulihan yang dilakukan.
                    </p>
                  </div>
                </div>
              </article>

              {/* 10. Hak-Hak Subjek Data (UU PDP) */}
              <article id="hak-subjek-data" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <UserCheck size={16} />
                  <span>Pasal 10</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  10. Hak-Hak Subjek Data Berdasarkan UU PDP
                </h2>
                <p>
                  Sesuai dengan Pasal 5 sampai dengan Pasal 13 Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, sebagai Subjek Data kamu memiliki hak-hak hukum sebagai berikut:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">1. Hak Mendapatkan Informasi (Pasal 5)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk mengetahui identitas pengendali, tujuan pemrosesan data, dan akuntabilitas penggunaan informasi pribadimu.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">2. Hak Mengakses & Memperoleh Salinan (Pasal 6)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk meminta konfirmasi serta mendapatkan salinan riwayat data pribadi yang tersimpan dalam sistem kami.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">3. Hak Melengkapi & Memperbaiki (Pasal 7)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk mengoreksi ketidakakuratan atau ketidaklengkapan data riwayat hidup pada profil kamu secara mandiri atau lewat tim bantuan.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">4. Hak Mengakhiri & Menghapus Data (Pasal 8)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk meminta penghapusan permanen (Right to Erasure) atas data akun dan seluruh berkas CV yang pernah kamu unggah.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">5. Hak Menarik Kembali Persetujuan (Pasal 9)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk mencabut persetujuan pemrosesan data yang sebelumnya kamu berikan tanpa membatalkan keabsahan proses terdahulu.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">6. Hak Menunda atau Membatasi Pemrosesan (Pasal 10)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk meminta penangguhan sementara atas pemrosesan data tertentu saat terdapat sengketa keakuratan data.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">7. Hak Mengajukan Keberatan Otomatis (Pasal 11)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk menolak atau meminta peninjauan oleh manusia atas evaluasi yang dihasilkan secara algoritmik murni.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">8. Hak Portabilitas Data (Pasal 13)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak untuk menerima data pribadimu dalam format digital terstruktur yang lazim digunakan secara umum (JSON / PDF).
                    </p>
                  </div>
                </div>
              </article>

              {/* 11. Tata Cara Pengajuan Hak Data */}
              <article id="tata-cara-klaim" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Mail size={16} />
                  <span>Pasal 11</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  11. Prosedur & Batas Waktu Tanggapan Pengajuan Hak Data
                </h2>
                <div className="space-y-3">
                  <p>
                    Pengguna dapat menjalankan hak-hak subjek data pribadinya dengan mekanisme sebagai berikut:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Pengajuan Mandiri:</strong> Sebagian besar pembaruan profil, pengubahan kata sandi, dan penghapusan catatan pelacak lamaran dapat dilakukan langsung melalui menu <em>Pengaturan Akun</em> pada dashboard.
                    </li>
                    <li>
                      <strong>Pengajuan Tertulis Resmi:</strong> Untuk permintaan salinan data komprehensif, pencabutan persetujuan menyeluruh, atau permohonan penutupan dan penghapusan akun permanen, kirimkan surat elektronik resmi ke <a href={`mailto:${DPO_EMAIL}`} className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">{DPO_EMAIL}</a> dengan subjek formulir: <code>[PERMOHONAN HAK SUBJEK DATA - NAMA LENGKAP - EMAIL AKUN]</code>.
                    </li>
                    <li>
                      <strong>Proses Verifikasi Identitas:</strong> Demi melindungi kerahasiaan datamu dan mencegah pihak tidak bertanggung jawab mengambil alih informasi akunmu, kami akan melakukan verifikasi kepemilikan akun melalui email terdaftar sebelum memproses permohonan.
                    </li>
                    <li>
                      <strong>Waktu Tanggapan (SLA Kepatuhan):</strong> Permohonan yang telah terverifikasi akan ditindaklanjuti dan diselesaikan dalam jangka waktu maksimal <strong>14 (empat belas) hari kerja</strong> sejak verifikasi identitas tuntas, sebagaimana disyaratkan oleh regulasi pelindungan data Indonesia.
                    </li>
                  </ol>
                </div>
              </article>

              {/* 12. Perlindungan Pengguna Usia Muda */}
              <article id="data-anak" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Shield size={16} />
                  <span>Pasal 12</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  12. Perlindungan Privasi Pengguna Usia Muda
                </h2>
                <div className="space-y-3">
                  <p>
                    Layanan platform Employr ditujukan untuk siswa SMA/SMK, mahasiswa, dan lulusan baru (fresh graduates) yang sedang mempersiapkan langkah karier dan magang dengan batasan usia pengguna <strong>minimal 16 (enam belas) tahun</strong>.
                  </p>
                  <p>
                    Bagi Pengguna yang berusia di bawah 18 (delapan belas) tahun dan belum menikah menurut hukum yang berlaku di Indonesia, pendaftaran akun dan pemberian persetujuan atas pemrosesan data pribadi wajib dilakukan dengan sepengetahuan dan persetujuan orang tua atau wali sah. Apabila orang tua atau wali mengetahui bahwa anak di bawah bimbingannya mendaftarkan data tanpa persetujuan, silakan hubungi kami untuk tindakan penghapusan data secara tuntas.
                  </p>
                </div>
              </article>

              {/* 13. Transfer Data Lintas Batas */}
              <article id="transfer-lintas-batas" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <ExternalLink size={16} />
                  <span>Pasal 13</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  13. Transfer Data Pribadi Lintas Batas (Kepatuhan Pasal 56 UU PDP)
                </h2>
                <div className="space-y-3">
                  <p>
                    Dalam menjalankan infrastruktur sistem komputasi awan (cloud) berstandar global, sebagian data teknis atau komunikasi terenkripsi dapat diproses melalui pusat data yang berlokasi di luar yurisdiksi Indonesia.
                  </p>
                  <p>
                    Sesuai amanat Pasal 56 UU PDP, Employr memastikan bahwa setiap penyedia pusat data dan mitra teknologi global yang kami tunjuk berada di negara yang memiliki standar regulasi pelindungan data pribadi yang setara atau lebih tinggi, atau telah menandatangani ikatan kontrak klausul standar perlindungan data (Standard Contractual Clauses) yang berkekuatan hukum mengikat.
                  </p>
                </div>
              </article>

              {/* 14. Pembaruan Kebijakan Privasi */}
              <article id="perubahan-kebijakan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Clock size={16} />
                  <span>Pasal 14</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  14. Perubahan Kebijakan Sewaktu-waktu & Pembaruan Ketentuan
                </h2>
                <div className="space-y-3">
                  <p>
                    Employr memiliki hak penuh untuk sewaktu-waktu meninjau, memodifikasi, menambah, mengurangi, atau memperbarui isi Kebijakan Privasi ini secara sepihak guna menyesuaikan dengan perkembangan operasional fitur produk, peningkatan arsitektur keamanan siber, maupun kepatuhan terhadap regulasi perundang-undangan Republik Indonesia yang baru.
                  </p>
                  <p>
                    Setiap versi pembaruan akan selalu ditandai dengan tanggal pembaruan terakhir di bagian atas dokumen ini. Untuk perubahan yang bersifat material atau substantif terhadap hak pengguna, Employr akan memberikan pemberitahuan yang wajar melalui banner notifikasi di dalam dashboard atau melalui surat elektronik ke email terdaftar Kamu sebelum ketentuan baru berlaku efektif.
                  </p>
                  <p className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <strong>Pemberitahuan Persetujuan Lanjutan (Tacit Consent):</strong> Dengan tetap mengakses, menjelajah, atau menggunakan layanan Employr setelah tanggal berlakunya pembaruan Kebijakan Privasi, Kamu dianggap telah membaca, memahami, dan secara sah mengikatkan diri terhadap seluruh ketentuan versi pembaruan tersebut.
                  </p>
                </div>
              </article>

              {/* 15. Kontak Resmi Petugas Pelindungan Data */}
              <article id="kontak-resmi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Mail size={16} />
                  <span>Pasal 15</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  15. Kontak Resmi Penyelenggara & Petugas Pelindungan Data (DPO)
                </h2>
                <div className="space-y-4">
                  <p>
                    Jika Kamu memiliki pertanyaan, kendala teknis terkait hak privasi, atau hendak menyampaikan pengaduan resmi mengenai penanganan data pribadi di platform Employr, silakan hubungi saluran resmi kami:
                  </p>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">Penyelenggara Sistem Elektronik:</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Employr Indonesia</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">Kedudukan Operasional:</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Semarang, Jawa Tengah, Indonesia</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">Email Layanan Bantuan & DPO:</span>
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">Threads Resmi:</span>
                      <a href="https://www.threads.net/@employr.id" target="_blank" rel="noopener noreferrer" className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">
                        @employr.id
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 dark:text-white">DM Threads:</span>
                      <a href="https://www.threads.net/@riizalhp" target="_blank" rel="noopener noreferrer" className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">
                        @riizalhp
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kamu juga memiliki hak untuk menyampaikan laporan atau permohonan sengketa kepada Komisi Pelindungan Data Pribadi / Kementerian Komunikasi dan Digital Republik Indonesia apabila permohonan hak subjek datamu tidak memperoleh tanggapan yang patut sesuai ketentuan peraturan perundang-undangan.
                  </p>
                </div>
              </article>
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <p>© {new Date().getFullYear()} Employr. Seluruh hak dilindungi undang-undang.</p>
              <div className="flex items-center gap-4 font-semibold">
                <Link href="/syarat-ketentuan" className="text-[#1738D1] dark:text-blue-400 hover:underline">
                  Syarat & Ketentuan Layanan
                </Link>
                <span>·</span>
                <Link href="/beranda" className="text-slate-700 dark:text-slate-300 hover:underline">
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
