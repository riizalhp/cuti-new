"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Skeleton } from "@/components/admin/Skeleton"
import { Toast, type ToastData, type ToastType } from "@/components/admin/Toast"
import {
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Briefcase,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react"
import { AdminJobsView } from "@/components/admin/AdminJobsView"
import { BulkImportModal } from "@/components/admin/BulkImportModal"
import { downloadTemplate, exportData, CMSEntityKey } from "@/lib/cms-excel"

type TabKey = "articles" | "jobs" | "courses" | "certifications" | "events"
type CrudTabKey = Exclude<TabKey, "jobs">

interface ArticleItem {
  id: string
  title: string
  slug: string
  author: string
  category: string | null
  categoryId: string | null
  isPublished: boolean
  publishedAt: string | null
  [key: string]: any
}

interface CourseItem {
  id: string
  title: string
  instructor: string
  level: string
  price: number
  durationHours: number
  isActive: boolean
  externalUrl: string
  createdAt: string
  [key: string]: any
}

interface CertItem {
  id: string
  title: string
  provider: string
  price: number
  durationHours: number
  isActive: boolean
  externalUrl: string
  createdAt: string
  [key: string]: any
}

interface EventItem {
  id: string
  title: string
  eventDate: string
  location: string
  type: string
  isActive: boolean
  externalUrl: string
  createdAt: string
  [key: string]: any
}

const tabs: { key: TabKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "articles", label: "Artikel", icon: BookOpen, desc: "Artikel karier untuk tab Pengembangan Karier" },
  { key: "jobs", label: "Lowongan Kerja", icon: Briefcase, desc: "Lowongan portal, scraping harian & user submit" },
  { key: "courses", label: "Kursus & Skills", icon: GraduationCap, desc: "Kursus yang direkomendasikan ke pengguna" },
  { key: "certifications", label: "Sertifikasi", icon: Award, desc: "Sertifikasi profesional yang ditampilkan" },
  { key: "events", label: "Event Job Fair", icon: CalendarDays, desc: "Event / webinar / job fair yang akan datang" },
]

const API_PATHS: Record<CrudTabKey, string> = {
  articles: "/api/cms/articles",
  courses: "/api/cms/courses",
  certifications: "/api/cms/certifications",
  events: "/api/cms/events",
}

