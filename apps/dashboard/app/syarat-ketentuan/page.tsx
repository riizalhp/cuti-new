'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
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
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { getLokerUrl } from '@/lib/urls';

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

  const handleBack = () => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from') || params.get('returnUrl');
    const referrer = document.referrer;
    const isFromLoker =
      fromParam === 'loker' ||
      fromParam?.includes('3003') ||
      fromParam?.includes('loker.employr.id') ||
      referrer.includes('3003') ||
      referrer.includes('loker.employr.id');

    // 1. Jika di tab yang sama dan ada riwayat browser (dan bukan loop di halaman legal ini)
    if (window.history.length > 1 && (!referrer || !referrer.includes(window.location.pathname))) {
      window.history.back();
      return;
    }

    // 2. Jika ada referrer dari halaman luar/loker
    if (referrer && !referrer.includes(window.location.pathname)) {
      window.location.href = referrer;
      return;
    }

    // 3. Jika berasal dari portal loker (via param from=loker atau terdeteksi)
    if (isFromLoker) {
      window.location.href = getLokerUrl();
      return;
    }

    // 4. Custom return URL
    if (fromParam && (fromParam.startsWith('http://') || fromParam.startsWith('https://') || fromParam.startsWith('/'))) {
      window.location.href = fromParam;
      return;
    }

    // 5. Fallback: pengguna login diarahkan ke beranda, tamu diarahkan ke portal loker (bukan ke login)
    const hasSession = document.cookie.includes('employr_user_session') || document.cookie.includes('cuti_user_session');
    if (hasSession) {
      window.location.href = '/beranda';
    } else {
      window.location.href = getLokerUrl();
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-cobalt-500/10 selection:text-cobalt-500">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Beranda Employr">
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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-caption font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Scale size={12} className="shrink-0" />
              KUHPerdata & UU ITE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/kebijakan-privasi"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-cobalt-500 dark:hover:text-blue-400 transition"
            >
              <ShieldCheck size={14} />
              <span>Kebijakan Privasi</span>
            </Link>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold text-white bg-cobalt-500 hover:bg-cobalt-600 shadow-sm transition cursor-pointer"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Shell */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <BookOpen size={14} className="text-cobalt-500" />
                <span>Daftar Isi Syarat Layanan</span>
              </div>
              <nav className="mt-3 space-y-1 text-xs max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar pr-1.5" aria-label="Daftar Isi">
                {TOC_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-[10px] transition flex items-center justify-between font-medium cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 font-bold border-l-3 border-cobalt-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <ChevronRight size={12} className={`shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-caption text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-500 dark:text-slate-400" />
                  <span>Waktu baca: ±15 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale size={12} className="text-blue-600" />
                  <span>Hukum: Republik Indonesia</span>
                </div>
              </div>
            </div>

            {/* Legal Help Box */}
            <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-cobalt-500" />
                <span>Konsultasi Legalitas Layanan</span>
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Memerlukan klarifikasi mengenai ketentuan layanan, hak kekayaan intelektual, atau penggunaan platform?
              </p>
              <a
                href={`mailto:${LEGAL_EMAIL}?subject=Pertanyaan%20Legalitas%20Syarat%20Ketentuan%20Employr`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline"
              >
                <span>{LEGAL_EMAIL}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </aside>

          {/* Right Main Content Column */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
            {/* Document Header Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-[10px] font-bold bg-cobalt-500/10 text-cobalt-500 dark:text-blue-400 border border-cobalt-500/20">
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
                    <Clock size={14} className="text-cobalt-500 dark:text-blue-400" />
                    <span>Dapat Berubah Sewaktu-waktu</span>
                  </div>
                  <p className="text-caption leading-normal text-slate-500 dark:text-slate-400">
                    Employr berhak memperbarui ketentuan & layanan secara berkala dengan notifikasi yang wajar.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <AlertTriangle size={14} className="text-amber-700 dark:text-amber-400" />
                    <span>Bukan Penyalur Tenaga Kerja</span>
                  </div>
                  <p className="text-caption leading-normal text-slate-500 dark:text-slate-400">
                    Employr menyediakan alat bantu persiapan karier; hasil penerimaan kerja ditentukan pemberi kerja.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>Integritas & Anti-Fraud</span>
                  </div>
                  <p className="text-caption leading-normal text-slate-500 dark:text-slate-400">
                    Klaim referral dan reward misi wajib melalui audit verifikasi bukti tanpa manipulasi skrip/bot.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Terms Sections */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {/* 1. Perikatan Elektronik Sah */}
              <article id="identitas-perikatan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 1</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  1. Penerimaan Ketentuan & Keabsahan Perikatan Elektronik
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Employr adalah platform persiapan karier digital untuk membantu kamu menyusun CV ATS dan memantau proses lamaran kerja.</li>
                    <li>Dengan mendaftar akun atau memanfaatkan fitur layanan, kamu menyetujui aturan penggunaan ini demi kenyamanan dan perlindungan hukum bersama.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    Perjanjian Syarat dan Ketentuan Penggunaan ini (&ldquo;<strong>Perjanjian</strong>&rdquo;) merupakan perikatan hukum yang sah dan mengikat antara <strong>Employr Indonesia</strong> yang beroperasi di Indonesia (selanjutnya disebut &ldquo;<strong>Employr</strong>&rdquo;, &ldquo;<strong>Kami</strong>&rdquo;, atau &ldquo;<strong>Penyelenggara Sistem Elektronik</strong>&rdquo;) dengan setiap pihak yang mengakses, mendaftar, atau menggunakan platform Employr (selanjutnya disebut &ldquo;<strong>Pengguna</strong>&rdquo; atau &ldquo;<strong>Kamu</strong>&rdquo;).
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
                    Dengan mencentang kotak persetujuan, mengklik tombol &ldquo;Daftar&rdquo;, &ldquo;Buat CV Sekarang&rdquo;, &ldquo;Mulai Karier&rdquo;, atau dengan terus menggunakan antarmuka sistem kami, Kamu menyatakan telah membaca dengan teliti, memahami, dan secara sukarela mengikatkan diri dalam Perjanjian Elektronik ini. Apabila Kamu tidak menyetujui salah satu butir ketentuan ini, Kamu dipersilakan untuk tidak menggunakan layanan Employr.
                  </p>
                </div>
              </article>

              {/* 2. Definisi Istilah Operasional */}
              <article id="definisi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
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
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <ShieldCheck size={16} />
                  <span>Pasal 3</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  3. Syarat Kelayakan & Integritas Akun
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Usia pengguna minimal 16 tahun (bagi yang di bawah 18 tahun, wajib dengan sepengetahuan orang tua/wali).</li>
                    <li>Satu orang hanya boleh memiliki satu akun aktif. Dilarang membuat akun palsu untuk manipulasi bonus.</li>
                    <li>Jaga kerahasiaan kata sandi akunmu sendiri dan jangan meminjamkan akun ke orang lain.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Kapasitas Hukum & Usia:</strong> Kamu menyatakan bahwa Kamu telah berusia sekurang-kurangnya 16 (enam belas) tahun dan memiliki kapasitas hukum untuk mengikatkan diri dalam perjanjian menurut hukum Republik Indonesia. Pengguna berusia di bawah 18 (delapan belas) tahun wajib memiliki persetujuan dari orang tua atau wali yang sah.
                    </li>
                    <li>
                      <strong>Batasan Satu Akun:</strong> Setiap individu hanya berhak memiliki dan mengoperasikan 1 (satu) Akun Pengguna utama. Dilarang keras membuat akun ganda menggunakan identitas fiktif untuk memanipulasi referral atau bonus misi.
                    </li>
                    <li>
                      <strong>Kerahasiaan Kredensial:</strong> Kamu bertanggung jawab penuh atas keamanan kata sandi dan seluruh aktivitas yang terjadi di bawah akunmu. Employr tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian dalam menjaga keamanan perangkat atau kerahasiaan kata sandi pribadi.
                    </li>
                    <li>
                      <strong>Larangan Pengalihan Akun:</strong> Akun dan hak akses layanan bersifat personal dan tidak dapat dialihkan, dijual, disewakan, atau dipindahtangankan kepada pihak lain tanpa izin tertulis dari Employr.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 4. Tanggung Jawab Data CV */}
              <article id="kebenaran-konten" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <FileText size={16} />
                  <span>Pasal 4</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  4. Kebenaran Informasi & Tanggung Jawab Konten CV
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Kamu bertanggung jawab penuh atas keaslian ijazah, nilai, riwayat kerja, dan portofolio yang kamu tulis di CV.</li>
                    <li>Employr menyediakan format dan tata letak dokumen ramah ATS, bukan sebagai pihak yang memverifikasi keaslian ijazah fisik.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    Kamu memegang tanggung jawab penuh secara hukum atas kebenaran, keakuratan, orisinalitas, dan keabsahan seluruh data yang kamu masukkan ke dalam profil atau kurikulum vitae (CV), termasuk:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Keaslian gelar akademik, nama almamater, tahun kelulusan, dan nilai/indeks prestasi;</li>
                    <li>Keabsahan riwayat pengalaman kerja, masa kerja, posisi jabatan, dan pencapaian tugas;</li>
                    <li>Keaslian sertifikasi profesional, lisensi keahlian, dan kepemilikan tautan portofolio karya;</li>
                    <li>Larangan keras mencantumkan klaim fiktif, ijazah palsu, atau plagiasi karya milik pihak lain.</li>
                  </ul>
                  <div className="p-4 rounded-[10px] bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold block text-slate-900 dark:text-white">Peran Penyelenggara:</span>
                    <p>
                      Employr bertindak sebagai penyedia platform perangkat lunak pemformatan dokumen dan tata letak visual (<em>layout and formatting tools</em>). Employr tidak bertindak sebagai lembaga verifikasi keaslian dokumen fisik atau badan pemeriksa latar belakang (<em>background check agency</em>).
                    </p>
                  </div>
                </div>
              </article>

              {/* 5. Penafian Jaminan Kerja */}
              <article id="penafian-karier" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={16} />
                  <span>Pasal 5</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  5. Ruang Lingkup Layanan & Penafian Jaminan Kerja
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0 text-amber-700 dark:text-amber-400" />
                    <span>Poin penting untuk kamu ketahui:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-amber-950 dark:text-amber-200">
                    <li>Employr adalah alat bantu persiapan karier mandiri, <strong>BUKAN lembaga penyalur tenaga kerja</strong> (bukan PJTKI/LPK/agensi outsourcing).</li>
                    <li>Kami membantumu merapikan CV dan memantau lamaran, namun keputusan pemanggilan wawancara dan penerimaan kerja sepenuhnya merupakan hak prerogatif perusahaan yang kamu lamar.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Tanpa Jaminan Kelulusan:</strong> Employr tidak menjamin atau memberikan kepastian bahwa kamu pasti dipanggil wawancara kerja, lolos seleksi berkas, atau memperoleh penawaran kerja (job offer) tertentu.
                    </li>
                    <li>
                      <strong>Hak Mutlak Perusahaan Perekrut:</strong> Seluruh keputusan penyeleksian berkas, pemanggilan tes, dan penerimaan karyawan merupakan wewenang mutlak dan independen dari masing-masing perusahaan pemberi kerja di luar kendali Employr.
                    </li>
                    <li>
                      <strong>Verifikasi Lowongan Eksternal:</strong> Informasi peluang karier yang tersedia di direktori dihimpun dari sumber publik. Kamu disarankan tetap melakukan verifikasi mandiri atas reputasi perusahaan tujuan untuk mencegah modus penipuan lowongan kerja.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 6. Modifikasi & Pembaruan Layanan */}
              <article id="perubahan-layanan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Clock size={16} />
                  <span>Pasal 6</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  6. Pembaruan Layanan & Ketentuan Penggunaan
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Fitur platform dan isi ketentuan ini dapat kami perbarui secara berkala demi keamanan, peningkatan performa, atau kepatuhan hukum.</li>
                    <li>Jika ada pembaruan penting yang memengaruhi hakmu, kami akan memberitahukan lewat notifikasi di dashboard atau email terdaftar.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Pembaruan Berkala:</strong> Employr berhak meninjau, memperbarui, menambah, atau menyesuaikan modul fitur, antarmuka, dan ketentuan penggunaan untuk tujuan pemeliharaan sistem, inovasi produk, maupun kepatuhan regulasi hukum Republik Indonesia.
                    </li>
                    <li>
                      <strong>Pemberitahuan Perubahan:</strong> Setiap pembaruan ketentuan ditandai dengan tanggal &ldquo;Terakhir diperbarui&rdquo; di bagian atas dokumen ini. Untuk perubahan yang bersifat mendasar, Employr akan memberikan notifikasi yang wajar melalui dashboard atau email sebelum ketentuan baru berlaku efektif.
                    </li>
                    <li>
                      <strong>Persetujuan Lanjutan:</strong> Dengan tetap menggunakan layanan Employr setelah tanggal berlakunya pembaruan, kamu dianggap telah membaca, memahami, dan menyetujui seluruh perubahan ketentuan tersebut.
                    </li>
                    <li>
                      <strong>Hak Penghentian:</strong> Apabila kamu tidak menyetujui pembaruan ketentuan yang diberlakukan, kamu berhak setiap saat menghentikan penggunaan layanan dan mengajukan penutupan akun kepada tim bantuan resmi.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 7. Ketentuan Misi & Referral */}
              <article id="misi-referral-fraud" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Gift size={16} />
                  <span>Pasal 7</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  7. Ketentuan Program Misi Cuan, Referral, & Kebijakan Anti-Kecurangan
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Reward saldo misi cair setelah bukti diverifikasi tim resmi (SUBMITTED &rarr; REVIEWING &rarr; APPROVED).</li>
                    <li>Batas minimum penarikan saldo adalah Rp25.000 via transfer bank atau e-wallet atas namamu.</li>
                    <li>Dilarang keras curang (self-referral, akun ganda fiktif, bot otomatis, atau bukti palsu). Saldo curang akan hangus dan akun dibekukan.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    Program Misi dan Referral diselenggarakan untuk mengapresiasi keaktifanmu dalam mempersiapkan karier, dengan aturan ketat sebagai berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Verifikasi Bukti Misi:</strong> Reward saldo atas pengerjaan misi karier hanya akan ditambahkan setelah bukti yang dikirimkan melewati alur verifikasi resmi: <code>SUBMITTED &rarr; REVIEWING &rarr; APPROVED</code>. Tim verifikator berhak menolak klaim apabila bukti tidak memenuhi instruksi misi.
                    </li>
                    <li>
                      <strong>Komisi Referral Sah:</strong> Komisi rujukan hanya diberikan apabila pengguna yang kamu referensikan berhasil mendaftar akun sah dan menyelesaikan verifikasi aktivitas pengguna aktif sesuai syarat program.
                    </li>
                    <li>
                      <strong>Larangan Keras Kecurangan:</strong> Dilarang keras melakukan manipulasi seperti merujuk diri sendiri (self-referral), membuat akun palsu massal, menggunakan bot otomatis, atau mengunggah bukti palsu / hasil suntingan fiktif.
                    </li>
                    <li>
                      <strong>Sanksi Pelanggaran:</strong> Employr berhak secara sepihak membatalkan saldo reward yang diperoleh dari indikasi kecurangan, menolak permohonan pencairan dana, serta membekukan atau menutup akun terkait secara permanen.
                    </li>
                    <li>
                      <strong>Pencairan Saldo (Payout):</strong> Batas minimum penarikan saldo adalah <strong>Rp25.000 (dua puluh lima ribu Rupiah)</strong>. Penyaluran dana diproses melalui transfer manual ke rekening bank atau dompet digital (e-wallet) resmi atas nama sah kamu pada hari kerja operasional.
                    </li>
                  </ul>
                </div>
              </article>

              {/* 8. Hak Kekayaan Intelektual */}
              <article id="haki" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 8</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  8. Hak Kekayaan Intelektual (HAKI)
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Desain template CV ATS, tata letak visual, kode sistem, dan merek dagang adalah hak kekayaan intelektual milik Employr.</li>
                    <li>Kamu bebas mengunduh dan menggunakan CV untuk keperluan melamar kerja pribadi, namun dilarang menjual kembali template kami secara komersial.</li>
                    <li>Data riwayat hidup dan isi portofoliomu tetap 100% milikmu pribadi.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    <strong>Kepemilikan Platform:</strong> Seluruh kode sumber, basis data, arsitektur perangkat lunak, hak cipta desain tata letak antarmuka, format tata letak template dokumen CV ATS, grafik, logo merek dagang &ldquo;Employr&rdquo;, serta seluruh materi editorial yang tersedia di platform adalah hak milik eksklusif Employr Indonesia yang dilindungi oleh UU No. 28 Tahun 2014 tentang Hak Cipta dan UU No. 20 Tahun 2016 tentang Merek.
                  </p>
                  <p>
                    <strong>Lisensi Terbatas untuk Pengguna:</strong> Employr memberikan kepada kamu lisensi terbatas, personal, non-eksklusif, dan tidak dapat dialihkan untuk menggunakan template dan mengunduh berkas CV pribadi semata-mata untuk keperluan melamar pekerjaan pribadi. Kamu dilarang keras menjual kembali, menyewakan, atau mendistribusikan ulang template CV kami secara komersial.
                  </p>
                  <p>
                    <strong>Hak atas Konten Pribadi:</strong> Kamu mempertahankan hak kepemilikan penuh atas data riwayat hidup dan isi portofolio karyamu. Kamu memberikan lisensi operasional kepada Employr semata-mata untuk memproses, memformat, dan menampilkan data tersebut demi terselenggaranya layanan.
                  </p>
                </div>
              </article>

              {/* 9. Batasan Penggunaan Platform */}
              <article id="kebijakan-penggunaan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Ban size={16} />
                  <span>Pasal 9</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  9. Batasan Penggunaan yang Diperbolehkan
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Gunakan platform dengan jujur dan wajar untuk mendukung persiapan kariermu.</li>
                    <li>Dilarang membobol server, scraping liar tanpa izin tertulis, menyebarkan virus, atau memalsukan identitas akun.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>Saat menggunakan platform Employr, kamu dilarang keras untuk:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Melakukan dekompilasi, rekayasa balik (reverse engineering), atau membongkar kode sumber platform;</li>
                    <li>Menggunakan robot liar, spider, scraper otomatis, atau alat otomatis apa pun untuk mengambil data direktori tanpa izin tertulis;</li>
                    <li>Mengirimkan virus, trojan, worm, spyware, atau kode perusak lainnya ke dalam infrastruktur sistem;</li>
                    <li>Melakukan tindakan yang membebani kapasitas server secara tidak wajar (Denial of Service / DDoS);</li>
                    <li>Memanipulasi atau memalsukan identitas akun, data perbankan, atau kode rujukan;</li>
                    <li>Menggunakan platform untuk tujuan yang melanggar hukum, norma kesusilaan, atau ketertiban umum di Republik Indonesia.</li>
                  </ul>
                </div>
              </article>

              {/* 10. Pembatasan Tanggung Jawab */}
              <article id="pembatasan-tanggung-jawab" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Lock size={16} />
                  <span>Pasal 10</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  10. Pembatasan Tanggung Jawab
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Employr tidak bertanggung jawab atas hasil seleksi kerja oleh perusahaan pihak ketiga atau kesalahan data riwayat hidup yang kamu input sendiri.</li>
                    <li>Kami selalu berupaya menjaga sistem tetap stabil dan aman untuk seluruh pengguna.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    Sejauh diizinkan secara sah oleh hukum Republik Indonesia, Employr beserta seluruh pengelola, staf, dan mitranya tidak bertanggung jawab atas kerugian tidak langsung atau hilangnya peluang kerja yang timbul dari:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Keputusan penolakan lamaran kerja oleh perusahaan pihak ketiga;</li>
                    <li>Ketidakakuratan atau kekeliruan data riwayat hidup yang dimasukkan oleh kamu;</li>
                    <li>Keterlambatan pengiriman email notifikasi yang disebabkan oleh gangguan jaringan telekomunikasi;</li>
                    <li>Akses tidak sah ke dalam akun akibat kelalaian kamu dalam menjaga keamanan kata sandi;</li>
                    <li>Pemeliharaan rutin berkala yang menyebabkan layanan terhenti sementara waktu.</li>
                  </ul>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Batas Maksimal Tanggung Jawab: Dalam kondisi apa pun di mana Employr dinyatakan bertanggung jawab secara hukum oleh putusan pengadilan yang berkekuatan hukum tetap, batas tanggung jawab kumulatif maksimal dibatasi semata-mata pada perbaikan aksesibilitas teknis atas fitur platform terkait.
                  </p>
                </div>
              </article>

              {/* 11. Tanggung Jawab & Pembebasan Tuntutan */}
              <article id="ganti-rugi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Shield size={16} />
                  <span>Pasal 11</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  11. Tanggung Jawab & Pembebasan Tuntutan
                </h2>
                <p>
                  Kamu setuju untuk membebaskan Employr, pengelola, serta tim pendukungnya dari setiap klaim tuntutan hukum atau biaya kerugian yang diajukan oleh pihak ketiga mana pun yang timbul akibat: (i) pelanggaran kamu terhadap Syarat dan Ketentuan ini; (ii) pelanggaran hak pihak ketiga, termasuk hak cipta dan data pribadi; atau (iii) pelanggaran hukum Republik Indonesia yang dilakukan oleh kamu saat menggunakan layanan.
                </p>
              </article>

              {/* 12. Penangguhan & Pemutusan Akun */}
              <article id="penangguhan-pemutusan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Ban size={16} />
                  <span>Pasal 12</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  12. Penangguhan & Pemutusan Akses Akun
                </h2>
                <div className="space-y-3">
                  <p>
                    Employr berhak secara sepihak untuk menangguhkan sementara atau mencabut secara permanen hak akses akun kamu apabila:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>Terbukti melanggar satu atau lebih ketentuan dalam Perjanjian ini;</li>
                    <li>Ditemukan indikasi kecurangan akun, pemalsuan data identitas, atau manipulasi bot pada program Misi dan Referral;</li>
                    <li>Terdapat permintaan resmi yang sah dari institusi penegak hukum yang berwenang;</li>
                    <li>Aktivitas akun dinilai membahayakan integritas sistem atau pengguna lain di platform.</li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pemutusan akun akibat pelanggaran berat tidak menghapuskan tanggung jawab yang telah timbul sebelum pemutusan dilakukan.
                  </p>
                </div>
              </article>

              {/* 13. Keadaan Kahar (Force Majeure) */}
              <article id="keadaan-kahar" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Clock size={16} />
                  <span>Pasal 13</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  13. Keadaan Kahar (Force Majeure)
                </h2>
                <p>
                  Employr tidak bertanggung jawab atas keterlambatan kinerja atau kendala penyediaan fitur yang diakibatkan oleh kejadian di luar kendali wajar manusia (<em>Force Majeure</em>), termasuk bencana alam, banjir, kebakaran besar, gangguan jaringan telekomunikasi massal penyedia internet publik, gangguan masif penyedia pusat data komputasi awan, maupun berlakunya regulasi darurat pemerintah yang secara langsung menghambat operasional layanan.
                </p>
              </article>

              {/* 14. Hukum & Penyelesaian Sengketa */}
              <article id="hukum-sengketa" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Scale size={16} />
                  <span>Pasal 14</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  14. Hukum yang Berlaku & Penyelesaian Sengketa
                </h2>

                {/* Callout Ringkas */}
                <div className="p-3.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Ringkasnya buat kamu:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>Ketentuan ini diatur sepenuhnya berdasarkan hukum Republik Indonesia.</li>
                    <li>Jika ada perselisihan, kita selesaikan terlebih dahulu lewat musyawarah mufakat secara kekeluargaan dalam 30 hari sebelum langkah pengadilan.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    Seluruh ketentuan dalam Perjanjian ini diatur dan ditafsirkan sepenuhnya berdasarkan <strong>Hukum Positif Negara Republik Indonesia</strong>.
                  </p>
                  <p>
                    Setiap perselisihan atau keluhan yang timbul wajib diselesaikan terlebih dahulu melalui jalur <strong>musyawarah untuk mufakat</strong> secara kekeluargaan dalam jangka waktu maksimal 30 (tiga puluh) hari kalender sejak pemberitahuan tertulis disampaikan.
                  </p>
                  <p>
                    Apabila dalam jangka waktu 30 (tiga puluh) hari musyawarah tidak mencapai mufakat, maka penyelesaian sengketa akan dilanjutkan melalui jalur hukum yang berlaku di Republik Indonesia.
                  </p>
                </div>
              </article>

              {/* 15. Ketentuan Penutup & Pengaduan */}
              <article id="penutup-layanan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
                  <Mail size={16} />
                  <span>Pasal 15</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  15. Keterpisahan Ketentuan, Bahasa Resmi, & Layanan Pengaduan Konsumen
                </h2>
                <div className="space-y-4">
                  <p>
                    <strong>Keterpisahan Ketentuan:</strong> Apabila suatu klausul dalam Perjanjian ini dinyatakan tidak sah atau tidak dapat diberlakukan oleh pengadilan yang berwenang, klausul-klausul lainnya tetap berlaku secara penuh dan mengikat.
                  </p>
                  <p>
                    <strong>Bahasa Resmi:</strong> Perjanjian ini disusun dalam Bahasa Indonesia resmi. Jika terdapat salinan dalam bahasa lain untuk kemudahan membaca, maka versi Bahasa Indonesia yang berlaku sebagai acuan utama.
                  </p>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                    <span className="font-bold block text-slate-900 dark:text-white">Saluran Pengaduan Konsumen & Layanan Resmi:</span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Badan Penyelenggara:</span>
                      <span className="font-bold text-slate-900 dark:text-white">Employr Indonesia</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Email Resmi & Bantuan:</span>
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="text-cobalt-500 dark:text-blue-400 font-bold hover:underline">
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Threads Resmi:</span>
                      <a href="https://www.threads.net/@employr.id" target="_blank" rel="noopener noreferrer" className="text-cobalt-500 dark:text-blue-400 font-bold hover:underline">
                        @employr.id
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-400">DM Threads:</span>
                      <a href="https://www.threads.net/@riizalhp" target="_blank" rel="noopener noreferrer" className="text-cobalt-500 dark:text-blue-400 font-bold hover:underline">
                        @riizalhp
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Wilayah Layanan:</span>
                      <span className="font-medium text-slate-900 dark:text-white">Seluruh Indonesia</span>
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
                <Link href="/kebijakan-privasi" className="text-cobalt-500 dark:text-blue-400 hover:underline">
                  Kebijakan Privasi Data
                </Link>
                <span>·</span>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                >
                  Kembali ke Halaman Sebelumnya
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Scroll & Reading Progress Indicator */}
      <ScrollProgress sections={TOC_ITEMS} />
    </div>
  );
}
