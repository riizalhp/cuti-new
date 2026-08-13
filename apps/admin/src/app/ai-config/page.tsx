"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  Key,
  Globe,
  Sliders,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Save,
  Check,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Server,
  Send,
  Eye,
  EyeOff,
  Terminal,
  ShieldCheck,
  Edit3,
  ExternalLink,
  PackageCheck,
  MessageSquare,
  X,
  Bot,
  User,
  CornerDownLeft
} from "lucide-react"

export interface AiEndpointPackage {
  id: string
  name: string
  provider: "openai" | "azure" | "custom_proxy" | "ollama"
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

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  metrics?: {
    ok: boolean
    status: number
    statusText?: string
    latencyMs: number
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    error?: string
    raw?: any
  }
}

const DEFAULT_MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-3.5-turbo", "o1-mini"],
  azure: ["gpt-4o-deployment", "gpt-4o-mini-deployment", "gpt-35-turbo-deployment"],
  custom_proxy: ["deepseek-r1", "deepseek-v3", "qwen2.5-coder-32b", "claude-3-5-sonnet-proxy", "gpt-4o-mini"],
  ollama: ["llama3.2:latest", "mistral:7b-instruct", "gemma2:9b", "deepseek-r1:8b", "codellama:7b"]
}

export default function AiConfigPage() {
  // Multi-Endpoint Packages Pool State
  const [packages, setPackages] = useState<AiEndpointPackage[]>([
    {
      id: "pkg-1",
      name: "OpenAI Primary Node",
      provider: "openai",
      endpointUrl: "https://api.openai.com/v1",
      apiKey: "",
      model: "gpt-4o-mini",
      status: "active",
      latencyMs: 380,
      requestsTotal: 14280,
      isPrimary: true,
      temperature: 0.3,
      maxTokens: 512,
    },
    {
      id: "pkg-2",
      name: "DeepSeek Proxy Backup",
      provider: "custom_proxy",
      endpointUrl: "https://api.deepseek.com/v1",
      apiKey: "",
      model: "deepseek-r1",
      status: "active",
      latencyMs: 520,
      requestsTotal: 3410,
      isPrimary: false,
      temperature: 0.3,
      maxTokens: 1024,
    },
    {
      id: "pkg-3",
      name: "Ollama Local GPU Server",
      provider: "ollama",
      endpointUrl: "http://localhost:11434/v1",
      apiKey: "",
      model: "llama3.2:latest",
      status: "offline",
      latencyMs: 0,
      requestsTotal: 120,
      isPrimary: false,
      temperature: 0.3,
      maxTokens: 512,
    },
  ])

  // Active Primary Package
  const primaryPackage = packages.find((p) => p.isPrimary) || packages[0]

  // Modal / Form States for Creating/Editing Package
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)

  const [formName, setFormName] = useState("")
  const [formProvider, setFormProvider] = useState<"openai" | "azure" | "custom_proxy" | "ollama">("openai")
  const [formEndpoint, setFormEndpoint] = useState("https://api.openai.com/v1")
  const [formApiKey, setFormApiKey] = useState("")
  const [formModel, setFormModel] = useState("gpt-4o-mini")
  const [isCustomFormModel, setIsCustomFormModel] = useState(false)
  const [customFormModelInput, setCustomFormModelInput] = useState("")
  const [formAvailableModels, setFormAvailableModels] = useState<string[]>(DEFAULT_MODELS_BY_PROVIDER.openai)
  const [formTemperature, setFormTemperature] = useState(0.3)
  const [formMaxTokens, setFormMaxTokens] = useState(512)

  const [isFetchingFormModels, setIsFetchingFormModels] = useState(false)
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // System Settings State
  const [rotationStrategy, setRotationStrategy] = useState<"round_robin" | "least_used" | "failover">("failover")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showKeySecrets, setShowKeySecrets] = useState<Record<string, boolean>>({})

  // RIGHT-HAND SLIDE-IN PLAYGROUND DRAWER STATE
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerPackage, setDrawerPackage] = useState<AiEndpointPackage | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isSendingChat, setIsSendingChat] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Load saved packages & strategy from localStorage on mount
  useEffect(() => {
    try {
      const savedPkgs = localStorage.getItem("cuti_admin_ai_packages")
      if (savedPkgs) {
        const parsed = JSON.parse(savedPkgs)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPackages(parsed)
        }
      }
      const savedStrategy = localStorage.getItem("cuti_admin_ai_strategy")
      if (savedStrategy) {
        setRotationStrategy(savedStrategy as any)
      }
    } catch {
      // fallback to initial default
    }
  }, [])

  // Auto save packages to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem("cuti_admin_ai_packages", JSON.stringify(packages))
    } catch {}
  }, [packages])

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, isSendingChat])

  // Handlers for Package Management
  const handleOpenAddModal = () => {
    setEditingPackageId(null)
    setFormName("")
    setFormProvider("openai")
    setFormEndpoint("https://api.openai.com/v1")
    setFormApiKey("")
    setFormModel("gpt-4o-mini")
    setIsCustomFormModel(false)
    setCustomFormModelInput("")
    setFormAvailableModels(DEFAULT_MODELS_BY_PROVIDER.openai)
    setFormTemperature(0.3)
    setFormMaxTokens(512)
    setModalMessage(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (pkg: AiEndpointPackage) => {
    setEditingPackageId(pkg.id)
    setFormName(pkg.name)
    setFormProvider(pkg.provider)
    setFormEndpoint(pkg.endpointUrl)
    setFormApiKey(pkg.apiKey)
    setFormModel(pkg.model)
    setIsCustomFormModel(false)
    setCustomFormModelInput("")
    setFormAvailableModels(DEFAULT_MODELS_BY_PROVIDER[pkg.provider] || [pkg.model])
    setFormTemperature(pkg.temperature)
    setFormMaxTokens(pkg.maxTokens)
    setModalMessage(null)
    setIsModalOpen(true)
  }

  const handleSavePackageModal = () => {
    if (!formName.trim() || !formEndpoint.trim()) return

    const selectedModelName = isCustomFormModel ? customFormModelInput || "custom-model" : formModel

    if (editingPackageId) {
      // Edit existing package
      setPackages(
        packages.map((p) => {
          if (p.id === editingPackageId) {
            return {
              ...p,
              name: formName.trim(),
              provider: formProvider,
              endpointUrl: formEndpoint.trim(),
              apiKey: formApiKey.trim(),
              model: selectedModelName,
              temperature: formTemperature,
              maxTokens: formMaxTokens,
            }
          }
          return p
        })
      )
    } else {
      // Create new package
      const newPkg: AiEndpointPackage = {
        id: `pkg-${Date.now()}`,
        name: formName.trim(),
        provider: formProvider,
        endpointUrl: formEndpoint.trim(),
        apiKey: formApiKey.trim(),
        model: selectedModelName,
        status: "active",
        latencyMs: 0,
        requestsTotal: 0,
        isPrimary: packages.length === 0,
        temperature: formTemperature,
        maxTokens: formMaxTokens,
      }
      setPackages([...packages, newPkg])
    }
    setIsModalOpen(false)
  }

  const handleDeletePackage = (id: string) => {
    if (packages.length <= 1) return
    const filtered = packages.filter((p) => p.id !== id)
    if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
      filtered[0].isPrimary = true
    }
    setPackages(filtered)
  }

  const handleSetPrimaryPackage = (id: string) => {
    setPackages(
      packages.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }))
    )
  }

  const toggleKeyVisibility = (id: string) => {
    setShowKeySecrets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // REAL HTTP FETCH MODELS inside Modal
  const handleFetchModalModels = async () => {
    if (!formApiKey && formProvider !== "ollama") {
      setModalMessage({
        type: "error",
        text: "Masukkan API Key terlebih dahulu di atas untuk memuat daftar model dari server!",
      })
      return
    }

    setIsFetchingFormModels(true)
    setModalMessage(null)

    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "models",
          endpointUrl: formEndpoint,
          apiKey: formApiKey,
        }),
      })

      const data = await res.json()

      if (data.ok && Array.isArray(data.models) && data.models.length > 0) {
        setFormAvailableModels(data.models)
        setFormModel(data.models[0])
        setIsCustomFormModel(false)
        setModalMessage({
          type: "success",
          text: `Berhasil memuat ${data.count} model asli dari endpoint dalam ${data.latencyMs} ms!`,
        })
      } else {
        setModalMessage({
          type: "error",
          text: data.error || `HTTP ${data.status}: Gagal mengambil model dari endpoint.`,
        })
      }
    } catch (err: any) {
      setModalMessage({
        type: "error",
        text: `Error koneksi: ${err.message || "Gagal menghubungi proxy"}`,
      })
    } finally {
      setIsFetchingFormModels(false)
    }
  }

  // OPEN RIGHT-HAND SLIDE-IN CHATBOT PLAYGROUND DRAWER
  const handleOpenPlaygroundDrawer = (pkg: AiEndpointPackage) => {
    setDrawerPackage(pkg)
    setChatMessages([
      {
        id: `sys-${Date.now()}`,
        role: "system",
        content: `Playground terhubung ke paket '${pkg.name}' (${pkg.endpointUrl}) dengan model '${pkg.model}'.`,
        timestamp: new Date().toLocaleTimeString("id-ID"),
      },
    ])
    setIsDrawerOpen(true)
  }

  // SEND REAL CHAT MESSAGE IN DRAWER PLAYGROUND
  const handleSendChatMessage = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || chatInput
    if (!promptToSend.trim() || !drawerPackage || isSendingChat) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID"),
    }

    setChatMessages((prev) => [...prev, userMsg])
    if (!overridePrompt) setChatInput("")
    setIsSendingChat(true)

    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completion",
          endpointUrl: drawerPackage.endpointUrl,
          apiKey: drawerPackage.apiKey,
          model: drawerPackage.model,
          prompt: promptToSend.trim(),
          temperature: drawerPackage.temperature,
          maxTokens: drawerPackage.maxTokens,
        }),
      })

      const data = await res.json()

      // Update package stats
      setPackages((prev) =>
        prev.map((p) => {
          if (p.id === drawerPackage.id) {
            return {
              ...p,
              requestsTotal: p.requestsTotal + 1,
              latencyMs: data.latencyMs || p.latencyMs,
              status: data.ok ? "active" : data.status === 429 ? "rate_limited" : "offline",
            }
          }
          return p
        })
      )

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: data.ok ? data.content : data.error || "Gagal mendapatkan respon dari AI",
        timestamp: new Date().toLocaleTimeString("id-ID"),
        metrics: {
          ok: data.ok,
          status: data.status || (data.ok ? 200 : 500),
          statusText: data.statusText,
          latencyMs: data.latencyMs || 0,
          usage: data.usage,
          error: data.error,
          raw: data.raw,
        },
      }

      setChatMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `Kesalahan koneksi jaringan: ${err.message}`,
        timestamp: new Date().toLocaleTimeString("id-ID"),
        metrics: {
          ok: false,
          status: 500,
          latencyMs: 0,
          error: err.message,
        },
      }
      setChatMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSendingChat(false)
    }
  }

  const handleSaveConfig = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 relative"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
            <Cpu size={26} className="text-orange-500" />
            Konfigurasi Multi-Endpoint & AI Playground
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Setiap Node Membungkus Endpoint URL + API Key + Provider + Model Rujukan dalam 1 Paket Gateway
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            {saveSuccess ? (
              <>
                <Check size={18} />
                Konfigurasi Tersimpan!
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Konfigurasi Pool
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
              Primary Node
            </span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Paket Utama Aktif
          </h3>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50 truncate">
            {primaryPackage?.name || "Tanpa Paket"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/80 border border-orange-100 dark:border-orange-900/60 text-orange-600 dark:text-orange-400">
              <Globe size={20} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {packages.filter((p) => p.status === "active").length} Active Nodes
            </span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Total Endpoint Node
          </h3>
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
            {packages.length} Node Packages
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <Zap size={20} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Failover Strategy
            </span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Strategi Rotasi
          </h3>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
            {rotationStrategy}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Primary Model
            </span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Model Rujukan Utama
          </h3>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50 font-mono truncate">
            {primaryPackage?.model || "gpt-4o-mini"}
          </p>
        </div>
      </div>

      {/* MULTI-ENDPOINT PACKAGE POOL CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Layers size={20} className="text-orange-500" />
              Multi-Endpoint Node Packages Pool
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Daftar paket AI Node terpisah yang terhubung dengan Endpoint & API Key masing-masing
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            Tambah Paket Endpoint Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const showKey = showKeySecrets[pkg.id] || false

            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -2 }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  pkg.isPrimary
                    ? "border-orange-500 ring-2 ring-orange-500/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  {/* Card Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                          {pkg.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {pkg.provider}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {pkg.isPrimary && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500 text-white uppercase tracking-wider shadow-xs">
                          Primary Node
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pkg.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {pkg.status === "active" ? "Aktif" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Bundled Properties */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Endpoint URL
                      </span>
                      <p className="font-mono text-slate-800 dark:text-slate-200 truncate bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                        {pkg.endpointUrl}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Bundled API Key
                      </span>
                      <div className="flex items-center justify-between font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                        <span className="truncate">
                          {pkg.apiKey
                            ? showKey
                              ? pkg.apiKey
                              : `${pkg.apiKey.slice(0, 7)}...${pkg.apiKey.slice(-4)}`
                            : "Tanpa Key (Ollama / Local)"}
                        </span>
                        {pkg.apiKey && (
                          <button
                            onClick={() => toggleKeyVisibility(pkg.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                          >
                            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Bundled Model
                        </span>
                        <p className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                          {pkg.model}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Latensi Real
                        </span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {pkg.latencyMs ? `${pkg.latencyMs} ms` : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* BUTTON TO OPEN RIGHT-HAND SLIDE-IN CHATBOT PLAYGROUND DRAWER */}
                    <button
                      onClick={() => handleOpenPlaygroundDrawer(pkg)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all group"
                    >
                      <MessageSquare size={15} className="group-hover:scale-110 transition-transform" />
                      Uji Paket Ini (Playground)
                    </button>
                    {!pkg.isPrimary && (
                      <button
                        onClick={() => handleSetPrimaryPackage(pkg.id)}
                        className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
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
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      {packages.length > 1 && (
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-slate-400 hover:text-rose-500 flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CREATE / EDIT PACKAGE MODAL WITH DYNAMIC MODEL DROPDOWN SELECTOR */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Cpu size={20} className="text-orange-500" />
                  {editingPackageId ? "Edit Paket AI Node" : "Tambah Paket AI Node Baru"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              </div>

              {modalMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    modalMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {modalMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {modalMessage.text}
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Nama Paket Node
                  </label>
                  <input
                    type="text"
                    placeholder="misal: OpenAI Official Primary, DeepSeek Gateway, Azure Backup"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Provider
                    </label>
                    <select
                      value={formProvider}
                      onChange={(e) => {
                        const newProv = e.target.value as any
                        setFormProvider(newProv)
                        if (newProv === "openai") setFormEndpoint("https://api.openai.com/v1")
                        if (newProv === "ollama") setFormEndpoint("http://localhost:11434/v1")
                        const defs = DEFAULT_MODELS_BY_PROVIDER[newProv] || ["gpt-4o-mini"]
                        setFormAvailableModels(defs)
                        setFormModel(defs[0])
                        setIsCustomFormModel(false)
                      }}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
                    >
                      <option value="openai">OpenAI Official</option>
                      <option value="azure">Azure OpenAI</option>
                      <option value="custom_proxy">Custom Proxy / DeepSeek</option>
                      <option value="ollama">Ollama Local Server</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Base Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={formEndpoint}
                      onChange={(e) => setFormEndpoint(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Bundled API Key
                  </label>
                  <input
                    type="password"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="Masukkan API Key paket ini (sk-proj-...)"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* BUNDLED MODEL DROPDOWN SELECTOR WITH REAL ENDPOINT FETCH */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Bundled Model
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchModalModels}
                      disabled={isFetchingFormModels}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                    >
                      <RefreshCw size={13} className={isFetchingFormModels ? "animate-spin text-orange-500" : ""} />
                      {isFetchingFormModels ? "Memuat Model..." : "Muat Model dari Endpoint Ini"}
                    </button>
                  </div>

                  {!isCustomFormModel ? (
                    <select
                      value={formModel}
                      onChange={(e) => {
                        if (e.target.value === "custom_manual") {
                          setIsCustomFormModel(true)
                        } else {
                          setFormModel(e.target.value)
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                    >
                      <optgroup label={`Daftar Model Endpoint (${formAvailableModels.length})`}>
                        {formAvailableModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom_manual">+ Input Custom Model ID Manual...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ketik Model ID custom..."
                        value={customFormModelInput}
                        onChange={(e) => setCustomFormModelInput(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomFormModel(false)}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300"
                      >
                        Pilih dari List
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleSavePackageModal}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  {editingPackageId ? "Simpan Perubahan Paket" : "Tambah Paket AI"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RIGHT-HAND SLIDE-IN AI CHATBOT PLAYGROUND DRAWER (GEMINI.md Rule) */}
      <AnimatePresence>
        {isDrawerOpen && drawerPackage && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10 w-full max-w-md sm:max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-xs shrink-0">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      {drawerPackage.name}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {drawerPackage.model}
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate max-w-[260px]">
                      {drawerPackage.endpointUrl}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body - Interactive Chat Window */}
              <div
                ref={chatScrollRef}
                className="p-4 overflow-y-auto space-y-4 flex-1 bg-slate-50/40 dark:bg-slate-950/40"
              >
                {chatMessages.map((msg) => {
                  if (msg.role === "system") {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700">
                          {msg.content}
                        </span>
                      </div>
                    )
                  }

                  const isUser = msg.role === "user"

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                          <Bot size={16} />
                        </div>
                      )}

                      <div className={`max-w-[82%] space-y-1.5 ${isUser ? "items-end" : "items-start"}`}>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isUser
                              ? "bg-orange-500 text-white font-medium rounded-tr-none shadow-xs"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Real Response Metrics underneath Assistant Messages */}
                        {!isUser && msg.metrics && (
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] space-y-1.5">
                            <div className="flex items-center justify-between font-bold">
                              <span
                                className={`flex items-center gap-1 ${
                                  msg.metrics.ok
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {msg.metrics.ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                HTTP {msg.metrics.status} {msg.metrics.statusText || ""}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> {msg.metrics.latencyMs} ms
                              </span>
                              {msg.metrics.usage && (
                                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                  <Layers size={12} /> {msg.metrics.usage.total_tokens} Tokens
                                </span>
                              )}
                            </div>

                            {msg.metrics.raw && (
                              <details className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                                <summary className="cursor-pointer font-bold hover:text-slate-800 dark:hover:text-slate-200">
                                  Lihat Raw JSON Payload
                                </summary>
                                <pre className="mt-1 p-2 bg-[#0B132B] text-slate-200 rounded font-mono text-[9px] overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(msg.metrics.raw, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}

                        <span className="text-[9px] text-slate-400 block px-1">
                          {msg.timestamp}
                        </span>
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  )
                })}

                {isSendingChat && (
                  <div className="flex items-center gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                      <Bot size={16} />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-orange-500" />
                      Memproses request HTTP real ke {drawerPackage.endpointUrl}...
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer - Quick Chips & Chat Input */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                {/* Quick Test Prompt Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    "kamu model apa?",
                    "Uji sintesis CV ATS",
                    "Format output JSON",
                    "Uji latensi jaringan",
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSendChatMessage(chip)}
                      disabled={isSendingChat}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      ⚡ {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Input Field */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendChatMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ketik pesan uji coba AI real..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isSendingChat}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isSendingChat}
                    className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
