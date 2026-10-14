'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lightbulb,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  X,
  UploadCloud,
  Maximize2,
  MessageSquare,
  ChevronRight,
  Info,
  Check,
  Copy,
  Calendar,
  Layers,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { getStoredSession } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';


interface AttachmentItem {
  name: string;
  data_url: string;
  size: number;
}

export interface FeatureRequestReply {
  id: string;
  admin_name: string;
  admin_email?: string;
  message_html: string;
  created_at: string;
}

export interface FeatureRequestItem {
  id: string;
  request_code: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  category: string;
  problem_statement: string;
  expected_behavior?: string;
  attachments?: AttachmentItem[];
  votes_count: number;
  voter_ids: string[];
  status: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  replies?: FeatureRequestReply[];
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'cv_builder', label: 'CV Builder & Desain CV' },
  { value: 'job_tracker', label: 'Tracker Lamaran Kerja' },
  { value: 'cv_screener', label: 'Simulasi Screening & ATS' },
  { value: 'marketplace', label: 'Marketplace Loker & Event' },
  { value: 'mailer', label: 'Email Lamaran & Cover Letter' },
  { value: 'career_intelligence', label: 'Career Intelligence' },
  { value: 'account', label: 'Akun, Notifikasi & Pengaturan' },
  { value: 'other', label: 'Ide Fitur Baru Lainnya' },
];

const CATEGORY_LABELS: Record<string, string> = {
  cv_builder: 'CV Builder',
  job_tracker: 'Tracker Lamaran',
  cv_screener: 'Simulasi Screening',
  marketplace: 'Loker & Marketplace',
  mailer: 'Email & Cover Letter',
  career_intelligence: 'Career Intelligence',
  account: 'Akun & Notifikasi',
  other: 'Fitur Baru',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; desc: string }
> = {
  under_review: {
    label: 'Ditinjau Tim',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    desc: 'Sedang dipelajari oleh tim produk.',
  },
  planned: {
    label: 'Direncanakan',
    badgeClass:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    desc: 'Telah disetujui dan masuk daftar rencana rilis.',
  },
  in_progress: {
    label: 'Sedang Dibuat',
    badgeClass:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    desc: 'Tim teknis sedang mengembangkan fitur ini.',
  },
  completed: {
    label: 'Sudah Rilis',
    badgeClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    desc: 'Fitur telah selesai dibuat dan bisa digunakan!',
  },
  declined: {
    label: 'Belum Memungkinkan',
    badgeClass:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    desc: 'Belum sesuai dengan prioritas atau arah pengembangan saat ini.',
  },
};

// Silent WebP conversion
const convertFileToWebp = (file: File): Promise<AttachmentItem> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/webp') {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          data_url: reader.result as string,
          size: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
        URL.revokeObjectURL(objectUrl);

        const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
        const approximateSize = Math.round((webpDataUrl.length * 3) / 4);

        resolve({
          name: newName,
          data_url: webpDataUrl,
          size: approximateSize,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = objectUrl;
  });
};

