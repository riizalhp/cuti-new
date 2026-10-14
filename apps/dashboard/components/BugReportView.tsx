'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  UploadCloud,
  X,
  FileText,
  Monitor,
  Globe,
  Wifi,
  WifiOff,
  Send,
  Loader2,
  RefreshCw,
  Info,
  ShieldAlert,
  HelpCircle,
  Filter,
  CheckCircle,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { getStoredSession } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { CustomSelect } from '@/components/ui/CustomSelect';
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


interface SystemDiagnostics {
  browser: string;
  os: string;
  screenResolution: string;
  deviceType: string;
  isOnline: boolean;
  userAgent: string;
}

interface AttachmentItem {
  name: string;
  data_url: string;
  size: number;
}

export interface BugReportReply {
  id: string;
  admin_name: string;
  admin_email?: string;
  message_html: string;
  created_at: string;
}

export interface BugReportTicket {
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
  attachments?: AttachmentItem[];
  status: 'open' | 'in_review' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  replies?: BugReportReply[];
}

const PAGE_OPTIONS = [
  { value: '/beranda', label: 'Beranda (/beranda)' },
  { value: '/cv', label: 'CV Builder (/cv)' },
  { value: '/tracker', label: 'Tracker Lamaran (/tracker)' },
  { value: '/cv-screener', label: 'Simulasi Screening (/cv-screener)' },
  { value: '/mailer', label: 'Email & Cover Letter (/mailer)' },
  { value: '/career-intelligence', label: 'Career Intelligence (/career-intelligence)' },
  { value: '/profil', label: 'Profil Saya (/profil)' },
  { value: '/pengaturan', label: 'Pengaturan Akun (/pengaturan)' },
  { value: 'other', label: 'Halaman Lainnya (Ketik URL spesifik)' },
];

const CATEGORY_OPTIONS = [
  { id: 'ui', label: 'Tampilan & Desain' },
  { id: 'feature', label: 'Fitur & Tombol' },
  { id: 'auth', label: 'Akun & Profil' },
  { id: 'payment', label: 'Pembayaran & Paket' },
  { id: 'other', label: 'Kendala Umum' },
];

const SEVERITY_OPTIONS = [
  { id: 'low', label: 'Rendah' },
  { id: 'medium', label: 'Sedang' },
  { id: 'high', label: 'Tinggi' },
];

function detectBrowserAndOS(): { browser: string; os: string; deviceType: string } {
  if (typeof window === 'undefined') {
    return { browser: 'Unknown', os: 'Unknown', deviceType: 'Desktop' };
  }

  const ua = navigator.userAgent;
  let browser = 'Browser Lain';
  if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Trident')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari')) browser = 'Apple Safari';

  let os = 'OS Lain';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('like Mac')) os = 'iOS';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  return { browser, os, deviceType };
}

// Convert image silently to WebP format
function convertFileToWebp(file: File): Promise<{ data_url: string; size: number; name: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              data_url: src,
              size: file.size,
              name: file.name,
            });
            return;
          }
          ctx.drawImage(img, 0, 0);
          const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
          const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(',') + 1);
          const sizeInBytes = Math.floor((base64Length * 3) / 4);
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve({
            data_url: webpDataUrl,
            size: sizeInBytes,
            name: `${baseName || 'screenshot'}.webp`,
          });
        } catch {
          resolve({
            data_url: src,
            size: file.size,
            name: file.name,
          });
        }
      };
      img.onerror = () => {
        resolve({
          data_url: src,
          size: file.size,
          name: file.name,
        });
      };
      img.src = src;
    };
    reader.onerror = () => {
      resolve({
        data_url: '',
        size: file.size,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  });
}

