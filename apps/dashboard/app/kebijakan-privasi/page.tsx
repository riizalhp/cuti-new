import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock } from 'lucide-react';

export default function KebijakanPrivasiPage() {
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
          <div className="flex items-center gap-3 text-emerald-600">
            <Lock size={28} />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kebijakan Privasi Data</h1>
          </div>
          <p className="text-xs text-slate-500">Terakhir diperbarui: 20 Agustus 2026</p>

          <section className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">1. Pengumpulan Data Pribadi</h2>
              <p>
                Employr mengumpulkan informasi pribadi seperti nama lengkap, domisili kota, pendidikan terakhir, almamater, riwayat pekerjaan, serta keahlian yang Anda berikan secara sukarela saat mengisi onboarding atau profile builder.
              </p>
            </article>

            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">2. Penggunaan Informasi Anda</h2>
              <p>
                Data yang dikumpulkan digunakan semata-mata untuk:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>Membuat dokumen CV berstandar ATS.</li>
                <li>Memberikan rekomendasi posisi pekerjaan yang cocok.</li>
                <li>Menghubungkan pencari kerja dengan mitra lowongan kerja relevan.</li>
              </ul>
            </article>

            <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">3. Keamanan & Kerahasiaan Data</h2>
              <p>
                Employr berkomitmen menjaga keamanan data Anda dengan menggunakan enkripsi standar industri dan pembatasan akses. Kami tidak pernah menjual data pribadi Anda kepada pihak ketiga untuk kepentingan komersial non-layanan karir.
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