export function FeatureRequestView() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // User session
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(
    null
  );

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cv_builder');
  const [problemStatement, setProblemStatement] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<FeatureRequestItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.info('Kode Saran Tersalin', `${code} telah disalin ke clipboard.`);
    }
  };

  // History State
  const [requests, setRequests] = useState<FeatureRequestItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Detail Modal & Zoom
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequestItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user session
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setCurrentUser({
        id: session.id || '',
        name: session.name || '',
        email: session.email || '',
      });
      setUserName(session.name || '');
      setUserEmail(session.email || '');
    }
    setIsSessionLoaded(true);
  }, []);

  // Fetch requests (strictly user's own private requests)
  const fetchRequests = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (currentUser?.id) params.set('user_id', currentUser.id);

      const res = await fetch(`/api/feature-requests?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching feature requests:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, [searchQuery, filterCategory, filterStatus, currentUser]);

  useEffect(() => {
    if (!isSessionLoaded) return;
    fetchRequests();
  }, [isSessionLoaded, fetchRequests]);

  const handleSelectRequest = async (item: FeatureRequestItem) => {
    setSelectedRequest(item);
    // If item has attachments but data_url is stripped, fetch full detail on-demand
    if (item.attachments && item.attachments.length > 0 && !item.attachments[0].data_url) {
      try {
        const res = await fetch(`/api/feature-requests?request_id=${encodeURIComponent(item.id)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedRequest(data.data);
        }
      } catch (err) {
        console.error('Failed to load full feature request attachments:', err);
      }
    }
  };

  // Handle files
  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const imageFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Hanya file gambar (PNG, JPG, JPEG, WEBP) yang didukung.');
      return;
    }

    if (attachments.length + imageFiles.length > 5) {
      toast.error('Maksimal 5 lampiran gambar diperbolehkan.');
      return;
    }

    setIsConvertingImage(true);
    try {
      const converted = await Promise.all(imageFiles.map(convertFileToWebp));
      setAttachments((prev) => [...prev, ...converted]);
      toast.success(`${converted.length} gambar berhasil ditambahkan.`);
    } catch (err) {
      console.error('Failed to process image:', err);
      toast.error('Gagal memproses gambar. Silakan coba file lain.');
    } finally {
      setIsConvertingImage(false);
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'form') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        handleFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab, attachments]);

  // Submit Feature Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Mohon masukkan judul saran fitur.');
      return;
    }

    if (!problemStatement.trim()) {
      toast.error('Mohon jelaskan manfaat atau kendala yang ingin diselesaikan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        problem_statement: problemStatement.trim(),
        expected_behavior: expectedBehavior.trim() || undefined,
        attachments,
        user_name: userName.trim() || 'Pengguna Employr',
        user_email: userEmail.trim() || 'pengguna@employr.id',
        user_id: currentUser?.id,
      };

      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirim saran fitur.');
      }

      setSubmitSuccess(data.data);
      toast.success('Saran fitur berhasil dikirim! Terima kasih atas kontribusimu.');

      // Reset form
      setTitle('');
      setCategory('cv_builder');
      setProblemStatement('');
      setExpectedBehavior('');
      setAttachments([]);

      // Refresh list
      fetchRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const filterCategoryOptions: SelectOption[] = [
    { value: 'all', label: 'Semua Kategori' },
    ...CATEGORY_OPTIONS,
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Top Header Section */}
      <PageHeader
        title="Saran & Usulan Fitur"
        subtitle="Sampaikan ide fitur baru untuk Employr atau pantau status pengembangan saranmu."
        icon={Lightbulb}
        badge="Wishlist Komunitas"
        stats={[
          {
            label: 'Total Usulan',
            value: requests.length,
            icon: Lightbulb,
            colorClass: 'text-amber-400',
            isPrimary: true,
          },
        ]}
        actions={
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as any);
              setSubmitSuccess(null);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList variant="pill" className="w-full sm:w-auto bg-black/20 border-white/10 p-0.5 justify-center">
                <TabsTrigger
                  size="xs"
                  value="form"
                  className="text-slate-300 hover:text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Formulir</span>
                </TabsTrigger>
                <TabsTrigger
                  size="xs"
                  value="history"
                  className="text-slate-300 hover:text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Riwayat</span>
                  {requests.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-caption bg-white/20 text-current font-mono">
                      {requests.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
        }
      />

      {/* Main Content Area */}
      <div className="w-full">
        {/* TAB 1: SUBMIT NEW FEATURE REQUEST */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-8">
              {submitSuccess ? (
                <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-5 shadow-xs">
                  {/* Success Checklist Animation */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Saran Fitur Berhasil Diajukan!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      Terima kasih atas idemu. Usulan fiturmu telah tercatat dan masuk ke antrean tim pengembang untuk ditinjau.
                    </p>
                  </div>

                  {/* Feature Request Code Box */}
                  <div className="max-w-md mx-auto p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-caption font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                        Kode Saran Fitur
                      </span>
                      <p className="font-mono font-bold text-sm text-cobalt-500 dark:text-blue-400">
                        {submitSuccess.request_code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(submitSuccess.request_code)}
                      className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Informational Card */}
                  <div className="max-w-md mx-auto text-caption text-slate-600 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-[10px] border border-blue-100 dark:border-blue-900/40 text-left flex items-start gap-2">
                    <Info className="w-4 h-4 text-cobalt-500 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>Saran fitur bersifat privat antara kamu dan tim pengembang. Kamu dapat memantau status telaah dan tanggapan tim di tab <strong>Riwayat</strong>.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitSuccess(null);
                        setActiveTab('history');
                      }}
                      className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-cobalt-500/20 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Lihat di Riwayat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Kirim Saran Lain
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Formulir Pengajuan Fitur
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Berikan rincian ide dengan jelas agar tim pengembang dapat memahaminya dengan
                      mudah.
                    </p>
                  </div>

                  {/* Judul Ide */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Judul Saran Fitur <span className="text-rose-700 dark:text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Notifikasi Pengingat Interview via WhatsApp"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Kategori Fitur (CustomSelect) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Area / Bagian Terkait <span className="text-rose-700 dark:text-rose-400">*</span>
                    </label>
                    <CustomSelect
                      value={category}
                      onChange={setCategory}
                      options={CATEGORY_OPTIONS}
                      placeholder="Pilih Kategori Fitur"
                    />
                  </div>

                  {/* Masalah yang dihadapi / Alasan penting */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kendala yang Dihadapi & Manfaat Fitur <span className="text-rose-700 dark:text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="Ceritakan kendala yang kamu rasakan saat ini, atau bagaimana fitur ini dapat mempermudahmu dalam mencari pekerjaan..."
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:border-transparent transition-all resize-y"
                      required
                    />
                  </div>

                  {/* Ekspektasi Alur Kerja (Opsional) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Ekspektasi Cara Kerja / Alur Fitur
                      </label>
                      <span className="text-caption text-slate-500 font-medium dark:text-slate-400">Opsional</span>
                    </div>
                    <textarea
                      rows={3}
                      value={expectedBehavior}
                      onChange={(e) => setExpectedBehavior(e.target.value)}
                      placeholder="Contoh: Saat mengubah status di tracker lamaran menjadi 'Interview', muncul tombol 'Sinkronkan ke Google Calendar' atau pilihan kirim pengingat..."
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:border-transparent transition-all resize-y"
                    />
                  </div>

                  {/* Lampiran Mockup / Screenshot */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Referensi Mockup / Gambar Sketsa
                      </label>
                      <span className="text-caption text-slate-500 font-medium dark:text-slate-400">
                        Opsional (Maks. 5 gambar, bisa paste Ctrl+V)
                      </span>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Pilih atau seret gambar referensi untuk dilampirkan"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-cobalt-500 dark:hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded-[10px] p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleFiles(e.target.files);
                        }}
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center">
                          {isConvertingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <UploadCloud className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-cobalt-500 dark:text-blue-400">
                            Pilih gambar
                          </span>{' '}
                          <span className="text-slate-500 dark:text-slate-400">
                            atau seret ke sini, atau tekan Ctrl+V untuk tempel
                          </span>
                        </div>
                        <p className="text-caption text-slate-500 dark:text-slate-400">
                          PNG, JPG, WEBP hingga 5MB per file
                        </p>
                      </div>
                    </div>

                    {/* Previews */}
                    {attachments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                        {attachments.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center"
                          >
                            <img
                              src={item.data_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setZoomedImage(item.data_url)}
                                className="p-1 rounded bg-white/80 hover:bg-white text-slate-900 transition-colors"
                                title="Perbesar"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                                title="Hapus"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info Pengaju */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Nama Pengaju
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Nama kamu"
                        className="w-full px-3 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Email Kontak
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="email@kamu.com"
                        className="w-full px-3 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || isConvertingImage}
                      className="px-6 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold transition-all shadow-md shadow-cobalt-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengirim Saran...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Saran Fitur</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Side Column: Tips & Process */}
            <div className="lg:col-span-4 space-y-6">
              {/* Panduan Saran */}
              <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                  <h4>Tips Menyampaikan Saran</h4>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center text-caption font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <p>
                      <strong className="text-slate-800 dark:text-slate-200">Fokus pada masalah:</strong> Ceritakan kendala yang memperlambat proses melamarmu.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center text-caption font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <p>
                      <strong className="text-slate-800 dark:text-slate-200">Beri contoh konkret:</strong> Skenario nyata mempermudah tim merancang solusinya.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center text-caption font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <p>
                      <strong className="text-slate-800 dark:text-slate-200">Pantau respons tim:</strong> Cek status pertimbangan ide kamu di tab Riwayat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Roadmap Penjelasan */}
              <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <h4>Tahapan Ide Fitur</h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  {Object.entries(STATUS_CONFIG).map(([key, item]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-[10px] text-caption font-bold border ${item.badgeClass}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-caption leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT SARAN FITUR (100% PRIVAT) */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan judul, kendala, atau kode saran..."
                  className="w-full pl-9 pr-4 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500"
                />
              </div>

              {/* Filter Kategori */}
              <div className="w-full md:w-56 shrink-0">
                <CustomSelect
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={filterCategoryOptions}
                  placeholder="Semua Kategori"
                />
              </div>

              {/* Filter Status */}
              <div className="w-full md:w-48 shrink-0">
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'under_review', label: 'Ditinjau' },
                    { value: 'planned', label: 'Direncanakan' },
                    { value: 'in_progress', label: 'Sedang Dibuat' },
                    { value: 'completed', label: 'Sudah Rilis' },
                    { value: 'declined', label: 'Belum Memungkinkan' },
                  ]}
                  placeholder="Semua Status"
                />
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchRequests}
                disabled={isLoadingList}
                className="p-2 rounded-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                title="Perbarui riwayat saran"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>

            {/* List of Requests */}
            {isLoadingList ? (
              <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-cobalt-500" />
                <p className="text-xs text-slate-500">Memuat riwayat saran fitur...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 mx-auto flex items-center justify-center dark:text-slate-400">
                  <Lightbulb className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Belum Ada Riwayat Saran Fitur
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Kamu belum pernah mengajukan saran fitur. Punya ide menarik untuk mempermudah pencarian kerjamu? Sampaikan lewat formulir saran.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('form')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-cobalt-500 text-white text-xs font-bold hover:bg-cobalt-600 transition-colors shadow-sm shadow-cobalt-500/20 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Ajukan Ide Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {requests.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.under_review;
                  const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Lihat rincian saran ${item.request_code}: ${item.title}`}
                      onClick={() => handleSelectRequest(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectRequest(item);
                        }
                      }}
                      className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 p-5 shadow-xs hover:border-cobalt-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between gap-4 cursor-pointer group text-left"
                    >
                      <div className="space-y-3">
                        {/* Top Metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cobalt-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-[10px] border border-blue-200 dark:border-blue-800">
                              {item.request_code}
                            </span>
                            <span className="text-caption text-slate-500 font-medium dark:text-slate-400">
                              {formattedDate}
                            </span>
                          </div>

                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-[10px] text-caption font-bold border ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Category */}
                        <div className="text-caption font-semibold text-slate-500 dark:text-slate-400">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cobalt-500 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h4>

                        {/* Problem Statement Preview */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.problem_statement}
                        </p>
                      </div>

                      {/* Bottom Action & Replies */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          {item.replies && item.replies.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{item.replies.length} Balasan Admin</span>
                            </span>
                          ) : (
                            <span className="text-caption text-slate-500 font-medium dark:text-slate-400">
                              Menunggu telaah
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-cobalt-500 dark:text-blue-400 group-hover:underline">
                          <span>Rincian</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right-Hand Slide-in Drawer for Feature Request Detail */}
      <Sheet
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
      >
        <SheetContent
          side="right"
          hideCloseButton
          className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden"
        >
          {selectedRequest && (
            <>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <SheetHeader className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cobalt-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-[10px] border border-blue-200 dark:border-blue-800">
                      {selectedRequest.request_code}
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-[10px] text-caption font-bold border ${
                        (STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.under_review).badgeClass
                      }`}
                    >
                      {(STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.under_review).label}
                    </span>
                  </div>
                  <SheetTitle className="text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {selectedRequest.title}
                  </SheetTitle>
                </SheetHeader>

                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 rounded-[10px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer dark:text-slate-400"
                  aria-label="Tutup Detail Saran"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            {/* Drawer Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
              {/* Category & Date Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-[10px]">
                <div>
                  Kategori:{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {CATEGORY_LABELS[selectedRequest.category] || selectedRequest.category}
                  </span>
                </div>
                <div>
                  Tanggal:{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(selectedRequest.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Problem / Reason */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Kendala & Alasan Fitur
                </h4>
                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.problem_statement}
                </div>
              </div>

              {/* Expected Behavior */}
              {selectedRequest.expected_behavior && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Ekspektasi Cara Kerja
                  </h4>
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.expected_behavior}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Referensi Mockup / Gambar ({selectedRequest.attachments.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedRequest.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        role="button"
                        tabIndex={0}
                        aria-label={`Perbesar ${att.name || 'referensi gambar'}`}
                        onClick={() => att.data_url && setZoomedImage(att.data_url)}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && att.data_url) {
                            e.preventDefault();
                            setZoomedImage(att.data_url);
                          }
                        }}
                        className="relative group rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                      >
                        {att.data_url ? (
                          <>
                            <img
                              src={att.data_url}
                              alt={att.name || 'Referensi Gambar'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Perbesar</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 text-center text-slate-400 bg-slate-100 dark:bg-slate-800 animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin text-cobalt-500" />
                            <span className="text-[10px] font-medium">Memuat lampiran...</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Replies (Rich Text) */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                    <span>Tanggapan dari Tim Pengembang</span>
                    {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-caption bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono">
                        {selectedRequest.replies.length}
                      </span>
                    )}
                  </h4>
                </div>

                {selectedRequest.replies && selectedRequest.replies.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRequest.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-4 rounded-[10px] bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-caption font-bold">
                              P
                            </div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-200">
                              {reply.admin_name || 'Tim Produk Employr'}
                            </span>
                          </div>
                          <span className="text-slate-500 text-caption font-medium dark:text-slate-400">
                            {new Date(reply.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: reply.message_html }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center space-y-1">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Belum ada tanggapan resmi</p>
                    <p className="text-caption">Tim pengembang sedang mempelajari usulan fitur ini. Tanggapan resmi akan otomatis tampil di sini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 rounded-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>

      {/* Zoom Modal */}
      <Dialog
        open={Boolean(zoomedImage)}
        onOpenChange={(open) => {
          if (!open) setZoomedImage(null);
        }}
      >
        <DialogContent size="xl" className="p-2 bg-black/90 border-slate-800 max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden">
          <DialogTitle className="sr-only">Pratinjau Gambar</DialogTitle>
          {zoomedImage && (
            <img
              src={zoomedImage}
              alt="Zoomed Reference"
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-[10px]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
