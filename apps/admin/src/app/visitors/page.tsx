"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Globe,
  Radio,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  User,
  Clock,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  SlidersHorizontal,
} from "lucide-react"
import { VisitorDetailDrawer } from "./VisitorDetailDrawer"
import { LiveVisitorsTab } from "./LiveVisitorsTab"
import { AnalyticsTab } from "./AnalyticsTab"
import { getDomainInfo, getTrafficSourceInfo } from "@/lib/visitor-helpers"

interface VisitorItem {
  id: string
  visitorId: string
  isOnline: boolean
  currentPage: string
  currentTitle: string
  domain?: string
  hostname?: string
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
  utmSource?: string
  utmCampaign?: string
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

export default function VisitorManagementPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "live" | "analytics">("live")
  const [visitors, setVisitors] = useState<VisitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null)

  // Filters & Pagination
  const [search, setSearch] = useState("")
  const [domainFilter, setDomainFilter] = useState("all") // all, employr.id, app.employr.id, loker.employr.id
  const [statusFilter, setStatusFilter] = useState("all") // all, online, offline
  const [userFilter, setUserFilter] = useState("all") // all, linked, anonymous
  const [deviceFilter, setDeviceFilter] = useState("all") // all, desktop, mobile, tablet
  const [sourceFilter, setSourceFilter] = useState("all") // all, direct, google, social, referral, campaign
  const [dateRangeFilter, setDateRangeFilter] = useState("all") // all, today, 7d, 30d
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchVisitors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "15")
      if (search.trim()) params.set("search", search.trim())
      if (domainFilter !== "all") params.set("domain", domainFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (userFilter !== "all") params.set("user", userFilter)
      if (deviceFilter !== "all") params.set("device", deviceFilter)
      if (sourceFilter !== "all") params.set("source", sourceFilter)
      if (dateRangeFilter !== "all") params.set("dateRange", dateRangeFilter)

      const res = await fetch(`/api/visitors?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setVisitors(json.data)
        setTotalPages(json.pagination.totalPages)
        setTotalCount(json.pagination.total)
      }
    } catch (err) {
      console.error("Gagal mengambil data pengunjung:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "directory") {
      fetchVisitors()
    }
  }, [activeTab, page, domainFilter, statusFilter, userFilter, deviceFilter, sourceFilter, dateRangeFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchVisitors()
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
    if (deviceType?.toLowerCase() === "mobile") return <Smartphone size={15} className="text-blue-500" />
    if (deviceType?.toLowerCase() === "tablet") return <Tablet size={15} className="text-amber-500" />
    return <Laptop size={15} className="text-indigo-500" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Globe size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Visitor Management
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau pengunjung aktif realtime, riwayat sesi, navigasi halaman, dan linking akun pengguna.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "live"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Live Realtime
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "directory"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Layers size={14} />
            Daftar Visitor
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <BarChart3 size={14} />
            Analitik & Traffic
          </button>
        </div>
      </div>

      {/* TAB 1: Live Realtime */}
      {activeTab === "live" && (
        <LiveVisitorsTab onSelectVisitor={(id) => setSelectedVisitorId(id)} />
      )}

      {/* TAB 2: All Visitors Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Visitor ID, nama user, email, IP, atau halaman..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Cari
              </button>
              <button
                type="button"
                onClick={fetchVisitors}
                disabled={loading}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-orange-500" : ""} />
                Refresh
              </button>
            </form>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1">
                <SlidersHorizontal size={13} />
                Filter:
              </div>

              {/* Domain / Subdomain Filter */}
              <select
                value={domainFilter}
                onChange={(e) => {
                  setDomainFilter(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-xs text-orange-900 dark:text-orange-200 font-bold focus:outline-none"
              >
                <option value="all">🌐 Semua Domain</option>
                <option value="employr.id">🏠 employr.id (Landing)</option>
                <option value="app.employr.id">💼 app.employr.id (Dashboard)</option>
                <option value="loker.employr.id">🎯 loker.employr.id (Portal)</option>
                <option value="learning.employr.id">📚 learning.employr.id</option>
                <option value="faq.employr.id">❓ faq.employr.id</option>
                <option value="localhost">💻 Localhost (Dev)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="online">🟢 Sedang Online</option>
                <option value="offline">⚪ Offline</option>
              </select>

              {/* User Link Filter */}
              <select
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Semua Pengunjung</option>
                <option value="linked">👤 User Terhubung (Login)</option>
                <option value="anonymous">🕶️ Pengunjung Anonim</option>
              </select>

              {/* Device Filter */}
              <select
                value={deviceFilter}
                onChange={(e) => {
                  setDeviceFilter(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Semua Perangkat</option>
                <option value="Desktop">💻 Desktop</option>
                <option value="Mobile">📱 Mobile</option>
                <option value="Tablet">📟 Tablet</option>
              </select>

              {/* Traffic Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Semua Sumber</option>
                <option value="direct">Direct</option>
                <option value="google">Google</option>
                <option value="social">Social Media</option>
                <option value="referral">Referral</option>
                <option value="campaign">Campaign (UTM)</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="7d">7 Hari Terakhir</option>
                <option value="30d">30 Hari Terakhir</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Visitor ID / Status</th>
                    <th className="p-4">Akun Terhubung</th>
                    <th className="p-4">Halaman Terakhir</th>
                    <th className="p-4">Domain</th>
                    <th className="p-4">Perangkat / OS</th>
                    <th className="p-4">Sumber Traffic</th>
                    <th className="p-4 text-center">Sesi / Views</th>
                    <th className="p-4">Waktu</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Memuat data pengunjung...
                      </td>
                    </tr>
                  ) : visitors.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400">
                        Tidak ada data visitor yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    visitors.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Visitor ID & Online badge */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                v.isOnline ? "bg-emerald-500 animate-ping" : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <div>
                              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                                {v.visitorId}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                IP: {v.ipAddress}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Linked User */}
                        <td className="p-4">
                          {v.linkedUser ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center">
                                {v.linkedUser.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[130px]">
                                  {v.linkedUser.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[130px]">
                                  {v.linkedUser.email}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              Anonim
                            </span>
                          )}
                        </td>

                        {/* Current / Last Page */}
                        <td className="p-4 max-w-[180px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {v.currentTitle || v.currentPage}
                          </span>
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 block truncate">
                            {v.currentPage}
                          </span>
                        </td>

                        {/* Domain Badge */}
                        <td className="p-4">
                          {(() => {
                            const domainMeta = getDomainInfo(v.domain || v.hostname)
                            return (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${domainMeta.badgeBg} ${domainMeta.badgeText} ${domainMeta.badgeBorder} max-w-[130px]`}
                              >
                                {domainMeta.icon}
                                <span className="truncate">{domainMeta.label}</span>
                              </span>
                            )
                          })()}
                        </td>

                        {/* Device / OS */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {getDeviceIcon(v.deviceType)}
                            <div>
                              <span className="font-semibold block">{v.browser}</span>
                              <span className="text-[10px] text-slate-400 block">{v.os}</span>
                            </div>
                          </div>
                        </td>

                        {/* Traffic Source */}
                        <td className="p-4">
                          {(() => {
                            const tsMeta = getTrafficSourceInfo(v.trafficSource)
                            return (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tsMeta.badgeBg} ${tsMeta.badgeText} ${tsMeta.badgeBorder} max-w-[140px]`}
                                title={v.trafficSource}
                              >
                                {tsMeta.icon}
                                <span className="truncate">{tsMeta.label}</span>
                              </span>
                            )
                          })()}
                        </td>

                        {/* Sessions & Views */}
                        <td className="p-4 text-center">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {v.totalPageviews} views
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {v.totalVisits} sesi
                          </span>
                        </td>

                        {/* Last Seen */}
                        <td className="p-4">
                          <span className="text-slate-700 dark:text-slate-300 block font-medium">
                            {formatRelativeTime(v.lastSeen)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(v.lastSeen).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedVisitorId(v.visitorId)}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 font-bold text-xs border border-orange-200 dark:border-orange-800/60 transition flex items-center gap-1 ml-auto"
                          >
                            Detail
                            <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan {visitors.length} dari total <strong>{totalCount}</strong> visitor
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold">
                  Halaman {page} dari {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Analytics & Traffic */}
      {activeTab === "analytics" && <AnalyticsTab />}

      {/* Detail Slide-in Drawer */}
      <VisitorDetailDrawer
        visitorId={selectedVisitorId}
        onClose={() => setSelectedVisitorId(null)}
      />
    </motion.div>
  )
}
