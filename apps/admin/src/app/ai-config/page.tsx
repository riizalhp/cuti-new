"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  Globe,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Save,
  Check,
  Layers,
  Sparkles,
  Server,
  Eye,
  EyeOff,
  Edit3,
  X,
  Bot,
  Database,
  ArrowRight,
  FolderOpen,
} from "lucide-react"

interface AiEndpointPackage {
  id: string
  name: string
  provider: string
  endpointUrl: string
  apiKey: string
  model: string
  status: "active" | "rate_limited" | "exhausted" | "offline"
  latencyMs?: number
  requestsTotal: number
  isPrimary: boolean
  temperature: number
  maxTokens: number
}

const DEFAULT_MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-3.5-turbo"],
  azure: ["gpt-4o-deployment", "gpt-4o-mini-deployment"],
  custom_proxy: ["deepseek-r1", "deepseek-v3", "qwen2.5-coder-32b", "gpt-4o-mini"],
  ollama: ["llama3.2:latest", "mistral:7b-instruct", "gemma2:9b"],
}

export default function AiConfigPage() {
  const [packages, setPackages] = useState<AiEndpointPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [rotationStrategy, setRotationStrategy] = useState<"round_robin" | "least_used" | "failover">("failover")

  const primaryPackage = packages.find((p) => p.isPrimary) || packages[0]

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formProvider, setFormProvider] = useState<"openai" | "azure" | "custom_proxy" | "ollama">("openai")
  const [formEndpoint, setFormEndpoint] = useState("https://api.openai.com/v1")
  const [formApiKey, setFormApiKey] = useState("")
  const [formModel, setFormModel] = useState("gpt-4o-mini")
  const [formAvailableModels, setFormAvailableModels] = useState<string[]>(DEFAULT_MODELS_BY_PROVIDER.openai)
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [showKeySecrets, setShowKeySecrets] = useState<Record<string, boolean>>({})

  // Load from DB on mount
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai-providers")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const mapped: AiEndpointPackage[] = data.data.map((p: any, i: number) => ({
          id: p.id,
          name: p.name,
          provider: p.provider || p.alias || "openai",
          endpointUrl: p.endpointUrl || p.base_url || "https://api.openai.com/v1",
          apiKey: p.apiKey || p.api_key || "",
          model: p.model || "gpt-4o-mini",
          status: p.isActive !== false ? "active" : "offline",
          latencyMs: 0,
          requestsTotal: 0,
          isPrimary: p.priority >= 10 || i === 0,
          temperature: 0.3,
          maxTokens: 512,
        }))
        setPackages(mapped)
      } else {
        setPackages([])
      }
    } catch {
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingPackageId(null)
    setFormName("")
    setFormProvider("openai")
    setFormEndpoint("https://api.openai.com/v1")
    setFormApiKey("")
    setFormModel("gpt-4o-mini")
    setFormAvailableModels(DEFAULT_MODELS_BY_PROVIDER.openai)
    setModalMessage(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (pkg: AiEndpointPackage) => {
    setEditingPackageId(pkg.id)
    setFormName(pkg.name)
    setFormProvider(pkg.provider as any)
    setFormEndpoint(pkg.endpointUrl)
    setFormApiKey(pkg.apiKey)
    setFormModel(pkg.model)
    setFormAvailableModels(DEFAULT_MODELS_BY_PROVIDER[pkg.provider] || [pkg.model])
    setModalMessage(null)
    setIsModalOpen(true)
  }

  // Fitur Load Model dari API Endpoint
  const handleFetchModelsFromEndpoint = async () => {
    if (!formEndpoint.trim()) {
      setModalMessage({ type: "error", text: "Masukkan Endpoint URL terlebih dahulu." })
      return
    }
    if (!formApiKey.trim() && formProvider !== "ollama") {
      setModalMessage({ type: "error", text: "Masukkan API Key terlebih dahulu untuk memuat daftar model." })
      return
    }

    setIsFetchingModels(true)
    setModalMessage(null)

    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "models",
          endpointUrl: formEndpoint.trim(),
          apiKey: formApiKey.trim(),
        }),
      })

      const data = await res.json()

      if (data.ok && Array.isArray(data.models) && data.models.length > 0) {
        setFormAvailableModels(data.models)
        setFormModel(data.models[0])
        setModalMessage({
          type: "success",
          text: `Berhasil memuat ${data.models.length} model dari API (${data.latencyMs}ms)`,
        })
      } else {
        setModalMessage({
          type: "error",
          text: data.error || "Tidak ada model yang dapat ditarik dari endpoint ini.",
        })
      }
    } catch (err: any) {
      setModalMessage({
        type: "error",
        text: `Gagal terhubung ke API: ${err.message || "Network Error"}`,
      })
    } finally {
      setIsFetchingModels(false)
    }
  }

  const handleSavePackageModal = () => {
    if (!formName.trim() || !formEndpoint.trim()) return

    if (editingPackageId) {
      setPackages(
        packages.map((p) =>
          p.id === editingPackageId
            ? {
                ...p,
                name: formName.trim(),
                provider: formProvider,
                endpointUrl: formEndpoint.trim(),
                apiKey: formApiKey.trim(),
                model: formModel,
              }
            : p
        )
      )
    } else {
      const newPkg: AiEndpointPackage = {
        id: `pkg-${Date.now()}`,
        name: formName.trim(),
        provider: formProvider,
        endpointUrl: formEndpoint.trim(),
        apiKey: formApiKey.trim(),
        model: formModel,
        status: "active",
        latencyMs: 0,
        requestsTotal: 0,
        isPrimary: packages.length === 0,
        temperature: 0.3,
        maxTokens: 512,
      }
      setPackages([...packages, newPkg])
    }
    setIsModalOpen(false)
  }

  const handleDeletePackage = (id: string) => {
    const filtered = packages.filter((p) => p.id !== id)
    if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
      filtered[0].isPrimary = true
    }
    setPackages(filtered)
  }

  const handleSetPrimary = (id: string) => {
    setPackages(packages.map((p) => ({ ...p, isPrimary: p.id === id })))
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      for (const pkg of packages) {
        if (pkg.id.startsWith("default-") || pkg.id.startsWith("pkg-")) {
          await fetch("/api/ai-providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: pkg.name,
              label: pkg.name,
              endpointUrl: pkg.endpointUrl,
              apiKey: pkg.apiKey,
              model: pkg.model,
              priority: pkg.isPrimary ? 10 : 0,
              authType: "apikey",
              alias: pkg.provider,
            }),
          })
        }
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      await loadProviders()
    } catch {
      // ignore
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async (pkg: AiEndpointPackage) => {
    if (!pkg.apiKey && pkg.provider !== "ollama") {
      alert("Masukkan API Key terlebih dahulu.")
      return
    }

    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "models", endpointUrl: pkg.endpointUrl, apiKey: pkg.apiKey }),
      })
      const data = await res.json()
      if (data.ok) {
        setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, status: "active" as const, latencyMs: data.latencyMs } : p)))
      } else {
        setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, status: "offline" as const } : p)))
      }
    } catch {
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, status: "offline" as const } : p)))
    }
  }

  const toggleKeyVisibility = (id: string) => setShowKeySecrets((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
            <Cpu size={26} className="text-orange-500" />
            Konfigurasi Multi-Endpoint AI
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manajemen provider AI node & model tersimpan di database `ai_providers`
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProviders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
            Muat
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check size={18} /> Tersimpan!
              </>
            ) : (
              <>
                <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan ke Database"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-navy-50 dark:bg-navy-950/80 border border-navy-100 dark:border-navy-800 text-[#1F3578] dark:text-navy-300">
              <Server size={20} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Primary
            </span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Paket Utama Aktif</h3>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50 truncate">{primaryPackage?.name || "Tanpa Paket"}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/80 border border-orange-100 dark:border-orange-900/60 text-orange-600 dark:text-orange-400">
              <Globe size={20} />
            </div>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Total Endpoint Node</h3>
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{packages.length} Node</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <Zap size={20} />
            </div>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Strategi Rotasi</h3>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wide">{rotationStrategy}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Model Utama</h3>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50 font-mono truncate">{primaryPackage?.model || "-"}</p>
        </div>
      </div>

      {/* Package Pool Cards / Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Layers size={20} className="text-orange-500" />
            Multi-Endpoint Node Pool
          </h2>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            Tambah Node
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            Memuat dari database...
          </div>
        ) : packages.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-500 flex items-center justify-center mx-auto">
              <Cpu size={32} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Node Provider AI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tambahkan konfigurasi endpoint OpenAI, Azure, Ollama, atau Custom Proxy API Key pertama Anda.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Node Provider Baru</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -2 }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  pkg.isPrimary ? "border-orange-500 ring-2 ring-orange-500/20" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">{pkg.name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {pkg.provider}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {pkg.isPrimary && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500 text-white uppercase">
                          Primary
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pkg.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200"
                        }`}
                      >
                        {pkg.status === "active" ? "Aktif" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Endpoint</span>
                      <p className="font-mono text-slate-800 dark:text-slate-200 truncate bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg">
                        {pkg.endpointUrl}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">API Key</span>
                      <div className="flex items-center justify-between font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg">
                        <span className="truncate">
                          {pkg.apiKey
                            ? showKeySecrets[pkg.id]
                              ? pkg.apiKey
                              : `${pkg.apiKey.slice(0, 7)}...${pkg.apiKey.slice(-4)}`
                            : "Tanpa Key"}
                        </span>
                        {pkg.apiKey && (
                          <button onClick={() => toggleKeyVisibility(pkg.id)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            {showKeySecrets[pkg.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Model</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">{pkg.model}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Latensi</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{pkg.latencyMs ? `${pkg.latencyMs}ms` : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(pkg)}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play size={14} />
                      <span>Tes Koneksi Node</span>
                    </button>
                    {!pkg.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(pkg.id)}
                        className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        Set Utama
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400">Requests: {pkg.requestsTotal}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(pkg)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-slate-400 hover:text-rose-500 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal dengan Fitur Load Models dari API */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Cpu size={20} className="text-orange-500" />
                  {editingPackageId ? "Edit Node Provider" : "Tambah Node Provider Baru"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                  ✕
                </button>
              </div>

              {modalMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    modalMessage.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {modalMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {modalMessage.text}
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Nama Node / Label</label>
                  <input
                    type="text"
                    placeholder="misal: OpenAI Primary Node"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Provider</label>
                    <select
                      value={formProvider}
                      onChange={(e) => {
                        const v = e.target.value as any
                        setFormProvider(v)
                        setFormAvailableModels(DEFAULT_MODELS_BY_PROVIDER[v] || ["gpt-4o-mini"])
                        setFormModel(DEFAULT_MODELS_BY_PROVIDER[v]?.[0] || "gpt-4o-mini")
                      }}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="azure">Azure OpenAI</option>
                      <option value="custom_proxy">Custom Proxy / Router</option>
                      <option value="ollama">Ollama Local</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Endpoint URL</label>
                    <input
                      type="text"
                      value={formEndpoint}
                      onChange={(e) => setFormEndpoint(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">API Key</label>
                  <input
                    type="password"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Model Selection & Auto Fetch Models Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Pilih Model AI</label>
                    <button
                      type="button"
                      onClick={handleFetchModelsFromEndpoint}
                      disabled={isFetchingModels}
                      className="text-orange-600 dark:text-orange-400 hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isFetchingModels ? "animate-spin" : ""} />
                      <span>{isFetchingModels ? "Memuat Model..." : "Muat Model dari API Endpoint"}</span>
                    </button>
                  </div>

                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  >
                    {formAvailableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                  Batal
                </button>
                <button
                  onClick={handleSavePackageModal}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {editingPackageId ? "Simpan Perubahan" : "Tambah Node"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
