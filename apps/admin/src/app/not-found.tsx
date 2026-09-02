"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ShieldAlert,
  LayoutDashboard,
  ArrowLeft,
  Users,
  FileText,
  Settings,
  BookOpen,
  Cpu,
  ChevronRight,
  Activity,
  AlertTriangle,
} from "lucide-react"

export default function AdminNotFound() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-6">
      {/* Main Alert Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden"
      >
        {/* Subtle Background Accent */}
        <div className="absolute -top-24 right-0 w-80 h-48 bg-amber-500/10 dark:bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3" />
              <span>404 NOT FOUND • MASTER DATA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Modul Admin Tidak Ditemukan
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mb-8">
          Alamat rute atau endpoint yang Anda tuju tidak terdaftar di dalam struktur aplikasi admin, telah dihapus, atau sedang dalam tahap restrukturisasi direktori.
        </p>

        {/* Diagnostic Metadata Box */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-8 font-mono text-xs text-slate-600 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Status Code</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">404 (HTTP Not Found)</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Target Scope</span>
            <span className="font-bold text-slate-900 dark:text-slate-200">Admin Control Plane</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Recommendation</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Kembali ke rute resmi</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition inline-flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Kembali ke Dashboard Utama</span>
          </Link>

          <button
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition inline-flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Halaman Sebelumnya</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Navigation to Admin Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Daftar Modul Admin Aktif
          </h2>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Pintasan Navigasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/users"
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Users & Membership
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kelola pengguna & paket</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/cv"
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  CV Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Template & status CV</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/ai-config"
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                  AI Config & Usage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Token & prompt manager</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/cms"
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  CMS Konten
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Loker, event, artikel</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/logs"
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                  Logs & Security
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Audit trail & insiden</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/settings"
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition">
                  Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Konfigurasi sistem & harga</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  )
}
