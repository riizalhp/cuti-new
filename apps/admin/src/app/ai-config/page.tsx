"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
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
  ArrowUp,
  ArrowDown,
  Workflow,
  Link2,
  Search,
  ChevronDown,
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
  priority: number
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

interface EnrichedChainProvider {
  id: string
  name: string
  provider: string
  model: string
  is_active: boolean
}

interface CustomChainItem {
  id: string
  name: string
  description: string
  provider_ids: string[]
  temperature?: number
  created_at: string
  updated_at: string
  providers?: EnrichedChainProvider[]
}

const DEFAULT_MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-3.5-turbo"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  azure: ["gpt-4o-deployment", "gpt-4o-mini-deployment"],
  custom_proxy: ["deepseek-r1", "deepseek-v3", "qwen2.5-coder-32b", "gpt-4o-mini", "gemini-1.5-flash"],
  ollama: ["llama3.2:latest", "mistral:7b-instruct", "gemma2:9b"],
}

const LOCAL_STORAGE_MODELS_KEY = "employr_ai_models_cache_v1"

function getCachedModelsForEndpoint(endpointUrl: string, provider: string, currentModel?: string): string[] {
  const defaults = DEFAULT_MODELS_BY_PROVIDER[provider] || ["gpt-4o-mini"]
  if (typeof window === "undefined") {
    return Array.from(new Set([...(currentModel ? [currentModel] : []), ...defaults])).filter(Boolean)
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MODELS_KEY)
    if (raw) {
      const cacheMap = JSON.parse(raw)
      const cleanKey = (endpointUrl || "").trim().toLowerCase().replace(/\/+$/, "")
      const cachedList: string[] = cacheMap[cleanKey] || cacheMap[provider] || []
      const merged = Array.from(
        new Set([...(currentModel ? [currentModel] : []), ...cachedList, ...defaults])
      ).filter(Boolean)
      return merged
    }
  } catch {
    // fallback
  }
  return Array.from(new Set([...(currentModel ? [currentModel] : []), ...defaults])).filter(Boolean)
}

