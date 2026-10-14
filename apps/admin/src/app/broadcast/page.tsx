"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Skeleton } from "@/components/admin/Skeleton"
import {
  Radio,
  RefreshCw,
  Send,
  BellRing,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Inbox,
  Clock,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
} from "lucide-react"

interface BroadcastDetails {
  title?: string
  message?: string
  category?: string
  priority?: string
  actionUrl?: string
  targetSegment?: string
  recipientCount?: number
  timestamp?: string
}

interface BroadcastHistoryItem {
  id: string
  createdAt: string
  details?: BroadcastDetails
  ipAddress?: string
}

const getPriorityStyle = (priority?: string) => {
  switch (priority) {
    case "CRITICAL":
      return {
        border: "border-l-rose-500",
        badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        cardBg: "bg-rose-50/50 dark:bg-rose-950/20",
        label: "Mendesak",
      }
    case "IMPORTANT":
      return {
        border: "border-l-amber-500",
        badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        cardBg: "bg-amber-50/50 dark:bg-amber-950/20",
        label: "Penting",
      }
    case "SUCCESS":
      return {
        border: "border-l-emerald-500",
        badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        cardBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
        label: "Sukses",
      }
    default:
      return {
        border: "border-l-[#1738D1]",
        badge: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        cardBg: "bg-blue-50/50 dark:bg-blue-950/20",
        label: "Informasi",
      }
  }
}

const getCategoryLabel = (cat?: string) => {
  switch (cat) {
    case "SYSTEM": return "Update Sistem & Fitur"
    case "OPPORTUNITY": return "Loker & Peluang"
    case "CAREER": return "Tips Karier"
    case "TRACKER": return "Pengingat Tracker"
    case "ORDER": return "Transaksi"
    case "MEMBERSHIP": return "Membership"
    default: return cat || "Umum"
  }
}

const getCategoryBadgeStyle = (cat?: string) => {
  switch (cat) {
    case "SYSTEM":
      return "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
    case "OPPORTUNITY":
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    case "CAREER":
      return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
    case "TRACKER":
      return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    case "ORDER":
      return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    case "MEMBERSHIP":
      return "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
  }
}

const getSegmentLabel = (seg?: string) => {
  switch (seg) {
    case "free": return "Hanya Free User"
    case "premium": return "Hanya Member Lifetime"
    default: return "Semua Pengguna"
  }
}

