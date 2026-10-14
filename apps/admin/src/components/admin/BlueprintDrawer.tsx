"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Pencil,
  Upload,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileCode,
  Compass,
} from "lucide-react";

export interface BlueprintItem {
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

interface BlueprintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: BlueprintItem | null;
  onSaved: () => void;
  categories: Array<{ id: string; label: string }>;
}

export function BlueprintDrawer({
  isOpen,
  onClose,
  editingItem,
  onSaved,
  categories,
}: BlueprintDrawerProps) {
  const [drawerMode, setDrawerMode] = useState<"manual" | "batch">("manual");
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

  useEffect(() => {
    if (editingItem) {
      setDrawerMode("manual");
      setFormData({
        role_name: editingItem.role_name,
        category: editingItem.category || "other",
        top_essential_skills: [...(editingItem.top_essential_skills || [])],
        top_nicetohave_skills: [...(editingItem.top_nicetohave_skills || [])],
        is_promoted: editingItem.is_promoted,
      });
      setEssentialInput("");
      setNiceInput("");
      setFormError("");
    } else {
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
    }
  }, [editingItem, isOpen]);

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

      onClose();
      onSaved();
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

      onClose();
      onSaved();
    } catch (err: any) {
      setBatchError(err.message || "Gagal menghubungi server saat import batch.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          {/* Click-away backdrop */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Slide-in Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-md sm:max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                    {editingItem
                      ? "Edit Career Blueprint"
                      : drawerMode === "manual"
                      ? "Tambah Blueprint Satuan"
                      : "Batch Import Blueprints"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {editingItem
                      ? "Perbarui standardisasi keahlian untuk posisi ini."
                      : "Kelola standar keahlian manual atau impor sekaligus via berkas CSV/JSON."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup blueprint drawer"
                className="p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs (Only when creating new) */}
            {!editingItem && (
              <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-3 gap-2 bg-slate-50/30 dark:bg-slate-800/20 shrink-0">
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
            <div className="p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
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
                      {categories.filter((c) => c.id !== "all").map((c) => (
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
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
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
  );
}
