"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  X,
  CheckCircle,
  Clock,
  Send,
  GraduationCap,
  Sparkles
} from "lucide-react"

interface EarlyTester {
  id: string
  name: string
  email: string
  phone_number: string | null
  role_status: string | null
  status: "REGISTERED" | "INVITED" | "ACTIVATED"
  created_at: string
}

interface Stats {
  total: number
  registered: number
  invited: number
  activated: number
  byRole: {
    SMA_SMK: number
    MAHASISWA: number
    FRESH_GRAD: number
    JOB_SEEKER: number
  }
}

const ROLE_LABELS: Record<string, string> = {
  SMA_SMK: "Siswa SMA / SMK",
  MAHASISWA: "Mahasiswa Aktif",
  FRESH_GRAD: "Fresh Graduate",
  JOB_SEEKER: "Pencari Kerja",
}

export default function AdminPreRegisterPage() {
  const [testers, setTesters] = useState<EarlyTester[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    registered: 0,
    invited: 0,
    activated: 0,
    byRole: { SMA_SMK: 0, MAHASISWA: 0, FRESH_GRAD: 0, JOB_SEEKER: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    role_status: "FRESH_GRAD",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTesters = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/early-testers")
      const json = await res.json()
      if (json.success) {
        setTesters(json.data || [])
        if (json.stats) setStats(json.stats)
      }
    } catch (err) {
      console.error("Gagal mengambil data early tester:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTesters()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/early-testers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setTesters((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t))
        )
      }
    } catch (err) {
      console.error("Gagal memperbarui status:", err)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus ${name} dari daftar early tester?`)) return
    try {
      const res = await fetch(`/api/early-testers?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setTesters((prev) => prev.filter((t) => t.id !== id))
        fetchTesters()
      }
    } catch (err) {
      console.error("Gagal menghapus tester:", err)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/early-testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (json.success) {
        setIsAddModalOpen(false)
        setFormData({ name: "", email: "", phone_number: "", role_status: "FRESH_GRAD" })
        fetchTesters()
      } else {
        alert(json.message || "Gagal menambahkan tester")
      }
    } catch (err) {
      console.error("Error submitting tester:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportCSV = () => {
    if (testers.length === 0) return
    const headers = ["Nama", "Email", "Nomor WhatsApp", "Profil Jenjang", "Status", "Waktu Daftar"]
    const rows = filteredTesters.map((t) => [
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.email}"`,
      `"${t.phone_number || "-"}"`,
      `"${ROLE_LABELS[t.role_status || ""] || t.role_status || "-"}"`,
      `"${t.status}"`,
      `"${new Date(t.created_at).toLocaleString("id-ID")}"`,
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `early_testers_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredTesters = useMemo(() => {
    return testers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.phone_number && t.phone_number.includes(searchQuery))
      const matchRole = selectedRole === "ALL" || t.role_status === selectedRole
      const matchStatus = selectedStatus === "ALL" || t.status === selectedStatus
      return matchSearch && matchRole && matchStatus
    })
  }, [testers, searchQuery, selectedRole, selectedStatus])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Manajemen Pre-Register
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Kelola dan pantau daftar pendaftar Early Tester (Free Account Access)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTesters}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-orange-500" : ""} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={exportCSV}
            disabled={testers.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs rounded-xl shadow-md shadow-[#F97316]/20 transition active:scale-98"
          >
            <Plus size={14} />
            <span>Tambah Tester</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pendaftar</span>
            <Users size={18} className="text-[#1738D1]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Slot Tester Aktif</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Status: Registered</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.registered}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Menunggu Undangan Akses</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Status: Invited</span>
            <Send size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.invited}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Undangan Akses Terkirim</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Status: Activated</span>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.activated}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Sudah Mengklaim Akun</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau nomor WhatsApp..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">Semua Profil</option>
            <option value="SMA_SMK">SMA / SMK</option>
            <option value="MAHASISWA">Mahasiswa</option>
            <option value="FRESH_GRAD">Fresh Graduate</option>
            <option value="JOB_SEEKER">Pencari Kerja</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="REGISTERED">Registered</option>
            <option value="INVITED">Invited</option>
            <option value="ACTIVATED">Activated</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nama Pendaftar</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Nomor WhatsApp</th>
                <th className="py-3.5 px-4">Profil Jenjang</th>
                <th className="py-3.5 px-4">Status Whitelist</th>
                <th className="py-3.5 px-4">Waktu Daftar</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-orange-500" />
                    <span>Memuat data pendaftar...</span>
                  </td>
                </tr>
              ) : filteredTesters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data pendaftar early tester yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredTesters.map((tester) => {
                  const cleanWaNumber = tester.phone_number
                    ? tester.phone_number.replace(/[^0-9]/g, "").replace(/^0/, "62")
                    : null

                  return (
                    <tr key={tester.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {tester.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {tester.email && !tester.email.includes("@wa.employr.id") ? (
                          <a
                            href={`mailto:${tester.email}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                          >
                            <Mail size={12} className="text-slate-400" />
                            <span>{tester.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-xs">WhatsApp Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {tester.phone_number ? (
                          <a
                            href={`https://wa.me/${cleanWaNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                          >
                            <Phone size={12} />
                            <span>{tester.phone_number}</span>
                            <ExternalLink size={10} className="opacity-60" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <GraduationCap size={12} className="text-slate-400" />
                          <span>{ROLE_LABELS[tester.role_status || ""] || tester.role_status || "Umum"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={tester.status}
                          onChange={(e) => handleUpdateStatus(tester.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition focus:outline-none ${
                            tester.status === "ACTIVATED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                              : tester.status === "INVITED"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                          }`}
                        >
                          <option value="REGISTERED">Registered</option>
                          <option value="INVITED">Invited</option>
                          <option value="ACTIVATED">Activated</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(tester.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(tester.id, tester.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Hapus Tester"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Tester */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Tambah Early Tester</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama pendaftar..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Aktif</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Profil / Jenjang</label>
                <select
                  value={formData.role_status}
                  onChange={(e) => setFormData({ ...formData, role_status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="SMA_SMK">Siswa SMA / SMK</option>
                  <option value="MAHASISWA">Mahasiswa Aktif</option>
                  <option value="FRESH_GRAD">Fresh Graduate</option>
                  <option value="JOB_SEEKER">Pencari Kerja</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-slate-700 dark:text-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Tester"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
