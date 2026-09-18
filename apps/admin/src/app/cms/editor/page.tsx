"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  FileEdit,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Check,
  Briefcase,
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Clock,
  ExternalLink,
  Hash,
  Tag,
  X,
  Plus,
} from "lucide-react";
import { TiptapEditor } from "@/components/admin/TiptapEditor";

type ContentType = "articles" | "jobs" | "courses" | "certifications" | "events";

const TYPE_CONFIG: Record<
  ContentType,
  {
    label: string;
    singular: string;
    icon: React.ElementType;
    defaultTab: string;
    editorTitle: string;
    editorDesc: string;
    editorPlaceholder: string;
    coverLabel: string;
    suggestedTags: string[];
  }
> = {
  articles: {
    label: "Artikel Karier",
    singular: "Artikel",
    icon: BookOpen,
    defaultTab: "articles",
    editorTitle: "Konten & Isi Lengkap Artikel",
    editorDesc: "Format tulisan dengan heading, kutipan, list, dan sisipkan foto pendukung langsung dari komputer.",
    editorPlaceholder: "Mulai ketik paragraf pertama artikel Anda di sini... Gunakan heading untuk subjudul, bullet point untuk list, dan sisipkan foto pendukung langsung dari komputer.",
    coverLabel: "Foto Sampul Artikel (Cover Image)",
    suggestedTags: [
      "#TipsInterview",
      "#CVATS",
      "#FreshGraduate",
      "#GajiPertama",
      "#KarirImpian",
      "#SuratLamaran",
      "#InterviewKerja",
      "#Portofolio",
    ],
  },
  jobs: {
    label: "Lowongan Kerja",
    singular: "Lowongan",
    icon: Briefcase,
    defaultTab: "jobs",
    editorTitle: "Deskripsi Lengkap, Kualifikasi & Benefit Lowongan",
    editorDesc: "Gunakan heading (H2/H3) untuk Kualifikasi & Tanggung Jawab, bullet point untuk persyaratan, dan sisipkan gambar bila perlu.",
    editorPlaceholder: "Tuliskan deskripsi lengkap posisi pekerjaan, tanggung jawab harian, kualifikasi pelamar yang dibutuhkan, serta benefit yang ditawarkan...",
    coverLabel: "Foto Sampul / Banner Lowongan",
    suggestedTags: [
      "#FreshGraduate",
      "#KerjaRemote",
      "#LokerJakarta",
      "#SMA-SMK",
      "#TanpaPengalaman",
      "#GajiUMR",
      "#FullTime",
      "#Magang",
    ],
  },
  courses: {
    label: "Kursus & Skills",
    singular: "Kursus",
    icon: GraduationCap,
    defaultTab: "courses",
    editorTitle: "Deskripsi & Silabus Lengkap Kursus",
    editorDesc: "Jelaskan kurikulum materi, modul pembelajaran, target peserta, dan keahlian yang akan dikuasai siswa.",
    editorPlaceholder: "Tuliskan silabus kursus, materi yang akan dipelajari per modul, prasyarat belajar, dan keunggulan sertifikat kursus ini...",
    coverLabel: "Foto Sampul / Poster Kursus",
    suggestedTags: [
      "#BelajarCoding",
      "#ExcelPemula",
      "#DigitalMarketing",
      "#GratisBersertifikat",
      "#UIUXDesign",
      "#SkillMasaDepan",
      "#PublicSpeaking",
    ],
  },
  certifications: {
    label: "Sertifikasi Profesional",
    singular: "Sertifikasi",
    icon: Award,
    defaultTab: "certifications",
    editorTitle: "Deskripsi & Standar Kompetensi Ujian",
    editorDesc: "Jelaskan kompetensi yang diuji, manfaat bagi karier, materi ujian, serta tata cara persiapan.",
    editorPlaceholder: "Tuliskan standar kompetensi sertifikasi, kisi-kisi materi yang diuji, syarat pendaftaran, dan manfaat sertifikat di dunia kerja...",
    coverLabel: "Foto Sampul / Banner Sertifikasi",
    suggestedTags: [
      "#BNSP",
      "#GoogleCertified",
      "#SertifikasiIT",
      "#StandarIndustri",
      "#KompetensiKarier",
      "#BersertifikatResmi",
      "#ManajemenProyek",
    ],
  },
  events: {
    label: "Event & Job Fair",
    singular: "Event",
    icon: CalendarDays,
    defaultTab: "events",
    editorTitle: "Deskripsi, Agenda & Rundown Acara",
    editorDesc: "Jelaskan susunan acara, daftar pembicara / perusahaan partisipan, dan keuntungan menghadiri event ini.",
    editorPlaceholder: "Tuliskan deskripsi lengkap acara, jadwal rundown kegiatan, daftar narasumber atau perusahaan yang hadir, dan petunjuk registrasi...",
    coverLabel: "Foto Sampul / Poster Event",
    suggestedTags: [
      "#JobFair2026",
      "#WebinarGratis",
      "#CampusHiring",
      "#WalkInInterview",
      "#VirtualCareerFair",
      "#TipsKarir",
      "#Networking",
    ],
  },
};

function CMSEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as ContentType) || "articles";
  const editId = searchParams.get("id");

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isLoading, setIsLoading] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Cover image upload state
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Tag Input state
  const [tagInput, setTagInput] = useState("");

  // Form State
  const [form, setForm] = useState<Record<string, any>>({
    // Common
    title: "",
    content: "",
    description: "",
    coverImageUrl: "",
    tags: [] as string[],
    isActive: true,
    isPublished: true,

    // Articles
    author: "Tim Employr",
    category: "Tips Karier",
    categoryId: null,

    // Jobs
    company: "",
    location: "Jakarta",
    workType: "ONSITE",
    salaryMin: "",
    salaryMax: "",
    externalUrl: "",
    crawlUrl: "",

    // Courses & Certifications
    instructor: "",
    provider: "",
    level: "Pemula",
    price: 0,
    durationHours: 1,

    // Events
    eventDate: new Date().toISOString().split("T")[0],
    eventType: "ONLINE",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const setField = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // Tag helper handlers
  const handleAddTag = (rawTag: string) => {
    let clean = rawTag.trim().replace(/^#+/, "").trim();
    if (!clean) return;
    const formatted = `#${clean}`;
    if (!form.tags?.includes(formatted)) {
      setField("tags", [...(form.tags || []), formatted]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setField(
      "tags",
      (form.tags || []).filter((t: string) => t !== tagToRemove)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Load existing data if editing
  useEffect(() => {
    if (!editId) return;
    setIsLoading(true);

    const loadExisting = async () => {
      try {
        const endpoint = `/api/cms/${type}/${editId}`;
        const res = await fetch(endpoint);
        const json = await res.json();

        if (json.success && json.data) {
          const d = json.data;
          const richText = d.content || d.description || "";
          setForm((prev) => ({
            ...prev,
            title: d.title || "",
            content: richText,
            description: richText,
            coverImageUrl: d.coverImageUrl || d.cover_image_url || "",
            tags: Array.isArray(d.tags) ? d.tags : [],
            isPublished: d.isPublished ?? d.is_published ?? true,
            isActive: d.isActive ?? d.is_active ?? true,

            // Articles
            author: d.author || prev.author,
            category: d.category || prev.category,
            categoryId: d.categoryId || null,

            // Jobs
            company: d.company || "",
            location: d.location || prev.location,
            workType: d.workType || "ONSITE",
            salaryMin: d.salaryMin != null ? String(d.salaryMin) : "",
            salaryMax: d.salaryMax != null ? String(d.salaryMax) : "",

            // Courses & Certifications
            instructor: d.instructor || "",
            provider: d.provider || "",
            level: d.level || "Pemula",
            price: d.price ?? 0,
            durationHours: d.durationHours ?? d.duration_hours ?? 1,

            // Events & Shared
            externalUrl: d.externalUrl ?? d.external_url ?? "",
            eventDate: d.eventDate ? d.eventDate.split("T")[0] : prev.eventDate,
            eventType: d.type || d.eventType || "ONLINE",
          }));
        } else {
          showToast(json.message || "Gagal memuat data yang akan diedit.");
        }
      } catch {
        showToast("Gagal memuat data yang akan diedit.");
      } finally {
        setIsLoading(false);
      }
    };

    loadExisting();
  }, [editId, type]);

  // Cover Image Upload Handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setField("coverImageUrl", json.url);
        showToast("Cover image berhasil diunggah.");
      } else {
        alert(json.message || "Gagal mengunggah cover image.");
      }
    } catch {
      alert("Terjadi kendala saat mengunggah cover image.");
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Auto Crawl Job from URL
  const [isCrawling, setIsCrawling] = useState(false);
  const handleCrawlJob = async () => {
    if (!form.crawlUrl?.trim()) {
      showToast("Silakan tempel URL lowongan terlebih dahulu.");
      return;
    }
    setIsCrawling(true);
    try {
      const res = await fetch("/api/cms/jobs/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.crawlUrl }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const crawledDesc = d.description || prevDescOrContent();
        setForm((prev) => ({
          ...prev,
          title: d.title || prev.title,
          company: d.company || prev.company,
          location: d.location || prev.location,
          workType: d.workType || prev.workType,
          description: crawledDesc,
          content: crawledDesc,
          externalUrl: d.url || prev.externalUrl,
        }));
        showToast("✨ Data lowongan berhasil diekstrak otomatis!");
      } else {
        showToast(json.message || "Gagal meng-crawl tautan.");
      }
    } catch {
      showToast("Terjadi kendala saat meng-crawl tautan.");
    } finally {
      setIsCrawling(false);
    }
  };

  const prevDescOrContent = () => form.description || form.content || "";

  // Submit Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title?.trim()) {
      alert("Judul tidak boleh kosong.");
      return;
    }

    const mainRichText = (form.content || form.description || "").trim();
    if (!mainRichText) {
      alert("Konten / deskripsi tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      const tagsPayload = Array.isArray(form.tags) ? form.tags : [];

      if (type === "articles") {
        let categoryId = form.categoryId || null;
        if (form.category?.trim() && !categoryId) {
          try {
            const catRes = await fetch("/api/cms/articles/categories");
            if (catRes.ok) {
              const catJson = await catRes.json();
              const existing = (catJson.data || []).find(
                (c: any) => c.name.toLowerCase() === form.category.trim().toLowerCase()
              );
              if (existing) {
                categoryId = existing.id;
              } else {
                const createCatRes = await fetch("/api/cms/articles/categories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: form.category.trim() }),
                });
                if (createCatRes.ok) {
                  const created = await createCatRes.json();
                  categoryId = created.data?.id ?? null;
                }
              }
            }
          } catch {}
        }

        const payload = {
          title: form.title.trim(),
          author: form.author?.trim() || "Tim Employr",
          content: mainRichText,
          categoryId,
          coverImageUrl: form.coverImageUrl || null,
          tags: tagsPayload,
          isPublished: form.isPublished,
        };

        const url = editId ? `/api/cms/articles/${editId}` : `/api/cms/articles`;
        const method = editId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          router.push("/cms?tab=articles");
        } else {
          alert(json.message || "Gagal menyimpan artikel.");
        }
      } else if (type === "jobs") {
        if (!form.company?.trim()) {
          alert("Nama perusahaan wajib diisi.");
          setIsSaving(false);
          return;
        }

        const payload = {
          title: form.title.trim(),
          company: form.company.trim(),
          location: form.location?.trim() || "Indonesia",
          workType: form.workType || "ONSITE",
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
          description: mainRichText,
          externalUrl: form.externalUrl?.trim() || form.crawlUrl?.trim() || "https://employr.id",
          tags: tagsPayload,
          isActive: form.isActive ?? true,
          source: "manual",
        };

        const url = editId ? `/api/cms/jobs/${editId}` : `/api/cms/jobs`;
        const method = editId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          router.push("/cms?tab=jobs");
        } else {
          alert(json.message || "Gagal menyimpan lowongan.");
        }
      } else if (type === "courses") {
        if (!form.instructor?.trim()) {
          alert("Nama instruktur wajib diisi.");
          setIsSaving(false);
          return;
        }
        if (!form.externalUrl?.trim()) {
          alert("Link pendaftaran kursus wajib diisi.");
          setIsSaving(false);
          return;
        }

        const payload = {
          title: form.title.trim(),
          description: mainRichText,
          instructor: form.instructor.trim(),
          level: form.level || "Pemula",
          price: form.price ? Number(form.price) : 0,
          durationHours: form.durationHours ? Number(form.durationHours) : 1,
          externalUrl: form.externalUrl.trim(),
          coverImageUrl: form.coverImageUrl || null,
          tags: tagsPayload,
          isActive: form.isActive ?? true,
        };

        const url = editId ? `/api/cms/courses/${editId}` : `/api/cms/courses`;
        const method = editId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          router.push("/cms?tab=courses");
        } else {
          alert(json.message || "Gagal menyimpan kursus.");
        }
      } else if (type === "certifications") {
        if (!form.provider?.trim()) {
          alert("Lembaga penyelenggara sertifikasi wajib diisi.");
          setIsSaving(false);
          return;
        }
        if (!form.externalUrl?.trim()) {
          alert("Link informasi sertifikasi wajib diisi.");
          setIsSaving(false);
          return;
        }

        const payload = {
          title: form.title.trim(),
          description: mainRichText,
          provider: form.provider.trim(),
          price: form.price ? Number(form.price) : 0,
          durationHours: form.durationHours ? Number(form.durationHours) : 1,
          externalUrl: form.externalUrl.trim(),
          coverImageUrl: form.coverImageUrl || null,
          tags: tagsPayload,
          isActive: form.isActive ?? true,
        };

        const url = editId ? `/api/cms/certifications/${editId}` : `/api/cms/certifications`;
        const method = editId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          router.push("/cms?tab=certifications");
        } else {
          alert(json.message || "Gagal menyimpan sertifikasi.");
        }
      } else if (type === "events") {
        if (!form.externalUrl?.trim()) {
          alert("Link registrasi event wajib diisi.");
          setIsSaving(false);
          return;
        }

        const payload = {
          title: form.title.trim(),
          description: mainRichText,
          eventDate: form.eventDate || new Date().toISOString().split("T")[0],
          location: form.location?.trim() || "Online",
          type: form.eventType || "ONLINE",
          externalUrl: form.externalUrl.trim(),
          coverImageUrl: form.coverImageUrl || null,
          tags: tagsPayload,
          isActive: form.isActive ?? true,
        };

        const url = editId ? `/api/cms/events/${editId}` : `/api/cms/events`;
        const method = editId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          router.push("/cms?tab=events");
        } else {
          alert(json.message || "Gagal menyimpan event.");
        }
      }
    } catch (err: any) {
      alert("Terjadi kendala saat menyimpan data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.articles;
  const currentRichText = form.content || form.description || "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2.5 text-orange-500" />
        Memuat data editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Sticky Header with Back Button (NO SIDEBAR) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Back Button & Context */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/cms?tab=${config.defaultTab}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer shrink-0"
              title="Kembali ke CMS"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke CMS</span>
            </Link>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 hidden sm:inline-block">
                {config.singular}
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {editId ? `Edit ${config.singular}` : `Tambah ${config.singular} Baru`}
              </h1>
            </div>
          </div>

          {/* Center: Mode Toggle (Unified for ALL 5 Content Types) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "edit"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileEdit size={14} />
              <span className="hidden sm:inline">Mode Tulis</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "preview"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Pratinjau (Preview)</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/cms?tab=${config.defaultTab}`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition hidden md:block"
            >
              Batal
            </Link>
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              <span>{editId ? "Simpan Perubahan" : "Publikasikan"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {viewMode === "preview" ? (
          /* ===================== UNIFIED LIVE PREVIEW (BLOG OUTPUT) ===================== */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-200">
            {/* Cover Image Banner */}
            {form.coverImageUrl ? (
              <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                <img
                  src={form.coverImageUrl}
                  alt={form.title || "Cover"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-xs text-slate-400">
                <ImageIcon size={26} className="mb-1 text-slate-300 dark:text-slate-600" />
                <span>(Belum ada gambar sampul yang dipilih)</span>
              </div>
            )}

            {/* Header, Badges & Metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
                  {type === "articles"
                    ? form.category || "Tips Karier"
                    : type === "jobs"
                    ? form.company || "Lowongan Kerja"
                    : type === "courses"
                    ? `Kursus: ${form.level || "Pemula"}`
                    : type === "certifications"
                    ? `Sertifikasi: ${form.provider || "Profesional"}`
                    : `Event: ${form.eventType || "Online"}`}
                </span>

                {type === "articles" && (
                  <span className="text-xs text-slate-400 font-medium">
                    Ditulis oleh <strong className="text-slate-700 dark:text-slate-200">{form.author || "Tim Employr"}</strong>
                  </span>
                )}

                <span
                  className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    form.isPublished || form.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {type === "articles"
                    ? form.isPublished
                      ? "Status: Live Publik"
                      : "Status: Draft"
                    : form.isActive
                    ? "Status: Aktif"
                    : "Status: Nonaktif"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {form.title || `Judul ${config.singular} Anda Akan Tampil di Sini`}
              </h1>

              {/* Specific metadata chips */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {type === "jobs" && (
                  <>
                    {form.company && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Building2 size={14} className="text-orange-500" />
                        {form.company}
                      </span>
                    )}
                    {form.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <MapPin size={14} className="text-orange-500" />
                        {form.location} ({form.workType})
                      </span>
                    )}
                    {(form.salaryMin || form.salaryMax) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <DollarSign size={14} />
                        {form.salaryMin && form.salaryMax
                          ? `Rp${Number(form.salaryMin).toLocaleString("id-ID")} - Rp${Number(form.salaryMax).toLocaleString("id-ID")}`
                          : form.salaryMin
                          ? `Mulai Rp${Number(form.salaryMin).toLocaleString("id-ID")}`
                          : `Hingga Rp${Number(form.salaryMax).toLocaleString("id-ID")}`}
                        {" / Bulan"}
                      </span>
                    )}
                  </>
                )}

                {type === "courses" && (
                  <>
                    {form.instructor && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <GraduationCap size={14} className="text-orange-500" />
                        Instruktur: {form.instructor}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Clock size={14} className="text-orange-500" />
                      {form.durationHours || 1} Jam Belajar
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {form.price === 0 || !form.price
                        ? "Gratis Akses"
                        : `Rp${Number(form.price).toLocaleString("id-ID")}`}
                    </span>
                  </>
                )}

                {type === "certifications" && (
                  <>
                    {form.provider && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Award size={14} className="text-orange-500" />
                        Penyelenggara: {form.provider}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Clock size={14} className="text-orange-500" />
                      {form.durationHours || 1} Jam Ujian/Persiapan
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {form.price === 0 || !form.price
                        ? "Gratis"
                        : `Rp${Number(form.price).toLocaleString("id-ID")}`}
                    </span>
                  </>
                )}

                {type === "events" && (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <CalendarDays size={14} className="text-orange-500" />
                      {form.eventDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <MapPin size={14} className="text-orange-500" />
                      {form.location || "Online"} ({form.eventType})
                    </span>
                  </>
                )}

                {/* Action CTA Button */}
                {form.externalUrl && (
                  <a
                    href={form.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 ml-auto px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                  >
                    <span>
                      {type === "jobs"
                        ? "Lamar Lowongan Ini"
                        : type === "courses"
                        ? "Daftar Kursus"
                        : type === "certifications"
                        ? "Daftar Sertifikasi"
                        : type === "events"
                        ? "Daftar Event"
                        : "Buka Link Asli"}
                    </span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Rendered HTML Content */}
            {currentRichText ? (
              <div
                className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentRichText }}
              />
            ) : (
              <div className="py-16 text-center text-sm text-slate-400 italic">
                Konten belum diisi. Pindah ke "Mode Tulis" untuk mulai menyusun teks dan menyisipkan media pendukung.
              </div>
            )}

            {/* SEO Hashtags in Preview */}
            {form.tags && form.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash size={14} className="text-orange-500" />
                  Tagar &amp; Kata Kunci SEO:
                </span>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((t: string) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===================== UNIFIED WRITING EDIT MODE ===================== */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Auto-Crawl Bar (for Jobs) */}
            {type === "jobs" && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 dark:text-orange-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Punya tautan lowongan? Auto-ekstrak dengan bot crawler:
                  </span>
                  <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                    Glints, Jobstreet, LinkedIn, KitaLulus, dll
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.crawlUrl}
                    onChange={(e) => setField("crawlUrl", e.target.value)}
                    placeholder="https://id.jobstreet.com/job/..."
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleCrawlJob}
                    disabled={isCrawling}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {isCrawling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    ⚡ Ekstrak Link
                  </button>
                </div>
              </div>
            )}

            {/* 1. Title Input Card (Substack / Medium style) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Judul {config.singular} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={
                  type === "articles"
                    ? "Ketik Judul Artikel di Sini..."
                    : type === "jobs"
                    ? "Posisi Lowongan (Contoh: Product Designer / Marketing Specialist)..."
                    : type === "courses"
                    ? "Judul Kursus & Skills (Contoh: Fullstack Next.js 15 Bootcamp)..."
                    : type === "certifications"
                    ? "Nama Sertifikasi (Contoh: BNSP Digital Marketing & SEO)..."
                    : "Nama Acara / Event (Contoh: Employr Virtual Career Fair 2026)..."
                }
                className="w-full text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none focus:outline-none resize-none leading-tight p-0"
              />
            </div>

            {/* 2. Type-Specific Metadata Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <config.icon size={16} className="text-orange-500" />
                Informasi &amp; Atribut {config.singular}
              </h3>

              {/* Artikel Attributes */}
              {type === "articles" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Penulis / Author
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setField("author", e.target.value)}
                      placeholder="Tim Employr"
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Kategori Artikel
                    </label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                      placeholder="Contoh: Panduan CV, Interview, Karier"
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Jobs Attributes */}
              {type === "jobs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Nama Perusahaan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={form.company}
                          onChange={(e) => setField("company", e.target.value)}
                          placeholder="Contoh: PT Shopee International Indonesia"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Lokasi Kerja
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => setField("location", e.target.value)}
                          placeholder="Contoh: Jakarta Selatan / Bandung"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Sistem Kerja
                      </label>
                      <select
                        value={form.workType}
                        onChange={(e) => setField("workType", e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      >
                        <option value="ONSITE">Onsite (Di Kantor)</option>
                        <option value="REMOTE">Remote (Kerja Dari Mana Saja)</option>
                        <option value="HYBRID">Hybrid (Campuran)</option>
                        <option value="ONLINE">Online</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Gaji Minimal (Rp)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="number"
                          min={0}
                          value={form.salaryMin}
                          onChange={(e) => setField("salaryMin", e.target.value)}
                          placeholder="5000000"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Gaji Maksimal (Rp)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="number"
                          min={0}
                          value={form.salaryMax}
                          onChange={(e) => setField("salaryMax", e.target.value)}
                          placeholder="8000000"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Link Pendaftaran / Sumber Asli Lowongan
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={form.externalUrl}
                        onChange={(e) => setField("externalUrl", e.target.value)}
                        placeholder="https://karir.perusahaan.com/..."
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Courses Attributes */}
              {type === "courses" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Instruktur / Pengajar <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.instructor}
                        onChange={(e) => setField("instructor", e.target.value)}
                        placeholder="Contoh: Budi Pratama, Lead Tech Educator"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Level Kursus
                      </label>
                      <select
                        value={form.level}
                        onChange={(e) => setField("level", e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      >
                        <option value="Pemula">Pemula</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Mahir">Mahir</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Biaya Kursus (Rp) <span className="text-slate-400">(0 = Gratis)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Estimasi Durasi Belajar (Jam)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.durationHours}
                        onChange={(e) => setField("durationHours", e.target.value)}
                        placeholder="12"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Link Pendaftaran Kursus <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={form.externalUrl}
                      onChange={(e) => setField("externalUrl", e.target.value)}
                      placeholder="https://kursus.com/daftar"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Certifications Attributes */}
              {type === "certifications" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Lembaga Penyelenggara <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.provider}
                        onChange={(e) => setField("provider", e.target.value)}
                        placeholder="Contoh: BNSP / Google Career Certificates"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Biaya Sertifikasi (Rp) <span className="text-slate-400">(0 = Gratis)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Durasi Ujian / Jam
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.durationHours}
                        onChange={(e) => setField("durationHours", e.target.value)}
                        placeholder="4"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Link Informasi &amp; Pendaftaran Resmi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={form.externalUrl}
                      onChange={(e) => setField("externalUrl", e.target.value)}
                      placeholder="https://sertifikasi.id/..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Events Attributes */}
              {type === "events" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={form.eventDate}
                        onChange={(e) => setField("eventDate", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Tipe Pelaksanaan
                      </label>
                      <select
                        value={form.eventType}
                        onChange={(e) => setField("eventType", e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      >
                        <option value="ONLINE">Online / Webinar</option>
                        <option value="ONSITE">Onsite (Tatap Muka)</option>
                        <option value="HYBRID">Hybrid (Campuran)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Lokasi / Platform
                      </label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setField("location", e.target.value)}
                        placeholder="Zoom / JCC Senayan"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Link Registrasi / Tiket Event <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={form.externalUrl}
                      onChange={(e) => setField("externalUrl", e.target.value)}
                      placeholder="https://event.id/daftar"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. SEO Keywords & Tagar Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tagar &amp; Kata Kunci SEO (Search Engine Optimization)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Tagar membantu Googlebot mengindeks topik, meningkatkan pencarian organik, dan menghubungkan konten terkait.
                </p>
              </div>

              {/* Active Tag Chips */}
              <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                {form.tags && form.tags.length > 0 ? (
                  form.tags.map((t: string) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 animate-in fade-in"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600 transition cursor-pointer"
                        title="Hapus tagar"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic px-2">
                    Belum ada tagar ditambahkan. Ketik di bawah atau pilih dari rekomendasi.
                  </span>
                )}
              </div>

              {/* Tag Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Ketik kata kunci atau tagar (contoh: FreshGraduate, KerjaRemote), lalu tekan Enter atau Koma..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Suggested Tags */}
              {config.suggestedTags && config.suggestedTags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ⚡ Rekomendasi Tagar SEO Populer:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {config.suggestedTags.map((suggested: string) => {
                      const isAdded = form.tags?.includes(suggested);
                      return (
                        <button
                          key={suggested}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddTag(suggested)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                            isAdded
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed"
                              : "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 hover:bg-orange-100"
                          }`}
                        >
                          <span>{suggested}</span>
                          {!isAdded && <Plus size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Universal Cover Image Uploader */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {config.coverLabel}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Foto yang tampil di thumbnail katalog dan banner utama halaman detail
                  </p>
                </div>
              </div>

              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {form.coverImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group h-64 sm:h-80 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={form.coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer hover:bg-slate-100 transition"
                    >
                      <Upload size={14} />
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setField("coverImageUrl", "")}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer hover:bg-rose-700 transition"
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverFileInputRef.current?.click()}
                  className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-slate-400 hover:text-orange-500"
                >
                  {uploadingCover ? (
                    <Loader2 size={26} className="animate-spin text-orange-500" />
                  ) : (
                    <Upload size={26} />
                  )}
                  <div className="text-center">
                    <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">
                      {uploadingCover ? "Sedang mengunggah gambar..." : "Klik untuk upload gambar sampul dari komputer"}
                    </span>
                    <span className="text-[11px] text-slate-400">Format JPG, PNG, WEBP hingga 10MB</span>
                  </div>
                </div>
              )}

              {/* URL Input Fallback */}
              <input
                type="url"
                value={form.coverImageUrl}
                onChange={(e) => setField("coverImageUrl", e.target.value)}
                placeholder="Atau tempel link URL foto langsung di sini..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* 5. WYSIWYG Tiptap Editor (Standardized for ALL 5 Types) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {config.editorTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {config.editorDesc}
                  </p>
                </div>
              </div>

              <TiptapEditor
                content={currentRichText}
                onChange={(html) => {
                  setField("content", html);
                  setField("description", html);
                }}
                placeholder={config.editorPlaceholder}
              />
            </div>

            {/* 6. Status Toggle */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  {type === "articles" ? "Status Publikasi Artikel" : "Status Keaktifan Konten"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {type === "articles"
                    ? "Jika aktif, artikel langsung tampil secara publik di dashboard pengguna"
                    : "Jika aktif, konten langsung dapat diakses dan dilihat oleh para pencari kerja"}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={type === "articles" ? !!form.isPublished : !!form.isActive}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setField("isPublished", checked);
                    setField("isActive", checked);
                  }}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {type === "articles"
                    ? form.isPublished
                      ? "Terbitkan Langsung"
                      : "Simpan Sebagai Draft"
                    : form.isActive
                    ? "Aktif Tampil"
                    : "Nonaktif"}
                </span>
              </label>
            </div>
          </div>
        )}
      </main>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}

export default function CMSEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2.5 text-orange-500" />
          Memuat Editor CMS...
        </div>
      }
    >
      <CMSEditorContent />
    </Suspense>
  );
}
