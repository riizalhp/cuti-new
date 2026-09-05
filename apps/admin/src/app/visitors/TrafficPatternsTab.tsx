"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  Flame,
  Moon,
  Calendar,
  Zap,
  Users,
  Repeat,
  Sparkles,
  ArrowRight,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  RefreshCw,
  Compass,
  Award,
  Eye,
  User,
  ShieldCheck,
  TrendingUp,
  Activity,
  Sun,
  Grid3X3,
  BarChart2,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react"
import { getDomainInfo, getTrafficSourceInfo } from "@/lib/visitor-helpers"

interface TopPageInHour {
  path: string
  count: number
}

interface HourlyItem {
  hour: number
  label: string
  views: number
  visitors: number
  classification?: "PEAK" | "HIGH" | "NORMAL" | "QUIET"
  topPages?: TopPageInHour[]
}

interface CurrentHourStatus {
  hour: number
  label: string
  views: number
  visitors: number
  classification: "PEAK" | "HIGH" | "NORMAL" | "QUIET"
  diffVsAvgPercent: number
  isCurrentPeak: boolean
}

interface HeatmapCell {
  hour: number
  label: string
  views: number
  intensity: number
}

interface HeatmapDay {
  dayIndex: number
  dayName: string
  hours: HeatmapCell[]
  totalViews: number
}

interface TimeWindow {
  id: string
  name: string
  timeRange: string
  hoursRange: [number, number]
  views: number
  status: string
  recommendation: string
}

interface DayOfWeekItem {
  dayIndex: number
  dayName: string
  views: number
  visitors: number
}

interface FrequencyBucket {
  bucket: string
  shortLabel: string
  count: number
  percent: number
  description: string
  color: string
}

interface FrequentVisitor {
  id: string
  visitorId: string
  totalVisits: number
  totalPageviews: number
  totalDurationSec: number
  deviceType: string
  browser: string
  ipAddress: string
  city: string
  country: string
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
}

interface TrafficPatternsData {
  insights: {
    peakHour: {
      hour: number
      label: string
      views: number
    }
    quietHour: {
      hour: number
      label: string
      views: number
    }
    peakDay: {
      dayName: string
      views: number
    }
    quietDay: {
      dayName: string
      views: number
    }
    recommendedPostingTime: string
  }
  hourlyDistribution: HourlyItem[]
  currentHourStatus?: CurrentHourStatus
  heatmapDayHour?: HeatmapDay[]
  timeWindows?: TimeWindow[]
  dayOfWeekDistribution: DayOfWeekItem[]
  newVsReturning: {
    totalVisitors: number
    newVisitorsCount: number
    newPercent: number
    returningVisitorsCount: number
    returningPercent: number
    retentionRate: number
    avgNewDurationSec: number
    avgReturningDurationSec: number
  }
  frequencyDistribution: FrequencyBucket[]
  averageVisitsPerVisitor: number
  topFrequentVisitors: FrequentVisitor[]
}

interface TrafficPatternsTabProps {
  onSelectVisitor?: (visitorId: string) => void
}

