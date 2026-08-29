"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { StatsCard } from "@/components/admin/StatsCard"
import { motion } from "framer-motion"
import {
  Search,
  FileText,
  RefreshCw,
  Download,
  Flame,
  BarChart3,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  FileDown,
  User,
  ArrowUpRight,
  Filter
} from "lucide-react"

interface CV {
  id: string
  userName: string
  userEmail: string
  title: string
  template: string
  targetPosition: string
  processingType: string
  status: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  readyAt: string | null
  sectionsCount: number
}

interface TemplateStat {
  id: string
  name: string
  badge: string
  description: string
  iconColor: string
  usedCount: number
  downloadCount: number
  downloadRate: number
  lastUsedAt: string | null
  lastDownloadedAt: string | null
}

interface RecentDownload {
  id: string
  userName: string
  userEmail: string
  templateId: string
  templateName: string
  format: string
  cvTitle: string
  downloadedAt: string
}

interface TemplateStatsResponse {
  summary: {
    totalTemplates: number
    totalCvCreated: number
    totalCvDownloaded: number
    overallConversionRate: number
    topDownloadedTemplate: TemplateStat | null
    topUsedTemplate: TemplateStat | null
  }
  templates: TemplateStat[]
  recentDownloads: RecentDownload[]
}

export default function CVPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "users">("templates")
  const [cvs, setCvs] = useState<CV[]>([])
  const [templateStats, setTemplateStats] = useState<TemplateStatsResponse | null>(null)
  const [isLoadingCV, setIsLoadingCV] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [templateFilter, setTemplateFilter] = useState<string>("ALL")

  const fetchCVs = async () => {
    setIsLoadingCV(true)
    try {
      const res = await fetch("/api/cv")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setCvs(data.data)
      }
    } catch (err) {
      console.error("Gagal mengambil data CV:", err)
    } finally {
      setIsLoadingCV(false)
    }
  }

  const fetchTemplateStats = async () => {
    setIsLoadingStats(true)
    try {
      const res = await fetch("/api/cv/template-stats")
      const data = await res.json()
      if (data.success && data.data) {
        setTemplateStats(data.data)
      }
    } catch (err) {
      console.error("Gagal mengambil statistik template CV:", err)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleRefreshAll = () => {
    fetchCVs()
    fetchTemplateStats()
  }

  useEffect(() => {
    fetchCVs()
    fetchTemplateStats()
  }, [])

  const filteredCVs = cvs.filter(
    (cv) =>
      cv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.template.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTemplates = (templateStats?.templates || []).filter((tpl) => {
    const matchSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch
  })

  const statusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "AI_DONE":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "QUEUED":
        return "bg-slate-100 text-slate-600 border border-slate-200"
      case "FAILED":
        return "bg-rose-50 text-rose-700 border border-rose-200"
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200"
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "READY": return "Siap"
      case "PROCESSING": return "Diproses"
      case "AI_DONE": return "Selesai"
      case "QUEUED": return "Antrean"
      case "DRAFT": return "Draft"
      case "FAILED": return "Gagal"
      default: return status
    }
  }

  const cvColumns = [
    { key: "userName", header: "Nama Pengguna" },
    { key: "title", header: "Judul CV" },
    {
      key: "template",
      header: "Template",
      render: (cv: CV) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {cv.template || "ats-modern"}
        </span>
      ),
    },
    { key: "targetPosition", header: "Target Posisi" },
    {
      key: "processingType",
      header: "Tipe",
      render: (cv: CV) => (
        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
          cv.processingType === "EXPRESS"
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : "bg-slate-100 text-slate-600 border-slate-200"
        }`}>
          {cv.processingType}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (cv: CV) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(cv.status)}`}>
          {statusLabel(cv.status)}
        </span>
      ),
    },
    { key: "createdAt", header: "Dibuat", render: (cv: CV) => new Date(cv.createdAt).toLocaleDateString("id-ID") },
  ]

  const isGlobalLoading = isLoadingCV && isLoadingStats

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-orange-500" />
            Manajemen & Analitik Template CV
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Pantau catatan template yang sering di-download, statistik penggunaan, dan antrean pembuatan CV
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={isGlobalLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={isGlobalLoading ? "animate-spin text-orange-500" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Total CV Dibuat"
          value={templateStats ? templateStats.summary.totalCvCreated.toLocaleString("id-ID") : "..."}
          change="Penggunaan semua template"
          icon={Layers}
          trend="up"
        />
        <StatsCard
          title="Total CV Di-download"
          value={templateStats ? templateStats.summary.totalCvDownloaded.toLocaleString("id-ID") : "..."}
          change="Unduhan dokumen (PDF/DOCX)"
          icon={Download}
          trend="up"
        />
        <StatsCard
          title="Template Terpopuler"
          value={templateStats?.summary.topDownloadedTemplate ? templateStats.summary.topDownloadedTemplate.name : "ATS Modern"}
          change={
            templateStats?.summary.topDownloadedTemplate
              ? `${templateStats.summary.topDownloadedTemplate.downloadCount} kali di-download`
              : "0 kali di-download"
          }
          icon={Flame}
          trend="up"
        />
        <StatsCard
          title="Rasio Unduh / Dibuat"
          value={templateStats ? `${templateStats.summary.overallConversionRate}%` : "0%"}
          change="Efektivitas template dipilih"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === "templates"
              ? "bg-[#1F3578] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 size={15} />
          Statistik & Catatan Template CV
          {templateStats && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "templates" ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              {templateStats.templates.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-[#1F3578] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <FileText size={15} />
          Daftar Semua CV Pengguna
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === "users" ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}>
            {cvs.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === "templates"
                  ? "Cari nama template, badge, atau ID template..."
                  : "Cari nama pengguna, judul CV, email, atau template..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: STATISTIK & CATATAN TEMPLATE */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Top 3 Podium Highlights */}
          {templateStats && templateStats.templates.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {templateStats.templates.slice(0, 3).map((tpl, idx) => {
                const medals = [
                  { rank: 1, label: "Top #1 Paling Sering Di-download", badgeBg: "bg-amber-500", border: "border-amber-400/40", text: "text-amber-500" },
                  { rank: 2, label: "Peringkat #2 Populer", badgeBg: "bg-slate-400", border: "border-slate-300 dark:border-slate-700", text: "text-slate-400" },
                  { rank: 3, label: "Peringkat #3 Populer", badgeBg: "bg-amber-700", border: "border-amber-600/30", text: "text-amber-700" },
                ][idx]

                return (
                  <div
                    key={tpl.id}
                    className={`relative bg-white dark:bg-slate-900 border ${medals.border} rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col justify-between`}
                  >
                    <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white ${medals.badgeBg} flex items-center gap-1 shadow-xs`}>
                          <Award size={13} />
                          #{medals.rank}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {tpl.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Di-download</p>
                        <p className="text-lg font-black text-orange-500 mt-0.5">
                          {tpl.downloadCount.toLocaleString("id-ID")} <span className="text-xs font-semibold text-slate-400">kali</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penggunaan</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                          {tpl.usedCount.toLocaleString("id-ID")} <span className="text-xs font-semibold text-slate-400">CV</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Performance Breakdown Table & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Template Ranking Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" />
                    Peringkat & Catatan Penggunaan Template CV
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Data diurutkan dari template yang paling sering di-download oleh pencari kerja
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {filteredTemplates.length} Template Terdaftar
                </span>
              </div>

              {isLoadingStats ? (
                <div className="p-12 text-center text-slate-400 font-medium text-sm">
                  <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                  Menghitung statistik template CV...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Tidak ada template yang cocok dengan pencarian.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-3">Template CV</th>
                        <th className="py-3 px-3 text-center">Jumlah Dibuat</th>
                        <th className="py-3 px-3 text-center">Total Unduhan</th>
                        <th className="py-3 px-3">Rasio & Distribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {filteredTemplates.map((tpl, index) => {
                        const maxDownloads = Math.max(...(templateStats?.templates.map((t) => t.downloadCount) || [1]), 1)
                        const barWidth = Math.max(Math.round((tpl.downloadCount / maxDownloads) * 100), tpl.downloadCount > 0 ? 8 : 2)

                        return (
                          <tr key={tpl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-3 font-bold text-slate-400">
                              {index === 0 ? (
                                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black">1</span>
                              ) : index === 1 ? (
                                <span className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-[11px] font-black">2</span>
                              ) : index === 2 ? (
                                <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px] font-black">3</span>
                              ) : (
                                <span className="pl-1.5">{index + 1}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-[#1F3578] text-white shrink-0">
                                  <FileText size={15} />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-slate-100">{tpl.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                      {tpl.badge}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {tpl.id}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {tpl.usedCount.toLocaleString("id-ID")}
                              </span>
                              <span className="block text-[10px] text-slate-400">proyek</span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="font-black text-orange-500 text-sm">
                                {tpl.downloadCount.toLocaleString("id-ID")}
                              </span>
                              <span className="block text-[10px] text-slate-400">unduhan</span>
                            </td>
                            <td className="py-3.5 px-3 min-w-[140px]">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{tpl.downloadRate}% konversi</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Download Log Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <FileDown size={18} className="text-orange-500" />
                  Log Unduhan Terkini
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                  Live Feed
                </span>
              </div>

              {isLoadingStats ? (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">
                  <RefreshCw size={18} className="animate-spin text-orange-500 mx-auto mb-2" />
                  Memuat riwayat unduhan...
                </div>
              ) : !templateStats?.recentDownloads || templateStats.recentDownloads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <FileDown size={28} className="mx-auto mb-2 text-slate-300 opacity-60" />
                  Belum ada log unduhan yang tercatat. Saat pengguna mengunduh CV di dashboard, riwayat akan muncul di sini secara otomatis.
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                  {templateStats.recentDownloads.map((dl) => (
                    <div
                      key={dl.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {dl.userName}
                        </p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                          {dl.format}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                        <FileText size={12} className="text-orange-500 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dl.templateName}</span>
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 font-medium">
                        <span className="truncate max-w-[140px]">{dl.cvTitle}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(dl.downloadedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DAFTAR SEMUA CV PENGGUNA */}
      {activeTab === "users" && (
        <div>
          {isLoadingCV ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
              Memuat data CV dari database...
            </div>
          ) : (
            <DataTable data={filteredCVs} columns={cvColumns} />
          )}
        </div>
      )}
    </motion.div>
  )
}
