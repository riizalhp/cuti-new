"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { motion } from "framer-motion"
import { Search, Filter, FileText, RefreshCw } from "lucide-react"

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

export default function CVPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchCVs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/cv")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setCvs(data.data)
      }
    } catch (err) {
      console.error("Gagal mengambil data CV:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCVs()
  }, [])

  const filteredCVs = cvs.filter(
    (cv) =>
      cv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      case "AI_DONE": return "AI Selesai"
      case "QUEUED": return "Antrean"
      case "DRAFT": return "Draft"
      case "FAILED": return "Gagal"
      default: return status
    }
  }

  const columns = [
    { key: "userName", header: "Nama Pengguna" },
    { key: "title", header: "Judul CV" },
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-orange-500" />
            Manajemen CV
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Pantau dan kelola antrean pembuatan CV pengguna dari database
          </p>
        </div>
        <button
          onClick={fetchCVs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-orange-500" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama pengguna, judul CV, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm">
          <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
          Memuat data CV dari database...
        </div>
      ) : (
        <DataTable data={filteredCVs} columns={columns} />
      )}
    </motion.div>
  )
}
