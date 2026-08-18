"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react"

type TabKey = "articles" | "courses" | "certifications" | "events"

interface ArticleItem {
  id: string
  title: string
  slug: string
  author: string
  category: string | null
  categoryId: string | null
  isPublished: boolean
  publishedAt: string | null
  [key: string]: any
}

interface CourseItem {
  id: string
  title: string
  instructor: string
  level: string
  price: number
  durationHours: number
  isActive: boolean
  externalUrl: string
  createdAt: string
  [key: string]: any
}

interface CertItem {
  id: string
  title: string
  provider: string
  price: number
  durationHours: number
  isActive: boolean
  externalUrl: string
  createdAt: string
  [key: string]: any
}

interface EventItem {
  id: string
  title: string
  eventDate: string
  location: string
  type: string
  isActive: boolean
  externalUrl: string
  createdAt: string
  [key: string]: any
}

const tabs: { key: TabKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "articles", label: "Artikel", icon: BookOpen, desc: "Artikel karier untuk tab Pengembangan Karier di dashboard" },
  { key: "courses", label: "Kursus & Skills", icon: GraduationCap, desc: "Kursus yang direkomendasikan ke pengguna" },
  { key: "certifications", label: "Sertifikasi", icon: Award, desc: "Sertifikasi profesional yang ditampilkan" },
  { key: "events", label: "Event Job Fair", icon: CalendarDays, desc: "Event / webinar / job fair yang akan datang" },
]

const API_PATHS: Record<TabKey, string> = {
  articles: "/api/cms/articles",
  courses: "/api/cms/courses",
  certifications: "/api/cms/certifications",
  events: "/api/cms/events",
}

