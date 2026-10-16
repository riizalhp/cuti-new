"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Skeleton } from "@/components/admin/Skeleton"
import {
  CalendarDays,
  Search,
  RefreshCw,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  User,
  Filter,
  X,
  FileText,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Save,
  Check
} from "lucide-react"

export type InquiryType = "EVENT_KAMPUS" | "JOB_FAIR" | "IKLAN_SPONSOR" | "LAINNYA"
export type InquiryStatus = "BARU" | "DIHUBUNGI" | "DISETUJUI" | "DITOLAK" | "SELESAI"

export interface PartnerInquiryItem {
  id: string
  ticket_code: string
  pic_name: string
  institution_name: string
  pic_email: string
  pic_phone: string
  inquiry_type: InquiryType
  event_title: string
  event_date?: string
  proposal_url?: string
  message: string
  status: InquiryStatus
  created_at: string
  updated_at: string
  admin_notes?: string
}

interface Stats {
  total: number
  baru: number
  dihubungi: number
  disetujui: number
  selesai: number
  ditolak: number
}

const TYPE_CONFIG: Record<InquiryType, { label: string; badgeClass: string }> = {
  EVENT_KAMPUS: {
    label: "Event Kampus",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  JOB_FAIR: {
    label: "Job Fair",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  IKLAN_SPONSOR: {
    label: "Pasang Iklan",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  LAINNYA: {
    label: "Kemitraan Lain",
    badgeClass: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
}

const STATUS_CONFIG: Record<InquiryStatus, { label: string; bg: string; text: string; border: string }> = {
  BARU: {
    label: "Baru Masuk",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  DIHUBUNGI: {
    label: "Sedang Dihubungi",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  DISETUJUI: {
    label: "Disetujui / Tayang",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  SELESAI: {
    label: "Selesai",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
  },
  DITOLAK: {
    label: "Ditolak / Batal",
    bg: "bg-rose-50 dark:bg-rose-950/60",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
}

export default function AdminKemitraanPage() {
  const [inquiries, setInquiries] = useState<PartnerInquiryItem[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    baru: 0,
    dihubungi: 0,
    disetujui: 0,
    selesai: 0,
    ditolak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Selected item for drawer
  const [selectedItem, setSelectedItem] = useState<PartnerInquiryItem | null>(null)
  const [editStatus, setEditStatus] = useState<InquiryStatus>("BARU")
  const [editNotes, setEditNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/partner-inquiries")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setInquiries(json.data)
        if (json.stats) {
          setStats(json.stats)
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data kemitraan:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  // Sinkronisasi modal state saat memilih item
  useEffect(() => {
    if (selectedItem) {
      setEditStatus(selectedItem.status)
      setEditNotes(selectedItem.admin_notes || "")
      setSaveSuccess(false)
    }
  }, [selectedItem])

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      const matchType = typeFilter === "all" || item.inquiry_type === typeFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        item.ticket_code.toLowerCase().includes(q) ||
        item.pic_name.toLowerCase().includes(q) ||
        item.institution_name.toLowerCase().includes(q) ||
        item.event_title.toLowerCase().includes(q) ||
        item.pic_email.toLowerCase().includes(q) ||
        item.pic_phone.toLowerCase().includes(q)

      return matchStatus && matchType && matchSearch
    })
  }, [inquiries, statusFilter, typeFilter, search])

  const handleSaveStatus = async () => {
    if (!selectedItem) return
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/partner-inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          status: editStatus,
          admin_notes: editNotes,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        // Update local list
        setInquiries((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? json.data : i))
        )
        setSelectedItem(json.data)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2500)
        // Refresh stats
        fetchInquiries()
      }
    } catch (err) {
      console.error("Gagal menyimpan perubahan status:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Format link WhatsApp dengan pesan sopan dan profesional
  const getWhatsAppLink = (item: PartnerInquiryItem) => {
    const cleanPhone = item.pic_phone.replace(/[^0-9]/g, "").replace(/^0/, "62")
    const msg = encodeURIComponent(
      `Halo Kak ${item.pic_name}, salam hangat dari tim kemitraan Employr (ambilcuti.id).\n\nKami telah menerima permohonan kemitraan event "${item.event_title}" dari ${item.institution_name} (No. Tiket: #${item.ticket_code}).\n\nApakah Kak ${item.pic_name} ada waktu luang untuk kami hubungi terkait detail dan jadwal publikasinya? Terima kasih!`
    )
    return `https://wa.me/${cleanPhone}?text=${msg}`
  }

  // Format link Mailto dengan subjek dan salam ramah
  const getMailtoLink = (item: PartnerInquiryItem) => {
    const subject = encodeURIComponent(
      `[Employr] Tindak Lanjut Pengajuan Kemitraan: ${item.event_title} (#${item.ticket_code})`
    )
    const body = encodeURIComponent(
      `Halo Kak ${item.pic_name},\n\nTerima kasih telah mengajukan kemitraan untuk agenda "${item.event_title}" dari ${item.institution_name} melalui portal Employr.\n\nPengajuan ini telah tercatat di sistem kami dengan nomor tiket #${item.ticket_code}.\n\nKami ingin mengonfirmasi beberapa detail terkait publikasi event tersebut...\n\nSalam hangat,\nTim Kemitraan & Event Employr\nhttps://ambilcuti.id`
    )
    return `mailto:${item.pic_email}?subject=${subject}&body=${body}`
  }

  return (
    <AdminPageWrapper>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-[#1738D1] dark:text-blue-400">
                  <CalendarDays size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                  Kemitraan & Event Kampus
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kelola permohonan publikasi event kampus, job fair, dan pemasangan iklan terkurasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInquiries()}
              disabled={loading}
              className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Segarkan Data</span>
            </button>
            <a
              href="http://localhost:3003/kemitraan#mitra-event"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>Lihat Halaman Publik</span>
            </a>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Pengajuan</span>
              <Building2 size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.total}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Seluruh mitra & event masuk</p>
          </div>

          <div className="p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-xs bg-amber-50/20">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Menunggu Tinjauan</span>
              <Clock size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.baru}
            </div>
            <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70 mt-1">Perlu segera direspons</p>
          </div>

          <div className="p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-xs bg-blue-50/20">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Sedang Dihubungi</span>
              <Send size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.dihubungi}
            </div>
            <p className="text-[11px] text-blue-700/70 dark:text-blue-400/70 mt-1">Dalam proses koordinasi</p>
          </div>

          <div className="p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 shadow-xs bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Disetujui / Tayang</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.disetujui}
            </div>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 mt-1">Aktif di kalender portal</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nomor tiket, nama PIC, institusi kampus, atau judul event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
            >
              <option value="all">Semua Status</option>
              <option value="BARU">Baru Masuk</option>
              <option value="DIHUBUNGI">Sedang Dihubungi</option>
              <option value="DISETUJUI">Disetujui / Tayang</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
            >
              <option value="all">Semua Kategori</option>
              <option value="EVENT_KAMPUS">Event Kampus</option>
              <option value="JOB_FAIR">Job Fair</option>
              <option value="IKLAN_SPONSOR">Pasang Iklan</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tiket & Tanggal</th>
                  <th className="py-3 px-4">Institusi & PIC</th>
                  <th className="py-3 px-4">Judul Acara / Program</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat (Hubungi)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="py-4 px-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <CalendarDays size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum ada pengajuan kemitraan</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {search || statusFilter !== "all" || typeFilter !== "all"
                          ? "Tidak ditemukan data yang sesuai dengan filter pencarian kamu."
                          : "Pengajuan dari form publik akan otomatis muncul di sini."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((item) => {
                    const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.BARU
                    const typeConf = TYPE_CONFIG[item.inquiry_type] || TYPE_CONFIG.EVENT_KAMPUS
                    const cleanPhone = item.pic_phone.replace(/[^0-9]/g, "").replace(/^0/, "62")

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* Tiket & Waktu */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            #{item.ticket_code}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Institusi & PIC */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {item.institution_name}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <User size={11} className="text-slate-400" />
                            <span>{item.pic_name}</span>
                          </div>
                        </td>

                        {/* Judul Acara */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs">
                            {item.event_title}
                          </div>
                          {item.event_date && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Tgl: {item.event_date}
                            </span>
                          )}
                        </td>

                        {/* Kategori */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-[10px] text-[10px] font-bold border ${typeConf.badgeClass}`}
                          >
                            {typeConf.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Aksi Cepat Hubungi (WA, Email, Detail) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol WhatsApp (1-Klik Langsung Chat) */}
                            <a
                              href={getWhatsAppLink(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Chat WhatsApp: ${item.pic_phone}`}
                              className="px-2.5 py-1.5 rounded-[10px] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition active:scale-95 shadow-2xs"
                            >
                              <Phone size={12} className="text-emerald-600" />
                              <span>WA</span>
                            </a>

                            {/* Tombol Email (1-Klik Langsung Mailto) */}
                            <a
                              href={getMailtoLink(item)}
                              title={`Kirim Email: ${item.pic_email}`}
                              className="px-2.5 py-1.5 rounded-[10px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 flex items-center gap-1 transition active:scale-95 shadow-2xs"
                            >
                              <Mail size={12} className="text-blue-600" />
                              <span>Email</span>
                            </a>

                            {/* Tombol Detail & Kelola Status */}
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="px-2.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer active:scale-95"
                            >
                              <span>Detail</span>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT-HAND SLIDE-IN DRAWER DETAIL & UPDATE STATUS */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative z-10 w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1738D1] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-[8px]">
                        #{selectedItem.ticket_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] border ${
                          STATUS_CONFIG[selectedItem.status]?.bg || ""
                        } ${STATUS_CONFIG[selectedItem.status]?.text || ""}`}
                      >
                        {STATUS_CONFIG[selectedItem.status]?.label || selectedItem.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {selectedItem.event_title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Body (Scrollable) */}
                <div className="p-5 overflow-y-auto space-y-5 text-xs">
                  {/* Banner Hubungi Langsung */}
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Hubungi PIC Secara Cepat:</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{selectedItem.pic_name} ({selectedItem.pic_phone})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppLink(selectedItem)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2"
                      >
                        <Phone size={13} />
                        <span>Chat WA</span>
                      </a>
                      <a
                        href={getMailtoLink(selectedItem)}
                        className="px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs focus-visible:outline-2 focus-visible:outline-[#1738D1] focus-visible:outline-offset-2"
                      >
                        <Mail size={13} />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Rincian Institusi & PIC */}
                  <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Informasi Pemohon
                    </h4>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-[10px]">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Institusi / Kampus:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.institution_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nama PIC:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.pic_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Email:</span>
                        <a href={`mailto:${selectedItem.pic_email}`} className="text-[#1738D1] hover:underline font-mono">
                          {selectedItem.pic_email}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">WhatsApp:</span>
                        <span className="font-mono font-bold text-emerald-600">{selectedItem.pic_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detail Acara & Tanggal */}
                  <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Detail Kemitraan & Event
                    </h4>
                    <div className="space-y-2 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Kategori:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {TYPE_CONFIG[selectedItem.inquiry_type]?.label || selectedItem.inquiry_type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Tanggal Pelaksanaan:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedItem.event_date || "Belum ditentukan"}
                        </span>
                      </div>
                      {selectedItem.proposal_url && (
                        <div className="pt-1 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                          <span className="text-slate-400">Tautan Proposal:</span>
                          <a
                            href={selectedItem.proposal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#1738D1] font-bold hover:underline"
                          >
                            <span>Buka Proposal</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pesan Pemohon */}
                  <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pesan / Kebutuhan Kerja Sama
                    </h4>
                    <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.message || "(Tidak ada pesan tambahan)"}
                    </div>
                  </div>

                  {/* Form Update Status & Catatan Admin */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Kelola Status & Catatan Internal
                    </h4>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Ubah Status Tiket:
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
                        className="w-full px-3 py-2 text-xs rounded-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                      >
                        <option value="BARU">Baru Masuk</option>
                        <option value="DIHUBUNGI">Sedang Dihubungi</option>
                        <option value="DISETUJUI">Disetujui / Tayang</option>
                        <option value="SELESAI">Selesai</option>
                        <option value="DITOLAK">Ditolak / Batal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Catatan Admin (Internal Only):
                      </label>
                      <textarea
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Catatan hasil pembicaraan, tanggal tayang kalender, syarat proposal, dll."
                        className="w-full px-3 py-2 text-xs rounded-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1738D1] placeholder-slate-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Action */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
                  <div>
                    {saveSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check size={14} /> Berhasil disimpan!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="px-3.5 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition"
                    >
                      Tutup
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStatus}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#1738D1]/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminPageWrapper>
  )
}
