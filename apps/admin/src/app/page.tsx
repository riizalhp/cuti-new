"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/admin/StatsCard"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
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
  Sparkles,
  Briefcase,
  Send,
  FileSearch,
  CalendarCheck,
  XCircle,
  Building2,
  Clock,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
} from "recharts"

interface TopTemplate {
  id: string
  name: string
  used: number
  downloaded: number
}

export type ApplicationUiStatus = "Terkirim" | "Screening" | "Interview" | "Offering" | "Ditolak"

const STATUS_CONFIG: Record<
  ApplicationUiStatus,
  { label: string; badge: string; dot: string; icon: React.ElementType }
> = {
  Terkirim: {
    label: "Terkirim",
    badge: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    dot: "bg-sky-500",
    icon: Send,
  },
  Screening: {
    label: "Screening",
    badge: "bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dot: "bg-[#1738D1]",
    icon: FileSearch,
  },
  Interview: {
    label: "Interview",
    badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
    icon: CalendarCheck,
  },
  Offering: {
    label: "Offering",
    badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    icon: Sparkles,
  },
  Ditolak: {
    label: "Ditolak",
    badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
    icon: XCircle,
  },
}

function formatAppDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    const now = new Date()
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
    if (diffHours < 24 && now.getDate() === d.getDate()) return "Hari ini"
    if (diffHours < 48) return "Kemarin"
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  } catch {
    return isoString
  }
}

interface DashboardStats {
  users: { total: number; free: number; premium: number; admin: number }
  orders: { total: number; completed: number; processing: number }
  cv: { total: number; ready: number; processing: number }
  misi: { total: number; active: number; pendingSubmissions: number }
  applications: {
    total: number
    terkirim: number
    screening: number
    interview: number
    offering: number
    ditolak: number
  }
  transactions: { total: number; successful: number; totalRevenue: number }
  withdrawals: { pending: number }
  templateStats?: {
    totalDownloaded: number
    topTemplates: TopTemplate[]
  }
  recentOrders: any[]
  recentApplications: Array<{
    id: string
    companyName: string
    position: string
    status: ApplicationUiStatus
    rawStatus?: string
    userName: string
    createdAt: string
    matchScore?: number | null
    location?: string | null
    portal?: string | null
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trackerTab, setTrackerTab] = useState<"chart" | "cards">("chart")
  const [templateTab, setTemplateTab] = useState<"chart" | "ranking">("chart")

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

  const trackerChartData = stats
    ? [
        {
          stage: "Terkirim",
          label: "1. Terkirim",
          count: stats.applications.terkirim,
          color: "#0EA5E9",
          desc: "Formulir dikirim ke HR/portal",
          percent:
            stats.applications.total > 0
              ? Math.round((stats.applications.terkirim / stats.applications.total) * 100)
              : 0,
        },
        {
          stage: "Screening",
          label: "2. Screening",
          count: stats.applications.screening,
          color: "#1738D1",
          desc: "Review berkas & kualifikasi ATS",
          percent:
            stats.applications.total > 0
              ? Math.round((stats.applications.screening / stats.applications.total) * 100)
              : 0,
        },
        {
          stage: "Interview",
          label: "3. Interview",
          count: stats.applications.interview,
          color: "#F59E0B",
          desc: "Sesi wawancara aktif HR/User",
          percent:
            stats.applications.total > 0
              ? Math.round((stats.applications.interview / stats.applications.total) * 100)
              : 0,
        },
        {
          stage: "Offering",
          label: "4. Offering",
          count: stats.applications.offering,
          color: "#10B981",
          desc: "Menerima penawaran kerja",
          percent:
            stats.applications.total > 0
              ? Math.round((stats.applications.offering / stats.applications.total) * 100)
              : 0,
        },
        {
          stage: "Ditolak",
          label: "5. Ditolak",
          count: stats.applications.ditolak,
          color: "#EF4444",
          desc: "Belum lolos seleksi",
          percent:
            stats.applications.total > 0
              ? Math.round((stats.applications.ditolak / stats.applications.total) * 100)
              : 0,
        },
      ]
    : []

  const templateChartData =
    stats?.templateStats?.topTemplates?.map((t) => ({
      name: t.name.replace(/ Standard| Ruled| Airy| Grid| Classic| Executive/g, ""),
      fullName: t.name,
      downloaded: t.downloaded,
      used: t.used,
      ratio: t.used > 0 ? Math.round((t.downloaded / t.used) * 100) : 0,
    })) || []

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
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Beranda Dashboard</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Ringkasan sistem, aktivitas platform, dan analitik template CV Employr
            </p>
          </div>
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

