'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Mail,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Layers,
  FileSpreadsheet,
  FileText,
  Upload,
  RefreshCw,
  X,
  Play,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Eye,
  EyeOff,
  Bot,
  KeyRound,
  HelpCircle,
  Copy,
  FileCheck2,
  Paperclip,
} from 'lucide-react';
import Link from 'next/link';
import { CoverLetterView, COVER_LETTER_PRESETS } from './CoverLetterView';
import { mailerApi, userApi, coverLetterApi, cvApi } from '@/lib/api';

export type ProviderType = 'gmail' | 'outlook' | 'yahoo' | 'custom';

export const PROVIDER_PRESETS: Record<
  ProviderType,
  {
    name: string;
    subname: string;
    host: string;
    port: number;
    secure: boolean;
    hint: string;
  }
> = {
  gmail: {
    name: 'Gmail',
    subname: 'Rekomendasi (Paling Populer)',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    hint: 'Gunakan Sandi Aplikasi (App Password) 16 huruf dari akun Google kamu.',
  },
  outlook: {
    name: 'Outlook / Hotmail',
    subname: 'Microsoft',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    hint: 'Gunakan kata sandi akun atau app password dari akun Microsoft kamu.',
  },
  yahoo: {
    name: 'Yahoo Mail',
    subname: 'Yahoo Indonesia / Global',
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    hint: 'Gunakan kata sandi aplikasi dari halaman keamanan Yahoo kamu.',
  },
  custom: {
    name: 'Kustom / Lainnya',
    subname: 'Pengaturan Manual',
    host: '',
    port: 587,
    secure: false,
    hint: 'Masukkan konfigurasi Host dan Port SMTP secara manual.',
  },
};

export interface MailerViewProps {
  initialTab?: 'cover-letter' | 'single' | 'batch' | 'smtp';
}

