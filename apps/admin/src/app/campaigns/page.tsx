"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import {
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Megaphone,
  RefreshCw,
  Trophy,
  Target,
  Send,
  BellRing,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Tag,
  ShieldAlert,
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

interface BroadcastHistoryItem {
  id: string
  createdAt: string
  details?: {
    title?: string
    message?: string
    category?: string
    priority?: string
    actionUrl?: string
    targetSegment?: string
    recipientCount?: number
  }
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<"broadcast" | "misi">("broadcast")

  // Broadcast Form State
  const [bTitle, setBTitle] = useState("")
  const [bMessage, setBMessage] = useState("")
  const [bCategory, setBCategory] = useState("OPPORTUNITY")
  const [bPriority, setBPriority] = useState("INFORMATIONAL")
  const [bActionUrl, setBActionUrl] = useState("")
  const [bSegment, setBSegment] = useState("all")
  const [isSending, setIsSending] = useState(false)
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // Broadcast Stats & History
  const [broadcastStats, setBroadcastStats] = useState<{ totalSent: number; totalUnread: number; recentBroadcasts: BroadcastHistoryItem[] } | null>(null)
  const [isLoadingBroadcast, setIsLoadingBroadcast] = useState(false)

  // Misi State
  const [misiList, setMisiList] = useState<Misi[]>([])
  const [isLoadingMisi, setIsLoadingMisi] = useState(false)

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
    fetchBroadcastStats()
    fetchMisi()
  }, [])

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bTitle.trim() || !bMessage.trim() || isSending) return

    setIsSending(true)
    setBroadcastFeedback(null)
    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bTitle.trim(),
          message: bMessage.trim(),
          category: bCategory,
          priority: bPriority,
          actionUrl: bActionUrl.trim() || undefined,
          targetSegment: bSegment,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setBroadcastFeedback({
          type: "success",
          msg: json.message || `Notifikasi berhasil disiarkan ke ${json.recipientCount} pengguna!`,
        })
        setBTitle("")
        setBMessage("")
        setBActionUrl("")
        fetchBroadcastStats()
      } else {
        setBroadcastFeedback({
          type: "error",
          msg: json.message || "Gagal menyiarkan notifikasi.",
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Megaphone size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Campaigns & Broadcast Center
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Siarkan notifikasi instan ke dashboard pengguna atau kelola misi reward.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "broadcast"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <BellRing size={14} />
            Broadcast Notifikasi In-App
          </button>
          <button
            onClick={() => setActiveTab("misi")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "misi"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Trophy size={14} />
            Kelola Misi Cuan
          </button>
        </div>
      </div>

      {/* TAB 1: In-App Broadcast Notification */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Broadcast Composer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Send size={16} className="text-orange-500" />
                  Kirim Notifikasi Broadcast Baru
                </h2>
                <span className="text-[11px] text-slate-400">
                  Langsung muncul di lonceng notifikasi user
                </span>
              </div>

              {broadcastFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    broadcastFeedback.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {broadcastFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{broadcastFeedback.msg}</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                {/* Judul Notifikasi */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Judul Pengumuman / Notifikasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 🚀 Lowongan Baru BUMN Siap Dilamar!"
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                {/* Pesan Notifikasi */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Isi Pesan Notifikasi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tulis pesan lengkap yang informatif dan ramah untuk pengguna..."
                    value={bMessage}
                    onChange={(e) => setBMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                </div>

                {/* Kategori & Prioritas */}
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
                      <option value="OPPORTUNITY">OPPORTUNITY (Peluang / Loker Baru)</option>
                      <option value="CAREER">CAREER (Tips Karier / Persiapan)</option>
                      <option value="TRACKER">TRACKER (Pengingat Lamaran)</option>
                      <option value="ORDER">ORDER (Info Pembelian / Transaksi)</option>
                      <option value="MEMBERSHIP">MEMBERSHIP (Info Akun / Paket)</option>
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

                {/* Target Segmen & Action URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Target Penerima
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
                      Tautan Aksi (Opsional)
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSending || !bTitle.trim() || !bMessage.trim()}
                    className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Menyiarkan ke database pengguna...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Siarkan Notifikasi ke Pengguna Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Live Preview & Broadcast History (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Pratinjau Tampilan di User Dashboard */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles size={14} className="text-orange-500" />
                Pratinjau di Lonceng Dashboard User
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {bCategory}
                  </span>
                  <span className="text-[10px] text-slate-400">Baru saja</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {bTitle || "Judul notifikasi akan tampil di sini..."}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3">
                  {bMessage || "Isi pesan notifikasi yang dikirimkan oleh admin akan tampil di sini..."}
                </p>
                {bActionUrl && (
                  <div className="pt-1.5 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <span>Buka tautan</span>
                    <ExternalLink size={10} />
                  </div>
                )}
              </div>
            </div>

            {/* Riwayat Broadcast Sebelumnya */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers size={13} className="text-orange-500" />
                  Riwayat Siaran Terakhir
                </h3>
                <button
                  type="button"
                  onClick={fetchBroadcastStats}
                  disabled={isLoadingBroadcast}
                  className="text-[11px] text-slate-400 hover:text-orange-500 font-semibold"
                >
                  Refresh
                </button>
              </div>

              {isLoadingBroadcast ? (
                <div className="py-6 text-center text-xs text-slate-400">Memuat riwayat...</div>
              ) : broadcastStats?.recentBroadcasts?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada broadcast yang dikirim.</p>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {broadcastStats?.recentBroadcasts.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {b.details?.title || "Broadcast Notifikasi"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {b.details?.message}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {b.details?.recipientCount || 0} Penerima
                        </span>
                        <span>•</span>
                        <span>Segmen: {b.details?.targetSegment || "all"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Misi Management (Existing Misi Feature) */}
      {activeTab === "misi" && (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                  <TrendingUp size={18} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Misi Aktif</h3>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                {isLoadingMisi ? "..." : activeMisi.length}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                  <Users size={18} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Partisipasi</h3>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                {isLoadingMisi ? "..." : totalSubmissions.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                  <Trophy size={18} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Reward</h3>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                {isLoadingMisi ? "..." : `Rp ${totalRewards.toLocaleString("id-ID")}`}
              </p>
            </div>
          </div>

          {/* Misi List */}
          {isLoadingMisi ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
              Memuat data misi dari database...
            </div>
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
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
        </div>
      )}
    </motion.div>
  )
}
