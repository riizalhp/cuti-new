"use client"

import { motion } from "framer-motion"
import { Save, Database, Shield, Globe, Tag } from "lucide-react"

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Pengaturan Sistem & Harga</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Konfigurasi variabel sistem, harga paket membership, dan layanan</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
          <Save size={18} />
          Simpan Pengaturan
        </button>
      </div>

      <div className="space-y-6">
        {/* Membership Pricing Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Harga Paket Lifetime Membership</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Harga dapat diubah dinamis tanpa deploy ulang aplikasi</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                CV Siap Lamar
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
                <input
                  type="number"
                  defaultValue={19000}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 block">Default: Rp19.000 (Sekali bayar)</span>
            </div>

            <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/30 dark:bg-orange-950/20">
              <label className="block text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">
                CV Profesional (Rekomendasi)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
                <input
                  type="number"
                  defaultValue={59000}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 block">Default: Rp59.000 (Sekali bayar)</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Paket Siap Kerja
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
                <input
                  type="number"
                  defaultValue={99000}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 block">Default: Rp99.000 (Sekali bayar)</span>
            </div>
          </div>
        </div>

        {/* General Platform Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-navy-50 dark:bg-navy-950/60 text-[#1F3578] dark:text-navy-300 border border-navy-100 dark:border-navy-900/50">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Pengaturan Umum Platform</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Identitas dan meta informasi AmbilCUTI</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Nama Platform</label>
              <input
                type="text"
                defaultValue="AmbilCUTI"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Tagline / Deskripsi Platform</label>
              <textarea
                rows={2}
                defaultValue="Platform karir lengkap bagi siswa SMA/SMK dan Mahasiswa Indonesia."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Referral & Mission Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Pengaturan Referral & Misi Cuan</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Aturan reward dan batas minimal withdraw</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Reward Per Referral (Rp)</label>
              <input
                type="number"
                defaultValue={2500}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: Rp2.500 per referral sukses</span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Minimal Payout Referral (Rp)</label>
              <input
                type="number"
                defaultValue={25000}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: Rp25.000 untuk pengajuan withdraw</span>
            </div>
          </div>
        </div>

        {/* System Infrastructure */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Infrastruktur System</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Koneksi PostgreSQL & SeaweedFS Storage</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">PostgreSQL Database Connection</label>
              <input
                type="text"
                defaultValue="postgresql://user:***@localhost:5432/cuti_db"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                readOnly
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button className="px-4 py-2 bg-[#1F3578] hover:bg-[#182a60] text-white font-bold text-xs rounded-xl shadow-sm transition-all">
                Uji Koneksi Database
              </button>
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all">
                Lihat Health Log
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all">
            <Save size={18} />
            Simpan Semua Perubahan
          </button>
        </div>
      </div>
    </motion.div>
  )
}
