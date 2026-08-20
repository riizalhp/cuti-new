"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  Activity,
  FileText,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Lock,
  User,
  Globe,
  Zap,
  Bug,
  Server,
} from "lucide-react"

type LogType = "all" | "audit" | "security" | "app"
type LogLevel = "DEBUG" | "INFO" | "WARNING" | "CRITICAL"

interface LogSummary {
  totalAudit: number
  totalSecurity: number
  totalApp: number
  unresolvedCritical: number
}

export default function LogsPage() {
  const [logType, setLogType] = useState<LogType>("all")
  const [level, setLevel] = useState<string>("")
  const [source, setSource] = useState<string>("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<any>({})
  const [summary, setSummary] = useState<LogSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("type", logType)
      params.set("page", String(page))
      params.set("limit", "30")
      if (level) params.set("level", level)
      if (source) params.set("source", source)
      if (search) params.set("search", search)

      const res = await fetch(`/api/logs?${params}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setSummary(json.summary)
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [logType, level, source, page])

  const handleSearch = () => {
    setPage(1)
    fetchLogs()
  }

  const severityColor = (s: string) => {
    switch (s) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
      case "WARNING":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
      case "ERROR":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
      case "INFO":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
      case "DEBUG":
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
      default:
        return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  const eventTypeIcon = (type: string) => {
    if (type?.includes("LOGIN")) return <Lock size={14} className="text-blue-500" />
    if (type?.includes("UNAUTHORIZED")) return <XCircle size={14} className="text-rose-500" />
    if (type?.includes("BRUTE")) return <AlertTriangle size={14} className="text-rose-500" />
    if (type?.includes("ROLE")) return <User size={14} className="text-purple-500" />
    return <Shield size={14} className="text-slate-500" />
  }

  const sourceIcon = (src: string) => {
    switch (src) {
      case "AUTH": return <Lock size={14} className="text-blue-500" />
      case "PAYMENT": return <Zap size={14} className="text-emerald-500" />
      case "ADMIN": return <Shield size={14} className="text-orange-500" />
      case "SYSTEM": return <Server size={14} className="text-slate-500" />
      case "AI_GATEWAY": return <Bug size={14} className="text-purple-500" />
      default: return <Activity size={14} className="text-slate-500" />
    }
  }

  // Combine all log types into a unified timeline for "all" view
  const allLogs = (() => {
    if (logType === "audit") return data.audit?.data || []
    if (logType === "security") return data.security?.data || []
    if (logType === "app") return data.app?.data || []
    // Merge and sort by date
    const merged = [
      ...(data.audit?.data || []).map((l: any) => ({ ...l, _type: "audit" })),
      ...(data.security?.data || []).map((l: any) => ({ ...l, _type: "security" })),
      ...(data.app?.data || []).map((l: any) => ({ ...l, _type: "app" })),
    ]
    return merged.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })()

  const currentTotal =
    logType === "audit" ? data.audit?.total || 0 :
    logType === "security" ? data.security?.total || 0 :
    logType === "app" ? data.app?.total || 0 :
    (data.audit?.total || 0) + (data.security?.total || 0) + (data.app?.total || 0)

  const currentTotalPages =
    logType === "all" ? Math.max(data.audit?.totalPages || 1, data.security?.totalPages || 1, data.app?.totalPages || 1) :
    logType === "audit" ? data.audit?.totalPages || 1 :
    logType === "security" ? data.security?.totalPages || 1 :
    data.app?.totalPages || 1

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Activity size={24} className="text-orange-500" />
            System Logs & Security Monitor
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Audit trail, security events, dan application logs dari database
          </p>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-500">Audit Logs</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{summary.totalAudit.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-500">Security Events</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{summary.totalSecurity.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-500">App Logs</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{summary.totalApp.toLocaleString()}</p>
          </div>
          <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm ${summary.unresolvedCritical > 0 ? "border-rose-300 dark:border-rose-800" : "border-slate-200 dark:border-slate-800"}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className={summary.unresolvedCritical > 0 ? "text-rose-500" : "text-emerald-500"} />
              <span className="text-xs font-bold text-slate-500">Critical Unresolved</span>
            </div>
            <p className={`text-xl font-extrabold ${summary.unresolvedCritical > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-50"}`}>
              {summary.unresolvedCritical}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Log Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(["all", "audit", "security", "app"] as LogType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setLogType(t); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  logType === t ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "all" ? "Semua" : t === "audit" ? "Audit" : t === "security" ? "Security" : "App"}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1) }} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
            <option value="">Semua Level</option>
            <option value="DEBUG">Debug</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Source Filter (for app logs) */}
          {(logType === "app" || logType === "all") && (
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1) }} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
              <option value="">Semua Source</option>
              <option value="AUTH">Auth</option>
              <option value="ADMIN">Admin</option>
              <option value="PAYMENT">Payment</option>
              <option value="SYSTEM">System</option>
              <option value="AI_GATEWAY">AI Gateway</option>
              <option value="API">API</option>
            </select>
          )}

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Cari log..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          <button onClick={handleSearch} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all">
            Cari
          </button>
        </div>
      </div>

      {/* Log List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm">
          <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
          Memuat logs dari database...
        </div>
      ) : allLogs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          Belum ada log yang tercatat
        </div>
      ) : (
        <div className="space-y-2">
          {allLogs.map((log: any, idx: number) => (
            <motion.div
              key={log.id || idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-3.5 cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                selectedLog?.id === log.id ? "border-orange-400 dark:border-orange-600 ring-1 ring-orange-500/20" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className="mt-0.5 shrink-0">
                  {log._type === "security" || logType === "security" ? (
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60">{eventTypeIcon(log.eventType)}</div>
                  ) : log._type === "audit" || logType === "audit" ? (
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60"><FileText size={14} className="text-blue-500" /></div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">{sourceIcon(log.source)}</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {/* Severity Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${severityColor(log.severity || log.level || "INFO")}`}>
                      {log.severity || log.level || "INFO"}
                    </span>

                    {/* Type/Source Badge */}
                    {log._type === "security" || logType === "security" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {log.eventType?.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {log.source || log.entity || "UNKNOWN"}
                      </span>
                    )}

                    {/* Action/Message */}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {log.action || log.message || log.eventType || "—"}
                    </span>

                    {/* Entity */}
                    {log.entity && (
                      <span className="text-[10px] text-slate-400 font-mono">→ {log.entity}{log.entityId ? `/${log.entityId.slice(0, 8)}` : ""}</span>
                    )}

                    {/* Status Code */}
                    {log.statusCode && (
                      <span className={`text-[10px] font-mono font-bold ${log.statusCode >= 500 ? "text-rose-500" : log.statusCode >= 400 ? "text-amber-500" : "text-emerald-500"}`}>
                        {log.statusCode}
                      </span>
                    )}

                    {/* Duration */}
                    {log.durationMs != null && (
                      <span className="text-[10px] text-slate-400 font-mono">{log.durationMs}ms</span>
                    )}
                  </div>

                  {/* User & IP */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    {log.userName && <span className="flex items-center gap-1"><User size={10} /> {log.userName}</span>}
                    {log.email && <span className="font-mono">{log.email}</span>}
                    {log.ipAddress && <span className="flex items-center gap-1"><Globe size={10} /> {log.ipAddress}</span>}
                    {log.endpoint && <span className="font-mono truncate max-w-[200px]">{log.method} {log.endpoint}</span>}
                    <span className="flex items-center gap-1 ml-auto"><Clock size={10} /> {new Date(log.createdAt).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedLog?.id === log.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {log.oldValue && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Old Value</span>
                      <pre className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mt-1 overflow-x-auto max-h-40">
                        {typeof log.oldValue === "string" ? log.oldValue : JSON.stringify(log.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newValue && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">New Value</span>
                      <pre className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mt-1 overflow-x-auto max-h-40">
                        {typeof log.newValue === "string" ? log.newValue : JSON.stringify(log.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.details && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Details</span>
                      <pre className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mt-1 overflow-x-auto max-h-40">
                        {typeof log.details === "string" ? log.details : JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.userAgent && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">User Agent</span>
                      <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1 break-all">{log.userAgent}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {currentTotalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Menampilkan {allLogs.length} dari {currentTotal.toLocaleString()} log
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
              {page} / {currentTotalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(currentTotalPages, page + 1))}
              disabled={page >= currentTotalPages}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