export const MailerView: React.FC<MailerViewProps> = ({ initialTab = 'cover-letter' }) => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'cover-letter' | 'single' | 'batch' | 'smtp'>(initialTab);
  const [savedCoverLetters, setSavedCoverLetters] = useState<any[]>([]);

  // SMTP Accounts state
  const [smtpAccounts, setSmtpAccounts] = useState<any[]>([]);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(true);

  // Single Send State
  const [isSingleDrawerOpen, setIsSingleDrawerOpen] = useState(false);
  const [userCvs, setUserCvs] = useState<any[]>([]);
  const [singleForm, setSingleForm] = useState({
    to: '',
    to_name: '',
    company: '',
    position: '',
    body_content: '',
    custom_subject: '',
    design: 'standar',
    smtp_id: '',
    attachment_cv_id: '',
  });
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success: boolean; message: string } | null>(null);

  // Add SMTP Drawer State
  const [isSmtpDrawerOpen, setIsSmtpDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('gmail');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_name: '',
    from_email: '',
    daily_limit: 500,
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Batch Sending State
  const [batchTitle, setBatchTitle] = useState('Batch Lamaran');
  const [batchDelay, setBatchDelay] = useState(2);
  const [batchDesign, setBatchDesign] = useState('standar');
  const [csvText, setCsvText] = useState('');
  const [parsedCsvItems, setParsedCsvItems] = useState<any[]>([]);
  const [isStartingBatch, setIsStartingBatch] = useState(false);
  const [batchJobs, setBatchJobs] = useState<any[]>([]);
  const [activeBatchResult, setActiveBatchResult] = useState<any>(null);

  const [userName, setUserName] = useState('');

  // Load user data & sync query param tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const paramTab = search.get('tab');
      if (paramTab && ['single', 'cover-letter', 'batch', 'smtp'].includes(paramTab)) {
        setActiveTab(paramTab as any);
      }
      const paramCvId = search.get('cvId');
      if (paramCvId) {
        setSingleForm((prev) => ({ ...prev, attachment_cv_id: paramCvId }));
      }
    }

    loadSmtpAccounts();
    loadBatchJobs();
    loadSavedCoverLetters();

    // Muat CV pengguna untuk lampiran otomatis PDF ATS
    cvApi.getAll().then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) {
        setUserCvs(data);
        setSingleForm((prev) => ({
          ...prev,
          attachment_cv_id: prev.attachment_cv_id || data[0].id,
        }));
      }
    }).catch(() => {});

    // Auto prefill sender name from profile
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        const name = profile.fullName || profile.name || '';
        setUserName(name);
        setSmtpForm((prev) => ({
          ...prev,
          from_name: name,
          from_email: profile.email || '',
        }));
      }
    }).catch(() => {});
  }, []);

  const loadSavedCoverLetters = async () => {
    try {
      const data = await coverLetterApi.getAll();
      if (Array.isArray(data)) {
        setSavedCoverLetters(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUseCoverLetter = (data: {
    company: string;
    position: string;
    recruiterName?: string;
    content: string;
    cvId?: string;
  }) => {
    setSingleForm((prev) => ({
      ...prev,
      company: data.company || prev.company,
      position: data.position || prev.position,
      to_name: data.recruiterName || prev.to_name,
      body_content: data.content,
      attachment_cv_id: data.cvId || prev.attachment_cv_id,
      custom_subject:
        data.position && data.company
          ? `Lamaran Pekerjaan - ${data.position} di ${data.company} - ${userName || 'Kandidat'}`
          : prev.custom_subject || `Lamaran Pekerjaan - ${data.position || 'Kandidat'}`,
    }));
    setActiveTab('single');
    setIsSingleDrawerOpen(true);
    toast.success(
      'Surat Lamaran Dimuat',
      'Draf surat lamaran dan lampiran CV telah diisikan ke formulir pengiriman email.'
    );
  };

  const loadSmtpAccounts = async () => {
    setIsLoadingSmtp(true);
    try {
      const data = await mailerApi.getSmtpAccounts();
      setSmtpAccounts(data);
      if (data.length > 0 && !singleForm.smtp_id) {
        setSingleForm((prev) => ({ ...prev, smtp_id: data[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSmtp(false);
    }
  };

  const loadBatchJobs = async () => {
    try {
      const data = await mailerApi.getBatchJobs();
      setBatchJobs(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Select Provider Preset
  const handleSelectProvider = (provider: ProviderType) => {
    setSelectedProvider(provider);
    const preset = PROVIDER_PRESETS[provider];
    setSmtpForm((prev) => ({
      ...prev,
      host: preset.host || prev.host,
      port: preset.port || prev.port,
      secure: preset.secure,
    }));
    if (provider === 'custom') {
      setShowAdvancedSettings(true);
    }
  };

  // Handle SMTP Test Connection
  const handleTestSmtp = async () => {
    const cleanPassword = smtpForm.password.replace(/\s+/g, '').trim();
    if (!smtpForm.username || !cleanPassword) {
      setSmtpFeedback({
        success: false,
        message: 'Alamat email dan Sandi Aplikasi (16 karakter) wajib diisi.',
      });
      return;
    }
    setIsTestingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await mailerApi.testSmtpConnection({
        ...smtpForm,
        password: cleanPassword,
      });
      if (res.success) {
        setSmtpFeedback({
          success: true,
          message: 'Koneksi Berhasil! Akun email kamu siap digunakan oleh bot pengirim.',
        });
      } else {
        setSmtpFeedback({ success: false, message: res.message || 'Koneksi gagal.' });
      }
    } catch (err: any) {
      setSmtpFeedback({ success: false, message: err.message || 'Gagal menguji koneksi.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Handle Save SMTP
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = smtpForm.password.replace(/\s+/g, '').trim();
    if (!smtpForm.username || !cleanPassword) {
      setSmtpFeedback({
        success: false,
        message: 'Alamat email dan Sandi Aplikasi (16 karakter) wajib diisi.',
      });
      return;
    }

    setIsSavingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await mailerApi.createSmtpAccount({
        ...smtpForm,
        password: cleanPassword,
      });
      if (res.success) {
        setSmtpFeedback({
          success: true,
          message: 'Bot Pengirim berhasil diaktifkan dan siap mengirim lamaran!',
        });
        loadSmtpAccounts();
        setTimeout(() => {
          setIsSmtpDrawerOpen(false);
          setSmtpFeedback(null);
        }, 1200);
      } else {
        setSmtpFeedback({ success: false, message: res.message || 'Gagal mengaktifkan bot pengirim.' });
      }
    } catch (err: any) {
      setSmtpFeedback({ success: false, message: err.message || 'Gagal mengaktifkan bot pengirim.' });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  // Handle Delete SMTP
  const handleDeleteSmtp = async (id: string) => {
    const isConfirmed = await confirm({
      type: 'danger',
      title: 'Hapus Akun SMTP?',
      description: 'Akun SMTP ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus Akun',
      cancelText: 'Batal',
    });
    if (!isConfirmed) return;
    try {
      await mailerApi.deleteSmtpAccount(id);
      loadSmtpAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Single Send
  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.to || !singleForm.company || !singleForm.position) {
      setSingleResult({ success: false, message: 'Harap lengkapi email, perusahaan, dan posisi.' });
      return;
    }

    setIsSendingSingle(true);
    setSingleResult(null);

    try {
      const res = await mailerApi.sendSingle(singleForm);
      if (res.success) {
        setSingleResult({ success: true, message: res.message || 'Email lamaran berhasil dikirim!' });
        loadSmtpAccounts(); // Refresh sent_today
        // Reset form
        setSingleForm((prev) => ({
          ...prev,
          to: '',
          to_name: '',
          company: '',
          position: '',
          body_content: '',
        }));
      } else {
        setSingleResult({ success: false, message: res.message || 'Pengiriman gagal.' });
      }
    } catch (err: any) {
      setSingleResult({ success: false, message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSendingSingle(false);
    }
  };

  // Parse CSV File or Text
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (rawText: string) => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setParsedCsvItems([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIdx = headers.findIndex((h) => h.includes('email') || h === 'to');
    const companyIdx = headers.findIndex((h) => h.includes('company') || h.includes('perusahaan'));
    const positionIdx = headers.findIndex((h) => h.includes('position') || h.includes('posisi') || h.includes('jabatan'));

    const items: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const email = emailIdx !== -1 ? cols[emailIdx] : cols[0];
      const company = companyIdx !== -1 ? cols[companyIdx] : cols[1] || 'Perusahaan';
      const position = positionIdx !== -1 ? cols[positionIdx] : cols[2] || 'Posisi';

      if (email && email.includes('@')) {
        items.push({ email, company, position });
      }
    }

    setParsedCsvItems(items);
  };

  // Handle Start Batch
  const handleStartBatch = async () => {
    if (parsedCsvItems.length === 0) {
      toast.warning('Daftar Belum Valid', 'Daftar CSV belum memiliki penerima yang valid.');
      return;
    }
    if (smtpAccounts.length === 0) {
      toast.warning('Akun SMTP Diperlukan', 'Tambahkan akun SMTP pengirim terlebih dahulu di tab Pengaturan SMTP.');
      return;
    }

    setIsStartingBatch(true);
    setActiveBatchResult(null);

    try {
      const res = await mailerApi.startBatch({
        title: batchTitle,
        items: parsedCsvItems,
        delay_sec: Number(batchDelay),
        design: batchDesign,
      });

      if (res.success) {
        toast.success('Batch Dimulai', 'Proses pengiriman email batch telah berjalan.');
        setActiveBatchResult(res.data);
        loadBatchJobs();
        loadSmtpAccounts();
      } else {
        toast.error('Gagal Memulai Batch', res.message || 'Gagal memulai batch pengiriman.');
      }
    } catch (err: any) {
      toast.error('Kesalahan Sistem', err.message || 'Terjadi kesalahan sistem saat memproses batch.');
    } finally {
      setIsStartingBatch(false);
    }
  };

  const selectedSingleCv = userCvs.find((c) => c.id === singleForm.attachment_cv_id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Email & Surat Lamaran"
        subtitle="Siapkan draf surat lamaran dengan template instan atau susun otomatis. Kamu bisa menyalin teks untuk kirim manual, atau kirim otomatis ke HRD via bot pengirim yang terhubung ke Tracker."
        icon={Mail}
        badge="Email & Mailer"
        stats={[
          {
            label: 'Mode Aktif',
            value:
              activeTab === 'cover-letter'
                ? '1. Siapkan Draf'
                : activeTab === 'single'
                ? '2. Kirim Cepat'
                : activeTab === 'batch'
                ? '3. Kirim Massal'
                : '4. Bot Pengirim',
          },
          {
            label: 'Bot Pengirim',
            value: smtpAccounts.length > 0 ? `${smtpAccounts.length} Akun Aktif` : 'Belum Ada Akun',
            colorClass: smtpAccounts.length > 0 ? 'text-emerald-400' : 'text-amber-400',
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => {
              setActiveTab('single');
              setIsSingleDrawerOpen(true);
            }}
            className="px-3.5 py-2 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs shadow-md shadow-orange-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Form Pengiriman Email</span>
          </button>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('cover-letter')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'cover-letter'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          1. Siapkan Surat Lamaran
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'single'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          2. Kirim Email Cepat
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'batch'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          3. Kirim Massal (CSV)
        </button>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'smtp'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          4. Bot Pengirim ({smtpAccounts.length})
        </button>
      </div>

      {/* ================= TAB 1: SINGLE SEND ================= */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          {/* Bot Notice Card */}
          {smtpAccounts.length === 0 && !isLoadingSmtp && (
            <div className="p-5 rounded-[10px] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/50 border border-blue-200/80 dark:border-slate-700 flex items-start gap-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Bot Pengirim Belum Aktif
                  </h4>
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    1 Menit Pengaturan
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Agar bot bisa mengirim email lamaran secara otomatis langsung dari akun Gmail kamu (100% gratis & aman), hubungkan akun kamu terlebih dahulu.
                </p>
                <button
                  onClick={() => {
                    setIsSmtpDrawerOpen(true);
                    setSmtpFeedback(null);
                  }}
                  className="mt-3.5 px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aktifkan Bot Pengirim Sekarang
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 flex items-center justify-center mb-4">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Kirim Lamaran Personal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Kirim email lamaran ke satu HR/perusahaan secara instan dengan template email profesional dan variasi subjek cerdas.
                </p>
              </div>
              <button
                onClick={() => setIsSingleDrawerOpen(true)}
                disabled={smtpAccounts.length === 0}
                className="mt-6 w-full py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#1738D1]/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Buka Form Pengiriman
              </button>
            </div>

            <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Otomatis Masuk Kanban Tracker
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Setiap email yang berhasil terkirim langsung dicatat ke status <strong>Terkirim</strong> di Tracker Lamaran Anda.
                </p>
              </div>
              <Link
                href="/tracker"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                Buka Kanban Tracker
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Siapkan Draf Surat Lamaran
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Belum punya kata pengantar? Gunakan template cepat atau susun otomatis di tab pertama lalu kirimkan langsung.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('cover-letter')}
                className="mt-6 w-full py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Buka Tab Surat Lamaran
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: COVER LETTER ================= */}
      {activeTab === 'cover-letter' && (
        <div className="space-y-6">
          <CoverLetterView
            hideHeader
            onUseInMailer={handleUseCoverLetter}
          />
        </div>
      )}

      {/* ================= TAB 2: BATCH CSV SEND ================= */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#1738D1]" />
                Upload CSV Daftar Lowongan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Format kolom CSV yang didukung: <code>email, company, position</code> atau <code>email, perusahaan, posisi</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Batch
                </label>
                <input
                  type="text"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                  placeholder="Batch IT Support Jakarta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jeda Antar Email (Detik)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={batchDelay}
                  onChange={(e) => setBatchDelay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilihan Template HTML
                </label>
                <select
                  value={batchDesign}
                  onChange={(e) => setBatchDesign(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                >
                  <option value="standar">Standar / Polos (Natural seperti Gmail - Direkomendasikan)</option>
                  <option value="minimal">Minimalist (Clean & Spacing Lega)</option>
                  <option value="klasik">Klasik (Card Navy & Elegan)</option>
                  <option value="serif">Serif (Editorial Formal)</option>
                  <option value="dark">Dark Theme (Modern Slate)</option>
                </select>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[10px] p-6 text-center bg-slate-50/50 dark:bg-slate-800/20">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih file CSV dari komputer Anda
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFileUpload}
                className="mt-3 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-xs file:font-bold file:bg-[#1738D1] file:text-white hover:file:bg-[#132EA8] cursor-pointer"
              />
            </div>

            {/* Parsed List Preview */}
            {parsedCsvItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Daftar Penerima Terbaca ({parsedCsvItems.length} email)
                  </span>
                  <button
                    onClick={handleStartBatch}
                    disabled={isStartingBatch || smtpAccounts.length === 0}
                    className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isStartingBatch ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Memproses Pengiriman...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Mulai Kirim Batch ({parsedCsvItems.length})
                      </>
                    )}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-[10px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <tr>
                        <th className="p-2.5">Email Tujuan</th>
                        <th className="p-2.5">Perusahaan</th>
                        <th className="p-2.5">Posisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedCsvItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{item.email}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{item.company}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{item.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Active Batch Result */}
            {activeBatchResult && (
              <div className="p-4 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Batch Selesai: {activeBatchResult.sent_count} Berhasil, {activeBatchResult.failed_count} Gagal.
                </div>
              </div>
            )}
          </div>

          {/* Riwayat Batch Terakhir */}
          {batchJobs.length > 0 && (
            <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Riwayat Pengiriman Batch Terakhir
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
                {batchJobs.map((job) => (
                  <div key={job.id} className="p-4 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{job.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(job.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {job.sent_count} / {job.total_emails} terkirim
                      </span>
                      <span className={`px-2.5 py-1 rounded-[10px] text-[10px] font-bold ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: BOT PENGIRIM ================= */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#1738D1]" />
                Bot Pengirim Email Pribadi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kirim lamaran kerja otomatis langsung dari akun email kamu (Gmail/Outlook) — 100% gratis, aman, dan langsung sampai ke inbox HRD.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSmtpDrawerOpen(true);
                setSmtpFeedback(null);
              }}
              className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4" />
              Hubungkan Akun Baru
            </button>
          </div>

          {smtpAccounts.length === 0 && !isLoadingSmtp ? (
            <div className="p-8 sm:p-10 text-center rounded-[10px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Belum ada bot pengirim yang terhubung
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md mx-auto">
                Sambungkan akun Gmail kamu dalam 3 langkah mudah. Setelah aktif, bot bisa mengirimkan email lamaran kerja personal maupun massal secara otomatis.
              </p>
              <button
                onClick={() => {
                  setIsSmtpDrawerOpen(true);
                  setSmtpFeedback(null);
                }}
                className="mt-4 px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-[#1738D1]/20 transition active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Hubungkan Akun Gmail Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smtpAccounts.map((acc) => {
                const isGmail = acc.host?.includes('gmail');
                const providerLabel = isGmail
                  ? 'Google Gmail'
                  : acc.host?.includes('office') || acc.host?.includes('outlook')
                  ? 'Microsoft Outlook'
                  : acc.host?.includes('yahoo')
                  ? 'Yahoo Mail'
                  : 'Kustom SMTP';

                return (
                  <div
                    key={acc.id}
                    className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-900 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#1738D1]" />
                          {acc.from_name}
                        </span>
                        <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Bot Siap Kirim
                        </span>
                      </div>
                      
                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="text-[11px] text-slate-500 mb-0.5">Email Pengirim:</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {acc.username}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Penyedia:</strong> {providerLabel}
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Batas Harian:</strong> {acc.sent_today} / {acc.daily_limit} email terkirim hari ini (Batas gratis Google)
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Otomatis failover jika kuota habis
                      </span>
                      <button
                        onClick={() => handleDeleteSmtp(acc.id)}
                        className="px-3 py-1.5 rounded-[10px] text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= RIGHT-HAND SLIDE-IN DRAWER: SINGLE SEND ================= */}
      {isSingleDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1738D1]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Kirim Email Lamaran Cepat
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsSingleDrawerOpen(false);
                  setSingleResult(null);
                }}
                className="p-1 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form id="single-send-form" onSubmit={handleSendSingle} className="flex-1 overflow-y-auto p-5 space-y-4">
              {singleResult && (
                <div
                  className={`p-3.5 rounded-[10px] text-xs font-bold border flex items-center gap-2 ${
                    singleResult.success
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {singleResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {singleResult.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email HR / Perusahaan *
                </label>
                <input
                  type="email"
                  required
                  value={singleForm.to}
                  onChange={(e) => setSingleForm({ ...singleForm, to: e.target.value })}
                  placeholder="hrd@perusahaan.com"
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleForm.company}
                    onChange={(e) => setSingleForm({ ...singleForm, company: e.target.value })}
                    placeholder="PT Maju Mundur"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Posisi Dilamar *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleForm.position}
                    onChange={(e) => setSingleForm({ ...singleForm, position: e.target.value })}
                    placeholder="Frontend Developer"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                  />
                </div>
              </div>

              {/* Lampiran CV Pelamar (Auto-Attach PDF ATS) */}
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400" />
                    <span>Lampiran CV Pelamar (Auto-Attach PDF ATS)</span>
                  </label>
                  {userCvs.length > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Auto-Generate PDF
                    </span>
                  )}
                </div>

                {userCvs.length > 0 ? (
                  <select
                    value={singleForm.attachment_cv_id}
                    onChange={(e) => setSingleForm({ ...singleForm, attachment_cv_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-[8px] text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1738D1]"
                  >
                    <option value="">-- Tanpa Lampiran CV --</option>
                    {userCvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title || 'CV Siap Kerja'} ({cv.target_position || 'Umum'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between py-1">
                    <span>Belum ada CV di akunmu.</span>
                    <Link href="/cv" className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                      Buat CV <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {selectedSingleCv ? (
                  <div className="p-2.5 rounded-[8px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-[11px] flex items-start gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#1738D1] dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        PDF ATS Resmi akan disertakan otomatis:
                      </p>
                      <p className="text-[10px] text-[#1738D1] dark:text-blue-300 font-mono mt-0.5">
                        📎 CV_{(userName || 'Pelamar').replace(/\s+/g, '_')}_{(singleForm.position || 'Kandidat').replace(/\s+/g, '_')}.pdf
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Dibuat langsung dari data CV Builder akunmu. Email dikirim dengan lampiran PDF tanpa perlu download & upload manual.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    Pilih CV agar berkas PDF resmi dilampirkan otomatis saat dikirim ke HR.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Desain Template Email
                </label>
                <select
                  value={singleForm.design}
                  onChange={(e) => setSingleForm({ ...singleForm, design: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                >
                  <option value="standar">Standar / Polos (Natural seperti Gmail - Direkomendasikan)</option>
                  <option value="minimal">Minimalist (Clean & Spacing Lega)</option>
                  <option value="klasik">Klasik (Card Navy & Elegan)</option>
                  <option value="serif">Serif (Editorial Formal)</option>
                  <option value="dark">Dark Theme (Modern Slate)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Isi Surat Lamaran
                  </label>
                  {singleForm.body_content && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(singleForm.body_content);
                        toast.success('Teks Disalin', 'Isi email berhasil disalin ke clipboard.');
                      }}
                      className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Salin teks jika ingin kirim manual lewat email pribadi kamu tanpa bot"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin Teks (Manual)</span>
                    </button>
                  )}
                </div>

                {/* Template Cepat Instan di dalam Drawer */}
                <div className="mb-2.5 p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-200">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      Gunakan Template Instan:
                    </span>
                    {savedCoverLetters.length > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {savedCoverLetters.length} draf tersimpan
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {COVER_LETTER_PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            const text = preset.generate({
                              userName: userName || 'Pelamar',
                              company: singleForm.company,
                              position: singleForm.position,
                              recruiterName: singleForm.to_name,
                            });
                            setSingleForm((prev) => ({
                              ...prev,
                              body_content: text,
                              custom_subject:
                                prev.company && prev.position
                                  ? `Lamaran Pekerjaan - ${prev.position} di ${prev.company} - ${userName || 'Kandidat'}`
                                  : prev.custom_subject,
                            }));
                            toast.success('Template Diterapkan', `Template ${preset.name} berhasil diisikan.`);
                          }}
                          className="px-2 py-1.5 rounded-[8px] text-[10px] font-bold bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer text-left"
                        >
                          <Icon className="w-3 h-3 text-[#1738D1] dark:text-blue-400 shrink-0" />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {savedCoverLetters.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const found = savedCoverLetters.find((l) => l.id === e.target.value);
                          if (found) {
                            setSingleForm((prev) => ({
                              ...prev,
                              company: found.company || prev.company,
                              position: found.position || prev.position,
                              body_content: found.content,
                              custom_subject: `Lamaran Pekerjaan - ${found.position} di ${found.company} - ${userName || 'Kandidat'}`,
                            }));
                            toast.success('Draf Dimuat', `Draf untuk ${found.company} berhasil dimuat.`);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-[8px] text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#1738D1]"
                      >
                        <option value="" disabled>
                          -- Atau Ambil dari Draf Tersimpan ({savedCoverLetters.length}) --
                        </option>
                        {savedCoverLetters.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.position} - {l.company}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <textarea
                  rows={6}
                  value={singleForm.body_content}
                  onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                  placeholder="Ketik isi email atau pilih salah satu template instan di atas..."
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1] font-sans"
                />
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSingleDrawerOpen(false)}
                className="px-4 py-2.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="single-send-form"
                disabled={isSendingSingle}
                className="px-5 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {isSendingSingle ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Mengirim Email...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Kirim Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RIGHT-HAND SLIDE-IN DRAWER: CONNECT BOT ================= */}
      {isSmtpDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Aktifkan Bot Pengirim Email
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    100% Gratis & Menggunakan Akun Pribadi Kamu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmtpDrawerOpen(false)}
                className="p-1 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form id="smtp-add-form" onSubmit={handleSaveSmtp} className="flex-1 overflow-y-auto p-5 space-y-4">
              {smtpFeedback && (
                <div
                  className={`p-3.5 rounded-[10px] text-xs font-bold border flex items-start gap-2.5 ${
                    smtpFeedback.success
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {smtpFeedback.success ? (
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">{smtpFeedback.message}</div>
                </div>
              )}

              {/* Provider Selector Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Layanan Email Kamu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['gmail', 'outlook', 'yahoo', 'custom'] as ProviderType[]).map((key) => {
                    const preset = PROVIDER_PRESETS[key];
                    const isSelected = selectedProvider === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectProvider(key)}
                        className={`p-3 rounded-[10px] text-left border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#1738D1] bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#1738D1]'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-[#1738D1] dark:text-blue-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {preset.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-1">
                          {preset.subname}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3 Steps Visual Guide for Gmail */}
              {selectedProvider === 'gmail' && (
                <div className="p-4 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#1738D1]" />
                      <span>3 Langkah Mudah Menghubungkan Gmail</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      1 Menit Selesai
                    </span>
                  </div>

                  <div className="space-y-2.5 text-[11px] leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#1738D1] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="flex-1">
                        <div>Buka halaman keamanan Sandi Aplikasi Google:</div>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 rounded-[8px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-[11px] shadow-sm transition"
                        >
                          <span>Buka Sandi Aplikasi Google</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          (Pastikan Verifikasi 2 Langkah akun Google kamu sudah aktif).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#1738D1] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="flex-1">
                        Ketik nama aplikasi, misalnya:{' '}
                        <code className="font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded">
                          Employr
                        </code>
                        , lalu klik tombol <strong>Buat</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#1738D1] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="flex-1">
                        Google akan menampilkan <strong>16 huruf sandi</strong> (contoh:{' '}
                        <code>abcd efgh ijkl mnop</code>). Salin dan tempelkan ke kolom sandi di bawah.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sender Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pengirim *
                </label>
                <input
                  type="text"
                  required
                  value={smtpForm.from_name}
                  onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })}
                  placeholder="cth. Budi Pratama (Akan dilihat oleh HRD)"
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email {selectedProvider === 'gmail' ? 'Gmail' : ''} *
                </label>
                <input
                  type="email"
                  required
                  value={smtpForm.username}
                  onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                  placeholder={
                    selectedProvider === 'gmail' ? 'cth. namakamu@gmail.com' : 'cth. anda@domain.com'
                  }
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              {/* App Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {selectedProvider === 'gmail'
                      ? 'Sandi Aplikasi Google (16 Karakter) *'
                      : 'Kata Sandi Aplikasi / Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-[#1738D1] dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={smtpForm.password}
                  onChange={(e) => {
                    // Auto-strip spaces in real time
                    const clean = e.target.value.replace(/\s+/g, '');
                    setSmtpForm({ ...smtpForm, password: clean });
                  }}
                  placeholder="cth. abcd efgh ijkl mnop"
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Bukan kata sandi login biasa. Spasi akan otomatis dibersihkan oleh sistem.
                </p>
              </div>

              {/* Collapsible Advanced Server Settings */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="w-full py-2 px-3 rounded-[10px] bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    Pengaturan Server Lanjutan (Host & Port)
                  </span>
                  {showAdvancedSettings ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showAdvancedSettings && (
                  <div className="mt-3 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Host Server
                        </label>
                        <input
                          type="text"
                          required
                          value={smtpForm.host}
                          onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                          className="w-full px-3 py-2 rounded-[8px] text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Port
                        </label>
                        <input
                          type="number"
                          required
                          value={smtpForm.port}
                          onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-[8px] text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Batas Harian (Daily Limit)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={2000}
                        value={smtpForm.daily_limit}
                        onChange={(e) =>
                          setSmtpForm({ ...smtpForm, daily_limit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-[8px] text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Batas gratis resmi dari Google adalah 500 email/hari.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="px-3.5 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                {isTestingSmtp ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {isTestingSmtp ? 'Menguji...' : 'Uji Koneksi'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmtpDrawerOpen(false)}
                  className="px-3.5 py-2.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="smtp-add-form"
                  disabled={isSavingSmtp}
                  className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSavingSmtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Aktifkan Bot Pengirim
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
