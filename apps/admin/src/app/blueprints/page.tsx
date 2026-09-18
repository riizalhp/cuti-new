"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatsCard } from "@/components/admin/StatsCard";
import { SidebarToggle } from "@/components/admin/SidebarToggle";
import {
  Compass,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Users,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Briefcase,
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

interface BlueprintItem {
  id: string;
  role_name: string;
  entry_count: number;
  top_essential_skills: string[];
  top_nicetohave_skills: string[];
  category: string;
  is_promoted: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { id: "all", label: "Semua Kategori" },
  { id: "tech", label: "Tech & Software" },
  { id: "design", label: "Design & UI/UX" },
  { id: "creative", label: "Creative & Media" },
  { id: "marketing", label: "Marketing & Growth" },
  { id: "product", label: "Product" },
  { id: "business", label: "Business & Sales" },
  { id: "operations", label: "Operations & Admin" },
  { id: "finance", label: "Finance & Tax" },
  { id: "fnb_retail", label: "F&B & Retail" },
  { id: "education", label: "Education" },
  { id: "other", label: "Lainnya" },
];

export default function CareerBlueprintsPage() {
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>([]);
  const [meta, setMeta] = useState({
    totalBlueprints: 0,
    totalPromoted: 0,
    totalSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "promoted" | "learned">("all");

  // Drawer State (Right-Hand Slide-in Drawer Spec)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"manual" | "batch">("manual");
  const [editingItem, setEditingItem] = useState<BlueprintItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Manual Form State
  const [formData, setFormData] = useState({
    role_name: "",
    category: "tech",
    top_essential_skills: [] as string[],
    top_nicetohave_skills: [] as string[],
    is_promoted: true,
  });
  const [essentialInput, setEssentialInput] = useState("");
  const [niceInput, setNiceInput] = useState("");
  const [formError, setFormError] = useState("");

  // Batch Import State
  const [batchRawText, setBatchRawText] = useState("");
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [batchFileName, setBatchFileName] = useState("");
  const [batchError, setBatchError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBlueprints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/blueprints");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlueprints(json.data);
        if (json.meta) setMeta(json.meta);
      }
    } catch (err) {
      console.error("Gagal memuat blueprints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const openAddDrawer = () => {
    setEditingItem(null);
    setDrawerMode("manual");
    setFormData({
      role_name: "",
      category: "tech",
      top_essential_skills: [],
      top_nicetohave_skills: [],
      is_promoted: true,
    });
    setEssentialInput("");
    setNiceInput("");
    setFormError("");
    setBatchRawText("");
    setBatchItems([]);
    setBatchFileName("");
    setBatchError("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (item: BlueprintItem) => {
    setEditingItem(item);
    setDrawerMode("manual");
    setFormData({
      role_name: item.role_name,
      category: item.category || "other",
      top_essential_skills: [...(item.top_essential_skills || [])],
      top_nicetohave_skills: [...(item.top_nicetohave_skills || [])],
      is_promoted: item.is_promoted,
    });
    setEssentialInput("");
    setNiceInput("");
    setFormError("");
    setIsDrawerOpen(true);
  };

  const handleAddEssentialSkill = () => {
    const trimmed = essentialInput.trim();
    if (trimmed && !formData.top_essential_skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        top_essential_skills: [...prev.top_essential_skills, trimmed],
      }));
      setEssentialInput("");
    }
  };

  const handleRemoveEssentialSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      top_essential_skills: prev.top_essential_skills.filter((s) => s !== skill),
    }));
  };

  const handleAddNiceSkill = () => {
    const trimmed = niceInput.trim();
    if (trimmed && !formData.top_nicetohave_skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        top_nicetohave_skills: [...prev.top_nicetohave_skills, trimmed],
      }));
      setNiceInput("");
    }
  };

  const handleRemoveNiceSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      top_nicetohave_skills: prev.top_nicetohave_skills.filter((s) => s !== skill),
    }));
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_name.trim()) {
      setFormError("Nama peran harus diisi.");
      return;
    }
    if (formData.top_essential_skills.length === 0) {
      setFormError("Minimal masukkan 1 keahlian utama (Essential Skill).");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const url = editingItem
        ? `/api/blueprints/${editingItem.id}`
        : "/api/blueprints";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.message || "Gagal menyimpan blueprint.");
        return;
      }

      setIsDrawerOpen(false);
      fetchBlueprints();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Template Download Helpers ───
  const downloadCsvTemplate = () => {
    const content = `role_name,category,essential_skills,nicetohave_skills,is_promoted\n"Flutter Developer","tech","Dart; Flutter; REST API; Git","Bloc; Riverpod; Firebase; CI/CD","true"\n"Food Stylist","creative","Plating Estetika; Food Photography; Lighting Komposisi","Culinary Art; Prop Styling; Social Media","true"\n"Barista Senior","fnb_retail","Kalibrasi Espresso; Manual Brewing; Customer Service","Latte Art; Inventory Management; POS System","true"\n"Tax Specialist","finance","Perpajakan PPh/PPN; e-Faktur; Brevet A/B; Rekonsiliasi Fiskal","Excel Finansial; Audit Pajak; SAP","true"`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employr-career-blueprints-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJsonTemplate = () => {
    const data = [
      {
        role_name: "Flutter Developer",
        category: "tech",
        top_essential_skills: ["Dart", "Flutter", "REST API", "Git"],
        top_nicetohave_skills: ["Bloc", "Riverpod", "Firebase", "CI/CD"],
        is_promoted: true,
      },
      {
        role_name: "Food Stylist",
        category: "creative",
        top_essential_skills: ["Plating Estetika", "Food Photography", "Lighting Komposisi"],
        top_nicetohave_skills: ["Culinary Art", "Prop Styling"],
        is_promoted: true,
      },
      {
        role_name: "Barista Senior",
        category: "fnb_retail",
        top_essential_skills: ["Kalibrasi Espresso", "Manual Brewing", "Customer Service"],
        top_nicetohave_skills: ["Latte Art", "Inventory Management"],
        is_promoted: true,
      },
    ];
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employr-career-blueprints-template.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Parsing Batch CSV / JSON ───
  const parseCsvContent = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const headerLine = lines[0].toLowerCase();
    const hasHeaders =
      headerLine.includes("role_name") ||
      headerLine.includes("peran") ||
      headerLine.includes("skills");
    const startIndex = hasHeaders ? 1 : 0;
    const parsed: any[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const values: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index === regex.lastIndex) regex.lastIndex++;
        let val = match[1] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        values.push(val.trim());
        if (values.length >= 6) break;
      }

      if (values.length >= 3) {
        const role_name = values[0];
        const category = values[1] || "other";
        const essential_raw = values[2] || "";
        const nice_raw = values[3] || "";
        const is_promoted_raw = values[4] || "true";

        const top_essential_skills = essential_raw
          .split(/[;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        const top_nicetohave_skills = nice_raw
          .split(/[;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        const is_promoted = /^(true|1|yes|ya)$/i.test(is_promoted_raw);

        if (role_name && top_essential_skills.length > 0) {
          parsed.push({
            role_name,
            category,
            top_essential_skills,
            top_nicetohave_skills,
            is_promoted,
          });
        }
      }
    }
    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchFileName(file.name);
    setBatchError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      setBatchRawText(content);

      if (file.name.endsWith(".json")) {
        try {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            const valid = json.filter(
              (item) => item.role_name && Array.isArray(item.top_essential_skills)
            );
            setBatchItems(valid);
            if (valid.length === 0) {
              setBatchError("Berkas JSON tidak memiliki format array blueprint yang valid.");
            }
          } else {
            setBatchError("JSON harus berupa array list blueprint.");
          }
        } catch {
          setBatchError("Format JSON tidak valid atau rusak.");
        }
      } else {
        const parsed = parseCsvContent(content);
        setBatchItems(parsed);
        if (parsed.length === 0) {
          setBatchError("Tidak ditemukan baris blueprint valid dalam berkas CSV.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRawTextChange = (text: string) => {
    setBatchRawText(text);
    setBatchError("");
    const trimmed = text.trim();
    if (!trimmed) {
      setBatchItems([]);
      return;
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          setBatchItems(json.filter((i) => i.role_name));
        }
      } catch {
        setBatchError("Format JSON teks belum valid.");
      }
    } else {
      const parsed = parseCsvContent(trimmed);
      setBatchItems(parsed);
    }
  };

  const handleSaveBatch = async () => {
    if (batchItems.length === 0) {
      setBatchError("Belum ada data blueprint yang siap diimpor.");
      return;
    }

    setIsSaving(true);
    setBatchError("");

    try {
      const res = await fetch("/api/blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: batchItems }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setBatchError(json.message || "Gagal mengimpor batch blueprints.");
        return;
      }

      setIsDrawerOpen(false);
      fetchBlueprints();
    } catch (err: any) {
      setBatchError(err.message || "Gagal menghubungi server saat import batch.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePromoted = async (item: BlueprintItem) => {
    try {
      const res = await fetch(`/api/blueprints/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_name: item.role_name,
          category: item.category,
          top_essential_skills: item.top_essential_skills,
          top_nicetohave_skills: item.top_nicetohave_skills,
          is_promoted: !item.is_promoted,
        }),
      });
      if (res.ok) {
        fetchBlueprints();
      }
    } catch (err) {
      console.error("Gagal toggle status promoted:", err);
    }
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Hapus blueprint "${roleName}" dari database?`)) return;

    try {
      const res = await fetch(`/api/blueprints/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBlueprints();
      }
    } catch (err) {
      console.error("Gagal menghapus blueprint:", err);
    }
  };

  const filteredBlueprints = useMemo(() => {
    return blueprints.filter((b) => {
      const matchQuery =
        !searchQuery.trim() ||
        b.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.top_essential_skills || []).some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (b.top_nicetohave_skills || []).some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchCategory =
        selectedCategory === "all" || b.category === selectedCategory;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "promoted" && b.is_promoted) ||
        (statusFilter === "learned" && !b.is_promoted);

      return matchQuery && matchCategory && matchStatus;
    });
  }, [blueprints, searchQuery, selectedCategory, statusFilter]);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "tech":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "design":
      case "creative":
        return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "marketing":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "finance":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "fnb_retail":
        return "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/80 text-[#F97316]">
                <Compass size={20} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Career Blueprints & Skill Mapping
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Standardisasi profil keahlian peran kerja, validasi kecocokan karier, dan kurasi hasil pembelajaran mandiri dari komunitas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchBlueprints}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={openAddDrawer}
            className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            <Plus size={15} /> Tambah Blueprint
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Blueprints Terdaftar"
          value={meta.totalBlueprints.toString()}
          change={`${blueprints.length} peran terpetakan`}
          icon={Briefcase}
          trend="up"
        />
        <StatsCard
          title="Terverifikasi (Official)"
          value={meta.totalPromoted.toString()}
          change={`${meta.totalPromoted} blueprint resmi`}
          icon={CheckCircle2}
          trend="up"
        />
        <StatsCard
          title="Kontribusi Pengguna"
          value={meta.totalSubmissions.toString()}
          change="Input keahlian kandidat"
          icon={Users}
          trend="up"
        />
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama peran, keahlian utama, atau keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1F3578]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="promoted">Official (Verified)</option>
              <option value="learned">Community Learned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blueprint Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Peran</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Keahlian Wajib (Essential)</th>
                <th className="py-3 px-4">Keahlian Pendukung (Nice-to-Have)</th>
                <th className="py-3 px-4 text-center">Kontributor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto mb-2 text-[#1F3578]" />
                    Memuat data blueprint peran karier...
                  </td>
                </tr>
              ) : filteredBlueprints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada blueprint yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredBlueprints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                          {item.role_name}
                        </span>
                        {item.is_promoted ? (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                            <Sparkles size={8} /> Learned
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(item.top_essential_skills || []).slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                        {(item.top_essential_skills || []).length > 4 && (
                          <span className="text-[9px] text-slate-400 self-center">
                            +{item.top_essential_skills.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(item.top_nicetohave_skills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                        {(item.top_nicetohave_skills || []).length > 3 && (
                          <span className="text-[9px] text-slate-400 self-center">
                            +{item.top_nicetohave_skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                      {item.entry_count || 0} user
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePromoted(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          item.is_promoted
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                        }`}
                      >
                        {item.is_promoted ? "Promoted" : "Community"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1F3578] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Blueprint"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.role_name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Hapus Blueprint"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Right-Hand Slide-in Drawer Spec ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
            {/* Click-away backdrop */}
            <div
              className="absolute inset-0"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Slide-in Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-md sm:max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {editingItem
                      ? "Edit Career Blueprint"
                      : drawerMode === "manual"
                      ? "Tambah Blueprint Satuan"
                      : "Batch Import Blueprints"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingItem
                      ? "Perbarui standardisasi keahlian untuk posisi ini."
                      : "Kelola standar keahlian manual atau impor sekaligus via berkas CSV/JSON."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode Tabs (Only when creating new) */}
              {!editingItem && (
                <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-3 gap-2 bg-slate-50/30 dark:bg-slate-800/20">
                  <button
                    type="button"
                    onClick={() => setDrawerMode("manual")}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      drawerMode === "manual"
                        ? "border-[#F97316] text-[#F97316]"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Pencil size={13} /> Input Satuan Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerMode("batch")}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      drawerMode === "batch"
                        ? "border-[#F97316] text-[#F97316]"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Upload size={13} /> Batch Import (CSV / JSON)
                  </button>
                </div>
              )}

              {/* Drawer Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* ─── TAB 1: MANUAL FORM ─── */}
                {drawerMode === "manual" && (
                  <form id="blueprint-manual-form" onSubmit={handleSaveManual} className="space-y-4">
                    {formError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Role Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nama Posisi / Peran
                      </label>
                      <input
                        type="text"
                        value={formData.role_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, role_name: e.target.value }))
                        }
                        placeholder="Contoh: Flutter Developer, Food Stylist, Arsitek"
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1F3578]"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Kategori Industri
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      >
                        {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Essential Skills */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Keahlian Utama (Essential Skills) — Wajib
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={essentialInput}
                          onChange={(e) => setEssentialInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEssentialSkill();
                            }
                          }}
                          placeholder="Ketik skill lalu tekan Enter..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddEssentialSkill}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer"
                        >
                          Tambah
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        {formData.top_essential_skills.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum ada keahlian utama ditambahkan.
                          </span>
                        ) : (
                          formData.top_essential_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEssentialSkill(skill)}
                                className="hover:text-rose-500 transition cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Nice-to-Have Skills */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Keahlian Pendukung (Nice-to-Have) — Opsional
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={niceInput}
                          onChange={(e) => setNiceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNiceSkill();
                            }
                          }}
                          placeholder="Ketik skill lalu tekan Enter..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddNiceSkill}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer"
                        >
                          Tambah
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        {formData.top_nicetohave_skills.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum ada keahlian pendukung ditambahkan.
                          </span>
                        ) : (
                          formData.top_nicetohave_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium flex items-center gap-1"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNiceSkill(skill)}
                                className="hover:text-rose-500 transition cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Promoted Toggle */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.is_promoted}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, is_promoted: e.target.checked }))
                          }
                          className="w-4 h-4 rounded text-[#F97316] focus:ring-orange-500 border-slate-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                            Tandai sebagai Blueprint Resmi (Verified / Promoted)
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Langsung diprioritaskan oleh diagnosis engine untuk pencocokan kandidat.
                          </span>
                        </div>
                      </label>
                    </div>
                  </form>
                )}

                {/* ─── TAB 2: BATCH IMPORT (CSV / JSON) ─── */}
                {drawerMode === "batch" && (
                  <div className="space-y-4">
                    {/* Download Template Bar */}
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1F3578] dark:text-blue-300 flex items-center gap-1.5">
                          <Download size={14} /> Unduh Format Template
                        </span>
                        <span className="text-[10px] text-slate-400">Siap diisi di Excel / Spreadsheet</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={downloadCsvTemplate}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          Template CSV (.csv / Excel)
                        </button>
                        <button
                          type="button"
                          onClick={downloadJsonTemplate}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileCode size={13} className="text-blue-600" />
                          Template JSON (.json)
                        </button>
                      </div>
                    </div>

                    {/* File Upload Dropzone */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Unggah Berkas (CSV / JSON)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv,.json,text/csv,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#F97316] rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 space-y-1"
                      >
                        <Upload size={20} className="mx-auto text-slate-400" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {batchFileName ? batchFileName : "Klik untuk memilih file CSV atau JSON"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Format CSV mendukung pemisah titik koma (;) untuk keahlian.
                        </p>
                      </div>
                    </div>

                    {/* Or Paste Raw Text */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Atau Tempel (Paste) Konten CSV / JSON Langsung
                        </label>
                        {batchItems.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200">
                            {batchItems.length} peran terdeteksi
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={5}
                        value={batchRawText}
                        onChange={(e) => handleRawTextChange(e.target.value)}
                        placeholder={`role_name,category,essential_skills,nicetohave_skills,is_promoted\n"Flutter Dev","tech","Dart; Flutter; REST API","Firebase; CI/CD","true"`}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1F3578] resize-y"
                      />
                    </div>

                    {batchError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{batchError}</span>
                      </div>
                    )}

                    {/* Preview parsed blueprints */}
                    {batchItems.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span>Preview Impor ({batchItems.length} Data):</span>
                          <span className="text-[10px] text-slate-400">Menampilkan maks 4 pertama</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {batchItems.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                                <span>{item.role_name}</span>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Essential: {item.top_essential_skills?.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>

                {drawerMode === "manual" ? (
                  <button
                    type="submit"
                    form="blueprint-manual-form"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving
                      ? "Menyimpan..."
                      : editingItem
                      ? "Simpan Perubahan"
                      : "Simpan Blueprint"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveBatch}
                    disabled={isSaving || batchItems.length === 0}
                    className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving
                      ? "Mengimpor..."
                      : `Impor (${batchItems.length}) Blueprints`}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
