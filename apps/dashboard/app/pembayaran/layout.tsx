'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getStoredSession } from '@/lib/auth';

export default function PembayaranLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getStoredSession();
    if (!session || !session.email) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-[#1738D1] selection:text-white">
      {/* Top Standalone Checkout Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Back Action */}
          <div className="flex items-center gap-4">
            <Link
              href="/beranda"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Dashboard</span>
              <span className="sm:hidden">Kembali</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <Link href="/beranda" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-[10px] bg-[#1738D1] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#1738D1]/20 group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                  Ambil<span className="text-[#1738D1] dark:text-blue-400">CUTI</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 leading-tight">
                  Checkout &amp; Aktivasi
                </span>
              </div>
            </Link>
          </div>

          {/* Security & Verification Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Garansi 100% Aman</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400" />
              <span className="font-mono text-[11px] font-bold">SSL 256-bit</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {children}
      </main>

      {/* Standalone Checkout Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center md:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Pembayaran Resmi &amp; Terverifikasi AmbilCUTI</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg">
                Seluruh transaksi diproses secara terenkripsi melalui payment gateway berlisensi Bank Indonesia (Midtrans, QRIS, &amp; Jaringan ATM Bersama).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">QRIS</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">BCA</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Mandiri</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">BNI</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">BRI</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Visa / Mastercard</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Indomaret</span>
              <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Alfamart</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>&copy; {new Date().getFullYear()} AmbilCUTI. Hak Cipta Dilindungi Undang-Undang.</span>
            <div className="flex items-center gap-4">
              <Link href="/beranda" className="hover:text-slate-600 dark:hover:text-slate-300">Dashboard</Link>
              <span>&bull;</span>
              <span className="text-slate-400">Butuh Bantuan? Hubungi support@ambilcuti.id</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
