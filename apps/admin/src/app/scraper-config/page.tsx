"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Skeleton } from "@/components/admin/Skeleton"
import {
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Check,
  Layers,
  Sparkles,
  Server,
  Eye,
  EyeOff,
  Edit3,
  X,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Globe,
  ShieldCheck,
  Info,
  Loader2,
  ExternalLink,
  ChevronDown,
  BookOpen,
  Key,
  Copy,
  CheckCheck,
  History,
  User,
  Clock,
  AlertCircle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

interface ScraperProvider {
  id: string
  provider: "apify" | "rapidapi" | "scrapingdog" | "linkdapi" | "brightdata" | string
  label: string
  api_key: string
  extra_config?: Record<string, any>
  priority: number
  is_active: boolean
  status: "active" | "cooldown" | "exhausted" | "error"
  requests_total: number
  requests_month: number
  success_count: number
  fail_count: number
  last_used_at?: string | null
  last_error?: string | null
  created_at: string
}

interface ScraperLog {
  id: string
  provider_id: string
  provider_name: string
  provider_label: string
  user_id?: string | null
  user_name?: string | null
  user_email?: string | null
  target_url: string
  target_name?: string | null
  status: "SUCCESS" | "FAILED" | "EXHAUSTED" | "RATE_LIMITED" | string
  http_status?: number | null
  latency_ms?: number | null
  error_message?: string | null
  created_at: string
}

interface DailyTrendItem {
  date: string
  day: string
  fullDate: string
  total: number
  success: number
  failed: number
  avgLatency: number
}

interface ScraperStatsData {
  dailyTrend: DailyTrendItem[]
  summary: {
    totalRequests14d: number
    totalSuccess14d: number
    totalFailed14d: number
    successRate: number
  }
}

interface ProviderMeta {
  name: string
  badge: string
  color: string
  bgColor: string
  borderColor: string
  freeTierInfo: string
  tokenLabel: string
  tokenPlaceholder: string
  tokenUrl: string
  guideUrl: string
  defaultParams: Record<string, string>
  steps: Array<{
    title: string
    desc: string
    copyValue?: string
  }>
  tips: string
}

const PROVIDER_METADATA: Record<string, ProviderMeta> = {
  apify: {
    name: "Apify",
    badge: "$5/Bulan Gratis",
    color: "#00E096",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-800/60",
    freeTierInfo: "$5 kredit gratis / bulan (Reset otomatis tiap tanggal 1)",
    tokenLabel: "Apify Personal API Token",
    tokenPlaceholder: "apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    tokenUrl: "https://console.apify.com/account/integrations",
    guideUrl: "https://console.apify.com/",
    defaultParams: {
      actor_id: "curious_coder/linkedin-profile-scraper",
    },
    steps: [
      {
        title: "1. Daftar / Login di Apify Console",
        desc: "Kunjungi console.apify.com dan buat akun gratis (bisa menggunakan opsi login cepat Google atau GitHub).",
      },
      {
        title: "2. Buka Pengaturan Integrasi & API Token",
        desc: "Buka menu Settings > Integrations, lalu salin 'Personal API token' Anda (biasanya diawali apify_api_).",
      },
      {
        title: "3. Tentukan Actor ID LinkedIn",
        desc: "Gunakan Actor LinkedIn terpopuler dari Apify Store: curious_coder/linkedin-profile-scraper.",
        copyValue: "curious_coder/linkedin-profile-scraper",
      },
      {
        title: "4. Masukkan ke Form & Simpan",
        desc: "Tempelkan token ke kolom 'API Key / Token' dan klik Simpan Provider.",
      },
    ],
    tips: "Setiap akun gratis Apify mendapatkan $5 kredit setiap bulan (cukup untuk ~500 - 1.000 scrape profil). Anda bisa mendaftarkan beberapa akun email berbeda untuk memperluas kuota gratis via sistem fallback!",
  },
  rapidapi: {
    name: "RapidAPI",
    badge: "50-100 Req/Bulan",
    color: "#0055FF",
    bgColor: "bg-blue-950/40",
    borderColor: "border-blue-800/60",
    freeTierInfo: "50–100 request gratis / bulan per akun (Fresh LinkedIn Profile Data)",
    tokenLabel: "RapidAPI Key (X-RapidAPI-Key)",
    tokenPlaceholder: "c95e8... atau key 50 karakter",
    tokenUrl: "https://rapidapi.com/developer/dashboard",
    guideUrl: "https://rapidapi.com/hub",
    defaultParams: {
      host: "fresh-linkedin-profile-data.p.rapidapi.com",
    },
    steps: [
      {
        title: "1. Buka RapidAPI Hub & Login",
        desc: "Buka rapidapi.com/hub dan masuk ke akun RapidAPI Anda.",
      },
      {
        title: "2. Cari & Subscribe API LinkedIn",
        desc: "Cari API 'Fresh LinkedIn Profile Data' di search bar. Klik 'Subscribe to Test' dan pilih paket Basic (Free).",
      },
      {
        title: "3. Ambil X-RapidAPI-Key & Host",
        desc: "Pada tab Endpoints, salin nilai header X-RapidAPI-Key Anda dan pastikan Host terisi.",
        copyValue: "fresh-linkedin-profile-data.p.rapidapi.com",
      },
      {
        title: "4. Tempelkan ke Form Employr",
        desc: "Masukkan API Key dan Host ke dalam form input di bawah ini.",
      },
    ],
    tips: "Host default adalah fresh-linkedin-profile-data.p.rapidapi.com. Jika menggunakan provider API LinkedIn lain di RapidAPI, Anda cukup menyesuaikan field Host.",
  },
  scrapingdog: {
    name: "Scrapingdog",
    badge: "1.000 Credits Trial",
    color: "#F97316",
    bgColor: "bg-orange-950/40",
    borderColor: "border-orange-800/60",
    freeTierInfo: "1.000 credits gratis saat registrasi awal",
    tokenLabel: "Scrapingdog API Key",
    tokenPlaceholder: "65b9... atau API key dari dashboard",
    tokenUrl: "https://api.scrapingdog.com/dashboard",
    guideUrl: "https://www.scrapingdog.com/",
    defaultParams: {},
    steps: [
      {
        title: "1. Daftar di Scrapingdog",
        desc: "Kunjungi scrapingdog.com dan buat akun baru dengan verifikasi email.",
      },
      {
        title: "2. Dapatkan 1.000 Credits Gratis",
        desc: "Akun baru otomatis mendapatkan saldo 1.000 request credits instan.",
      },
      {
        title: "3. Salin API Key dari Dashboard",
        desc: "Masuk ke Scrapingdog Dashboard, salin 'API Key' yang tertera pada bagian atas.",
      },
      {
        title: "4. Simpan ke Pool",
        desc: "Tempelkan API Key di form. Scrapingdog menggunakan proxy residensial otomatis tanpa parameter rumit tambahan.",
      },
    ],
    tips: "Scrapingdog sangat handal untuk menembus authwall LinkedIn dengan proxy rotasi bawaan mereka.",
  },
  linkdapi: {
    name: "LinkdAPI",
    badge: "100 Credits Trial",
    color: "#8B5CF6",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-800/60",
    freeTierInfo: "100 credits gratis saat pendaftaran",
    tokenLabel: "LinkdAPI API Key",
    tokenPlaceholder: "linkd_live_... atau token akun",
    tokenUrl: "https://linkdapi.com/dashboard",
    guideUrl: "https://linkdapi.com/",
    defaultParams: {},
    steps: [
      {
        title: "1. Buat Akun di LinkdAPI",
        desc: "Akses linkdapi.com dan daftar akun developer baru.",
      },
      {
        title: "2. Masuk ke Dashboard Developer",
        desc: "Buka menu API Keys pada dashboard akun LinkdAPI Anda.",
      },
      {
        title: "3. Salin API Key Aktif",
        desc: "Salin token otentikasi Anda yang tersedia di tab API Keys.",
      },
      {
        title: "4. Masukkan ke Sistem Employr",
        desc: "Tempelkan ke form input API Key dan tentukan prioritas eksekusi.",
      },
    ],
    tips: "LinkdAPI merespons format JSON bersih yang sangat cepat dengan data pengalaman dan keahlian yang terstruktur.",
  },
  brightdata: {
    name: "Bright Data",
    badge: "5.000 Trial Credits",
    color: "#EC4899",
    bgColor: "bg-pink-950/40",
    borderColor: "border-pink-800/60",
    freeTierInfo: "5.000 credits trial untuk scraping dataset publik",
    tokenLabel: "Bright Data API Token",
    tokenPlaceholder: "API Bearer Token dari Bright Data Settings",
    tokenUrl: "https://brightdata.com/cp/setting/tokens",
    guideUrl: "https://brightdata.com/",
    defaultParams: {
      dataset_id: "gd_l1viktl72bvl7bjuj0",
    },
    steps: [
      {
        title: "1. Daftar di Bright Data",
        desc: "Kunjungi brightdata.com dan buka akun (tersedia trial dataset credits).",
      },
      {
        title: "2. Generate API Token",
        desc: "Buka Account Settings > API Tokens > Add Token, lalu salin Bearer Token.",
      },
      {
        title: "3. Tentukan Dataset ID LinkedIn",
        desc: "Gunakan LinkedIn Profiles Dataset ID standar: gd_l1viktl72bvl7bjuj0.",
        copyValue: "gd_l1viktl72bvl7bjuj0",
      },
      {
        title: "4. Simpan ke Pool Employr",
        desc: "Masukkan API Token dan Dataset ID ke dalam form.",
      },
    ],
    tips: "Bright Data memiliki infrastruktur proxy residensial terbesar dan cocok untuk volume scraping tinggi.",
  },
}

export default function ScraperConfigPage() {
  const [providers, setProviders] = useState<ScraperProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; latencyMs?: number; message?: string }>>({})

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const now = new Date()
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  const diffMs = nextMonth.getTime() - now.getTime()
  const resetDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const resetHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const resetInfo = { days: resetDays, hours: resetHours }
  const [editingProvider, setEditingProvider] = useState<ScraperProvider | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Toast Notification State
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // Panduan Tab State (di halaman utama)
  const [activeGuideTab, setActiveGuideTab] = useState<string>("apify")
  const [copiedGuideParam, setCopiedGuideParam] = useState<string | null>(null)

  // Form Fields
  const [formProvider, setFormProvider] = useState<string>("apify")
  const [formLabel, setFormLabel] = useState("")
  const [formApiKey, setFormApiKey] = useState("")
  const [formPriority, setFormPriority] = useState<number>(1)
  const [formIsActive, setFormIsActive] = useState(true)
  const [formActorId, setFormActorId] = useState("curious_coder/linkedin-profile-scraper")
  const [formHost, setFormHost] = useState("fresh-linkedin-profile-data.p.rapidapi.com")
  const [formDatasetId, setFormDatasetId] = useState("gd_l1viktl72bvl7bjuj0")

  // Detail & Log Drawer State
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [selectedDetailProvider, setSelectedDetailProvider] = useState<ScraperProvider | null>(null)
  const [providerLogs, setProviderLogs] = useState<ScraperLog[]>([])
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [logFilterStatus, setLogFilterStatus] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL")

  // Chart & Usage Analytics State
  const [statsData, setStatsData] = useState<ScraperStatsData | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(false)

  // Fetch Usage Stats for Chart
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true)
      const res = await fetch("/api/scraper-providers/stats")
      const json = await res.json()
      if (json.success && json.data) {
        setStatsData(json.data)
      }
    } catch (err) {
      console.error("Gagal memuat statistik penggunaan scraper:", err)
    } finally {
      setIsStatsLoading(false)
    }
  }

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close drawer on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false)
        } else if (isDetailDrawerOpen) {
          setIsDetailDrawerOpen(false)
        } else if (isDrawerOpen) {
          setIsDrawerOpen(false)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDrawerOpen, isDropdownOpen, isDetailDrawerOpen])

  // Fetch Provider Logs
  const fetchProviderLogs = async (providerId: string, status: "ALL" | "SUCCESS" | "FAILED" = logFilterStatus) => {
    try {
      setIsLogsLoading(true)
      const res = await fetch(`/api/scraper-providers/${providerId}/logs?status=${status}&limit=100`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setProviderLogs(json.data)
      } else {
        setProviderLogs([])
      }
    } catch (err) {
      console.error("Gagal memuat log provider:", err)
      showToast("error", "Gagal memuat riwayat log penggunaan")
    } finally {
      setIsLogsLoading(false)
    }
  }

  // Open Detail Drawer
  const handleOpenDetailDrawer = (p: ScraperProvider) => {
    setSelectedDetailProvider(p)
    setLogFilterStatus("ALL")
    setIsDetailDrawerOpen(true)
    fetchProviderLogs(p.id, "ALL")
  }

  // Change Log Filter
  const handleFilterChange = (status: "ALL" | "SUCCESS" | "FAILED") => {
    setLogFilterStatus(status)
    if (selectedDetailProvider) {
      fetchProviderLogs(selectedDetailProvider.id, status)
    }
  }

  // Fetch Providers
  const fetchProviders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/scraper-providers")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setProviders(json.data)
      }
    } catch (err) {
      console.error("Gagal memuat provider scraper:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
    fetchStats()
  }, [])

  // Open Create Drawer
  const handleOpenCreateDrawer = () => {
    setEditingProvider(null)
    setFormProvider("apify")
    setFormLabel("Apify Akun 1")
    setFormApiKey("")
    setFormPriority(providers.length + 1)
    setFormIsActive(true)
    setFormActorId("curious_coder/linkedin-profile-scraper")
    setFormHost("fresh-linkedin-profile-data.p.rapidapi.com")
    setFormDatasetId("gd_l1viktl72bvl7bjuj0")
    setShowApiKey(false)
    setIsDropdownOpen(false)
    setIsDrawerOpen(true)
  }

  // Open Edit Drawer
  const handleOpenEditDrawer = (p: ScraperProvider) => {
    setEditingProvider(p)
    setFormProvider(p.provider)
    setFormLabel(p.label)
    setFormApiKey(p.api_key)
    setFormPriority(p.priority)
    setFormIsActive(p.is_active)
    const extra = p.extra_config || {}
    setFormActorId(extra.actor_id || "curious_coder/linkedin-profile-scraper")
    setFormHost(extra.host || "fresh-linkedin-profile-data.p.rapidapi.com")
    setFormDatasetId(extra.dataset_id || "gd_l1viktl72bvl7bjuj0")
    setShowApiKey(false)
    setIsDropdownOpen(false)
    setIsDrawerOpen(true)
  }

  // Select provider from custom dropdown
  const handleSelectProvider = (key: string) => {
    setFormProvider(key)
    setIsDropdownOpen(false)
    if (!editingProvider) {
      const nextNum = providers.filter((p) => p.provider === key).length + 1
      setFormLabel(`${PROVIDER_METADATA[key]?.name || key} Akun ${nextNum}`)
    }
    if (key === "apify") setFormActorId("curious_coder/linkedin-profile-scraper")
    if (key === "rapidapi") setFormHost("fresh-linkedin-profile-data.p.rapidapi.com")
    if (key === "brightdata") setFormDatasetId("gd_l1viktl72bvl7bjuj0")
  }

  // Copy guide parameter on main page
  const handleCopyGuideParam = (val: string, label: string) => {
    navigator.clipboard.writeText(val)
    setCopiedGuideParam(label)
    setTimeout(() => setCopiedGuideParam(null), 2000)
  }

  // Save (Create or Update)
  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formLabel || !formApiKey) {
      showToast("error", "Label akun dan API Key wajib diisi.")
      return
    }

    setIsSaving(true)
    try {
      const extra_config: Record<string, any> = {}
      if (formProvider === "apify") {
        extra_config.actor_id = formActorId || "curious_coder/linkedin-profile-scraper"
      } else if (formProvider === "rapidapi") {
        extra_config.host = formHost || "fresh-linkedin-profile-data.p.rapidapi.com"
      } else if (formProvider === "brightdata") {
        extra_config.dataset_id = formDatasetId || "gd_l1viktl72bvl7bjuj0"
      }

      if (editingProvider) {
        // Update
        const res = await fetch(`/api/scraper-providers/${editingProvider.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: formLabel,
            api_key: formApiKey,
            priority: formPriority,
            is_active: formIsActive,
            extra_config,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setIsDrawerOpen(false)
          showToast("success", `Konfigurasi akun "${formLabel}" berhasil diperbarui.`)
          fetchProviders()
        } else {
          showToast("error", data.error || "Gagal memperbarui provider.")
        }
      } else {
        // Create
        const res = await fetch("/api/scraper-providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: formProvider,
            label: formLabel,
            api_key: formApiKey,
            priority: formPriority,
            is_active: formIsActive,
            extra_config,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setIsDrawerOpen(false)
          showToast("success", `Akun "${formLabel}" berhasil ditambahkan ke pool!`)
          fetchProviders()
        } else {
          showToast("error", data.error || "Gagal menambahkan provider.")
        }
      }
    } catch (err: any) {
      showToast("error", "Error: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Provider
  const handleDeleteProvider = async (id: string, label: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun scraper "${label}"?`)) return
    try {
      const res = await fetch(`/api/scraper-providers/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showToast("success", `Akun "${label}" berhasil dihapus dari pool.`)
        fetchProviders()
      } else {
        showToast("error", "Gagal menghapus: " + data.error)
      }
    } catch (err: any) {
      showToast("error", "Error: " + err.message)
    }
  }

  // Toggle Active Switch
  const handleToggleActive = async (p: ScraperProvider) => {
    try {
      const res = await fetch(`/api/scraper-providers/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !p.is_active }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("info", !p.is_active ? `Akun "${p.label}" diaktifkan di pool.` : `Akun "${p.label}" dinonaktifkan.`)
        setProviders((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, is_active: !item.is_active } : item))
        )
      }
    } catch (err) {
      console.error("Gagal toggle status:", err)
    }
  }

  // Move Priority Up/Down (Reorder)
  const handleMovePriority = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === providers.length - 1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    const current = providers[index]
    const target = providers[targetIndex]

    const updatedItems = [
      { id: current.id, priority: target.priority },
      { id: target.id, priority: current.priority },
    ]

    // Optimistic UI update
    const newProviders = [...providers]
    newProviders[index] = { ...target, priority: current.priority }
    newProviders[targetIndex] = { ...current, priority: target.priority }
    newProviders.sort((a, b) => a.priority - b.priority)
    setProviders(newProviders)

    try {
      await fetch("/api/scraper-providers/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      })
      showToast("success", "Urutan fallback prioritas berhasil diperbarui.")
    } catch (err) {
      console.error("Gagal menyimpan urutan:", err)
      fetchProviders()
    }
  }

  // Live Test Provider Connection
  const handleTestProvider = async (id: string) => {
    setTestingId(id)
    try {
      const res = await fetch(`/api/scraper-providers/${id}/test`, { method: "POST" })
      const data = await res.json()
      setTestResult((prev) => ({
        ...prev,
        [id]: {
          success: data.success,
          latencyMs: data.latencyMs,
          message: data.message || (data.success ? "Koneksi Berhasil!" : "Gagal Terhubung"),
        },
      }))
      if (data.success) {
        showToast("success", `Uji koneksi berhasil (${data.latencyMs}ms).`)
      } else {
        showToast("error", `Uji koneksi gagal: ${data.message || "Endpoint tidak merespons"}`)
      }
      fetchProviders()
      fetchStats()
      if (selectedDetailProvider && selectedDetailProvider.id === id) {
        fetchProviderLogs(id, logFilterStatus)
      }
    } catch (err: any) {
      showToast("error", "Request error: " + err.message)
      setTestResult((prev) => ({
        ...prev,
        [id]: {
          success: false,
          message: err.message || "Request Error",
        },
      }))
    } finally {
      setTestingId(null)
    }
  }

  // Stats
  const totalAccounts = providers.length
  const activeAccounts = providers.filter((p) => p.is_active && p.status === "active").length
  const totalReqMonth = providers.reduce((acc, curr) => acc + (curr.requests_month || 0), 0)
  const totalReqAll = providers.reduce((acc, curr) => acc + (curr.requests_total || 0), 0)

  const activeDrawerMeta = PROVIDER_METADATA[formProvider] || PROVIDER_METADATA.apify
  const activeGuideMeta = PROVIDER_METADATA[activeGuideTab] || PROVIDER_METADATA.apify

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold uppercase tracking-wider bg-orange-950 text-orange-400 border border-orange-800/80">
                Multi-Engine Pool
              </span>
              <span className="text-xs text-slate-400 font-medium">Automatic Fallback</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <span>Manajemen Provider Scraper LinkedIn</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur urutan prioritas fallback akun Apify, RapidAPI, Scrapingdog, dan Bright Data untuk ekstraksi data profil kandidat LinkedIn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProviders}
            disabled={isLoading}
            className="px-3 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateDrawer}
            className="px-4 py-2 rounded-[10px] bg-[#F97316] hover:bg-[#EA580C] text-white font-black text-xs shadow-lg shadow-[#F97316]/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Provider</span>
          </button>
        </div>
      </div>

      {/* BENTO STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Accounts */}
        <div className="p-4 rounded-[10px] bg-[#0F141F] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Akun Terdaftar</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalAccounts}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Terbagi di 5 Provider Utama</p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Server className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Card 2: Active Pool */}
        <div className="p-4 rounded-[10px] bg-[#0F141F] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Pool Aktif</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {activeAccounts} <span className="text-sm font-semibold text-slate-400">/ {totalAccounts}</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Siap menerima scraping request</p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Monthly Requests */}
        <div className="p-4 rounded-[10px] bg-[#0F141F] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Request Bulan Ini</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalReqMonth.toLocaleString()}</h3>
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 inline text-amber-400" /> Reset: {resetInfo.days}h {resetInfo.hours}j lagi
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        {/* Card 4: All-Time Requests */}
        <div className="p-4 rounded-[10px] bg-[#0F141F] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Ekstraksi</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalReqAll.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Sejak sistem aktif</p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* INFORMASI CARA KERJA FALLBACK ENGINE */}
      <div className="p-4 rounded-[10px] bg-blue-950/20 border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-blue-300">
              Prinsip Kerja Cascading Fallback Scraper:
            </p>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Saat user memasukkan link LinkedIn di Dashboard, sistem akan memanggil akun urutan <strong className="text-white">Prioritas 1</strong>. Jika akun tersebut habis kuota (HTTP 429 atau 402) atau mengalami error, sistem <strong className="text-orange-400">otomatis mengalihkan request ke Prioritas 2</strong>, dan seterusnya, tanpa user mengetahui adanya gangguan.
            </p>
          </div>
        </div>
      </div>

      {/* GRAFIK PENGGUNAAN FITUR SCRAPER LINKEDIN (14 HARI TERAKHIR) */}
      <div className="p-5 sm:p-6 rounded-[10px] bg-[#0F141F] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span>Grafik Tren Penggunaan Scraper LinkedIn</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume ekstraksi data LinkedIn per hari, rasio sukses vs error/limit dalam 14 hari terakhir.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="font-bold text-slate-300">Total Request</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-slate-300">Sukses (200 OK)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="font-bold text-slate-300">Gagal / Limit</span>
            </div>
          </div>
        </div>

        {/* Quick Telemetry Mini Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/60">
          <div className="p-2.5 rounded-[8px] bg-slate-900/60 border border-slate-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Request 14 Hari</p>
            <p className="text-base font-black text-white mt-0.5">
              {statsData?.summary.totalRequests14d ?? 0}
            </p>
          </div>
          <div className="p-2.5 rounded-[8px] bg-emerald-950/30 border border-emerald-800/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Tingkat Keberhasilan</p>
            <p className="text-base font-black text-emerald-400 mt-0.5">
              {statsData?.summary.successRate ?? 100}%
            </p>
          </div>
          <div className="p-2.5 rounded-[8px] bg-slate-900/60 border border-slate-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ekstraksi Sukses</p>
            <p className="text-base font-black text-emerald-400 mt-0.5">
              {statsData?.summary.totalSuccess14d ?? 0}
            </p>
          </div>
          <div className="p-2.5 rounded-[8px] bg-rose-950/30 border border-rose-800/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Gagal / Kuota Habis</p>
            <p className="text-base font-black text-rose-400 mt-0.5">
              {statsData?.summary.totalFailed14d ?? 0}
            </p>
          </div>
        </div>

        {/* Recharts AreaChart Container */}
        <div className="relative h-64 w-full pt-2">
          {isStatsLoading ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
              <span>Memuat data grafik tren...</span>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={statsData?.dailyTrend || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scraperTotalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="scraperSuccessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="scraperFailedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="fullDate"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax, 5)]}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as DailyTrendItem
                        return (
                          <div className="p-3 bg-slate-900/95 border border-slate-700 rounded-[10px] shadow-2xl text-white text-xs space-y-2 min-w-[210px] backdrop-blur-md">
                            <div className="border-b border-slate-800 pb-1.5">
                              <p className="font-extrabold text-white">{item.day}, {item.fullDate}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.date}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Total Request:
                                </span>
                                <span className="font-black text-white">{item.total}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sukses:
                                </span>
                                <span className="font-bold text-emerald-300">{item.success}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Gagal / Limit:
                                </span>
                                <span className="font-bold text-rose-300">{item.failed}</span>
                              </div>
                              {item.avgLatency > 0 && (
                                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800 text-[11px]">
                                  <span>Rata-rata Response:</span>
                                  <span className="font-mono text-slate-200">{item.avgLatency} ms</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Request"
                    stroke="#F97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scraperTotalGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="success"
                    name="Sukses"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scraperSuccessGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="Gagal"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scraperFailedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Informative empty state overlay jika belum ada request sama sekali */}
              {(!statsData || statsData.summary.totalRequests14d === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-slate-950/40 backdrop-blur-xs rounded-[8px]">
                  <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-2">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Belum Ada Aktivitas Penarikan LinkedIn (14 Hari)</p>
                  <p className="text-[11px] text-slate-500 max-w-sm text-center mt-0.5">
                    Grafik tren akan otomatis tergambar begitu user mengekstrak profil di dashboard atau admin menguji koneksi tombol &quot;Test&quot;.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* TABLE / LIST PROVIDER */}
      <div className="rounded-[10px] bg-[#0F141F] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white">Daftar Akun Provider & Urutan Prioritas</h2>
            <p className="text-[11px] text-slate-400">Gunakan tombol panah untuk mengubah urutan fallback prioritas.</p>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {providers.length} Akun Terkonfigurasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Prioritas</th>
                <th className="py-3 px-4">Provider & Label Akun</th>
                <th className="py-3 px-4">API Key & Parameter</th>
                <th className="py-3 px-4 text-center">Status Pool</th>
                <th className="py-3 px-4 text-center">Statistik Request</th>
                <th className="py-3 px-4 text-center">Uji Koneksi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-6 w-12 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4 space-y-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-36 rounded" />
                    </td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-32 rounded font-mono" /></td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-5 w-16 rounded-full mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-12 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-7 w-20 rounded-lg mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    Belum ada akun provider scraper yang ditambahkan.
                  </td>
                </tr>
              ) : (
                providers.map((p, idx) => {
                  const meta = PROVIDER_METADATA[p.provider] || {
                    name: p.provider,
                    color: "#94A3B8",
                    bgColor: "bg-slate-900",
                    borderColor: "border-slate-800",
                  }
                  const maskedKey =
                    p.api_key.length > 8
                      ? `${p.api_key.slice(0, 4)}••••••••${p.api_key.slice(-4)}`
                      : "••••••••"
                  const testStatus = testResult[p.id]

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-900/40 transition ${
                        !p.is_active ? "opacity-60 bg-slate-950/40" : ""
                      }`}
                    >
                      {/* PRIORITAS & REORDER */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-6 h-6 rounded-[6px] bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center">
                            {p.priority}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMovePriority(idx, "up")}
                              title="Pindahkan prioritas naik (dijalankan lebih dulu)"
                              className="w-4 h-4 rounded hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === providers.length - 1}
                              onClick={() => handleMovePriority(idx, "down")}
                              title="Pindahkan prioritas turun"
                              className="w-4 h-4 rounded hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* PROVIDER & LABEL (KLIK NAMA UNTUK DETAIL & LOG) */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailDrawer(p)}
                          className="flex items-center gap-2.5 text-left group cursor-pointer"
                          title={`Klik untuk melihat riwayat log & detail penggunaan ${p.label}`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                            style={{ backgroundColor: meta.color }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-xs group-hover:text-orange-400 group-hover:underline transition flex items-center gap-1.5">
                                <span>{p.label}</span>
                                <History className="w-3 h-3 text-slate-500 group-hover:text-orange-400 transition" />
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
                                style={{
                                  color: meta.color,
                                  borderColor: `${meta.color}40`,
                                  backgroundColor: `${meta.color}15`,
                                }}
                              >
                                {meta.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-400 transition">
                              Dibuat: {new Date(p.created_at).toLocaleDateString("id-ID")} &bull;{" "}
                              <span className="text-orange-400 font-semibold group-hover:underline">
                                Log Penggunaan &rarr;
                              </span>
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* API KEY & PARAMS */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-400 font-sans text-[10px]">Key: </span>
                          <span>{maskedKey}</span>
                        </div>
                        {p.extra_config && Object.keys(p.extra_config).length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
                            {Object.entries(p.extra_config).map(([k, v]) => (
                              <span key={k} className="inline-block mr-2">
                                <span className="text-slate-400">{k}:</span> {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* STATUS POOL */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            title="Klik untuk mengaktifkan / menonaktifkan akun dari pool"
                            className={`px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold transition cursor-pointer ${
                              !p.is_active
                                ? "bg-slate-800 text-slate-400 border border-slate-700"
                                : p.status === "active"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                                : p.status === "exhausted"
                                ? "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                                : "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                            }`}
                          >
                            {!p.is_active
                              ? "Nonaktif"
                              : p.status === "active"
                              ? "Aktif"
                              : p.status === "exhausted"
                              ? "Habis Kuota"
                              : p.status === "cooldown"
                              ? "Cooldown"
                              : "Error"}
                          </button>
                          {p.provider === "zapi" && p.status === "exhausted" && (
                            <span className="text-[9px] text-amber-400 font-semibold">
                              Reset: {resetInfo.days}h lagi
                            </span>
                          )}
                          {p.last_error && (
                            <span
                              className="text-[9px] text-rose-400 max-w-[120px] truncate"
                              title={p.last_error}
                            >
                              {p.last_error}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STATISTIK */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-white text-xs">
                            {p.requests_month}{" "}
                            <span className="text-slate-500 font-normal">
                              {p.provider === "zapi" ? "/ 600 req" : "/ bln"}
                            </span>
                          </span>
                          {p.provider === "zapi" && (
                            <div className="w-20 h-1.5 rounded-full bg-slate-800 my-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  p.requests_month >= 600
                                    ? "bg-rose-500"
                                    : p.requests_month >= 450
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, (p.requests_month / 600) * 100)}%` }}
                              />
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500">
                            {p.provider === "zapi" ? (
                              <span className="text-emerald-400 font-medium">
                                Sisa: {Math.max(0, 600 - p.requests_month)} req
                              </span>
                            ) : (
                              `${p.success_count} sukses • ${p.fail_count} gagal`
                            )}
                          </span>
                        </div>
                      </td>

                      {/* TEST CONNECTION */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={testingId === p.id}
                            onClick={() => handleTestProvider(p.id)}
                            className="px-2.5 py-1 rounded-[6px] bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-[10px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {testingId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
                            ) : (
                              <Zap className="w-3 h-3 text-orange-400" />
                            )}
                            <span>{testingId === p.id ? "Testing..." : "Test"}</span>
                          </button>

                          {testStatus && (
                            <span
                              className={`text-[9px] font-bold ${
                                testStatus.success ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {testStatus.success
                                ? `${testStatus.latencyMs}ms OK`
                                : "Gagal"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDrawer(p)}
                            title="Edit konfigurasi akun"
                            className="p-1.5 rounded-[6px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProvider(p.id, p.label)}
                            title="Hapus akun dari pool"
                            className="p-1.5 rounded-[6px] bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* PANDUAN MENDAPATKAN API KEY & KUOTA GRATIS (INTERACTIVE TABBED MODULE) */}
      <div className="p-5 sm:p-6 rounded-[10px] bg-[#0F141F] border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-orange-950 border border-orange-800/80 flex items-center justify-center text-orange-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Panduan Mendapatkan API Key &amp; Kuota Gratis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tutorial langkah-demi-langkah integrasi dan strategi maksimalkan kuota gratis untuk tiap provider.
              </p>
            </div>
          </div>

          <a
            href={activeGuideMeta.tokenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-[8px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-extrabold transition flex items-center gap-1.5 border border-orange-500/30"
          >
            <span>Buka Dashboard {activeGuideMeta.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* PROVIDER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {Object.entries(PROVIDER_METADATA).map(([key, meta]) => {
            const isActive = activeGuideTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveGuideTab(key)}
                className={`px-3.5 py-2 rounded-[8px] text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-white border-b-2 border-orange-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span>{meta.name}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-extrabold"
                  style={{
                    color: meta.color,
                    backgroundColor: `${meta.color}15`,
                  }}
                >
                  {meta.badge}
                </span>
              </button>
            )
          })}
        </div>

        {/* ACTIVE TAB GUIDE CONTENT */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3.5 rounded-[8px] bg-slate-900/80 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white">Kuotanya:</span>
                <span className="text-xs text-slate-300 font-medium">{activeGuideMeta.freeTierInfo}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Token yang dibutuhkan: <span className="font-mono text-orange-300 font-bold">{activeGuideMeta.tokenLabel}</span>
              </p>
            </div>
            <a
              href={activeGuideMeta.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-orange-400 hover:text-orange-300 transition flex items-center gap-1"
            >
              <span>Dokumentasi Resmi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 4 STEPS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeGuideMeta.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[8px] bg-slate-950/70 border border-slate-800/90 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 text-orange-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-extrabold text-slate-100 text-xs">{step.title}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                  {step.copyValue && (
                    <div className="mt-2 flex items-center gap-2">
                      <code className="px-2.5 py-1 rounded bg-slate-900 text-orange-300 font-mono text-xs border border-slate-800">
                        {step.copyValue}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyGuideParam(step.copyValue!, `guide-${idx}`)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedGuideParam === `guide-${idx}` ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PRO-TIP BOX */}
          <div className="p-3.5 rounded-[8px] bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-emerald-300 text-xs">
                Tips Efisiensi Kuota &amp; Fallback:
              </p>
              <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                {activeGuideMeta.tips}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT-HAND SLIDE-IN DRAWER (TAMBAH / EDIT PROVIDER — CLEAN & MINIMAL) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end transition-opacity">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => {
                if (isDropdownOpen) setIsDropdownOpen(false)
                else setIsDrawerOpen(false)
              }}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-lg h-full bg-[#0F141F] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* DRAWER HEADER */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-orange-950 border border-orange-800 flex items-center justify-center text-orange-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {editingProvider ? "Edit Akun Provider Scraper" : "Tambah Provider Scraper Baru"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Konfigurasi integrasi API, prioritas fallback &amp; kuota
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* DRAWER BODY (SCROLLABLE & CLEAN) */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0">
                {/* 1. DROPDOWN PILIH PROVIDER (EMPLOYR DESIGN SYSTEM) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Pilih Provider Scraper
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Tersedia 5 Cloud Scraper Engine
                    </span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      disabled={!!editingProvider}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full px-3.5 py-2.5 rounded-[10px] bg-slate-900 border text-white text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        isDropdownOpen
                          ? "border-orange-500 ring-2 ring-orange-500/20"
                          : "border-slate-700/80 hover:border-slate-600"
                      } ${editingProvider ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: activeDrawerMeta.color }}
                        />
                        <span className="text-sm text-white font-extrabold">{activeDrawerMeta.name}</span>
                        <span
                          className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold border"
                          style={{
                            color: activeDrawerMeta.color,
                            borderColor: `${activeDrawerMeta.color}40`,
                            backgroundColor: `${activeDrawerMeta.color}15`,
                          }}
                        >
                          {activeDrawerMeta.badge}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180 text-orange-400" : ""
                        }`}
                      />
                    </button>

                    {/* DROPDOWN MENU */}
                    <AnimatePresence>
                      {isDropdownOpen && !editingProvider && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[10px] bg-[#141B2D] border border-slate-700 shadow-2xl overflow-hidden p-1.5 space-y-1"
                        >
                          {Object.entries(PROVIDER_METADATA).map(([key, meta]) => {
                            const isSelected = formProvider === key
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleSelectProvider(key)}
                                className={`w-full px-3 py-2.5 rounded-[8px] flex items-center justify-between text-xs font-bold transition text-left cursor-pointer ${
                                  isSelected
                                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: meta.color }}
                                  />
                                  <div>
                                    <p className="font-extrabold text-white text-xs">{meta.name}</p>
                                    <p className="text-[10px] text-slate-400 font-normal">{meta.freeTierInfo}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                    style={{
                                      color: meta.color,
                                      backgroundColor: `${meta.color}15`,
                                    }}
                                  >
                                    {meta.badge}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                                </div>
                              </button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 2. FORM INPUT DETAIL */}
                <form id="drawer-provider-form" onSubmit={handleSaveProvider} className="space-y-4">
                  {/* LABEL AKUN */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Label Akun (Penanda Admin) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      placeholder="Contoh: Apify Akun 1 (Rizal)"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 font-medium"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Beri nama yang mudah dikenali, misalnya: "{activeDrawerMeta.name} Akun Utama" atau "{activeDrawerMeta.name} Cadangan 2"
                    </p>
                  </div>

                  {/* API KEY / TOKEN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        {activeDrawerMeta.tokenLabel} *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showApiKey ? "Sembunyikan" : "Tampilkan"}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        required
                        value={formApiKey}
                        onChange={(e) => setFormApiKey(e.target.value)}
                        placeholder={activeDrawerMeta.tokenPlaceholder}
                        className="w-full pl-3.5 pr-20 py-2.5 rounded-[10px] bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 font-mono focus:outline-none focus:border-orange-500"
                      />
                      <a
                        href={activeDrawerMeta.tokenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-2 px-2 py-1 rounded-[6px] bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Key className="w-2.5 h-2.5 text-orange-400" />
                        <span>Dapatkan</span>
                      </a>
                    </div>
                  </div>

                  {/* EXTRA CONFIG SESUAI PROVIDER */}
                  {formProvider === "apify" && (
                    <div className="p-3.5 rounded-[10px] bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Apify Actor ID
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormActorId("curious_coder/linkedin-profile-scraper")}
                          className="text-[10px] text-orange-400 hover:underline cursor-pointer"
                        >
                          Gunakan Default
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formActorId}
                        onChange={(e) => setFormActorId(e.target.value)}
                        placeholder="curious_coder/linkedin-profile-scraper"
                        className="w-full px-3 py-2 rounded-[8px] bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                      />
                      <p className="text-[10px] text-slate-400">
                        Default: <code className="text-orange-300">curious_coder/linkedin-profile-scraper</code>.
                      </p>
                    </div>
                  )}

                  {formProvider === "rapidapi" && (
                    <div className="p-3.5 rounded-[10px] bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          RapidAPI Host (Header X-RapidAPI-Host)
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormHost("fresh-linkedin-profile-data.p.rapidapi.com")}
                          className="text-[10px] text-orange-400 hover:underline cursor-pointer"
                        >
                          Gunakan Default
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formHost}
                        onChange={(e) => setFormHost(e.target.value)}
                        placeholder="fresh-linkedin-profile-data.p.rapidapi.com"
                        className="w-full px-3 py-2 rounded-[8px] bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                      />
                      <p className="text-[10px] text-slate-400">
                        Sesuai nama host API yang di-subscribe di RapidAPI Hub.
                      </p>
                    </div>
                  )}

                  {formProvider === "brightdata" && (
                    <div className="p-3.5 rounded-[10px] bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Bright Data Dataset ID
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormDatasetId("gd_l1viktl72bvl7bjuj0")}
                          className="text-[10px] text-orange-400 hover:underline cursor-pointer"
                        >
                          Gunakan Default
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formDatasetId}
                        onChange={(e) => setFormDatasetId(e.target.value)}
                        placeholder="gd_l1viktl72bvl7bjuj0"
                        className="w-full px-3 py-2 rounded-[8px] bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                      />
                      <p className="text-[10px] text-slate-400">
                        Dataset ID LinkedIn Profiles di Bright Data Datasets Marketplace.
                      </p>
                    </div>
                  )}

                  {/* PRIORITAS & STATUS */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Nomor Prioritas Fallback
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={formPriority}
                        onChange={(e) => setFormPriority(parseInt(e.target.value) || 1)}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Angka 1 = dipanggil paling awal
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Status Akun
                      </label>
                      <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-slate-200 font-bold">
                          Aktifkan di Pool
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Dapat dinonaktifkan sementara jika kuota habis
                      </p>
                    </div>
                  </div>
                </form>
              </div>

              {/* DRAWER STICKY FOOTER */}
              <div className="p-4 border-t border-slate-800 bg-[#0F141F]/95 backdrop-blur-xs flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {editingProvider ? "Perubahan langsung aktif di pool" : "Akan otomatis masuk ke antrian fallback"}
                </span>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    form="drawer-provider-form"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-[10px] bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingProvider ? "Simpan Perubahan" : "Tambahkan ke Pool"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RIGHT-HAND SLIDE-IN DRAWER (DETAIL PENGGUNAAN API & RIWAYAT LOG) */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedDetailProvider && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end transition-opacity">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setIsDetailDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-[#0F141F] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* DRAWER HEADER */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-orange-950 border border-orange-800 flex items-center justify-center text-orange-400 shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white">
                        {selectedDetailProvider.label}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold border uppercase"
                        style={{
                          color: (PROVIDER_METADATA[selectedDetailProvider.provider] || {}).color || "#F97316",
                          borderColor: `${(PROVIDER_METADATA[selectedDetailProvider.provider] || {}).color || "#F97316"}40`,
                          backgroundColor: `${(PROVIDER_METADATA[selectedDetailProvider.provider] || {}).color || "#F97316"}15`,
                        }}
                      >
                        {(PROVIDER_METADATA[selectedDetailProvider.provider] || {}).name || selectedDetailProvider.provider}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Prioritas #{selectedDetailProvider.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Audit riwayat siapa yang menggunakan kuota &amp; profil LinkedIn yang ditarik
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fetchProviderLogs(selectedDetailProvider.id, logFilterStatus)}
                    disabled={isLogsLoading}
                    title="Segarkan data log"
                    className="p-1.5 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLogsLoading ? "animate-spin text-orange-400" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="p-1.5 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DRAWER BODY (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0">
                {/* 1. BENTO QUICK STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-[10px] bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Request</p>
                    <p className="text-lg font-black text-white mt-1">{selectedDetailProvider.requests_total}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Semua waktu</p>
                  </div>

                  <div className="p-3 rounded-[10px] bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bulan Ini</p>
                    <p className="text-lg font-black text-white mt-1">{selectedDetailProvider.requests_month}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Siklus aktif</p>
                  </div>

                  <div className="p-3 rounded-[10px] bg-emerald-950/30 border border-emerald-800/40">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Sukses</p>
                    <p className="text-lg font-black text-emerald-400 mt-1">{selectedDetailProvider.success_count}</p>
                    <p className="text-[10px] text-emerald-500/70 mt-0.5">200 OK</p>
                  </div>

                  <div className="p-3 rounded-[10px] bg-rose-950/30 border border-rose-800/40">
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Gagal / Limit</p>
                    <p className="text-lg font-black text-rose-400 mt-1">{selectedDetailProvider.fail_count}</p>
                    <p className="text-[10px] text-rose-500/70 mt-0.5">Error / 429</p>
                  </div>
                </div>

                {/* 2. FILTER STATUS & PENCARIAN LOG */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFilterChange("ALL")}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                        logFilterStatus === "ALL"
                          ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      Semua Log
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFilterChange("SUCCESS")}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                        logFilterStatus === "SUCCESS"
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      Sukses Saja
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFilterChange("FAILED")}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                        logFilterStatus === "FAILED"
                          ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      Gagal &amp; Limit
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {providerLogs.length} Entri
                  </span>
                </div>

                {/* 3. LOG LIST */}
                {isLogsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    <span className="text-xs font-medium">Mengambil riwayat penarikan data...</span>
                  </div>
                ) : providerLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-[10px] bg-slate-900/40 border border-slate-800/80 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                      <History className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Belum ada riwayat aktivitas penarikan</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Setiap kali user mengekstrak profil LinkedIn dari dashboard user atau admin menguji koneksi, rincian pengguna, profil tujuan, durasi, dan log error akan otomatis tersimpan di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providerLogs.map((log) => {
                      const isSuccess = log.status === "SUCCESS"
                      const isExhausted = log.status === "EXHAUSTED" || log.http_status === 429

                      return (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-[10px] bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition space-y-3"
                        >
                          {/* TOP BAR: STATUS, HTTP, LATENCY, TIMESTAMP */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                                  isSuccess
                                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/70"
                                    : isExhausted
                                    ? "bg-amber-950/80 text-amber-400 border-amber-800/70"
                                    : "bg-rose-950/80 text-rose-400 border-rose-800/70"
                                }`}
                              >
                                {isSuccess ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : isExhausted ? (
                                  <AlertTriangle className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                <span>{log.status}</span>
                              </span>

                              {log.http_status && (
                                <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                                  HTTP {log.http_status}
                                </span>
                              )}

                              {log.latency_ms !== null && log.latency_ms !== undefined && (
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                                  <Zap className="w-3 h-3 text-orange-400" />
                                  <span>{log.latency_ms} ms</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>
                                {new Date(log.created_at).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* USER INFO & TARGET LINKEDIN */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* PENGGUNA YANG PAKAI */}
                            <div className="p-2.5 rounded-[8px] bg-slate-950/60 border border-slate-800/60 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>Pengguna Kuota</span>
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    log.user_id
                                      ? "bg-blue-950/80 text-blue-400 border border-blue-800/60"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {log.user_id ? "Member Terdaftar" : "Guest / Tamu"}
                                </span>
                              </div>
                              <p className="font-extrabold text-white text-xs truncate">
                                {log.user_name || "Pengguna Anonim"}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono truncate">
                                {log.user_email || "tanpa-email@tamu"}
                              </p>
                            </div>

                            {/* TARGET PROFIL LINKEDIN */}
                            <div className="p-2.5 rounded-[8px] bg-slate-950/60 border border-slate-800/60 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Globe className="w-3 h-3 text-blue-400" />
                                <span>Target LinkedIn</span>
                              </span>
                              <p className="font-extrabold text-white text-xs truncate">
                                {log.target_name || "Target Profil LinkedIn"}
                              </p>
                              <a
                                href={log.target_url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={log.target_url || ""}
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 truncate hover:underline"
                              >
                                <span className="truncate">{log.target_url || "-"}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          </div>

                          {/* ERROR MESSAGE DETAIL (JIKA GAGAL) */}
                          {log.error_message && (
                            <div className="p-2.5 rounded-[8px] bg-rose-950/30 border border-rose-900/60 space-y-1">
                              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase tracking-wider">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>Pesan Error / Diagnostik Kegagalan:</span>
                              </div>
                              <p className="text-[11px] font-mono text-rose-200/90 whitespace-pre-wrap break-all bg-rose-950/60 p-2 rounded border border-rose-900/40">
                                {log.error_message}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* DRAWER STICKY FOOTER */}
              <div className="p-4 border-t border-slate-800 bg-[#0F141F]/95 backdrop-blur-xs flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Riwayat audit tercatat real-time dari request user &amp; admin
                </span>
                <button
                  type="button"
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer ml-auto"
                >
                  Tutup Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION (BERHASIL / GAGAL / INFO) */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full px-4 sm:px-0 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-3.5 rounded-[10px] border text-xs font-bold flex items-center justify-between shadow-2xl backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-950/95 border-emerald-700/80 text-emerald-100"
                  : toast.type === "error"
                  ? "bg-rose-950/95 border-rose-700/80 text-rose-100"
                  : "bg-blue-950/95 border-blue-700/80 text-blue-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    toast.type === "success"
                      ? "bg-emerald-800 text-emerald-200"
                      : toast.type === "error"
                      ? "bg-rose-800 text-rose-200"
                      : "bg-blue-800 text-blue-200"
                  }`}
                >
                  {toast.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : toast.type === "error" ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5" />
                  )}
                </div>
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
