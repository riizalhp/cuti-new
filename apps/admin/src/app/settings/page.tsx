"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Database, Shield, Globe, Tag, RefreshCw, Check } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pricing settings
  const [priceCvBasic, setPriceCvBasic] = useState(19000)
  const [priceCvPro, setPriceCvPro] = useState(59000)
  const [pricePaketSiapKerja, setPricePaketSiapKerja] = useState(99000)

  // Platform settings
  const [platformName, setPlatformName] = useState("Employr")
  const [platformTagline, setPlatformTagline] = useState("")

  // Referral settings
  const [referralReward, setReferralReward] = useState(2500)
  const [referralMinPayout, setReferralMinPayout] = useState(25000)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (data.success && data.data) {
        const pricing = data.data.pricing || {}
        const platform = data.data.platform || {}
        const referral = data.data.referral || {}

        if (pricing.cv_basic) setPriceCvBasic(Number(pricing.cv_basic))
        if (pricing.cv_pro) setPriceCvPro(Number(pricing.cv_pro))
        if (pricing.paket_siap_kerja) setPricePaketSiapKerja(Number(pricing.paket_siap_kerja))
        if (platform.name) setPlatformName(platform.name)
        if (platform.tagline) setPlatformTagline(platform.tagline)
        if (referral.reward_per_referral) setReferralReward(Number(referral.reward_per_referral))
        if (referral.min_payout) setReferralMinPayout(Number(referral.min_payout))
      }
    } catch (err) {
      setError("Gagal memuat pengaturan dari database")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            pricing: {
              cv_basic: String(priceCvBasic),
              cv_pro: String(priceCvPro),
              paket_siap_kerja: String(pricePaketSiapKerja),
            },
            platform: {
              name: platformName,
              tagline: platformTagline,
            },
            referral: {
              reward_per_referral: String(referralReward),
              min_payout: String(referralMinPayout),
            },
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setError(data.message || "Gagal menyimpan")
      }
    } catch (err) {
      setError("Gagal menyimpan pengaturan")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Pengaturan Sistem & Harga</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Konfigurasi variabel sistem, harga paket membership, dan layanan dari database</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSettings}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-orange-500" : ""} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            {saveSuccess ? (
              <><Check size={18} /> Tersimpan!</>
            ) : (
              <><Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm">
          <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
          Memuat pengaturan dari database...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Membership Pricing */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50">
                <Tag size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Harga Paket Lifetime Membership</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Harga tersimpan di database system_settings</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">CV Siap Lamar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={priceCvBasic}
                    onChange={(e) => setPriceCvBasic(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/30 dark:bg-orange-950/20">
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">CV Profesional (Rekomendasi)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={priceCvPro}
                    onChange={(e) => setPriceCvPro(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Paket Siap Kerja</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={pricePaketSiapKerja}
                    onChange={(e) => setPricePaketSiapKerja(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-navy-50 dark:bg-navy-950/60 text-[#1F3578] dark:text-navy-300 border border-navy-100 dark:border-navy-900/50">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Pengaturan Umum Platform</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Identitas dan meta informasi Employr</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Nama Platform</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Tagline / Deskripsi Platform</label>
                <textarea
                  rows={2}
                  value={platformTagline}
                  onChange={(e) => setPlatformTagline(e.target.value)}
                  placeholder="Platform karir lengkap bagi siswa SMA/SMK dan Mahasiswa Indonesia."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Referral Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Pengaturan Referral & Misi Cuan</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Aturan reward dan batas minimal withdraw</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Reward Per Referral (Rp)</label>
                <input
                  type="number"
                  value={referralReward}
                  onChange={(e) => setReferralReward(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Minimal Payout Referral (Rp)</label>
                <input
                  type="number"
                  value={referralMinPayout}
                  onChange={(e) => setReferralMinPayout(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>

          {/* DB Connection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Infrastruktur System</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Koneksi PostgreSQL & Status Database</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              ✅ Terhubung ke PostgreSQL — Semua pengaturan tersimpan di database system_settings
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
            >
              <Save size={18} />
              {isSaving ? "Menyimpan..." : "Simpan Semua Perubahan"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
