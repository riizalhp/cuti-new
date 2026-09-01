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
  AreaChart,
  Area,
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
} from "lucide-react"

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
  trend7Days: Array<{ day: string; views: number }>
}

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/visitors/stats")
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch (err) {
      console.error("Gagal memuat analitik visitor:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatDuration = (sec: number) => {
    if (!sec || sec < 60) return `${sec || 0}s`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s > 0 ? `${s}s` : ""}`
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Mengkalkulasi metrik & analitik traffic...</p>
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

  return (
    <div className="space-y-6">
      {/* 1. Top Summary Cards */}
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
            Dari {data.summary.todayVisitorsCount} visitor unik hari ini
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
            <span className="text-xs font-bold text-slate-400 font-normal">pengunjung online</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Heartbeat dalam 2 menit terakhir
          </p>
        </div>
      </div>

      {/* 2. 7-Day Pageview Trends Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              Tren Tayangan Halaman (7 Hari Terakhir)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Grafik jumlah tayangan halaman per hari
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pageviewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
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
                contentStyle={{
                  backgroundColor: "#0B132B",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Tayangan"
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#pageviewGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Top Pages & Traffic Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Pages */}
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
                return (
                  <div key={ts.source || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {ts.source}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {ts.count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
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
    </div>
  )
}
