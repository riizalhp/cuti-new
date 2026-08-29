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
  DollarSign,
  TrendingUp,
  Activity,
  BarChart3,
  Terminal,
  Send,
  Sliders,
  Code2,
  Copy,
  MessageSquare,
  Loader2,
} from "lucide-react"

// ============ TYPES ============

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

interface UsageSummary {
  totalRequests: number
  totalTokensInput: number
  totalTokensOutput: number
  totalTokens: number
  totalCost: number
  avgCostPerReq: number
  activeProvidersCount: number
}

interface FeatureBreakdown {
  name: string
  requests: number
  totalTokens: number
  avgTokenPerReq: number
  cost: number
  percentage: string
}

interface ProviderBreakdown {
  name: string
  model: string
  requests: number
  tokens: number
  cost: number
}

interface FeatureMappingItem {
  feature_key: string
  feature_name: string
  description: string
  provider_id: string | null
  temperature: number
  max_tokens: number
  is_active: boolean
}

const DEFAULT_MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-3.5-turbo"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  azure: ["gpt-4o-deployment", "gpt-4o-mini-deployment"],
  custom_proxy: ["deepseek-r1", "deepseek-v3", "qwen2.5-coder-32b", "gpt-4o-mini", "gemini-1.5-flash"],
  ollama: ["llama3.2:latest", "mistral:7b-instruct", "gemma2:9b"],
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return String(n)
}

function formatRupiah(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID")
}

// ============ MAIN COMPONENT ============

export default function AiConfigPage() {
  const [activeTab, setActiveTab] = useState<"config" | "usage">("config")

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
          <Cpu size={26} className="text-orange-500" />
          AI Config & Usage
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Manajemen provider, endpoint AI, serta monitoring pemakaian token & biaya
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "config"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Cpu size={14} />
          Konfigurasi
        </button>
        <button
          onClick={() => setActiveTab("usage")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "usage"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BarChart3 size={14} />
          Usage & Cost
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "config" ? <ConfigTab /> : <UsageTab />}
    </motion.div>
  )
}

// ============ CONFIG TAB ============

