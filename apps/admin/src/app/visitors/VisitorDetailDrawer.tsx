"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
  Eye,
  CheckCircle2,
  LogIn,
  FileText,
  Briefcase,
  MousePointerClick,
  Share2,
  MapPin,
  Flame,
  Activity,
  History,
  Tag,
  Laptop
} from "lucide-react"

interface VisitorDetailDrawerProps {
  visitorId: string | null
  onClose: () => void
}

export function VisitorDetailDrawer({ visitorId, onClose }: VisitorDetailDrawerProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<"timeline" | "pages" | "sessions">("timeline")

  useEffect(() => {
    if (!visitorId) return

    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/visitors/${visitorId}`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (err) {
        console.error("Gagal mengambil detail visitor:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [visitorId])

  if (!visitorId) return null

  const formatDuration = (sec: number) => {
    if (!sec || sec < 60) return `${sec || 0} detik`
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
    if (diffSec < 60) return `${diffSec} detik lalu`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} menit lalu`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours} jam lalu`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} hari lalu`
  }

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType?.toLowerCase() === "mobile") return <Smartphone size={16} className="text-blue-500" />
    if (deviceType?.toLowerCase() === "tablet") return <Tablet size={16} className="text-amber-500" />
    return <Laptop size={16} className="text-indigo-500" />
  }

  const getActivityIcon = (type: string) => {
    if (type?.includes("LOGIN") || type?.includes("USER_LINKED")) return <LogIn size={15} className="text-emerald-500" />
    if (type?.includes("CV")) return <FileText size={15} className="text-orange-500" />
    if (type?.includes("JOB") || type?.includes("APPLY")) return <Briefcase size={15} className="text-blue-500" />
    if (type?.includes("CLICK")) return <MousePointerClick size={15} className="text-amber-500" />
    return <Eye size={15} className="text-slate-400" />
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-mono font-bold text-sm">
                <Globe size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                    {visitorId}
                  </h2>
                  {data?.isOnline ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      Live Online
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pertama kali berkunjung: {data ? new Date(data.firstSeen).toLocaleString("id-ID") : "..."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Memuat profil visitor...</p>
              </div>
            ) : data ? (
              <>
                {/* 1. Linked User Card (if registered/logged in) */}
                {data.linkedUser ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/70 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 text-white font-black text-lg flex items-center justify-center shadow-sm">
                        {data.linkedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {data.linkedUser.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            User Terhubung
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                          {data.linkedUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                            {data.linkedUser.membership?.packageName || data.linkedUser.role}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] text-slate-500">
                            Gabung: {new Date(data.linkedUser.joinedAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Pengunjung Anonim
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Belum terhubung dengan akun terdaftar / belum login
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Kunjungan</p>
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                      {data.totalVisits} Sesi
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Dilihat</p>
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                      {data.totalPageviews} Halaman
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Waktu</p>
                    <p className="text-lg font-black text-orange-600 dark:text-orange-400 mt-1">
                      {formatDuration(data.totalDurationSec)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Aktivitas Terakhir</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 truncate">
                      {formatRelativeTime(data.lastSeen)}
                    </p>
                  </div>
                </div>

                {/* 3. Technical Specs & Traffic Origin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Perangkat & Browser */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {getDeviceIcon(data.deviceType)}
                      Perangkat & Sistem
                    </h4>
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400">Tipe Perangkat:</span>
                        <span className="font-semibold">{data.deviceType}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400">Browser:</span>
                        <span className="font-semibold">{data.browser} {data.browserVersion}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400">Sistem Operasi:</span>
                        <span className="font-semibold">{data.os}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Resolusi Layar:</span>
                        <span className="font-semibold font-mono">{data.screenResolution || "1920x1080"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sumber Lalu Lintas & Lokasi */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Compass size={16} className="text-orange-500" />
                      Sumber Lalu Lintas & Lokasi
                    </h4>
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400">Kanal Traffic:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">{data.trafficSource}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400">Alamat IP:</span>
                        <span className="font-mono font-semibold">{data.ipAddress}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400">Lokasi:</span>
                        <span className="font-semibold">{data.city}, {data.country}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Halaman Aktif:</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate max-w-[150px]">{data.currentPage}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UTM parameters if any */}
                {(data.utmSource || data.utmCampaign) && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Tag size={15} className="text-amber-500 flex-shrink-0" />
                    <span>
                      Kampanye UTM: <strong>{data.utmSource}</strong> / {data.utmMedium || "-"} ({data.utmCampaign || "-"})
                    </span>
                  </div>
                )}

                {/* 4. Interactive Tabs: Activity Timeline | Page History | Sessions */}
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                    <button
                      onClick={() => setActiveSubTab("timeline")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === "timeline"
                          ? "bg-orange-500 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Activity size={14} />
                      Activity Timeline ({data.activityTimeline?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveSubTab("pages")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === "pages"
                          ? "bg-orange-500 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Layers size={14} />
                      Riwayat Halaman ({data.pageViews?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveSubTab("sessions")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === "sessions"
                          ? "bg-orange-500 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <History size={14} />
                      Riwayat Sesi ({data.sessions?.length || 0})
                    </button>
                  </div>

                  {/* SubTab 1: Chronological Activity Timeline */}
                  {activeSubTab === "timeline" && (
                    <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {data.activityTimeline?.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">Belum ada aktivitas terekam.</p>
                      ) : (
                        data.activityTimeline.map((item: any, idx: number) => (
                          <div key={item.id || idx} className="relative flex items-start gap-3 pl-8">
                            <div className="absolute left-2.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-orange-500 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            </div>
                            <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {getActivityIcon(item.type)}
                                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono mt-1">
                                Path: {item.path}
                              </p>
                              {item.metadata && Object.keys(item.metadata).length > 0 && (
                                <div className="mt-1.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-500 overflow-x-auto">
                                  {JSON.stringify(item.metadata)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* SubTab 2: Page Views Table */}
                  {activeSubTab === "pages" && (
                    <div className="space-y-2">
                      {data.pageViews?.map((pv: any, idx: number) => (
                        <div
                          key={pv.id || idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {pv.title || pv.path}
                            </p>
                            <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate">
                              {pv.path}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {new Date(pv.createdAt).toLocaleTimeString("id-ID")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SubTab 3: Sessions List */}
                  {activeSubTab === "sessions" && (
                    <div className="space-y-2.5">
                      {data.sessions?.map((sess: any, idx: number) => (
                        <div
                          key={sess.id || idx}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {sess.sessionId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                              {sess.pageviewsCount} Halaman
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>Mulai: {new Date(sess.startedAt).toLocaleString("id-ID")}</span>
                            <span>Durasi: {formatDuration(sess.durationSec)}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Masuk: <span className="font-mono text-slate-700 dark:text-slate-300">{sess.entryPage}</span> → Keluar: <span className="font-mono text-slate-700 dark:text-slate-300">{sess.exitPage || "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">Data tidak ditemukan.</p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition"
            >
              Tutup Panel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
