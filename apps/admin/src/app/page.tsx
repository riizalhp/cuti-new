"use client"

import { StatsCard } from "@/components/admin/StatsCard"
import { Users, FileText, DollarSign, Activity, ArrowRight, UserCheck, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Pengguna",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Pengguna Lifetime Member",
      value: "342",
      change: "+8.2%",
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "CV Disiapkan",
      value: "5,891",
      change: "+23.1%",
      icon: FileText,
      trend: "up" as const,
    },
    {
      title: "Sesi Aktif Hari Ini",
      value: "184",
      change: "-2.4%",
      icon: Activity,
      trend: "down" as const,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Beranda Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Ringkasan sistem dan aktivitas platform Employr
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Normal
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Activity size={18} className="text-[#1F3578] dark:text-navy-300" />
              Aktivitas Terkini
            </h2>
            <span className="text-xs font-bold text-slate-400">Real-time Log</span>
          </div>
          <div className="space-y-3.5">
            {[
              { text: "Pengguna baru mendaftar (Free User)", time: "2 menit lalu", icon: UserCheck, badge: "Pendaftaran", badgeColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
              { text: "Pembelian Paket Profesional berhasil (Rp59.000)", time: "14 menit lalu", icon: DollarSign, badge: "Transaksi", badgeColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
              { text: "Permintaan CV disiapkan oleh sistem", time: "28 menit lalu", icon: FileText, badge: "CV Builder", badgeColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
              { text: "Bukti misi cuan baru diunggah (#MISI-882)", time: "45 menit lalu", icon: Activity, badge: "Misi Cuan", badgeColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
              { text: "Pencairan referral disetujui admin (#REF-092)", time: "1 jam lalu", icon: UserCheck, badge: "Referral", badgeColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.text}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
              <ShieldAlert size={18} className="text-orange-500" />
              Aksi Cepat Admin
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Pintasan menu manajemen sistem</p>

            <div className="space-y-3">
              <a href="/users" className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-between group">
                <span>Kelola Pengguna</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/cv" className="w-full py-3 px-4 bg-[#1F3578] hover:bg-[#182a60] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-between group">
                <span>Lihat Antrean CV</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/campaigns" className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-between group">
                <span>Review Misi Cuan</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/settings" className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-between group">
                <span>Pengaturan Harga & Sistem</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center">
              Employr Admin Panel v1.0 • Turborepo
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
