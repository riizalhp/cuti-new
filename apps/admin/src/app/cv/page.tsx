"use client"

import { useState, useEffect, useMemo } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { StatsCard } from "@/components/admin/StatsCard"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
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
  Filter,
  Target,
  Briefcase,
  GraduationCap,
  Globe,
  Compass,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from "recharts"

interface CV {
  id: string
  userName: string
  userEmail: string
  title: string
  template: string
  targetPosition: string
  purpose?: string
  purposeTitle?: string
  purposeBadge?: string
  purposeCategory?: string
  purposeColor?: string
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
  features?: string[]
  usedCount: number
  downloadCount: number
  downloadRate: number
  lastUsedAt: string | null
  lastDownloadedAt: string | null
}

interface PurposeStat {
  id: string
  title: string
  badge: string
  category: string
  categoryTitle: string
  color: string
  count: number
  percentage: number
}

interface CategoryStat {
  id: string
  title: string
  count: number
  percentage: number
  color: string
}

interface DailyTrendItem {
  date: string
  label: string
  count: number
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
    topPurpose: PurposeStat | null
  }
  templates: TemplateStat[]
  purposes: PurposeStat[]
  categories: CategoryStat[]
  dailyTrend: DailyTrendItem[]
  recentDownloads: RecentDownload[]
}

const CATEGORY_COLORS: Record<string, string> = {
  career: "#1738D1",
  entry: "#059669",
  flexible: "#8B5CF6",
  academic: "#0284C7",
  public: "#E11D48",
  social: "#14B8A6",
  leadership: "#F59E0B",
  transition: "#EC4899",
}

