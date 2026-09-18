"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Power,
  Clock,
  Database,
  XCircle,
  CheckCircle2,
  Layers,
  Plus,
  X,
  Sparkles,
  Loader2,
  Building2,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";

export interface AdminJob {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  workType: string;
  externalUrl: string;
  source: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface JobsStats {
  scrapedActive: number;
  manualActive: number;
  inactive: number;
  bySource: Array<{ source: string; count: number }>;
}

export function AdminJobsView({
  hideTitle = false,
  triggerAddModal = 0,
}: {
  hideTitle?: boolean;
  triggerAddModal?: number;
}) {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [stats, setStats] = useState<JobsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [toast, setToast] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    company: "",
    location: "Jakarta",
    workType: "ONSITE",
    salaryMin: "",
    salaryMax: "",
    description: "",
    externalUrl: "",
    crawlUrl: "",
    isActive: true,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ source: sourceFilter, status: statusFilter });
      const res = await fetch(`/api/cms/jobs?${params}`);
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        setStats(json.stats);
      } else {
        showToast(json.message || "Gagal memuat lowongan.");
      }
    } catch {
      showToast("Gagal memuat lowongan.");
    } finally {
      setIsLoading(false);
    }
  }, [sourceFilter, statusFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (triggerAddModal && triggerAddModal > 0) {
      setIsAddModalOpen(true);
    }
  }, [triggerAddModal]);

  const handleToggle = async (job: AdminJob) => {
    try {
      const res = await fetch("/api/cms/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, isActive: !job.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)));
        showToast(job.isActive ? "Lowongan dinonaktifkan." : "Lowongan diaktifkan.");
      } else {
        showToast(json.message || "Gagal mengubah status.");
      }
    } catch {
      showToast("Gagal mengubah status lowongan.");
    }
  };

  const handleDelete = async (job: AdminJob) => {
    if (!window.confirm(`Hapus permanen "${job.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/cms/jobs?id=${job.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
        showToast("Lowongan dihapus permanen.");
      } else {
        showToast(json.message || "Gagal menghapus lowongan.");
      }
    } catch {
      showToast("Gagal menghapus lowongan.");
    }
  };

  const handleCrawlUrl = async () => {
    if (!newJobForm.crawlUrl.trim()) {
      showToast("Silakan tempel URL lowongan terlebih dahulu.");
      return;
    }
    setIsCrawling(true);
    try {
      const res = await fetch("/api/cms/jobs/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newJobForm.crawlUrl }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setNewJobForm((prev) => ({
          ...prev,
          title: d.title || prev.title,
          company: d.company || prev.company,
          location: d.location || prev.location,
          workType: d.workType || prev.workType,
          description: d.description || prev.description,
          externalUrl: d.url || prev.externalUrl,
        }));
        showToast("✨ Data lowongan berhasil diekstrak otomatis!");
      } else {
        showToast(json.message || "Gagal meng-crawl URL lowongan.");
      }
    } catch {
      showToast("Terjadi kendala saat meng-crawl tautan.");
    } finally {
      setIsCrawling(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title.trim() || !newJobForm.company.trim()) {
      showToast("Judul posisi dan nama perusahaan wajib diisi.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/cms/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newJobForm.title,
          company: newJobForm.company,
          location: newJobForm.location,
          workType: newJobForm.workType,
          salaryMin: newJobForm.salaryMin ? Number(newJobForm.salaryMin) : null,
          salaryMax: newJobForm.salaryMax ? Number(newJobForm.salaryMax) : null,
          description: newJobForm.description,
          externalUrl: newJobForm.externalUrl || newJobForm.crawlUrl,
          isActive: newJobForm.isActive,
          source: "manual",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("🎉 Lowongan berhasil ditambahkan dan live di Portal Loker (3003)!");
        setIsAddModalOpen(false);
        setNewJobForm({
          title: "",
          company: "",
          location: "Jakarta",
          workType: "ONSITE",
          salaryMin: "",
          salaryMax: "",
          description: "",
          externalUrl: "",
          crawlUrl: "",
          isActive: true,
        });
        loadJobs();
      } else {
        showToast(json.message || "Gagal menyimpan lowongan.");
      }
    } catch {
      showToast("Terjadi kendala saat menyimpan lowongan.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-orange-500" />
              Kelola Lowongan Kerja
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lowongan hasil scraping harian, crawler dari user submission, dan input manual admin. Portal Loker (3003) membaca data ini.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadJobs}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition disabled:opacity-60 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Muat Ulang
            </button>
            <Link
              href="/cms/editor?type=jobs"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Lowongan
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hasil Scraping (Aktif)</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats?.scrapedActive ?? "…"}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User Submit / Manual</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats?.manualActive ?? "…"}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nonaktif (Tutup)</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats?.inactive ?? "…"}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per Sumber</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-[42px] overflow-y-auto">
            {stats?.bySource && stats.bySource.length > 0 ? (
              stats.bySource.slice(0, 6).map((s) => (
                <span
                  key={s.source}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {s.source}: {s.count}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400">Belum ada data</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari judul / perusahaan / lokasi..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Sumber</option>
              <option value="user_submission">User Submission (Crawler)</option>
              <option value="manual">Manual Admin</option>
              {stats?.bySource
                .filter((s) => s.source !== "manual" && s.source !== "user_submission")
                .map((s) => (
                  <option key={s.source} value={s.source}>
                    {s.source}
                  </option>
                ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Memuat lowongan…</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Tidak ada lowongan sesuai filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3.5 font-bold">Lowongan</th>
                  <th className="px-4 py-3.5 font-bold">Sumber</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Sync Terakhir</th>
                  <th className="px-4 py-3.5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-xs">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {job.company} · {job.location}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.source === "user_submission"
                            ? "bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60"
                            : job.source === "manual"
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60"
                            : "bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200/60"
                        }`}
                      >
                        {job.source === "user_submission" ? "⚡ User Submit" : job.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {job.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {job.lastSyncedAt ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(job.lastSyncedAt).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.externalUrl && (
                          <a
                            href={job.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            title="Buka sumber asli"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/cms/editor?type=jobs&id=${job.id}`}
                          title="Edit Lowongan (Rich Text Editor)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/60 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleToggle(job)}
                          title={job.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            job.isActive
                              ? "text-emerald-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job)}
                          title="Hapus permanen"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Lowongan */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl my-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Tambah Lowongan Kerja Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otomatis tampil di Portal Loker (3003) untuk pencari kerja
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateJob} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Quick Auto-Crawl from Link */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Punya link loker? Auto-ekstrak dengan bot crawler:
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                    Glints, Jobstreet, LinkedIn, dll
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newJobForm.crawlUrl}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, crawlUrl: e.target.value }))}
                    placeholder="https://id.jobstreet.com/job/..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-orange-200 dark:border-orange-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleCrawlUrl}
                    disabled={isCrawling}
                    className="px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {isCrawling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    ⚡ Ekstrak Link
                  </button>
                </div>
              </div>

              {/* Posisi & Perusahaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Posisi / Judul Lowongan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newJobForm.title}
                      onChange={(e) => setNewJobForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Contoh: Digital Marketing Specialist"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Nama Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newJobForm.company}
                      onChange={(e) => setNewJobForm((p) => ({ ...p, company: e.target.value }))}
                      placeholder="Contoh: PT Tokopedia Indonesia"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lokasi & Tipe Kerja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Lokasi Kerja <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newJobForm.location}
                      onChange={(e) => setNewJobForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Contoh: Jakarta Selatan / Bandung"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Sistem Kerja
                  </label>
                  <select
                    value={newJobForm.workType}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, workType: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="ONSITE">Onsite (Di Kantor)</option>
                    <option value="REMOTE">Remote (Kerja dari Mana Saja)</option>
                    <option value="HYBRID">Hybrid (Campuran)</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
              </div>

              {/* Estimasi Gaji */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Gaji Minimal (Rp/Bulan)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={newJobForm.salaryMin}
                      onChange={(e) => setNewJobForm((p) => ({ ...p, salaryMin: e.target.value }))}
                      placeholder="Contoh: 5000000"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Gaji Maksimal (Rp/Bulan)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={newJobForm.salaryMax}
                      onChange={(e) => setNewJobForm((p) => ({ ...p, salaryMax: e.target.value }))}
                      placeholder="Contoh: 8000000"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Link Lamaran / URL Asli */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Link Lamaran / Sumber Asli Lowongan
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={newJobForm.externalUrl}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, externalUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Deskripsi &amp; Kualifikasi
                </label>
                <textarea
                  rows={4}
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Kualifikasi, tanggung jawab pekerjaan, atau catatan penting..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                />
              </div>

              {/* Checkbox Status Aktif */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newJobForm.isActive}
                  onChange={(e) => setNewJobForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Publikasikan langsung &amp; tampilkan di Portal Loker (3003)
                </span>
              </label>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Simpan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
