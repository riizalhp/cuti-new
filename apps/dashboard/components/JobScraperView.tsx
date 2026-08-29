'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Search,
  MapPin,
  Building2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Check,
  Plus,
  Bookmark,
  Share2,
  Database,
  Filter,
  Download,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Tag,
  ShieldCheck,
  Code,
  Info,
  LogIn,
  LogOut
} from 'lucide-react';

export interface ExtractedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  portal: 'LinkedIn' | 'Jobstreet' | 'Glints' | 'Dealls' | 'Talent' | 'Kalibrr' | 'Jobindo' | 'Jora' | 'Jobinaja' | 'Lokernas' | 'OfficialKarir' | 'LogKerja' | 'Indeed' | 'Loker.id' | 'Jooble' | 'CakeResume' | 'Karir.com' | 'KitaLulus' | 'LokerHeadOffice' | 'SejakKemarin' | 'LamarLangsung' | 'InfoLokerKerja' | 'SolusiKerja' | 'BursaKerjaDepnaker' | 'LokerAnakMedan' | 'InfoLokerJabar' | 'InfoLokerBanten' | 'InfoLokerKarawang' | 'LokerMuslim' | 'LowkerJogja';
  portalUrl: string;
  jobType: 'Full-time' | 'Contract' | 'Internship' | 'Remote';
  experience: 'Entry-level' | 'Junior' | 'Mid-Senior' | 'Senior';
  postedTime: string;
  extractedTime: string;
  matchScore: number;
  description: string;
  requirements: string[];
  skills: string[];
  isSaved?: boolean;
}

// Hasil lowongan ditampilkan dari scraping asli (lihat lib/job-scraper.ts).
// LinkedIn butuh sesi login pengguna sendiri (lihat fitur /linkedin); portal
// lain yang berstatus "Perlu Login" (atau diblokir anti-bot seperti Cloudflare)
// memerlukan sesi/JS dan sengaja tidak di-bypass sesuai batasan platform.

interface PortalOption {
  id: 'LinkedIn' | 'Jobstreet' | 'Glints' | 'Dealls' | 'Talent' | 'Kalibrr' | 'Jobindo' | 'Jora' | 'Jobinaja' | 'Lokernas' | 'OfficialKarir' | 'LogKerja' | 'Indeed' | 'Loker.id' | 'Jooble' | 'CakeResume' | 'Karir.com' | 'KitaLulus' | 'LokerHeadOffice' | 'SejakKemarin' | 'LamarLangsung' | 'InfoLokerKerja' | 'SolusiKerja' | 'BursaKerjaDepnaker' | 'LokerAnakMedan' | 'InfoLokerJabar' | 'InfoLokerBanten' | 'InfoLokerKarawang' | 'LokerMuslim' | 'LowkerJogja' | 'KarirHub';
  name: string;
  activeCount: number;
  status: 'Aktif' | 'Sesi' | 'Perlu Login';
}