const emptyForm: Record<TabKey, Record<string, any>> = {
  articles: { title: "", author: "", content: "", category: "", coverImageUrl: "", isPublished: false },
  courses: { title: "", description: "", instructor: "", level: "Pemula", price: 0, durationHours: 1, externalUrl: "", coverImageUrl: "", isActive: true },
  certifications: { title: "", description: "", provider: "", price: 0, durationHours: 1, externalUrl: "", coverImageUrl: "", isActive: true },
  events: { title: "", description: "", eventDate: "", location: "", type: "ONLINE", externalUrl: "", coverImageUrl: "", isActive: true },
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  "w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"

export default function CMSPage() {
  const [tab, setTab] = useState<TabKey>("articles")
  const [data, setData] = useState<Record<TabKey, any[]>>({ articles: [], courses: [], certifications: [], events: [] })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, any>>(emptyForm.articles)
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (t: TabKey) => {
    try {
      const res = await fetch(API_PATHS[t])
      const json = await res.json()
      if (json.success) {
        setData((prev) => ({ ...prev, [t]: json.data }))
      }
    } catch (e) {
      // keep existing data on failure
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all(tabs.map((t) => fetch(API_PATHS[t.key]).then((r) => r.json())))
      .then((results) => {
        const next: Record<TabKey, any[]> = { articles: [], courses: [], certifications: [], events: [] }
        results.forEach((json, i) => {
          const key = tabs[i].key
          next[key] = json.success ? json.data : []
        })
        setData(next)
      })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm[tab] })
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    const base = emptyForm[tab]
    const mapped: Record<string, any> = { ...base }
    for (const key of Object.keys(item)) {
      if (key in base || ["category", "type"].includes(key)) mapped[key] = item[key]
    }
    if (tab === "articles") {
      mapped.category = item.category ?? ""
    }
    setForm(mapped)
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const url = editing ? `${API_PATHS[tab]}/${editing.id}` : API_PATHS[tab]
      const method = editing ? "PATCH" : "POST"
      const body: Record<string, any> = { ...form }

      if (tab === "articles" && body.category) {
        // Resolve category name to id: look up existing category, else create
        const catName = String(body.category).trim()
        const categoriesRes = await fetch("/api/cms/articles/categories").catch(() => null)
        let categoryId: string | null = null
        if (categoriesRes && categoriesRes.ok) {
          const catJson = await categoriesRes.json()
          const existing = catJson.data?.find((c: any) => c.name.toLowerCase() === catName.toLowerCase())
          if (existing) {
            categoryId = existing.id
          } else {
            const createRes = await fetch("/api/cms/articles/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: catName }),
            })
            if (createRes.ok) {
              const created = await createRes.json()
              categoryId = created.data?.id ?? null
            }
          }
        }
        body.categoryId = categoryId
      }
      delete body.category

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message ?? "Gagal menyimpan data")
        return
      }
      setModalOpen(false)
      await load(tab)
    } catch (e: any) {
      setError(e?.message ?? "Terjadi kesalahan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setSaving(true)
    try {
      const res = await fetch(`${API_PATHS[tab]}/${confirmDelete.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) {
        setError(json.message ?? "Gagal menghapus")
        return
      }
      setConfirmDelete(null)
      await load(tab)
    } catch (e: any) {
      setError(e?.message ?? "Terjadi kesalahan")
    } finally {
      setSaving(false)
    }
  }

  const filtered = data[tab].filter((item) => {
    const q = search.toLowerCase()
    return Object.values(item).some((v) => (v != null ? String(v).toLowerCase().includes(q) : false))
  })

  const toggleActive = async (item: any) => {
    const nextActive = !item.isActive
    const res = await fetch(`${API_PATHS[tab]}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextActive }),
    })
    const json = await res.json()
    if (json.success) await load(tab)
  }

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const renderFormFields = () => {
    switch (tab) {
      case "articles":
        return (
          <>
            <Field label="Judul Artikel" required>
              <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Cara Membuat CV ATS Friendly..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Penulis" required>
                <input className={inputCls} value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} placeholder="Tim Employr" />
              </Field>
              <Field label="Kategori">
                <input className={inputCls} value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Optimasi CV" />
              </Field>
            </div>
            <Field label="Konten" required>
              <textarea className={`${inputCls} min-h-[160px] resize-y`} value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} placeholder="Isi lengkap artikel..." />
            </Field>
            <Field label="URL Cover Image">
              <input className={inputCls} value={form.coverImageUrl ?? ""} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Publikasikan sekarang</span>
            </label>
          </>
        )
      case "courses":
        return (
          <>
            <Field label="Judul Kursus" required>
              <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Kursus Public Speaking" />
            </Field>
            <Field label="Deskripsi" required>
              <textarea className={`${inputCls} min-h-[100px] resize-y`} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instruktur" required>
                <input className={inputCls} value={form.instructor ?? ""} onChange={(e) => set("instructor", e.target.value)} />
              </Field>
              <Field label="Level">
                <select className={inputCls} value={form.level ?? "Pemula"} onChange={(e) => set("level", e.target.value)}>
                  <option>Pemula</option>
                  <option>Menengah</option>
                  <option>Mahir</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Harga (Rp)">
                <input type="number" min={0} className={inputCls} value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
              </Field>
              <Field label="Durasi (Jam)">
                <input type="number" min={1} className={inputCls} value={form.durationHours ?? 1} onChange={(e) => set("durationHours", Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Link Kursus" required>
              <input className={inputCls} value={form.externalUrl ?? ""} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="URL Cover Image">
              <input className={inputCls} value={form.coverImageUrl ?? ""} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aktif / tampil di dashboard</span>
            </label>
          </>
        )
      case "certifications":
        return (
          <>
            <Field label="Judul Sertifikasi" required>
              <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Sertifikasi BNSP HR" />
            </Field>
            <Field label="Deskripsi" required>
              <textarea className={`${inputCls} min-h-[100px] resize-y`} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Penyelenggara" required>
                <input className={inputCls} value={form.provider ?? ""} onChange={(e) => set("provider", e.target.value)} />
              </Field>
              <Field label="Durasi (Jam)">
                <input type="number" min={1} className={inputCls} value={form.durationHours ?? 1} onChange={(e) => set("durationHours", Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Harga (Rp)">
              <input type="number" min={0} className={inputCls} value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
            </Field>
            <Field label="Link Pendaftaran" required>
              <input className={inputCls} value={form.externalUrl ?? ""} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="URL Cover Image">
              <input className={inputCls} value={form.coverImageUrl ?? ""} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aktif / tampil di dashboard</span>
            </label>
          </>
        )
      case "events":
        return (
          <>
            <Field label="Judul Event" required>
              <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Job Fair Kampus 2026" />
            </Field>
            <Field label="Deskripsi" required>
              <textarea className={`${inputCls} min-h-[100px] resize-y`} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal Event" required>
                <input type="date" className={inputCls} value={form.eventDate ?? ""} onChange={(e) => set("eventDate", e.target.value)} />
              </Field>
              <Field label="Tipe">
                <select className={inputCls} value={form.type ?? "ONLINE"} onChange={(e) => set("type", e.target.value)}>
                  <option value="ONLINE">Online / Webinar</option>
                  <option value="ONSITE">Onsite</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </Field>
            </div>
            <Field label="Lokasi" required>
              <input className={inputCls} value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Jakarta / Zoom Meeting" />
            </Field>
            <Field label="Link Event" required>
              <input className={inputCls} value={form.externalUrl ?? ""} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="URL Cover Image">
              <input className={inputCls} value={form.coverImageUrl ?? ""} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aktif / tampil di dashboard</span>
            </label>
          </>
        )
    }
  }

  const columns: Record<TabKey, { key: string; header: string; render: (item: any) => React.ReactNode }[]> = {
    articles: [
      { key: "title", header: "Judul", render: (item: ArticleItem) => <span className="font-semibold">{item.title}</span> },
      { key: "author", header: "Penulis", render: (item: ArticleItem) => item.author },
      { key: "category", header: "Kategori", render: (item: ArticleItem) => item.category ?? <span className="text-slate-400">-</span> },
      {
        key: "isPublished",
        header: "Status",
        render: (item: ArticleItem) => (
          <button
            onClick={() => {
              const res = fetch(`${API_PATHS.articles}/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !item.isPublished }),
              }).then((r) => r.json())
              res.then((json) => json.success && load("articles"))
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
              item.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {item.isPublished ? "Terbit" : "Draft"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </button>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    courses: [
      { key: "title", header: "Judul", render: (item: CourseItem) => <span className="font-semibold">{item.title}</span> },
      { key: "instructor", header: "Instruktur", render: (item: CourseItem) => item.instructor },
      { key: "level", header: "Level", render: (item: CourseItem) => <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">{item.level}</span> },
      {
        key: "price",
        header: "Harga",
        render: (item: CourseItem) => (item.price === 0 ? <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratis</span> : <span className="font-semibold">Rp{item.price.toLocaleString("id-ID")}</span>),
      },
      {
        key: "isActive",
        header: "Status",
        render: (item: CourseItem) => (
          <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${item.isActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {item.isActive ? "Aktif" : "Nonaktif"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </button>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    certifications: [
      { key: "title", header: "Judul", render: (item: CertItem) => <span className="font-semibold">{item.title}</span> },
      { key: "provider", header: "Penyelenggara", render: (item: CertItem) => item.provider },
      { key: "price", header: "Harga", render: (item: CertItem) => (item.price === 0 ? <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratis</span> : <span className="font-semibold">Rp{item.price.toLocaleString("id-ID")}</span>) },
      {
        key: "isActive",
        header: "Status",
        render: (item: CertItem) => (
          <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${item.isActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {item.isActive ? "Aktif" : "Nonaktif"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </button>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    events: [
      { key: "title", header: "Judul", render: (item: EventItem) => <span className="font-semibold">{item.title}</span> },
      { key: "eventDate", header: "Tanggal", render: (item: EventItem) => item.eventDate },
      {
        key: "type",
        header: "Tipe",
        render: (item: EventItem) => (
          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${item.type === "ONLINE" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" : item.type === "HYBRID" ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"}`}>
            {item.type}
          </span>
        ),
      },
      { key: "location", header: "Lokasi", render: (item: EventItem) => item.location },
      {
        key: "isActive",
        header: "Status",
        render: (item: EventItem) => (
          <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${item.isActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {item.isActive ? "Aktif" : "Nonaktif"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Edit">
              <Pencil size={15} />
            </button>
            <button onClick={() => setConfirmDelete(item)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer" title="Hapus">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <BookOpen size={24} className="text-orange-500" />
            CMS Konten Karier
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Kelola artikel, kursus, sertifikasi, dan event untuk tab Pengembangan Karier di dashboard
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} />
          Tambah {tabs.find((t) => t.key === tab)?.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {tabs.map((t) => {
          const count = data[t.key].length
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key)
                setSearch("")
                load(t.key)
              }}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                active
                  ? "bg-white dark:bg-slate-900 border-orange-300 dark:border-orange-700 shadow-md"
                  : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${active ? "bg-orange-50 dark:bg-orange-950/60 text-orange-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                  <t.icon size={18} />
                </div>
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">{count}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.label}</h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari konten..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            {filtered.length} dari {data[tab].length} konten
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                {columns[tab].map((col) => (
                  <th key={col.key} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filtered.map((item, index) => (
                <tr key={item.id ?? index} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                  {columns[tab].map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Loader2 size={18} className="animate-spin" /> Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            {search ? "Tidak ada hasil yang cocok" : "Belum ada konten. Klik \"Tambah\" untuk mengisi konten pertama."}
          </div>
        ) : null}
      </div>

      {/* Modal Tambah/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                {editing ? "Edit" : "Tambah"} {tabs.find((t) => t.key === tab)?.label}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">{renderFormFields()}</div>
            {error && (
              <div className="px-5 pb-2">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">{error}</p>
              </div>
            )}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5 rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 mb-1">Hapus konten ini?</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-5">
              "{confirmDelete.title}" akan dihapus permanen dan tidak tampil lagi di dashboard pengguna.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
