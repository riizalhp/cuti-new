"use client";

import { useState, useEffect, useMemo } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { SidebarToggle } from "@/components/admin/SidebarToggle";
import { BlueprintDrawer, BlueprintItem } from "@/components/admin/BlueprintDrawer";
import { Skeleton, SkeletonStatsGrid } from "@/components/admin/Skeleton";
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
  Briefcase,
} from "lucide-react";

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
  const [editingItem, setEditingItem] = useState<BlueprintItem | null>(null);

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
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (item: BlueprintItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
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
      {isLoading && blueprints.length === 0 ? (
        <SkeletonStatsGrid count={3} columns={3} />
      ) : (
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
      )}

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
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-44 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-12 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-5 w-16 rounded-full mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-20 rounded-lg ml-auto" /></td>
                  </tr>
                ))
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

      {/* ─── Modular Slide-in Drawer ─── */}
      <BlueprintDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        editingItem={editingItem}
        onSaved={fetchBlueprints}
        categories={CATEGORIES}
      />
    </div>
  );
}
