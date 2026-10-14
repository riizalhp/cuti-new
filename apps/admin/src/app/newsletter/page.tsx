"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Skeleton } from "@/components/admin/Skeleton"
import {
  Mail,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Users,
  SendHorizontal,
  Flame,
  AlertCircle
} from "lucide-react"

interface Subscriber {
  id: string
  email: string
  name: string | null
  source: string
  is_active: boolean
  token: string
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
}

interface Campaign {
  id: string
  title: string
  subject: string
  content_type: string
  total_recipients: number
  sent_count: number
  failed_count: number
  status: string
  created_at: string
}

interface Stats {
  total: number
  active: number
  inactive: number
  totalCampaigns: number
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalCampaigns: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [isBlasting, setIsBlasting] = useState(false)
  const [blastMessage, setBlastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const fetchNewsletterData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/newsletter/subscribers")
      const json = await res.json()
      if (json.success && json.data) {
        setSubscribers(json.data.subscribers || [])
        if (json.data.stats) setStats(json.data.stats)
        if (json.data.recentCampaigns) setCampaigns(json.data.recentCampaigns)
      }
    } catch (err) {
      console.error("Gagal mengambil data newsletter:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNewsletterData()
  }, [])

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/newsletter/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })
      const json = await res.json()
      if (json.success) {
        fetchNewsletterData()
      } else {
        alert(json.message || "Gagal mengubah status")
      }
    } catch (err) {
      console.error("Error toggle subscriber status:", err)
    }
  }

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Hapus subscriber ${email} secara permanen?`)) return
    try {
      const res = await fetch(`/api/newsletter/subscribers?id=${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (json.success) {
        fetchNewsletterData()
      } else {
        alert(json.message || "Gagal menghapus subscriber")
      }
    } catch (err) {
      console.error("Error delete subscriber:", err)
    }
  }

  const handleManualBlastLatest = async () => {
    if (!confirm("Kirim blast notifikasi artikel artikel terbaru ke semua subscriber aktif sekarang?")) return
    setIsBlasting(true)
    setBlastMessage(null)
    try {
      // Ambil artikel teratas yang published
      const artRes = await fetch("/api/cms/articles")
      const artJson = await artRes.json()
      const articles = artJson.data || []
      const latestPublished = articles.find((a: any) => a.isPublished)

      if (!latestPublished) {
        setBlastMessage({
          text: "Tidak ada artikel dengan status Published yang bisa di-blast.",
          type: "error",
        })
        setIsBlasting(false)
        return
      }

      const blastRes = await fetch("/api/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: latestPublished.id }),
      })
      const blastJson = await blastRes.json()

      if (blastJson.success) {
        setBlastMessage({
          text: `Blast berhasil dikirim untuk artikel "${latestPublished.title}". Terkirim: ${blastJson.result?.sentCount || 0}`,
          type: "success",
        })
        fetchNewsletterData()
      } else {
        setBlastMessage({
          text: blastJson.message || "Gagal mengirim blast newsletter.",
          type: "error",
        })
      }
    } catch (err: any) {
      setBlastMessage({
        text: err?.message || "Terjadi kendala saat mengirim blast.",
        type: "error",
      })
    } finally {
      setIsBlasting(false)
    }
  }

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchSearch =
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? sub.is_active
          : !sub.is_active
      return matchSearch && matchStatus
    })
  }, [subscribers, searchQuery, statusFilter])

  return (
    <AdminPageWrapper>
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-[#1738D1]" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Buletin &amp; Newsletter
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kelola daftar langganan email buletin karier, monitor campaign, dan auto-blast postingan baru.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNewsletterData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>
            <button
              onClick={handleManualBlastLatest}
              disabled={isBlasting || stats.active === 0}
              className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1738D1]/20"
            >
              <Send className={`w-3.5 h-3.5 ${isBlasting ? "animate-spin" : ""}`} />
              <span>{isBlasting ? "Mengirim Blast..." : "Blast Artikel Terkini"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {blastMessage && (
          <div
            className={`p-4 rounded-[10px] text-xs font-medium flex items-center justify-between ${
              blastMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {blastMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{blastMessage.text}</span>
            </div>
            <button
              onClick={() => setBlastMessage(null)}
              className="text-xs font-bold underline cursor-pointer ml-3"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Terdaftar</span>
              <Users className="w-4 h-4 text-[#1738D1]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.total}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Semua pendaftar</span>
          </div>

          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Subscriber Aktif</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.active}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Menerima auto-info email</span>
          </div>

          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Berhenti Langganan</span>
              <XCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.inactive}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Unsubscribed via link email</span>
          </div>

          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Campaign</span>
              <SendHorizontal className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalCampaigns}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Riwayat pengiriman blast</span>
          </div>
        </div>

        {/* Riwayat Campaign Terbaru */}
        {campaigns.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Riwayat Pengiriman Blast Terkini</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">{campaigns.length} Campaign</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">Judul Campaign</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Penerima</th>
                    <th className="py-2.5 px-3">Sukses</th>
                    <th className="py-2.5 px-3">Gagal</th>
                    <th className="py-2.5 px-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-50 text-[#1738D1]">
                          {c.content_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">{c.total_recipients}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{c.sent_count}</td>
                      <td className="py-2.5 px-3 font-bold text-rose-500">{c.failed_count}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(c.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel Subscribers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Daftar Subscriber ({filteredSubscribers.length})
            </h3>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari email / nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-[#1738D1]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-[#1738D1] font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Hanya Aktif</option>
                <option value="INACTIVE">Hanya Berhenti (Unsubscribed)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Sumber</th>
                  <th className="py-3 px-3">Tanggal Daftar</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Memuat daftar subscriber...
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada subscriber yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {sub.email}
                        {sub.name && <span className="block text-[11px] text-slate-400 font-normal">{sub.name}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {sub.source}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(sub.subscribed_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        {sub.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200">
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(sub.id, sub.is_active)}
                            title={sub.is_active ? "Non-aktifkan subscriber" : "Aktifkan kembali subscriber"}
                            className="p-1.5 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                          >
                            {sub.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            title="Hapus subscriber"
                            className="p-1.5 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