      {/* Pipeline & Status Tracker Lamaran Kerja (Terkirim, Screening, Interview, Offering, Ditolak) */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Briefcase size={18} className="text-orange-500" />
                Pipeline & Status Tracker Lamaran Kerja
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribusi real-time tahapan lamaran yang dicatat pengguna di Tracker Lamaran Kerja
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Toggle Mode: Grafik vs Kartu */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTrackerTab("chart")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trackerTab === "chart"
                      ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <BarChart3 size={13} />
                  Grafik Batang
                </button>
                <button
                  type="button"
                  onClick={() => setTrackerTab("cards")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trackerTab === "cards"
                      ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Layers size={13} />
                  Kartu Tahapan
                </button>
              </div>

              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Total: <strong className="text-slate-900 dark:text-white font-extrabold">{stats.applications.total.toLocaleString("id-ID")}</strong>
              </span>
            </div>
          </div>

          {/* Mode 1: Grafik Batang Interaktif (Recharts) */}
          {trackerTab === "chart" && (
            <div className="space-y-4">
              <div className="h-64 sm:h-72 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trackerChartData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="grad-Terkirim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="grad-Screening" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#1738D1" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="grad-Interview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#D97706" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="grad-Offering" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="grad-Ditolak" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as (typeof trackerChartData)[0]
                          return (
                            <div className="p-3 bg-slate-900 border border-slate-700/90 rounded-xl shadow-xl text-white text-xs space-y-1.5 min-w-[200px]">
                              <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-3">
                                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                  Tahap {item.stage}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-orange-400">
                                  {item.percent}% Total
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-400">Jumlah Lamaran:</span>
                                <span className="font-extrabold text-white text-sm">
                                  {item.count.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 pt-0.5">{item.desc}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {trackerChartData.map((entry) => (
                        <Cell key={`cell-${entry.stage}`} fill={`url(#grad-${entry.stage})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Conversion KPI Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Lamaran</span>
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {stats.applications.total.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <span className="text-[10px] font-bold text-[#1738D1] dark:text-blue-400 uppercase tracking-wider">Screening Active</span>
                  <p className="text-lg font-black text-[#1738D1] dark:text-blue-200">
                    {stats.applications.screening.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Interview Rate</span>
                  <p className="text-lg font-black text-amber-800 dark:text-amber-200">
                    {stats.applications.total > 0
                      ? `${Math.round(((stats.applications.interview + stats.applications.offering) / stats.applications.total) * 100)}%`
                      : "0%"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Offer Success</span>
                  <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                    {stats.applications.total > 0
                      ? `${Math.round((stats.applications.offering / stats.applications.total) * 100)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Kartu Tahapan Grid */}
          {trackerTab === "cards" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
                {/* 1. Terkirim */}
                <div className="p-4 rounded-xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                      <Send size={14} className="text-sky-600 dark:text-sky-400" />
                      Terkirim
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                      {stats.applications.total > 0
                        ? `${Math.round((stats.applications.terkirim / stats.applications.total) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-sky-950 dark:text-sky-100 tracking-tight">
                      {stats.applications.terkirim.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] font-medium text-sky-700/80 dark:text-sky-400/80 mt-0.5">
                      Formulir / email dikirim ke HR
                    </p>
                  </div>
                </div>

                {/* 2. Screening */}
                <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1738D1] dark:text-blue-300 flex items-center gap-1.5">
                      <FileSearch size={14} className="text-[#1738D1] dark:text-blue-400" />
                      Screening
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-[#1738D1] dark:text-blue-300">
                      {stats.applications.total > 0
                        ? `${Math.round((stats.applications.screening / stats.applications.total) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-blue-100 tracking-tight">
                      {stats.applications.screening.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-blue-300/80 mt-0.5">
                      Tahap review berkas & ATS
                    </p>
                  </div>
                </div>

                {/* 3. Interview */}
                <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <CalendarCheck size={14} className="text-amber-600 dark:text-amber-400" />
                      Interview
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                      {stats.applications.total > 0
                        ? `${Math.round((stats.applications.interview / stats.applications.total) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-amber-950 dark:text-amber-100 tracking-tight">
                      {stats.applications.interview.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] font-medium text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                      Wawancara HR / User aktif
                    </p>
                  </div>
                </div>

                {/* 4. Offering */}
                <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                      Offering
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      {stats.applications.total > 0
                        ? `${Math.round((stats.applications.offering / stats.applications.total) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                      {stats.applications.offering.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Mendapat penawaran kerja
                    </p>
                  </div>
                </div>

                {/* 5. Ditolak */}
                <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
                      Ditolak
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                      {stats.applications.total > 0
                        ? `${Math.round((stats.applications.ditolak / stats.applications.total) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-rose-950 dark:text-rose-100 tracking-tight">
                      {stats.applications.ditolak.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] font-medium text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                      Belum lolos seleksi
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribution Stacked Bar */}
              {stats.applications.total > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Distribusi Kumulatif Status:</span>
                    <span className="text-[11px]">100% Tercatat</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex gap-0.5 p-0.5">
                    {stats.applications.terkirim > 0 && (
                      <div
                        className="bg-sky-500 h-full rounded-xs transition-all duration-500"
                        style={{ width: `${(stats.applications.terkirim / stats.applications.total) * 100}%` }}
                        title={`Terkirim: ${stats.applications.terkirim}`}
                      />
                    )}
                    {stats.applications.screening > 0 && (
                      <div
                        className="bg-[#1738D1] h-full rounded-xs transition-all duration-500"
                        style={{ width: `${(stats.applications.screening / stats.applications.total) * 100}%` }}
                        title={`Screening: ${stats.applications.screening}`}
                      />
                    )}
                    {stats.applications.interview > 0 && (
                      <div
                        className="bg-amber-500 h-full rounded-xs transition-all duration-500"
                        style={{ width: `${(stats.applications.interview / stats.applications.total) * 100}%` }}
                        title={`Interview: ${stats.applications.interview}`}
                      />
                    )}
                    {stats.applications.offering > 0 && (
                      <div
                        className="bg-emerald-500 h-full rounded-xs transition-all duration-500"
                        style={{ width: `${(stats.applications.offering / stats.applications.total) * 100}%` }}
                        title={`Offering: ${stats.applications.offering}`}
                      />
                    )}
                    {stats.applications.ditolak > 0 && (
                      <div
                        className="bg-rose-500 h-full rounded-xs transition-all duration-500"
                        style={{ width: `${(stats.applications.ditolak / stats.applications.total) * 100}%` }}
                        title={`Ditolak: ${stats.applications.ditolak}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" /> Terkirim ({stats.applications.terkirim})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1738D1]" /> Screening ({stats.applications.screening})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Interview ({stats.applications.interview})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Offering ({stats.applications.offering})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Ditolak ({stats.applications.ditolak})
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Main Grid: Orders, Popular Templates & Quick Actions */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Top Downloaded Templates Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Flame size={18} className="text-orange-500" />
                      Template CV Terpopuler (Sering Di-download)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Catatan template dengan unduhan dan pembuatan tertinggi
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Toggle View: Grafik vs Peringkat */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setTemplateTab("chart")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          templateTab === "chart"
                            ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <BarChart3 size={13} />
                        Grafik
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplateTab("ranking")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          templateTab === "ranking"
                            ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <Layers size={13} />
                        Peringkat
                      </button>
                    </div>

                    <Link
                      href="/cv"
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                      Lihat Semua
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {!stats.templateStats?.topTemplates || stats.templateStats.topTemplates.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <FileText size={24} className="mx-auto mb-2 text-slate-300" />
                    Belum ada riwayat template CV.
                  </div>
                ) : templateTab === "chart" ? (
                  /* Mode 1: Grafik Komparasi Recharts */
                  <div className="space-y-4">
                    {/* Legend */}
                    <div className="flex items-center justify-end gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        Di-download
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Dibuat
                      </span>
                    </div>

                    <div className="h-64 sm:h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={templateChartData}
                          margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F97316" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#EA580C" stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.7} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <RechartsTooltip
                            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const item = payload[0].payload as (typeof templateChartData)[0]
                                return (
                                  <div className="p-3 bg-slate-900 border border-slate-700/90 rounded-xl shadow-xl text-white text-xs space-y-2 min-w-[220px]">
                                    <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
                                      <p className="font-bold text-slate-100">{item.fullName}</p>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                                        Rasio {item.ratio}%
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                                          Total Di-download:
                                        </span>
                                        <span className="font-extrabold text-orange-400 font-mono">
                                          {item.downloaded.toLocaleString("id-ID")} kali
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                                          Total Dibuat:
                                        </span>
                                        <span className="font-extrabold text-blue-400 font-mono">
                                          {item.used.toLocaleString("id-ID")} project
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="downloaded" name="Di-download" fill="url(#downloadGrad)" radius={[5, 5, 0, 0]} />
                          <Bar dataKey="used" name="Dibuat" fill="url(#usedGrad)" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  /* Mode 2: Peringkat Leaderboard */
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

            {/* Recent Applications Feed Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Briefcase size={18} className="text-orange-500" />
                    Aktivitas Lamaran Terbaru Pengguna
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Catatan lamaran kerja yang baru saja dimasukkan atau dipantau pengguna
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {stats.recentApplications?.length || 0} Data Terkini
                </span>
              </div>

              {!stats.recentApplications || stats.recentApplications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Briefcase size={24} className="mx-auto mb-2 text-slate-300" />
                  Belum ada aktivitas lamaran tercatat.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentApplications.map((app) => {
                    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Terkirim
                    const Icon = cfg.icon
                    return (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 shadow-xs">
                            <Building2 size={17} className="text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {app.position}
                            </p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {app.companyName} • <span className="text-slate-700 dark:text-slate-300 font-semibold">{app.userName}</span>
                              {app.location ? ` • ${app.location}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <Icon size={12} />
                            {cfg.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock size={11} />
                            {formatAppDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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
                <Link href="/visitors" className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-between group">
                  <span className="flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-500" />
                    Tracker Jam Ramai & Trafik
                  </span>
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