function ConfigTab() {
  const [packages, setPackages] = useState<AiEndpointPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [rotationStrategy, setRotationStrategy] = useState<"round_robin" | "least_used" | "failover">("failover")

  const primaryPackage = packages.find((p) => p.isPrimary) || packages[0]

  // Add/Edit Modal states
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

  // Playground Drawer states
  const [playgroundPackage, setPlaygroundPackage] = useState<AiEndpointPackage | null>(null)
  const [pgPrompt, setPgPrompt] = useState("Halo! Tolong berikan salam singkat dan konfirmasi bahwa AI connection ini aktif.")
  const [pgSystemPrompt, setPgSystemPrompt] = useState("You are a helpful AI assistant for connection testing.")
  const [pgTemperature, setPgTemperature] = useState(0.3)
  const [pgMaxTokens, setPgMaxTokens] = useState(512)
  const [pgSelectedModel, setPgSelectedModel] = useState("")
  const [pgLoading, setPgLoading] = useState(false)
  const [pgResult, setPgResult] = useState<{
    ok: boolean
    content?: string
    latencyMs?: number
    status?: number
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    error?: string
    raw?: any
  } | null>(null)
  const [showRawJson, setShowRawJson] = useState(false)
  const [copiedResponse, setCopiedResponse] = useState(false)

  const [featureMappings, setFeatureMappings] = useState<FeatureMappingItem[]>([])
  const [loadingMappings, setLoadingMappings] = useState(false)
  const [savingFeatureKey, setSavingFeatureKey] = useState<string | null>(null)

  useEffect(() => {
    loadProviders()
    loadFeatureMappings()
  }, [])

  const loadFeatureMappings = async () => {
    setLoadingMappings(true)
    try {
      const res = await fetch("/api/ai-feature-mappings")
      const data = await res.json()
      if (data.features && Array.isArray(data.features)) {
        setFeatureMappings(data.features)
      }
    } catch {
      // ignore
    } finally {
      setLoadingMappings(false)
    }
  }

  const handleUpdateFeatureMapping = async (featureKey: string, updates: Partial<FeatureMappingItem>) => {
    setSavingFeatureKey(featureKey)
    try {
      const current = featureMappings.find((f) => f.feature_key === featureKey)
      const merged = { ...current, ...updates }
      await fetch("/api/ai-feature-mappings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      })
      setFeatureMappings((prev) =>
        prev.map((f) => (f.feature_key === featureKey ? ({ ...f, ...updates } as FeatureMappingItem) : f))
      )
    } catch (err) {
      console.error("Gagal simpan mapping:", err)
    } finally {
      setSavingFeatureKey(null)
    }
  }

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

  const handleSavePackageModal = async () => {
    if (!formName.trim() || !formEndpoint.trim()) return

    try {
      if (editingPackageId && !editingPackageId.startsWith("pkg-")) {
        // Direct DB Update via PUT
        await fetch(`/api/ai-providers/${editingPackageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            label: formName.trim(),
            endpointUrl: formEndpoint.trim(),
            apiKey: formApiKey.trim(),
            model: formModel,
            alias: formProvider,
          }),
        })
      } else {
        // Direct DB Create via POST
        await fetch("/api/ai-providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            label: formName.trim(),
            endpointUrl: formEndpoint.trim(),
            apiKey: formApiKey.trim(),
            model: formModel,
            priority: packages.length === 0 ? 10 : 0,
            authType: "apikey",
            alias: formProvider,
          }),
        })
      }
      setIsModalOpen(false)
      await loadProviders()
    } catch (err) {
      setModalMessage({ type: "error", text: "Gagal menyimpan ke database." })
    }
  }

  const handleDeletePackage = async (id: string) => {
    try {
      if (!id.startsWith("pkg-")) {
        await fetch(`/api/ai-providers/${id}`, { method: "DELETE" })
      }
      await loadProviders()
    } catch {
      // ignore
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      // Set all other priorities to 0 and this to 10
      for (const p of packages) {
        if (!p.id.startsWith("pkg-")) {
          await fetch(`/api/ai-providers/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: p.id === id ? 10 : 0 }),
          })
        }
      }
      await loadProviders()
    } catch {
      // ignore
    }
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

  // Playground Handlers
  const handleOpenPlayground = (pkg: AiEndpointPackage) => {
    setPlaygroundPackage(pkg)
    setPgSelectedModel(pkg.model)
    setPgResult(null)
    setShowRawJson(false)
  }

  const handleRunPlayground = async () => {
    if (!playgroundPackage) return
    setPgLoading(true)
    setPgResult(null)

    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completion",
          endpointUrl: playgroundPackage.endpointUrl,
          apiKey: playgroundPackage.apiKey,
          model: pgSelectedModel || playgroundPackage.model,
          prompt: pgPrompt,
          temperature: pgTemperature,
          maxTokens: pgMaxTokens,
        }),
      })

      const data = await res.json()
      setPgResult(data)

      // Update local latency if successful
      if (data.ok && data.latencyMs) {
        setPackages(packages.map((p) => (p.id === playgroundPackage.id ? { ...p, latencyMs: data.latencyMs, status: "active" as const } : p)))
      }
    } catch (err: any) {
      setPgResult({
        ok: false,
        error: `Gagal terhubung ke API endpoint. Detail: ${err.message || "Network Error"}`,
      })
    } finally {
      setPgLoading(false)
    }
  }

  const copyResultContent = () => {
    if (!pgResult?.content) return
    navigator.clipboard.writeText(pgResult.content)
    setCopiedResponse(true)
    setTimeout(() => setCopiedResponse(false), 2000)
  }

  return (
    <div className="space-y-8 relative">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3">
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

      {/* Package Pool Cards */}
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
                      className="py-2 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Tes Ping Endpoint"
                    >
                      <Play size={13} />
                      <span>Tes Ping</span>
                    </button>
                    <button
                      onClick={() => handleOpenPlayground(pkg)}
                      className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Terminal size={14} />
                      <span>Playground</span>
                    </button>
                    {!pkg.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(pkg.id)}
                        className="py-2 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Set sebagai Utama"
                      >
                        Utama
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

      {/* Feature-Based Provider Assignment Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Sliders size={20} className="text-orange-500" />
              Pemetaan Provider per Fitur Aplikasi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih endpoint node spesifik untuk masing-masing fitur (misal: model hemat untuk Import CV, model cerdas untuk Copilot).
            </p>
          </div>
          <button
            onClick={loadFeatureMappings}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <RefreshCw size={13} className={loadingMappings ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureMappings.map((feat) => {
            const assignedPkg = packages.find((p) => p.id === feat.provider_id)
            const isSaving = savingFeatureKey === feat.feature_key

            return (
              <div
                key={feat.feature_key}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-orange-200 dark:hover:border-orange-950 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-navy-50 dark:bg-navy-950/80 text-[#1F3578] dark:text-blue-400 border border-navy-200 dark:border-navy-800 uppercase tracking-wider">
                      {feat.feature_key}
                    </span>
                    {isSaving && (
                      <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1 animate-pulse">
                        <RefreshCw size={11} className="animate-spin" /> Menyimpan...
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{feat.feature_name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{feat.description}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Endpoint / Provider yang Digunakan
                    </label>
                    <select
                      value={feat.provider_id || ""}
                      onChange={(e) =>
                        handleUpdateFeatureMapping(feat.feature_key, {
                          provider_id: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="">(Default: Paket Utama Teraktif)</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} ({pkg.provider.toUpperCase()} • {pkg.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Model Aktif:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                      {assignedPkg ? assignedPkg.model : (primaryPackage?.model || "gpt-4o-mini")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Status Endpoint:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        (assignedPkg?.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
                      }`}
                    >
                      {assignedPkg ? assignedPkg.status.toUpperCase() : "AUTO FALLBACK"}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create/Edit Modal */}
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

      {/* Playground Drawer (Slide in from Right) */}
      <AnimatePresence>
        {playgroundPackage && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlaygroundPackage(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Right Drawer Box */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <Terminal size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">{playgroundPackage.name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {playgroundPackage.provider}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-sm mt-0.5">{playgroundPackage.endpointUrl}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPlaygroundPackage(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Configuration Bar */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <Sliders size={14} className="text-orange-500" />
                    <span>Parameter Request</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Model Target</label>
                      <input
                        type="text"
                        value={pgSelectedModel}
                        onChange={(e) => setPgSelectedModel(e.target.value)}
                        placeholder={playgroundPackage.model}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Temperature ({pgTemperature})</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={pgTemperature}
                        onChange={(e) => setPgTemperature(parseFloat(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer mt-1"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        value={pgMaxTokens}
                        onChange={(e) => setPgMaxTokens(parseInt(e.target.value) || 256)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* System Prompt (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    System Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={pgSystemPrompt}
                    onChange={(e) => setPgSystemPrompt(e.target.value)}
                    placeholder="Instruksi sistem untuk AI..."
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500 leading-relaxed resize-none"
                  />
                </div>

                {/* User Prompt Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      User Test Prompt
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setPgPrompt("Halo! Tolong berikan salam singkat dan konfirmasi bahwa AI connection ini aktif.")}
                        className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                      >
                        Salam Ping
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setPgPrompt("Berikan 3 saran singkat untuk meningkatkan kata kunci ATS pada CV Software Engineer.")}
                        className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                      >
                        Uji CV Prompt
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={pgPrompt}
                    onChange={(e) => setPgPrompt(e.target.value)}
                    placeholder="Ketik teks prompt untuk menguji balasan dari AI..."
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500 leading-relaxed resize-y"
                  />
                </div>

                {/* Run Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleRunPlayground}
                    disabled={pgLoading || !pgPrompt.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {pgLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Mengirim Prompt...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Kirim Test Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Result Section */}
                {pgResult && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-orange-500" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Respon AI
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            pgResult.ok ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
                          }`}
                        >
                          {pgResult.ok ? `200 OK (${pgResult.latencyMs}ms)` : `Error ${pgResult.status || ""}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {pgResult.ok && pgResult.content && (
                          <button
                            onClick={copyResultContent}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedResponse ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            <span>{copiedResponse ? "Tercopy!" : "Copy"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowRawJson(!showRawJson)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Code2 size={13} />
                          <span>{showRawJson ? "Teks" : "JSON Raw"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Result Output Box */}
                    {pgResult.ok ? (
                      showRawJson ? (
                        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                          {JSON.stringify(pgResult.raw || pgResult, null, 2)}
                        </pre>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {pgResult.content}
                        </div>
                      )
                    ) : (
                      <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold space-y-1">
                        <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                          <AlertTriangle size={16} />
                          <span>Gagal Mendapatkan Respon</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{pgResult.error}</p>
                      </div>
                    )}

                    {/* Token Usage Badge */}
                    {pgResult.ok && pgResult.usage && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                        <span>
                          Input Token: <strong className="text-slate-700 dark:text-slate-300">{pgResult.usage.prompt_tokens}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Output Token: <strong className="text-slate-700 dark:text-slate-300">{pgResult.usage.completion_tokens}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Total: <strong className="text-amber-600 dark:text-amber-400 font-bold">{pgResult.usage.total_tokens}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ USAGE TAB ============

function UsageTab() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [featureBreakdown, setFeatureBreakdown] = useState<FeatureBreakdown[]>([])
  const [providerBreakdown, setProviderBreakdown] = useState<ProviderBreakdown[]>([])

  useEffect(() => {
    loadUsage()
  }, [period])

  const loadUsage = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai-usage?period=${period}`)
      const data = await res.json()
      if (data.success) {
        setSummary(data.data.summary)
        setFeatureBreakdown(data.data.featureBreakdown || [])
        setProviderBreakdown(data.data.providerBreakdown || [])
      }
    } catch {
      setSummary(null)
      setFeatureBreakdown([])
      setProviderBreakdown([])
    } finally {
      setLoading(false)
    }
  }

  const hasData = summary && summary.totalRequests > 0

  return (
    <div className="space-y-8">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                period === p ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p === "daily" ? "Harian" : p === "weekly" ? "Mingguan" : "Bulanan"}
            </button>
          ))}
        </div>
        <button
          onClick={loadUsage}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
          Memuat data usage...
        </div>
      ) : !hasData ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-500 flex items-center justify-center mx-auto">
            <BarChart3 size={32} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Data Usage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Data pemakaian AI akan muncul otomatis saat API Key digunakan oleh fitur-fitur Employr (Improve CV, Job Match, dll).
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Token</span>
                <Cpu size={18} className="text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{formatNumber(summary!.totalTokens)}</div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                Input: {formatNumber(summary!.totalTokensInput)} • Output: {formatNumber(summary!.totalTokensOutput)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Cost per Request</span>
                <DollarSign size={18} className="text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(summary!.avgCostPerReq)} <span className="text-xs text-slate-400 font-medium">/req</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                Total Request: <strong>{summary!.totalRequests.toLocaleString("id-ID")}</strong>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Biaya</span>
                <TrendingUp size={18} className="text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{formatRupiah(summary!.totalCost)}</div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                Periode: {period === "daily" ? "24 jam terakhir" : period === "weekly" ? "7 hari terakhir" : "30 hari terakhir"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Active Providers</span>
                <Activity size={18} className="text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{summary!.activeProvidersCount}</div>
              <p className="text-xs text-slate-400 font-medium mt-2">Provider aktif di database</p>
            </div>
          </div>

          {/* Provider Breakdown */}
          {providerBreakdown.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Breakdown per Provider / API Key</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Pemakaian berdasarkan provider dan model yang dikonfigurasi</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Provider & Model</th>
                      <th className="p-4">Total Request</th>
                      <th className="p-4">Token Usage</th>
                      <th className="p-4">Est. Cost (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {providerBreakdown.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{row.requests.toLocaleString("id-ID")}</td>
                        <td className="p-4 font-bold text-amber-600 dark:text-amber-400">{formatNumber(row.tokens)}</td>
                        <td className="p-4 font-bold text-rose-600 dark:text-rose-400">{formatRupiah(row.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feature Cost Breakdown Table */}
          {featureBreakdown.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Breakdown Biaya per Fitur AI</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Analisis fitur mana yang paling banyak menghabiskan token</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Fitur</th>
                      <th className="p-4">Total Request</th>
                      <th className="p-4">Token Usage</th>
                      <th className="p-4">Rata-rata Token/Req</th>
                      <th className="p-4">Est. Cost (IDR)</th>
                      <th className="p-4">% Total Biaya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {featureBreakdown.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{row.requests.toLocaleString("id-ID")}</td>
                        <td className="p-4 font-bold text-amber-600 dark:text-amber-400">{formatNumber(row.totalTokens)}</td>
                        <td className="p-4 text-slate-500 font-mono">{row.avgTokenPerReq.toLocaleString("id-ID")}</td>
                        <td className="p-4 font-bold text-rose-600 dark:text-rose-400">{formatRupiah(row.cost)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200 w-12">{row.percentage}</span>
                            <div className="w-[#128px] bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: row.percentage }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
