"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  X,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Copy,
  Check,
  Loader2,
  ThumbsUp,
  TrendingUp,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { Skeleton } from "@/components/admin/Skeleton";

interface FeatureRequestReply {
  id: string;
  admin_name: string;
  admin_email?: string;
  message_html: string;
  created_at: string;
}

interface FeatureRequestItem {
  id: string;
  request_code: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  category: string;
  problem_statement: string;
  expected_behavior?: string;
  attachments?: Array<{
    name: string;
    data_url: string;
    size: number;
  }>;
  votes_count: number;
  voter_ids: string[];
  status: "under_review" | "planned" | "in_progress" | "completed" | "declined";
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  replies?: FeatureRequestReply[];
}

const CATEGORY_LABELS: Record<string, string> = {
  cv_builder: "CV Builder",
  job_tracker: "Tracker Lamaran",
  cv_screener: "Simulasi Screening",
  marketplace: "Loker & Marketplace",
  mailer: "Email & Cover Letter",
  career_intelligence: "Career Intelligence",
  account: "Akun & Notifikasi",
  other: "Fitur Baru",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; rowBg?: string }
> = {
  under_review: {
    label: "Ditinjau",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  planned: {
    label: "Direncanakan",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  in_progress: {
    label: "Sedang Dibuat",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  completed: {
    label: "Sudah Rilis",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  declined: {
    label: "Belum Memungkinkan",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

export default function SaranFiturAdminPage() {
  const [requests, setRequests] = useState<FeatureRequestItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    under_review: 0,
    planned: 0,
    in_progress: 0,
    completed: 0,
    declined: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selected for Drawer
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequestItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/feature-requests?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleOpenDrawer = (item: FeatureRequestItem) => {
    setSelectedRequest(item);
  };

  const handleCloseDrawer = () => {
    setSelectedRequest(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Manajemen Saran & Request Fitur
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola aspirasi, ide pengembangan, dan masukan fitur dari pengguna platform Employr.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/laporan-bug"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Laporan Bug</span>
          </Link>

          <button
            onClick={loadRequests}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Ide Masuk</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Ditinjau Tim</span>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">
            {stats.under_review}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Direncanakan
          </span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.planned}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Sedang Dibuat
          </span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {stats.in_progress}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Sudah Rilis
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.completed}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul ide, pengaju, email, atau kode..."
            className="w-full pl-9 pr-3 py-1.5 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1738D1]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="under_review">Ditinjau</option>
            <option value="planned">Direncanakan</option>
            <option value="in_progress">Sedang Dibuat</option>
            <option value="completed">Sudah Rilis</option>
            <option value="declined">Belum Memungkinkan</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="cv_builder">CV Builder</option>
            <option value="job_tracker">Tracker Lamaran</option>
            <option value="cv_screener">Simulasi Screening</option>
            <option value="marketplace">Loker & Marketplace</option>
            <option value="mailer">Email & Cover Letter</option>
            <option value="career_intelligence">Career Intelligence</option>
            <option value="account">Akun & Notifikasi</option>
            <option value="other">Fitur Baru</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Kode & Judul Saran</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Dukungan</th>
                <th className="py-3 px-4">Pengaju</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                    <td className="py-3 px-4 max-w-xs sm:max-w-md space-y-1">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-48 rounded" />
                    </td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-20 rounded" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-12 rounded" /></td>
                    <td className="py-3 px-4 space-y-1">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-3.5 w-20 rounded" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-7 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Lightbulb className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <span>Tidak ada saran fitur yang cocok dengan filter saat ini.</span>
                  </td>
                </tr>
              ) : (
                requests.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.under_review;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[11px] text-slate-400">
                              {item.request_code}
                            </span>
                            {item.replies && item.replies.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-bold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                <MessageSquare className="w-3 h-3" />
                                <span>{item.replies.length}</span>
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.title}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.votes_count}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {item.user_name}
                          </p>
                          <p className="text-[11px] text-slate-400">{item.user_email}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(item);
                            }}
                            className="px-2.5 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                          >
                            Overview
                          </button>
                          <Link
                            href={`/saran-fitur/${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1.5 rounded-[6px] bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-[#1738D1] dark:text-blue-400 font-bold text-xs transition inline-flex items-center gap-1"
                          >
                            <span>Tanggapi</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right-Hand Slide-in Overview Drawer */}
      {selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity"
        >
          {/* Backdrop click listener */}
          <div
            className="absolute inset-0"
            onClick={handleCloseDrawer}
            aria-hidden="true"
          />

          <div className="relative z-10 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg lg:max-w-xl h-full flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-[6px] border border-blue-200 dark:border-blue-900">
                      {selectedRequest.request_code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedRequest.request_code)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      title="Salin Kode"
                    >
                      {copiedCode === selectedRequest.request_code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold border ${
                        (STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.under_review).badgeClass
                      }`}
                    >
                      {(STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.under_review).label}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate mt-1">
                    {selectedRequest.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Tutup detail saran"
                className="p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body (Scrollable Overview) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-xs">
              {/* Info Pengaju & Upvote */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Pengaju</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedRequest.user_name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedRequest.user_email}</p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Dukungan Komunitas</span>
                  <p className="font-bold text-[#1738D1] dark:text-blue-400 text-sm mt-0.5 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{selectedRequest.votes_count} suara</span>
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Kategori: {CATEGORY_LABELS[selectedRequest.category] || selectedRequest.category}
                  </span>
                </div>
              </div>

              {/* Masalah / Rationale */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Kendala & Alasan Fitur
                </h4>
                <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.problem_statement}
                </div>
              </div>

              {/* Ekspektasi Cara Kerja */}
              {selectedRequest.expected_behavior && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Ekspektasi Cara Kerja
                  </h4>
                  <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.expected_behavior}
                  </div>
                </div>
              )}

              {/* Lampiran Gambar */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Referensi / Mockup ({selectedRequest.attachments.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {selectedRequest.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        onClick={() => setZoomedImage(att.data_url)}
                        className="relative group rounded-[8px] overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        <img
                          src={att.data_url}
                          alt={att.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium gap-1">
                          <Maximize2 className="w-3 h-3" />
                          <span>Perbesar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Riwayat Balasan Admin */}
              {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-[#1738D1] dark:text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Riwayat Tanggapan Tim ({selectedRequest.replies.length})</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedRequest.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3.5 rounded-[10px] bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#1738D1] dark:text-blue-300">
                            {reply.admin_name}
                          </span>
                          <span className="text-slate-400">
                            {new Date(reply.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className="prose prose-xs dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: reply.message_html }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer with CTA to Open Dedicated Reply Page */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="px-4 py-2 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`/saran-fitur/${selectedRequest.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buka halaman tanggapan di tab baru"
                  className="p-2 rounded-[8px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link
                  href={`/saran-fitur/${selectedRequest.id}`}
                  className="px-4 py-2 rounded-[8px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <span>Buka Halaman Tanggapan</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-[10px]">
            <img
              src={zoomedImage}
              alt="Zoomed Reference"
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
