'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Printer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  Gift,
  Scale,
  Ban,
  HelpCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  Info,
  BookOpen,
  Lock,
} from 'lucide-react';

const LAST_UPDATED = '15 September 2026';
const LEGAL_EMAIL = 'help.employr@outlook.com';
const SUPPORT_EMAIL = 'help.employr@outlook.com';

const TOC_ITEMS = [
  { id: 'identitas-perikatan', label: '1. Perikatan Elektronik Sah' },
  { id: 'definisi', label: '2. Definisi Istilah Operasional' },
  { id: 'kelayakan-akun', label: '3. Syarat Kelayakan & Akun' },
  { id: 'kebenaran-konten', label: '4. Tanggung Jawab Data CV' },
  { id: 'penafian-karier', label: '5. Penafian Jaminan Kerja' },
  { id: 'perubahan-layanan', label: '6. Modifikasi Layanan Sewaktu-waktu' },
  { id: 'misi-referral-fraud', label: '7. Ketentuan Misi & Referral' },
  { id: 'haki', label: '8. Hak Kekayaan Intelektual' },
  { id: 'kebijakan-penggunaan', label: '9. Batasan Penggunaan Platform' },
  { id: 'pembatasan-tanggung-jawab', label: '10. Pembatasan Tanggung Jawab' },
  { id: 'ganti-rugi', label: '11. Klausul Ganti Rugi' },
  { id: 'penangguhan-pemutusan', label: '12. Penangguhan & Pemutusan Akun' },
  { id: 'keadaan-kahar', label: '13. Keadaan Kahar (Force Majeure)' },
  { id: 'hukum-sengketa', label: '14. Hukum & Penyelesaian Sengketa' },
  { id: 'penutup-layanan', label: '15. Ketentuan Penutup & Pengaduan' },
];

