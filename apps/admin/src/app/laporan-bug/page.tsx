"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Globe,
  Monitor,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Copy,
  Check,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { Skeleton } from "@/components/admin/Skeleton";

interface BugReportReply {
  id: string;
  admin_name: string;
  admin_email?: string;
  message_html: string;
  created_at: string;
}

interface BugReportTicket {
  id: string;
  ticket_code: string;
  user_id: string;
  user_email: string;
  user_name: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  page_url?: string;
  system_info?: {
    browser?: string;
    os?: string;
    screen_resolution?: string;
    device_type?: string;
    online?: boolean;
    user_agent?: string;
  };
  attachments?: Array<{
    name: string;
    data_url: string;
    size: number;
  }>;
  status: "open" | "in_review" | "in_progress" | "resolved";
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  replies?: BugReportReply[];
}

export default function LaporanBugAdminPage() {
  const [tickets, setTickets] = useState<BugReportTicket[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selected Ticket for Drawer/Modal
  const [selectedTicket, setSelectedTicket] = useState<BugReportTicket | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/bug-reports?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Gagal memuat laporan bug:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, severityFilter, categoryFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleOpenTicket = (ticket: BugReportTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCopy = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticket_code.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.user_name.toLowerCase().includes(q) ||
      t.user_email.toLowerCase().includes(q) ||
      (t.page_url && t.page_url.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Support & Issue Tracking</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            Laporan Bug & Kendala Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola, tinjau, dan balas tiket kendala teknis yang dilaporkan pengguna Employr secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/saran-fitur"
            className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Saran Fitur</span>
          </Link>

          <button
            type="button"
            onClick={loadTickets}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Laporan
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-sans">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
            Menunggu Review
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans">
            {stats.open}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
            Sedang Diperiksa
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-sans">
            {stats.in_progress}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
            Selesai Diperbaiki
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
            {stats.resolved}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, judul, pelapor, atau email..."
              className="w-full pl-9 pr-4 py-2 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Status</option>
              <option value="open">Menunggu Review</option>
              <option value="in_progress">Sedang Diperiksa</option>
              <option value="resolved">Selesai</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Urgensi</option>
              <option value="high">Tinggi (Kritis)</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="ui">Tampilan & UI</option>
              <option value="feature">Fitur & Tombol</option>
              <option value="auth">Akun & Profil</option>
              <option value="payment">Pembayaran</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Kode Tiket</th>
                <th className="px-4 py-3">Pelapor</th>
                <th className="px-4 py-3">Judul & Halaman</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Urgensi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Balasan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded" /></td>
                    <td className="px-4 py-3 space-y-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-36 rounded" />
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <Skeleton className="h-4 w-44 rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8 rounded" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-7 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 text-xs">
                    Tidak ada tiket yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const formattedDate = new Date(ticket.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Menunggu
                    </span>
                  );
                  if (ticket.status === "in_review" || ticket.status === "in_progress") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        Diperiksa
                      </span>
                    );
                  } else if (ticket.status === "resolved") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Selesai
                      </span>
                    );
                  }

                  let severityBadge = (
                    <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Rendah
                    </span>
                  );
                  if (ticket.severity === "medium") {
                    severityBadge = (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Sedang
                      </span>
                    );
                  } else if (ticket.severity === "high") {
                    severityBadge = (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        Kritis
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => handleOpenTicket(ticket)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/80 px-2 py-0.5 rounded-[6px] border border-orange-200 dark:border-orange-900">
                            {ticket.ticket_code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(ticket.ticket_code);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Salin kode"
                          >
                            {copiedCode === ticket.ticket_code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{formattedDate}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{ticket.user_name}</div>
                        <div className="text-[11px] text-slate-400">{ticket.user_email}</div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{ticket.title}</div>
                        {ticket.page_url && (
                          <div className="text-[10px] text-slate-400 font-mono truncate">{ticket.page_url}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {ticket.category.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">{severityBadge}</td>

                      <td className="px-4 py-3 whitespace-nowrap">{statusBadge}</td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {ticket.replies && ticket.replies.length > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{ticket.replies.length}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0</span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTicket(ticket);
                            }}
                            className="px-2.5 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                          >
                            Overview
                          </button>
                          <Link
                            href={`/laporan-bug/${ticket.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1.5 rounded-[6px] bg-orange-50 dark:bg-orange-950/80 hover:bg-orange-100 dark:hover:bg-orange-900/80 text-orange-600 dark:text-orange-400 text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            <span>Balas</span>
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
      {selectedTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity"
        >
          {/* Backdrop click listener */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedTicket(null)}
            aria-hidden="true"
          />

          <div className="relative z-10 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg lg:max-w-xl h-full flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded-[6px] border border-orange-200 dark:border-orange-900">
                      {selectedTicket.ticket_code}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedTicket.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate mt-1">
                    {selectedTicket.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                aria-label="Tutup detail laporan"
                className="p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable Overview) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {/* User & Ticket Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pelapor</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedTicket.user_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{selectedTicket.user_email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Kategori</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.category.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Urgensi</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.severity.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Halaman Terkait</span>
                  <p className="font-mono text-[11px] text-orange-600 dark:text-orange-400 truncate">
                    {selectedTicket.page_url || "-"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Deskripsi & Kronologi Masalah
                </h4>
                <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Screenshots Gallery */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Tangkapan Layar Lampiran ({selectedTicket.attachments.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedTicket.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        onClick={() => setZoomedImage(att.data_url)}
                        className="group relative rounded-[8px] overflow-hidden border border-slate-200 dark:border-slate-800 h-24 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        <img
                          src={att.data_url}
                          alt={att.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Diagnostics */}
              {selectedTicket.system_info && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Informasi Sistem Pengguna
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400 block">Browser:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicket.system_info.browser || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">OS:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicket.system_info.os || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Resolusi Layar:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicket.system_info.screen_resolution || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Status Koneksi:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicket.system_info.online ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Previous Replies Thread */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span>Riwayat Balasan ({selectedTicket.replies.length})</span>
                  </h4>

                  <div className="space-y-3">
                    {selectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3.5 rounded-[10px] bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-orange-600 dark:text-orange-400">
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
                          className="prose prose-xs dark:prose-invert max-w-none text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
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
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`/laporan-bug/${selectedTicket.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buka halaman balasan di tab baru"
                  className="p-2 rounded-[8px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link
                  href={`/laporan-bug/${selectedTicket.id}`}
                  className="px-4 py-2 rounded-[8px] bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center gap-1.5"
                >
                  <span>Buka Halaman Balas</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-[10px]">
            <img
              src={zoomedImage}
              alt="Screenshot Zoom"
              className="max-w-full max-h-[90vh] object-contain rounded-[10px]"
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