export function TrafficPatternsTab({ onSelectVisitor }: TrafficPatternsTabProps) {
  const [data, setData] = useState<TrafficPatternsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState("all")
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(30)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [chartMode, setChartMode] = useState<"bars" | "heatmap">("bars")
  const [hoveredCell, setHoveredCell] = useState<{ dayName: string; hour: number; views: number } | null>(null)

  const fetchPatterns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (domainFilter !== "all") params.set("domain", domainFilter)
      params.set("days", String(daysRange))

      const res = await fetch(`/api/visitors/traffic-patterns?${params.toString()}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
        if (selectedHour === null) {
          setSelectedHour(json.data.currentHourStatus?.hour ?? json.data.insights.peakHour.hour)
        }
      }
    } catch (err) {
      console.error("Gagal memuat pola trafik:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatterns()
  }, [domainFilter, daysRange])

  const formatDuration = (sec: number) => {
    if (!sec || sec < 60) return `${sec || 0}s`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    if (m < 60) return `${m}m ${s > 0 ? `${s}s` : ""}`
    const h = Math.floor(m / 60)
    const remM = m % 60
    return `${h}j ${remM}m`
  }

  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return "-"
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `${diffSec}s lalu`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m lalu`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}j lalu`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}h lalu`
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
        <p className="text-xs font-semibold text-slate-500">Menganalisis pola jam ramai, sepi, dan frekuensi trafik...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Gagal memuat catatan dan pola trafik.
      </div>
    )
  }

  const maxHourlyViews = Math.max(...data.hourlyDistribution.map((h) => h.views), 1)
  const maxDayViews = Math.max(...data.dayOfWeekDistribution.map((d) => d.views), 1)

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
            onClick={fetchPatterns}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Refresh Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. Bento Grid: KAPAN TRAFIK RAMAI & SEPI (Peak vs Off-Peak Insights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak Hour */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
              <Flame size={15} className="text-orange-500 animate-pulse" />
              Jam Paling Ramai
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500 text-white">
              Peak Hours
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {data.insights.peakHour.label}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Volume tertinggi: <strong>{data.insights.peakHour.views} tayangan</strong> halaman
          </p>
        </div>

        {/* Quiet Hour */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-300 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Moon size={15} className="text-slate-400" />
              Jam Paling Sepi
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Off-Peak
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-2">
            {data.insights.quietHour.label}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Aktivitas terendah ({data.insights.quietHour.views} tayangan)
          </p>
        </div>

        {/* Peak Day */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-500" />
              Hari Paling Ramai
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
              Busiest Day
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            Hari {data.insights.peakDay.dayName}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total {data.insights.peakDay.views} tayangan per minggu
          </p>
        </div>

        {/* Best Time for Promotion */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Zap size={15} className="text-emerald-500" />
              Waktu Optimal Publikasi
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
              Best Timing
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-2">
            {data.insights.recommendedPostingTime}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rekomendasi broadcast loker & misi baru
          </p>
        </div>
      </div>

      {/* 3. TRACKER JAM RAMAI & DISTRIBUSI 24 JAM */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        {/* 3A. Realtime Pulse Tracker Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                data.currentHourStatus?.classification === "PEAK"
                  ? "bg-orange-500 text-white animate-pulse"
                  : data.currentHourStatus?.classification === "HIGH"
                  ? "bg-blue-500 text-white"
                  : data.currentHourStatus?.classification === "NORMAL"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {data.currentHourStatus?.classification === "PEAK" ? (
                <Flame size={22} />
              ) : data.currentHourStatus?.classification === "HIGH" ? (
                <TrendingUp size={22} />
              ) : data.currentHourStatus?.classification === "NORMAL" ? (
                <Activity size={22} />
              ) : (
                <Moon size={22} />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-300">
                  Tracker Jam Ramai Realtime:
                </span>
                <span className="text-xs font-extrabold text-orange-400 font-mono">
                  {data.currentHourStatus?.label || "Pukul Saat Ini (WIB)"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    data.currentHourStatus?.classification === "PEAK"
                      ? "bg-orange-500 text-white"
                      : data.currentHourStatus?.classification === "HIGH"
                      ? "bg-blue-500 text-white"
                      : data.currentHourStatus?.classification === "NORMAL"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {data.currentHourStatus?.classification === "PEAK"
                    ? "Puncak Ramai (Peak)"
                    : data.currentHourStatus?.classification === "HIGH"
                    ? "Trafik Ramai"
                    : data.currentHourStatus?.classification === "NORMAL"
                    ? "Trafik Normal"
                    : "Trafik Sepi / Santai"}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1">
                {data.currentHourStatus && data.currentHourStatus.diffVsAvgPercent > 0
                  ? `${data.currentHourStatus.diffVsAvgPercent}% lebih ramai dibanding rata-rata volume per jam.`
                  : data.currentHourStatus && data.currentHourStatus.diffVsAvgPercent < 0
                  ? `${Math.abs(data.currentHourStatus.diffVsAvgPercent)}% di bawah rata-rata volume per jam.`
                  : "Volume trafik stabil berada pada rata-rata normal per jam."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs font-bold border-t md:border-t-0 md:border-l border-slate-700/80 pt-2.5 md:pt-0 md:pl-5 shrink-0">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tayangan Jam Ini</p>
              <p className="text-lg font-black text-orange-400 font-mono">
                {data.currentHourStatus?.views || 0} <span className="text-[10px] text-slate-400 font-normal">views</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pengunjung Unik</p>
              <p className="text-lg font-black text-blue-400 font-mono">
                {data.currentHourStatus?.visitors || 0} <span className="text-[10px] text-slate-400 font-normal">orang</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3B. Interactive 24-Hour Timeline Bar Strip */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock size={14} className="text-orange-500" />
              Timeline Tracker 24 Jam (Klik kotak jam untuk inspeksi detail)
            </span>
            <span className="text-[11px] text-slate-500">
              Jam Dipilih: <strong className="text-slate-800 dark:text-slate-200">{data.hourlyDistribution[selectedHour ?? data.insights.peakHour.hour]?.label} WIB</strong>
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 lg:grid-cols-24 gap-1 pt-1">
            {data.hourlyDistribution.map((h) => {
              const isCurrent = h.hour === data.currentHourStatus?.hour
              const isSelected = h.hour === (selectedHour ?? data.insights.peakHour.hour)
              const isPeak = h.hour === data.insights.peakHour.hour
              const fillPercent = maxHourlyViews > 0 ? Math.round((h.views / maxHourlyViews) * 100) : 0

              return (
                <button
                  key={h.hour}
                  type="button"
                  onClick={() => setSelectedHour(h.hour)}
                  className={`flex flex-col items-center justify-between p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? "bg-orange-50 dark:bg-orange-950/60 border-orange-500 ring-2 ring-orange-500/40 shadow-xs"
                      : isCurrent
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 ring-1 ring-blue-400/50"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                  title={`Jam ${h.label} WIB: ${h.views} views, ${h.visitors} pengunjung`}
                >
                  <span className="text-[9px] font-bold text-slate-400 font-mono">
                    {String(h.hour).padStart(2, "0")}
                  </span>
                  <div className="h-6 w-1.5 bg-slate-100 dark:bg-slate-800 rounded-full my-1 relative overflow-hidden flex items-end">
                    <div
                      className={`w-full rounded-full transition-all ${
                        isPeak
                          ? "bg-orange-500"
                          : h.classification === "HIGH"
                          ? "bg-orange-400"
                          : h.views > 0
                          ? "bg-blue-500"
                          : "bg-transparent"
                      }`}
                      style={{ height: `${Math.max(fillPercent, h.views > 0 ? 15 : 0)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold font-mono ${
                      isSelected ? "text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {h.views}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3C. Selected Hour Inspector Panel */}
        {(() => {
          const inspected = data.hourlyDistribution[selectedHour ?? data.insights.peakHour.hour]
          if (!inspected) return null
          const isPeak = inspected.hour === data.insights.peakHour.hour
          const isQuiet = inspected.hour === data.insights.quietHour.hour
          const isCurrent = inspected.hour === data.currentHourStatus?.hour

          return (
            <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Inspeksi Jam {inspected.label} WIB
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
                      Jam Sekarang
                    </span>
                  )}
                  {isPeak && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500 text-white">
                      Puncak Teramai
                    </span>
                  )}
                  {isQuiet && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-500 text-white">
                      Paling Sepi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tingkat Keramaian:{" "}
                  <strong className="text-slate-900 dark:text-slate-200">
                    {inspected.classification === "PEAK"
                      ? "Puncak Ramai (Peak Hour)"
                      : inspected.classification === "HIGH"
                      ? "Trafik Tinggi (Sibuk)"
                      : inspected.classification === "NORMAL"
                      ? "Trafik Sedang / Normal"
                      : "Trafik Sepi (Off-Peak)"}
                  </strong>
                  {" • "}
                  Volume: <strong className="text-orange-600 dark:text-orange-400 font-mono">{inspected.views} tayangan</strong>
                  {" • "}
                  Pengunjung Unik: <strong className="text-blue-600 dark:text-blue-400 font-mono">{inspected.visitors} orang</strong>
                </p>
              </div>

              {/* Top Pages in this Hour */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs shrink-0">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                  Halaman Sering Diakses:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {inspected.topPages && inspected.topPages.length > 0 ? (
                    inspected.topPages.map((tp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {tp.path} <span className="text-orange-500 font-bold">({tp.count})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Belum ada catatan akses spesifik</span>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* 3D. Visualization Mode Header & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {chartMode === "bars" ? (
                <>
                  <BarChart2 size={16} className="text-orange-500" />
                  Grafik Intensitas 24 Jam
                </>
              ) : (
                <>
                  <Grid3X3 size={16} className="text-orange-500" />
                  Matriks Heatmap Jam Ramai (7 Hari x 24 Jam)
                </>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {chartMode === "bars"
                ? "Visualisasi per jam 00:00 - 23:00 WIB untuk mengidentifikasi lonjakan trafik harian."
                : "Matriks intensitas mingguan untuk melihat jam-jam puncak pada setiap hari secara spesifik."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartMode("bars")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === "bars"
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <BarChart2 size={13} />
                Grafik Batang
              </button>
              <button
                type="button"
                onClick={() => setChartMode("heatmap")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === "heatmap"
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Grid3X3 size={13} />
                Matriks Heatmap (7x24)
              </button>
            </div>
          </div>
        </div>

        {/* 3E. Mode 1: Bar Chart */}
        {chartMode === "bars" && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.hourlyDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const payload = e.activePayload[0].payload as HourlyItem
                    setSelectedHour(payload.hour)
                  }
                }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  interval={1}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as HourlyItem
                      const isPeak = item.hour === data.insights.peakHour.hour
                      return (
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-white text-xs space-y-1">
                          <p className="font-bold flex items-center justify-between gap-4 border-b border-slate-800 pb-1">
                            <span>Jam {item.label} WIB</span>
                            {isPeak && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-orange-500 text-white">
                                PEAK HOUR
                              </span>
                            )}
                          </p>
                          <p className="text-orange-400 font-bold">
                            Tayangan: {item.views} pageviews
                          </p>
                          <p className="text-blue-400 font-bold">
                            Pengunjung Unik: {item.visitors} orang
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                  {data.hourlyDistribution.map((entry) => {
                    const isTopPeak = entry.hour === data.insights.peakHour.hour
                    const isSelected = entry.hour === selectedHour
                    const isHigh = entry.views >= maxHourlyViews * 0.5
                    return (
                      <Cell
                        key={entry.hour}
                        fill={
                          isSelected
                            ? "#EA580C"
                            : isTopPeak
                            ? "#F97316"
                            : isHigh
                            ? "#FB923C"
                            : entry.views > 0
                            ? "#3B82F6"
                            : "#E2E8F0"
                        }
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 3F. Mode 2: Heatmap 7x24 Matrix */}
        {chartMode === "heatmap" && data.heatmapDayHour && (
          <div className="space-y-3 pt-2">
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[720px] space-y-1.5">
                {/* Hour Index Header */}
                <div className="flex items-center text-[10px] font-bold text-slate-400 pl-16 pr-1 font-mono">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="flex-1 text-center">
                      {h % 2 === 0 ? String(h).padStart(2, "0") : ""}
                    </div>
                  ))}
                </div>

                {/* Day Rows */}
                {data.heatmapDayHour.map((day) => {
                  const isPeakDay = day.dayName === data.insights.peakDay.dayName
                  return (
                    <div key={day.dayName} className="flex items-center gap-1.5">
                      <span
                        className={`w-14 text-xs font-bold text-right pr-2 shrink-0 ${
                          isPeakDay ? "text-orange-600 dark:text-orange-400 font-black" : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <div className="flex items-center gap-1 flex-1">
                        {day.hours.map((cell) => {
                          const isSelected = selectedHour === cell.hour
                          const bgClass =
                            cell.intensity === 4
                              ? "bg-orange-500 text-white font-extrabold shadow-xs"
                              : cell.intensity === 3
                              ? "bg-orange-300 dark:bg-orange-600 text-slate-900 dark:text-white"
                              : cell.intensity === 2
                              ? "bg-blue-300 dark:bg-blue-800 text-slate-900 dark:text-white"
                              : cell.intensity === 1
                              ? "bg-blue-100 dark:bg-blue-950/70 text-slate-600 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-slate-800/40 text-transparent"

                          return (
                            <button
                              key={cell.hour}
                              type="button"
                              onClick={() => setSelectedHour(cell.hour)}
                              onMouseEnter={() => setHoveredCell({ dayName: day.dayName, hour: cell.hour, views: cell.views })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`h-7 flex-1 rounded-sm text-[9px] font-mono flex items-center justify-center transition-all ${bgClass} ${
                                isSelected ? "ring-2 ring-orange-500 scale-105 z-10" : "hover:scale-105"
                              }`}
                              title={`${day.dayName} jam ${cell.label}: ${cell.views} tayangan`}
                            >
                              {cell.views > 0 ? cell.views : ""}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Heatmap Legend & Hover Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                {hoveredCell ? (
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Hari {hoveredCell.dayName} pukul {String(hoveredCell.hour).padStart(2, "0")}:00 WIB:{" "}
                    <strong className="text-orange-500 font-mono">{hoveredCell.views} tayangan</strong>
                  </span>
                ) : (
                  <span>Arahkan kursor atau klik sel untuk melihat jumlah tayangan di hari dan jam tersebut.</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <span>Sepi</span>
                <span className="w-3.5 h-3.5 rounded-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700" />
                <span className="w-3.5 h-3.5 rounded-xs bg-blue-100 dark:bg-blue-950/70" />
                <span className="w-3.5 h-3.5 rounded-xs bg-blue-300 dark:bg-blue-800" />
                <span className="w-3.5 h-3.5 rounded-xs bg-orange-300 dark:bg-orange-600" />
                <span className="w-3.5 h-3.5 rounded-xs bg-orange-500" />
                <span>Puncak</span>
              </div>
            </div>
          </div>
        )}

        {/* 3G. 4 Periode Waktu & Rekomendasi Operasional */}
        {data.timeWindows && data.timeWindows.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-500" />
              4 Periode Waktu & Rekomendasi Jam Operasional
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.timeWindows.map((tw) => (
                <div
                  key={tw.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {tw.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {tw.timeRange}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                      {tw.views} <span className="text-[10px] font-normal text-slate-500">views</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        tw.id === "afternoon"
                          ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
                          : tw.id === "evening"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : tw.id === "morning"
                          ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {tw.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    {tw.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. DAY OF WEEK ACTIVITY (Aktivitas Berdasarkan Hari) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            Aktivitas Mingguan (Hari Apa Saja Trafik Ramai)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sebaran total aktivitas pengunjung dari Senin sampai Minggu.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.dayOfWeekDistribution.map((d) => {
            const isPeakDay = d.dayName === data.insights.peakDay.dayName
            const isQuietDay = d.dayName === data.insights.quietDay.dayName
            const fillPercent = Math.round((d.views / maxDayViews) * 100)

            return (
              <div
                key={d.dayName}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isPeakDay
                    ? "bg-orange-50 dark:bg-orange-950/30 border-orange-400 dark:border-orange-600 shadow-xs ring-1 ring-orange-400/50"
                    : isQuietDay
                    ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 opacity-70"
                    : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>{d.dayName}</span>
                  {isPeakDay && (
                    <span className="text-orange-500 font-black">Ramai</span>
                  )}
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {d.views} <span className="text-[10px] font-normal text-slate-500">views</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {d.visitors} pengunjung
                </p>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      isPeakDay ? "bg-orange-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. TRAFIK BARU ATAU BUKAN (New vs Returning Visitors) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat size={16} className="text-emerald-500" />
            Komposisi Trafik: Pengunjung Baru vs Pengunjung Kembali
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mengetahui apakah trafik didominasi oleh pengunjung yang baru pertama kali datang atau pengunjung setia yang datang berulang kali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* New Visitors Card */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                Pengunjung Baru (First-Time)
              </span>
              <span className="text-base font-black">{data.newVsReturning.newPercent}%</span>
            </div>
            <p className="text-2xl font-black text-blue-950 dark:text-blue-100">
              {data.newVsReturning.newVisitorsCount} <span className="text-xs font-normal text-slate-500">orang</span>
            </p>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between">
              <span>Rata-rata durasi:</span>
              <span className="font-bold">{formatDuration(data.newVsReturning.avgNewDurationSec)}</span>
            </div>
          </div>

          {/* Returning Visitors Card */}
          <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-orange-700 dark:text-orange-300">
              <span className="flex items-center gap-1.5">
                <Repeat size={14} />
                Pengunjung Kembali (Returning)
              </span>
              <span className="text-base font-black">{data.newVsReturning.returningPercent}%</span>
            </div>
            <p className="text-2xl font-black text-orange-950 dark:text-orange-100">
              {data.newVsReturning.returningVisitorsCount} <span className="text-xs font-normal text-slate-500">orang</span>
            </p>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-orange-200/60 dark:border-orange-800/40 flex items-center justify-between">
              <span>Rata-rata durasi:</span>
              <span className="font-bold">{formatDuration(data.newVsReturning.avgReturningDurationSec)}</span>
            </div>
          </div>

          {/* Retention Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tingkat Retensi Trafik
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {data.newVsReturning.retentionRate}%
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              {data.newVsReturning.returningVisitorsCount} dari {data.newVsReturning.totalVisitors} pengunjung terus kembali menggunakan fitur CV dan loker.
            </p>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${data.newVsReturning.newPercent}%` }}
                title={`Baru: ${data.newVsReturning.newPercent}%`}
              />
              <div
                className="bg-orange-500 h-full"
                style={{ width: `${data.newVsReturning.returningPercent}%` }}
                title={`Kembali: ${data.newVsReturning.returningPercent}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. SEBERAPA SERING TRAFIK BERKUNJUNG (Visit Frequency & Loyalty) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              Seberapa Sering Trafik Berkunjung (Frekuensi & Loyalitas)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribusi berapa kali setiap visitor mengunjungi platform AmbilCUTI.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 shrink-0">
            Rata-rata: {data.averageVisitsPerVisitor}x kunjungan per orang
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.frequencyDistribution.map((f) => (
            <div
              key={f.bucket}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {f.bucket}
                </span>
                <span className="text-xs font-mono font-black text-slate-500">
                  {f.percent}%
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {f.count} <span className="text-xs font-normal text-slate-400">visitor</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {f.description}
              </p>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${f.percent}%`, backgroundColor: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. TOP 10 PENGUNJUNG PALING SERING BERKUNJUNG (Most Frequent Visitors) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users size={16} className="text-orange-500" />
            10 Pengunjung Paling Sering Berkunjung (Top Frequent Visitors)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar pengguna & pengunjung dengan intensitas kedatangan tertinggi ke platform.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Peringkat</th>
                <th className="p-3.5">Pengunjung / Akun</th>
                <th className="p-3.5 text-center">Frekuensi Kunjungan</th>
                <th className="p-3.5 text-center">Total Tayangan</th>
                <th className="p-3.5 text-center">Total Durasi</th>
                <th className="p-3.5">Perangkat & Sumber</th>
                <th className="p-3.5">Terakhir Aktif</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data.topFrequentVisitors.map((v, idx) => {
                const tsMeta = getTrafficSourceInfo(v.trafficSource)
                return (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {v.linkedUser?.avatarUrl ? (
                            <img
                              src={v.linkedUser.avatarUrl}
                              alt={v.linkedUser.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : v.linkedUser?.name ? (
                            v.linkedUser.name.charAt(0).toUpperCase()
                          ) : (
                            <User size={13} />
                          )}
                        </div>
                        <div>
                          {v.linkedUser ? (
                            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                              {v.linkedUser.name}
                              <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                                User
                              </span>
                            </p>
                          ) : (
                            <p className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {v.visitorId}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400">
                            {v.city}, {v.country}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        {v.totalVisits}x berkunjung
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-600 dark:text-blue-400">
                      {v.totalPageviews} views
                    </td>
                    <td className="p-3.5 text-center font-mono text-[11px] text-slate-500">
                      {formatDuration(v.totalDurationSec)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-[11px]">
                          {getDeviceIcon(v.deviceType)}
                          <span>{v.deviceType} • {v.browser}</span>
                        </span>
                        <span className={`text-[10px] font-bold ${tsMeta.badgeText}`}>
                          {tsMeta.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-slate-500">
                      {formatRelativeTime(v.lastSeen)}
                    </td>
                    <td className="p-3.5 text-right">
                      {onSelectVisitor && (
                        <button
                          onClick={() => onSelectVisitor(v.visitorId)}
                          className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-xs"
                        >
                          Detail Log
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
