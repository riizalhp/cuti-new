"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Globe,
  Monitor,
  Compass,
  Layers,
  Sparkles,
  Users,
  Eye,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  Calendar,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react"
import { getDomainInfo, getTrafficSourceInfo } from "@/lib/visitor-helpers"

interface DayTrend {
  date: string
  day: string
  fullDate: string
  views: number
  visitors: number
  newVisitors: number
  returningVisitors: number
  linkedUsers: number
}

interface AnalyticsData {
  summary: {
    totalVisitors: number
    liveCount: number
    todayVisitorsCount: number
    todayPageviewsCount: number
    newVisitorsCount: number
    returningVisitorsCount: number
    avgDurationSec: number
  }
  topPages: Array<{ path: string; views: number }>
  trafficSources: Array<{ source: string; count: number }>
  deviceBreakdown: Array<{ device: string; count: number }>
  domainBreakdown: Array<{ domain: string; count: number }>
  trendDays: DayTrend[]
  dailyBreakdown: DayTrend[]
  trend7Days: Array<{ day: string; views: number; visitors: number }>
}

interface DayVisitorItem {
  id: string
  visitorId: string
  isOnline: boolean
  currentPage: string
  currentTitle: string
  domain: string
  hostname: string
  totalVisits: number
  totalPageviews: number
  totalDurationSec: number
  deviceType: string
  browser: string
  browserVersion: string
  os: string
  ipAddress: string
  country: string
  city: string
  trafficSource: string
  firstSeen: string
  lastSeen: string
  linkedUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    role: string
  } | null
  recentPages?: Array<{ path: string; title?: string; createdAt: string }>
}

