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
} from 'lucide-react';
import { JOB_CLUSTERS } from '@/lib/job-clusters';

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

interface SyncResult {
  totalScraped: number;
  created: number;
  updated: number;
  deactivated: number;
  failed: number;
  logs: string[];
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
  const [sourceFilter, setSourceFilter] = useState('all');

  // Sync state — default string kosong = Mode Explore (Semua Lowongan Terbaru)
  const [keyword, setKeyword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAuditData = useCallback(async () => {
    setIsLoading(true);
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
      showToast('Gagal memuat data dari database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditData();
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
    showToast(
      isExplore
        ? 'Sinkronisasi Explore dimulai — scrape semua lowongan terbaru publik lalu simpan ke DB.'
        : `Sinkronisasi dimulai — scrape lowongan "${cleanKw}" ke DB.`
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
      showToast(
        `Selesai: ${data.created} baru, ${data.updated} diperbarui, ${data.deactivated} dinonaktifkan.`
      );
      await loadAuditData();
    } catch (error: any) {
      const ts = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [`[${ts}] 🚨 Gagal: ${error.message || 'Terjadi kesalahan.'}`, ...prev]);
      showToast('Gagal menjalankan sinkronisasi.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncLogs([`[${new Date().toLocaleTimeString()}] 🔄 Refresh database — cek status lowongan tersimpan...`]);
    showToast('Refresh dimulai — cek status lowongan di database tanpa scrape ulang portal.');

    try {
      const res = await fetch('/api/scrape-jobs/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Refresh gagal.');

      setSyncLogs((prev) => [...(data.logs || []).reverse(), ...prev]);
      showToast(
        `Refresh selesai: ${data.checked} dicek, ${data.deactivated} dinonaktifkan, ${data.logosProcessed || 0} logo diproses.`
      );
      await loadAuditData();
    } catch (error: any) {
      const ts = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [`[${ts}] 🚨 Gagal: ${error.message || 'Terjadi kesalahan.'}`, ...prev]);
      showToast('Gagal menjalankan refresh database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    if (!filteredJobs.length) {
      showToast('Belum ada data untuk diunduh.');
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
    showToast(`Berhasil mengunduh ${filteredJobs.length} lowongan (JSON).`);
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
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-[10px] shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Audit Lowongan Tersimpan"
        subtitle="Data lowongan aktif di database system — hasil scraping harian otomatis (cron 01.00 WIB) yang tersimpan sampai lowongan tutup."
        icon={Database}
        badge="Job Scraper"
        stats={[
          {
            label: 'Lowongan Aktif',
            value: stats?.totalActive ?? '…',
            icon: Briefcase,
            colorClass: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: 'Hasil Scraping',
            value: stats?.scrapedActive ?? '…',
            icon: Globe,
            colorClass: 'text-indigo-600 dark:text-indigo-400',
          },
          {
            label: 'Sinkron Terakhir',
            value: stats?.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Belum pernah',
            icon: Clock,
          },
        ]}
        actions={
          <button
            type="button"
            onClick={loadAuditData}
            disabled={isLoading}
            className="px-4 py-2 rounded-[10px] font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 border-0 bg-slate-900 hover:bg-slate-700 text-white shadow-md disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        }
      />

      {/* Sync Panel + Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Sync trigger */}
        <div className="xl:col-span-7">
          <div className="glass-card p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
              <div className="w-8 h-8 rounded-[10px] bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Sinkronisasi Manual
                </h3>
                <p className="text-[11px] text-slate-500">
                  Scrape semua portal publik lalu simpan ke DB — dedupe otomatis, lowongan tutup auto-dinonaktifkan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Kosongkan untuk SEMUA lowongan terbaru, atau ketik: Barista, Kasir, Admin..."
                  disabled={isSyncing}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-[10px] font-extrabold text-xs bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scraping…</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>{!keyword.trim() ? 'Scrape Semua (Explore)' : `Scrape "${keyword}"`}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-[10px] font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Refresh…</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Refresh DB</span>
                  </>
                )}
              </button>
            </div>

            {/* Klaster Kategori & Preset keywords */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Klaster:
                </span>
                {JOB_CLUSTERS.map((cluster) => {
                  const isActive =
                    cluster.id === 'explore'
                      ? keyword === ''
                      : cluster.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase());
                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      disabled={isSyncing}
                      onClick={() => setKeyword(cluster.keywords[0] || '')}
                      title={cluster.description}
                      className={`px-2.5 py-1 rounded-[10px] text-[10px] font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#1738D1] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cluster.name}
                    </button>
                  );
                })}
              </div>

              {/* Kata Kunci Spesifik */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                  Kata Kunci:
                </span>
                {presetKeywords.map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={isSyncing}
                    onClick={() => setKeyword(k)}
                    className={`px-2 py-0.5 rounded-[8px] text-[10px] font-semibold transition cursor-pointer ${
                      keyword.toLowerCase() === k.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <b>Mode Explore (Semua Terbaru):</b> Kosongkan kolom kata kunci untuk meraup seluruh feed lowongan terbaru (lintas semua bidang: Barista, Kasir, Admin, Gudang, dll.) dari 24+ portal publik.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <b>Refresh DB:</b> Cek status lowongan yang sudah tersimpan tanpa scrape ulang portal (lebih cepat).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                <span>
                  <b>Cron Otomatis:</b> Scrape harian jam 01.00 WIB menjalankan <b>Mode Explore</b> diikuti klaster profesi lengkap (Barista, Kasir, Pramuniaga, Admin, Gudang, dll.).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Console log + ringkasan sumber */}
        <div className="xl:col-span-5 space-y-4 flex flex-col">
          <div className="glass-card bg-slate-950 text-slate-200 border border-slate-800 p-6 rounded-[10px] flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs text-white">Log Sinkronisasi</h3>
              </div>
              {syncLogs.length > 0 && (
                <button onClick={() => setSyncLogs([])} className="text-[9px] text-slate-500 hover:text-slate-300 font-bold underline">
                  Bersihkan
                </button>
              )}
            </div>
            <div className="min-h-[160px] max-h-[220px] font-mono text-[10px] leading-relaxed overflow-y-auto my-3 space-y-1.5 p-3 bg-slate-900/80 border border-slate-900 rounded-[10px]">
              {syncLogs.length === 0 ? (
                <div className="text-slate-500 italic py-8 text-center flex flex-col items-center gap-2">
                  <Info className="w-5 h-5 text-slate-600" />
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
                        : 'border-slate-700 text-slate-400'
                    }`}
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
                    className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {s.source}: {s.count}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500">Belum ada data sumber.</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{stats?.totalInactive ?? 0} lowongan nonaktif (tutup)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                <span>{stats?.manualActive ?? 0} lowongan manual admin</span>
              </div>
            </div>
          </div>

          {/* Konten: artikel / event / sertifikasi */}
          <div className="glass-card p-5 rounded-[10px] border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-violet-500" />
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Konten Tersimpan (DB)</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base font-black text-slate-900 dark:text-white block">{contentStats?.articles ?? '…'}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Artikel</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base font-black text-slate-900 dark:text-white block">{contentStats?.events ?? '…'}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Event</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base font-black text-slate-900 dark:text-white block">{contentStats?.certifications ?? '…'}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Sertifikasi</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2.5 leading-relaxed">
              Artikel & sertifikasi ikut disinkronkan cron harian 01.00 WIB. Scraper event menyusul (sumber SPA).
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
              <span>Lowongan Tersimpan di Database</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-blue-100 dark:bg-blue-950 text-navy-700 dark:text-blue-300">
              {filteredJobs.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari lowongan / perusahaan / lokasi..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={filteredJobs.length === 0}
              className="px-3.5 py-1.5 rounded-[10px] border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh JSON</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-5 rounded-[10px] animate-pulse space-y-3">
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center text-slate-500 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Belum ada lowongan tersimpan di database.
              </p>
              <p className="text-xs">Jalankan sinkronisasi manual, atau tunggu cron harian jam 01.00 WIB.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="glass-card p-5 rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 hover:border-navy-800 dark:hover:border-navy-800 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      DB
                    </span>
                    <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
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
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{job.salary}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">{job.postedDate}</span>
                  {job.externalUrl ? (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-bold text-blue-600 dark:text-blue-400 hover:text-orange-600 flex items-center gap-1 text-[11px]"
                    >
                      <span>Sumber Asli</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400">Tanpa link</span>
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
