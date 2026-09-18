"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import {
  TrendingUp,
  Sparkles,
  FlaskConical,
  NotebookPen,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  X,
  BarChart3,
  Save,
  ChevronDown,
  History,
  HardDrive,
  RotateCcw,
  Clock,
} from "lucide-react"

// ---------- Types ----------

export interface LocalGrowthDraft {
  id: string
  timestamp: string
  platform: string
  account: string
  angle: string
  tone: string
  hookType: string
  topic: string
  cta: string
  ctaUrl: string
  content: string
  alternatives?: string[]
}

interface FunnelData {
  funnel: {
    impressions: number
    engagements: number
    linkClicks: number
    utmVisitors: number
    utmVisitorsBySource: Array<{ source: string; campaign: string; visitors: number }>
    waitingList: number
    waitingListLast7: number
    target: { min: number; max: number }
    users: number
    activated: number
    retained7d: number
    retained30d: number
  }
  platforms: Array<{ platform: string; posts: number; impressions: number; engagements: number; linkClicks: number }>
  experiments: Array<{ experimentId: string; posts: number; impressions: number; engagements: number; linkClicks: number }>
}

interface GrowthPost {
  id: string
  account: string
  platform: string
  contentType: string
  hookType: string
  cta: string | null
  experimentId: string | null
  campaignUtm: string | null
  ctaUrl: string | null
  content: string
  status: string
  publishedAt: string | null
  metrics: {
    impressions: number
    likes: number
    comments: number
    reposts: number
    profileVisits: number
    linkClicks: number
  }
}

interface Experiment {
  id: string
  code: string
  hypothesis: string
  variable_tested: string
  platform: string
  kpi: string
  status: string
  decision: string | null
  result: string | null
  learning: string | null
}

interface JournalEntry {
  id: string
  week_label: string
  wins: string | null
  failures: string | null
  learnings: string | null
  next_tests: string | null
  created_at: string
}

const TABS = [
  { id: "funnel", label: "Growth Funnel", icon: TrendingUp },
  { id: "studio", label: "Content Studio", icon: Sparkles },
  { id: "experiments", label: "Experiments", icon: FlaskConical },
  { id: "journal", label: "Growth Journal", icon: NotebookPen },
] as const

type TabId = (typeof TABS)[number]["id"]

function fmt(n: number) {
  return n.toLocaleString("id-ID")
}

// ---------- Funnel Stage Bar ----------

function FunnelStage({ label, value, sub, max, color }: { label: string; value: number; sub: string; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-extrabold text-slate-900 dark:text-white">{fmt(value)} <span className="text-slate-400 font-medium">· {sub}</span></span>
      </div>
      <div className="h-7 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-lg ${color}`}
        />
      </div>
    </div>
  )
}

// ---------- Main Page ----------

export default function GrowthPage() {
  const [tab, setTab] = useState<TabId>("funnel")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Growth Command Center</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Funnel, konten, eksperimen, dan pembelajaran — sesuai Growth OS Employr (Hypothesis → Experiment → Data → Learning → Decision).
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              tab === t.id
                ? "bg-[#1F3578] text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "funnel" && <FunnelTab />}
      {tab === "studio" && <StudioTab />}
      {tab === "experiments" && <ExperimentsTab />}
      {tab === "journal" && <JournalTab />}
    </div>
  )
}

// ---------- TAB 1: FUNNEL ----------

