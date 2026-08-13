"use client"

import { DataTable } from "@/components/admin/DataTable"
import { motion } from "framer-motion"
import { Search, Filter, FileText } from "lucide-react"

interface CV {
  id: string
  userName: string
  template: string
  status: string
  createdDate: string
  lastModified: string
}

const mockCVs: CV[] = [
  {
    id: "1",
    userName: "Ahmad Rizki",
    template: "Standard ATS Navy",
    status: "Disiapkan",
    createdDate: "2026-08-01",
    lastModified: "2026-08-01",
  },
  {
    id: "2",
    userName: "Siti Nurhaliza",
    template: "Modern Minimalist",
    status: "Diproses",
    createdDate: "2026-08-05",
    lastModified: "2026-08-05",
  },
  {
    id: "3",
    userName: "Budi Santoso",
    template: "Executive Single Column",
    status: "Disiapkan",
    createdDate: "2026-08-08",
    lastModified: "2026-08-08",
  },
]

export default function CVPage() {
  const columns = [
    { key: "userName", header: "Nama Pengguna" },
    { key: "template", header: "Format Template" },
    {
      key: "status",
      header: "Status Pemrosesan",
      render: (cv: CV) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            cv.status === "Disiapkan"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {cv.status}
        </span>
      ),
    },
    { key: "createdDate", header: "Dibuat Pada" },
    { key: "lastModified", header: "Pembaruan Terakhir" },
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
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Pantau dan kelola antrean pembuatan CV pengguna</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari CV pengguna..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all">
            <Filter size={18} />
            Filter Status
          </button>
        </div>
      </div>

      <DataTable data={mockCVs} columns={columns} />
    </motion.div>
  )
}
