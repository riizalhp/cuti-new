"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lightbulb,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Maximize2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { Skeleton, SkeletonText } from "@/components/admin/Skeleton";

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
  { label: string; badgeClass: string }
> = {
  under_review: {
    label: "Ditinjau Tim",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  planned: {
    label: "Direncanakan (Roadmap)",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  in_progress: {
    label: "Sedang Dikerjakan",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  completed: {
    label: "Sudah Selesai / Rilis",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  declined: {
    label: "Belum Memungkinkan",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

export default function SaranFiturDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [item, setItem] = useState<FeatureRequestItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [newStatus, setNewStatus] = useState<string>("under_review");
  const [adminNotes, setAdminNotes] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!requestId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/feature-requests?request_id=${encodeURIComponent(requestId)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItem(data.data);
        setNewStatus(data.data.status);
        setAdminNotes(data.data.admin_notes || "");
      } else {
        setErrorMessage(data.message || "Saran fitur tidak ditemukan.");
      }
    } catch (err: any) {
      console.error("Gagal memuat saran fitur:", err);
      setErrorMessage("Terjadi kendala jaringan saat memuat saran fitur.");
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!replyContent.trim() && newStatus === item.status && adminNotes === (item.admin_notes || "")) {
      setFeedback({
        text: "Silakan ubah status, tambahkan tanggapan resmi, atau perbarui catatan internal terlebih dahulu.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: item.id,
          status: newStatus,
          reply_html: replyContent.trim() || undefined,
          admin_notes: adminNotes.trim() || undefined,
          admin_name: "Tim Produk Employr",
          admin_email: "product@employr.id",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          text: "Pembaruan saran fitur dan tanggapan tim berhasil disimpan.",
          type: "success",
        });
        setReplyContent("");
        fetchRequest();
      } else {
        setFeedback({
          text: data.message || "Gagal menyimpan tanggapan.",
          type: "error",
        });
      }
    } catch (err) {
      setFeedback({
        text: "Terjadi kesalahan sistem saat menyimpan pembaruan.",
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
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-44 rounded-md pb-3 border-b border-slate-100 dark:border-slate-800" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/saran-fitur"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Saran Fitur</span>
        </Link>
        <div className="p-6 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {errorMessage || "Saran fitur tidak ditemukan"}
          </h2>
          <p className="text-xs text-slate-500">
            Saran fitur dengan ID atau kode ini tidak tersedia di database.
          </p>
          <Link
            href="/saran-fitur"
            className="inline-block px-4 py-2 rounded-[8px] bg-[#1F3578] text-white text-xs font-bold"
          >
            Lihat Semua Saran Fitur
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.under_review;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <Link
            href="/saran-fitur"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Saran Fitur</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-[6px] border border-blue-200 dark:border-blue-900 flex items-center gap-1.5">
              <span>{item.request_code}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(item.request_code)}
                className="hover:text-blue-700 dark:hover:text-blue-300 transition"
                title="Salin Kode Saran"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
            <span className={`px-2.5 py-1 rounded-[6px] text-xs font-bold border ${currentStatusConfig.badgeClass}`}>
              {currentStatusConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1738D1] dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/60 px-2.5 py-1 rounded-[6px] border border-blue-200/80 dark:border-blue-800/60">
              <ThumbsUp className="w-3 h-3" />
              <span>{item.votes_count} Dukungan Suara</span>
            </span>
            <span className="text-xs text-slate-400">
              Diajukan pada{" "}
              {new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-1">
            {item.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/saran-fitur"
            className="px-3.5 py-2 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Kembali
          </Link>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context & Submitter Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* User & Request Metadata */}
          <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Pengaju & Modul Produk</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Pengaju</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{item.user_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{item.user_email}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kategori Modul</span>
                <p className="font-bold text-[#1738D1] dark:text-blue-400">
                  {CATEGORY_LABELS[item.category] || item.category}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Upvotes Komunitas</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>{item.votes_count} suara</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">User ID</span>
                <p className="font-mono text-[11px] text-slate-500 truncate">{item.user_id}</p>
              </div>
            </div>
          </div>

          {/* Problem Statement Card */}
          <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kendala & Alasan Diusulkan Fitur Ini
            </h3>
            <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {item.problem_statement}
            </div>
          </div>

          {/* Expected Behavior Card */}
          {item.expected_behavior && (
            <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ekspektasi Cara Kerja / Alur Pengguna
              </h3>
              <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {item.expected_behavior}
              </div>
            </div>
          )}

          {/* Reference Images Gallery */}
          {item.attachments && item.attachments.length > 0 && (
            <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lampiran Referensi / Mockup ({item.attachments.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {item.attachments.map((att, idx) => (
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
        </div>

        {/* Right Column: Roadmap & Response Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status & Reply Composer */}
          <div className="p-5 sm:p-6 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pembaruan Roadmap & Tanggapan Tim
                </h2>
                <p className="text-xs text-slate-500">
                  Perbarui status ide dan publikasikan tanggapan resmi dari tim produk.
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Status:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1738D1] cursor-pointer"
                >
                  <option value="under_review">Ditinjau Tim</option>
                  <option value="planned">Direncanakan (Roadmap)</option>
                  <option value="in_progress">Sedang Dikerjakan (In Progress)</option>
                  <option value="completed">Sudah Selesai / Rilis</option>
                  <option value="declined">Belum Memungkinkan</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tulis Tanggapan Resmi Tim (Rich Text)
                </label>
                <div className="rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-800">
                  <TiptapEditor
                    content={replyContent}
                    onChange={(html) => setReplyContent(html)}
                    placeholder="Tulis tanggapan resmi tim produk, rencana roadmap, atau apresiasi untuk pengusul ide..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Catatan Internal Admin (Hanya terlihat tim)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Perlu koordinasi dengan tim backend untuk schema baru..."
                  className="w-full px-3 py-2 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                />
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
                  Pengguna yang mengajukan dan memberi upvote dapat melihat status terbaru.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-[8px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Simpan & Publikasikan Tanggapan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Conversation History / Previous Replies */}
          <div className="p-5 sm:p-6 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />
              <span>Riwayat Tanggapan Tim ({item.replies?.length || 0})</span>
            </h3>

            {item.replies && item.replies.length > 0 ? (
              <div className="space-y-3.5">
                {item.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {reply.admin_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1738D1] text-white font-bold">
                          Tim Produk
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
                Belum ada tanggapan resmi yang dipublikasikan untuk ide ini.
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
