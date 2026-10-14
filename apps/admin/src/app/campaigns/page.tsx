"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Skeleton, SkeletonCardsGrid } from "@/components/admin/Skeleton"
import {
  Trophy,
  Users,
  TrendingUp,
  RefreshCw,
  Target,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react"

interface Misi {
  id: string
  title: string
  description: string
  type: string
  rewardAmount: number
  maxSubmissions: number
  currentSubmissions: number
  submissionCount: number
  requiresProof: boolean
  proofType: string
  isActive: boolean
  deadline: string | null
  createdAt: string
}

export default function CampaignsPage() {
  const [misiList, setMisiList] = useState<Misi[]>([])
  const [isLoadingMisi, setIsLoadingMisi] = useState(false)

  const fetchMisi = async () => {
    setIsLoadingMisi(true)
    try {
      const res = await fetch("/api/misi")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setMisiList(data.data)
      }
    } catch (err) {
      console.error("Gagal mengambil data misi:", err)
    } finally {
      setIsLoadingMisi(false)
    }
  }

  useEffect(() => {
    fetchMisi()
  }, [])

  const activeMisi = misiList.filter((m) => m.isActive)
  const totalSubmissions = misiList.reduce((sum, m) => sum + m.submissionCount, 0)
  const totalRewards = misiList.reduce((sum, m) => sum + m.rewardAmount * m.currentSubmissions, 0)

  const typeColor = (type: string) => {
    switch (type) {
      case "REGISTER_ACCOUNT": return "bg-blue-50 text-blue-700 border-blue-200"
      case "SURVEY": return "bg-purple-50 text-purple-700 border-purple-200"
      case "SOCIAL": return "bg-pink-50 text-pink-700 border-pink-200"
      case "DOWNLOAD": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "REVIEW": return "bg-amber-50 text-amber-700 border-amber-200"
      default: return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  return (
    <AdminPageWrapper className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Misi Cuan
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola program misi berhadiah, partisipasi pengguna, dan reward cuan.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchMisi}
          disabled={isLoadingMisi}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
        >
          <RefreshCw size={13} className={isLoadingMisi ? "animate-spin text-orange-500" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
              <TrendingUp size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Misi Aktif</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
            {isLoadingMisi ? "..." : activeMisi.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <Users size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Partisipasi</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
            {isLoadingMisi ? "..." : totalSubmissions.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
              <Trophy size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Reward</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
            {isLoadingMisi ? "..." : `Rp ${totalRewards.toLocaleString("id-ID")}`}
          </p>
        </div>
      </div>

      {/* Misi List */}
      {isLoadingMisi && misiList.length === 0 ? (
        <SkeletonCardsGrid count={4} columns={2} />
      ) : misiList.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          Belum ada misi yang dibuat
        </div>
      ) : (
        <div className="space-y-4">
          {misiList.map((misi) => (
            <motion.div
              key={misi.id}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">{misi.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${typeColor(misi.type)}`}>
                      {misi.type.replace(/_/g, " ")}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      misi.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {misi.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{misi.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Reward</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Rp {misi.rewardAmount.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Partisipasi</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{misi.currentSubmissions} / {misi.maxSubmissions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Submission</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{misi.submissionCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Deadline</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {misi.deadline ? new Date(misi.deadline).toLocaleDateString("id-ID") : "Tanpa batas"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminPageWrapper>
  )
}