function FunnelTab() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/growth/funnel")
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  const f = data?.funnel
  const wlPct = f ? Math.min(100, Math.round((f.waitingList / f.target.min) * 100)) : 0

  return (
    <div className="space-y-6">
      {/* Funnel visualization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Funnel Growth (data gabungan otomatis + input manual)</h3>
          <button onClick={load} className="text-xs font-bold text-[#1F3578] dark:text-navy-300 hover:underline flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {f && (
          <>
            <FunnelStage label="Awareness — Impressions" value={f.impressions} sub="input manual per post" max={Math.max(f.impressions, 1)} color="bg-violet-500" />
            <FunnelStage label="Interest — Engagements" value={f.engagements} sub="likes + comments + reposts" max={Math.max(f.impressions, 1)} color="bg-blue-500" />
            <FunnelStage label="Visit — Klik / Visitor UTM" value={Math.max(f.linkClicks, f.utmVisitors)} sub={`${f.linkClicks} klik manual · ${f.utmVisitors} via UTM tracker`} max={Math.max(f.impressions, 1)} color="bg-cyan-500" />
            <FunnelStage label="Conversion — Waiting List" value={f.waitingList} sub={`target ${f.target.min}–${f.target.max} · ${f.waitingListLast7} baru minggu ini`} max={Math.max(f.impressions, 1)} color="bg-emerald-500" />
            <FunnelStage label="Activation — User pakai fitur inti" value={f.activated} sub={`dari ${f.users} user terdaftar`} max={Math.max(f.users, 1)} color="bg-amber-500" />
            <FunnelStage label="Retention — Aktif 7 hari terakhir" value={f.retained7d} sub={`${f.retained30d} aktif 30 hari`} max={Math.max(f.activated, 1)} color="bg-rose-500" />
          </>
        )}
      </div>

      {/* Waiting list progress vs target */}
      {f && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Progress Waiting List (Fase 1)</h4>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{f.waitingList}<span className="text-base text-slate-400">/{f.target.min}</span></p>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${wlPct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{wlPct}% dari target minimum 200</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Visitor via UTM</h4>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{fmt(f.utmVisitors)}</p>
            <div className="mt-3 space-y-1">
              {f.utmVisitorsBySource.slice(0, 4).map((s, i) => (
                <div key={i} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[60%]">{s.source} · {s.campaign}</span>
                  <span className="font-bold">{s.visitors}</span>
                </div>
              ))}
              {f.utmVisitorsBySource.length === 0 && (
                <p className="text-[11px] text-slate-400">Belum ada visitor dengan UTM. Pakai link ber-UTM dari Content Studio.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Retensi</h4>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{f.retained7d}<span className="text-base text-slate-400">/7 hari</span></p>
            <p className="text-[11px] text-slate-500 mt-3">Target Fase 3: 100–150 user rutin. {f.retained30d} user aktif dalam 30 hari terakhir.</p>
          </div>
        </div>
      )}

      {/* Breakdown per platform & eksperimen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Per Platform</h3>
          <div className="space-y-2">
            {data?.platforms.length === 0 && <p className="text-xs text-slate-400">Belum ada post published.</p>}
            {data?.platforms.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{p.platform}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {p.posts} post · {fmt(p.impressions)} impr · {fmt(p.engagements)} engage · {fmt(p.linkClicks)} klik
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Per Eksperimen (atribusi)</h3>
          <div className="space-y-2">
            {data?.experiments.length === 0 && <p className="text-xs text-slate-400">Belum ada data.</p>}
            {data?.experiments.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-extrabold text-[#1F3578] dark:text-navy-300">{e.experimentId}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {e.posts} post · {fmt(e.impressions)} impr · {fmt(e.linkClicks)} klik
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- TAB 2: CONTENT STUDIO ----------

function StudioTab() {
  const [posts, setPosts] = useState<GrowthPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [account, setAccount] = useState("PERSONAL")
  const [platform, setPlatform] = useState("THREADS")
  const [contentType, setContentType] = useState("Observasi")
  const [angle, setAngle] = useState("Observasi")
  const [tone, setTone] = useState("santai")
  const [hookType, setHookType] = useState("QUESTION")
  const [topic, setTopic] = useState("")
  const [cta, setCta] = useState("Cek link di bio/komentar kalau mau nyoba")
  const [experimentId, setExperimentId] = useState("")
  const [includeAlternatives, setIncludeAlternatives] = useState(true)
  const [generated, setGenerated] = useState<{ content: string; ctaUrl: string; alternatives?: string[] } | null>(null)
  const [activeDraftTab, setActiveDraftTab] = useState<number>(-1)
  const [activeContent, setActiveContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Local Browser Storage state
  const STORAGE_KEY_CURRENT = "employr_growth_current_draft"
  const STORAGE_KEY_HISTORY = "employr_growth_local_history"
  const [localHistory, setLocalHistory] = useState<LocalGrowthDraft[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [historySearch, setHistorySearch] = useState("")

  // Sync angle & tone defaults when platform changes
  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform)
    if (newPlatform === "THREADS") {
      setAngle("Observasi")
      setContentType("Observasi")
      setTone("santai")
      setHookType("QUESTION")
      setCta("Cek link di bio/komentar kalau mau nyoba")
    } else {
      setAngle("Lesson Learned")
      setContentType("Lesson Learned")
      setTone("reflektif")
      setHookType("STATEMENT")
      setCta("Bagikan pandangan rekan-rekan di kolom komentar")
    }
  }

  // Simpan ke local storage browser
  const saveToLocalBrowser = useCallback(
    (draft: {
      content: string
      ctaUrl: string
      alternatives?: string[]
      topic: string
      platform: string
      account: string
      angle: string
      tone: string
      hookType: string
      cta: string
    }) => {
      if (typeof window === "undefined") return
      try {
        const item: LocalGrowthDraft = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          timestamp: new Date().toISOString(),
          platform: draft.platform,
          account: draft.account,
          angle: draft.angle,
          tone: draft.tone,
          hookType: draft.hookType,
          topic: draft.topic,
          cta: draft.cta,
          ctaUrl: draft.ctaUrl,
          content: draft.content,
          alternatives: draft.alternatives || [],
        }

        // Simpan draf aktif
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(item))

        // Simpan ke riwayat lokal (maks 30, tanpa duplikat konten persis)
        const raw = localStorage.getItem(STORAGE_KEY_HISTORY)
        const existing: LocalGrowthDraft[] = raw ? JSON.parse(raw) : []
        const filtered = existing.filter((e) => e.content !== item.content)
        const updated = [item, ...filtered].slice(0, 30)
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated))
        setLocalHistory(updated)

        const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        setLastSavedTime(timeStr)
      } catch (e) {
        console.warn("Gagal simpan ke localStorage:", e)
      }
    },
    []
  )

  // Muat draf & riwayat dari localStorage saat pertama kali mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const rawHist = localStorage.getItem(STORAGE_KEY_HISTORY)
      if (rawHist) {
        const parsedHist = JSON.parse(rawHist)
        if (Array.isArray(parsedHist)) setLocalHistory(parsedHist)
      }

      const rawCurrent = localStorage.getItem(STORAGE_KEY_CURRENT)
      if (rawCurrent) {
        const current: LocalGrowthDraft = JSON.parse(rawCurrent)
        if (current?.content) {
          setGenerated({
            content: current.content,
            ctaUrl: current.ctaUrl || "",
            alternatives: current.alternatives || [],
          })
          setActiveContent(current.content)
          setActiveDraftTab(-1)
          if (current.platform) setPlatform(current.platform)
          if (current.account) setAccount(current.account)
          if (current.angle) {
            setAngle(current.angle)
            setContentType(current.angle)
          }
          if (current.tone) setTone(current.tone)
          if (current.hookType) setHookType(current.hookType)
          if (current.topic) setTopic(current.topic)
          if (current.cta) setCta(current.cta)
          if (current.timestamp) {
            setLastSavedTime(new Date(current.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))
          }
          setShowForm(true)
        }
      }
    } catch (e) {
      console.warn("Gagal memuat dari localStorage:", e)
    }
  }, [])

  // Auto-sync editan textarea ke localStorage draf saat ini
  const handleContentChange = (newText: string) => {
    setActiveContent(newText)
    if (typeof window === "undefined") return
    try {
      const rawCurrent = localStorage.getItem(STORAGE_KEY_CURRENT)
      if (rawCurrent) {
        const current: LocalGrowthDraft = JSON.parse(rawCurrent)
        current.content = newText
        current.timestamp = new Date().toISOString()
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(current))
        setLastSavedTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))
      }
    } catch {}
  }

  // Restore draft dari riwayat browser
  const handleRestoreFromHistory = (item: LocalGrowthDraft) => {
    setPlatform(item.platform)
    setAccount(item.account)
    setAngle(item.angle)
    setContentType(item.angle)
    setTone(item.tone)
    setHookType(item.hookType)
    setTopic(item.topic)
    setCta(item.cta)
    setGenerated({
      content: item.content,
      ctaUrl: item.ctaUrl,
      alternatives: item.alternatives || [],
    })
    setActiveContent(item.content)
    setActiveDraftTab(-1)
    setShowForm(true)
    setShowHistoryModal(false)

    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(item))
      setLastSavedTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))
    } catch {}
  }

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = localHistory.filter((h) => h.id !== id)
    setLocalHistory(updated)
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated))
    } catch {}
  }

  const handleClearAllHistory = () => {
    if (!confirm("Hapus seluruh riwayat generatif yang tersimpan di browser ini?")) return
    setLocalHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY)
    } catch {}
  }

  // Metrics input state
  const [metricsFor, setMetricsFor] = useState<string | null>(null)
  const [metricsDraft, setMetricsDraft] = useState({ impressions: 0, likes: 0, comments: 0, reposts: 0, profileVisits: 0, linkClicks: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/growth/posts")
      const json = await res.json()
      if (json.success) setPosts(json.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    setGenerated(null)
    try {
      const res = await fetch("/api/growth/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          account,
          platform,
          contentType: angle || contentType,
          hookType,
          topic,
          cta,
          angle,
          tone,
          includeAlternatives,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setGenerated(json.data)
        setActiveDraftTab(-1)
        const initialText = json.data.content || ""
        setActiveContent(initialText)

        // Simpan langsung hasil generatif ke browser
        saveToLocalBrowser({
          content: initialText,
          ctaUrl: json.data.ctaUrl || "",
          alternatives: json.data.alternatives || [],
          topic,
          platform,
          account,
          angle: angle || contentType,
          tone,
          hookType,
          cta,
        })
      } else {
        alert(json.message || "Gagal generate konten")
      }
    } catch {
      alert("Gagal terhubung ke AI")
    }
    setIsGenerating(false)
  }

  const handleSave = async () => {
    if (!activeContent.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/growth/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account,
          platform,
          contentType: angle || contentType,
          hookType,
          cta,
          experimentId: experimentId || null,
          campaignUtm: experimentId || null,
          ctaUrl: generated?.ctaUrl,
          content: activeContent,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setGenerated(null)
        setActiveContent("")
        setTopic("")
        setShowForm(false)
        try {
          localStorage.removeItem(STORAGE_KEY_CURRENT)
        } catch {}
        load()
      }
    } catch {}
    setIsSaving(false)
  }

  const handlePublish = async (id: string) => {
    await fetch("/api/growth/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "publish" }),
    })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus post ini?")) return
    await fetch(`/api/growth/posts?id=${id}`, { method: "DELETE" })
    load()
  }

  const handleCopy = (post: GrowthPost) => {
    navigator.clipboard.writeText(post.content)
    setCopiedId(post.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const openMetrics = (post: GrowthPost) => {
    setMetricsFor(post.id)
    setMetricsDraft({
      impressions: post.metrics.impressions,
      likes: post.metrics.likes,
      comments: post.metrics.comments,
      reposts: post.metrics.reposts,
      profileVisits: post.metrics.profileVisits,
      linkClicks: post.metrics.linkClicks,
    })
  }

  const handleSaveMetrics = async () => {
    if (!metricsFor) return
    await fetch("/api/growth/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: metricsFor, action: "updateMetrics", metrics: metricsDraft }),
    })
    setMetricsFor(null)
    load()
  }

  const drafts = posts.filter((p) => p.status !== "PUBLISHED")
  const published = posts.filter((p) => p.status === "PUBLISHED")

  // Line count & char count calculation
  const lineCount = activeContent ? activeContent.split("\n").filter((l) => l.trim().length > 0).length : 0
  const charCount = activeContent.length

  // Filter history items by search query
  const filteredHistory = localHistory.filter((item) => {
    if (!historySearch.trim()) return true
    const q = historySearch.toLowerCase()
    return (
      item.topic?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.platform?.toLowerCase().includes(q) ||
      item.angle?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5">
      {/* Generator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-violet-500" />
              AI Content Generator (Human-Style: Threads & LinkedIn)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Gaya ngetik asli manusia — Threads (santai, spontan, 3-6 baris) vs LinkedIn (professional storytelling, whitespace, insight personal). Anti-AI slop.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 transition"
              title="Lihat riwayat hasil generatif yang tersimpan di local browser"
            >
              <History className="w-3.5 h-3.5 text-violet-500" />
              <span>Riwayat Browser</span>
              {localHistory.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                  {localHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3.5 py-2 rounded-xl bg-[#1F3578] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showForm ? "Tutup" : "Buat Konten"}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Platform Target</label>
                <select
                  value={platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="THREADS">Threads (Human Chat HP)</option>
                  <option value="LINKEDIN">LinkedIn (Storytelling)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Perspektif Akun</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="PERSONAL">Personal (Founder / Human)</option>
                  <option value="EMPLOYR">Employr (Brand Komunitas)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {platform === "THREADS" ? "Sudut Pandang (Angle)" : "Angle Cerita"}
                </label>
                <select
                  value={angle}
                  onChange={(e) => {
                    setAngle(e.target.value)
                    setContentType(e.target.value)
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {platform === "THREADS" ? (
                    <>
                      <option value="Observasi">Observasi Santai</option>
                      <option value="Personal Story">Personal Story</option>
                      <option value="Hot Take">Hot Take / Opini Berani</option>
                      <option value="Promosi Halus">Promosi Halus (Ngomong ke Temen)</option>
                      <option value="Edukatif Santai">Edukasi Ringan</option>
                    </>
                  ) : (
                    <>
                      <option value="Lesson Learned">Lesson Learned</option>
                      <option value="Cerita Kegagalan-ke-Growth">Cerita Kegagalan-ke-Growth</option>
                      <option value="Observasi Industri">Observasi Industri & Realita</option>
                      <option value="Pengumuman">Pengumuman & Milestone</option>
                      <option value="Career Advice">Tips Praktis Karier</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Nada (Tone)</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {platform === "THREADS" ? (
                    <>
                      <option value="santai">Santai (Chat Natural HP)</option>
                      <option value="lucu">Lucu / Nyeleneh</option>
                      <option value="agak serius">Agak Serius (Faktual)</option>
                    </>
                  ) : (
                    <>
                      <option value="reflektif">Reflektif (Perenungan Diri)</option>
                      <option value="motivasional">Motivasional (Empowering)</option>
                      <option value="to-the-point">To-the-point (Tegas & Rapi)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Pola Hook (Baris Pertama)
                </label>
                <select
                  value={hookType}
                  onChange={(e) => setHookType(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {platform === "THREADS" ? (
                    <>
                      <option value="QUESTION">Pertanyaan Spontan / Random</option>
                      <option value="STATEMENT">Pernyataan Singkat & Tajam</option>
                      <option value="REACTION">Reaksi Spontan (&quot;Gila sih&quot;, &quot;Baru sadar...&quot;)</option>
                    </>
                  ) : (
                    <>
                      <option value="STATEMENT">Pernyataan Berani / Angka Mengagetkan</option>
                      <option value="QUESTION">Pertanyaan Reflektif</option>
                      <option value="STORY">Potongan Cerita Personal (Klik ...more)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Topik / Pesan Inti (Wajib)</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Satu CV dikirim ke 50 loker tanpa modifikasi itu bikin auto ditolak"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  CTA / Ajakan Akhir (Natural & bukan template iklan)
                </label>
                <input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Contoh: Cek link di komentar kalau mau nyoba"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Eksperimen (opsional — untuk tracking UTM)</label>
                <input
                  value={experimentId}
                  onChange={(e) => setExperimentId(e.target.value)}
                  placeholder="EXP-001"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="incAlt"
                checked={includeAlternatives}
                onChange={(e) => setIncludeAlternatives(e.target.checked)}
                className="rounded border-slate-300 text-violet-600 cursor-pointer"
              />
              <label htmlFor="incAlt" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Sertakan 1–2 alternatif variasi (perbandingan sudut pandang / nada)
              </label>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-violet-600/20"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isGenerating ? "Menyusun konten human-style..." : "Generate Konten Human-Style"}
            </button>

            {generated && (
              <div className="space-y-3 p-4 rounded-xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                {/* Draft Selection Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-violet-200/60 dark:border-violet-800/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveDraftTab(-1)
                        setActiveContent(generated.content)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        activeDraftTab === -1
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-100"
                      }`}
                    >
                      Draft Final (Rekomendasi)
                    </button>
                    {generated.alternatives?.map((alt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveDraftTab(idx)
                          setActiveContent(alt)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                          activeDraftTab === idx
                            ? "bg-violet-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-100"
                        }`}
                      >
                        Alternatif {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Anti-AI Slop Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-violet-100/90 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-bold flex items-center gap-1 border border-violet-200/80 dark:border-violet-800/80">
                      <HardDrive className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      Tersimpan di Browser {lastSavedTime ? `(${lastSavedTime})` : ""}
                    </span>
                    <span>{lineCount} baris</span>
                    <span>·</span>
                    <span>{charCount} karakter</span>
                  </div>
                </div>

                {/* Editable Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Editor Draft Siap Post:
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Editan teks otomatis tersimpan di browser
                    </span>
                  </div>
                  <textarea
                    rows={platform === "THREADS" ? 6 : 10}
                    value={activeContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {generated.ctaUrl && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    URL CTA: <span className="font-mono font-bold">{generated.ctaUrl}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !activeContent.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Simpan ke Database Draft
                  </button>
                  <button
                    onClick={() => {
                      saveToLocalBrowser({
                        content: activeContent,
                        ctaUrl: generated.ctaUrl || "",
                        alternatives: generated.alternatives || [],
                        topic,
                        platform,
                        account,
                        angle: angle || contentType,
                        tone,
                        hookType,
                        cta,
                      })
                      alert("Tersimpan sebagai salinan baru di riwayat browser!")
                    }}
                    className="px-3.5 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition border border-violet-200 dark:border-violet-800"
                    title="Simpan salinan versi saat ini ke riwayat browser"
                  >
                    <HardDrive className="w-3.5 h-3.5" /> Simpan Salinan ke Browser
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(activeContent)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Salin Teks
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Riwayat Local Browser */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Riwayat Konten Tersimpan di Browser
                    <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                      {localHistory.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Otomatis tersimpan di LocalStorage browser perangkat ini. Tidak hilang saat tab ditutup.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Cari topik, isi konten, atau platform..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Modal Body / History List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <HardDrive className="w-8 h-8 mx-auto opacity-40 text-violet-500" />
                  <p className="text-xs font-semibold">
                    {localHistory.length === 0
                      ? "Belum ada riwayat generatif yang tersimpan di browser."
                      : "Tidak ditemukan hasil yang cocok dengan pencarian."}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Setiap kali Anda menekan &quot;Generate Konten&quot;, hasilnya otomatis diarsipkan di sini.
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-violet-300 dark:hover:border-violet-700 transition space-y-2.5 group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full border ${
                            item.platform === "THREADS"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {item.platform}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.account}
                        </span>
                        {item.angle && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.angle}
                          </span>
                        )}
                        {item.alternatives && item.alternatives.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            +{item.alternatives.length} Alternatif
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] normal-case font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {item.topic && (
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Topik: <span className="font-normal text-slate-600 dark:text-slate-300">{item.topic}</span>
                      </p>
                    )}

                    <pre className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {item.content}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreFromHistory(item)}
                          className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Muat ke Editor
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.content)
                            setCopiedId(item.id)
                            setTimeout(() => setCopiedId(null), 1500)
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                        >
                          {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedId === item.id ? "Tersalin" : "Salin"}
                        </button>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="px-2 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {localHistory.length} draf tersimpan di memori browser
              </span>
              <div className="flex items-center gap-2">
                {localHistory.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition cursor-pointer"
                  >
                    Bersihkan Semua
                  </button>
                )}
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {[
            { title: "Draft & Terjadwal", list: drafts },
            { title: "Published", list: published },
          ].map((group) => (
            <div key={group.title} className="space-y-2.5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {group.title} <span className="text-slate-400 font-bold">({group.list.length})</span>
              </h3>
              {group.list.length === 0 && <p className="text-xs text-slate-400">Belum ada post.</p>}
              {group.list.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider">
                    <span className="px-2 py-0.5 rounded-full bg-[#1F3578]/10 text-[#1F3578] dark:text-navy-300 border border-[#1F3578]/20">{post.platform}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{post.account}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{post.hookType}</span>
                    {post.experimentId && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">{post.experimentId}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full border ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                      {post.status}
                    </span>
                  </div>

                  <pre className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed line-clamp-4">{post.content}</pre>

                  {/* Metrics summary */}
                  {post.status === "PUBLISHED" && (
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{fmt(post.metrics.impressions)} impressions</span>
                      <span>{fmt(post.metrics.likes + post.metrics.comments + post.metrics.reposts)} engagements</span>
                      <span>{fmt(post.metrics.linkClicks)} klik</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {post.status !== "PUBLISHED" && (
                      <button onClick={() => handlePublish(post.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                        <Send className="w-3 h-3" /> Tandai Published
                      </button>
                    )}
                    {post.status === "PUBLISHED" && (
                      <button onClick={() => openMetrics(post)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                        <BarChart3 className="w-3 h-3" /> Input Metrik
                      </button>
                    )}
                    <button onClick={() => handleCopy(post)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                      {copiedId === post.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedId === post.id ? "Tersalin" : "Salin"}
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>

                  {/* Metrics input panel */}
                  {metricsFor === post.id && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {([["impressions", "Impressions"], ["likes", "Likes"], ["comments", "Comments"], ["reposts", "Reposts"], ["profileVisits", "Profile Visits"], ["linkClicks", "Link Clicks"]] as const).map(([key, label]) => (
                          <div key={key}>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">{label}</label>
                            <input
                              type="number"
                              min={0}
                              value={metricsDraft[key]}
                              onChange={(e) => setMetricsDraft({ ...metricsDraft, [key]: parseInt(e.target.value) || 0 })}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSaveMetrics} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer">
                        <Save className="w-3.5 h-3.5" /> Simpan Metrik
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- TAB 3: EXPERIMENTS ----------

const STAGES = [
  { n: 1, name: "Messaging Validation", exit: "Messaging konsisten perform" },
  { n: 2, name: "Value Proposition Validation", exit: "Value prop terkuat ditemukan" },
  { n: 3, name: "Landing Page & CTA Validation", exit: "Conversion level valid" },
  { n: 4, name: "Channel Validation", exit: "Channel & format efektif" },
  { n: 5, name: "Waiting List Growth", exit: "Target 200–300 tercapai" },
  { n: 6, name: "Activation", exit: "User dapat value tanpa friction" },
  { n: 7, name: "Retention", exit: "100–150 user rutin" },
]

function ExperimentsTab() {
  const [exps, setExps] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStage, setCurrentStage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const [hypothesis, setHypothesis] = useState("")
  const [variableTested, setVariableTested] = useState("")
  const [platform, setPlatform] = useState("THREADS")
  const [kpi, setKpi] = useState("CTR")

  // Result editing
  const [resultFor, setResultFor] = useState<string | null>(null)
  const [resultDraft, setResultDraft] = useState({ result: "", learning: "", decision: "KEEP" })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/growth/experiments")
      const json = await res.json()
      if (json.success) setExps(json.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!hypothesis.trim()) return
    await fetch("/api/growth/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hypothesis, variableTested, platform, kpi }),
    })
    setHypothesis("")
    setVariableTested("")
    setShowForm(false)
    load()
  }

  const handleUpdate = async (id: string, data: any) => {
    await fetch("/api/growth/experiments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus eksperimen ini?")) return
    await fetch(`/api/growth/experiments?id=${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="space-y-5">
      {/* Stage Gate tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">Stage Gate (condition-based, bukan calendar-based)</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">Belum lolos exit criteria → ulangi stage. Lolos → lanjut.</p>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.n}
              onClick={() => setCurrentStage(s.n)}
              title={s.exit}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold border transition cursor-pointer ${
                currentStage === s.n
                  ? "bg-[#1F3578] text-white border-[#1F3578]"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1F3578]/40"
              }`}
            >
              {s.n}. {s.name}
            </button>
          ))}
        </div>
        {currentStage > 0 && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-extrabold">Exit criteria Stage {currentStage}:</span> {STAGES[currentStage - 1].exit}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Experiment Backlog <span className="text-slate-400">({exps.length})</span></h3>
        <button onClick={() => setShowForm(!showForm)} className="px-3.5 py-2 rounded-xl bg-[#1F3578] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Batal" : "Eksperimen Baru"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Hipotesis (satu eksperimen = satu hipotesis)</label>
            <textarea
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Contoh: Hook berbasis pertanyaan menghasilkan CTR lebih tinggi daripada hook berbasis pernyataan."
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Variabel yang Dites</label>
              <input value={variableTested} onChange={(e) => setVariableTested(e.target.value)} placeholder="Hook" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <option value="THREADS">Threads</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="BOTH">Keduanya</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">KPI</label>
              <select value={kpi} onChange={(e) => setKpi(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <option>CTR</option>
                <option>Engagement Rate</option>
                <option>Waiting List Signup</option>
                <option>Impressions</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer">
            Simpan Eksperimen
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {exps.length === 0 && <p className="text-xs text-slate-400">Belum ada eksperimen. Mulai dari EXP-001: Hook pertanyaan vs pernyataan.</p>}
          {exps.map((e) => (
            <div key={e.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-black text-xs text-[#1F3578] dark:text-navy-300">{e.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  e.status === "RUNNING" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : e.status === "DONE" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                }`}>{e.status}</span>
                {e.decision && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    e.decision === "KEEP" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : e.decision === "ITERATE" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  }`}>{e.decision}</span>
                )}
                <span className="text-[10px] text-slate-400 font-bold uppercase">{e.platform} · KPI: {e.kpi}</span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed"><span className="font-extrabold">H:</span> {e.hypothesis}</p>
              {e.variable_tested && <p className="text-[11px] text-slate-500 dark:text-slate-400"><span className="font-bold">Variabel:</span> {e.variable_tested}</p>}
              {e.result && <p className="text-[11px] text-slate-600 dark:text-slate-300"><span className="font-bold">Hasil:</span> {e.result}</p>}
              {e.learning && <p className="text-[11px] text-amber-700 dark:text-amber-300"><span className="font-bold">Learning:</span> {e.learning}</p>}

              <div className="flex flex-wrap gap-2">
                {resultFor !== e.id && (
                  <button
                    onClick={() => {
                      setResultFor(e.id)
                      setResultDraft({ result: e.result || "", learning: e.learning || "", decision: e.decision || "KEEP" })
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold cursor-pointer"
                  >
                    Catat Hasil
                  </button>
                )}
                {e.status === "RUNNING" ? (
                  <button onClick={() => handleUpdate(e.id, { status: "DONE" })} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold cursor-pointer">
                    Tandai Selesai
                  </button>
                ) : (
                  <button onClick={() => handleUpdate(e.id, { status: "RUNNING" })} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold cursor-pointer">
                    Buka Lagi
                  </button>
                )}
                <button onClick={() => handleDelete(e.id)} className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              </div>

              {resultFor === e.id && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                  <textarea rows={2} value={resultDraft.result} onChange={(ev) => setResultDraft({ ...resultDraft, result: ev.target.value })} placeholder="Hasil (angka KPI, observasi)..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 resize-none" />
                  <textarea rows={2} value={resultDraft.learning} onChange={(ev) => setResultDraft({ ...resultDraft, learning: ev.target.value })} placeholder="Learning (apa yang dipelajari)..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 resize-none" />
                  <select value={resultDraft.decision} onChange={(ev) => setResultDraft({ ...resultDraft, decision: ev.target.value })} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="KEEP">KEEP — terbukti, lanjutkan</option>
                    <option value="ITERATE">ITERATE — perlu diulang dengan variasi</option>
                    <option value="KILL">KILL — tidak berhasil, hentikan</option>
                  </select>
                  <div>
                    <button onClick={async () => { await handleUpdate(e.id, resultDraft); setResultFor(null); }} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer">
                      Simpan Hasil
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- TAB 4: JOURNAL ----------

function JournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [weekLabel, setWeekLabel] = useState("")
  const [wins, setWins] = useState("")
  const [failures, setFailures] = useState("")
  const [learnings, setLearnings] = useState("")
  const [nextTests, setNextTests] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/growth/journal")
      const json = await res.json()
      if (json.success) setEntries(json.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!weekLabel.trim() && !wins && !learnings) return
    await fetch("/api/growth/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekLabel, wins, failures, learnings, nextTests }),
    })
    setWeekLabel(""); setWins(""); setFailures(""); setLearnings(""); setNextTests("")
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus entry journal ini?")) return
    await fetch(`/api/growth/journal?id=${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Growth Journal</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Apa yang berhasil, gagal, dipelajari, dan akan dites selanjutnya (Plan → Execute → Measure → Learn → Improve).</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3.5 py-2 rounded-xl bg-[#1F3578] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Batal" : "Entry Baru"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} placeholder="Label minggu, misal: Minggu 38 - Sep 2026" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea rows={2} value={wins} onChange={(e) => setWins(e.target.value)} placeholder="Apa yang berhasil..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none" />
            <textarea rows={2} value={failures} onChange={(e) => setFailures(e.target.value)} placeholder="Apa yang gagal..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none" />
            <textarea rows={2} value={learnings} onChange={(e) => setLearnings(e.target.value)} placeholder="Apa yang dipelajari..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none" />
            <textarea rows={2} value={nextTests} onChange={(e) => setNextTests(e.target.value)} placeholder="Apa yang akan dites selanjutnya..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none" />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer">
            Simpan Entry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {entries.length === 0 && <p className="text-xs text-slate-400">Belum ada entry journal.</p>}
          {entries.map((e) => (
            <div key={e.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{e.week_label}</h4>
                <button onClick={() => handleDelete(e.id)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {e.wins && <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-emerald-600">Berhasil:</span> {e.wins}</p>}
              {e.failures && <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-rose-500">Gagal:</span> {e.failures}</p>}
              {e.learnings && <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-amber-600">Pelajaran:</span> {e.learnings}</p>}
              {e.next_tests && <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-[#1F3578] dark:text-navy-300">Tes berikutnya:</span> {e.next_tests}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