export default function SyaratKetentuanPage() {
  const [activeSection, setActiveSection] = useState<string>('identitas-perikatan');

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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Scale size={12} className="shrink-0" />
              KUHPerdata & UU ITE
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
              href="/kebijakan-privasi"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1738D1] dark:hover:text-blue-400 transition"
            >
              <ShieldCheck size={14} />
              <span>Kebijakan Privasi</span>
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
          {/* Left Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <BookOpen size={14} className="text-[#1738D1]" />
                <span>Daftar Isi Syarat Layanan</span>
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
                  <span>Waktu baca: ±15 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale size={12} className="text-blue-600" />
                  <span>Yurisdiksi: Pengadilan Negeri Semarang</span>
                </div>
              </div>
            </div>

            {/* Legal Help Box */}
            <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#1738D1]" />
                <span>Konsultasi Legalitas Layanan</span>
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Memerlukan klarifikasi mengenai ketentuan layanan, hak kekayaan intelektual, atau penggunaan platform?
              </p>
              <a
                href={`mailto:${LEGAL_EMAIL}?subject=Pertanyaan%20Legalitas%20Syarat%20Ketentuan%20Employr`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline"
              >
                <span>{LEGAL_EMAIL}</span>
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
                  PERJANJIAN ELEKTRONIK MENGIKAT
                </span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock size={13} />
                  Terakhir diperbarui: {LAST_UPDATED}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Syarat & Ketentuan Penggunaan Layanan
                </h1>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  Perjanjian hukum yang mengikat antara Pengguna dan Penyelenggara Layanan platform Employr. Harap membaca seluruh ketentuan ini secara seksama sebelum membuat akun, menyusun CV ATS, atau menggunakan seluruh fitur layanan yang tersedia.
                </p>
              </div>

              {/* Quick Summary Cards (Poin Kunci) */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Clock size={14} className="text-[#1738D1] dark:text-blue-400" />
                    <span>Dapat Berubah Sewaktu-waktu</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                    Employr berhak memperbarui ketentuan & layanan secara berkala dengan notifikasi yang wajar.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Bukan Penyalur Tenaga Kerja</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                    Employr menyediakan alat bantu persiapan karier; hasil penerimaan kerja ditentukan pemberi kerja.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>Integritas & Anti-Fraud</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                    Klaim referral dan reward misi wajib melalui audit verifikasi bukti tanpa manipulasi skrip/bot.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Terms Sections */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {/* 1. Perikatan Elektronik Sah */}
              <article id="identitas-perikatan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 1</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  1. Penerimaan Ketentuan & Keabsahan Perikatan Elektronik
                </h2>
                <div className="space-y-3">
                  <p>
                    Perjanjian Syarat dan Ketentuan Penggunaan ini (&ldquo;<strong>Perjanjian</strong>&rdquo;) merupakan perikatan hukum yang sah dan mengikat antara <strong>Employr Indonesia</strong>, beralamat operasional di Semarang, Indonesia (selanjutnya disebut &ldquo;<strong>Employr</strong>&rdquo;, &ldquo;<strong>Kami</strong>&rdquo;, atau &ldquo;<strong>Penyelenggara Sistem Elektronik</strong>&rdquo;) dengan setiap pihak yang mengakses, mendaftar, atau menggunakan platform Employr (selanjutnya disebut &ldquo;<strong>Pengguna</strong>&rdquo; atau &ldquo;<strong>Kamu</strong>&rdquo;).
                  </p>
                  <p>
                    Perjanjian ini dibuat dengan merujuk pada:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Pasal 1320 dan Pasal 1338 Kitab Undang-Undang Hukum Perdata (KUHPerdata) mengenai syarat sahnya perjanjian dan asas kesepakatan mengikat;</li>
                    <li>Undang-Undang Republik Indonesia No. 11 Tahun 2008 jo. UU No. 19 Tahun 2016 jo. UU No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik (UU ITE);</li>
                    <li>Peraturan Pemerintah Republik Indonesia No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik (PP PSTE);</li>
                    <li>Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen.</li>
                  </ul>
                  <p>
                    Dengan mencentang kotak persetujuan, mengklik tombol &ldquo;Daftar&rdquo;, &ldquo;Buat CV Sekarang&rdquo;, &ldquo;Mulai Karier&rdquo;, atau dengan sekadar terus menggunakan antarmuka sistem kami, Kamu menyatakan telah membaca dengan teliti, memahami sepenuhnya, dan secara sukarela mengikatkan diri dalam Perjanjian Elektronik (*clickwrap contract*) ini. Apabila Kamu tidak menyetujui salah satu butir ketentuan ini, Kamu dilarang mengakses atau menggunakan layanan Employr.
                  </p>
                </div>
              </article>

              {/* 2. Definisi Istilah Operasional */}
              <article id="definisi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <BookOpen size={16} />
                  <span>Pasal 2</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  2. Definisi Istilah Operasional
                </h2>
                <p>Kecuali konteks menentukan lain, istilah-istilah di bawah ini memiliki arti hukum sebagai berikut:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Platform Employr</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Sistem perangkat lunak web, antarmuka dashboard karier, basis data, dan domain operasional yang dikelola oleh Employr Indonesia.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Akun Pengguna</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Kredensial elektronik unik yang terdaftar atas nama satu individu untuk mengakses layanan dashboard Employr.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Konten Pengguna</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Segala teks, data riwayat hidup, almamater, sertifikat, tautan portofolio, dan catatan yang dimasukkan Pengguna ke dalam sistem.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Akses Layanan Platform</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hak penggunaan modul pembuatan CV ATS, pelacak lamaran kerja, eksplorasi peluang, serta fitur pendukung persiapan karier yang tersedia di platform Employr.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Kanban Tracker</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Papan visual interaktif untuk mencatat dan memonitor status lamaran kerja yang diajukan Pengguna ke perusahaan pihak ketiga.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Program Misi & Referral</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Program gamifikasi produktif yang memberikan reward atas penyelesaian tugas persiapan karier atau rujukan pengguna baru yang sah.
                    </p>
                  </div>
                </div>
              </article>

              {/* 3. Syarat Kelayakan & Akun */}
              <article id="kelayakan-akun" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <ShieldCheck size={16} />
                  <span>Pasal 3</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  3. Syarat Kelayakan & Integritas Akun Pengguna
                </h2>
                <div className="space-y-3">
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Kapasitas Hukum & Usia:</strong> Kamu menyatakan bahwa Kamu telah berusia sekurang-kurangnya 16 (enam belas) tahun dan memiliki kapasitas hukum penuh untuk mengikatkan diri dalam perjanjian menurut hukum Republik Indonesia. Pengguna berusia di bawah 18 (delapan belas) tahun wajib memiliki persetujuan dari orang tua atau wali yang sah.
                    </li>
                    <li>
                      <strong>Batasan Satu Akun:</strong> Setiap individu hanya berhak memiliki dan mengoperasikan 1 (satu) Akun Pengguna utama. Dilarang keras membuat akun ganda menggunakan identitas fiktif untuk memanipulasi referral atau bonus misi.
                    </li>
                    <li>
                      <strong>Kerahasiaan Kredensial:</strong> Pengguna bertanggung jawab penuh atas keamanan kata sandi dan seluruh aktivitas yang terjadi di bawah Akun Pengguna. Employr tidak bertanggung jawab atas segala kerugian yang timbul akibat kelalaian Pengguna dalam menjaga kerahasiaan kata sandi atau penggunaan perangkat tanpa proteksi.
                    </li>
                    <li>
                      <strong>Larangan Pengalihan Akun:</strong> Akun dan hak akses layanan yang melekat bersifat personal dan tidak dapat dialihkan, dijual, disewakan, atau dipindahtangankan kepada pihak ketiga mana pun tanpa persetujuan tertulis dari Employr.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 4. Tanggung Jawab Data CV */}
              <article id="kebenaran-konten" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <FileText size={16} />
                  <span>Pasal 4</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  4. Kebenaran Informasi & Tanggung Jawab atas Konten CV
                </h2>
                <div className="space-y-3">
                  <p>
                    Pengguna memegang tanggung jawab hukum penuh secara perdata maupun pidana atas kebenaran, keakuratan, orisinalitas, dan keabsahan seluruh data yang dimasukkan ke dalam profil atau kurikulum vitae (CV), termasuk:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Keaslian gelar akademik, nama almamater, tahun kelulusan, dan nilai/indeks prestasi;</li>
                    <li>Keabsahan riwayat pengalaman kerja, masa kerja, posisi jabatan, dan pencapaian tugas;</li>
                    <li>Keaslian sertifikasi profesional, lisensi keahlian, dan kepemilikan tautan portofolio karya;</li>
                    <li>Larangan keras mencantumkan klaim fiktif, ijazah palsu, atau plagiasi karya milik pihak ketiga.</li>
                  </ul>
                  <div className="p-4 rounded-[10px] bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold block text-slate-900 dark:text-white">Batasan Penyelenggara:</span>
                    <p>
                      Employr bertindak sebagai penyedia platform teknologi pemformatan dokumen dan sistem pengatur tata letak (<em>layout and formatting tools</em>). Employr tidak bertindak sebagai lembaga notifikasi keaslian ijazah fisik atau badan verifikasi latar belakang (<em>background check agency</em>) atas kebenaran riwayat hidup yang diunggah oleh Pengguna.
                    </p>
                  </div>
                </div>
              </article>

              {/* 5. Penafian Jaminan Kerja */}
              <article id="penafian-karier" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} />
                  <span>Pasal 5</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  5. Ruang Lingkup Layanan & Penafian Jaminan Kerja (Crucial Career Disclaimer)
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm text-amber-900 dark:text-amber-300 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>PERNYATAAN PENTING MENGENAI SIFAT LAYANAN:</span>
                    </p>
                    <p className="leading-relaxed">
                      <strong>EMPLOYR BUKANLAH LEMBAGA PENYALUR TENAGA KERJA (PJTKI), BIRO PENEMPATAN KERJA SWASTA, ATAU AGENSI REKRUTMEN PIHAK KETIGA.</strong>
                    </p>
                    <p className="leading-relaxed">
                      Employr menyediakan perangkat lunak berbasis web untuk membantu Pengguna menyusun CV berstandar ramah ATS, melacak tahapan lamaran kerja, mengasah latihan wawancara, serta mengakses direktori informasi lowongan kerja yang tersedia secara publik.
                    </p>
                  </div>

                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Tanpa Jaminan Kelulusan:</strong> Employr sama sekali tidak menjamin, menjanjikan, atau memberikan kepastian bahwa Pengguna pasti dipanggil untuk tahapan wawancara kerja, lolos tahapan seleksi rekrutmen, atau memperoleh penawaran pekerjaan (job offering) tertentu.
                    </li>
                    <li>
                      <strong>Hak Mutlak Perusahaan Perekrut:</strong> Seluruh keputusan penyeleksian berkas, pemanggilan tes, dan penerimaan karyawan merupakan wewenang mutlak dan independen dari masing-masing perusahaan pemberi kerja pihak ketiga di luar kendali Employr.
                    </li>
                    <li>
                      <strong>Verifikasi Lowongan Eksternal:</strong> Informasi lowongan pekerjaan yang ditampilkan pada modul direktori dihimpun dari sumber publik atau mitra informasi. Pengguna berkewajiban melakukan verifikasi mandiri atas keabsahan perusahaan dan lowongan kerja untuk mencegah risiko penipuan bermodus rekrutmen.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 6. Modifikasi & Pembaruan Layanan Sewaktu-waktu */}
              <article id="perubahan-layanan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Clock size={16} />
                  <span>Pasal 6</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  6. Hak Modifikasi, Pembaruan Ketentuan, & Perubahan Layanan Sewaktu-waktu
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-[10px] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
                    <span className="font-bold flex items-center gap-1.5">
                      <Clock size={15} className="text-[#1738D1] dark:text-blue-400 shrink-0" />
                      <span>Klausul Hak Perubahan Sepihak (Unilateral Modification Clause)</span>
                    </span>
                    <p>
                      Berdasarkan prinsip kebebasan berkontrak (Pasal 1338 KUHPerdata) serta ketentuan regulasi penyelenggaraan sistem elektronik (PP No. 71 Tahun 2019 dan UU ITE), Employr memiliki hak penuh untuk sewaktu-waktu mengubah, menambah, memodifikasi, mengurangi, atau memperbarui Syarat dan Ketentuan ini serta fitur layanan yang tersedia secara sepihak.
                    </p>
                  </div>

                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Pembaruan Sewaktu-waktu:</strong> Employr berhak kapan saja meninjau, memperbarui, menambah, mengurangi, atau menghentikan sementara/permanen sebagian maupun seluruh modul sistem, tata letak antarmuka, kuota pemakaian, dan/atau ketentuan penggunaan platform untuk tujuan peningkatan keamanan, pemeliharaan sistem, inovasi produk, maupun kepatuhan regulasi hukum Republik Indonesia.
                    </li>
                    <li>
                      <strong>Pemberitahuan Perubahan:</strong> Setiap pembaruan ketentuan akan dicantumkan dengan tanggal &ldquo;Terakhir diperbarui&rdquo; pada bagian atas dokumen ini. Untuk perubahan yang bersifat material terhadap hak dan kewajiban Pengguna, Employr akan memberikan notifikasi yang wajar melalui pesan di dalam dashboard atau surat elektronik sebelum ketentuan baru berlaku efektif.
                    </li>
                    <li>
                      <strong>Persetujuan Lanjutan (Tacit Consent):</strong> Dengan tetap mengakses, menjelajah, menyusun dokumen, atau memanfaatkan fitur apa pun di platform Employr setelah tanggal efektif pembaruan diberlakukan, Pengguna secara hukum dianggap telah membaca, memahami, dan menyetujui seluruh perubahan tersebut tanpa syarat.
                    </li>
                    <li>
                      <strong>Hak Penghentian oleh Pengguna:</strong> Apabila Pengguna tidak menyetujui pembaruan ketentuan atau modifikasi layanan yang diberlakukan, Pengguna berhak setiap saat menghentikan penggunaan layanan dan/atau mengajukan permohonan penutupan akun kepada tim dukungan resmi.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 7. Ketentuan Misi & Referral */}
              <article id="misi-referral-fraud" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Gift size={16} />
                  <span>Pasal 7</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  7. Ketentuan Program Misi Cuan, Referral, & Kebijakan Anti-Kecurangan
                </h2>
                <div className="space-y-3">
                  <p>
                    Program Misi dan Referral diselenggarakan untuk memberikan apresiasi bagi keaktifan Pengguna dalam mempersiapkan karier, dengan aturan ketat sebagai berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Verifikasi Bukti Misi:</strong> Reward saldo atas pengerjaan misi karier hanya akan ditambahkan setelah bukti yang dikirimkan melewati alur verifikasi resmi: <code>SUBMITTED &rarr; REVIEWING &rarr; APPROVED</code>. Tim verifikator berhak menolak klaim apabila bukti tidak memenuhi standar instruksi misi.
                    </li>
                    <li>
                      <strong>Komisi Referral Sah:</strong> Komisi rujukan hanya diberikan apabila pengguna yang kamu referensikan berhasil mendaftar akun sah dan menyelesaikan verifikasi aktivitas pengguna aktif sesuai syarat program yang berlaku.
                    </li>
                    <li>
                      <strong>Larangan Keras Kecurangan (Anti-Fraud Policy):</strong> Dilarang keras melakukan manipulasi seperti merujuk diri sendiri (self-referral), membuat akun palsu massal, menggunakan bot otomatis, atau mengunggah bukti palsu / hasil suntingan fiktif.
                    </li>
                    <li>
                      <strong>Sanksi Pelanggaran:</strong> Employr berhak secara sepihak membatalkan saldo reward yang diperoleh dari kecurangan, menolak permohonan pencairan dana, serta membekukan atau menutup akun Pengguna yang terindikasi curang secara permanen tanpa kewajiban memberikan ganti rugi apa pun.
                    </li>
                    <li>
                      <strong>Pencairan Saldo (Payout):</strong> Batas minimum penarikan saldo adalah <strong>Rp25.000 (dua puluh lima ribu Rupiah)</strong>. Penyaluran dana diproses melalui transfer manual ke rekening bank atau e-wallet resmi atas nama sah Pengguna pada hari dan jam kerja operasional.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 8. Hak Kekayaan Intelektual */}
              <article id="haki" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 8</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  8. Hak Kekayaan Intelektual (HAKI)
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong>Kepemilikan Platform:</strong> Seluruh kode sumber, basis data, arsitektur perangkat lunak, hak cipta desain tata letak antarmuka, format tata letak template dokumen CV ATS, grafik, logo merek dagang &ldquo;Employr&rdquo;, serta seluruh materi editorial yang tersedia di platform adalah hak milik eksklusif Employr Indonesia yang dilindungi oleh Undang-Undang Republik Indonesia No. 28 Tahun 2014 tentang Hak Cipta dan UU No. 20 Tahun 2016 tentang Merek.
                  </p>
                  <p>
                    <strong>Lisensi Terbatas untuk Pengguna:</strong> Employr memberikan kepada Pengguna lisensi terbatas, personal, non-eksklusif, dan tidak dapat dialihkan untuk menggunakan template dan mengunduh berkas CV pribadi semata-mata untuk keperluan melamar pekerjaan pribadi. Pengguna dilarang keras menjual kembali, menyewakan, atau mendistribusikan ulang template CV kami secara komersial.
                  </p>
                  <p>
                    <strong>Hak atas Konten Pribadi:</strong> Pengguna mempertahankan hak kepemilikan penuh atas data riwayat hidup dan isi portofolio karyanya. Pengguna memberikan lisensi operasional bebas royalti kepada Employr semata-mata untuk memproses, memformat, dan menampilkan data tersebut demi terselenggaranya layanan.
                  </p>
                </div>
              </article>

              {/* 9. Batasan Penggunaan Platform */}
              <article id="kebijakan-penggunaan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Ban size={16} />
                  <span>Pasal 9</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  9. Kebijakan Batasan Penggunaan yang Diperbolehkan (Acceptable Use Policy)
                </h2>
                <div className="space-y-3">
                  <p>Saat menggunakan platform Employr, Pengguna dilarang keras untuk:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Melakukan dekompilasi, rekayasa balik (reverse engineering), atau membongkar kode sumber platform;</li>
                    <li>Menggunakan robot, spider, scraper liar, atau alat otomatis apa pun untuk mengambil data direktori atau mengekstrak konten tanpa izin tertulis;</li>
                    <li>Mengirimkan virus, trojan, worm, spyware, atau kode perusak lainnya ke dalam infrastruktur sistem;</li>
                    <li>Melakukan tindakan yang dapat membebani kapasitas server secara tidak wajar (Denial of Service / DDoS);</li>
                    <li>Memanipulasi atau memalsukan identitas akun, data perbankan, atau kode rujukan;</li>
                    <li>Menggunakan platform untuk tujuan yang melanggar hukum, norma kesusilaan, atau ketertiban umum di Republik Indonesia.</li>
                  </ul>
                </div>
              </article>

              {/* 10. Pembatasan Tanggung Jawab */}
              <article id="pembatasan-tanggung-jawab" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Lock size={16} />
                  <span>Pasal 10</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  10. Pembatasan Tanggung Jawab (Limitation of Liability)
                </h2>
                <div className="space-y-3">
                  <p>
                    Sejauh diizinkan secara sah oleh hukum Republik Indonesia, Employr beserta seluruh pendiri, direksi, staf, dan mitranya tidak bertanggung jawab atas segala bentuk kerugian tidak langsung, kerugian insidental, kerugian hilangnya peluang kerja, atau kerugian immaterial lainnya yang timbul dari atau sehubungan dengan:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Keputusan penolakan lamaran kerja oleh perusahaan pihak ketiga;</li>
                    <li>Ketidakakuratan atau kelalaian data riwayat hidup yang dimasukkan oleh Pengguna;</li>
                    <li>Keterlambatan pengiriman email notifikasi yang disebabkan oleh gangguan penyedia jaringan telekomunikasi pihak ketiga;</li>
                    <li>Akses tidak sah ke dalam akun akibat kelalaian Pengguna menjaga kata sandi;</li>
                    <li>Pemeliharaan rutin terjadwal yang menyebabkan layanan terhenti sementara waktu.</li>
                  </ul>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Batas Maksimal Tanggung Jawab: Dalam kondisi apa pun di mana Employr dinyatakan bertanggung jawab secara hukum oleh putusan pengadilan yang berkekuatan hukum tetap, batas tanggung jawab kumulatif maksimal Employr kepada Pengguna dibatasi semata-mata pada perbaikan aksesibilitas teknis atas fitur platform terkait.
                  </p>
                </div>
              </article>

              {/* 11. Klausul Ganti Rugi */}
              <article id="ganti-rugi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Shield size={16} />
                  <span>Pasal 11</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  11. Klausul Ganti Rugi Pengguna (Indemnification)
                </h2>
                <p>
                  Pengguna setuju untuk membela, mengganti kerugian, dan membebaskan Employr, perusahaan terafiliasi, serta jajaran stafnya dari setiap klaim tuntutan hukum, gugatan perdata, ganti rugi, sanksi denda, dan biaya hukum (termasuk biaya pengacara wajar) yang diajukan oleh pihak ketiga mana pun yang timbul akibat: (i) pelanggaran Pengguna terhadap Syarat dan Ketentuan ini; (ii) pelanggaran hak pihak ketiga mana pun, termasuk hak cipta dan data pribadi; atau (iii) pelanggaran hukum positif Republik Indonesia yang dilakukan oleh Pengguna.
                </p>
              </article>

              {/* 12. Penangguhan & Pemutusan Akun */}
              <article id="penangguhan-pemutusan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Ban size={16} />
                  <span>Pasal 12</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  12. Penangguhan & Pemutusan Akses Akun
                </h2>
                <div className="space-y-3">
                  <p>
                    Employr berhak secara sepihak dan tanpa pemberitahuan sebelumnya untuk menangguhkan sementara atau mencabut secara permanen hak akses akun Pengguna apabila:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Pengguna terbukti melanggar satu atau lebih ketentuan dalam Perjanjian ini;</li>
                    <li>Ditemukan indikasi kecurangan akun, pemalsuan identitas, atau manipulasi bot pada program Misi dan Referral;</li>
                    <li>Terdapat permintaan resmi yang sah dari institusi penegak hukum yang berwenang;</li>
                    <li>Aktivitas akun dinilai membahayakan keamanan integritas pengguna lain atau infrastruktur platform.</li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pemutusan akun akibat pelanggaran berat tidak menghapuskan kewajiban ganti rugi yang telah timbul sebelum pemutusan dilakukan.
                  </p>
                </div>
              </article>

              {/* 13. Keadaan Kahar (Force Majeure) */}
              <article id="keadaan-kahar" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Clock size={16} />
                  <span>Pasal 13</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  13. Keadaan Kahar (Force Majeure)
                </h2>
                <p>
                  Employr tidak bertanggung jawab atas keterlambatan kinerja atau kegagalan penyediaan fitur yang diakibatkan oleh kejadian di luar kendali wajar manusia (<em>Force Majeure</em>), termasuk namun tidak terbatas pada bencana alam, gempa bumi, banjir, kebakaran besar, perang, kerusuhan sipil, aksi terorisme siber berskala nasional, pemutusan jalur kabel fiber optik internasional atau gangguan masif ISP publik, gangguan masif penyedia infrastruktur pusat data komputasi awan, serta berlakunya regulasi darurat baru pemerintah yang secara langsung menghambat operasional layanan.
                </p>
              </article>

              {/* 14. Hukum & Penyelesaian Sengketa */}
              <article id="hukum-sengketa" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 14</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  14. Hukum yang Berlaku & Penyelesaian Sengketa
                </h2>
                <div className="space-y-3">
                  <p>
                    Seluruh ketentuan dalam Perjanjian ini, serta setiap hak, kewajiban, atau sengketa yang timbul darinya, diatur dan ditafsirkan sepenuhnya berdasarkan <strong>Hukum Positif Negara Republik Indonesia</strong>.
                  </p>
                  <p>
                    Setiap perselisihan, pertentangan, atau klaim yang timbul antara Pengguna dan Employr wajib diselesaikan terlebih dahulu melalui jalur <strong>musyawarah untuk mufakat</strong> secara kekeluargaan dalam jangka waktu maksimal 30 (tiga puluh) hari kalender sejak salah satu pihak menyampaikan surat pemberitahuan sengketa tertulis.
                  </p>
                  <p>
                    Apabila dalam jangka waktu 30 (tiga puluh) hari musyawarah tidak menghasilkan kesepakatan damai, maka para pihak sepakat tanpa syarat untuk menyelesaikan perselisihan tersebut melalui yurisdiksi eksklusif di <strong>Pengadilan Negeri Semarang, Jawa Tengah, Republik Indonesia</strong>.
                  </p>
                </div>
              </article>

              {/* 15. Ketentuan Penutup & Pengaduan */}
              <article id="penutup-layanan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  <Mail size={16} />
                  <span>Pasal 15</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  15. Keterpisahan Ketentuan, Bahasa Resmi, & Layanan Pengaduan Konsumen
                </h2>
                <div className="space-y-4">
                  <p>
                    <strong>Keterpisahan (Severability):</strong> Apabila suatu klausul dalam Perjanjian ini dinyatakan tidak sah, batal demi hukum, atau tidak dapat diberlakukan oleh pengadilan yang berwenang, maka ketidaksahan klausul tersebut tidak akan memengaruhi keberlakuan klausul-klausul lainnya yang tetap berlaku secara penuh.
                  </p>
                  <p>
                    <strong>Bahasa Resmi:</strong> Perjanjian ini disusun dalam Bahasa Indonesia resmi. Apabila terdapat terjemahan ke dalam bahasa lain untuk tujuan kenyamanan, maka versi Bahasa Indonesia yang berlaku dan menjadi acuan utama secara yuridis.
                  </p>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                    <span className="font-bold block text-slate-900 dark:text-white">Saluran Pengaduan Konsumen & Layanan Resmi:</span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Badan Penyelenggara:</span>
                      <span className="font-bold text-slate-900 dark:text-white">Employr Indonesia</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Email Resmi & Bantuan:</span>
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Threads Resmi:</span>
                      <a href="https://www.threads.net/@employr.id" target="_blank" rel="noopener noreferrer" className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">
                        @employr.id
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">DM Threads:</span>
                      <a href="https://www.threads.net/@riizalhp" target="_blank" rel="noopener noreferrer" className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline">
                        @riizalhp
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Wilayah Yurisdiksi:</span>
                      <span className="font-medium text-slate-900 dark:text-white">Semarang, Jawa Tengah, Indonesia</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sesuai dengan regulasi perlindungan pengguna sistem elektronik, setiap laporan kendala teknis atau permohonan klarifikasi layanan akan ditanggapi oleh tim layanan pelanggan resmi dalam jangka waktu maksimal 3 x 24 jam kerja.
                  </p>
                </div>
              </article>
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <p>© {new Date().getFullYear()} Employr. Seluruh hak dilindungi undang-undang.</p>
              <div className="flex items-center gap-4 font-semibold">
                <Link href="/kebijakan-privasi" className="text-[#1738D1] dark:text-blue-400 hover:underline">
                  Kebijakan Privasi Data
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
