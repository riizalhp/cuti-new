"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { motion } from "framer-motion"
import { Search, Filter, UserPlus, RefreshCw } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  status: string
  plan: string
  joinedDate: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data)
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "name", header: "Nama Pengguna" },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status Akun",
      render: (user: User) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            user.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {user.status === "Active" ? "Aktif" : "Non-aktif"}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Paket / Status",
      render: (user: User) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            user.plan === "Free User"
              ? "bg-slate-100 text-slate-600 border border-slate-200"
              : "bg-orange-50 text-orange-700 border border-orange-200"
          }`}
        >
          {user.plan}
        </span>
      ),
    },
    { key: "joinedDate", header: "Tanggal Bergabung" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Kelola dan pantau seluruh pengguna terdaftar via Database API</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-orange-500" : ""} />
            Refresh
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            <UserPlus size={18} />
            Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm">
          <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
          Memuat data pengguna dari database API...
        </div>
      ) : (
        <DataTable data={filteredUsers} columns={columns} />
      )}
    </motion.div>
  )
}

