"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/admin/StatsCard"
import {
  Users,
  FileText,
  DollarSign,
  Activity,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  RefreshCw,
  ShoppingCart,
  Download,
  Flame,
  Layers,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface TopTemplate {
  id: string
  name: string
  used: number
  downloaded: number
}

interface DashboardStats {
  users: { total: number; free: number; premium: number; admin: number }
  orders: { total: number; completed: number; processing: number }
  cv: { total: number; ready: number; processing: number }
  misi: { total: number; active: number; pendingSubmissions: number }
  applications: { total: number; interview: number }
  transactions: { total: number; successful: number; totalRevenue: number }
  withdrawals: { pending: number }
  templateStats?: {
    totalDownloaded: number
    topTemplates: TopTemplate[]
  }
  recentOrders: any[]
  recentApplications: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard/stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.message || "Gagal memuat data")
      }
    } catch (err) {
      setError("Gagal terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = stats
    ? [
        {
          title: "Total Pengguna",
          value: stats.users.total.toLocaleString("id-ID"),
          change: `${stats.users.free} Gratis / ${stats.users.premium} Pro`,
          icon: Users,
          trend: "up" as const,
        },
        {
          title: "Total Order",
          value: stats.orders.total.toLocaleString("id-ID"),
          change: `${stats.orders.completed} selesai`,
          icon: ShoppingCart,
          trend: "up" as const,
        },
        {
          title: "CV Dibuat / Di-download",
          value: `${stats.cv.total.toLocaleString("id-ID")} / ${(stats.templateStats?.totalDownloaded || 0).toLocaleString("id-ID")}`,
          change: `${stats.cv.ready} CV siap diunduh`,
          icon: FileText,
          trend: "up" as const,
        },
        {
          title: "Pendapatan",
          value: `Rp ${(stats.transactions.totalRevenue / 1000).toLocaleString("id-ID")}rb`,
          change: `${stats.transactions.successful} transaksi sukses`,
          icon: DollarSign,
          trend: "up" as const,
        },
      ]
    : []

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
            Ringkasan sistem, aktivitas platform, dan analitik template CV Employr
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
            Refresh
          </button>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {error ? "Koneksi Error" : "Sistem Normal"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, index) => (
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
      )}

      {/* Main Grid: Orders, Popular Templates & Quick Actions */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Downloaded Templates Widget */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" />
                    Template CV Terpopuler (Sering Di-download)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Catatan template dengan unduhan dan pembuatan tertinggi
                  </p>
                </div>
                <Link
                  href="/cv"
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                >
                  Lihat Semua
                  <ArrowRight size={13} />
                </Link>
              </div>

              {!stats.templateStats?.topTemplates || stats.templateStats.topTemplates.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <FileText size={24} className="mx-auto mb-2 text-slate-300" />
                  Belum ada riwayat template CV.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.templateStats.topTemplates.slice(0, 4).map((tpl, idx) => {
                    const maxCount = Math.max(...stats.templateStats!.topTemplates.map((t) => t.downloaded || t.used), 1)
                    const percent = Math.max(Math.round(((tpl.downloaded || tpl.used) / maxCount) * 100), 5)

                    return (
                      <div
                        key={tpl.id}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                              idx === 0 ? "bg-amber-500 text-white" :
                              idx === 1 ? "bg-slate-400 text-white" :
                              idx === 2 ? "bg-amber-700 text-white" :
                              "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {tpl.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <span className="text-xs font-black text-orange-500">
                              {tpl.downloaded.toLocaleString("id-ID")} <span className="text-[10px] font-semibold text-slate-400">unduh</span>
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {tpl.used.toLocaleString("id-ID")} <span className="text-[10px] font-semibold text-slate-400">dibuat</span>
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total akumulasi unduhan template:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {(stats.templateStats?.totalDownloaded || 0).toLocaleString("id-ID")} kali
              </span>
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
                <Link href="/cv" className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-between group">
                  <span>Analitik Template & CV ({stats.cv.total})</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/users" className="w-full py-3 px-4 bg-[#1F3578] hover:bg-[#182a60] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-between group">
                  <span>Kelola Pengguna ({stats.users.total})</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/campaigns" className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-between group">
                  <span>Misi Cuan ({stats.misi.active} aktif)</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/settings" className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-between group">
                  <span>Pengaturan Harga & Sistem</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Pending Actions */}
            {(stats.withdrawals.pending > 0 || stats.misi.pendingSubmissions > 0) && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {stats.withdrawals.pending > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    ⚠ {stats.withdrawals.pending} pencairan menunggu approval
                  </div>
                )}
                {stats.misi.pendingSubmissions > 0 && (
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-800 dark:text-blue-300">
                    📋 {stats.misi.pendingSubmissions} misi menunggu review
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center">
                Employr Admin Panel v1.0 • Turborepo
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