export default function CVPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "templates" | "users">("analytics")
  const [cvs, setCvs] = useState<CV[]>([])
  const [templateStats, setTemplateStats] = useState<TemplateStatsResponse | null>(null)
  const [isLoadingCV, setIsLoadingCV] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [purposeFilter, setPurposeFilter] = useState<string>("ALL")
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

  // Filtered CV list for table
  const filteredCVs = useMemo(() => {
    return cvs.filter((cv) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        cv.userName.toLowerCase().includes(q) ||
        cv.title.toLowerCase().includes(q) ||
        cv.userEmail.toLowerCase().includes(q) ||
        cv.template.toLowerCase().includes(q) ||
        (cv.purposeTitle && cv.purposeTitle.toLowerCase().includes(q)) ||
        (cv.targetPosition && cv.targetPosition.toLowerCase().includes(q))

      const matchPurpose =
        purposeFilter === "ALL" || cv.purpose === purposeFilter

      const matchTemplate =
        templateFilter === "ALL" || cv.template === templateFilter

      return matchSearch && matchPurpose && matchTemplate
    })
  }, [cvs, searchQuery, purposeFilter, templateFilter])

  // Filtered templates for template tab
  const filteredTemplates = useMemo(() => {
    return (templateStats?.templates || [])
      .filter((tpl) => {
        const q = searchQuery.toLowerCase().trim()
        if (!q) return true
        return (
          tpl.name.toLowerCase().includes(q) ||
          tpl.badge.toLowerCase().includes(q) ||
          tpl.id.toLowerCase().includes(q) ||
          (tpl.description && tpl.description.toLowerCase().includes(q)) ||
          (tpl.features && tpl.features.some((f) => f.toLowerCase().includes(q)))
        )
      })
      .sort((a, b) => {
        if (b.downloadCount !== a.downloadCount) {
          return b.downloadCount - a.downloadCount
        }
        return b.usedCount - a.usedCount
      })
  }, [templateStats, searchQuery])

  // Chart data: Purpose Distribution (Top purposes for chart)
  const purposeChartData = useMemo(() => {
    if (!templateStats?.purposes) return []
    return templateStats.purposes.map((p) => ({
      name: p.title,
      id: p.id,
      count: p.count,
      percentage: p.percentage,
      color: p.color || CATEGORY_COLORS[p.category] || "#1738D1",
      categoryTitle: p.categoryTitle,
    }))
  }, [templateStats])

  // Chart data: Template comparison (Dibuat vs Di-download)
  const templateComparisonData = useMemo(() => {
    if (!templateStats?.templates) return []
    return templateStats.templates.map((tpl) => ({
      name: tpl.name.replace("Standard", "").replace("Minimalist", "").trim(),
      fullName: tpl.name,
      dibuat: tpl.usedCount,
      diunduh: tpl.downloadCount,
      konversi: tpl.downloadRate,
    }))
  }, [templateStats])

  const statusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
      case "AI_DONE":
        return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
      case "QUEUED":
        return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
      case "FAILED":
        return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "READY":
        return "Siap"
      case "PROCESSING":
        return "Diproses"
      case "AI_DONE":
        return "Selesai"
      case "QUEUED":
        return "Antrean"
      case "DRAFT":
        return "Draft"
      case "FAILED":
        return "Gagal"
      default:
        return status
    }
  }

  const cvColumns = [
    { key: "userName", header: "Nama Pengguna" },
    { key: "title", header: "Judul CV" },
    {
      key: "purpose",
      header: "Tujuan CV (15 Profil)",
      render: (cv: CV) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11px] font-bold border"
          style={{
            backgroundColor: `${cv.purposeColor || "#1738D1"}15`,
            color: cv.purposeColor || "#1738D1",
            borderColor: `${cv.purposeColor || "#1738D1"}30`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: cv.purposeColor || "#1738D1" }}
          />
          <span className="font-semibold">{cv.purposeTitle || "Lamar Kerja"}</span>
        </span>
      ),
    },
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
        <span
          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
            cv.processingType === "EXPRESS"
              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300"
              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
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
    {
      key: "createdAt",
      header: "Dibuat",
      render: (cv: CV) => new Date(cv.createdAt).toLocaleDateString("id-ID"),
    },
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
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
              <FileText size={24} className="text-orange-500" />
              CV Management & Analitik Tujuan
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Pantau statistik 15 tujuan pembuatan CV, rasio unduhan template, dan seluruh data CV pengguna
            </p>
          </div>
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
          title="Tujuan CV Terpopuler"
          value={
            templateStats?.summary.topPurpose
              ? templateStats.summary.topPurpose.title
              : "Lamar Kerja"
          }
          change={
            templateStats?.summary.topPurpose
              ? `${templateStats.summary.topPurpose.count} CV (${templateStats.summary.topPurpose.percentage}%)`
              : "0 CV dipilih"
          }
          icon={Target}
          trend="up"
        />
        <StatsCard
          title="Template Terpopuler"
          value={
            templateStats?.summary.topDownloadedTemplate
              ? templateStats.summary.topDownloadedTemplate.name
              : "ATS Modern"
          }
          change={
            templateStats?.summary.topDownloadedTemplate
              ? `${templateStats.summary.topDownloadedTemplate.downloadCount} kali di-download`
              : "0 kali di-download"
          }
          icon={Flame}
          trend="up"
        />
      </div>

      {/* Tab Navigation (3 Tabs) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-[#1F3578] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 size={15} />
          Grafik & Visualisasi CV
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "analytics"
                ? "bg-orange-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {templateStats?.purposes?.length || 15} Tujuan
          </span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "templates"
              ? "bg-[#1F3578] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Flame size={15} />
          Peringkat Template CV
          {templateStats && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "templates"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {templateStats.templates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-[#1F3578] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <FileText size={15} />
          Daftar Semua CV Pengguna
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "users"
                ? "bg-orange-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {cvs.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB CONTENT 1: GRAFIK & ANALITIK VISUAL (RECHARTS)         */}
      {/* ========================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Row 1: Tujuan Pembuatan CV (Bar Chart) & Kategori Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Distribusi 15 Profil Tujuan CV */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Target size={18} className="text-[#1738D1]" />
                      Distribusi Tujuan Pembuatan CV (15 Profil)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Jumlah proyek CV yang disusun berdasarkan tujuan pilihan pencari kerja di langkah 1
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    Total: {templateStats?.summary.totalCvCreated || 0} CV
                  </span>
                </div>

                {/* Recharts Bar Chart: Tujuan Pembuatan CV */}
                <div className="h-[340px] w-full pt-2">
                  {isLoadingStats ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <RefreshCw size={20} className="animate-spin text-orange-500 mb-2" />
                      Memuat grafik tujuan CV...
                    </div>
                  ) : purposeChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      Belum ada data tujuan CV yang tersimpan.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={purposeChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          height={50}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                                  <p className="font-extrabold text-sm">{data.name}</p>
                                  <p className="text-slate-300 text-[11px]">
                                    Kategori: <span className="font-semibold text-white">{data.categoryTitle}</span>
                                  </p>
                                  <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between gap-4">
                                    <span className="text-orange-400 font-bold">{data.count} CV dibuat</span>
                                    <span className="text-slate-400 font-mono">({data.percentage}%)</span>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {purposeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top 3 Quick Insights Badges */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Top 3 Terbanyak:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {(templateStats?.purposes || []).slice(0, 3).map((p, idx) => (
                    <div
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11px] font-bold border"
                      style={{
                        backgroundColor: `${p.color}15`,
                        color: p.color,
                        borderColor: `${p.color}30`,
                      }}
                    >
                      <span className="font-black text-[10px]">#{idx + 1}</span>
                      <span>{p.title}</span>
                      <span className="font-mono text-[10px] opacity-80">({p.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 2: Proporsi Kategori Tujuan CV */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Compass size={18} className="text-orange-500" />
                      Kategori Tujuan CV
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Segmentasi profil pencari kerja
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 mt-2">
                  {isLoadingStats ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <RefreshCw size={18} className="animate-spin text-orange-500 mx-auto mb-2" />
                      Memuat kategori...
                    </div>
                  ) : (templateStats?.categories || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Belum ada data kategori.</p>
                  ) : (
                    (templateStats?.categories || []).map((cat) => {
                      const maxCatCount = Math.max(
                        ...(templateStats?.categories.map((c) => c.count) || [1]),
                        1
                      )
                      const barWidth = Math.max(
                        Math.round((cat.count / maxCatCount) * 100),
                        cat.count > 0 ? 8 : 2
                      )

                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.title}
                            </span>
                            <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">
                              {cat.count} CV <span className="text-[10px]">({cat.percentage}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Segmentasi otomatis</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  8 Kluster Resmi
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Komparasi Performa Template (Dibuat vs Diunduh) & Tren Harian */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 3: Komparasi Template CV Dibuat vs Unduhan */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" />
                    Komparasi Template: CV Dibuat vs Di-download
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluasi template mana yang paling banyak diselesaikan dan diekspor ke PDF oleh pengguna
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#1F3578]" />
                    <span className="text-slate-600 dark:text-slate-300">Dibuat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#F97316]" />
                    <span className="text-slate-600 dark:text-slate-300">Di-download</span>
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="h-[280px] w-full pt-2">
                {isLoadingStats ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <RefreshCw size={20} className="animate-spin text-orange-500 mb-2" />
                    Memuat grafik template...
                  </div>
                ) : templateComparisonData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Belum ada data template.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={templateComparisonData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                                <p className="font-extrabold text-sm text-slate-100">{data.fullName}</p>
                                <div className="space-y-1 pt-1 border-t border-slate-700">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Proyek Dibuat:</span>
                                    <span className="font-bold text-sky-400">{data.dibuat} CV</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Total Unduhan:</span>
                                    <span className="font-bold text-orange-400">{data.diunduh} kali</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700/60">
                                    <span className="text-slate-400">Rasio Konversi:</span>
                                    <span className="font-black text-emerald-400">{data.konversi}%</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="dibuat" fill="#1F3578" radius={[4, 4, 0, 0]} name="Dibuat" />
                      <Bar dataKey="diunduh" fill="#F97316" radius={[4, 4, 0, 0]} name="Diunduh" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 4: Tren Pembuatan CV (14 Hari Terakhir) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-600" />
                      Tren Pembuatan CV
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Aktivitas harian (14 hari terakhir)
                    </p>
                  </div>
                </div>

                <div className="h-[240px] w-full pt-1">
                  {isLoadingStats ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      <RefreshCw size={18} className="animate-spin text-orange-500 mx-auto mb-2" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={templateStats?.dailyTrend || []}
                        margin={{ top: 10, right: 5, left: -25, bottom: 15 }}
                      >
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9, fill: "#64748b" }}
                          interval={2}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                        />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload
                              return (
                                <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                                  <p className="text-slate-400 text-[10px]">{d.date}</p>
                                  <p className="font-black text-emerald-400 mt-0.5">{d.count} CV dibuat</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Rasio unduh / dibuat:</span>
                <span className="font-extrabold text-orange-500">
                  {templateStats?.summary.overallConversionRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT 2: PERINGKAT & CATATAN TEMPLATE                */}
      {/* ========================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Top 3 Podium Highlights */}
          {templateStats && templateStats.templates.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {templateStats.templates.slice(0, 3).map((tpl, idx) => {
                const medals = [
                  {
                    rank: 1,
                    label: "Top #1 Paling Sering Di-download",
                    badgeBg: "bg-amber-500",
                    border: "border-amber-400/40",
                    text: "text-amber-500",
                  },
                  {
                    rank: 2,
                    label: "Peringkat #2 Populer",
                    badgeBg: "bg-slate-400",
                    border: "border-slate-300 dark:border-slate-700",
                    text: "text-slate-400",
                  },
                  {
                    rank: 3,
                    label: "Peringkat #3 Populer",
                    badgeBg: "bg-amber-700",
                    border: "border-amber-600/30",
                    text: "text-amber-700",
                  },
                ][idx]

                return (
                  <div
                    key={tpl.id}
                    className={`relative bg-white dark:bg-slate-900 border ${medals.border} rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col justify-between`}
                  >
                    <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white ${medals.badgeBg} flex items-center gap-1 shadow-xs`}
                        >
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
                      {tpl.features && tpl.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {tpl.features.slice(0, 2).map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Di-download
                        </p>
                        <p className="text-lg font-black text-orange-500 mt-0.5">
                          {tpl.downloadCount.toLocaleString("id-ID")}{" "}
                          <span className="text-xs font-semibold text-slate-400">kali</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Penggunaan
                        </p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                          {tpl.usedCount.toLocaleString("id-ID")}{" "}
                          <span className="text-xs font-semibold text-slate-400">CV</span>
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
                <p className="text-sm text-slate-400 text-center py-8">
                  Tidak ada template yang cocok dengan pencarian.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-3">Template CV & Catatan Penggunaan</th>
                        <th className="py-3 px-3 text-center">Jumlah Dibuat</th>
                        <th className="py-3 px-3 text-center">Total Unduhan</th>
                        <th className="py-3 px-3">Rasio & Distribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {filteredTemplates.map((tpl, index) => {
                        const maxDownloads = Math.max(
                          ...(templateStats?.templates.map((t) => t.downloadCount) || [1]),
                          1
                        )
                        const barWidth = Math.max(
                          Math.round((tpl.downloadCount / maxDownloads) * 100),
                          tpl.downloadCount > 0 ? 8 : 2
                        )

                        return (
                          <tr
                            key={tpl.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-3 font-bold text-slate-400 align-top">
                              {index === 0 ? (
                                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                                  1
                                </span>
                              ) : index === 1 ? (
                                <span className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                                  2
                                </span>
                              ) : index === 2 ? (
                                <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                                  3
                                </span>
                              ) : (
                                <span className="pl-1.5">{index + 1}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-start gap-2.5">
                                <div className="p-2 rounded-lg bg-[#1F3578] text-white shrink-0 mt-0.5">
                                  <FileText size={15} />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-slate-900 dark:text-slate-100">
                                      {tpl.name}
                                    </p>
                                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                      {tpl.badge}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {tpl.id}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                                    {tpl.description}
                                  </p>
                                  {tpl.features && tpl.features.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {tpl.features.map((feat, fIdx) => (
                                        <span
                                          key={fIdx}
                                          className="text-[9px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50"
                                        >
                                          {feat}
                                        </span>
                                      ))}
                                    </div>
                                  )}
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
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  {tpl.downloadRate}% konversi
                                </span>
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300">
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
                  Belum ada log unduhan yang tercatat.
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
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {dl.templateName}
                        </span>
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 font-medium">
                        <span className="truncate max-w-[140px]">{dl.cvTitle}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(dl.downloadedAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

      {/* ========================================================= */}
      {/* TAB CONTENT 3: DAFTAR SEMUA CV PENGGUNA                   */}
      {/* ========================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Text Search */}
              <div className="flex-1 relative w-full">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nama pengguna, judul CV, email, target posisi, atau tujuan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Filter Tujuan CV */}
              <div className="w-full md:w-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                  <Target size={15} className="text-slate-400 shrink-0" />
                  <select
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer w-full md:w-44"
                  >
                    <option value="ALL">Semua Tujuan CV (15)</option>
                    {(templateStats?.purposes || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Template CV */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                  <Filter size={15} className="text-slate-400 shrink-0" />
                  <select
                    value={templateFilter}
                    onChange={(e) => setTemplateFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer w-full md:w-40"
                  >
                    <option value="ALL">Semua Template</option>
                    {(templateStats?.templates || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters indicator */}
            {(purposeFilter !== "ALL" || templateFilter !== "ALL" || searchQuery) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Filter aktif:</span>
                {purposeFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300 font-bold text-[11px]">
                    Tujuan: {templateStats?.purposes.find((p) => p.id === purposeFilter)?.title || purposeFilter}
                    <button
                      onClick={() => setPurposeFilter("ALL")}
                      className="hover:text-rose-500 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {templateFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold text-[11px]">
                    Template: {templateFilter}
                    <button
                      onClick={() => setTemplateFilter("ALL")}
                      className="hover:text-rose-500 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setPurposeFilter("ALL")
                    setTemplateFilter("ALL")
                    setSearchQuery("")
                  }}
                  className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] font-semibold ml-auto cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>

          {/* DataTable */}
          <div>
            {isLoadingCV ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                Memuat data CV dari database...
              </div>
            ) : filteredCVs.length === 0 ? (
              <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
                Tidak ada data CV yang sesuai dengan kriteria pencarian dan filter.
              </div>
            ) : (
              <DataTable data={filteredCVs} columns={cvColumns} />
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