function saveCachedModelsForEndpoint(endpointUrl: string, provider: string, modelsToSave: string[]) {
  if (typeof window === "undefined" || !modelsToSave || modelsToSave.length === 0) return
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MODELS_KEY)
    const cacheMap = raw ? JSON.parse(raw) : {}
    const cleanKey = (endpointUrl || "").trim().toLowerCase().replace(/\/+$/, "")

    if (cleanKey) {
      const existingClean = cacheMap[cleanKey] || []
      cacheMap[cleanKey] = Array.from(new Set([...existingClean, ...modelsToSave])).filter(Boolean)
    }

    if (provider) {
      const existingProv = cacheMap[provider] || []
      cacheMap[provider] = Array.from(new Set([...existingProv, ...modelsToSave])).filter(Boolean)
    }

    localStorage.setItem(LOCAL_STORAGE_MODELS_KEY, JSON.stringify(cacheMap))
  } catch {
    // ignore
  }
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
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
              <Cpu size={26} className="text-orange-500" />
              AI Config & Usage
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Manajemen provider, endpoint AI, serta monitoring pemakaian token & biaya
            </p>
          </div>
        </div>
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
  const [formPriority, setFormPriority] = useState<number>(10)
  const [formAvailableModels, setFormAvailableModels] = useState<string[]>(DEFAULT_MODELS_BY_PROVIDER.openai)
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [modelSearchQuery, setModelSearchQuery] = useState("")
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false)
      }
    }
    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModelDropdownOpen])

  // Delete Confirmation Modal & Alert states
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
    type: "package" | "chain"
    model?: string
    endpointUrl?: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalAlert, setGlobalAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showNotification = (type: "success" | "error", message: string) => {
    setGlobalAlert({ type, message })
    setTimeout(() => {
      setGlobalAlert((prev) => (prev?.message === message ? null : prev))
    }, 4500)
  }

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

  // Custom Chains (Config Gabungan) State
  const [chains, setChains] = useState<CustomChainItem[]>([])
  const [chainAssignments, setChainAssignments] = useState<Record<string, string | null>>({})
  const [loadingChains, setLoadingChains] = useState(false)

  // Chain Modal States
  const [isChainModalOpen, setIsChainModalOpen] = useState(false)
  const [editingChainId, setEditingChainId] = useState<string | null>(null)
  const [chainFormName, setChainFormName] = useState("")
  const [chainFormDescription, setChainFormDescription] = useState("")
  const [chainFormSelectedProviderIds, setChainFormSelectedProviderIds] = useState<string[]>([])
  const [chainFormTemperature, setChainFormTemperature] = useState<number>(0.3)
  const [chainModalError, setChainModalError] = useState<string | null>(null)
  const [isSavingChain, setIsSavingChain] = useState(false)
  const [selectedProviderToAdd, setSelectedProviderToAdd] = useState<string>("")

  useEffect(() => {
    loadProviders()
    loadFeatureMappings()
    loadChains()
  }, [])

  const loadChains = async () => {
    setLoadingChains(true)
    try {
      const res = await fetch("/api/ai-chains")
      const data = await res.json()
      if (data.success && Array.isArray(data.chains)) {
        setChains(data.chains)
        if (data.assignments && typeof data.assignments === "object") {
          setChainAssignments(data.assignments)
        }
      }
    } catch (err) {
      console.error("Gagal memuat chains:", err)
    } finally {
      setLoadingChains(false)
    }
  }

  const loadFeatureMappings = async () => {
    setLoadingMappings(true)
    try {
      const res = await fetch("/api/ai-feature-mappings")
      const data = await res.json()
      if (Array.isArray(data.features)) {
        setFeatureMappings(data.features)
      }
    } catch {
      // fallback silent
    } finally {
      setLoadingMappings(false)
    }
  }

  const handleOpenAddChainModal = () => {
    setEditingChainId(null)
    setChainFormName("")
    setChainFormDescription("")
    const defaultSelection = packages.slice(0, 2).map((p) => p.id)
    setChainFormSelectedProviderIds(defaultSelection)
    setChainFormTemperature(0.3)
    setChainModalError(null)
    setSelectedProviderToAdd(packages[0]?.id || "")
    setIsChainModalOpen(true)
  }

  const handleOpenEditChainModal = (chain: CustomChainItem) => {
    setEditingChainId(chain.id)
    setChainFormName(chain.name)
    setChainFormDescription(chain.description || "")
    setChainFormSelectedProviderIds(chain.provider_ids || [])
    setChainFormTemperature(typeof chain.temperature === "number" ? chain.temperature : 0.3)
    setChainModalError(null)
    setSelectedProviderToAdd(packages[0]?.id || "")
    setIsChainModalOpen(true)
  }

  const handleSaveChainModal = async () => {
    if (!chainFormName.trim()) {
      setChainModalError("Nama config gabungan wajib diisi.")
      return
    }
    if (chainFormSelectedProviderIds.length === 0) {
      setChainModalError("Pilih minimal 1 endpoint provider untuk dirangkai.")
      return
    }

    setIsSavingChain(true)
    setChainModalError(null)
    try {
      if (editingChainId) {
        const res = await fetch("/api/ai-chains", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingChainId,
            name: chainFormName.trim(),
            description: chainFormDescription.trim(),
            provider_ids: chainFormSelectedProviderIds,
            temperature: chainFormTemperature,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Gagal memperbarui config gabungan")
        }
      } else {
        const res = await fetch("/api/ai-chains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: chainFormName.trim(),
            description: chainFormDescription.trim(),
            provider_ids: chainFormSelectedProviderIds,
            temperature: chainFormTemperature,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Gagal membuat config gabungan")
        }
      }

      setIsChainModalOpen(false)
      await loadChains()
    } catch (err: any) {
      setChainModalError(err.message || "Terjadi kesalahan saat menyimpan config gabungan.")
    } finally {
      setIsSavingChain(false)
    }
  }

  const handleDeleteChain = (chain: CustomChainItem) => {
    setDeleteTarget({
      id: chain.id,
      name: chain.name,
      type: "chain",
    })
  }

  const handleMoveChainProvider = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= chainFormSelectedProviderIds.length) return
    const nextList = [...chainFormSelectedProviderIds]
    const temp = nextList[index]
    nextList[index] = nextList[targetIdx]
    nextList[targetIdx] = temp
    setChainFormSelectedProviderIds(nextList)
  }

  const handleRemoveChainProvider = (index: number) => {
    setChainFormSelectedProviderIds(chainFormSelectedProviderIds.filter((_, i) => i !== index))
  }

  const handleAddProviderToChain = () => {
    if (!selectedProviderToAdd) return
    setChainFormSelectedProviderIds([...chainFormSelectedProviderIds, selectedProviderToAdd])
  }

  const handleSelectFeatureTarget = async (featureKey: string, targetId: string) => {
    setSavingFeatureKey(featureKey)
    try {
      if (targetId.startsWith("chain_")) {
        // Simpan pemetaan ke config gabungan (Chain)
        await fetch("/api/ai-chains", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignments: { [featureKey]: targetId },
          }),
        })
        setChainAssignments((prev) => ({ ...prev, [featureKey]: targetId }))
      } else {
        // Hapus pemetaan chain jika sebelumnya ada
        await fetch("/api/ai-chains", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignments: { [featureKey]: null },
          }),
        })
        setChainAssignments((prev) => ({ ...prev, [featureKey]: null }))

        // Update single provider mapping di tabel prisma
        await fetch("/api/ai-feature-mappings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature_key: featureKey,
            provider_id: targetId || null,
          }),
        })
        setFeatureMappings((prev) =>
          prev.map((f) => (f.feature_key === featureKey ? { ...f, provider_id: targetId || null } : f))
        )
      }
    } catch (err) {
      console.error("Gagal update target fitur:", err)
    } finally {
      setSavingFeatureKey(null)
    }
  }

  const handleUpdateFeatureMapping = async (
    feature_key: string,
    updates: Partial<{ provider_id: string | null; temperature: number; max_tokens: number }>
  ) => {
    setSavingFeatureKey(feature_key)
    try {
      const res = await fetch("/api/ai-feature-mappings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature_key,
          ...updates,
        }),
      })
      if (res.ok) {
        setFeatureMappings((prev) =>
          prev.map((f) => (f.feature_key === feature_key ? { ...f, ...updates } : f))
        )
      }
    } catch (err) {
      console.error("Gagal update mapping:", err)
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
        const sorted = [...data.data].sort((a: any, b: any) => (b.priority ?? 0) - (a.priority ?? 0))
        const mapped: AiEndpointPackage[] = sorted.map((p: any, i: number) => ({
          id: p.id,
          name: p.name,
          provider: p.provider || p.alias || "openai",
          endpointUrl: p.endpointUrl || p.base_url || "https://api.openai.com/v1",
          apiKey: p.apiKey || p.api_key || "",
          model: p.model || "gpt-4o-mini",
          status: p.isActive !== false ? "active" : "offline",
          latencyMs: 0,
          requestsTotal: 0,
          priority: typeof p.priority === "number" ? p.priority : 0,
          isPrimary: i === 0,
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
    const defaultEndpoint = "https://api.openai.com/v1"
    setFormEndpoint(defaultEndpoint)
    setFormApiKey("")
    const models = getCachedModelsForEndpoint(defaultEndpoint, "openai")
    setFormAvailableModels(models)
    setFormModel(models[0] || "gpt-4o-mini")
    const nextPriority = packages.length > 0 ? Math.max(...packages.map((p) => p.priority)) + 10 : 100
    setFormPriority(nextPriority)
    setModelSearchQuery("")
    setIsModelDropdownOpen(false)
    setModalMessage(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (pkg: AiEndpointPackage) => {
    setEditingPackageId(pkg.id)
    setFormName(pkg.name)
    setFormProvider(pkg.provider as any)
    setFormEndpoint(pkg.endpointUrl)
    setFormApiKey("") // Kosongkan agar user tidak perlu menginput ulang dan tidak tertimpa asterisk
    setFormModel(pkg.model)
    setFormPriority(pkg.priority)
    
    // Ambil model yang tersimpan di cache lokal + model aktif saat ini
    const cachedModels = getCachedModelsForEndpoint(pkg.endpointUrl, pkg.provider, pkg.model)
    setFormAvailableModels(cachedModels)
    
    setModelSearchQuery("")
    setIsModelDropdownOpen(false)
    setModalMessage(null)
    setIsModalOpen(true)
  }

  const handleFetchModelsFromEndpoint = async () => {
    if (!formEndpoint.trim()) {
      setModalMessage({ type: "error", text: "Masukkan Endpoint URL terlebih dahulu." })
      return
    }
    // Jika tidak ada apiKey, tapi ini bukan ollama dan bukan sedang mengedit endpoint yang tersimpan di DB
    if (!formApiKey.trim() && formProvider !== "ollama" && !editingPackageId) {
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
          apiKey: formApiKey.trim() || undefined,
          providerId: editingPackageId || undefined,
        }),
      })

      const data = await res.json()

      if (data.ok && Array.isArray(data.models) && data.models.length > 0) {
        const mergedModels = Array.from(new Set([formModel, ...data.models])).filter(Boolean)
        setFormAvailableModels(mergedModels)
        saveCachedModelsForEndpoint(formEndpoint.trim(), formProvider, mergedModels)
        if (!mergedModels.includes(formModel)) {
          setFormModel(data.models[0])
        }
        setModalMessage({
          type: "success",
          text: `Berhasil memuat & menyimpan ${data.models.length} model dari endpoint (${data.latencyMs}ms)`,
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
    if (!formName.trim() || !formEndpoint.trim() || !formModel.trim()) return

    try {
      // Simpan model aktif dan seluruh opsi model ke cache lokal agar tidak hilang
      saveCachedModelsForEndpoint(formEndpoint.trim(), formProvider, [formModel.trim(), ...formAvailableModels])

      if (editingPackageId && !editingPackageId.startsWith("pkg-")) {
        // Direct DB Update via PUT
        const payload: any = {
          name: formName.trim(),
          label: formName.trim(),
          endpointUrl: formEndpoint.trim(),
          model: formModel.trim(),
          alias: formProvider,
          priority: formPriority,
        }
        // Hanya update apiKey jika user secara eksplisit mengetik API key baru
        if (formApiKey.trim() && !formApiKey.includes("••••")) {
          payload.apiKey = formApiKey.trim()
        }

        await fetch(`/api/ai-providers/${editingPackageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
            apiKey: formApiKey.trim() || (formProvider === "ollama" ? "ollama" : "sk-placeholder"),
            model: formModel.trim(),
            priority: formPriority,
            authType: formProvider === "ollama" ? "none" : "apikey",
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

  const handleDeletePackage = (pkg: AiEndpointPackage) => {
    setDeleteTarget({
      id: pkg.id,
      name: pkg.name,
      type: "package",
      model: pkg.model,
      endpointUrl: pkg.endpointUrl,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (deleteTarget.type === "package") {
        if (!deleteTarget.id.startsWith("pkg-")) {
          const res = await fetch(`/api/ai-providers/${deleteTarget.id}`, { method: "DELETE" })
          const data = await res.json()
          if (!data.success && res.status !== 200) {
            throw new Error(data.message || "Gagal menghapus provider dari database.")
          }
        }
        await loadProviders()
        showNotification("success", `Konfigurasi node "${deleteTarget.name}" berhasil dihapus.`)
      } else {
        const res = await fetch(`/api/ai-chains?id=${deleteTarget.id}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
          await loadChains()
          showNotification("success", `Config gabungan "${deleteTarget.name}" berhasil dihapus.`)
        } else {
          throw new Error(data.message || "Gagal menghapus config gabungan.")
        }
      }
      setDeleteTarget(null)
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan saat menghapus konfigurasi.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      const maxPri = packages.reduce((max, p) => Math.max(max, p.priority), 0)
      await fetch(`/api/ai-providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: maxPri + 10 }),
      })
      await loadProviders()
    } catch {
      // ignore
    }
  }

  const handleMovePriority = async (pkgId: string, direction: "up" | "down") => {
    const sorted = [...packages].sort((a, b) => b.priority - a.priority)
    const idx = sorted.findIndex((p) => p.id === pkgId)
    if (idx === -1) return
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= sorted.length) return

    const currentPkg = sorted[idx]
    const targetPkg = sorted[targetIdx]

    let newCurrentPriority = targetPkg.priority
    let newTargetPriority = currentPkg.priority
    if (newCurrentPriority === newTargetPriority) {
      if (direction === "up") {
        newCurrentPriority += 10
      } else {
        newCurrentPriority = Math.max(0, newCurrentPriority - 10)
      }
    }

    try {
      await Promise.all([
        fetch(`/api/ai-providers/${currentPkg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: newCurrentPriority }),
        }),
        fetch(`/api/ai-providers/${targetPkg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: newTargetPriority }),
        }),
      ])
      await loadProviders()
    } catch (err) {
      console.error("Gagal ubah urutan prioritas:", err)
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
    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "models",
          endpointUrl: pkg.endpointUrl,
          apiKey: pkg.apiKey,
          providerId: pkg.id,
        }),
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
          providerId: playgroundPackage.id,
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
      {/* Floating Alert / Toast Notification (Always visible on screen without scrolling) */}
      <AnimatePresence>
        {globalAlert && (
          <div className="fixed top-5 right-5 z-[9999] max-w-md w-full px-4 sm:px-0 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-3.5 rounded-[10px] border text-xs font-semibold flex items-center justify-between shadow-2xl backdrop-blur-md ${
                globalAlert.type === "success"
                  ? "bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100"
                  : "bg-rose-50/95 dark:bg-rose-950/95 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full shrink-0 ${
                    globalAlert.type === "success"
                      ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                      : "bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200"
                  }`}
                >
                  {globalAlert.type === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
                <div className="leading-snug">
                  <p className="font-bold">
                    {globalAlert.type === "success" ? "Berhasil" : "Pemberitahuan"}
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5">{globalAlert.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGlobalAlert(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition shrink-0 ml-3"
              >
                <X size={14} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-navy-50 dark:bg-navy-950/80 border border-navy-100 dark:border-navy-800 text-[#1F3578] dark:text-navy-300">
              <Server size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Primary
            </span>
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Paket Utama Aktif</h3>
          <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 truncate">{primaryPackage?.name || "Tanpa Paket"}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/80 border border-orange-100 dark:border-orange-900/60 text-orange-600 dark:text-orange-400">
              <Globe size={18} />
            </div>
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Total Endpoint Node</h3>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50">{packages.length} Node</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/60 text-[#1738D1] dark:text-blue-400">
              <Workflow size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              Preset
            </span>
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Config Gabungan</h3>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50">{chains.length} Rantai</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <Zap size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              Cascade
            </span>
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Strategi Rotasi</h3>
          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wide">AUTO FAILOVER</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Pindah node otomatis saat limit/error</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400">
              <Sparkles size={18} />
            </div>
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Model Utama</h3>
          <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 font-mono truncate">{primaryPackage?.model || "-"}</p>
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
            {packages.map((pkg, index) => (
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
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                          #{index + 1}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">{pkg.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pkg.provider}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          (Pri: {pkg.priority})
                        </span>
                      </div>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMovePriority(pkg.id, "up")}
                        disabled={index === 0}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        title="Naikkan Urutan Failover"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMovePriority(pkg.id, "down")}
                        disabled={index === packages.length - 1}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        title="Turunkan Urutan Failover"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
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
                        onClick={() => handleDeletePackage(pkg)}
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

      {/* Config Gabungan (AI Routing Chains) Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Workflow size={20} className="text-orange-500" />
              Config Gabungan / Rantai Provider AI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rangkai beberapa endpoint provider menjadi urutan failover bertingkat (Cascade). Fitur aplikasi di bawah tinggal memilih config ini.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadChains}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <RefreshCw size={13} className={loadingChains ? "animate-spin" : ""} />
              <span>Segarkan</span>
            </button>
            <button
              onClick={handleOpenAddChainModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Buat Config Gabungan</span>
            </button>
          </div>
        </div>

        {loadingChains ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-orange-500" />
            Memuat config gabungan...
          </div>
        ) : chains.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-500 flex items-center justify-center mx-auto">
              <Workflow size={24} />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Belum Ada Config Gabungan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Buat kombinasi rantai pertama Anda (misal: Groq ➔ OpenAI ➔ Custom Proxy) untuk memastikan fitur aplikasi tidak pernah down saat rate limit.
              </p>
            </div>
            <button
              onClick={handleOpenAddChainModal}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Buat Config Gabungan Baru</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chains.map((chain) => {
              const assignedFeatures = Object.entries(chainAssignments)
                .filter(([_, chainId]) => chainId === chain.id)
                .map(([fKey]) => {
                  const feat = featureMappings.find((f) => f.feature_key === fKey)
                  return feat ? feat.feature_name : fKey
                })

              const chainProviders =
                chain.providers && chain.providers.length > 0
                  ? chain.providers
                  : chain.provider_ids.map((id) => packages.find((p) => p.id === id)).filter(Boolean)

              return (
                <div
                  key={chain.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-orange-300 dark:hover:border-orange-900 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                            <Workflow size={15} />
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                            {chain.name}
                          </h3>
                        </div>
                        {chain.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {chain.description}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                        {chainProviders.length} Node
                      </span>
                    </div>

                    {/* Sequence list */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Urutan Failover (Cascade Flow):
                      </span>
                      <div className="space-y-1.5">
                        {chainProviders.map((cp: any, idx: number) => (
                          <div
                            key={cp?.id || idx}
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                  idx === 0
                                    ? "bg-orange-500 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              <div className="truncate">
                                <span className="font-bold text-slate-800 dark:text-slate-200 mr-1.5 truncate">
                                  {cp?.name || "Node"}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  ({cp?.model || "-"})
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                              {idx === 0 ? "Utama" : `Cadangan ${idx}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features using this chain */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Digunakan Oleh Fitur:
                      </span>
                      {assignedFeatures.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedFeatures.map((featName) => (
                            <span
                              key={featName}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                              {featName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum dihubungkan ke fitur
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">
                      Temp: {typeof chain.temperature === "number" ? chain.temperature : "0.3 (Default)"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditChainModal(chain)}
                        className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteChain(chain)}
                        className="px-2.5 py-1 text-rose-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
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
              Pilih Config Gabungan (atau endpoint node spesifik) untuk masing-masing fitur aplikasi.
            </p>
          </div>
          <button
            onClick={() => {
              loadFeatureMappings()
              loadChains()
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <RefreshCw size={13} className={loadingMappings || loadingChains ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureMappings.map((feat) => {
            const assignedChainId = chainAssignments[feat.feature_key]
            const assignedChain = assignedChainId ? chains.find((c) => c.id === assignedChainId) : null
            const assignedPkg = !assignedChain && feat.provider_id ? packages.find((p) => p.id === feat.provider_id) : null
            const currentTargetValue = assignedChainId || feat.provider_id || ""
            const isSaving = savingFeatureKey === feat.feature_key

            // Build active cascade list
            const chainProviders = assignedChain
              ? assignedChain.providers && assignedChain.providers.length > 0
                ? assignedChain.providers
                : assignedChain.provider_ids.map((id) => packages.find((p) => p.id === id)).filter(Boolean)
              : null

            return (
              <div
                key={feat.feature_key}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  assignedChain
                    ? "border-blue-300 dark:border-blue-900/70 ring-1 ring-blue-400/20"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-orange-200"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-navy-50 dark:bg-navy-950/80 text-[#1F3578] dark:text-blue-400 border border-navy-200 dark:border-navy-800 uppercase tracking-wider">
                        {feat.feature_key}
                      </span>
                      {assignedChain && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <Link2 size={10} /> Chain
                        </span>
                      )}
                    </div>
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
                      Target Provider / Config Gabungan
                    </label>
                    <select
                      value={currentTargetValue}
                      onChange={(e) => handleSelectFeatureTarget(feat.feature_key, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="">(Default: Mengikuti Urutan Pool Global)</option>

                      {chains.length > 0 && (
                        <optgroup label="⚡ Config Gabungan (Failover Cascade)">
                          {chains.map((chain) => (
                            <option key={chain.id} value={chain.id}>
                              🔗 {chain.name} ({chain.providers?.length || chain.provider_ids.length} Node Failover)
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <optgroup label="🌐 Endpoint Node Tunggal (Direct)">
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            Node: {pkg.name} ({pkg.provider.toUpperCase()} • {pkg.model})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {assignedChain
                        ? `Memakai config gabungan "${assignedChain.name}" dengan urutan failover otomatis.`
                        : assignedPkg
                        ? `Node langsung (${assignedPkg.name}). Bila limit, beralih ke antrean pool.`
                        : `Otomatis dieksekusi berdasarkan urutan prioritas pool tertinggi.`}
                    </p>
                  </div>

                  {/* Simulasi Rantai Failover */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Rantai Failover:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {assignedChain ? "Chain Cascade" : "Pool Cascade"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
                      {assignedChain && chainProviders && chainProviders.length > 0 ? (
                        chainProviders.map((cp: any, pIdx: number) => (
                          <span key={cp?.id || pIdx} className="flex items-center gap-1">
                            {pIdx > 0 && <span className="text-slate-400">➔</span>}
                            <span
                              className={`px-1.5 py-0.5 rounded font-extrabold ${
                                pIdx === 0
                                  ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60"
                                  : "text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700/80"
                              }`}
                            >
                              {pIdx + 1}. {cp?.name || "Node"}
                            </span>
                          </span>
                        ))
                      ) : assignedPkg ? (
                        <>
                          <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/60">
                            1. {assignedPkg.name}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-slate-500 font-medium italic">Fallback ke Pool</span>
                        </>
                      ) : (
                        <>
                          <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/60">
                            1. {packages[0]?.name || "Primary Node"}
                          </span>
                          {packages.slice(1, 3).map((p, pIdx) => (
                            <span key={p.id} className="text-slate-400 flex items-center gap-1">
                              <span>➔</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {pIdx + 2}. {p.name}
                              </span>
                            </span>
                          ))}
                          {packages.length > 3 && <span className="text-slate-400">➔ ...</span>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Model Aktif:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                      {assignedChain && chainProviders && chainProviders.length > 0
                        ? `${chainProviders[0]?.model || "-"} (${chainProviders.length} node)`
                        : assignedPkg
                        ? assignedPkg.model
                        : primaryPackage?.model || "gpt-4o-mini"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Status Endpoint:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        assignedChain
                          ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800"
                          : (assignedPkg?.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
                      }`}
                    >
                      {assignedChain
                        ? `CHAIN ACTIVE (${chainProviders?.length || 0} NODES)`
                        : assignedPkg
                        ? assignedPkg.status.toUpperCase()
                        : "AUTO FALLBACK"}
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
                        const models = getCachedModelsForEndpoint(formEndpoint, v)
                        setFormAvailableModels(models)
                        setFormModel(models[0] || "gpt-4o-mini")
                      }}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-xs font-bold focus:outline-none focus:border-orange-500"
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
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-xs font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">API Key</label>
                    {editingPackageId && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Key tersimpan aman di DB
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder={
                      editingPackageId
                        ? "•••••••• (Tersimpan di DB — kosongkan jika tidak ingin mengubah)"
                        : formProvider === "ollama"
                        ? "Opsional untuk Ollama / Local AI"
                        : "sk-proj-..."
                    }
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-xs font-mono focus:outline-none focus:border-orange-500 transition"
                  />
                  {editingPackageId && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Biarkan kosong jika tidak ingin mengubah API Key. Sistem otomatis memakai key yang sudah tersimpan saat load model maupun request AI.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Pilih Model AI</label>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {formAvailableModels.length} Model
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFetchModelsFromEndpoint}
                      disabled={isFetchingModels}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <RefreshCw size={12} className={isFetchingModels ? "animate-spin" : ""} />
                      <span>{isFetchingModels ? "Memuat Model..." : "Muat Model dari Endpoint"}</span>
                    </button>
                  </div>

                  {/* Searchable Dropdown Model Container (Design System compliant) */}
                  <div className="relative" ref={modelDropdownRef}>
                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs focus:outline-none focus:border-orange-500"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Cpu size={14} className="text-orange-500 shrink-0" />
                        <span className="font-mono font-bold truncate text-slate-900 dark:text-slate-100">
                          {formModel || "Pilih model AI..."}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${isModelDropdownOpen ? "rotate-180 text-orange-500" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Dropdown Menu Panel */}
                    {isModelDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                        {/* Search Input Header */}
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                          <div className="relative flex items-center">
                            <Search size={14} className="text-slate-400 absolute left-2.5" />
                            <input
                              type="text"
                              autoFocus
                              value={modelSearchQuery}
                              onChange={(e) => setModelSearchQuery(e.target.value)}
                              placeholder="Cari atau ketik nama model baru..."
                              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[8px] text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                            />
                            {modelSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setModelSearchQuery("")}
                                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Custom Model Quick Adder if query doesn't match an existing model */}
                        {modelSearchQuery.trim() &&
                          !formAvailableModels.some(
                            (m) => m.toLowerCase() === modelSearchQuery.trim().toLowerCase()
                          ) && (
                            <div className="p-1 border-b border-slate-100 dark:border-slate-800 bg-orange-50/50 dark:bg-orange-950/20">
                              <button
                                type="button"
                                onClick={() => {
                                  const customModel = modelSearchQuery.trim()
                                  const updated = Array.from(new Set([customModel, ...formAvailableModels]))
                                  setFormAvailableModels(updated)
                                  setFormModel(customModel)
                                  saveCachedModelsForEndpoint(formEndpoint.trim(), formProvider, updated)
                                  setModelSearchQuery("")
                                  setIsModelDropdownOpen(false)
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-orange-100/70 dark:hover:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Plus size={13} className="shrink-0" />
                                  <span className="truncate">
                                    Gunakan model <span className="font-mono underline">"{modelSearchQuery.trim()}"</span>
                                  </span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-orange-200/60 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 shrink-0">
                                  Kustom
                                </span>
                              </button>
                            </div>
                          )}

                        {/* Model Items List */}
                        <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
                          {(() => {
                            const filtered = formAvailableModels.filter((m) =>
                              m.toLowerCase().includes(modelSearchQuery.trim().toLowerCase())
                            )
                            if (filtered.length === 0) {
                              return (
                                <div className="px-3 py-4 text-center text-xs text-slate-400">
                                  Tidak ada model yang cocok dengan kata kunci.
                                </div>
                              )
                            }
                            return filtered.map((m) => {
                              const isSelected = m === formModel
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setFormModel(m)
                                    setIsModelDropdownOpen(false)
                                    setModelSearchQuery("")
                                    saveCachedModelsForEndpoint(formEndpoint.trim(), formProvider, [m, ...formAvailableModels])
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-[8px] text-xs flex items-center justify-between transition cursor-pointer ${
                                    isSelected
                                      ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold border border-orange-200/60 dark:border-orange-800/40"
                                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                                  }`}
                                >
                                  <span className="font-mono truncate">{m}</span>
                                  {isSelected && <Check size={14} className="text-orange-600 dark:text-orange-400 shrink-0" />}
                                </button>
                              )
                            })
                          })()}
                        </div>

                        {/* Dropdown Footer */}
                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Model otomatis tersimpan di cache</span>
                          <span className="font-mono">{formAvailableModels.length} pilihan</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Prioritas Urutan Failover (Angka)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Nilai lebih tinggi dieksekusi lebih dulu
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formPriority}
                    onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                    placeholder="misal: 100"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {formPriority >= (packages[0]?.priority || 10)
                      ? "Node ini akan berada di urutan prioritas teratas pool."
                      : "Node ini akan bertindak sebagai cadangan otomatis saat node sebelumnya error."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                  Batal
                </button>
                <button
                  onClick={handleSavePackageModal}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-[10px] shadow-sm transition-all cursor-pointer"
                >
                  {editingPackageId ? "Simpan Perubahan" : "Tambah Node"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Popup */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-2xl w-full max-w-md p-6 space-y-4 relative"
            >
              {/* Header Icon & Title */}
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    Hapus Konfigurasi {deleteTarget.type === "package" ? "Node Provider" : "Config Gabungan"}?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Konfirmasi penghapusan konfigurasi AI
                  </p>
                </div>
              </div>

              {/* Target Details Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-[10px] border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Nama Konfigurasi:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{deleteTarget.name}</span>
                </div>
                {deleteTarget.model && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Model AI:</span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-[11px]">
                      {deleteTarget.model}
                    </span>
                  </div>
                )}
                {deleteTarget.endpointUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Endpoint URL:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 text-[10px] truncate max-w-[210px]">
                      {deleteTarget.endpointUrl}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Text */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tindakan ini <strong className="text-rose-600 dark:text-rose-400">permanen</strong>. Konfigurasi ini akan dihapus dari sistem dan fitur aplikasi tidak dapat memanggil endpoint ini lagi.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Ya, Hapus Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Chain Drawer (Slide in from Right) */}
      <AnimatePresence>
        {isChainModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChainModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Right Drawer Box */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="absolute inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <Workflow size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                      {editingChainId ? "Edit Config Gabungan" : "Buat Config Gabungan Baru"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Atur preset rantai eksekusi AI bertingkat (Cascade failover)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChainModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chainModalError && (
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{chainModalError}</span>
                  </div>
                )}

                {/* Section 1: Informasi Dasar */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Informasi Preset
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Config Gabungan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Rantai Hemat & Cepat (Groq + Mini)"
                      value={chainFormName}
                      onChange={(e) => setChainFormName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Deskripsi Singkat (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Utama menggunakan Groq, failover ke OpenAI Mini jika limit"
                      value={chainFormDescription}
                      onChange={(e) => setChainFormDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Section 2: Sequence of Providers */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Urutan Eksekusi Failover (Cascade Flow)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Node urutan #1 dieksekusi pertama kali. Bila limit/error, sistem otomatis pindah ke node berikutnya.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {chainFormSelectedProviderIds.length} Node
                    </span>
                  </div>

                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {chainFormSelectedProviderIds.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 italic text-xs space-y-1">
                        <p>Belum ada endpoint yang dimasukkan ke rantai ini.</p>
                        <p className="text-[10px]">Pilih endpoint di bawah lalu klik "Tambah ke Rantai".</p>
                      </div>
                    ) : (
                      chainFormSelectedProviderIds.map((pid, idx) => {
                        const pkg = packages.find((p) => p.id === pid)
                        return (
                          <div
                            key={`${pid}-${idx}`}
                            className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-extrabold shrink-0 ${
                                  idx === 0
                                    ? "bg-orange-500 text-white shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              <div className="truncate">
                                <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                  {pkg?.name || pid}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400">
                                  {pkg ? `${pkg.provider.toUpperCase()} • ${pkg.model}` : "Endpoint Node"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveChainProvider(idx, "up")}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 cursor-pointer"
                                title="Naikkan Urutan"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === chainFormSelectedProviderIds.length - 1}
                                onClick={() => handleMoveChainProvider(idx, "down")}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 cursor-pointer"
                                title="Turunkan Urutan"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveChainProvider(idx)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 cursor-pointer ml-1"
                                title="Hapus dari Rantai"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}

                    {/* Add provider to chain picker */}
                    <div className="pt-2 flex items-center gap-2">
                      <select
                        value={selectedProviderToAdd}
                        onChange={(e) => setSelectedProviderToAdd(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg.provider.toUpperCase()} • {pkg.model})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddProviderToChain}
                        disabled={packages.length === 0}
                        className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-white transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Tambah ke Rantai</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 3: Temperature Override */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Temperature Override (Opsional)
                    </label>
                    <span className="font-mono text-xs text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900">
                      {chainFormTemperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={chainFormTemperature}
                    onChange={(e) => setChainFormTemperature(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>0.0 (Presisi & Konsisten)</span>
                    <span>1.0 (Kreatif)</span>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsChainModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveChainModal}
                  disabled={isSavingChain}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingChain ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>{editingChainId ? "Simpan Perubahan" : "Simpan Config Gabungan"}</span>
                    </>
                  )}
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