const portalsList: PortalOption[] = [
  { id: 'Jobstreet', name: 'JobStreet', activeCount: 1420, status: 'Aktif' },
  { id: 'Glints', name: 'Glints', activeCount: 750, status: 'Aktif' },
  { id: 'Dealls', name: 'Dealls', activeCount: 350, status: 'Aktif' },
  { id: 'Talent', name: 'Talent.com', activeCount: 480, status: 'Aktif' },
  { id: 'LinkedIn', name: 'LinkedIn', activeCount: 980, status: 'Aktif' },
  { id: 'Kalibrr', name: 'Kalibrr', activeCount: 1130, status: 'Aktif' },
  { id: 'Jobindo', name: 'Jobindo.com', activeCount: 960, status: 'Aktif' },
  { id: 'Jora', name: 'Jora', activeCount: 700, status: 'Aktif' },
  { id: 'Jobinaja', name: 'Jobinaja', activeCount: 750, status: 'Aktif' },
  { id: 'Lokernas', name: 'Lokernas', activeCount: 420, status: 'Aktif' },
  { id: 'OfficialKarir', name: 'OfficialKarir', activeCount: 390, status: 'Aktif' },
  { id: 'LogKerja', name: 'LogKerja', activeCount: 180, status: 'Aktif' },
  { id: 'LokerHeadOffice', name: 'Loker HeadOffice', activeCount: 260, status: 'Aktif' },
  { id: 'SejakKemarin', name: 'SejakKemarin', activeCount: 320, status: 'Aktif' },
  { id: 'LamarLangsung', name: 'LamarLangsung', activeCount: 400, status: 'Aktif' },
  { id: 'InfoLokerKerja', name: 'InfoLokerKerja', activeCount: 280, status: 'Aktif' },
  { id: 'SolusiKerja', name: 'SolusiKerja', activeCount: 150, status: 'Aktif' },
  { id: 'BursaKerjaDepnaker', name: 'BursaKerjaDepnaker', activeCount: 230, status: 'Aktif' },
  { id: 'LokerAnakMedan', name: 'Loker Anak Medan', activeCount: 190, status: 'Aktif' },
  { id: 'InfoLokerJabar', name: 'Info Loker Jabar', activeCount: 210, status: 'Aktif' },
  { id: 'InfoLokerBanten', name: 'Info Loker Banten', activeCount: 180, status: 'Aktif' },
  { id: 'InfoLokerKarawang', name: 'Info Loker Karawang', activeCount: 170, status: 'Aktif' },
  { id: 'LokerMuslim', name: 'LokerMuslim', activeCount: 140, status: 'Aktif' },
  { id: 'LowkerJogja', name: 'Lowker Jogja', activeCount: 120, status: 'Aktif' },
  { id: 'KitaLulus', name: 'KitaLulus', activeCount: 620, status: 'Sesi' },
  { id: 'Karir.com', name: 'Karir.com', activeCount: 310, status: 'Sesi' },
  { id: 'Indeed', name: 'Indeed', activeCount: 1250, status: 'Sesi' },
  { id: 'CakeResume', name: 'Cake (CakeResume)', activeCount: 540, status: 'Sesi' },
  { id: 'Jooble', name: 'Jooble', activeCount: 870, status: 'Sesi' },
  { id: 'Loker.id', name: 'Loker.id', activeCount: 420, status: 'Sesi' },
  { id: 'KarirHub', name: 'KarirHub', activeCount: 380, status: 'Perlu Login' },
];

// Warna badge per portal (lihat kartu hasil scraping)
const PORTAL_BADGE_CLASS: Record<string, string> = {
  LinkedIn: 'bg-blue-100 dark:bg-blue-950 text-navy-700 dark:text-blue-300 border border-blue-200 dark:border-navy-800',
  Jobstreet: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  Glints: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  Dealls: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  Kalibrr: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  Jobindo: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
  LokerHeadOffice: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
  SejakKemarin: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
  LamarLangsung: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800',
  InfoLokerKerja: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
  SolusiKerja: 'bg-lime-100 dark:bg-lime-950 text-lime-700 dark:text-lime-300 border border-lime-200 dark:border-lime-800',
  BursaKerjaDepnaker: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  LokerAnakMedan: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
  InfoLokerJabar: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
  InfoLokerBanten: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
  InfoLokerKarawang: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  LokerMuslim: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
  LowkerJogja: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  Jora: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  Jobinaja: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  Lokernas: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
  OfficialKarir: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  LogKerja: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
  Indeed: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  'Loker.id': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
  Jooble: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  CakeResume: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800',
  'Karir.com': 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  KitaLulus: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
};

const presetSearchKeywords = [
  'Frontend React',
  'Data Entry',
  'Digital Marketing',
  'Admin Staff',
  'Customer Service',
  'Graphic Designer',
];