function NotificationPreviewCard({
  title,
  message,
  category,
  priority,
  actionUrl,
}: {
  title: string
  message: string
  category: string
  priority: string
  actionUrl?: string
}) {
  const pStyle = getPriorityStyle(priority)
  return (
    <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-3">
      {/* Frame Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#1738D1]/30 text-blue-400 flex items-center justify-center">
            <BellRing size={13} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-100">Notifikasi & Pengingat</h4>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            1 Baru
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Lonceng User</span>
      </div>

      {/* Mini Filter Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/90 rounded-lg text-[10px] font-bold text-center">
        <div className="py-1 bg-slate-700 text-white rounded shadow-xs">Semua (1)</div>
        <div className="py-1 text-slate-400">Pengingat (0)</div>
        <div className="py-1 text-slate-400">Sistem (1)</div>
      </div>

      {/* Notification Item Card */}
      <div
        className={`p-3.5 rounded-xl border border-l-4 ${pStyle.border} ${pStyle.cardBg} border-slate-700/80 space-y-2`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeStyle(category)}`}>
              {getCategoryLabel(category)}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {pStyle.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Baru saja</span>
        </div>

        <h5 className="text-xs font-bold text-white line-clamp-2">
          {title.trim() || "Judul notifikasi pengumuman..."}
        </h5>

        <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
          {message.trim() || "Isi pesan lengkap notifikasi pengumuman dari admin akan tampil di sini secara rinci."}
        </p>

        {actionUrl?.trim() && (
          <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-blue-400">
            <span>Buka tautan</span>
            <ExternalLink size={10} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function BroadcastPage() {
  // Stats & History
  const [broadcastStats, setBroadcastStats] = useState<{
    totalSent: number
    totalUnread: number
    recentBroadcasts: BroadcastHistoryItem[]
  } | null>(null)
  const [isLoadingBroadcast, setIsLoadingBroadcast] = useState(false)

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterSegment, setFilterSegment] = useState("ALL")

  // Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastHistoryItem | null>(null)

  // Form State
  const [bTitle, setBTitle] = useState("")
  const [bMessage, setBMessage] = useState("")
  const [bCategory, setBCategory] = useState("OPPORTUNITY")
  const [bPriority, setBPriority] = useState("INFORMATIONAL")
  const [bActionUrl, setBActionUrl] = useState("")
  const [bSegment, setBSegment] = useState("all")
  const [isSending, setIsSending] = useState(false)
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const fetchBroadcastStats = async () => {
    setIsLoadingBroadcast(true)
    try {
      const res = await fetch("/api/notifications/broadcast")
      const json = await res.json()
      if (json.success) {
        setBroadcastStats(json.data)
      }
    } catch (err) {
      console.error("Gagal mengambil data broadcast:", err)
    } finally {
      setIsLoadingBroadcast(false)
    }
  }

  useEffect(() => {
    fetchBroadcastStats()
  }, [])

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bTitle.trim() || !bMessage.trim()) return

    setIsSending(true)
    setBroadcastFeedback(null)
    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bTitle,
          message: bMessage,
          category: bCategory,
          priority: bPriority,
          actionUrl: bActionUrl,
          targetSegment: bSegment,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setBroadcastFeedback({
          type: "success",
          msg: json.message || "Notifikasi berhasil disiarkan ke pengguna!",
        })
        setBTitle("")
        setBMessage("")
        setBActionUrl("")
        fetchBroadcastStats()
        setTimeout(() => {
          setIsCreateOpen(false)
          setBroadcastFeedback(null)
        }, 1500)
      } else {
        setBroadcastFeedback({
          type: "error",
          msg: json.message || "Gagal mengirim broadcast.",
        })
      }
    } catch {
      setBroadcastFeedback({
        type: "error",
        msg: "Terjadi kesalahan jaringan saat mengirim broadcast.",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Filtered broadcast history
  const filteredBroadcasts = useMemo(() => {
    const list = broadcastStats?.recentBroadcasts || []
    return list.filter((item) => {
      const title = item.details?.title?.toLowerCase() || ""
      const msg = item.details?.message?.toLowerCase() || ""
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || title.includes(q) || msg.includes(q)

      const matchesCat = filterCategory === "ALL" || item.details?.category === filterCategory
      const matchesSeg = filterSegment === "ALL" || (item.details?.targetSegment || "all") === filterSegment

      return matchesSearch && matchesCat && matchesSeg
    })
  }, [broadcastStats, searchQuery, filterCategory, filterSegment])

  return (
    <AdminPageWrapper className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Radio size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Broadcast
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola riwayat siaran dan buat notifikasi baru ke pengguna.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBroadcastStats}
            disabled={isLoadingBroadcast}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <RefreshCw size={13} className={isLoadingBroadcast ? "animate-spin text-orange-500" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setBroadcastFeedback(null)
              setIsCreateOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Buat Broadcast Baru</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <Inbox size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Notifikasi Terkirim</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
            {isLoadingBroadcast ? "..." : (broadcastStats?.totalSent ?? 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
              <BellRing size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Belum Dibaca Pengguna</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
            {isLoadingBroadcast ? "..." : (broadcastStats?.totalUnread ?? 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
              <Radio size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Siaran Broadcast</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
            {isLoadingBroadcast ? "..." : (broadcastStats?.recentBroadcasts?.length ?? 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari broadcast berdasarkan judul atau isi pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <SlidersHorizontal size={14} />
              <span className="font-semibold">Filter:</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="SYSTEM">Update Sistem & Fitur</option>
              <option value="OPPORTUNITY">Loker & Peluang</option>
              <option value="CAREER">Tips Karier</option>
              <option value="TRACKER">Pengingat Tracker</option>
              <option value="ORDER">Transaksi</option>
              <option value="MEMBERSHIP">Membership</option>
            </select>

            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">Semua Segmen</option>
              <option value="all">Semua Pengguna</option>
              <option value="free">Hanya Free User</option>
              <option value="premium">Hanya Member Lifetime</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List: Daftar Riwayat Broadcast */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers size={16} className="text-orange-500" />
            Daftar Broadcast Terkirim ({filteredBroadcasts.length})
          </h2>
          <span className="text-xs text-slate-400">
            Klik pada baris untuk melihat detail dan pratinjau notifikasi
          </span>
        </div>

        {isLoadingBroadcast ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md ml-auto lg:ml-0" />
                  </div>
                  <Skeleton className="h-5 w-64 rounded-md" />
                  <Skeleton className="h-3.5 w-full max-w-xl rounded-md" />
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-3 w-16 rounded-md ml-auto" />
                    <Skeleton className="h-5 w-20 rounded-md ml-auto" />
                  </div>
                  <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Radio size={28} className="text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
              {searchQuery || filterCategory !== "ALL" || filterSegment !== "ALL"
                ? "Tidak ada broadcast yang cocok dengan filter pencarian."
                : "Belum ada siaran broadcast yang dikirim."}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Plus size={14} />
              <span>Buat Broadcast Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBroadcasts.map((item) => {
              const pStyle = getPriorityStyle(item.details?.priority)
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedBroadcast(item)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-500/50 dark:hover:border-orange-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeStyle(item.details?.category)}`}>
                          {getCategoryLabel(item.details?.category)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pStyle.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                          {getSegmentLabel(item.details?.targetSegment)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {item.details?.title || "Broadcast Notifikasi"}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.details?.message}
                      </p>

                      {item.details?.actionUrl && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          <ExternalLink size={11} />
                          <span className="truncate max-w-md">{item.details.actionUrl}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Meta & CTA Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Penerima
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          {item.details?.recipientCount ?? 0} User
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBroadcast(item)
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Detail & Pratinjau</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* DRAWER 1: BUAT BROADCAST BARU (Slide-in Right) */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Send size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                      Buat Notifikasi Broadcast Baru
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Notifikasi akan langsung masuk ke lonceng dashboard pengguna
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition cursor-pointer shrink-0"
                  aria-label="Tutup panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
                {broadcastFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                      broadcastFeedback.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {broadcastFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{broadcastFeedback.msg}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form id="broadcast-form" onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Judul Notifikasi Pengumuman <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pengumuman Lowongan Baru BUMN Siap Dilamar"
                      value={bTitle}
                      onChange={(e) => setBTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Isi Pesan Notifikasi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tulis pesan lengkap yang informatif dan jelas untuk pengguna..."
                      value={bMessage}
                      onChange={(e) => setBMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Kategori Notifikasi
                      </label>
                      <select
                        value={bCategory}
                        onChange={(e) => setBCategory(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                      >
                        <option value="SYSTEM">SYSTEM (Pembaruan Sistem & Fitur Baru)</option>
                        <option value="OPPORTUNITY">OPPORTUNITY (Loker / Peluang)</option>
                        <option value="CAREER">CAREER (Tips Karier)</option>
                        <option value="TRACKER">TRACKER (Pengingat Lamaran)</option>
                        <option value="ORDER">ORDER (Info Transaksi)</option>
                        <option value="MEMBERSHIP">MEMBERSHIP (Info Paket)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Tingkat Prioritas
                      </label>
                      <select
                        value={bPriority}
                        onChange={(e) => setBPriority(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                      >
                        <option value="INFORMATIONAL">INFORMATIONAL (Biasa / Pengumuman)</option>
                        <option value="IMPORTANT">IMPORTANT (Penting / Info Terbatas)</option>
                        <option value="CRITICAL">CRITICAL (Mendesak / Urgent)</option>
                        <option value="SUCCESS">SUCCESS (Kabar Baik / Reward)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Target Segmen Penerima
                      </label>
                      <select
                        value={bSegment}
                        onChange={(e) => setBSegment(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none text-orange-600 dark:text-orange-400"
                      >
                        <option value="all">Semua Pengguna Terdaftar</option>
                        <option value="free">Hanya Pengguna Gratis (Free User)</option>
                        <option value="premium">Hanya Member Lifetime (Premium)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Tautan Aksi / Link (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: /tracker atau http://localhost:3003/lowongan"
                        value={bActionUrl}
                        onChange={(e) => setBActionUrl(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>
                  </div>
                </form>

                {/* Live Notification Preview Section */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pratinjau Langsung di Lonceng Notifikasi Pengguna
                    </h4>
                  </div>
                  <NotificationPreviewCard
                    title={bTitle}
                    message={bMessage}
                    category={bCategory}
                    priority={bPriority}
                    actionUrl={bActionUrl}
                  />
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="broadcast-form"
                  disabled={isSending || !bTitle.trim() || !bMessage.trim()}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyiarkan...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Siarkan Notifikasi Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER 2: DETAIL BROADCAST & PRATINJAU NOTIFIKASI */}
      <AnimatePresence>
        {selectedBroadcast && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBroadcast(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-xs">
                    <Radio size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                      Detail Riwayat Siaran Broadcast
                    </h3>
                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                      ID: {selectedBroadcast.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBroadcast(null)}
                  className="p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition cursor-pointer shrink-0"
                  aria-label="Tutup panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Penerima
                    </span>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedBroadcast.details?.recipientCount ?? 0} Pengguna
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Target Segmen
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {getSegmentLabel(selectedBroadcast.details?.targetSegment)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Prioritas
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {getPriorityStyle(selectedBroadcast.details?.priority).label}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Kategori
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {getCategoryLabel(selectedBroadcast.details?.category)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Waktu Siaran
                    </span>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(selectedBroadcast.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      IP Pengirim
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedBroadcast.ipAddress || "127.0.0.1"}
                    </p>
                  </div>
                </div>

                {/* Konten Lengkap */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Judul Pengumuman
                  </h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedBroadcast.details?.title || "Tanpa Judul"}
                  </p>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
                    Isi Pesan Lengkap
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedBroadcast.details?.message || "Tidak ada rincian pesan."}
                  </p>
                  {selectedBroadcast.details?.actionUrl && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Tautan Aksi (Action URL)
                      </span>
                      <a
                        href={selectedBroadcast.details.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{selectedBroadcast.details.actionUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Pratinjau Tampilan Notifikasi Pengguna */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pratinjau Bentuk Notifikasi di Dashboard User
                    </h4>
                  </div>
                  <NotificationPreviewCard
                    title={selectedBroadcast.details?.title || ""}
                    message={selectedBroadcast.details?.message || ""}
                    category={selectedBroadcast.details?.category || "OPPORTUNITY"}
                    priority={selectedBroadcast.details?.priority || "INFORMATIONAL"}
                    actionUrl={selectedBroadcast.details?.actionUrl}
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBroadcast(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 transition"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageWrapper>
  )
}
