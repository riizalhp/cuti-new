"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  User,
  Sparkles,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Layers,
  Zap,
  Copy,
  Check,
  Shield,
  Coins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { AiRoutingFlowVisualizer } from "./AiRoutingFlowVisualizer"

// Types
export interface LiveAiLogItem {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  userTier: string
  packageName: string | null
  feature: string
  provider: string
  model: string
  tokensInput: number
  tokensOutput: number
  tokensTotal: number
  cost: number
  status: "SUCCESS" | "FAILED"
}

export interface LiveAiSummary {
  totalCostToday: number
  totalCostThisMonth: number
  totalTokensToday: number
  totalTokensInputToday: number
  totalTokensOutputToday: number
  cachedTokens?: number
  totalCallsToday: number
  callsLastHour: number
  avgCostPerRequest: number
}

export interface TopSpenderItem {
  userId: string
  name: string
  email: string
  tier: string
  callsCount: number
  totalCost: number
  totalTokens: number
}

export interface LiveAiProviderItem {
  id: string
  name: string
  label: string
  model: string
  priority: number
  isActive: boolean
  cooldownUntil: string | null
  alias?: string | null
  baseUrl?: string
}

export interface LiveAiFeatureMappingItem {
  key: string
  name: string
  providerId: string | null
  isActive: boolean
}

function formatRupiah(n: number): string {
  if (!n || isNaN(n)) return "Rp 0"
  if (n < 1 && n > 0) return "Rp " + n.toFixed(2)
  return "Rp " + Math.round(n).toLocaleString("id-ID")
}

function formatNumber(n: number): string {
  if (!n || isNaN(n)) return "0"
  return Number(n).toLocaleString("id-ID")
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  } catch {
    return isoString
  }
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return isoString
  }
}

