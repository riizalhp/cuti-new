'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Search,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Database,
  Briefcase,
  Tag,
  Info,
  Code,
  Download,
  Layers,
  XCircle,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';
import { JOB_CLUSTERS } from '@/lib/job-clusters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/Toast';

interface DbJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  description: string;
  skills: string[];
  externalUrl: string;
  deadline: string | null;
  createdAt: string;
}

interface SyncStats {
  totalActive: number;
  totalInactive: number;
  scrapedActive: number;
  manualActive: number;
  lastSyncedAt: string | null;
  bySource: Array<{ source: string; count: number }>;
}

interface ContentStats {
  articles: number;
  certifications: number;
  events: number;
}

const presetKeywords = [
  'Barista',
  'Kasir',
  'Pramuniaga',
  'Admin',
  'Customer Service',
  'Operator Produksi',
  'Gudang',
  'Social Media',
  'Teknisi',
];

export const JobScraperView: React.FC = () => {
  // Data DB (audit)
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [sourceFilter] = useState('all');

  // Sync state — default string kosong = Mode Explore (Semua Lowongan Terbaru)
  const [keyword, setKeyword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const toast = useToast();

  const loadAuditData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [statsRes, jobsRes, contentRes] = await Promise.all([
        fetch('/api/job-sync').then((r) => r.json()),
        fetch('/api/jobs?limit=250').then((r) => r.json()),
        fetch('/api/content-sync').then((r) => r.json()),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (jobsRes.success) setJobs(jobsRes.data);
      if (contentRes.success) setContentStats(contentRes.stats);
    } catch {
      toast.error('Gagal Memuat Data', 'Tidak dapat mengambil data dari database.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAuditData(false);
  }, [loadAuditData]);

  const handleSync = async () => {
    if (isSyncing) return;
    const cleanKw = keyword.trim();
    const isExplore = !cleanKw;

    setIsSyncing(true);
    setSyncLogs([
      `[${new Date().toLocaleTimeString()}] 🌐 Memulai scrape ${
        isExplore ? 'mode "Semua Lowongan Terbaru (Explore)"' : `kata kunci "${cleanKw}"`
      } + sinkronisasi DB...`,
    ]);
    toast.info(
      'Sinkronisasi Dimulai',
      isExplore
        ? 'Scrape semua lowongan terbaru publik lalu simpan ke database.'
        : `Scrape lowongan "${cleanKw}" ke database.`
    );

    try {
      const res = await fetch('/api/job-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: cleanKw }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Sinkronisasi gagal.');

      setSyncLogs((prev) => [...(data.logs || []).reverse(), ...prev]);
      toast.success(
        'Sinkronisasi Selesai',
        `Selesai: ${data.created} baru, ${data.updated} diperbarui, ${data.deactivated} dinonaktifkan.`
      );
      await loadAuditData();
    } catch (error) {
      const err = error as Error;
      const ts = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [`[${ts}] 🚨 Gagal: ${err.message || 'Terjadi kesalahan.'}`, ...prev]);
      toast.error('Gagal Sinkronisasi', 'Terjadi kesalahan saat sinkronisasi lowongan.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncLogs([`[${new Date().toLocaleTimeString()}] 🔄 Refresh database — cek status lowongan tersimpan...`]);
    toast.info('Refresh Database', 'Cek status lowongan di database tanpa scrape ulang portal.');

    try {
      const res = await fetch('/api/scrape-jobs/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Refresh gagal.');

      setSyncLogs((prev) => [...(data.logs || []).reverse(), ...prev]);
      toast.success(
        'Refresh Selesai',
        `Refresh selesai: ${data.checked} dicek, ${data.deactivated} dinonaktifkan, ${data.logosProcessed || 0} logo diproses.`
      );
      await loadAuditData();
    } catch (error) {
      const err = error as Error;
      const ts = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [`[${ts}] 🚨 Gagal: ${err.message || 'Terjadi kesalahan.'}`, ...prev]);
      toast.error('Refresh Gagal', 'Gagal menjalankan refresh database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    if (!filteredJobs.length) {
      toast.warning('Data Kosong', 'Belum ada data untuk diunduh.');
      return;
    }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), jobs: filteredJobs }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-lowongan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Unduhan Berhasil', `Berhasil mengunduh ${filteredJobs.length} lowongan (JSON).`);
  };

  const filteredJobs = jobs.filter((job) => {
    if (sourceFilter !== 'all') {
      // Sumber portal tidak tersedia di endpoint /api/jobs saat ini; filter via pencarian teks
      if (!job.title.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 w-full pb-12">

      {/* Header */}
      <PageHeader
        title="Job Scraper & Sinkronisasi Loker"
        subtitle="Tarik dan sinkronkan lowongan kerja resmi dari berbagai portal mitra secara otomatis atau manual langsung ke database sistem."
        icon={Database}
        badge="Web Scraper Engine"
        stats={[
          {
            label: 'Lowongan Aktif',
            value: stats?.totalActive ?? '…',
            icon: Briefcase,
            colorClass: 'text-emerald-300',
            isPrimary: true,
          },
          {
            label: 'Hasil Scraping',
            value: stats?.scrapedActive ?? '…',
            icon: Globe,
            colorClass: 'text-indigo-300',
          },
          {
            label: 'Sinkron Terakhir',
            value: stats?.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Belum pernah',
            icon: Clock,
          },
        ]}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => { void loadAuditData(); }}
            disabled={isLoading}
            className="w-full sm:w-auto min-h-[40px] md:min-h-[34px] flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </Button>
        }
      />

      {/* Sync Panel + Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Sync trigger */}
        <div className="xl:col-span-7">
          <div className="glass-card p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>1. Mesin Penarik Lowongan (Web Scraper)</span>
                  </h3>
                  <p className="text-caption text-slate-500">
                    Konfigurasi kata kunci bot scraper untuk mengambil data langsung dari 24+ portal mitra.
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Banner Indicator */}
            {!keyword.trim() ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse motion-reduce:animate-none shrink-0" />
                  <span className="font-extrabold text-blue-900 dark:text-blue-200 text-xs">
                    Mode Aktif: Semua Lowongan Terbaru (Explore)
                  </span>
                </div>
                <span className="text-caption font-semibold text-blue-700 dark:text-blue-300 hidden sm:inline">
                  Menyisir seluruh feed 24+ portal publik
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                    Target Kata Kunci: <strong className="text-cobalt-500 dark:text-blue-400 font-extrabold">&ldquo;{keyword}&rdquo;</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="text-caption font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
                >
                  Reset ke Mode Explore
                </button>
              </div>
            )}

            {/* Input & Action Buttons */}
            <div className="space-y-1.5">
              <label className="block text-caption font-bold text-slate-700 dark:text-slate-300">
                Kata Kunci Scraper (Portal Luar):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Ketik profesi (contoh: Barista, Kasir, Admin, Gudang)..."
                    disabled={isSyncing}
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-slate-400" />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword('')}
                      disabled={isSyncing}
                      className="absolute right-2.5 top-2.5 p-0.5 text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded dark:text-slate-400"
                      title="Hapus kata kunci"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {/* Primary CTA Button: Scrape */}
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Scraping…</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>{!keyword.trim() ? 'Mulai Scrape (Semua Loker)' : `Mulai Scrape "${keyword}"`}</span>
                    </>
                  )}
                </Button>
                {/* Secondary Action: Refresh DB */}
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleRefresh}
                  disabled={isSyncing}
                  title="Cek status aktif/tutup data lowongan di database tanpa re-scrape portal luar"
                  className="whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500 dark:text-slate-400" />
                      <span>Refresh…</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>Refresh Status DB</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Klaster Kategori & Preset keywords */}
            <div className="space-y-3 pt-1">
              <div>
                <span className="text-caption font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  Klaster Profesi Siap Scrape:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tabs
                    value={
                      keyword === ''
                        ? 'explore'
                        : (JOB_CLUSTERS.find((c) =>
                            c.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase())
                          )?.id || '')
                    }
                    onValueChange={(val) => {
                      const cluster = JOB_CLUSTERS.find((c) => c.id === val);
                      if (cluster) {
                        setKeyword(cluster.keywords[0] || '');
                      }
                    }}
                  >
                    <TabsList variant="pill" className="flex-wrap bg-slate-100 dark:bg-slate-800/80 p-1">
                      {JOB_CLUSTERS.map((cluster) => (
                        <TabsTrigger
                          key={cluster.id}
                          size="xs"
                          value={cluster.id}
                          disabled={isSyncing}
                          title={cluster.description}
                          className="flex items-center gap-1 text-slate-600 dark:text-slate-300"
                        >
                          {cluster.id === 'explore' && <Globe className="w-3 h-3" />}
                          <span>{cluster.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Kata Kunci Spesifik */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-caption font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Kata Kunci Populer:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {presetKeywords.map((k) => (
                    <button
                      key={k}
                      type="button"
                      disabled={isSyncing}
                      onClick={() => setKeyword(k)}
                      className={`h-[30px] px-3 rounded-[8px] text-caption font-semibold transition cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                        keyword.toLowerCase() === k.toLowerCase()
                          ? 'bg-cobalt-500 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-caption text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
                <span>
                  <b>Mode Explore:</b> Tarik feed loker terbaru lintas bidang dari 24+ portal mitra.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <b>Refresh Status DB:</b> Perbarui status aktif loker tanpa menarik ulang portal mitra.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-violet-700 shrink-0 mt-0.5 dark:text-violet-400" />
                <span>
                  <b>Sinkronisasi Manual:</b> Penarikan dan sinkronisasi data dijalankan secara langsung via tombol di atas.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Console log + ringkasan sumber */}
        <div className="xl:col-span-5 space-y-4 flex flex-col">
          <div className="bg-slate-950 text-slate-200 border border-slate-800 p-6 rounded-[10px] flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs text-white">Konsol Log Scraper (Realtime)</h3>
              </div>
              {syncLogs.length > 0 && (
                <button onClick={() => setSyncLogs([])} className="text-caption text-slate-500 hover:text-slate-300 font-bold underline">
                  Bersihkan
                </button>
              )}
            </div>
            <div className="min-h-[160px] max-h-[220px] font-mono text-caption leading-relaxed overflow-y-auto my-3 space-y-1.5 p-3 bg-slate-900/80 border border-slate-900 rounded-[10px]">
              {syncLogs.length === 0 ? (
                <div className="text-slate-400 italic py-8 text-center flex flex-col items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" />
                  <span>Belum ada sinkronisasi manual pada sesi ini.</span>
                </div>
              ) : (
                syncLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`border-l-2 pl-2 ${
                      log.includes('✅')
                        ? 'border-emerald-500 text-emerald-400 font-bold'
                        : log.includes('🚨')
                        ? 'border-rose-500 text-rose-400'
                        : 'border-slate-700 text-slate-500'
                    } dark:text-slate-400`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ringkasan per sumber */}
          <div className="glass-card p-5 rounded-[10px] border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Lowongan Aktif per Sumber</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[130px] overflow-y-auto">
              {stats && stats.bySource.length > 0 ? (
                stats.bySource.map((s) => (
                  <span
                    key={s.source}
                    className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {s.source}: {s.count}
                  </span>
                ))
              ) : (
                <span className="text-caption text-slate-500">Belum ada data sumber.</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-caption">
              <div className="flex items-center gap-1.5 text-slate-500">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{stats?.totalInactive ?? 0} lowongan nonaktif (tutup)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{stats?.manualActive ?? 0} lowongan manual admin</span>
              </div>
            </div>
          </div>

          {/* Konten: artikel / event / sertifikasi */}
          <div className="glass-card p-5 rounded-[10px] border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-violet-700 dark:text-violet-400" />
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Konten Tersimpan (DB)</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base font-black text-slate-900 dark:text-white block">{contentStats?.articles ?? '…'}</span>
                <span className="text-caption font-bold text-slate-500 uppercase dark:text-slate-400">Artikel</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base font-black text-slate-900 dark:text-white block">{contentStats?.events ?? '…'}</span>
                <span className="text-caption font-bold text-slate-500 uppercase dark:text-slate-400">Event</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base font-black text-slate-900 dark:text-white block">{contentStats?.certifications ?? '…'}</span>
                <span className="text-caption font-bold text-slate-500 uppercase dark:text-slate-400">Sertifikasi</span>
              </div>
            </div>
            <p className="text-caption text-slate-500 mt-2.5 leading-relaxed dark:text-slate-400">
              Artikel & sertifikasi disinkronkan langsung via tombol sinkronisasi. Scraper event menyusul (sumber SPA).
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Lowongan Tersimpan */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>2. Database Lowongan Tersimpan</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-blue-100 dark:bg-blue-950 text-navy-700 dark:text-blue-300">
              {filteredJobs.length} Lowongan
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                aria-label="Filter data lowongan tersimpan"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter data tersimpan..."
                className="pl-8 pr-8 py-2 h-9 text-xs rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 w-56 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500 dark:text-slate-400" />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-2 h-7 w-7 min-h-[28px] min-w-[28px] rounded-[6px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 dark:text-slate-400 flex items-center justify-center cursor-pointer"
                  title="Hapus filter"
                  aria-label="Hapus filter lowongan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredJobs.length === 0}
              className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh JSON</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-5 rounded-[10px] animate-pulse motion-reduce:animate-none space-y-3">
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center text-slate-500 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-500 mx-auto dark:text-slate-400" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Belum ada lowongan tersimpan di database.
              </p>
              <p className="text-xs">Jalankan sinkronisasi manual untuk memperbarui database lowongan.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="glass-card p-5 rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 hover:border-navy-800 dark:hover:border-navy-800 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      DB Tersimpan
                    </span>
                    <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Aktif
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 dark:text-slate-400" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0 dark:text-emerald-400" />
                      <span className="truncate">{job.salary}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <span className="text-caption text-slate-500 font-medium dark:text-slate-400">{job.postedDate}</span>
                  {job.externalUrl ? (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-bold text-blue-600 dark:text-blue-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1 text-caption min-h-[32px] px-3 py-1.5 rounded-[6px] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    >
                      <span>Sumber Asli</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-caption text-slate-500 dark:text-slate-400">Tanpa link</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