export const JobScraperView: React.FC = () => {
  // Filter & Form States
  const [keyword, setKeyword] = useState('Frontend Developer');
  const [location, setLocation] = useState('Jakarta (Hybrid/Remote)');
  const [experience, setExperience] = useState('all');
  const [postedDate, setPostedDate] = useState('24h');
  const [selectedPortals, setSelectedPortals] = useState<string[]>([
    'Jobstreet', 'Glints', 'Dealls', 'Talent', 'Kalibrr', 'Jobindo',
    'Jora', 'Jobinaja', 'Lokernas', 'OfficialKarir', 'LogKerja',
    'LokerHeadOffice', 'SejakKemarin', 'LamarLangsung', 'InfoLokerKerja', 'SolusiKerja',
    'BursaKerjaDepnaker', 'LokerAnakMedan', 'InfoLokerJabar', 'InfoLokerBanten',
    'InfoLokerKarawang', 'LokerMuslim', 'LowkerJogja',
  ]);
  
  // Extraction State & Log Simulation
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<ExtractedJob[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Drawer States
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<ExtractedJob | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log output
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleToggleScan = async () => {
    if (isScanning) {
      setIsScanning(false);
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [`[${timestamp}] ⏹️ Sesi pemindaian lowongan dihentikan.`, ...prev]);
      showToast('Sesi pemindaian dihentikan.');
      return;
    }

    if (!keyword.trim()) {
      showToast('Masukkan posisi atau kata kunci pekerjaan.');
      return;
    }

    setIsScanning(true);
    const now = new Date().toLocaleTimeString();
    setLogs((prev) => [
      `[${now}] 🌐 Menginisialisasi bot scraper lowongan kerja...`,
      `[${now}] 🔍 Menghubungkan ke halaman publik ${selectedPortals.join(', ')}...`,
      ...prev,
    ]);
    showToast('Pemindaian lowongan kerja dimulai secara real-time.');

    try {
      const res = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location, portals: selectedPortals }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Bot scraping gagal.');
      }

      // Tampilkan log asli dari server (terbaru di paling atas)
      setLogs((prev) => [...(data.logs || []).reverse(), ...prev]);

      // Merge hasil scraping asli + deduplikasi dengan job yang sudah ada
      const scrapedJobs: ExtractedJob[] = data.jobs || [];
      setJobs((prev) => {
        const seenIds = new Set(prev.map((j) => j.id));
        const fresh = scrapedJobs.filter((j) => !seenIds.has(j.id));
        return [...fresh, ...prev];
      });

      showToast(`Bot scraping selesai: ${scrapedJobs.length} lowongan baru berhasil diekstrak.`);
    } catch (error: any) {
      const ts = new Date().toLocaleTimeString();
      setLogs((prev) => [`[${ts}] 🚨 Gagal scraping: ${error.message || 'Terjadi kesalahan.'}`, ...prev]);
      showToast('Gagal melakukan scraping. Periksa koneksi internet.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleTogglePortal = (portalId: string) => {
    if (selectedPortals.includes(portalId)) {
      if (selectedPortals.length === 1) {
        showToast('Pilih minimal 1 portal sumber lowongan.');
        return;
      }
      setSelectedPortals(selectedPortals.filter((p) => p !== portalId));
    } else {
      setSelectedPortals([...selectedPortals, portalId]);
    }
  };

  // --- Sesi login portal browser (pola LinkedIn: user login manual di Chrome) ---
  const [sessionStatus, setSessionStatus] = useState<Record<string, boolean>>({});
  const [loggingInPortal, setLoggingInPortal] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portal-session')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.portals)) {
          setSessionStatus(Object.fromEntries(d.portals.map((p: any) => [p.portal, !!p.hasSession])));
        }
      })
      .catch(() => null);
  }, []);

  const handleLoginPortal = async (portalId: string) => {
    if (loggingInPortal) return;
    setLoggingInPortal(portalId);
    showToast('Browser login dibuka. Silakan login secara manual — sesi akan tersimpan otomatis setelah selesai.');
    try {
      const res = await fetch('/api/portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', portal: portalId }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionStatus((prev) => ({ ...prev, [portalId]: true }));
        setSelectedPortals((prev) => (prev.includes(portalId) ? prev : [...prev, portalId]));
        showToast(`Login ${portalId} berhasil. Sesi tersimpan — portal siap dipindai.`);
      } else {
        showToast(data.error || `Login ${portalId} gagal.`);
      }
    } catch {
      showToast(`Gagal menghubungi server untuk login ${portalId}.`);
    } finally {
      setLoggingInPortal(null);
    }
  };

  const handleClearPortalSession = async (portalId: string) => {
    try {
      await fetch('/api/portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', portal: portalId }),
      });
      setSessionStatus((prev) => ({ ...prev, [portalId]: false }));
      showToast(`Sesi ${portalId} dihapus.`);
    } catch {
      showToast(`Gagal menghapus sesi ${portalId}.`);
    }
  };



  const handleToggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const nextSaved = !j.isSaved;
          showToast(nextSaved ? 'Lowongan berhasil disimpan ke Tracker Lamaran!' : 'Lowongan dihapus dari tersimpan.');
          return { ...j, isSaved: nextSaved };
        }
        return j;
      })
    );

    if (selectedJobForDetail && selectedJobForDetail.id === jobId) {
      setSelectedJobForDetail((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  const handleDownload = () => {
    if (filteredJobs.length === 0) {
      showToast('Belum ada hasil scraping untuk diunduh.');
      return;
    }
    const payload = {
      meta: {
        keyword,
        location,
        portals: selectedPortals,
        scrapedAt: new Date().toISOString(),
        total: filteredJobs.length,
        note: 'Data diambil dari halaman publik portal (tanpa bypass login/CAPTCHA).',
      },
      jobs: filteredJobs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasil-scraping-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Berhasil mengunduh ${filteredJobs.length} lowongan hasil scraping (JSON).`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'saved' && !job.isSaved) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.portal.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 w-full pb-12">
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-[10px] shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Header */}
      <PageHeader
        title="Pemindai Lowongan Kerja"
        subtitle="Dapatkan informasi lowongan kerja aktif dari portal karir Indonesia terhubung secara otomatis dengan skor kepantasan CV."
        icon={Globe}
        badge="Job Scraper"
        stats={[
          {
            label: 'Status System',
            value: isScanning ? 'Memindai...' : 'Siaga',
            icon: RefreshCw,
            colorClass: isScanning ? 'text-amber-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: 'Portal Terkonek',
            value: `${portalsList.filter((p) => p.status === 'Aktif').length} Portal`,
            icon: Layers,
            colorClass: 'text-indigo-600 dark:text-indigo-400',
          },
          {
            label: 'Loker Ditemukan',
            value: jobs.length,
            icon: Briefcase,
          },
        ]}
      />

      {/* Main Control & Realtime Logs (Bento Grid 12 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Form & Configuration (7-cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Konfigurasi Pemindaian Lowongan
                  </h3>
                  <p className="text-[11px] text-slate-500">Tentukan kata kunci, wilayah, dan sumber portal penyedia loker</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="px-3 py-1.5 rounded-[10px] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                <span>Filter Lanjutan</span>
              </button>
            </div>

            {/* Input Job Title & Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Kata Kunci / Posisi Pekerjaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Contoh: Frontend Developer, Admin Perkantoran, Data Analyst"
                  disabled={isScanning}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>

              {/* Quick Preset Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Rekomendasi:</span>
                {presetSearchKeywords.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={isScanning}
                    onClick={() => setKeyword(preset)}
                    className={`px-2.5 py-1 rounded-[10px] text-[10px] font-bold transition ${
                      keyword === preset
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Experience Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Wilayah / Lokasi Kerja
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Jakarta (Hybrid), Remote"
                    disabled={isScanning}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
                  />
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Waktu Publikasi
                </label>
                <div className="relative">
                  <select
                    value={postedDate}
                    onChange={(e) => setPostedDate(e.target.value)}
                    disabled={isScanning}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 appearance-none transition"
                  >
                    <option value="24h">24 Jam Terakhir</option>
                    <option value="3d">3 Hari Terakhir</option>
                    <option value="7d">1 Minggu Terakhir</option>
                    <option value="all">Semua Waktu</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Portal Selection Chips */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Portal Penyedia Lowongan
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  {selectedPortals.length} portal dipilih
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {portalsList.map((portal) => {
                  const isSelected = selectedPortals.includes(portal.id);
                  const isLocked = portal.status === 'Perlu Login';
                  const isSessionPortal = portal.status === 'Sesi';
                  const hasSession = !!sessionStatus[portal.id];
                  const isLoggingIn = loggingInPortal === portal.id;
                  return (
                    <div
                      key={portal.id}
                      role="button"
                      tabIndex={isScanning || isLocked ? -1 : 0}
                      onClick={() => !isScanning && !isLocked && handleTogglePortal(portal.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isScanning && !isLocked) handleTogglePortal(portal.id);
                      }}
                      title={
                        isLocked
                          ? 'Perlu sesi login pengguna — bot tidak mem-bypass autentikasi'
                          : isSessionPortal && !hasSession
                          ? 'Portal butuh browser + sesi login Anda (pola LinkedIn). Klik tombol Login dulu, atau pilih untuk dicoba tanpa sesi.'
                          : undefined
                      }
                      className={`p-3 rounded-[10px] border text-left transition flex flex-col justify-between ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                        isSelected
                          ? 'border-navy-600 bg-blue-500/10 text-slate-900 dark:text-white ring-1 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-1.5">
                        <span className="text-xs font-black truncate">{portal.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isSessionPortal && hasSession && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearPortalSession(portal.id);
                              }}
                              title="Hapus sesi login portal ini"
                              className="p-1 rounded-[10px] text-emerald-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            >
                              <LogOut className="w-3 h-3" />
                            </button>
                          )}
                          {isSelected && (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full mt-2 text-[9px]">
                        <span className="text-slate-400 font-medium truncate">
                          {isLocked ? 'Perlu sesi login' : isSessionPortal ? (hasSession ? 'Sesi login aktif' : `${portal.activeCount}+ loker`) : `${portal.activeCount}+ loker`}
                        </span>
                        <span className={`font-extrabold uppercase shrink-0 ${isLocked ? 'text-amber-500 dark:text-amber-400' : isSessionPortal ? (hasSession ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400') : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isLocked ? 'Perlu Login' : isSessionPortal ? (hasSession ? 'Sesi Aktif' : 'Perlu Sesi') : 'Aktif'}
                        </span>
                      </div>
                      {isSessionPortal && !hasSession && (
                        <button
                          type="button"
                          disabled={isScanning || isLoggingIn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoginPortal(portal.id);
                          }}
                          className="mt-2 w-full px-2 py-1 rounded-[10px] text-[9px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          {isLoggingIn ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" /> Menunggu Login...
                            </>
                          ) : (
                            <>
                              <LogIn className="w-3 h-3" /> Login {portal.name}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit / Trigger Button */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Format data terverifikasi dan aman dari duplikasi.</span>
              </div>

              <button
                type="button"
                onClick={handleToggleScan}
                className={`px-6 py-3 rounded-[10px] font-extrabold text-xs transition duration-200 shadow-md flex items-center gap-2 cursor-pointer ${
                  isScanning
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-[#1738D1]/20'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Hentikan Pemindaian</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Mulai Pindai Lowongan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Console Log Terminal & Quick Stats (5-cols) */}
        <div className="xl:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Terminal Console Card */}
          <div className="glass-card bg-slate-950 text-slate-200 border border-slate-800 p-6 rounded-[10px] flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs text-white">Console Log Pemindaian (Real-time)</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-[10px] flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  LIVE
                </span>
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-bold underline"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 min-h-[260px] max-h-[300px] font-mono text-[10px] leading-relaxed overflow-y-auto my-3 space-y-1.5 p-3 bg-slate-900/80 border border-slate-900 rounded-[10px] no-scrollbar flex flex-col-reverse">
              <div ref={consoleEndRef} />
              {logs.length === 0 ? (
                <div className="text-slate-500 italic py-12 text-center flex flex-col items-center justify-center gap-2">
                  <Info className="w-6 h-6 text-slate-600" />
                  <span>Klik tombol &quot;Mulai Pindai Lowongan&quot; untuk mengaktifkan pemindaian data secara langsung.</span>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`border-l-2 pl-2 transition-all ${
                      log.includes('✅')
                        ? 'border-emerald-500 text-emerald-400 font-bold'
                        : log.includes('🚨')
                        ? 'border-rose-500 text-rose-400'
                        : log.includes('🔍') || log.includes('⚡')
                        ? 'border-blue-400 text-blue-300'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Skor Match CV dihitung otomatis sesuai dengan kualifikasi deskripsi kerja.</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Bento Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-[10px] border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Lowongan Hasil Pindai</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{jobs.length} Loker</span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-[10px] border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Disimpan ke Tracker</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {jobs.filter((j) => j.isSaved).length} Loker
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Extracted Jobs List Section */}
      <div className="space-y-4 pt-4">
        {/* Section Header with Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Daftar Lowongan Hasil Pemindaian</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-blue-100 dark:bg-blue-950 text-navy-700 dark:text-blue-300">
              {filteredJobs.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-[10px]">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua Lowongan
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tersimpan ({jobs.filter((j) => j.isSaved).length})</span>
              </button>
            </div>

            {/* Quick Search in Results */}
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari lowongan / perusahaan..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Download JSON */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isScanning || filteredJobs.length === 0}
              className="px-3.5 py-1.5 rounded-[10px] border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh JSON</span>
            </button>
          </div>
        </div>

        {/* Extracted Jobs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center text-slate-500 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Tidak ada lowongan ditemukan.</p>
              <p className="text-xs">Coba sesuaikan kata kunci pemindaian atau ubah tab filter ke &quot;Semua Lowongan&quot;.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJobForDetail(job)}
                className="glass-card p-5 rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 hover:border-navy-800 dark:hover:border-navy-800 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
              >
                <div className="space-y-3">
                  {/* Top Badges (Portal & Match Score) */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase ${PORTAL_BADGE_CLASS[job.portal] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                      {job.portal}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Match: {job.matchScore}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveJob(job.id, e)}
                        title={job.isSaved ? 'Hapus dari Tersimpan' : 'Simpan ke Tracker'}
                        className={`p-1.5 rounded-[10px] transition ${
                          job.isSaved
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Job Title & Company */}
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>

                  {/* Meta Details (Location, Salary) */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {/* Required Skills Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-[10px] text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">Diposting {job.postedTime}</span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJobForDetail(job);
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-orange-600 flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Detail Loker</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right-Hand Slide-in Drawer: Job Detail Drawer */}
      {selectedJobForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedJobForDetail(null)}
          />
          <div className="relative z-10 w-full max-w-lg sm:max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-navy-700 dark:text-blue-300 uppercase">
                    {selectedJobForDetail.portal}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Match: {selectedJobForDetail.matchScore}%
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {selectedJobForDetail.title}
                </h3>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedJobForDetail.company}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedJobForDetail(null)}
                className="p-2 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Meta Summary Cards */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-[10px] border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Lokasi Kerja</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {selectedJobForDetail.location}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimasi Gaji</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {selectedJobForDetail.salary}
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" /> Deskripsi Pekerjaan Ekstraksi
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-900/50 p-3.5 rounded-[10px] border border-slate-200/60 dark:border-slate-800">
                  {selectedJobForDetail.description}
                </p>
              </div>

              {/* Requirements Section */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kualifikasi &amp; Persyaratan
                </h4>
                <ul className="space-y-2">
                  {selectedJobForDetail.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-orange-500" /> Keahlian &amp; Keyword Kunci
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobForDetail.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-[10px] text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-navy-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleSaveJob(selectedJobForDetail.id)}
                className={`px-4 py-2.5 rounded-[10px] font-bold text-xs transition border flex items-center gap-1.5 ${
                  selectedJobForDetail.isSaved
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
                <span>{selectedJobForDetail.isSaved ? 'Tersimpan di Tracker' : 'Simpan ke Tracker'}</span>
              </button>

              <a
                href={selectedJobForDetail.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-[10px] font-extrabold text-xs bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-md shadow-[#1738D1]/20 transition flex items-center gap-1.5"
              >
                <span>Buka Lowongan Asli</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Right-Hand Slide-in Drawer: Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                <span>Parameter Ekstraksi Lanjutan</span>
              </h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Tipe Pekerjaan</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Full-time', 'Contract', 'Internship', 'Remote'].map((type) => (
                    <label key={type} className="flex items-center gap-2 p-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="checkbox" defaultChecked className="rounded-[10px] text-blue-600 focus:ring-blue-500" />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Rentang Gaji Minimum (per bulan)</label>
                <select className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <option value="0">Semua Rentang Gaji</option>
                  <option value="3000000">&gt; Rp 3.000.000</option>
                  <option value="5000000">&gt; Rp 5.000.000</option>
                  <option value="8000000">&gt; Rp 8.000.000</option>
                  <option value="12000000">&gt; Rp 12.000.000</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Kata Kunci Dikecualikan (Exclusion)</label>
                <input
                  type="text"
                  placeholder="Contoh: Unpaid, MLM, Sales Canvas"
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="px-4 py-2.5 rounded-[10px] font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
              >
                Terapkan Parameter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
