'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  PenLine,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Eye,
  EyeOff,
  MailCheck,
  AtSign,
  KeyRound,
  HelpCircle,
  Copy,
  FileCheck2,
  Paperclip,
  Monitor,
  Smartphone,
  Calendar,
  Sparkles,
  Briefcase,
  Bookmark,
  Save,
  FileDown,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { COVER_LETTER_PRESETS, extractJobDescriptionEntities } from './CoverLetterView';
import { mailerApi, userApi, coverLetterApi, cvApi, trackerApi } from '@/lib/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CvScopeSelector, TrackerDatePicker, CustomTimePicker } from '@/components/ui';


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
  initialTab?: 'single' | 'cover-letter' | 'batch' | 'smtp';
}

export const MailerView: React.FC<MailerViewProps> = ({ initialTab = 'single' }) => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'single' | 'cover-letter' | 'batch' | 'smtp'>(initialTab);
  const [savedCoverLetters, setSavedCoverLetters] = useState<any[]>([]);

  // SMTP Accounts state
  const [smtpAccounts, setSmtpAccounts] = useState<any[]>([]);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(true);

  // Single Send & Studio Split Pane State
  const [mobilePane, setMobilePane] = useState<'compose' | 'preview'>('compose');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
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

  // Job-CV Alignment State (Drawer Standar Employr)
  const [isAlignDrawerOpen, setIsAlignDrawerOpen] = useState(false);
  const [alignSource, setAlignSource] = useState<'tracker' | 'manual'>('tracker');
  const [trackedJobs, setTrackedJobs] = useState<any[]>([]);
  const [selectedTrackerJobId, setSelectedTrackerJobId] = useState('');
  const [trackerSearchQuery, setTrackerSearchQuery] = useState('');
  const [manualJobText, setManualJobText] = useState('');
  const [alignManualPosition, setAlignManualPosition] = useState('');
  const [alignManualCompany, setAlignManualCompany] = useState('');
  const [alignManualRecruiter, setAlignManualRecruiter] = useState('');
  const [alignedJobSummary, setAlignedJobSummary] = useState<string | null>(null);
  const [isAligning, setIsAligning] = useState(false);

  // Draft Management & Auto-Save State
  const [lastSavedDraftAt, setLastSavedDraftAt] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showTemplatePresets, setShowTemplatePresets] = useState(false);

  // Scheduled Send State (Jam Emas HRD & Waktu Kustom)
  const [sendTiming, setSendTiming] = useState<'instant' | 'golden_hour' | 'custom'>('instant');
  const [customScheduleDate, setCustomScheduleDate] = useState('');
  const [goldenHourLabel, setGoldenHourLabel] = useState('');
  const [isOutsideOfficeHours, setIsOutsideOfficeHours] = useState(false);

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

    // Hitung Jam Emas HRD & deteksi jam kerja
    const now = new Date();
    const day = now.getDay(); // 0: Sun, 6: Sat
    const hour = now.getHours();
    const outside = day === 0 || day === 6 || hour < 8 || hour >= 18;
    setIsOutsideOfficeHours(outside);

    let targetDate = new Date(now);
    if (day === 5 && hour >= 16) {
      targetDate.setDate(now.getDate() + 3);
    } else if (day === 6) {
      targetDate.setDate(now.getDate() + 2);
    } else if (day === 0) {
      targetDate.setDate(now.getDate() + 1);
    } else if (hour >= 16) {
      targetDate.setDate(now.getDate() + 1);
    }
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    setGoldenHourLabel(`${daysIndo[targetDate.getDay()]}, ${targetDate.getDate()} ${monthsIndo[targetDate.getMonth()]} pukul 08:30 WIB`);

    // Muat data lowongan dari tracker untuk penyelarasan
    trackerApi.getAll().then((jobs: any[]) => {
      if (Array.isArray(jobs) && jobs.length > 0) {
        setTrackedJobs(jobs);
        setSelectedTrackerJobId(jobs[0].id);
      }
    }).catch(() => {});

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

    // Muat draf lokal tersimpan jika form masih kosong
    try {
      const savedLocal = localStorage.getItem('employr_mailer_draft_single');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (parsed && typeof parsed === 'object') {
          setSingleForm((prev) => ({
            ...prev,
            to: prev.to || parsed.to || '',
            to_name: prev.to_name || parsed.to_name || '',
            company: prev.company || parsed.company || '',
            position: prev.position || parsed.position || '',
            body_content: prev.body_content || parsed.body_content || '',
            custom_subject: prev.custom_subject || parsed.custom_subject || '',
            design: prev.design || parsed.design || 'standar',
            attachment_cv_id: prev.attachment_cv_id || parsed.attachment_cv_id || '',
          }));
          if (parsed._savedAt) {
            setLastSavedDraftAt(parsed._savedAt);
          }
        }
      }
    } catch {}

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

  // Auto-Save form ke localStorage dengan debounce
  useEffect(() => {
    if (!singleForm.body_content && !singleForm.to && !singleForm.company) return;
    const timer = setTimeout(() => {
      try {
        const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        localStorage.setItem(
          'employr_mailer_draft_single',
          JSON.stringify({ ...singleForm, _savedAt: nowStr })
        );
        setLastSavedDraftAt(nowStr);
      } catch {}
    }, 1200);
    return () => clearTimeout(timer);
  }, [singleForm]);


  // Handle Escape key to close drawers (A11y R-32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSmtpDrawerOpen) {
          setIsSmtpDrawerOpen(false);
          setSmtpFeedback(null);
        }
        if (isAlignDrawerOpen) {
          setIsAlignDrawerOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSmtpDrawerOpen, isAlignDrawerOpen]);

  // Filter lowongan tracker berdasarkan pencarian di dalam drawer
  const filteredTrackedJobs = React.useMemo(() => {
    if (!trackerSearchQuery.trim()) return trackedJobs;
    const q = trackerSearchQuery.toLowerCase().trim();
    return trackedJobs.filter((j) =>
      (j.position || '').toLowerCase().includes(q) ||
      (j.company_name || '').toLowerCase().includes(q) ||
      (j.status || '').toLowerCase().includes(q)
    );
  }, [trackedJobs, trackerSearchQuery]);

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
    setMobilePane('compose');
    toast.success(
      'Surat Lamaran Dimuat',
      'Draf surat lamaran dan lampiran CV telah diisikan ke formulir pengiriman email.'
    );
  };

  // Simpan draf ke database
  const handleSaveDraftToDb = async () => {
    if (!singleForm.body_content && !singleForm.company) {
      toast.warning('Draf Belum Lengkap', 'Ketik isi surat atau lengkapi data lowongan sebelum menyimpan draf.');
      return;
    }
    setIsSavingDraft(true);
    try {
      const res = await coverLetterApi.create({
        company: singleForm.company || 'Perusahaan Umum',
        position: singleForm.position || 'Posisi Sasaran',
        recruiter: singleForm.to_name || undefined,
        content: singleForm.body_content,
      });
      if (res) {
        await loadSavedCoverLetters();
        const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        setLastSavedDraftAt(nowStr);
        toast.success('Draf Tersimpan', 'Surat lamaran berhasil disimpan ke Pustaka Draf.');
      } else {
        toast.error('Gagal Menyimpan', 'Terjadi kendala saat menyimpan draf ke database.');
      }
    } catch {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan sistem saat menyimpan draf.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Hapus draf dari pustaka
  const handleDeleteCoverLetter = async (id: string) => {
    const isConfirmed = await confirm({
      type: 'danger',
      title: 'Hapus Draf Surat?',
      description: 'Draf surat ini akan dihapus dari pustaka dokumen kamu.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    });
    if (!isConfirmed) return;
    try {
      const ok = await coverLetterApi.delete(id);
      if (ok) {
        setSavedCoverLetters((prev) => prev.filter((l) => l.id !== id));
        toast.success('Draf Dihapus', 'Draf surat berhasil dihapus dari pustaka.');
      } else {
        toast.error('Gagal Menghapus', 'Draf surat tidak berhasil dihapus.');
      }
    } catch {
      toast.error('Gagal Menghapus', 'Terjadi kesalahan sistem saat menghapus draf.');
    }
  };

  // Helper preset waktu kustom
  const setCustomPresetTime = (daysOffset: number, hours: number, minutes: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setCustomScheduleDate(formatted);
  };

  const formatScheduleReadable = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} pukul ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
    } catch {
      return dateStr;
    }
  };

  // Penyelarasan Lowongan Kerja & CV menjadi Email
  const handleAlignJobAndCv = () => {
    setIsAligning(true);
    try {
      let comp = singleForm.company;
      let pos = singleForm.position;
      let rec = singleForm.to_name;
      let quals = '';

      if (alignSource === 'tracker') {
        const job = trackedJobs.find((j) => j.id === selectedTrackerJobId);
        if (job) {
          comp = job.company_name || comp;
          pos = job.position || pos;
          quals = (job.notes || job.qualifications || '').trim();
        }
      } else {
        comp = alignManualCompany.trim() || comp;
        pos = alignManualPosition.trim() || pos;
        rec = alignManualRecruiter.trim() || rec;
        if (manualJobText.trim()) {
          const extracted = extractJobDescriptionEntities(manualJobText);
          comp = comp || extracted.company || '';
          pos = pos || extracted.position || '';
          rec = rec || extracted.recruiter || '';
          quals = extracted.qualifications || manualJobText.slice(0, 150);
        }
      }

      // Ambil highlight CV yang terpilih
      const currentCv = userCvs.find((c) => c.id === singleForm.attachment_cv_id) || userCvs[0];
      const skillsList = currentCv?.skills && Array.isArray(currentCv.skills) && currentCv.skills.length > 0
        ? currentCv.skills.slice(0, 4).join(', ')
        : 'komunikasi profesional, manajemen tugas, dan kemampuan teknis';
      const applicantName = userName || 'Pelamar';

      const targetComp = comp || '[Nama Perusahaan]';
      const targetPos = pos || '[Posisi Pekerjaan]';
      const targetRec = rec || 'Bapak/Ibu HRD';

      const tailoredBody = `Kepada Yth. ${targetRec}\n${targetComp}\n\nDengan hormat,\n\nSehubungan dengan dibukanya kesempatan karier untuk posisi ${targetPos} di ${targetComp}, saya ${applicantName} bermaksud mengajukan surat lamaran pekerjaan.\n\nMenanggapi kualifikasi dan kebutuhan peran yang dicari${quals ? `, khususnya terkait ${quals.slice(0, 100)}` : ''}, saya memiliki latar belakang dan kompetensi yang relevan, khususnya dalam ${skillsList}. Melalui pengalaman kerja dan proyek yang telah saya selesaikan, saya terbiasa bekerja secara terstruktur, adaptif terhadap kebutuhan tim, serta berorientasi pada pencapaian hasil terbaik.\n\nSebagai bahan pertimbangan dan verifikasi kualifikasi, bersama email ini saya lampirkan berkas Curriculum Vitae (CV) ATS resmi terbaru saya. Saya sangat menantikan kesempatan wawancara agar dapat mendiskusikan kontribusi nyata yang siap saya berikan bagi ${targetComp}.\n\nAtas perhatian dan kesempatan yang Bapak/Ibu berikan, saya sampaikan terima kasih.\n\nHormat saya,\n${applicantName}`;

      setSingleForm((prev) => ({
        ...prev,
        company: comp || prev.company,
        position: pos || prev.position,
        to_name: rec || prev.to_name,
        body_content: tailoredBody,
        custom_subject: `Lamaran Pekerjaan: ${targetPos} – ${targetComp} – ${applicantName}`,
      }));

      setAlignedJobSummary(`${targetPos} di ${targetComp}`);
      setIsAlignDrawerOpen(false);

      toast.success(
        'Surat Berhasil Diselaraskan',
        `Isi email disesuaikan dengan posisi ${targetPos} di ${targetComp} berdasarkan profil CV kamu.`
      );
    } finally {
      setIsAligning(false);
    }
  };

  // Terapkan template standar industri ke komposer
  const handleApplyPreset = (preset: typeof COVER_LETTER_PRESETS[0]) => {
    const currentCv = userCvs.find((c) => c.id === singleForm.attachment_cv_id) || userCvs[0];
    const skillsList = currentCv?.skills && Array.isArray(currentCv.skills) && currentCv.skills.length > 0
      ? currentCv.skills.slice(0, 4).join(', ')
      : 'kompetensi utama dan keterampilan kerja profesional';

    const generated = preset.generate({
      userName: userName || 'Pelamar',
      company: singleForm.company || '[Nama Perusahaan]',
      position: singleForm.position || '[Posisi Pekerjaan]',
      recruiterName: singleForm.to_name || 'Bapak/Ibu HRD',
      highlights: skillsList,
    });

    setSingleForm((prev) => ({
      ...prev,
      body_content: generated,
      custom_subject:
        prev.position && prev.company
          ? `Lamaran Pekerjaan: ${prev.position} – ${prev.company} – ${userName || 'Kandidat'}`
          : prev.custom_subject || `Lamaran Pekerjaan – ${userName || 'Kandidat'}`,
    }));

    setActiveTab('single');
    setMobilePane('compose');
    toast.success('Template Diterapkan', `Format surat ${preset.name} berhasil dimuat ke komposer.`);
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
          message: 'Koneksi Berhasil! Akun email kamu siap digunakan untuk mengirim lamaran.',
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
          message: 'Akun pengirim berhasil diaktifkan dan siap mengirim lamaran!',
        });
        loadSmtpAccounts();
        setTimeout(() => {
          setIsSmtpDrawerOpen(false);
          setSmtpFeedback(null);
        }, 1200);
      } else {
        setSmtpFeedback({ success: false, message: res.message || 'Gagal mengaktifkan akun pengirim.' });
      }
    } catch (err: any) {
      setSmtpFeedback({ success: false, message: err.message || 'Gagal mengaktifkan akun pengirim.' });
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
      toast.success('Akun SMTP Dihapus', 'Akun email pengirim berhasil dihapus.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal Menghapus Akun', 'Terjadi kesalahan sistem saat menghapus akun email pengirim.');
    }
  };

  // Handle Single Send
  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (smtpAccounts.length === 0) {
      setSingleResult({
        success: false,
        message: 'Harap hubungkan akun email pengirim terlebih dahulu di tab Akun Pengirim.',
      });
      return;
    }
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
      toast.warning('CSV Terlalu Pendek', 'File CSV minimal harus berisi 1 baris judul kolom dan 1 baris data lowongan.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIdx = headers.findIndex((h) => h.includes('email') || h === 'to');
    const companyIdx = headers.findIndex((h) => h.includes('company') || h.includes('perusahaan'));
    const positionIdx = headers.findIndex((h) => h.includes('position') || h.includes('posisi') || h.includes('jabatan'));

    if (emailIdx === -1) {
      setParsedCsvItems([]);
      toast.warning('Kolom Email Tidak Ditemukan', 'File CSV wajib memiliki kolom bernama "email", "perusahaan", dan "posisi".');
      return;
    }

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

    if (items.length === 0) {
      toast.warning('Data Kosong', 'Tidak ada alamat email valid yang berhasil dibaca dari file CSV.');
    } else {
      toast.success('CSV Terbaca', `${items.length} email tujuan lamaran berhasil dimuat.`);
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
        title="Email & Pengirim Lamaran"
        subtitle="Kirim email lamaran kerja resmi ke HRD langsung dari akun email pribadi kamu dengan lampiran CV ATS otomatis."
        icon={Mail}
        badge="Email & Mailer"
        stats={[
          {
            label: 'Mode Aktif',
            value:
              activeTab === 'single'
                ? 'Kirim Lamaran'
                : activeTab === 'cover-letter'
                ? 'Pustaka Draf & Surat'
                : activeTab === 'batch'
                ? 'Kirim Massal'
                : 'Akun Pengirim',
            isPrimary: true,
          },
          {
            label: 'Akun Pengirim',
            value: smtpAccounts.length > 0 ? `${smtpAccounts.length} Akun Aktif` : 'Belum Terhubung',
            colorClass: smtpAccounts.length > 0 ? 'text-emerald-400' : 'text-amber-400',
          },
        ]}
        actions={
          smtpAccounts.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                setIsSmtpDrawerOpen(true);
                setSmtpFeedback(null);
              }}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#162758]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hubungkan Akun Email</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSmtpDrawerOpen(true);
                setSmtpFeedback(null);
              }}
              className="w-full sm:w-auto min-h-[44px] px-3.5 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Kelola Akun ({smtpAccounts.length})</span>
            </button>
          )
        }
      />

      {/* Navigation Tabs (Gooey Nav) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList variant="pill" className="w-full sm:w-auto justify-start flex-nowrap overflow-x-auto no-scrollbar touch-pan-x">
            <TabsTrigger value="single" size="sm"><Send className="size-4" />Kirim Lamaran</TabsTrigger>
            <TabsTrigger value="cover-letter" size="sm"><FileText className="size-4" />Pustaka Draf & Surat ({savedCoverLetters.length})</TabsTrigger>
            <TabsTrigger value="batch" size="sm"><Layers className="size-4" />Kirim Massal (CSV)</TabsTrigger>
            <TabsTrigger value="smtp" size="sm"><Server className="size-4" />Akun Pengirim ({smtpAccounts.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ================= TAB 1: SINGLE SEND (IN-PAGE SPLIT STUDIO) ================= */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          {/* First-Time User Onboarding Hero (Ketika belum ada akun email terhubung) */}
          {smtpAccounts.length === 0 && !isLoadingSmtp ? (
            <div className="p-6 sm:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Server className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-caption font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Langkah Pertama: Hubungkan Email Pengirim
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Mulai Kirim Lamaran Otomatis ke HRD
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Hubungkan akun Gmail atau email pribadimu sekali saja. Setelah aktif, lamaran akan terkirim resmi dari alamat email kamu pribadi langsung ke HRD, lengkap dengan lampiran PDF CV ATS resmi.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSmtpDrawerOpen(true);
                    setSmtpFeedback(null);
                  }}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hubungkan Gmail Sekarang (1 Menit)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cover-letter')}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <FileText className="w-4 h-4" />
                  <span>Siapkan Draf Lamaran Dulu</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-caption text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gratis kuota resmi Google</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Langsung masuk inbox HRD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tercatat otomatis di Tracker</span>
                </div>
              </div>
            </div>
          ) : (
            /* Studio Dua Kolom: Form Composer (Kiri) + Live Recipient Preview (Kanan) */
            <div className="space-y-4">
              {/* Top Status Bar: Akun & Kuota */}
              {(() => {
                const activeSender = smtpAccounts.find((a) => a.id === singleForm.smtp_id) || smtpAccounts[0];
                return (
                  <div className="p-3.5 sm:p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {activeSender?.from_name || 'Pengirim'}
                          </span>
                          <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            Siap Kirim
                          </span>
                        </div>
                        <p className="text-caption font-mono text-slate-500 dark:text-slate-400 truncate">
                          {activeSender?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 text-caption">
                      <span className="text-slate-600 dark:text-slate-400">
                        Kuota Hari Ini:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {activeSender?.sent_today ?? 0} / {activeSender?.daily_limit ?? 500}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSmtpDrawerOpen(true);
                          setSmtpFeedback(null);
                        }}
                        className="font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                      >
                        Ganti / Kelola Akun
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Mobile Viewport Toggle (< lg) */}
              <div className="lg:hidden flex rounded-[10px] bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setMobilePane('compose')}
                  className={`flex-1 min-h-[40px] rounded-[8px] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobilePane === 'compose'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Tulis Lamaran</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePane('preview')}
                  className={`flex-1 min-h-[40px] rounded-[8px] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobilePane === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau Inbox HRD</span>
                </button>
              </div>

              {/* Grid 2 Kolom Studio */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ================= SISI KIRI: COMPOSER ================= */}
                <div className={`space-y-5 lg:col-span-6 ${mobilePane === 'compose' ? 'block' : 'hidden lg:block'}`}>
                  <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-cobalt-500" />
                        Formulir Pengiriman Email
                      </h3>
                      <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                        Data yang kamu ketik akan otomatis ditampilkan di pratinjau inbox HRD secara realtime.
                      </p>
                    </div>

                    <form id="single-send-form" onSubmit={handleSendSingle} className="space-y-4">
                      {singleResult && (
                        <div
                          role="alert"
                          aria-live="polite"
                          className={`p-3.5 rounded-[10px] text-xs font-bold border flex items-center gap-2 ${
                            singleResult.success
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {singleResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>{singleResult.message}</span>
                        </div>
                      )}

                      {/* Akun Pengirim (Jika lebih dari 1) */}
                      {smtpAccounts.length > 1 && (
                        <div>
                          <label htmlFor="studio-sender-account-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Kirim Dari Akun Email
                          </label>
                          <select
                            id="studio-sender-account-select"
                            value={singleForm.smtp_id}
                            onChange={(e) => setSingleForm({ ...singleForm, smtp_id: e.target.value })}
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                          >
                            {smtpAccounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.from_name ? `${acc.from_name} <${acc.username}>` : acc.username}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Email Tujuan HRD */}
                      <div>
                        <label htmlFor="studio-hr-email-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Email HR / Perusahaan *
                        </label>
                        <input
                          id="studio-hr-email-input"
                          type="email"
                          required
                          value={singleForm.to}
                          onChange={(e) => setSingleForm({ ...singleForm, to: e.target.value })}
                          placeholder="cth. hrd@perusahaan.com"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        />
                      </div>

                      {/* Nama Perusahaan & Posisi */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="studio-company-name-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Nama Perusahaan *
                            </label>
                            {trackedJobs.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAlignSource('tracker');
                                  setIsAlignDrawerOpen(true);
                                }}
                                className="text-[11px] font-bold text-cobalt-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded"
                              >
                                <Briefcase className="w-3 h-3" />
                                <span>Ambil dari Tracker ({trackedJobs.length})</span>
                              </button>
                            )}
                          </div>
                          <input
                            id="studio-company-name-input"
                            type="text"
                            required
                            value={singleForm.company}
                            onChange={(e) => setSingleForm({ ...singleForm, company: e.target.value })}
                            placeholder="cth. PT Tokopedia"
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="studio-position-title-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Posisi Dilamar *
                          </label>
                          <input
                            id="studio-position-title-input"
                            type="text"
                            required
                            value={singleForm.position}
                            onChange={(e) => setSingleForm({ ...singleForm, position: e.target.value })}
                            placeholder="cth. Frontend Developer"
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                          />
                        </div>
                      </div>

                      {/* Nama Perekrut (Opsional) */}
                      <div>
                        <label htmlFor="studio-recruiter-name-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Perekrut / HRD (Opsional)
                        </label>
                        <input
                          id="studio-recruiter-name-input"
                          type="text"
                          value={singleForm.to_name}
                          onChange={(e) => setSingleForm({ ...singleForm, to_name: e.target.value })}
                          placeholder="cth. Ibu Sarah / Tim Rekrutmen"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        />
                      </div>

                      {/* Lampiran CV (Ramping & Efisien) */}
                      <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            {userCvs.length > 0 ? (
                              (() => {
                                const activeCv = userCvs.find((c) => c.id === singleForm.attachment_cv_id) || userCvs[0];
                                const activeCvTitle = activeCv?.title || activeCv?.name || 'CV ATS Utama';
                                const activeCvAts = activeCv?.atsScore || activeCv?.data?.atsScore || 85;
                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                        {activeCvTitle}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                        Skor {activeCvAts}%
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                      Dilampirkan otomatis sebagai PDF ATS
                                    </p>
                                  </>
                                );
                              })()
                            ) : (
                              <span className="text-xs text-slate-500 dark:text-slate-400">Belum ada CV tersimpan</span>
                            )}
                          </div>
                        </div>

                        {userCvs.length > 0 ? (
                          <CvScopeSelector
                            cvs={userCvs}
                            selectedCvId={singleForm.attachment_cv_id || userCvs[0]?.id}
                            onChange={(cvId) => {
                              setSingleForm((prev) => ({ ...prev, attachment_cv_id: cvId }));
                              const chosen = userCvs.find((c) => c.id === cvId);
                              toast.success('CV Dipilih', `Berkas ${chosen?.title || 'CV ATS'} aktif dilampirkan.`);
                            }}
                            allowAll={false}
                            trigger={
                              <button
                                type="button"
                                className="min-h-[36px] px-3 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cobalt-500 text-xs font-bold text-cobalt-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition shrink-0"
                              >
                                <span>Ganti</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            }
                          />
                        ) : (
                          <Link href="/cv" className="min-h-[36px] px-2 flex items-center gap-1 text-cobalt-500 text-xs font-bold hover:underline shrink-0">
                            Buat CV <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Metode Pengisian & Penulisan Surat Lamaran */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            Isi Surat Lamaran
                          </label>
                          {singleForm.body_content && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(singleForm.body_content);
                                toast.success('Teks Disalin', 'Isi email berhasil disalin ke clipboard.');
                              }}
                              className="min-h-[32px] px-2 py-1 text-caption font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Teks</span>
                            </button>
                          )}
                        </div>

                        {/* Bilah Terpadu Metode Pengisian Surat */}
                        <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Metode Pengisian Surat:
                            </span>
                            {savedCoverLetters.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowDraftModal(true)}
                                className="text-[11px] font-bold text-cobalt-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Bookmark className="w-3 h-3" />
                                <span>Pustaka Draf ({savedCoverLetters.length})</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Opsi 1: Selaraskan Lowongan & CV (Rekomendasi Utama) */}
                            <button
                              type="button"
                              onClick={() => setIsAlignDrawerOpen(true)}
                              className={`p-3 rounded-[8px] text-left border transition flex items-center justify-between cursor-pointer group ${
                                alignedJobSummary
                                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                                  : 'border-blue-200 dark:border-blue-900/80 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 shadow-xs ${
                                  alignedJobSummary
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-cobalt-500 text-white'
                                }`}>
                                  <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold truncate">Selaraskan dg Lowongan</span>
                                    {alignedJobSummary && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 shrink-0">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {alignedJobSummary ? `Untuk ${alignedJobSummary}` : 'Jawab kualifikasi berbasis CV'}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                            </button>

                            {/* Opsi 2: Template Teks Cepat */}
                            <button
                              type="button"
                              onClick={() => setShowTemplatePresets((prev) => !prev)}
                              className={`p-3 rounded-[8px] text-left border transition flex items-center justify-between cursor-pointer group ${
                                showTemplatePresets
                                  ? 'border-cobalt-500 bg-blue-50/70 dark:bg-blue-950/40 text-cobalt-900 dark:text-blue-200 ring-1 ring-cobalt-500'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                  <FileText className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold truncate">Pilih Template Cepat</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    Format surat lamaran instan
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition shrink-0 ml-1 ${showTemplatePresets ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                            </button>
                          </div>

                          {/* Expansion Pills untuk Template Cepat */}
                          {showTemplatePresets && (
                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 animate-in fade-in duration-150">
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
                                      toast.success('Template Diterapkan', `Template ${preset.name} dimuat ke surat.`);
                                    }}
                                    className="min-h-[40px] px-2.5 py-1.5 rounded-[8px] text-xs font-bold bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                                  >
                                    <Icon className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0" />
                                    <span className="truncate">{preset.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Format Tata Letak Email (Visual Skin Tampilan Email) */}
                      <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            Tata Letak Tampilan Email
                          </label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'standar', label: 'Standar (Gmail)', desc: 'Natural & Polos' },
                            { id: 'minimal', label: 'Minimalist', desc: 'Clean & Rapi' },
                            { id: 'klasik', label: 'Klasik Navy', desc: 'Card Elegan' },
                            { id: 'serif', label: 'Serif Formal', desc: 'Gaya Cetak' },
                            { id: 'dark', label: 'Dark Slate', desc: 'Modern Tech' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSingleForm({ ...singleForm, design: t.id })}
                              className={`p-2.5 rounded-[8px] text-left border transition cursor-pointer flex flex-col justify-between ${
                                singleForm.design === t.id
                                  ? 'border-cobalt-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-cobalt-500'
                                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <span className={`text-xs font-bold ${singleForm.design === t.id ? 'text-cobalt-500 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {t.label}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {t.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Opsi Waktu Pengiriman & Smart Timing Banner */}
                      <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400" />
                            <span>Waktu Pengiriman Email:</span>
                          </label>
                        </div>

                        {/* Banner jam kerja jika di luar office hours */}
                        {isOutsideOfficeHours && (
                          <div className="p-2.5 rounded-[8px] bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <span>
                              Saat ini di luar jam kerja rekruter. Disarankan menggunakan opsi <strong>Jam Emas HRD</strong> agar email berada di posisi teratas inbox saat kantor buka.
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <label
                            className={`p-3 rounded-[10px] border text-left cursor-pointer transition flex flex-col justify-between ${
                              sendTiming === 'instant'
                                ? 'border-cobalt-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-cobalt-500'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="sendTimingOption"
                                checked={sendTiming === 'instant'}
                                onChange={() => setSendTiming('instant')}
                                className="text-cobalt-500 focus:ring-cobalt-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Kirim Sekarang</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Langsung kirim saat klik tombol</span>
                          </label>

                          <label
                            className={`p-3 rounded-[10px] border text-left cursor-pointer transition flex flex-col justify-between ${
                              sendTiming === 'golden_hour'
                                ? 'border-cobalt-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-cobalt-500'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="sendTimingOption"
                                checked={sendTiming === 'golden_hour'}
                                onChange={() => setSendTiming('golden_hour')}
                                className="text-cobalt-500 focus:ring-cobalt-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                Jam Emas HRD
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                              {goldenHourLabel}
                            </span>
                          </label>

                          <label
                            className={`p-3 rounded-[10px] border text-left cursor-pointer transition flex flex-col justify-between ${
                              sendTiming === 'custom'
                                ? 'border-cobalt-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-cobalt-500'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="sendTimingOption"
                                checked={sendTiming === 'custom'}
                                onChange={() => {
                                  setSendTiming('custom');
                                  if (!customScheduleDate) {
                                    setCustomPresetTime(1, 8, 30);
                                  }
                                }}
                                className="text-cobalt-500 focus:ring-cobalt-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Waktu Kustom</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Pilih tanggal & jam sendiri</span>
                          </label>
                        </div>

                        {sendTiming === 'custom' && (() => {
                          const now = new Date();
                          const pad = (n: number) => String(n).padStart(2, '0');
                          const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

                          const currentDatePart = customScheduleDate ? customScheduleDate.split('T')[0] : '';
                          const currentTimePart = customScheduleDate ? (customScheduleDate.split('T')[1]?.slice(0, 5) || '08:30') : '08:30';

                          const updateDate = (newDate: string) => {
                            if (!newDate) return;
                            const time = currentTimePart || '08:30';
                            setCustomScheduleDate(`${newDate}T${time}`);
                          };

                          const updateTime = (newTime: string) => {
                            if (!newTime) return;
                            const date = currentDatePart || todayStr;
                            setCustomScheduleDate(`${date}T${newTime}`);
                          };

                          return (
                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3.5 animate-in fade-in duration-200">
                              {/* Preset Jadwal Hari Cepat */}
                              <div>
                                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                  Jadwal Rekomendasi Cepat:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setCustomPresetTime(1, 8, 30)}
                                    className="min-h-[36px] px-2.5 py-1 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-[0.98]"
                                  >
                                    Besok Pagi (08:30 WIB)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCustomPresetTime(1, 13, 30)}
                                    className="min-h-[36px] px-2.5 py-1 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-[0.98]"
                                  >
                                    Besok Siang (13:30 WIB)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCustomPresetTime(2, 8, 30)}
                                    className="min-h-[36px] px-2.5 py-1 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-[0.98]"
                                  >
                                    Lusa Pagi (08:30 WIB)
                                  </button>
                                </div>
                              </div>

                              {/* Form Input Tanggal & Jam Kustom (Design System Bento) */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {/* 1. Tanggal Pengiriman (Design System Popover) */}
                                <div className="space-y-1.5">
                                  <label
                                    htmlFor="schedule-date-input"
                                    className="block text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                  >
                                    Tanggal Pengiriman
                                  </label>
                                  <TrackerDatePicker
                                    id="schedule-date-input"
                                    value={currentDatePart || todayStr}
                                    onChange={(newDate) => updateDate(newDate)}
                                    outputFormat="iso"
                                    placeholder="Pilih tanggal..."
                                    showPresets={false}
                                    align="left"
                                    placement="top"
                                  />
                                </div>

                                {/* 2. Jam Pengiriman (WIB) (Design System Popover) */}
                                <div className="space-y-1.5">
                                  <label
                                    htmlFor="schedule-time-input"
                                    className="block text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                  >
                                    Jam Pengiriman (WIB)
                                  </label>
                                  <CustomTimePicker
                                    id="schedule-time-input"
                                    value={currentTimePart}
                                    onChange={(newTime) => updateTime(newTime)}
                                    placeholder="Pilih jam..."
                                    align="auto"
                                    placement="top"
                                  />
                                </div>
                              </div>

                              {/* Konfirmasi Jadwal Pengiriman */}
                              {customScheduleDate && (
                                <div className="p-3 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <Clock className="w-4 h-4 text-cobalt-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-cobalt-600 dark:text-blue-400 block">
                                      Konfirmasi Jadwal Pengiriman:
                                    </span>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                                      Email akan otomatis terkirim pada {formatScheduleReadable(customScheduleDate)}.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Sticky Action Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs py-2 z-10">
                        <button
                          type="button"
                          onClick={handleSaveDraftToDb}
                          disabled={isSavingDraft}
                          className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        >
                          {isSavingDraft ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan Draf...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan Draf</span>
                            </>
                          )}
                        </button>

                        <div className="w-full sm:flex-1 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setMobilePane('preview')}
                            className="lg:hidden flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Buka Lembar Surat →</span>
                          </button>

                          <button
                            type="submit"
                            disabled={isSendingSingle || smtpAccounts.length === 0}
                            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-cobalt-500/20 flex items-center justify-center gap-2 cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                          >
                            {isSendingSingle ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Memproses...</span>
                              </>
                            ) : sendTiming === 'instant' ? (
                              <>
                                <Send className="w-4 h-4" />
                                <span>Kirim Lamaran Sekarang</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="w-4 h-4" />
                                <span>Jadwalkan Lamaran</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* ================= SISI KANAN: LIVE RECIPIENT INBOX PREVIEW ================= */}
                <div className={`space-y-4 lg:col-span-6 lg:sticky lg:top-6 ${mobilePane === 'preview' ? 'block' : 'hidden lg:block'}`}>
                  {(() => {
                    const activeSender = smtpAccounts.find((a) => a.id === singleForm.smtp_id) || smtpAccounts[0];
                    const selectedSingleCv = userCvs.find((c) => c.id === singleForm.attachment_cv_id);

                    const previewSubject =
                      singleForm.custom_subject ||
                      (singleForm.position && singleForm.company
                        ? `Lamaran Pekerjaan: ${singleForm.position} – ${singleForm.company} – ${userName || 'Kandidat'}`
                        : `Lamaran Pekerjaan: ${singleForm.position || 'Kandidat'}`);

                    const previewGreeting = singleForm.to_name
                      ? `Kepada Yth. ${singleForm.to_name}`
                      : `Kepada Yth. Tim Rekrutmen & HRD`;

                    const previewOpening = singleForm.company && singleForm.position
                      ? `Perkenalkan saya ${userName || 'Pelamar'}. Bersama surat elektronik ini saya bermaksud mengajukan lamaran untuk posisi ${singleForm.position} di ${singleForm.company}.`
                      : `Perkenalkan saya ${userName || 'Pelamar'}. Bersama email ini saya menyampaikan minat untuk melamar pekerjaan di perusahaan Anda.`;

                    const hasCustomGreeting = Boolean(singleForm.body_content && /^(Yth|Kepada|Dengan hormat|Halo|Dear|Hello)/i.test(singleForm.body_content.trim()));

                    const previewBody = singleForm.body_content
                      ? singleForm.body_content
                      : `Melalui masa studi dan persiapan karier, saya telah membangun keterampilan yang relevan. Saya memiliki etos kerja tinggi, kemampuan adaptasi yang cepat, serta siap belajar dan memberikan kontribusi terbaik bagi kemajuan tim.\n\nTerlampir saya sertakan berkas CV resmi dan portofolio sebagai bahan pertimbangan Bapak/Ibu. Besar harapan saya untuk memperoleh kesempatan wawancara agar dapat menjelaskan kualifikasi saya lebih mendalam.`;

                    const previewClosing = `Demikian surat lamaran ini saya sampaikan dengan penuh antusias. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.`;

                    const todayFormatted = new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <div className="rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col">
                        {/* Browser / Email Client Window Top Bar */}
                        <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                            </div>
                            <span className="text-caption font-bold text-slate-700 dark:text-slate-300 ml-1.5 truncate">
                              Simulasi Tampilan Inbox HRD
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-cobalt-600 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                              <PenLine className="w-2.5 h-2.5" />
                              Klik Teks untuk Edit
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {lastSavedDraftAt && (
                              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Tersimpan ({lastSavedDraftAt})</span>
                              </div>
                            )}

                            {/* Device Toggle (Desktop vs Mobile) */}
                            <div className="flex items-center p-0.5 rounded-[6px] bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              <button
                                type="button"
                                onClick={() => setPreviewDevice('desktop')}
                                className={`px-2 py-1 rounded-[5px] flex items-center gap-1 transition cursor-pointer ${
                                  previewDevice === 'desktop'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                <Monitor className="w-3 h-3" />
                                <span>Laptop</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewDevice('mobile')}
                                className={`px-2 py-1 rounded-[5px] flex items-center gap-1 transition cursor-pointer ${
                                  previewDevice === 'mobile'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>HP</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Email Header Details (From, To, Subject, Attachment) */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/30 dark:bg-slate-800/20 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-500 dark:text-slate-400 w-12 shrink-0">Dari:</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {activeSender?.from_name || userName || 'Pelamar'}{' '}
                                  <span className="text-slate-500 dark:text-slate-400 font-mono text-caption">
                                    &lt;{activeSender?.username || 'email@kamu.com'}&gt;
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-500 dark:text-slate-400 w-12 shrink-0">Kepada:</span>
                                <span className="font-semibold text-slate-900 dark:text-white font-mono truncate">
                                  {singleForm.to || 'hrd@perusahaan.com'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 shrink-0 font-mono">
                              {todayFormatted}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                            <span className="font-bold text-slate-500 dark:text-slate-400 w-12 shrink-0 pt-0.5">Subjek:</span>
                            <div className="flex-1 min-w-0 relative group/subj">
                              <input
                                type="text"
                                value={singleForm.custom_subject || previewSubject}
                                onChange={(e) => setSingleForm({ ...singleForm, custom_subject: e.target.value })}
                                className="w-full bg-transparent border-0 font-bold text-slate-900 dark:text-white leading-snug p-0.5 -ml-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-cobalt-500 focus:outline-none transition text-xs cursor-text"
                                placeholder="Ketik subjek lamaran..."
                                title="Klik untuk langsung mengedit subjek email"
                              />
                            </div>
                          </div>

                          {/* Lampiran PDF CV Chip (Interaktif & Bisa Ganti Berkas Langsung) */}
                          <div className="pt-1 flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 dark:text-slate-400 w-12 shrink-0">Lampiran:</span>
                            {userCvs.length > 0 ? (
                              <CvScopeSelector
                                cvs={userCvs}
                                selectedCvId={singleForm.attachment_cv_id || userCvs[0]?.id}
                                onChange={(cvId) => {
                                  setSingleForm((prev) => ({ ...prev, attachment_cv_id: cvId }));
                                  const chosen = userCvs.find((c) => c.id === cvId);
                                  toast.success('CV Dipilih', `Berkas ${chosen?.title || 'CV ATS'} aktif dilampirkan.`);
                                }}
                                allowAll={false}
                                trigger={
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 transition cursor-pointer group shadow-2xs"
                                    title="Klik untuk mengganti lampiran CV"
                                  >
                                    <Paperclip className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="font-mono truncate max-w-[200px]">
                                      {selectedSingleCv ? `CV_${(userName || 'Pelamar').replace(/\s+/g, '_')}_${(singleForm.position || 'Kandidat').replace(/\s+/g, '_')}.pdf` : 'Pilih Berkas CV'}
                                    </span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 group-hover:bg-emerald-200 transition">
                                      Ganti
                                    </span>
                                  </button>
                                }
                              />
                            ) : (
                              <span className="text-caption text-slate-400 italic">
                                Tanpa lampiran berkas (pilih CV di form)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Email Body Canvas */}
                        <div className="p-4 sm:p-5 bg-slate-100/60 dark:bg-slate-950/60 max-h-[520px] overflow-y-auto">
                          <div className={`transition-all duration-200 ${previewDevice === 'mobile' ? 'max-w-[340px] mx-auto shadow-sm' : 'w-full'}`}>
                            {singleForm.design === 'dark' ? (
                              <div className="rounded-[8px] bg-[#1e293b] text-[#f8fafc] border border-slate-700 overflow-hidden shadow-xs text-xs sm:text-sm">
                                <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 border-b border-blue-500">
                                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                                    Surat Lamaran Kerja
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                                    {singleForm.position || 'Posisi Pekerjaan'}
                                  </h4>
                                  <p className="text-xs text-blue-200 mt-0.5">
                                    {singleForm.company || 'Nama Perusahaan'}
                                  </p>
                                </div>
                                <div className="p-4 sm:p-5 space-y-3 text-slate-200 leading-relaxed">
                                  {!hasCustomGreeting && (
                                    <>
                                      <p className="font-semibold text-white">
                                        {previewGreeting} {singleForm.company ? `${singleForm.company},` : ','}
                                      </p>
                                      <p>{previewOpening}</p>
                                    </>
                                  )}
                                  <div className="relative group/body">
                                    <textarea
                                      value={singleForm.body_content || (hasCustomGreeting ? '' : previewBody)}
                                      onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                                      placeholder="Ketik atau edit isi surat langsung di sini..."
                                      rows={Math.max(6, (singleForm.body_content || previewBody).split('\n').length + 1)}
                                      className="w-full bg-transparent resize-none border-0 p-1.5 -ml-1.5 rounded focus:ring-1 focus:ring-blue-400/50 focus:outline-none leading-relaxed transition font-sans text-slate-200 hover:bg-white/5 cursor-text text-xs sm:text-sm"
                                      title="Klik untuk langsung mengedit isi surat di sini"
                                    />
                                  </div>
                                  {!hasCustomGreeting && (
                                    <p>{previewClosing}</p>
                                  )}
                                  <div className="pt-3 border-t border-slate-700">
                                    <p className="font-bold text-white">{userName || 'Pelamar'}</p>
                                    <p className="text-caption text-slate-400 mt-0.5">{activeSender?.username || 'email@kamu.com'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : singleForm.design === 'serif' ? (
                              <div className="rounded-[8px] bg-[#fcfbf9] text-[#1c1917] border border-stone-300 p-4 sm:p-5 font-serif shadow-xs text-xs sm:text-sm">
                                <div className="border-b-2 border-stone-800 pb-3 mb-3">
                                  <h4 className="text-base sm:text-lg font-normal text-stone-900">
                                    {singleForm.position || 'Posisi Pekerjaan'}
                                  </h4>
                                  <p className="text-xs italic text-stone-600 mt-0.5">
                                    Diajukan untuk {singleForm.company || 'Nama Perusahaan'}
                                  </p>
                                </div>
                                <div className="space-y-3 text-stone-800 leading-relaxed font-serif">
                                  {!hasCustomGreeting && (
                                    <>
                                      <p className="font-semibold">
                                        {previewGreeting} {singleForm.company ? `${singleForm.company},` : ','}
                                      </p>
                                      <p>{previewOpening}</p>
                                    </>
                                  )}
                                  <div className="relative group/body">
                                    <textarea
                                      value={singleForm.body_content || (hasCustomGreeting ? '' : previewBody)}
                                      onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                                      placeholder="Ketik atau edit isi surat langsung di sini..."
                                      rows={Math.max(6, (singleForm.body_content || previewBody).split('\n').length + 1)}
                                      className="w-full bg-transparent resize-none border-0 p-1.5 -ml-1.5 rounded focus:ring-1 focus:ring-stone-400/50 focus:outline-none leading-relaxed transition font-serif text-stone-800 hover:bg-stone-500/5 cursor-text text-xs sm:text-sm"
                                      title="Klik untuk langsung mengedit isi surat di sini"
                                    />
                                  </div>
                                  {!hasCustomGreeting && (
                                    <p>{previewClosing}</p>
                                  )}
                                  <div className="pt-3 border-t border-dashed border-stone-400 font-sans mt-3">
                                    <p className="font-bold text-stone-900">{userName || 'Pelamar'}</p>
                                    <p className="text-caption text-stone-600">{activeSender?.username || 'email@kamu.com'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : singleForm.design === 'minimal' ? (
                              <div className="rounded-[8px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-xs sm:text-sm">
                                <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Lamaran Pekerjaan
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                    {singleForm.position || 'Posisi Pekerjaan'} &bull; {singleForm.company || 'Perusahaan'}
                                  </h4>
                                </div>
                                <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {!hasCustomGreeting && (
                                    <>
                                      <p className="font-semibold text-slate-900 dark:text-white">
                                        {previewGreeting} {singleForm.company ? `${singleForm.company},` : ','}
                                      </p>
                                      <p>{previewOpening}</p>
                                    </>
                                  )}
                                  <div className="relative group/body">
                                    <textarea
                                      value={singleForm.body_content || (hasCustomGreeting ? '' : previewBody)}
                                      onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                                      placeholder="Ketik atau edit isi surat langsung di sini..."
                                      rows={Math.max(6, (singleForm.body_content || previewBody).split('\n').length + 1)}
                                      className="w-full bg-transparent resize-none border-0 p-1.5 -ml-1.5 rounded focus:ring-1 focus:ring-cobalt-500/40 focus:outline-none leading-relaxed transition font-sans text-slate-700 dark:text-slate-300 hover:bg-slate-500/5 cursor-text text-xs sm:text-sm"
                                      title="Klik untuk langsung mengedit isi surat di sini"
                                    />
                                  </div>
                                  {!hasCustomGreeting && (
                                    <p>{previewClosing}</p>
                                  )}
                                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                                    <p className="font-bold text-slate-900 dark:text-white">{userName || 'Pelamar'}</p>
                                    <p className="text-caption text-slate-500">{activeSender?.username || 'email@kamu.com'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : singleForm.design === 'klasik' ? (
                              <div className="rounded-[8px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs text-xs sm:text-sm">
                                <div className="p-4 bg-cobalt-500 text-white">
                                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                                    Pengajuan Lamaran Resmi
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                                    {singleForm.position || 'Posisi Pekerjaan'}
                                  </h4>
                                  <p className="text-xs text-blue-100 mt-0.5">
                                    {singleForm.company || 'Nama Perusahaan'}
                                  </p>
                                </div>
                                <div className="p-4 sm:p-5 space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {!hasCustomGreeting && (
                                    <>
                                      <p className="font-semibold text-slate-900 dark:text-white">
                                        {previewGreeting} {singleForm.company ? `${singleForm.company},` : ','}
                                      </p>
                                      <p>{previewOpening}</p>
                                    </>
                                  )}
                                  <div className="relative group/body">
                                    <textarea
                                      value={singleForm.body_content || (hasCustomGreeting ? '' : previewBody)}
                                      onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                                      placeholder="Ketik atau edit isi surat langsung di sini..."
                                      rows={Math.max(6, (singleForm.body_content || previewBody).split('\n').length + 1)}
                                      className="w-full bg-transparent resize-none border-0 p-1.5 -ml-1.5 rounded focus:ring-1 focus:ring-cobalt-500/40 focus:outline-none leading-relaxed transition font-sans text-slate-700 dark:text-slate-300 hover:bg-slate-500/5 cursor-text text-xs sm:text-sm"
                                      title="Klik untuk langsung mengedit isi surat di sini"
                                    />
                                  </div>
                                  {!hasCustomGreeting && (
                                    <p>{previewClosing}</p>
                                  )}
                                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <p className="font-bold text-slate-900 dark:text-white">{userName || 'Pelamar'}</p>
                                    <p className="text-caption text-slate-500">{activeSender?.username || 'email@kamu.com'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Standar / Polos (Natural Gmail Look) */
                              <div className="rounded-[8px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs text-xs sm:text-sm leading-relaxed">
                                {!hasCustomGreeting && (
                                  <>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                      {previewGreeting} {singleForm.company ? `${singleForm.company},` : ','}
                                    </p>
                                    <p>{previewOpening}</p>
                                  </>
                                )}
                                <div className="relative group/body">
                                  <textarea
                                    value={singleForm.body_content || (hasCustomGreeting ? '' : previewBody)}
                                    onChange={(e) => setSingleForm({ ...singleForm, body_content: e.target.value })}
                                    placeholder="Ketik atau edit isi surat langsung di sini..."
                                    rows={Math.max(6, (singleForm.body_content || previewBody).split('\n').length + 1)}
                                    className="w-full bg-transparent resize-none border-0 p-1.5 -ml-1.5 rounded focus:ring-1 focus:ring-cobalt-500/40 focus:outline-none leading-relaxed transition font-sans text-slate-800 dark:text-slate-200 hover:bg-slate-500/5 cursor-text text-xs sm:text-sm"
                                    title="Klik untuk langsung mengedit isi surat di sini"
                                  />
                                </div>
                                {!hasCustomGreeting && (
                                  <p>{previewClosing}</p>
                                )}
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-3">
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Hormat saya,</p>
                                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{userName || 'Pelamar'}</p>
                                  <p className="text-caption text-slate-500 mt-0.5">{activeSender?.username || 'email@kamu.com'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Pratinjau */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Format email WYSIWYG sesuai tampilan asli di inbox HRD
                          </span>
                          {mobilePane === 'preview' && (
                            <div className="lg:hidden flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                              <button
                                type="button"
                                onClick={() => setMobilePane('compose')}
                                className="flex-1 px-3 py-2 rounded-[8px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs"
                              >
                                ← Info Lamaran
                              </button>
                              <button
                                type="button"
                                onClick={handleSendSingle as any}
                                disabled={isSendingSingle}
                                className="flex-1 px-3 py-2 rounded-[8px] bg-cobalt-500 text-white font-bold text-xs"
                              >
                                Kirim Sekarang
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PUSTAKA DRAF & MASTER SURAT ================= */}
      {activeTab === 'cover-letter' && (
        <div className="space-y-6">
          {/* Header & Status Pustaka Draf */}
          <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-cobalt-500" />
                  Daftar Draf Surat Lamaran Tersimpan ({savedCoverLetters.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arsip surat lamaran yang pernah kamu simpan dari Komposer maupun Generator Surat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('single');
                  setMobilePane('compose');
                }}
                className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Surat di Komposer</span>
              </button>
            </div>

            {savedCoverLetters.length === 0 ? (
              <div className="p-8 text-center rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Belum ada draf surat yang disimpan.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Saat mengetik surat lamaran di tab <strong>Kirim Lamaran</strong>, klik tombol <strong>&quot;Simpan Draf&quot;</strong> agar tersimpan rapi di sini untuk digunakan berulang kali.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {savedCoverLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {letter.position || 'Surat Lamaran'}
                          </h4>
                          <p className="text-[11px] font-semibold text-cobalt-600 dark:text-blue-400">
                            {letter.company || 'Perusahaan Umum'}
                          </p>
                        </div>
                        {letter.updated_at && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                            {new Date(letter.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans bg-white dark:bg-slate-900 p-2.5 rounded-[6px] border border-slate-200/60 dark:border-slate-700/60">
                        {letter.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(letter.content);
                          toast.success('Disalin', 'Isi surat lamaran disalin ke clipboard.');
                        }}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoverLetter(letter.id)}
                          className="min-h-[36px] px-2 py-1.5 rounded-[6px] text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUseCoverLetter({
                              company: letter.company,
                              position: letter.position,
                              recruiterName: letter.recruiter,
                              content: letter.content,
                            })
                          }
                          className="min-h-[36px] px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-cobalt-500 hover:bg-cobalt-600 text-white flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim via Komposer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Template Standar Industri Siap Pakai */}
          <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cobalt-500" />
                Template Standar Industri Siap Pakai ({COVER_LETTER_PRESETS.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih format struktur surat lamaran teruji sesuai profil dan tahap kariermu untuk langsung dimuat ke Komposer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {COVER_LETTER_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const sampleText = preset.generate({
                  userName: userName || 'Nama Lengkap',
                  company: 'PT Target Indonesia',
                  position: 'Posisi Sasaran',
                  recruiterName: 'Bapak/Ibu HRD',
                  highlights: 'keterampilan teknis dan kerja tim',
                });

                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {preset.name}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-blue-50 text-cobalt-600 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {preset.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="p-2.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 font-sans line-clamp-3 leading-relaxed">
                        {sampleText}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(sampleText);
                          toast.success('Disalin', `Format template ${preset.name} disalin ke clipboard.`);
                        }}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Format</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="min-h-[36px] px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-cobalt-500 hover:bg-cobalt-600 text-white flex items-center gap-1 cursor-pointer transition shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Gunakan di Komposer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
                <FileSpreadsheet className="w-4 h-4 text-cobalt-500" />
                Upload CSV Daftar Lowongan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Format kolom CSV yang didukung: <code>email, company, position</code> atau <code>email, perusahaan, posisi</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="batch-title-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Batch
                </label>
                <input
                  id="batch-title-input"
                  type="text"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  placeholder="Batch IT Support Jakarta"
                />
              </div>

              <div>
                <label htmlFor="batch-delay-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jeda Antar Email (Detik)
                </label>
                <input
                  id="batch-delay-input"
                  type="number"
                  min={1}
                  max={60}
                  value={batchDelay}
                  onChange={(e) => setBatchDelay(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                />
              </div>

              <div>
                <label htmlFor="batch-design-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilihan Template HTML
                </label>
                <select
                  id="batch-design-select"
                  value={batchDesign}
                  onChange={(e) => setBatchDesign(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
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
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 dark:text-slate-400" />
              <label htmlFor="csv-file-upload" className="block text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Pilih file CSV dari komputer Anda
              </label>
              <input
                id="csv-file-upload"
                type="file"
                accept=".csv"
                aria-label="Pilih file CSV dari komputer Anda"
                onChange={handleCsvFileUpload}
                className="mt-3 block mx-auto min-h-[44px] text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:min-h-[44px] file:py-2.5 file:px-4 file:rounded-[10px] file:border-0 file:text-xs file:font-bold file:bg-cobalt-500 file:text-white hover:file:bg-[#132EA8] cursor-pointer"
              />
            </div>

            {/* Parsed List Preview */}
            {parsedCsvItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Daftar Penerima Terbaca ({parsedCsvItems.length} email)
                  </span>
                  <button
                    onClick={handleStartBatch}
                    disabled={isStartingBatch || smtpAccounts.length === 0}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
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

                <div className="max-h-60 overflow-y-auto overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-[10px]">
                  <table className="w-full min-w-[480px] text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
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
              <div className="p-4 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800" role="status" aria-live="polite">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
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
                      <p className="text-caption text-slate-500 mt-0.5">
                        {new Date(job.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {job.sent_count} / {job.total_emails} terkirim
                      </span>
                      <span className={`px-2.5 py-1 rounded-[10px] text-caption font-bold ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
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

      {/* ================= TAB 3: AKUN PENGIRIM ================= */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-cobalt-500" />
                Akun Pengirim Email Pribadi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kirim lamaran kerja otomatis langsung dari akun email kamu (Gmail/Outlook), 100% gratis, aman, dan langsung sampai ke inbox HRD.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSmtpDrawerOpen(true);
                setSmtpFeedback(null);
              }}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Hubungkan Akun Baru
            </button>
          </div>

          {smtpAccounts.length === 0 && !isLoadingSmtp ? (
            <div className="p-8 sm:p-10 text-center rounded-[10px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Server className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Belum ada akun pengirim yang terhubung
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md mx-auto">
                Sambungkan akun Gmail kamu dalam 3 langkah mudah. Setelah aktif, sistem dapat mengirimkan email lamaran kerja personal maupun massal secara otomatis.
              </p>
              <button
                onClick={() => {
                  setIsSmtpDrawerOpen(true);
                  setSmtpFeedback(null);
                }}
                className="mt-4 px-4 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-cobalt-500/20 transition active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
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
                          <Server className="w-4 h-4 text-cobalt-500" />
                          {acc.from_name}
                        </span>
                        <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Siap Kirim
                        </span>
                      </div>
                      
                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="text-caption text-slate-600 dark:text-slate-400 mb-0.5">Email Pengirim:</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {acc.username}
                        </div>
                      </div>

                      <div className="text-caption text-slate-600 dark:text-slate-400 space-y-1">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Penyedia:</strong> {providerLabel}
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Batas Harian:</strong> {acc.sent_today} / {acc.daily_limit} email terkirim hari ini (Batas gratis Google)
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-caption text-slate-500 dark:text-slate-400">
                        Otomatis failover jika kuota habis
                      </span>
                      <button
                        onClick={() => handleDeleteSmtp(acc.id)}
                        className="px-3.5 py-2 min-h-[44px] rounded-[10px] text-xs font-bold text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1.5 cursor-pointer dark:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 shrink-0"
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



      {/* ================= RIGHT-HAND SLIDE-IN DRAWER: CONNECT SENDER ================= */}
      <Sheet open={isSmtpDrawerOpen} onOpenChange={setIsSmtpDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0 pr-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Hubungkan Akun Email Pengirim
                </SheetTitle>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  Gunakan akun email pribadi kamu secara aman
                </p>
              </div>
            </div>
          </SheetHeader>

            {/* Form Body */}
            <form id="smtp-add-form" onSubmit={handleSaveSmtp} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {smtpFeedback && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`p-3.5 rounded-[10px] text-xs font-bold border flex items-start gap-2.5 ${
                    smtpFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
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
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pilih Layanan Email Kamu">
                  {(['gmail', 'outlook', 'yahoo', 'custom'] as ProviderType[]).map((key) => {
                    const preset = PROVIDER_PRESETS[key];
                    const isSelected = selectedProvider === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectProvider(key)}
                        className={`p-3 min-h-[56px] rounded-[10px] text-left border transition cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                          isSelected
                            ? 'border-cobalt-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-cobalt-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-cobalt-500 dark:text-blue-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {preset.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-caption text-slate-500 dark:text-slate-400 leading-tight line-clamp-1">
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
                      <KeyRound className="w-4 h-4 text-cobalt-500" />
                      <span>3 Langkah Mudah Menghubungkan Gmail</span>
                    </div>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      1 Menit Selesai
                    </span>
                  </div>

                  <div className="space-y-2.5 text-caption leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cobalt-500 text-white flex items-center justify-center font-bold text-caption shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="flex-1">
                        <div>Buka halaman keamanan Sandi Aplikasi Google:</div>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-2.5 min-h-[44px] rounded-[8px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        >
                          <span>Buka Sandi Aplikasi Google</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <p className="text-caption text-slate-600 dark:text-slate-400 mt-1">
                          (Pastikan Verifikasi 2 Langkah akun Google kamu sudah aktif).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cobalt-500 text-white flex items-center justify-center font-bold text-caption shrink-0 mt-0.5">
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
                      <span className="w-4 h-4 rounded-full bg-cobalt-500 text-white flex items-center justify-center font-bold text-caption shrink-0 mt-0.5">
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
                <label htmlFor="smtp-from-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pengirim *
                </label>
                <input
                  id="smtp-from-name"
                  type="text"
                  required
                  value={smtpForm.from_name}
                  onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })}
                  placeholder="cth. Budi Pratama (Akan dilihat oleh HRD)"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="smtp-username" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email {selectedProvider === 'gmail' ? 'Gmail' : ''} *
                </label>
                <input
                  id="smtp-username"
                  type="email"
                  required
                  value={smtpForm.username}
                  onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                  placeholder={
                    selectedProvider === 'gmail' ? 'cth. namakamu@gmail.com' : 'cth. anda@domain.com'
                  }
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                />
              </div>

              {/* App Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="smtp-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {selectedProvider === 'gmail'
                      ? 'Sandi Aplikasi Google (16 Karakter) *'
                      : 'Kata Sandi Aplikasi / Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="min-h-[44px] px-2.5 py-1 text-caption font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                <input
                  id="smtp-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={smtpForm.password}
                  onChange={(e) => {
                    // Auto-strip spaces in real time
                    const clean = e.target.value.replace(/\s+/g, '');
                    setSmtpForm({ ...smtpForm, password: clean });
                  }}
                  placeholder="cth. abcd efgh ijkl mnop"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-sm sm:text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                />
                <p className="text-caption text-slate-600 dark:text-slate-400 mt-1">
                  Bukan kata sandi login biasa. Spasi akan otomatis dibersihkan oleh sistem.
                </p>
              </div>

              {/* Collapsible Advanced Server Settings */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  aria-expanded={showAdvancedSettings}
                  aria-controls="smtp-advanced-settings-panel"
                  className="w-full min-h-[44px] py-2.5 px-3.5 rounded-[10px] bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                >
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Pengaturan Server Lanjutan (Host & Port)
                  </span>
                  {showAdvancedSettings ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                {showAdvancedSettings && (
                  <div id="smtp-advanced-settings-panel" className="mt-3 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="smtp-host" className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Host Server
                        </label>
                        <input
                          id="smtp-host"
                          type="text"
                          required
                          value={smtpForm.host}
                          onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                          className="w-full min-h-[44px] px-3 py-2 rounded-[8px] text-sm sm:text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="smtp-port" className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Port
                        </label>
                        <input
                          id="smtp-port"
                          type="number"
                          required
                          value={smtpForm.port}
                          onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                          className="w-full min-h-[44px] px-3 py-2 rounded-[8px] text-sm sm:text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="smtp-daily-limit" className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Batas Harian (Daily Limit)
                      </label>
                      <input
                        id="smtp-daily-limit"
                        type="number"
                        min={1}
                        max={2000}
                        value={smtpForm.daily_limit}
                        onChange={(e) =>
                          setSmtpForm({ ...smtpForm, daily_limit: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 py-2 rounded-[8px] text-sm sm:text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                      />
                      <p className="text-caption text-slate-600 dark:text-slate-400 mt-1">
                        Batas gratis resmi dari Google adalah 500 email/hari.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="px-4 py-2.5 min-h-[44px] rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                {isTestingSmtp ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {isTestingSmtp ? 'Menguji...' : 'Uji Koneksi'}
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSmtpDrawerOpen(false)}
                  className="min-h-[44px] px-4 py-2.5"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  form="smtp-add-form"
                  disabled={isSavingSmtp}
                  className="min-h-[44px] px-5 py-2.5 flex items-center gap-2"
                >
                  {isSavingSmtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Simpan & Aktifkan Pengirim
                    </>
                  )}
                </Button>
              </div>
            </div>
        </SheetContent>
      </Sheet>

      {/* Right-Hand Slide-in Drawer: Selaraskan Surat dengan Lowongan */}
      <Sheet open={isAlignDrawerOpen} onOpenChange={setIsAlignDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Header Drawer (pr-14 agar tidak menabrak tombol X bawaan Sheet) */}
          <SheetHeader className="p-5 pr-14 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-left">
            <SheetTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
              <span>Selaraskan Surat dengan Lowongan</span>
            </SheetTitle>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Sesuaikan isi surat dengan lowongan dari Tracker atau uraian pekerjaan yang kamu tuju.
            </p>
          </SheetHeader>

          {/* Segmented Switcher (Microsoft Fluent & Apple HIG Pill) */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAlignSource('tracker')}
                className={`min-h-[44px] py-2 px-3 rounded-[8px] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  alignSource === 'tracker'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                <span>Dari Tracker ({trackedJobs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAlignSource('manual')}
                className={`min-h-[44px] py-2 px-3 rounded-[8px] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  alignSource === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PenLine className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                <span>Tempel Syarat Lowongan</span>
              </button>
            </div>
          </div>

          {/* Body Content (Scrollable with mobile touch momentum) */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 text-xs">
            {alignSource === 'tracker' ? (
              <div className="space-y-3">
                {/* Search Bar for Tracker */}
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={trackerSearchQuery}
                    onChange={(e) => setTrackerSearchQuery(e.target.value)}
                    placeholder="Cari lowongan berdasarkan posisi atau perusahaan..."
                    className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  />
                  {trackerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTrackerSearchQuery('')}
                      aria-label="Hapus pencarian"
                      className="absolute right-2 min-w-[36px] min-h-[36px] rounded-[6px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {filteredTrackedJobs.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredTrackedJobs.map((job) => {
                      const isSelected = selectedTrackerJobId === job.id;
                      const s = (job.status || '').toUpperCase();
                      const stageBadgeClass = s.includes('OFFER') || s.includes('DITERIMA')
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : s.includes('INTERVIEW') || s.includes('WAWANCARA') || s.includes('TES')
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : s.includes('TOLAK') || s.includes('REJECT')
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';

                      return (
                        <div
                          key={job.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedTrackerJobId(job.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedTrackerJobId(job.id);
                            }
                          }}
                          className={`p-4 rounded-[10px] border transition cursor-pointer flex items-start justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                            isSelected
                              ? 'border-cobalt-500 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-cobalt-500 shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                                {job.position || 'Posisi Lowongan'}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold border ${stageBadgeClass}`}>
                                {job.status || 'Terkirim'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-cobalt-600 dark:text-blue-400 truncate">
                              {job.company_name || 'Nama Perusahaan'}
                            </p>
                            {(job.notes || job.qualifications) && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-[8px] border border-slate-200/60 dark:border-slate-700/60 font-sans">
                                {job.notes || job.qualifications}
                              </p>
                            )}
                          </div>

                          <div className="pt-0.5 shrink-0">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                              isSelected
                                ? 'border-cobalt-500 bg-cobalt-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                    <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {trackerSearchQuery ? 'Lowongan tidak ditemukan' : 'Belum ada lowongan di Tracker'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      {trackerSearchQuery
                        ? 'Coba kata kunci pencarian lain atau gunakan opsi "Tempel Syarat Lowongan".'
                        : 'Simpan lowongan di Tracker atau gunakan opsi "Tempel Syarat Lowongan" untuk menempel kualifikasi pekerjaan secara langsung.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="align-pos-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Posisi Sasaran:
                  </label>
                  <input
                    id="align-pos-input"
                    type="text"
                    value={alignManualPosition}
                    onChange={(e) => setAlignManualPosition(e.target.value)}
                    placeholder="cth. Social Media Specialist / Backend Engineer"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  />
                </div>

                <div>
                  <label htmlFor="align-comp-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Nama Perusahaan:
                  </label>
                  <input
                    id="align-comp-input"
                    type="text"
                    value={alignManualCompany}
                    onChange={(e) => setAlignManualCompany(e.target.value)}
                    placeholder="cth. PT Kreatif Nusantara"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  />
                </div>

                <div>
                  <label htmlFor="align-rec-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Nama HRD / Perekrut (Opsional):
                  </label>
                  <input
                    id="align-rec-input"
                    type="text"
                    value={alignManualRecruiter}
                    onChange={(e) => setAlignManualRecruiter(e.target.value)}
                    placeholder="cth. Ibu Anita / Tim Rekrutmen"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="align-jd-textarea" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Uraian Pekerjaan / Kualifikasi:
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            setManualJobText(text);
                            toast.success('Ditempel', 'Teks lowongan berhasil ditempel dari clipboard.');
                          }
                        } catch {
                          toast.info('Info', 'Gunakan pintasan Ctrl+V atau Paste untuk menempel teks.');
                        }
                      }}
                      className="text-[11px] font-bold text-cobalt-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tempel dari Clipboard</span>
                    </button>
                  </div>
                  <textarea
                    id="align-jd-textarea"
                    rows={6}
                    value={manualJobText}
                    onChange={(e) => setManualJobText(e.target.value)}
                    placeholder="Salin kualifikasi atau persyaratan dari LinkedIn, Jobstreet, atau situs perusahaan lalu tempel di sini..."
                    className="w-full p-3.5 rounded-[10px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 leading-relaxed font-sans"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Cukup salin poin-poin kualifikasi atau keahlian utama yang dibutuhkan lowongan.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-0 z-10">
            {(() => {
              const activeCv = userCvs.find((c) => c.id === singleForm.attachment_cv_id) || userCvs[0];
              const cvTitle = activeCv?.title || activeCv?.name || 'CV ATS Utama';
              const cvAts = activeCv?.atsScore || activeCv?.data?.atsScore || 85;
              return (
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-cobalt-500 dark:text-blue-400 shrink-0" />
                  <span className="truncate">
                    Basis CV: <strong className="text-slate-900 dark:text-white">{cvTitle}</strong> ({cvAts}%)
                  </span>
                </div>
              );
            })()}

            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAlignDrawerOpen(false)}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-[10px] font-bold text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleAlignJobAndCv}
                disabled={isAligning}
                className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                {isAligning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyelaraskan Surat...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Terapkan ke Surat Lamaran</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal Pemilih Draf Cepat */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-cobalt-500" />
                  Pilih Draf Surat Lamaran ({savedCoverLetters.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih draf yang tersimpan untuk dimuat ke komposer saat ini.
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup pemilih draf"
                onClick={() => setShowDraftModal(false)}
                className="w-8 h-8 rounded-[8px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 max-h-[60vh]">
              {savedCoverLetters.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-cobalt-500/60 transition cursor-pointer space-y-1.5"
                  onClick={() => {
                    setSingleForm((prev) => ({
                      ...prev,
                      company: l.company || prev.company,
                      position: l.position || prev.position,
                      to_name: l.recruiter || prev.to_name,
                      body_content: l.content,
                      custom_subject: `Lamaran Pekerjaan: ${l.position || 'Kandidat'} – ${l.company || 'Perusahaan'} – ${userName || 'Kandidat'}`,
                    }));
                    setShowDraftModal(false);
                    toast.success('Draf Dimuat', `Draf untuk ${l.company || 'posisi'} dimuat ke komposer.`);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {l.position || 'Surat Lamaran'} • <span className="text-cobalt-600 dark:text-blue-400">{l.company}</span>
                    </h4>
                    {l.updated_at && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(l.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {l.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="min-h-[38px] px-4 py-1.5 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
