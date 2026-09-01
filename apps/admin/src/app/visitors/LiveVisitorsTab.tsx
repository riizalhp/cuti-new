"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Globe,
  Radio,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Compass,
  User,
  CheckCircle2,
  Eye,
  Activity,
  Zap
} from "lucide-react"

interface LiveVisitor {
  id: string
  visitorId: string
  currentPage: string
  currentTitle: string
  deviceType: string
  browser: string
  os: string
  trafficSource: string
  city: string
  country: string
  lastSeen: string
  activeSecondsAgo: number
  linkedUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    role: string
  } | null
}

interface LiveVisitorsTabProps {
  onSelectVisitor: (visitorId: string) => void
}

export function LiveVisitorsTab({ onSelectVisitor }: LiveVisitorsTabProps) {
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchLive = async () => {
    try {
      const res = await fetch("/api/visitors/live")
      const json = await res.json()
      if (json.success && json.data) {
        setLiveVisitors(json.data.visitors || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Gagal mengambil data live visitor:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLive()
    const interval = setInterval(fetchLive, 8000) // 8-second live polling
    return () => clearInterval(interval)
  }, [])

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType?.toLowerCase() === "mobile") return <Smartphone size={16} className="text-blue-500" />
    if (deviceType?.toLowerCase() === "tablet") return <Tablet size={16} className="text-amber-500" />
    return <Laptop size={16} className="text-indigo-500" />
  }

  return (
    <div className="space-y-4">
      {/* Live Stream Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <Radio size={20} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Realtime Live Stream Pengunjung
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                {liveVisitors.length} Online Sekarang
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Otomatis terbarukan setiap 8 detik • Terakhir diperbarui: {lastUpdated.toLocaleTimeString("id-ID")}
            </p>
          </div>
        </div>
        <button
          onClick={fetchLive}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-emerald-500" : ""} />
          Refresh Live
        </button>
      </div>

      {/* Visitors Grid */}
      {loading && liveVisitors.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Mendeteksi pengunjung aktif realtime...</p>
        </div>
      ) : liveVisitors.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Globe size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Sedang Tidak Ada Pengunjung Aktif
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Saat ini tidak ada pengunjung yang sedang membuka website. Data akan otomatis muncul begitu ada visitor yang masuk.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {liveVisitors.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={() => onSelectVisitor(v.visitorId)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {v.visitorId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {v.activeSecondsAgo < 10 ? "Baru saja" : `${v.activeSecondsAgo}s lalu`}
                  </span>
                </div>

                {/* Linked user or Anonymous */}
                {v.linkedUser ? (
                  <div className="mb-3 p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/40 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {v.linkedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {v.linkedUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {v.linkedUser.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                    <User size={14} className="text-slate-400" />
                    <span className="text-[11px]">Pengunjung Anonim</span>
                  </div>
                )}

                {/* Current Page Highlight */}
                <div className="space-y-1 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Halaman Yang Sedang Dibuka:
                  </span>
                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate">
                      {v.currentTitle || v.currentPage}
                    </p>
                    <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate mt-0.5">
                      {v.currentPage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Specs & Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(v.deviceType)}
                  <span className="text-[11px] font-medium">{v.browser} • {v.os}</span>
                </div>
                <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Detail <ExternalLink size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
