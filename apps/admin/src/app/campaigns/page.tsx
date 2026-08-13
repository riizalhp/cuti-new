"use client"

import { motion } from "framer-motion"
import { Plus, Calendar, Users, TrendingUp, Megaphone } from "lucide-react"

interface Campaign {
  id: string
  name: string
  status: "Active" | "Scheduled" | "Completed"
  startDate: string
  endDate: string
  participants: number
  conversion: string
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Promo Membership Siap Kerja 2026",
    status: "Active",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    participants: 1250,
    conversion: "12.5%",
  },
  {
    id: "2",
    name: "Peluncuran Misi Cuan Mahasiswa",
    status: "Completed",
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    participants: 892,
    conversion: "8.3%",
  },
  {
    id: "3",
    name: "Special Referral Bonus Rp2.500",
    status: "Scheduled",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    participants: 0,
    conversion: "0%",
  },
]

export default function CampaignsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Megaphone size={24} className="text-orange-500" />
            Manajemen Kampanye & Promo
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Buat dan pantau efektivitas kampanye promosi</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
          <Plus size={18} />
          Buat Kampanye Baru
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
              <TrendingUp size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kampanye Aktif</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            {mockCampaigns.filter((c) => c.status === "Active").length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <Calendar size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tergendala / Jadwal</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            {mockCampaigns.filter((c) => c.status === "Scheduled").length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
              <Users size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Partisipan</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            {mockCampaigns.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {mockCampaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">{campaign.name}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      campaign.status === "Active"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : campaign.status === "Scheduled"
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {campaign.status === "Active" ? "Aktif" : campaign.status === "Scheduled" ? "Terjadwal" : "Selesai"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tanggal Mulai</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{campaign.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tanggal Selesai</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{campaign.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Jumlah Peserta</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{campaign.participants.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Konversi</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{campaign.conversion}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
