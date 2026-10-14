"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Globe,
  Monitor,
  Maximize2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { Skeleton, SkeletonText } from "@/components/admin/Skeleton";

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

export default function LaporanBugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<BugReportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reply & Status Form state
  const [replyContent, setReplyContent] = useState("");
  const [newStatus, setNewStatus] = useState<string>("in_progress");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/bug-reports?ticket_id=${encodeURIComponent(ticketId)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTicket(data.data);
        setNewStatus(data.data.status === "open" ? "in_progress" : data.data.status);
      } else {
        setErrorMessage(data.message || "Tiket laporan bug tidak ditemukan.");
      }
    } catch (err: any) {
      console.error("Gagal memuat detail laporan bug:", err);
      setErrorMessage("Terjadi kendala jaringan saat memuat tiket.");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    if (!replyContent.trim() && newStatus === ticket.status) {
      setFeedback({
        text: "Silakan tulis isi balasan atau ubah status tiket terlebih dahulu.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.id,
          status: newStatus,
          reply_html: replyContent,
          admin_name: "Tim Support Employr",
          admin_email: "support@employr.id",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          text: "Balasan berhasil dikirim dan status tiket diperbarui.",
          type: "success",
        });
        setReplyContent("");
        fetchTicket();
      } else {
        setFeedback({
          text: data.message || "Gagal mengirim balasan.",
          type: "error",
        });
      }
    } catch (err) {
      setFeedback({
        text: "Terjadi kesalahan saat menyimpan balasan.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200" aria-busy="true">
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <SkeletonText lines={4} />
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-36 rounded-md pb-3 border-b border-slate-100 dark:border-slate-800" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (errorMessage || !ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/laporan-bug"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laporan Bug</span>
        </Link>
        <div className="p-6 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {errorMessage || "Tiket tidak ditemukan"}
          </h2>
          <p className="text-xs text-slate-500">
            Tiket laporan bug dengan ID atau kode ini tidak tersedia di database.
          </p>
          <Link
            href="/laporan-bug"
            className="inline-block px-4 py-2 rounded-[8px] bg-[#1F3578] text-white text-xs font-bold"
          >
            Lihat Semua Laporan
          </Link>
        </div>
      </div>
    );
  }

  let statusBadge = (
    <span className="px-2.5 py-1 rounded-[6px] text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
      Menunggu Review
    </span>
  );
  if (ticket.status === "in_review" || ticket.status === "in_progress") {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-[6px] text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
        Sedang Diperiksa
      </span>
    );
  } else if (ticket.status === "resolved") {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-[6px] text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        Selesai Diperbaiki
      </span>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <Link
            href="/laporan-bug"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Laporan Bug</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="font-mono font-bold text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2.5 py-1 rounded-[6px] border border-orange-200 dark:border-orange-900 flex items-center gap-1.5">
              <span>{ticket.ticket_code}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(ticket.ticket_code)}
                className="hover:text-orange-700 dark:hover:text-orange-300 transition"
                title="Salin Kode Tiket"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
            {statusBadge}
            <span className="text-xs text-slate-400">
              Dilaporkan pada{" "}
              {new Date(ticket.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-1">
            {ticket.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/laporan-bug"
            className="px-3.5 py-2 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Kembali
          </Link>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context & Ticket Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* User & Ticket Metadata Card */}
          <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Informasi Pelapor & Tiket</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Pelapor</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{ticket.user_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{ticket.user_email}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Urgensi</span>
                <p className="font-bold capitalize text-slate-800 dark:text-slate-200">
                  {ticket.severity === "high"
                    ? "Kritis / Tinggi"
                    : ticket.severity === "medium"
                    ? "Sedang"
                    : "Rendah"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kategori Modul</span>
                <p className="font-bold uppercase text-slate-800 dark:text-slate-200">{ticket.category}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">User ID</span>
                <p className="font-mono text-[11px] text-slate-500 truncate">{ticket.user_id}</p>
              </div>
            </div>

            {ticket.page_url && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Halaman URL Masalah
                </span>
                <a
                  href={ticket.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 break-all"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span>{ticket.page_url}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Chronological Description Card */}
          <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Deskripsi & Kronologi Bug
            </h3>
            <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Screenshots Gallery */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lampiran Tangkapan Layar ({ticket.attachments.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ticket.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    onClick={() => setZoomedImage(att.data_url)}
                    className="group relative rounded-[8px] overflow-hidden border border-slate-200 dark:border-slate-700 h-28 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  >
                    <img
                      src={att.data_url}
                      alt={att.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>Perbesar</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Environment Diagnostics */}
          {ticket.system_info && (
            <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                <span>Diagnostik Perangkat Pelapor</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-[8px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block">Browser:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {ticket.system_info.browser || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sistem Operasi:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {ticket.system_info.os || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Resolusi Layar:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {ticket.system_info.screen_resolution || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Koneksi:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {ticket.system_info.online ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Full Resolution & Reply Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status & Reply Composer Card */}
          <div className="p-5 sm:p-6 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Tulis Balasan & Perbarui Status
                </h2>
                <p className="text-xs text-slate-500">
                  Balasan resmi akan tersimpan ke tiket dan dikirimkan kepada pelapor bug.
                </p>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Status:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="open">Menunggu Review</option>
                  <option value="in_progress">Sedang Diperiksa</option>
                  <option value="resolved">Selesai Diperbaiki</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Isi Pesan Balasan Resmi (Rich Text)
                </label>
                <div className="rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-800">
                  <TiptapEditor
                    content={replyContent}
                    onChange={(html) => setReplyContent(html)}
                    placeholder="Tuliskan konfirmasi perbaikan, rincian solusi teknis, atau permintaan detail tambahan kepada pengguna di sini..."
                  />
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3.5 rounded-[8px] text-xs font-medium flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Perubahan status akan segera tercermin di dashboard user.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-[8px] bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition shadow-md shadow-orange-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Balasan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Balasan & Simpan Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Conversation History / Previous Replies */}
          <div className="p-5 sm:p-6 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Riwayat Balasan Terkirim ({ticket.replies?.length || 0})</span>
            </h3>

            {ticket.replies && ticket.replies.length > 0 ? (
              <div className="space-y-3.5">
                {ticket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {reply.admin_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500 text-white font-bold">
                          Admin Support
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
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
            ) : (
              <div className="p-4 rounded-[8px] bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-400 text-center italic border border-slate-100 dark:border-slate-800">
                Belum ada tanggapan atau balasan yang dikirimkan untuk tiket ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-[10px]">
            <img
              src={zoomedImage}
              alt="Lampiran Perbesar"
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