const DOMAIN_PALETTE_COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#14B8A6", "#F43F5E", "#94A3B8"]
const TRAFFIC_PALETTE_COLORS = ["#3B82F6", "#EC4899", "#0F172A", "#0284C7", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#64748B"]

interface AnalyticsTabProps {
  onSelectVisitor?: (visitorId: string) => void
}

export function AnalyticsTab({ onSelectVisitor }: AnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState("all")
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(7)

  // Selected Day Inspection State
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [dayVisitors, setDayVisitors] = useState<DayVisitorItem[]>([])
  const [loadingDayVisitors, setLoadingDayVisitors] = useState(false)
  const dayInspectorRef = useRef<HTMLDivElement>(null)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (domainFilter !== "all") params.set("domain", domainFilter)
      params.set("days", String(daysRange))

      const res = await fetch(`/api/visitors/stats?${params.toString()}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
        // Default selectedDate to the most recent day in the trend
        if (!selectedDate && json.data.trendDays?.length > 0) {
          const latestDay = json.data.trendDays[json.data.trendDays.length - 1].date
          setSelectedDate(latestDay)
        }
      }
    } catch (err) {
      console.error("Gagal memuat analitik visitor:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats when domain or days range changes
  useEffect(() => {
    fetchStats()
  }, [domainFilter, daysRange])

  // Fetch visitors for the selected date
  useEffect(() => {
    if (!selectedDate) return

    const fetchDayVisitors = async () => {
      setLoadingDayVisitors(true)
      try {
        const params = new URLSearchParams()
        params.set("date", selectedDate)
        if (domainFilter !== "all") params.set("domain", domainFilter)
        params.set("limit", "50")

        const res = await fetch(`/api/visitors?${params.toString()}`)
        const json = await res.json()
        if (json.success) {
          setDayVisitors(json.data || [])
        }
      } catch (err) {
        console.error("Gagal mengambil data pengunjung pada tanggal:", selectedDate, err)
      } finally {
        setLoadingDayVisitors(false)
      }
    }

    fetchDayVisitors()
  }, [selectedDate, domainFilter])

  const handleSelectDay = (dateStr: string, scroll = true) => {
    setSelectedDate(dateStr)
    if (scroll && dayInspectorRef.current) {
      dayInspectorRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const formatDuration = (sec: number) => {
    if (!sec || sec < 60) return `${sec || 0}s`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s > 0 ? `${s}s` : ""}`
  }

  const formatHourMinute = (isoString: string) => {
    if (!isoString) return "-"
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "-"
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType?.toLowerCase() === "mobile") return <Smartphone size={14} className="text-blue-500" />
    if (deviceType?.toLowerCase() === "tablet") return <Tablet size={14} className="text-amber-500" />
    return <Laptop size={14} className="text-indigo-500" />
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Mengkalkulasi metrik & grafik kunjungan harian...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Gagal memuat analitik visitor.
      </div>
    )
  }

  const maxPageViews = Math.max(...(data.topPages?.map((p) => p.views) || [1]), 1)
  const totalTrafficCount = data.trafficSources?.reduce((acc, curr) => acc + curr.count, 0) || 1
  const totalDeviceCount = data.deviceBreakdown?.reduce((acc, curr) => acc + curr.count, 0) || 1
  const totalDomainCount = data.domainBreakdown?.reduce((acc, curr) => acc + curr.count, 0) || 1

  const selectedDayInfo = data.trendDays?.find((d) => d.date === selectedDate)

  return (
    <div className="space-y-6">
      {/* 1. Header Filter & Range Control */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-orange-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Domain:</span>
          </div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-xs text-orange-900 dark:text-orange-200 font-bold focus:outline-none"
          >
            <option value="all">Semua Domain</option>
            <option value="employr.id">employr.id (Landing)</option>
            <option value="app.employr.id">app.employr.id (Dashboard)</option>
            <option value="loker.employr.id">loker.employr.id (Portal)</option>
            <option value="learning.employr.id">learning.employr.id</option>
            <option value="faq.employr.id">faq.employr.id</option>
            <option value="admin-employr-rahasia.employr.id">admin-employr-rahasia.employr.id (Admin)</option>
            <option value="localhost">Localhost (Dev)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Days Range Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDaysRange(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysRange === 7
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDaysRange(14)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysRange === 14
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              14 Hari
            </button>
            <button
              onClick={() => setDaysRange(30)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysRange === 30
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              30 Hari
            </button>
          </div>

          <button
            onClick={fetchStats}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Muat Ulang Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengunjung</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {data.summary.totalVisitors.toLocaleString("id-ID")}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
            <span>{data.summary.newVisitorsCount} Baru Hari Ini</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{data.summary.returningVisitorsCount} Kembali</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pageviews Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {data.summary.todayPageviewsCount.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari {data.summary.todayVisitorsCount} visitor aktif hari ini
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rata-rata Durasi Sesi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {formatDuration(data.summary.avgDurationSec)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Waktu interaksi per sesi kunjungan
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sedang Aktif Live</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center relative">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2">
            {data.summary.liveCount}
            <span className="text-xs text-slate-400 font-normal">pengunjung online</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Heartbeat dalam 2 menit terakhir
          </p>
        </div>
      </div>

      {/* 3. DUAL-METRIC INTERACTIVE CHART (Pengunjung Unik vs Tayangan Halaman) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              Grafik Tren Pengunjung & Tayangan Harian ({daysRange} Hari)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau perbandingan jumlah pengunjung unik dan total tayangan halaman setiap hari. Klik titik/hari pada grafik untuk melihat rinciannya.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Pengunjung Unik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Tayangan Halaman</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.trendDays || []}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const clickedDate = state.activePayload[0].payload.date
                  if (clickedDate) handleSelectDay(clickedDate, true)
                }
              }}
              className="cursor-pointer"
            >
              <defs>
                <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DayTrend
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-white text-xs space-y-1.5">
                        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                          <span>{item.fullDate || item.date}</span>
                          <span className="text-[10px] text-orange-400 font-normal">Klik untuk rincian</span>
                        </p>
                        <div className="flex items-center justify-between gap-4 text-orange-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            Pengunjung Unik:
                          </span>
                          <span>{item.visitors} orang</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-blue-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Tayangan Halaman:
                          </span>
                          <span>{item.views} views</span>
                        </div>
                        <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between gap-3">
                          <span>{item.newVisitors} Baru</span>
                          <span>•</span>
                          <span>{item.returningVisitors} Kembali</span>
                          <span>•</span>
                          <span>{item.linkedUsers} Akun Terhubung</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Tayangan Halaman"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#viewsGradient)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Pengunjung Unik"
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#visitorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick helper info */}
        <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between text-xs text-orange-900 dark:text-orange-200">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-orange-500 shrink-0" />
            <span>
              <strong>Petunjuk:</strong> Klik titik mana saja pada grafik di atas atau pilih tanggal di bawah untuk memeriksa siapa saja yang berkunjung di hari tersebut beserta halamannya.
            </span>
          </div>
          {selectedDate && (
            <span className="font-bold text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800 shrink-0">
              Hari Terpilih: {selectedDayInfo?.day || selectedDate}
            </span>
          )}
        </div>
      </div>

      {/* 4. DAY INSPECTOR ("SIAPA YANG VISIT DI HARI X BERAPA") */}
      <div
        ref={dayInspectorRef}
        className="p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 border-2 border-orange-500/30 dark:border-orange-500/20 shadow-sm space-y-5"
      >
        {/* Day Inspector Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500 text-white shadow-xs">
                <Calendar size={16} />
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                Inspeksi Pengunjung Hari Ini: {selectedDayInfo?.fullDate || selectedDate}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Catatan lengkap siapa saja pengunjung yang datang pada tanggal ini, akun yang terhubung, halaman yang dibuka, serta IP dan perangkatnya.
            </p>
          </div>

          {/* Date Picker & Quick Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-xs">
              <Calendar size={14} className="text-orange-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleSelectDay(e.target.value, false)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const idx = data.trendDays?.findIndex((d) => d.date === selectedDate)
                  if (idx !== undefined && idx > 0) {
                    handleSelectDay(data.trendDays[idx - 1].date, false)
                  }
                }}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 transition"
                title="Hari Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  const idx = data.trendDays?.findIndex((d) => d.date === selectedDate)
                  if (idx !== undefined && idx < (data.trendDays?.length || 0) - 1) {
                    handleSelectDay(data.trendDays[idx + 1].date, false)
                  }
                }}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 transition"
                title="Hari Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Day Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Total Pengunjung Unik
            </span>
            <p className="text-xl font-black text-orange-950 dark:text-orange-200 mt-1">
              {selectedDayInfo?.visitors ?? dayVisitors.length} <span className="text-xs font-normal">orang</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Tayangan Halaman
            </span>
            <p className="text-xl font-black text-blue-950 dark:text-blue-200 mt-1">
              {selectedDayInfo?.views ?? dayVisitors.reduce((acc, v) => acc + v.totalPageviews, 0)} <span className="text-xs font-normal">views</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Pengunjung Baru
            </span>
            <p className="text-xl font-black text-emerald-950 dark:text-emerald-200 mt-1">
              {selectedDayInfo?.newVisitors ?? "-"} <span className="text-xs font-normal">pertama kali</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Pengunjung Kembali
            </span>
            <p className="text-xl font-black text-indigo-950 dark:text-indigo-200 mt-1">
              {selectedDayInfo?.returningVisitors ?? "-"} <span className="text-xs font-normal">returning</span>
            </p>
          </div>
        </div>

        {/* Selected Day Visitors List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Users size={14} className="text-orange-500" />
              Daftar Siapa Saja yang Berkunjung pada {selectedDayInfo?.day || selectedDate}:
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {dayVisitors.length} pengunjung tercatat
            </span>
          </div>

          {loadingDayVisitors ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Memuat catatan pengunjung...</p>
            </div>
          ) : dayVisitors.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada riwayat pengunjung pada tanggal {selectedDate}.
              </p>
              <p className="text-[11px] text-slate-400">
                Pilih tanggal lain pada grafik di atas atau gunakan kalender tanggal untuk memeriksa hari sebelumnya.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayVisitors.map((visitor) => {
                const tsMeta = getTrafficSourceInfo(visitor.trafficSource)
                const domainMeta = getDomainInfo(visitor.domain)

                return (
                  <div
                    key={visitor.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-400 dark:hover:border-orange-500/50 shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      {/* Left: User Identity */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 shrink-0">
                          {visitor.linkedUser?.avatarUrl ? (
                            <img
                              src={visitor.linkedUser.avatarUrl}
                              alt={visitor.linkedUser.name}
                              className="w-full h-full rounded-xl object-cover"
                            />
                          ) : visitor.linkedUser?.name ? (
                            visitor.linkedUser.name.charAt(0).toUpperCase()
                          ) : (
                            <User size={15} className="text-slate-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            {visitor.linkedUser ? (
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                {visitor.linkedUser.name}
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                                  Akun Terdaftar ({visitor.linkedUser.role})
                                </span>
                              </span>
                            ) : (
                              <span className="font-semibold text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                  Tamu Anonim
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  {visitor.visitorId}
                                </span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            {visitor.linkedUser?.email && (
                              <span>{visitor.linkedUser.email}</span>
                            )}
                            {visitor.linkedUser?.email && <span>•</span>}
                            <span className="font-mono text-slate-400">{visitor.ipAddress}</span>
                            <span>•</span>
                            <span>{visitor.city || "Jakarta"}, {visitor.country || "Indonesia"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges & Action */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${tsMeta.badgeText} bg-slate-50 dark:bg-slate-800`}>
                          {tsMeta.icon}
                          {tsMeta.label}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {getDeviceIcon(visitor.deviceType)}
                          {visitor.deviceType} • {visitor.browser}
                        </span>

                        {onSelectVisitor && (
                          <button
                            onClick={() => onSelectVisitor(visitor.visitorId)}
                            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <span>Detail Log</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Pages Visited on that day */}
                    {visitor.recentPages && visitor.recentPages.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                          <Eye size={12} className="text-blue-500" />
                          Halaman dibuka:
                        </span>
                        {visitor.recentPages.slice(0, 6).map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-slate-700"
                            title={p.title || p.path}
                          >
                            {p.path}
                          </span>
                        ))}
                        {visitor.recentPages.length > 6 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{visitor.recentPages.length - 6} halaman lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. TABEL REKAPITULASI HARIAN (Daily Breakdown Table) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              Tabel Rekapitulasi Pengunjung Harian ({daysRange} Hari Terakhir)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rincian angka pengunjung dan tayangan halaman per tanggal kalender.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Pengunjung Unik</th>
                <th className="p-3.5">Tayangan Halaman</th>
                <th className="p-3.5">Pengunjung Baru</th>
                <th className="p-3.5">Pengunjung Kembali</th>
                <th className="p-3.5">User Terhubung</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.dailyBreakdown?.map((day) => {
                const isSelected = day.date === selectedDate
                return (
                  <tr
                    key={day.date}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-orange-50/70 dark:bg-orange-950/30 font-semibold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {day.fullDate || day.day}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{day.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-orange-600 dark:text-orange-400">
                      {day.visitors} orang
                    </td>
                    <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400">
                      {day.views} views
                    </td>
                    <td className="p-3.5 text-emerald-600 font-medium">
                      {day.newVisitors} baru
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {day.returningVisitors} kembali
                    </td>
                    <td className="p-3.5 text-indigo-600 dark:text-indigo-400 font-medium">
                      {day.linkedUsers} user
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleSelectDay(day.date, true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white"
                        }`}
                      >
                        {isSelected ? "Sedang Dilihat" : "Lihat Siapa Saja"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. DOMAIN BREAKDOWN & TRAFFIC SOURCES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
            <Globe size={16} className="text-orange-500" />
            Distribusi Domain & Subdomain
          </h3>
          <p className="text-xs text-slate-500 mb-4">Sebaran pengunjung per domain/subdomain Employr</p>

          <div className="space-y-3">
            {(data.domainBreakdown?.length || 0) > 0 ? (
              data.domainBreakdown.map((d, idx) => {
                const percent = Math.round((d.count / totalDomainCount) * 100)
                const domainMeta = getDomainInfo(d.domain)
                return (
                  <div key={d.domain || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${domainMeta.badgeText}`}>
                        {domainMeta.icon}
                        <span className="truncate max-w-[180px]">{domainMeta.label}</span>
                      </span>
                      <span className="text-slate-500 font-mono">
                        {d.count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: DOMAIN_PALETTE_COLORS[idx % DOMAIN_PALETTE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Data domain belum tersedia.
              </p>
            )}
          </div>
        </div>

        {/* Traffic Sources & Device Distribution */}
        <div className="space-y-6">
          {/* Traffic Sources */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Compass size={16} className="text-orange-500" />
              Sumber Lalu Lintas (Traffic Sources)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Distribusi kanal kedatangan pengunjung</p>

            <div className="space-y-3">
              {data.trafficSources?.map((ts, idx) => {
                const percent = Math.round((ts.count / totalTrafficCount) * 100)
                const tsMeta = getTrafficSourceInfo(ts.source)
                return (
                  <div key={ts.source || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${tsMeta.badgeText}`}>
                        {tsMeta.icon}
                        <span className="truncate max-w-[180px]">{tsMeta.label}</span>
                      </span>
                      <span className="text-slate-500 font-mono">
                        {ts.count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: TRAFFIC_PALETTE_COLORS[idx % TRAFFIC_PALETTE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              {(!data.trafficSources || data.trafficSources.length === 0) && (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada data sumber traffic.</p>
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Monitor size={16} className="text-indigo-500" />
              Distribusi Perangkat
            </h3>
            <p className="text-xs text-slate-500 mb-4">Tipe perangkat yang digunakan pengunjung</p>

            <div className="grid grid-cols-3 gap-3">
              {data.deviceBreakdown?.map((d) => {
                const percent = Math.round((d.count / totalDeviceCount) * 100)
                return (
                  <div
                    key={d.device}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
                      {d.device.toLowerCase() === "mobile" ? (
                        <Smartphone size={16} />
                      ) : d.device.toLowerCase() === "tablet" ? (
                        <Tablet size={16} />
                      ) : (
                        <Laptop size={16} />
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.device}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{d.count} ({percent}%)</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Top Pages */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Layers size={16} className="text-blue-500" />
          10 Halaman Paling Sering Dikunjungi
        </h3>
        <p className="text-xs text-slate-500 mb-4">Urutan halaman berdasarkan total pageviews</p>

        <div className="space-y-3">
          {data.topPages?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data halaman.</p>
          ) : (
            data.topPages.map((p, idx) => {
              const percent = Math.round((p.views / maxPageViews) * 100)
              return (
                <div key={p.path || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                      {p.path}
                    </span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {p.views.toLocaleString("id-ID")} views
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}