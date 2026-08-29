'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { mailerApi, userApi } from '@/lib/api';
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
  Upload,
  RefreshCw,
  X,
  Play,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export const MailerView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'smtp'>('single');

  // SMTP Accounts state
  const [smtpAccounts, setSmtpAccounts] = useState<any[]>([]);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(true);

  // Single Send State
  const [isSingleDrawerOpen, setIsSingleDrawerOpen] = useState(false);
  const [singleForm, setSingleForm] = useState({
    to: '',
    to_name: '',
    company: '',
    position: '',
    body_content: '',
    custom_subject: '',
    design: 'klasik',
    smtp_id: '',
  });
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success: boolean; message: string } | null>(null);

  // Add SMTP Drawer State
  const [isSmtpDrawerOpen, setIsSmtpDrawerOpen] = useState(false);
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
  const [batchDesign, setBatchDesign] = useState('klasik');
  const [csvText, setCsvText] = useState('');
  const [parsedCsvItems, setParsedCsvItems] = useState<any[]>([]);
  const [isStartingBatch, setIsStartingBatch] = useState(false);
  const [batchJobs, setBatchJobs] = useState<any[]>([]);
  const [activeBatchResult, setActiveBatchResult] = useState<any>(null);

  // Load user data
  useEffect(() => {
    loadSmtpAccounts();
    loadBatchJobs();

    // Auto prefill sender name from profile
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        setSmtpForm((prev) => ({
          ...prev,
          from_name: profile.fullName || profile.name || '',
          from_email: profile.email || '',
        }));
      }
    }).catch(() => {});
  }, []);

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

  // Handle SMTP Test Connection
  const handleTestSmtp = async () => {
    if (!smtpForm.username || !smtpForm.password) {
      setSmtpFeedback({ success: false, message: 'Username dan App Password SMTP wajib diisi.' });
      return;
    }
    setIsTestingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await mailerApi.testSmtpConnection(smtpForm);
      if (res.success) {
        setSmtpFeedback({ success: true, message: 'Koneksi SMTP Berhasil!' });
      } else {
        setSmtpFeedback({ success: false, message: res.message || 'Koneksi gagal.' });
      }
    } catch (err: any) {
      setSmtpFeedback({ success: false, message: err.message || 'Gagal menguji koneksi SMTP.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Handle Save SMTP
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await mailerApi.createSmtpAccount(smtpForm);
      if (res.success) {
        setSmtpFeedback({ success: true, message: 'Akun SMTP berhasil disimpan!' });
        loadSmtpAccounts();
        setTimeout(() => {
          setIsSmtpDrawerOpen(false);
          setSmtpFeedback(null);
        }, 1200);
      } else {
        setSmtpFeedback({ success: false, message: res.message || 'Gagal menyimpan akun SMTP.' });
      }
    } catch (err: any) {
      setSmtpFeedback({ success: false, message: err.message || 'Gagal menyimpan akun SMTP.' });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  // Handle Delete SMTP
  const handleDeleteSmtp = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun SMTP ini?')) return;
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Auto Mailer Lamaran"
        subtitle="Kirim email lamaran kerja personal atau massal via SMTP aman dan sinkron otomatis ke Kanban Tracker."
        icon={Mail}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'single'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Kirim Cepat (Single)
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'batch'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Kirim Massal (Batch CSV)
        </button>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'smtp'
              ? 'bg-[#1738D1] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Pengaturan SMTP ({smtpAccounts.length})
        </button>
      </div>

      {/* ================= TAB 1: SINGLE SEND ================= */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          {/* SMTP Notice Card */}
          {smtpAccounts.length === 0 && !isLoadingSmtp && (
            <div className="p-4 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Akun SMTP Belum Terkonfigurasi
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Untuk mulai mengirim email lamaran, Anda perlu menambahkan setidaknya satu akun pengirim (misalnya Gmail App Password atau custom SMTP).
                </p>
                <button
                  onClick={() => {
                    setActiveTab('smtp');
                    setIsSmtpDrawerOpen(true);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-[10px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Atur Akun SMTP Sekarang
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
                  Integrasi Surat Lamaran
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Susun cover letter Anda di modul Surat Lamaran lalu kirimkan langsung dengan sekali klik.
                </p>
              </div>
              <Link
                href="/surat-lamaran"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                Buat Surat Lamaran
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
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
                  <option value="klasik">Klasik (Card Navy & Elegan)</option>
                  <option value="minimal">Minimalist (Clean & Spacing Lega)</option>
                  <option value="dark">Dark Theme (Modern Slate)</option>
                  <option value="serif">Serif (Editorial Formal)</option>
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

      {/* ================= TAB 3: SMTP SETTINGS ================= */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Daftar Akun Pengirim (SMTP)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dukungan multi-akun: sistem akan otomatis melakukan failover jika salah satu akun limit atau mengalami kendala.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSmtpDrawerOpen(true);
                setSmtpFeedback(null);
              }}
              className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Tambah Akun SMTP
            </button>
          </div>

          {smtpAccounts.length === 0 && !isLoadingSmtp ? (
            <div className="p-8 text-center rounded-[10px] border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <Server className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada akun SMTP</p>
              <p className="text-xs text-slate-500 mt-1">Klik tombol &ldquo;Tambah Akun SMTP&rdquo; untuk mulai menghubungkan email Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smtpAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#1738D1]" />
                        {acc.from_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {acc.username}
                    </p>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div>Server: {acc.host}:{acc.port}</div>
                      <div>Kuota Harian: {acc.sent_today} / {acc.daily_limit} email terkirim</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteSmtp(acc.id)}
                      className="px-3 py-1.5 rounded-[10px] text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Desain Template Email
                </label>
                <select
                  value={singleForm.design}
                  onChange={(e) => setSingleForm({ ...singleForm, design: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                >
                  <option value="klasik">Klasik (Card Navy & Elegan)</option>
                  <option value="minimal">Minimalist (Clean & Spacing Lega)</option>
                  <option value="dark">Dark Theme (Modern Slate)</option>
                  <option value="serif">Serif (Editorial Formal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Surat Lamaran (Opsional / Otomatis)
                </label>
                <textarea
                  rows={6}
                  value={singleForm.body_content}
                  onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                  placeholder="Kosongkan untuk menggunakan kata pembuka dan pengantar standar yang sudah teruji..."
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
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

      {/* ================= RIGHT-HAND SLIDE-IN DRAWER: ADD SMTP ================= */}
      {isSmtpDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1738D1]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tambah Akun SMTP
                </h3>
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
                  className={`p-3.5 rounded-[10px] text-xs font-bold border flex items-center gap-2 ${
                    smtpFeedback.success
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {smtpFeedback.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {smtpFeedback.message}
                </div>
              )}

              <div className="p-3.5 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Tips Penggunaan Gmail
                </div>
                <p className="text-[11px] leading-relaxed">
                  Gunakan <strong>App Password (Sandi Aplikasi)</strong> 16 digit dari akun Google Anda (Bukan kata sandi login biasa). Host default: <code>smtp.gmail.com</code>, Port: <code>587</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pengirim (From Name) *
                </label>
                <input
                  type="text"
                  required
                  value={smtpForm.from_name}
                  onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })}
                  placeholder="Nama Lengkap Anda"
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email / Username SMTP *
                </label>
                <input
                  type="email"
                  required
                  value={smtpForm.username}
                  onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                  placeholder="anda@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  App Password / Password SMTP *
                </label>
                <input
                  type="password"
                  required
                  value={smtpForm.password}
                  onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Host Server
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batas Kuota Harian (Daily Limit)
                </label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={smtpForm.daily_limit}
                  onChange={(e) => setSmtpForm({ ...smtpForm, daily_limit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1738D1]"
                />
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isTestingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Uji Koneksi
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmtpDrawerOpen(false)}
                  className="px-3 py-2 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="smtp-add-form"
                  disabled={isSavingSmtp}
                  className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  {isSavingSmtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Simpan Akun
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