export function AiLiveTrackerView() {
  const [summary, setSummary] = useState<LiveAiSummary | null>(null)
  const [topSpenders, setTopSpenders] = useState<TopSpenderItem[]>([])
  const [providers, setProviders] = useState<LiveAiProviderItem[]>([])
  const [featureMappings, setFeatureMappings] = useState<LiveAiFeatureMappingItem[]>([])
  const [logs, setLogs] = useState<LiveAiLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedLog, setSelectedLog] = useState<LiveAiLogItem | null>(null)

  // Filters & Controls
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(3)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL")
  const [selectedFeature, setSelectedFeature] = useState<string>("ALL")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showOrbitGraph, setShowOrbitGraph] = useState<boolean>(true)

  // Pagination Controls
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Reset to page 1 on filter or search query change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedProvider, selectedFeature])

  const totalLogs = logs.length
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return logs.slice(start, start + pageSize)
  }, [logs, safeCurrentPage, pageSize])

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages)
      }
    }
    return pages
  }, [totalPages, safeCurrentPage])

  // Ref to track last seen log ID to animate new rows
  const previousFirstLogIdRef = useRef<string | null>(null)
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set())

  // Fetch telemetry
  const fetchLiveTelemetry = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true)
      try {
        const params = new URLSearchParams()
        params.set("limit", "50")
        if (selectedProvider !== "ALL") params.set("provider", selectedProvider)
        if (selectedFeature !== "ALL") params.set("feature", selectedFeature)
        if (searchQuery.trim()) params.set("q", searchQuery.trim())

        const res = await fetch(`/api/ai-usage/live?${params.toString()}`)
        const json = await res.json()

        if (json.success && json.data) {
          setSummary(json.data.summary)
          setTopSpenders(json.data.topSpenders || [])
          setProviders(json.data.providers || [])
          setFeatureMappings(json.data.featureMappings || [])

          const fetchedLogs: LiveAiLogItem[] = json.data.recentLogs || []

          // Detect new items
          if (fetchedLogs.length > 0 && previousFirstLogIdRef.current) {
            const freshIds = new Set<string>()
            for (const l of fetchedLogs) {
              if (l.id === previousFirstLogIdRef.current) break
              freshIds.add(l.id)
            }
            if (freshIds.size > 0) {
              setNewLogIds(freshIds)
              setTimeout(() => setNewLogIds(new Set()), 3000)
            }
          }

          if (fetchedLogs.length > 0) {
            previousFirstLogIdRef.current = fetchedLogs[0].id
          }

          setLogs(fetchedLogs)
        }
      } catch (err) {
        console.error("[AiLiveTracker] Gagal fetch telemetry:", err)
      } finally {
        setLoading(false)
        if (isManual) setIsRefreshing(false)
      }
    },
    [selectedProvider, selectedFeature, searchQuery]
  )

  // Initial load
  useEffect(() => {
    fetchLiveTelemetry()
  }, [fetchLiveTelemetry])

  // Polling loop
  useEffect(() => {
    if (refreshIntervalSec <= 0) return
    const interval = setInterval(() => {
      fetchLiveTelemetry()
    }, refreshIntervalSec * 1000)
    return () => clearInterval(interval)
  }, [refreshIntervalSec, fetchLiveTelemetry])

  // Distinct features and providers for dropdown options
  const availableProviders = useMemo(() => {
    const set = new Set<string>()
    logs.forEach((l) => {
      if (l.provider) set.add(l.provider)
    })
    return Array.from(set)
  }, [logs])

  const availableFeatures = useMemo(() => {
    const set = new Set<string>()
    logs.forEach((l) => {
      if (l.feature) set.add(l.feature)
    })
    return Array.from(set)
  }, [logs])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTROLS & STATUS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
              Live Stream Aktif
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {summary ? `${summary.totalCallsToday} request tercatat hari ini` : "Menghubungkan telemetry..."}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setShowOrbitGraph(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                !showOrbitGraph
                  ? "bg-white dark:bg-slate-900 text-[#1738D1] dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Activity size={12} />
              Log Stream
            </button>
            <button
              onClick={() => setShowOrbitGraph(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                showOrbitGraph
                  ? "bg-white dark:bg-slate-900 text-orange-500 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Layers size={12} />
              Visual Orbit
            </button>
          </div>

          {/* Polling Interval Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 px-2 font-medium">Interval:</span>
            {[
              { label: "3 dtk", val: 3 },
              { label: "5 dtk", val: 5 },
              { label: "10 dtk", val: 10 },
              { label: "Jeda", val: 0 },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setRefreshIntervalSec(opt.val)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  refreshIntervalSec === opt.val
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchLiveTelemetry(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Muat ulang sekarang"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-orange-500" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC AI ROUTING VISUALIZER & 5 TOP KPI CARDS */}
      <AiRoutingFlowVisualizer
        latestLog={logs[0] || null}
        recentLogs={logs}
        summary={summary}
        providers={providers}
        featureMappings={featureMappings}
        onSelectLog={(log) => setSelectedLog(log)}
        isLive={refreshIntervalSec > 0}
        showNetworkGraph={showOrbitGraph}
        onToggleGraph={() => setShowOrbitGraph((prev) => !prev)}
      />

      {/* 3. BENTO GRID: LIVE STREAM TABLE (LEFT) + TOP SPENDERS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN FEED TABLE (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Table Header & Search Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Activity size={18} className="text-[#1738D1]" />
                  Live Activity Stream
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {totalLogs > 0
                    ? `${totalLogs} transaksi AI terakhir • Halaman ${safeCurrentPage} dari ${totalPages}`
                    : "0 transaksi tercatat"}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari user, email, fitur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1738D1]/20 focus:border-[#1738D1]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Filter size={12} /> Filter:
              </span>

              {/* Provider Filter */}
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">Semua Provider</option>
                {availableProviders.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Feature Filter */}
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none max-w-[200px]"
              >
                <option value="ALL">Semua Fitur</option>
                {availableFeatures.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {(selectedProvider !== "ALL" || selectedFeature !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedProvider("ALL")
                    setSelectedFeature("ALL")
                    setSearchQuery("")
                  }}
                  className="text-xs text-orange-500 hover:text-orange-600 font-bold ml-1 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Akun / User</th>
                  <th className="p-3.5">Fitur / Aksi</th>
                  <th className="p-3.5">Provider & Model</th>
                  <th className="p-3.5 text-right">Tokens</th>
                  <th className="p-3.5 text-right">Biaya (Rp)</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#1738D1]" />
                      Memuat live telemetry...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                          <Activity size={20} />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada request AI</p>
                        <p className="text-xs text-slate-400">
                          Log penggunaan akan muncul secara instan saat user memanggil fitur AI di aplikasi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => {
                    const isNew = newLogIds.has(log.id)
                    const isMember = log.userTier?.toUpperCase() === "MEMBER"
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`transition-colors cursor-pointer group ${
                          isNew
                            ? "bg-emerald-50/80 dark:bg-emerald-950/40 animate-pulse"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Waktu */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {formatTime(log.timestamp)}
                          </span>
                        </td>

                        {/* Akun User */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2 max-w-[220px]">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-200 dark:border-slate-700">
                              {log.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                                  {log.userName}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded-[6px] text-[9px] font-extrabold uppercase shrink-0 ${
                                    isMember
                                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  {isMember ? "Member" : "Free"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">{log.userEmail}</p>
                            </div>
                          </div>
                        </td>

                        {/* Fitur / Aksi */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                              {log.feature}
                            </span>
                          </div>
                        </td>

                        {/* Provider & Model */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 rounded-[8px] bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                              {log.model}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium capitalize">{log.provider}</p>
                          </div>
                        </td>

                        {/* Token */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="font-bold text-slate-700 dark:text-slate-300">
                            {formatNumber(log.tokensTotal)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatNumber(log.tokensInput)} in • {formatNumber(log.tokensOutput)} out
                          </div>
                        </td>

                        {/* Biaya */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">
                            {formatRupiah(log.cost)}
                          </span>
                        </td>

                        {/* Aksi Detail */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="text-slate-400 group-hover:text-[#1738D1] text-[11px] font-bold flex items-center justify-center gap-0.5">
                            Detail <ArrowUpRight size={12} />
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalLogs > 0 && (
            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Left: Info & Rows per page */}
              <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
                <span className="font-medium">
                  Menampilkan{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {(safeCurrentPage - 1) * pageSize + 1}
                  </strong>{" "}
                  –{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {Math.min(safeCurrentPage * pageSize, totalLogs)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-800 dark:text-slate-200">{totalLogs}</strong> transaksi
                </span>

                <div className="flex items-center gap-1.5 pl-2 sm:border-l border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-medium">Per hal:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1738D1]/20 cursor-pointer"
                    aria-label="Jumlah baris per halaman"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Right: Page Buttons */}
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-[#1738D1] cursor-pointer"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs select-none">
                          …
                        </span>
                      )
                    }
                    const isActive = p === safeCurrentPage
                    return (
                      <button
                        key={`page-${p}`}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                          isActive
                            ? "bg-[#1738D1] text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`Halaman ${p}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-[#1738D1] cursor-pointer"
                  aria-label="Halaman berikutnya"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TOP SPENDERS SIDEBAR (4 or 3 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                  <Coins size={16} className="text-rose-500" />
                  Top Akun Terboros
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Pengeluaran AI tertinggi hari ini</p>
              </div>
            </div>

            {topSpenders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data pemakaian hari ini.</p>
            ) : (
              <div className="space-y-3">
                {topSpenders.map((user, idx) => {
                  const isMember = user.tier?.toUpperCase() === "MEMBER"
                  return (
                    <div
                      key={user.userId}
                      onClick={() => setSearchQuery(user.email || user.name)}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer group"
                      title="Klik untuk filter log user ini"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                            {user.name}
                          </span>
                        </div>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs shrink-0">
                          {formatRupiah(user.totalCost)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pl-7">
                        <span className="truncate max-w-[130px]">{user.email}</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                          {user.callsCount} calls
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#1738D1] dark:text-blue-400 font-bold">
              <Zap size={15} />
              Tips Operasional
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Klik pada baris log mana pun untuk membuka drawer rincian token & payload. Gunakan filter dropdown untuk
              melihat model tertentu (misal: memantau adopsi DeepSeek vs OpenAI).
            </p>
          </div>
        </div>
      </div>

      {/* 4. RIGHT-HAND SLIDE-IN DETAIL DRAWER */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 text-orange-600 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Rincian Transaksi AI</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Log ID: {selectedLog.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Cost & Status Highlight Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Biaya Request</span>
                    <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                      {formatRupiah(selectedLog.cost)}
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {selectedLog.status}
                  </div>
                </div>

                {/* User Info Section */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} />
                    Informasi Akun
                  </h4>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Nama Pengguna</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedLog.userName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Email</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedLog.userEmail}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Tier Keanggotaan</span>
                      <span className="px-2 py-0.5 rounded-[8px] text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {selectedLog.userTier} {selectedLog.packageName ? `(${selectedLog.packageName})` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">User ID</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-slate-500">
                          {selectedLog.userId.slice(0, 12)}...
                        </span>
                        <button
                          onClick={() => handleCopy(selectedLog.userId, "user_id")}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {copiedId === "user_id" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Model & Feature Section */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu size={13} />
                    Model & Konfigurasi
                  </h4>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Fitur / Task</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedLog.feature}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Provider</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {selectedLog.provider}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Model Name</span>
                      <span className="font-mono font-bold text-[#1738D1] dark:text-blue-400">
                        {selectedLog.model}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Waktu Eksekusi</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {formatDate(selectedLog.timestamp)} • {formatTime(selectedLog.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Token Usage Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} />
                    Konsumsi Token
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Input Token</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                        {formatNumber(selectedLog.tokensInput)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Output Token</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                        {formatNumber(selectedLog.tokensOutput)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-amber-200 dark:border-amber-900/60">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">Total</span>
                      <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                        {formatNumber(selectedLog.tokensTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => {
                    setSearchQuery(selectedLog.userEmail || selectedLog.userName)
                    setSelectedLog(null)
                  }}
                  className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Filter Riwayat User Ini
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