export default function CMSPage() {
  const [tab, setTab] = useState<TabKey>("articles")
  const [data, setData] = useState<Record<TabKey, any[]>>({ articles: [], jobs: [], courses: [], certifications: [], events: [] })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [jobsRefreshKey, setJobsRefreshKey] = useState(0)

  const showToast = useCallback((type: ToastType, message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ type, message })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 4000)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const handleExport = async (format: "xlsx" | "csv" | "json") => {
    setShowExportMenu(false)
    setIsExporting(true)
    const currentTabObj = tabs.find((t) => t.key === tab)
    const tabLabel = currentTabObj?.label || tab
    try {
      let items = data[tab] || []
      if (tab === "jobs") {
        const res = await fetch("/api/cms/jobs?limit=200")
        const json = await res.json()
        if (json.success && json.data) items = json.data
      }
      exportData(tab as CMSEntityKey, items, format)
      showToast("success", `Berhasil mengekspor ${items.length} data ${tabLabel} (.${format}).`)
    } catch (e: any) {
      showToast("error", e?.message || `Gagal mengekspor data ${tabLabel}.`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadTemplate = (format: "xlsx" | "csv" | "json") => {
    setShowTemplateMenu(false)
    const currentTabObj = tabs.find((t) => t.key === tab)
    const tabLabel = currentTabObj?.label || tab
    try {
      downloadTemplate(tab as CMSEntityKey, format)
      showToast("info", `Format template ${tabLabel} (.${format}) siap diisi.`)
    } catch {
      showToast("error", "Gagal mengunduh format template.")
    }
  }

  const load = useCallback(async (t: TabKey) => {
    if (t === "jobs") {
      try {
        const res = await fetch("/api/cms/jobs?limit=1")
        const json = await res.json()
        if (json.success && json.stats) {
          const total = (json.stats.scrapedActive || 0) + (json.stats.manualActive || 0) + (json.stats.inactive || 0)
          setData((prev) => ({ ...prev, jobs: new Array(total).fill(null) }))
        }
      } catch {}
      return
    }
    try {
      const res = await fetch(API_PATHS[t as CrudTabKey])
      const json = await res.json()
      if (json.success) {
        setData((prev) => ({ ...prev, [t]: json.data }))
      }
    } catch (e) {
      // keep existing data on failure
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get("tab") as TabKey | null
      if (tabParam && ["articles", "jobs", "courses", "certifications", "events"].includes(tabParam)) {
        setTab(tabParam)
      }
      const toastParam = urlParams.get("toast")
      if (toastParam === "saved") {
        showToast("success", "Konten berhasil disimpan.")
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("toast")
        window.history.replaceState({}, "", newUrl.toString())
      }
    }

    setLoading(true)
    const crudTabs: CrudTabKey[] = ["articles", "courses", "certifications", "events"]
    Promise.all([
      ...crudTabs.map((k) => fetch(API_PATHS[k]).then((r) => r.json())),
      fetch("/api/cms/jobs?limit=1").then((r) => r.json()).catch(() => ({ success: false })),
    ])
      .then((results) => {
        const next: Record<TabKey, any[]> = { articles: [], jobs: [], courses: [], certifications: [], events: [] }
        crudTabs.forEach((k, i) => {
          const json = results[i]
          next[k] = json?.success ? json.data : []
        })
        const jobResult = results[results.length - 1]
        if (jobResult?.success && jobResult?.stats) {
          const total = (jobResult.stats.scrapedActive || 0) + (jobResult.stats.manualActive || 0) + (jobResult.stats.inactive || 0)
          next.jobs = new Array(total).fill(null)
        }
        setData(next)
      })
      .finally(() => setLoading(false))
  }, [showToast])

  const handleDelete = async () => {
    if (!confirmDelete || tab === "jobs") return
    const currentTab = tab as CrudTabKey
    const deletedTitle = confirmDelete.title || "Konten"
    setSaving(true)
    try {
      const res = await fetch(`${API_PATHS[currentTab]}/${confirmDelete.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) {
        showToast("error", json.message ?? `Gagal menghapus "${deletedTitle}".`)
        return
      }
      setConfirmDelete(null)
      await load(currentTab)
      showToast("success", `"${deletedTitle}" berhasil dihapus.`)
    } catch (e: any) {
      showToast("error", e?.message ?? `Terjadi kesalahan saat menghapus "${deletedTitle}".`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = (tab === "jobs" ? [] : data[tab]).filter((item) => {
    const q = search.toLowerCase()
    return Object.values(item).some((v) => (v != null ? String(v).toLowerCase().includes(q) : false))
  })

  const toggleActive = async (item: any) => {
    if (tab === "jobs") return
    const currentTab = tab as CrudTabKey
    const nextActive = !item.isActive
    try {
      const res = await fetch(`${API_PATHS[currentTab]}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      })
      const json = await res.json()
      if (json.success) {
        await load(currentTab)
        showToast("success", `Status "${item.title}" diubah menjadi ${nextActive ? "Aktif" : "Nonaktif"}.`)
      } else {
        showToast("error", json.message || "Gagal mengubah status.")
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat mengubah status.")
    }
  }

  const toggleArticlePublish = async (item: ArticleItem) => {
    const nextPublished = !item.isPublished
    try {
      const res = await fetch(`${API_PATHS.articles}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublished }),
      })
      const json = await res.json()
      if (json.success) {
        await load("articles")
        showToast("success", `Artikel "${item.title}" berhasil ${nextPublished ? "diterbitkan" : "dijadikan draft"}.`)
      } else {
        showToast("error", json.message || "Gagal mengubah status publikasi artikel.")
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat mengubah status publikasi artikel.")
    }
  }

  const columns: Record<CrudTabKey, { key: string; header: string; render: (item: any) => React.ReactNode }[]> = {
    articles: [
      { key: "title", header: "Judul", render: (item: ArticleItem) => <span className="font-semibold">{item.title}</span> },
      { key: "author", header: "Penulis", render: (item: ArticleItem) => (!item.author || item.author.toLowerCase().includes("ambilcuti") ? "Admin Employr" : item.author) },
      { key: "category", header: "Kategori", render: (item: ArticleItem) => item.category ?? <span className="text-slate-400">-</span> },
      {
        key: "isPublished",
        header: "Status",
        render: (item: ArticleItem) => (
          <button
            onClick={() => toggleArticlePublish(item)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
              item.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {item.isPublished ? "Terbit" : "Draft"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <Link href={`/cms/editor?type=${tab}&id=${item.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </Link>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    courses: [
      { key: "title", header: "Judul", render: (item: CourseItem) => <span className="font-semibold">{item.title}</span> },
      { key: "instructor", header: "Instruktur", render: (item: CourseItem) => item.instructor },
      { key: "level", header: "Level", render: (item: CourseItem) => <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">{item.level}</span> },
      {
        key: "price",
        header: "Harga",
        render: (item: CourseItem) => (item.price === 0 ? <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratis</span> : <span className="font-semibold">Rp{item.price.toLocaleString("id-ID")}</span>),
      },
      {
        key: "isActive",
        header: "Status",
        render: (item: CourseItem) => (
          <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${item.isActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {item.isActive ? "Aktif" : "Nonaktif"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <Link href={`/cms/editor?type=${tab}&id=${item.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </Link>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    certifications: [
      { key: "title", header: "Judul", render: (item: CertItem) => <span className="font-semibold">{item.title}</span> },
      { key: "provider", header: "Penyelenggara", render: (item: CertItem) => item.provider },
      { key: "price", header: "Harga", render: (item: CertItem) => (item.price === 0 ? <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratis</span> : <span className="font-semibold">Rp{item.price.toLocaleString("id-ID")}</span>) },
      {
        key: "isActive",
        header: "Status",
        render: (item: CertItem) => (
          <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${item.isActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {item.isActive ? "Aktif" : "Nonaktif"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <Link href={`/cms/editor?type=${tab}&id=${item.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </Link>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    events: [
      { key: "title", header: "Judul", render: (item: EventItem) => <span className="font-semibold">{item.title}</span> },
      { key: "eventDate", header: "Tanggal", render: (item: EventItem) => item.eventDate },
      {
        key: "type",
        header: "Tipe",
        render: (item: EventItem) => (
          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${item.type === "ONLINE" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" : item.type === "HYBRID" ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"}`}>
            {item.type}
          </span>
        ),
      },
      { key: "location", header: "Lokasi", render: (item: EventItem) => item.location },
      {
        key: "isActive",
        header: "Status",
        render: (item: EventItem) => (
          <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${item.isActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {item.isActive ? "Aktif" : "Nonaktif"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <Link href={`/cms/editor?type=${tab}&id=${item.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </Link>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
  }

  return (
    <AdminPageWrapper>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
              <BookOpen size={24} className="text-orange-500" />
              CMS &amp; Lowongan Kerja
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Pusat kelola seluruh konten: lowongan kerja, artikel, kursus, sertifikasi, dan event
            </p>
          </div>
        </div>
        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {tab === "jobs" && (
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-[10px] transition cursor-pointer"
            >
              <ExternalLink size={14} />
              Portal Loker
            </a>
          )}

          {/* Unduh Format Template Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTemplateMenu((v) => !v)
                setShowExportMenu(false)
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-[10px] shadow-2xs transition cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-emerald-500" />
              <span>Format Template</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>
            {showTemplateMenu && (
              <div
                className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowTemplateMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Unduh Contoh {tabs.find((t) => t.key === tab)?.label}
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("xlsx")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet size={13} className="text-emerald-500" /> Excel (.xlsx)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">Rekomendasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("csv")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileText size={13} className="text-blue-500" /> CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("json")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download size={13} className="text-slate-400" /> JSON (.json)
                </button>
              </div>
            )}
          </div>

          {/* Export Data Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => {
                setShowExportMenu((v) => !v)
                setShowTemplateMenu(false)
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-[10px] shadow-2xs transition disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin text-orange-500" />
              ) : (
                <Download size={14} className="text-blue-500" />
              )}
              <span>Export Data</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>
            {showExportMenu && (
              <div
                className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ekspor Data {tabs.find((t) => t.key === tab)?.label}
                </div>
                <button
                  type="button"
                  onClick={() => handleExport("xlsx")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileSpreadsheet size={13} className="text-emerald-500" /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileText size={13} className="text-blue-500" /> CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download size={13} className="text-slate-400" /> JSON (.json)
                </button>
              </div>
            )}
          </div>

          {/* Bulk Insert Button */}
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs rounded-[10px] shadow-sm shadow-[#1738D1]/20 transition cursor-pointer"
          >
            <UploadCloud size={15} />
            Bulk Insert
          </button>

          {/* Tambah Manual Button */}
          <Link
            href={tab === "jobs" ? "/cms/editor?type=jobs" : `/cms/editor?type=${tab}`}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-[10px] shadow-sm transition cursor-pointer"
          >
            <Plus size={15} />
            Tambah {tab === "jobs" ? "Lowongan" : tabs.find((t) => t.key === tab)?.label}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {tabs.map((t) => {
          const count = data[t.key].length
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key)
                setSearch("")
                load(t.key)
              }}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                active
                  ? "bg-white dark:bg-slate-900 border-orange-300 dark:border-orange-700 shadow-md"
                  : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${active ? "bg-orange-50 dark:bg-orange-950/60 text-orange-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                  <t.icon size={18} />
                </div>
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">{count}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.label}</h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
            </button>
          )
        })}
      </div>

      {tab === "jobs" ? (
        <AdminJobsView key={jobsRefreshKey} hideTitle onToast={showToast} />
      ) : (
        <>
          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari konten..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                {filtered.length} dari {data[tab].length} konten
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                    {columns[tab as CrudTabKey].map((col) => (
                      <th key={col.key} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                        {columns[tab as CrudTabKey].map((col, cIdx) => (
                          <td key={String(col.key || cIdx)} className="px-6 py-4">
                            {cIdx === 0 ? (
                              <Skeleton className="h-4 w-44 rounded-md" />
                            ) : cIdx === columns[tab as CrudTabKey].length - 1 ? (
                              <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                              </div>
                            ) : (
                              <Skeleton className="h-4 w-24 rounded-md" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? null : (
                    filtered.map((item, index) => (
                      <tr key={item.id ?? index} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                        {columns[tab as CrudTabKey].map((col) => (
                          <td key={col.key} className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                            {col.render(item)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                {search ? "Tidak ada hasil yang cocok" : "Belum ada konten. Klik \"Tambah\" untuk mengisi konten pertama."}
              </div>
            )}
          </div>
        </>
      )}

      {/* Konfirmasi Hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 mb-1">Hapus konten ini?</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-5">
              "{confirmDelete.title}" akan dihapus permanen dan tidak tampil lagi di dashboard pengguna.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Modal Bulk Insert */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        entityKey={tab as CMSEntityKey}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={(stats) => {
          if (tab === "jobs") {
            setJobsRefreshKey((k) => k + 1)
            load("jobs")
          } else {
            load(tab)
          }
          const currentTabObj = tabs.find((t) => t.key === tab)
          const label = currentTabObj?.label || tab
          if (stats && stats.insertedCount > 0) {
            if (stats.failedCount > 0) {
              showToast("info", `${stats.insertedCount} data ${label} berhasil diimpor (${stats.failedCount} data dilewati karena kendala format).`)
            } else {
              showToast("success", `Berhasil mengimpor ${stats.insertedCount} data ${label}!`)
            }
          } else {
            showToast("success", `Data ${label} berhasil diimpor.`)
          }
        }}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AdminPageWrapper>
  )
}
