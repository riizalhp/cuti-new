import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt="Employr Logo" width={110} height={30} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
          </div>
          <Link
            href="/onboarding"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1738D1] transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Link>
        </header>

        <main className="space-y-6">
          <div className="flex items-center gap-3 text-[#1738D1]">
            <ShieldCheck size={28} />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Syarat & Ketentuan Penggunaan</h1>
          </div>
          <p className="text-xs text-slate-500">Terakhir diperbarui: 20 Agustus 2026</p>

          <section className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mengakses dan menggunakan platform Employr (termasuk pembuatan CV, pendaftaran karir, dan pencarian lowongan kerja), Anda menyatakan setuju untuk terikat oleh Syarat dan Ketentuan ini.
              </p>
            </article>

            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">2. Layanan Pembuatan & Optimasi CV</h2>
              <p>
                Employr menyediakan layanan pembuatan CV otomatis berstandar ATS dan layanan optimasi CV profesional. Data yang Anda masukkan akan diproses untuk memformat CV dan merekomendasikan posisi pekerjaan yang relevan.
              </p>
            </article>

            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">3. Kebenaran Informasi Pengguna</h2>
              <p>
                Pengguna bertanggung jawab penuh atas kebenaran, keakuratan, dan keabsahan data riwayat hidup, pendidikan, serta pengalaman kerja yang dimasukkan ke dalam sistem.
              </p>
            </article>

            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">4. Hak Kekayaan Intelektual & Penggunaan</h2>
              <p>
                Seluruh desain template, sistem analisis CV, dan materi yang disediakan di Employr dilindungi oleh hak cipta. Pengguna diberikan hak terbatas non-eksklusif untuk mengunduh CV pribadi untuk keperluan melamar pekerjaan.
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