export const BugReportView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // Streamlined Form State (No tedious category/severity cards)
  const [title, setTitle] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<string>('/beranda');
  const [customPageUrl, setCustomPageUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [includeSystemInfo, setIncludeSystemInfo] = useState<boolean>(true);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success Modal State
  const [createdTicket, setCreatedTicket] = useState<BugReportTicket | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Detail Modal State (Viewing ticket in History)
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<BugReportTicket | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // System Diagnostics State
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics>({
    browser: 'Mendeteksi...',
    os: 'Mendeteksi...',
    screenResolution: 'Mendeteksi...',
    deviceType: 'Desktop',
    isOnline: true,
    userAgent: '',
  });

  // History State
  const [tickets, setTickets] = useState<BugReportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Diagnostics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { browser, os, deviceType } = detectBrowserAndOS();
      const screenRes = `${window.screen.width} x ${window.screen.height} (${window.devicePixelRatio || 1}x)`;
      setDiagnostics({
        browser,
        os,
        screenResolution: screenRes,
        deviceType,
        isOnline: navigator.onLine,
        userAgent: navigator.userAgent,
      });

      const handleOnline = () => setDiagnostics((prev) => ({ ...prev, isOnline: true }));
      const handleOffline = () => setDiagnostics((prev) => ({ ...prev, isOnline: false }));

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch Tickets per user account
  const loadTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    try {
      const session = getStoredSession();
      const query = session?.id ? `?user_id=${encodeURIComponent(session.id)}` : '';
      const res = await fetch(`/api/bug-reports${query}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil riwayat tiket:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadTickets();
    }
  }, [activeTab, loadTickets]);

  const handleSelectTicket = async (ticket: BugReportTicket) => {
    setSelectedTicketDetail(ticket);
    // If ticket has attachments but data_url was stripped for performance, fetch full ticket on-demand
    if (ticket.attachments && ticket.attachments.length > 0 && !ticket.attachments[0].data_url) {
      try {
        const res = await fetch(`/api/bug-reports?ticket_id=${encodeURIComponent(ticket.id)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedTicketDetail(data.data);
        }
      } catch (err) {
        console.error('Failed to load full bug report attachments:', err);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (attachments.length >= 3) {
      toast.warning(
        'Batas Lampiran Tercapai',
        'Maksimal 3 tangkapan layar per laporan kendala.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        'Ukuran File Terlalu Besar',
        'Ukuran maksimal file tangkapan layar adalah 5MB.'
      );
      return;
    }

    // Convert silently to WebP
    const converted = await convertFileToWebp(file);
    if (converted.data_url) {
      setAttachments((prev) => [...prev, converted]);
    }
  };

  // Support paste screenshot directly from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (activeTab !== 'form') return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            await handleFileUpload(file);
            toast.info(
              'Screenshot Berhasil Ditempel',
              'Gambar dari clipboard telah ditambahkan ke lampiran.'
            );
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab, attachments, toast]);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.info('Kode Tiket Tersalin', `${code} telah disalin ke clipboard.`);
    }
  };

  const handleCopyHistoryTicket = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedTicketId(code);
      setTimeout(() => setCopiedTicketId(null), 2000);
      toast.info('Kode Tiket Tersalin', `${code} siap digunakan untuk pelacakan.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning('Judul Wajib Diisi', 'Tuliskan ringkasan kendala yang kamu temukan.');
      return;
    }

    if (!description.trim()) {
      toast.warning('Deskripsi Wajib Diisi', 'Ceritakan apa yang terjadi atau kendala yang kamu alami.');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = getStoredSession();
      const finalPageUrl = selectedPage === 'other' ? (customPageUrl.trim() || 'Halaman Lain') : selectedPage;

      const payload = {
        category: 'other',
        severity: 'medium',
        title: title.trim(),
        description: description.trim(),
        page_url: finalPageUrl,
        system_info: includeSystemInfo
          ? {
              browser: diagnostics.browser,
              os: diagnostics.os,
              screen_resolution: diagnostics.screenResolution,
              device_type: diagnostics.deviceType,
              online: diagnostics.isOnline,
              user_agent: diagnostics.userAgent,
            }
          : undefined,
        attachments,
        user_id: session?.id,
        user_email: session?.email,
        user_name: session?.name,
      };

      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirim laporan kendala.');
      }

      setCreatedTicket(data.ticket);
      toast.success(
        'Laporan Berhasil Terkirim',
        `Tiket ${data.ticket.ticket_code} telah dibuat. Tim kami segera meninjaunya.`
      );

      // Reset form
      setTitle('');
      setDescription('');
      setAttachments([]);
      setSelectedPage('/beranda');
      setCustomPageUrl('');
    } catch (error: any) {
      toast.error('Pengiriman Gagal', error.message || 'Terjadi gangguan koneksi. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'open') return t.status === 'open';
    if (historyFilter === 'in_progress') return t.status === 'in_review' || t.status === 'in_progress';
    if (historyFilter === 'resolved') return t.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Top Header Section */}
      <PageHeader
        title="Lapor Kendala &amp; Masalah"
        subtitle="Menemukan kendala di platform Employr? Sampaikan laporanmu agar segera diperiksa oleh tim kami."
        icon={ShieldAlert}
        badge="Bantuan &amp; Kendala"
        stats={[
          {
            label: 'Tiket Laporan',
            value: tickets.length,
            icon: ShieldAlert,
            colorClass: 'text-rose-300',
            isPrimary: true,
          },
        ]}
        actions={
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as any);
              setCreatedTicket(null);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList variant="pill" className="w-full sm:w-auto bg-black/20 border-white/10 p-0.5 justify-center">
              <TabsTrigger
                size="xs"
                value="form"
                className="text-slate-300 hover:text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Formulir</span>
              </TabsTrigger>
              <TabsTrigger
                size="xs"
                value="history"
                className="text-slate-300 hover:text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Riwayat</span>
                {tickets.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-caption bg-white/20 text-current font-mono">
                    {tickets.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* Main Wide Canvas */}
      <div className="w-full">
        {/* Tab 1: Form Pelaporan Ringkas & Cepat */}
        {activeTab === 'form' && (
          <div className="space-y-6">

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Form Laporan Langsung or In-Place Success Card (8 of 12) */}
              <div className="lg:col-span-8">
                {createdTicket ? (
                  <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-5 shadow-xs">
                    {/* Success Checklist Animation */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Laporan Kendala Berhasil Dikirim!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                        Terima kasih atas laporanmu. Kode tiket pelacakan telah dibuat secara otomatis untuk memantau status penanganan oleh tim pengembang.
                      </p>
                    </div>

                    {/* Ticket Code Box */}
                    <div className="max-w-md mx-auto p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="text-left space-y-0.5">
                        <span className="text-caption font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                          Nomor Tiket
                        </span>
                        <p className="font-mono font-bold text-sm text-cobalt-500 dark:text-blue-400">
                          {createdTicket.ticket_code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(createdTicket.ticket_code)}
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
                      <span>Tim pengembang kami akan menginvestigasi kendala ini. Kamu dapat memantau perkembangannya dan membaca balasan admin pada tab <strong>Riwayat</strong>.</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCreatedTicket(null);
                          setActiveTab('history');
                        }}
                        className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-cobalt-500/20 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Buka Riwayat Laporan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreatedTicket(null)}
                        className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Kirim Laporan Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1: Detail Kendala */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 sm:p-7 space-y-5 shadow-xs">
                      {/* Judul Kendala */}
                      <div className="space-y-1.5">
                        <label htmlFor="bug-title" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Apa kendala yang kamu temukan? <span className="text-rose-700 dark:text-rose-400">*</span>
                        </label>
                        <input
                          id="bug-title"
                          type="text"
                          maxLength={120}
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Contoh: Tombol simpan CV tidak merespon saat diklik"
                          className="w-full px-4 py-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                        />
                      </div>

                      {/* Lokasi Halaman: CustomSelect dari Design System */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Halaman Tempat Kendala Terjadi
                        </label>
                        <CustomSelect
                          value={selectedPage}
                          onChange={(val) => setSelectedPage(val)}
                          options={PAGE_OPTIONS}
                          placeholder="Pilih halaman tempat kendala..."
                        />

                        {/* Jika memilih Halaman Lainnya, munculkan input URL */}
                        {selectedPage === 'other' && (
                          <div className="pt-2 animate-in fade-in-50 duration-200">
                            <label htmlFor="custom-url-input" className="block text-caption font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Masukkan Link / URL Halaman:
                            </label>
                            <input
                              id="custom-url-input"
                              type="text"
                              value={customPageUrl}
                              onChange={(e) => setCustomPageUrl(e.target.value)}
                              placeholder="Ketik atau tempel link (misal: /latihan-soal atau https://app.employr.id/...)"
                              className="w-full px-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                            />
                          </div>
                        )}
                      </div>

                      {/* Deskripsi & Cerita Kendala */}
                      <div className="space-y-1.5">
                        <label htmlFor="bug-description" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Ceritakan Kendalanya <span className="text-rose-700 dark:text-rose-400">*</span>
                        </label>
                        <textarea
                          id="bug-description"
                          rows={5}
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Jelaskan apa yang terjadi, apa yang kamu klik, atau pesan error apa yang muncul..."
                          className="w-full px-4 py-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed transition"
                        />
                      </div>
                    </div>

                    {/* Card 2: Tangkapan Layar / Screenshot (Auto WebP) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 sm:p-7 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            Tangkapan Layar / Screenshot (Opsional)
                          </h2>
                          <p className="text-caption text-slate-500 dark:text-slate-400">
                            Lampirkan gambar tampilan yang error jika ada.
                          </p>
                        </div>
                        <span className="text-caption text-slate-500 dark:text-slate-400">Maks. 3 file</span>
                      </div>

                      {/* Upload Dropzone */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Pilih atau seret tangkapan layar untuk dilampirkan"
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cobalt-500 dark:hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded-[10px] p-5 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-cobalt-500 dark:text-blue-400 group-hover:scale-110 transition">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            Klik untuk memilih gambar atau seret file ke sini
                          </div>
                          <div className="text-caption text-slate-500 dark:text-slate-400">
                            Atau tekan <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200">Ctrl + V</span> untuk tempel langsung.
                          </div>
                        </div>
                      </div>

                      {/* Attachment Preview Grid */}
                      {attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {attachments.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-2.5"
                            >
                              <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                                <img
                                  src={item.data_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 pr-6">
                                <p className="text-caption font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {item.name}
                                </p>
                                <p className="text-caption text-slate-500 dark:text-slate-400">
                                  {(item.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400 transition cursor-pointer"
                                title="Hapus gambar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Action Bar */}
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      <p className="text-caption text-slate-500 dark:text-slate-400">
                        Laporanmu akan langsung ditinjau oleh tim kami untuk segera diperbaiki.
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mengirim Laporan...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Kirim Laporan Kendala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Sticky Diagnostics & Guidelines (4 of 12) */}
              <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                {/* Diagnostics Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                      <span>Info Sistem Kamu</span>
                    </h3>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeSystemInfo}
                        onChange={(e) => setIncludeSystemInfo(e.target.checked)}
                        className="rounded-[4px] border-slate-300 dark:border-slate-600 text-cobalt-500 focus:ring-cobalt-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-caption font-semibold text-slate-600 dark:text-slate-400">
                        Sertakan
                      </span>
                    </label>
                  </div>

                  <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                    Data ini otomatis diambil dari browsermu untuk membantu tim pengembang mereproduksi kendala dengan cepat.
                  </p>

                  {includeSystemInfo ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 text-caption">Browser</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {diagnostics.browser}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 text-caption">Sistem Operasi</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {diagnostics.os}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 text-caption">Resolusi Layar</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {diagnostics.screenResolution}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 text-caption">Status Jaringan</span>
                        <span className="font-bold inline-flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          {diagnostics.isOnline ? (
                            <>
                              <Wifi className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                              <span>Offline</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-[10px] bg-slate-100 dark:bg-slate-800/40 text-caption text-slate-600 italic">
                      Spesifikasi sistem tidak akan disertakan pada laporan ini.
                    </div>
                  )}
                </div>

                {/* Helpful Guidelines Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Tips Pelaporan Efektif</span>
                  </h3>

                  <ul className="space-y-2 text-caption text-slate-600 dark:text-slate-400 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 shrink-0 mt-1.5" />
                      <span><strong>Alur kendala:</strong> Ceritakan kronologi sebelum error muncul.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 shrink-0 mt-1.5" />
                      <span><strong>Tangkapan layar:</strong> Lampirkan bukti visual yang bermasalah.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 shrink-0 mt-1.5" />
                      <span><strong>Riwayat tiket:</strong> Pantau tanggapan admin secara berkala.</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* Tab 2: Riwayat Tiket (Per Akun dengan Detail Laporan & Balasan Admin) */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[10px] bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Status & Tindak Lanjut</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 font-sans">
                  Riwayat Laporan Kendala Akun Kamu
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Klik pada tiket untuk melihat detail lengkap dan balasan dari tim admin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold transition inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buat Laporan Baru</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
                  Filter Status:
                </span>
                <Tabs
                  value={historyFilter}
                  onValueChange={(val) => setHistoryFilter(val as any)}
                >
                  <TabsList variant="pill">
                    <TabsTrigger size="xs" value="all">
                      Semua ({tickets.length})
                    </TabsTrigger>
                    <TabsTrigger size="xs" value="open">
                      Menunggu
                    </TabsTrigger>
                    <TabsTrigger size="xs" value="in_progress">
                      Diproses
                    </TabsTrigger>
                    <TabsTrigger size="xs" value="resolved">
                      Selesai
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <button
                type="button"
                onClick={loadTickets}
                disabled={isLoadingTickets}
                className="p-1.5 rounded-[8px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                title="Perbarui daftar tiket"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>

            {/* Ticket List Area */}
            {isLoadingTickets ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-12 text-center space-y-3 shadow-xs">
                <Loader2 className="w-6 h-6 text-cobalt-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Memuat daftar riwayat laporan kendala...
                </p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-12 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 mx-auto dark:text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {historyFilter === 'all'
                    ? 'Belum Ada Laporan Kendala'
                    : 'Tidak Ada Tiket untuk Filter Ini'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {historyFilter === 'all'
                    ? 'Seluruh sistem berjalan lancar untuk akunmu. Jika menemukan kendala di kemudian hari, kamu dapat mengirimkannya kapan saja.'
                    : 'Coba ubah opsi filter di atas untuk melihat seluruh riwayat tiket yang tersedia.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredTickets.map((ticket) => {
                  const formattedDate = new Date(ticket.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Menunggu Review
                    </span>
                  );

                  if (ticket.status === 'in_review' || ticket.status === 'in_progress') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Sedang Diperiksa
                      </span>
                    );
                  } else if (ticket.status === 'resolved') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Selesai Diperbaiki
                      </span>
                    );
                  }

                  const hasReplies = ticket.replies && ticket.replies.length > 0;

                  return (
                    <div
                      key={ticket.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Lihat detail tiket ${ticket.ticket_code}: ${ticket.title}`}
                      onClick={() => handleSelectTicket(ticket)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectTicket(ticket);
                        }
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded-[10px] p-5 space-y-3.5 shadow-xs transition hover:border-cobalt-500 dark:hover:border-blue-500 cursor-pointer flex flex-col justify-between group text-left"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-cobalt-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-[10px] border border-blue-200 dark:border-blue-800">
                              {ticket.ticket_code}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyHistoryTicket(ticket.ticket_code);
                              }}
                              className="p-1 rounded-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer dark:text-slate-400"
                              title="Salin nomor tiket"
                            >
                              {copiedTicketId === ticket.ticket_code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-caption text-slate-500 font-medium dark:text-slate-400">
                              {formattedDate}
                            </span>
                          </div>

                          <div>{statusBadge}</div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cobalt-500 dark:group-hover:text-blue-400 transition">
                            {ticket.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadata Footer */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2.5">
                            {ticket.page_url && (
                              <div className="flex items-center gap-1 font-mono text-caption">
                                <Globe className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                <span className="truncate max-w-[140px]">{ticket.page_url}</span>
                              </div>
                            )}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-cobalt-500 dark:text-blue-400 font-semibold">
                                <FileText className="w-3 h-3" />
                                <span>{ticket.attachments.length} Screenshot</span>
                              </div>
                            )}
                          </div>

                          {hasReplies ? (
                            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{ticket.replies?.length} Balasan Admin</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">Belum ada balasan</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right-Hand Slide-in Drawer for Detail Ticket */}
      <Sheet
        open={Boolean(selectedTicketDetail)}
        onOpenChange={(open) => {
          if (!open) setSelectedTicketDetail(null);
        }}
      >
        <SheetContent
          side="right"
          hideCloseButton
          className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden"
        >
          {selectedTicketDetail && (
            <>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <SheetHeader className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cobalt-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-[10px] border border-blue-200 dark:border-blue-800">
                      {selectedTicketDetail.ticket_code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(selectedTicketDetail.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <SheetTitle className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {selectedTicketDetail.title}
                  </SheetTitle>
                </SheetHeader>

                <button
                  type="button"
                  onClick={() => setSelectedTicketDetail(null)}
                  className="p-1.5 rounded-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer dark:text-slate-400"
                  aria-label="Tutup Detail Laporan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
                {/* Ticket Badges & Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Status: {selectedTicketDetail.status === 'resolved' ? 'Selesai' : selectedTicketDetail.status === 'in_progress' ? 'Sedang Diperiksa' : 'Menunggu Review'}
                  </span>
                </div>

                {/* Page URL */}
                {selectedTicketDetail.page_url && (
                  <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Halaman Terkait:</span>
                    <span className="font-mono font-bold text-cobalt-500 dark:text-blue-400">
                      {selectedTicketDetail.page_url}
                    </span>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Deskripsi Kendala
                  </h4>
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedTicketDetail.description}
                  </div>
                </div>

                {/* Screenshots Gallery */}
                {selectedTicketDetail.attachments && selectedTicketDetail.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Tangkapan Layar ({selectedTicketDetail.attachments.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {selectedTicketDetail.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          aria-label={`Perbesar ${att.name || 'tangkapan layar'}`}
                          onClick={() => att.data_url && setZoomedImage(att.data_url)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && att.data_url) {
                              e.preventDefault();
                              setZoomedImage(att.data_url);
                            }
                          }}
                          className="group relative rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-800 h-28 bg-slate-100 dark:bg-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        >
                          {att.data_url ? (
                            <>
                              <img
                                src={att.data_url}
                                alt={att.name || 'Tangkapan Layar'}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                <Maximize2 className="w-5 h-5" />
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

                {/* System Info */}
                {selectedTicketDetail.system_info && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Info Perangkat
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-caption p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Browser: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicketDetail.system_info.browser || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">OS: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicketDetail.system_info.os || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Resolusi: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicketDetail.system_info.screen_resolution || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Koneksi: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTicketDetail.system_info.online ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Replies Section */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                    <span>Balasan dari Tim Pengembang / Admin</span>
                  </h4>

                  {selectedTicketDetail.replies && selectedTicketDetail.replies.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTicketDetail.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-4 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2"
                        >
                          <div className="flex items-center justify-between text-caption">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-cobalt-500 dark:text-blue-400">
                                {reply.admin_name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-caption bg-cobalt-500 text-white font-bold">
                                Tim Bantuan
                              </span>
                            </div>
                            <span className="text-slate-500 dark:text-slate-400">
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
                            className="prose prose-xs dark:prose-invert max-w-none text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: reply.message_html }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Belum ada balasan dari tim.
                      </p>
                      <p className="text-caption text-slate-500 dark:text-slate-400">
                        Laporanmu telah masuk antrean investigasi tim teknis kami. Kamu akan menerima pembaruan di sini begitu ditangani.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTicketDetail(null)}
                  className="px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Image Zoom Modal */}
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
              alt="Screenshot Zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-[10px]"
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};
