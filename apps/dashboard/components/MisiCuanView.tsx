'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Target,
  Gift,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Coins,
  TrendingUp,
  CreditCard,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  History,
  Lock,
  ChevronRight,
  Flame,
  X,
  Trophy,
  User,
  Filter,
  Check,
  Smartphone,
  CheckCheck,
  Info,
  ExternalLink,
  Users,
  Building2,
  Upload,
  Link as LinkIcon,
  FileText,
  Hourglass,
  Image as ImageIcon,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import { userApi } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';


export type MissionStatus = 'Tersedia' | 'Sedang Ditinjau' | 'Selesai';

export interface MissionItem {
  id: string;
  title: string;
  desc: string;
  organizer: string;
  estimatedTime: string;
  participantsCount: number;
  quotaTotal: number;
  category: 'Harian' | 'Mingguan' | 'Spesial';
  status: MissionStatus;
  rewardCoins: number;
  rewardXp: number;
  progressCurrent: number;
  progressTarget: number;
  claimed: boolean;
  detailedSteps?: string[];
  tips?: string;
  terms?: string;
  submissionProof?: {
    screenshotUrl?: string;
    proofLink?: string;
    notes?: string;
    submittedAt?: string;
  };
}

export const MisiCuanView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'misi' | 'riwayat'>('misi');
  const [missionFilter, setMissionFilter] = useState<'Semua' | 'Harian' | 'Mingguan' | 'Spesial'>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Tersedia' | 'Sedang Ditinjau' | 'Selesai'>('Semua');
  const [historyFilter, setHistoryFilter] = useState<'Semua' | 'Misi Selesai' | 'Penukaran Reward'>('Semua');

  // Selected Mission for Detail Modal
  const [selectedMissionDetail, setSelectedMissionDetail] = useState<MissionItem | null>(null);

  // Mission Proof Submission State
  const [submittingMissionProof, setSubmittingMissionProof] = useState<MissionItem | null>(null);
  const [proofLink, setProofLink] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofScreenshotName, setProofScreenshotName] = useState<string | null>(null);
  const [isSubmissionSuccess, setIsSubmissionSuccess] = useState(false);

  // Dynamic user name for leaderboard
  const [userName, setUserName] = useState('Anda');

  // Gamification Balance State
  const [userCoins, setUserCoins] = useState(0);
  const [userXp, setUserXp] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const xpNextLevel = userLevel * 600;
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  // History Log State
  const [historyLogs, setHistoryLogs] = useState<Array<{
    id: string;
    title: string;
    organizer: string;
    date: string;
    category: string;
    rewardText: string;
    status: string;
  }>>([]);

  // Missions List
  const [missions, setMissions] = useState<MissionItem[]>([]);

  // History Log State
  const [coinHistory, setCoinHistory] = useState<Array<{
    id: string;
    date: string;
    desc: string;
    amount: string;
    type: string;
  }>>([]);

  // Leaderboard Data
  const [leaderboardList, setLeaderboardList] = useState<Array<{
    rank: number;
    name: string;
    title: string;
    coins: number;
    level: number;
    badge: string;
  }>>([]);

  // Load mission & gamification data
  useEffect(() => {
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        const name = profile.fullName || profile.name || 'Anda';
        setUserName(name);

        // Load gamification stats
        if (profile.gamification) {
          setUserCoins(profile.gamification.coins ?? 0);
          setUserXp(profile.gamification.xp ?? 0);
          setUserLevel(profile.gamification.level ?? 1);
          setIsCheckedInToday(profile.gamification.checkedInToday ?? false);
        }

        // Load missions
        if (profile.missions) {
          setMissions(profile.missions);
        }

        // Load history logs
        if (profile.missionHistory) {
          setHistoryLogs(profile.missionHistory);
        }

        // Load coin history
        if (profile.coinHistory) {
          setCoinHistory(profile.coinHistory);
        }

        // Load leaderboard with user injected
        if (profile.leaderboard) {
          setLeaderboardList(profile.leaderboard);
        } else {
          // Default: user only
          setLeaderboardList([
            { rank: 1, name: `${name} (Anda)`, title: 'Job Seeker', coins: profile.gamification?.coins ?? 0, level: profile.gamification?.level ?? 1, badge: 'Pencari Kerja' },
          ]);
        }
      }
    }).catch(() => {});
  }, []);

  // Handle Claim Mission (disimpan ke database)
  const handleClaimReward = async (id: string) => {
    const targetMission = missions.find((m) => m.id === id);
    if (!targetMission || targetMission.claimed) return;

    if (targetMission.progressCurrent < targetMission.progressTarget) {
      // If clicked from card, open detail
      setSelectedMissionDetail(targetMission);
      return;
    }

    try {
      const res = await fetch(`/api/user/missions/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!data.success) {
        setSelectedMissionDetail(targetMission);
        return;
      }
    } catch {
      setSelectedMissionDetail(targetMission);
      return;
    }

    setUserCoins((prev) => prev + targetMission.rewardCoins);
    setUserXp((prev) => prev + targetMission.rewardXp);

    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, claimed: true, status: 'Selesai' } : m))
    );

    if (selectedMissionDetail && selectedMissionDetail.id === id) {
      setSelectedMissionDetail((prev) => (prev ? { ...prev, claimed: true, status: 'Selesai' } : null));
    }

    setCoinHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        date: 'Hari Ini',
        desc: `Klaim Misi: ${targetMission.title}`,
        amount: `+${targetMission.rewardCoins.toLocaleString('id-ID')}`,
        type: 'in',
      },
      ...prev,
    ]);
  };

  // Handle Do Step in Mission
  const handleDoMissionStep = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id && !m.claimed && m.progressCurrent < m.progressTarget) {
          const nextProg = m.progressCurrent + 1;
          const updated = { ...m, progressCurrent: nextProg };
          if (selectedMissionDetail && selectedMissionDetail.id === id) {
            setSelectedMissionDetail(updated);
          }
          return updated;
        }
        return m;
      })
    );
  };

  // Handle Daily Checkin (disimpan ke database)
  const handleDailyCheckin = async () => {
    if (isCheckedInToday) return;
    try {
      const res = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setIsCheckedInToday(true);
        setUserCoins((prev) => prev + 1000);
        setUserXp((prev) => prev + 100);
      }
    } catch {
      // Tetap dalam keadaan belum check-in jika gagal
    }
  };

  const filteredMissions = missions.filter((m) => {
    const matchCategory = missionFilter === 'Semua' ? true : m.category === missionFilter;
    const matchStatus = statusFilter === 'Semua' ? true : m.status === statusFilter;
    return matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Standard */}
      <PageHeader
        title="Misi & Cuan Tambahan"
        subtitle="Selesaikan aktivitas pencarian kerja untuk mengumpulkan saldo koin & komisi cuan tambahan."
        icon={Gift}
        badge="Cuan Tambahan"
        stats={[
          {
            label: 'Saldo Koin',
            value: `${userCoins.toLocaleString('id-ID')} Koin`,
            icon: Coins,
            colorClass: 'text-amber-400',
            isPrimary: true,
          },
          {
            label: 'Misi Selesai',
            value: `${missions.filter((m) => m.status === 'Selesai').length} Misi`,
            icon: CheckCircle2,
            colorClass: 'text-emerald-400',
          },
        ]}
        actions={
          <button
            onClick={handleDailyCheckin}
            disabled={isCheckedInToday}
            className={`w-full sm:w-auto min-h-[40px] md:min-h-[34px] px-3.5 py-2 rounded-[10px] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isCheckedInToday
                ? 'bg-emerald-700/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white shadow-md shadow-cobalt-500/20 font-semibold'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCheckedInToday ? 'Sudah Check-In' : 'Bonus Check-In (+1.000)'}</span>
          </button>
        }
      />

      {/* Sub Nav Bar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('misi')}
            className={`px-3 sm:px-4 py-2 rounded-[10px] transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeSubTab === 'misi'
                ? 'bg-cobalt-500 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span>Misi Aktif<span className="hidden sm:inline"> &amp; Pengerjaan</span></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('riwayat')}
            className={`px-3 sm:px-4 py-2 rounded-[10px] transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeSubTab === 'riwayat'
                ? 'bg-cobalt-500 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>Riwayat<span className="hidden sm:inline"> &amp; Penukaran</span></span>
          </button>
        </div>

      {/* SUBTAB 1: DAFTAR MISI AKTIF */}
      {activeSubTab === 'misi' && (
        <div className="space-y-4">
          {/* Header & Filter Rows (Status & Category) */}
          <div className="flex flex-col gap-3 p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Misi Karir &amp; Pengerjaan
                </h3>
              </div>

              {/* Status Filters (Tabs) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5">
                <span className="text-caption font-bold text-slate-600 dark:text-slate-400 mr-1 hidden sm:inline">Status:</span>
                <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)} className="w-full sm:w-auto">
                  <TabsList variant="pill" className="w-full sm:w-auto flex justify-between min-w-max">
                    <TabsTrigger size="xs" value="Semua">Semua</TabsTrigger>
                    <TabsTrigger size="xs" value="Tersedia" className="flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" />
                      <span>Berjalan</span>
                    </TabsTrigger>
                    <TabsTrigger size="xs" value="Sedang Ditinjau" className="flex items-center gap-1">
                      <Hourglass className="w-3 h-3" />
                      <span>Ditinjau</span>
                    </TabsTrigger>
                    <TabsTrigger size="xs" value="Selesai" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Selesai</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Category Filters (Tabs) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan <strong className="text-slate-900 dark:text-white">{filteredMissions.length}</strong> misi
              </span>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-caption font-bold text-slate-600 dark:text-slate-400 mr-1 hidden sm:inline">Kategori:</span>
                <Tabs value={missionFilter} onValueChange={(val) => setMissionFilter(val as any)}>
                  <TabsList variant="pill">
                    <TabsTrigger size="xs" value="Semua">Semua</TabsTrigger>
                    <TabsTrigger size="xs" value="Harian">Harian</TabsTrigger>
                    <TabsTrigger size="xs" value="Mingguan">Mingguan</TabsTrigger>
                    <TabsTrigger size="xs" value="Spesial">Spesial</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Mission Grid */}
          {filteredMissions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-2">
              <Target className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Tidak ada misi dalam kategori/status ini</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Coba ubah filter di atas untuk melihat misi lainnya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMissions.map((m) => {
                const percentage = Math.min(100, Math.round((m.participantsCount / m.quotaTotal) * 100));

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMissionDetail(m)}
                    className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3.5 cursor-pointer hover:border-cobalt-500/70 hover:shadow-md transition group"
                  >
                    {/* Top Bar: Category + Status Badge + Estimasi Waktu */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m.category}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-caption font-bold flex items-center gap-1 ${
                          m.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : m.status === 'Sedang Ditinjau'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 text-navy-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-navy-800'
                        }`}>
                          {m.status === 'Selesai' && <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />}
                          {m.status === 'Sedang Ditinjau' && <Hourglass className="w-3 h-3 text-amber-700 dark:text-amber-400" />}
                          {m.status === 'Tersedia' && <PlayCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                          <span>{m.status === 'Tersedia' ? 'Sedang Berjalan' : m.status}</span>
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Estimasi {m.estimatedTime}</span>
                      </span>
                    </div>

                    {/* Judul & Misi Cuan by X & Description */}
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                        {m.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                        <span>Misi Cuan by <strong className="text-slate-800 dark:text-slate-200 font-semibold">{m.organizer}</strong></span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                        {m.desc}
                      </p>
                    </div>

                    {/* Kuota & Progress Bar & Click Detail Hint */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          Telah diikuti <span className="text-orange-700 dark:text-orange-400">{m.participantsCount}</span> orang
                        </span>
                        <span className="text-caption font-semibold text-orange-700 dark:text-orange-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cobalt-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: RIWAYAT MISI DISELESAIKAN & PENUKARAN */}
      {activeSubTab === 'riwayat' && (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Riwayat Misi Diselesaikan &amp; Penukaran</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar log pengerjaan misi yang disetujui serta pencairan saldo cuan kamu
              </p>
            </div>

            {/* History Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['Semua', 'Misi Selesai', 'Penukaran Reward'] as const).map((filterCat) => (
                <button
                  key={filterCat}
                  onClick={() => setHistoryFilter(filterCat)}
                  className={`px-3 py-1 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                    historyFilter === filterCat
                      ? 'bg-cobalt-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {filterCat}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {historyLogs.filter((log) => historyFilter === 'Semua' ? true : log.category === historyFilter).length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-1 dark:text-slate-400">
                <p className="font-bold">Belum ada riwayat dalam kategori ini</p>
              </div>
            ) : (
              historyLogs
                .filter((log) => historyFilter === 'Semua' ? true : log.category === historyFilter)
                .map((log) => (
                  <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                        log.category === 'Penukaran Reward'
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {log.category === 'Penukaran Reward' ? <CreditCard className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-[10px] text-caption font-extrabold uppercase tracking-wider ${
                            log.category === 'Penukaran Reward'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {log.category}
                          </span>
                          <span className="text-caption text-slate-500 dark:text-slate-400">{log.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{log.title}</h4>
                        <p className="text-caption text-slate-500 dark:text-slate-400">Penyelenggara: {log.organizer}</p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 space-y-1">
                      <span className={`font-black text-sm block ${
                        log.category === 'Penukaran Reward' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {log.rewardText}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-[10px] text-caption font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* DETAIL MISI MODAL */}
      <Dialog
        open={Boolean(selectedMissionDetail)}
        onOpenChange={(open) => {
          if (!open) setSelectedMissionDetail(null);
        }}
      >
        <DialogContent size="md" className="max-w-lg p-0 overflow-hidden flex flex-col">
          {selectedMissionDetail && (
            <>
              {/* Modal Header */}
              <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0 pr-12 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {selectedMissionDetail.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                        selectedMissionDetail.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : selectedMissionDetail.status === 'Sedang Ditinjau'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-navy-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {selectedMissionDetail.status === 'Tersedia' ? 'Sedang Berjalan' : selectedMissionDetail.status}
                      </span>
                    </div>
                    <DialogTitle className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      Detail Misi Karir
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Mission Title & Organizer */}
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedMissionDetail.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
                  <Building2 className="w-4 h-4" />
                  <span>Misi Cuan by {selectedMissionDetail.organizer}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  {selectedMissionDetail.desc}
                </p>
              </div>

              {/* Mission Meta Info Box */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-caption text-slate-500 uppercase font-bold block dark:text-slate-400">Estimasi Waktu</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    {selectedMissionDetail.estimatedTime}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-slate-500 uppercase font-bold block dark:text-slate-400">Total Peserta</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {selectedMissionDetail.participantsCount} / {selectedMissionDetail.quotaTotal} Orang
                  </span>
                </div>
              </div>

              {/* Langkah Penyelesaian */}
              {selectedMissionDetail.detailedSteps && selectedMissionDetail.detailedSteps.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                    <span>Langkah-Langkah Penyelesaian Misi</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedMissionDetail.detailedSteps.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-caption flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Syarat & Ketentuan */}
              {selectedMissionDetail.terms && (
                <div className="p-3.5 rounded-[10px] bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    Syarat &amp; Ketentuan Pengerjaan:
                  </span>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed pl-5">
                    {selectedMissionDetail.terms}
                  </p>
                </div>
              )}

              {/* Submitted Proof Info (If already submitted) */}
              {selectedMissionDetail.submissionProof && (
                <div className="p-4 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-navy-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-navy-900 dark:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Bukti Pengerjaan yang Telah Terkirim
                    </span>
                    <span className="text-caption font-normal text-navy-700 dark:text-blue-400">
                      {selectedMissionDetail.submissionProof.submittedAt}
                    </span>
                  </div>

                  {selectedMissionDetail.submissionProof.proofLink && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-800 dark:text-slate-200">Link Bukti: </strong>
                      <a href={selectedMissionDetail.submissionProof.proofLink} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">
                        {selectedMissionDetail.submissionProof.proofLink}
                      </a>
                    </div>
                  )}

                  {selectedMissionDetail.submissionProof.notes && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-800 dark:text-slate-200">Catatan: </strong>
                      {selectedMissionDetail.submissionProof.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMissionDetail(null)}
              >
                Tutup
              </Button>

              {selectedMissionDetail.status === 'Selesai' ? (
                <button disabled className="px-5 py-2.5 rounded-[10px] text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Misi Telah Selesai</span>
                </button>
              ) : selectedMissionDetail.status === 'Sedang Ditinjau' ? (
                <button disabled className="px-5 py-2.5 rounded-[10px] text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-default flex items-center gap-1.5">
                  <Hourglass className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Sedang Ditinjau oleh Tim</span>
                </button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const targetMission = selectedMissionDetail;
                    setSelectedMissionDetail(null);
                    setSubmittingMissionProof(targetMission);
                    setProofLink('');
                    setProofNotes('');
                    setProofScreenshotName(null);
                    setIsSubmissionSuccess(false);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Kerjakan Misi</span>
                </Button>
              )}
            </div>
          </>
          )}
        </DialogContent>
      </Dialog>

      {/* PENGUMPULAN BUKTI MISI DRAWER/MODAL */}
      <Sheet
        open={Boolean(submittingMissionProof)}
        onOpenChange={(open) => {
          if (!open) setSubmittingMissionProof(null);
        }}
      >
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          {submittingMissionProof && (
            <>
              {/* Header */}
              <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0 text-left pr-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-cobalt-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <SheetTitle className="font-bold text-base text-slate-900 dark:text-white">
                      Pengumpulan Bukti Misi
                    </SheetTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px] sm:max-w-xs">
                      {submittingMissionProof.title}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              {/* Content Body */}
              {isSubmissionSuccess ? (
                <div className="p-8 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
                  <DotLottiePlayer
                    src="/animations/coin-reward.json"
                    autoplay={true}
                    loop={false}
                    className="w-24 h-24 mx-auto"
                    fallback={
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg mx-auto">
                        <CheckCheck className="w-8 h-8" />
                      </div>
                    }
                  />

                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Bukti Pengerjaan Berhasil Dikirim!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                      Status misi kamu sekarang <strong className="text-amber-700 dark:text-amber-400">Sedang Ditinjau</strong>. Tim reviewer Employr akan mengecek bukti pengerjaan kamu.
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 w-full text-left text-xs space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Misi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{submittingMissionProof.title}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Status Pengerjaan:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">Sedang Ditinjau</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimasi Audit:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Maks. 1x24 Jam</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setSubmittingMissionProof(null)}
                    className="w-full"
                  >
                    Selesai &amp; Kembali ke Misi Cuan
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!submittingMissionProof) return;
                    try {
                      const res = await fetch(`/api/user/missions/${submittingMissionProof.id}/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          proofLink: proofLink || '',
                          proofNotes: proofNotes || '',
                          screenshotName: proofScreenshotName || '',
                        }),
                      });
                      const data = await res.json();
                      if (!data.success) return; // tetap di form jika gagal
                    } catch {
                      return;
                    }
                    setMissions((prev) =>
                      prev.map((m) =>
                        m.id === submittingMissionProof.id
                          ? {
                              ...m,
                              status: 'Sedang Ditinjau',
                              submissionProof: {
                                proofLink: proofLink || 'https://app.employr.id/bukti-pengerjaan',
                                notes: proofNotes || 'Bukti pengerjaan telah dikirimkan.',
                                screenshotUrl: proofScreenshotName || 'screenshot_bukti.png',
                                submittedAt: 'Baru Saja',
                              },
                            }
                          : m
                      )
                    );
                    setIsSubmissionSuccess(true);
                  }}
                  className="p-6 space-y-5 overflow-y-auto flex-1"
                >
                  {/* Mission Summary Card */}
                  <div className="p-4 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 space-y-1">
                    <span className="text-caption font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider block">
                      {submittingMissionProof.category} • Misi Cuan by {submittingMissionProof.organizer}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {submittingMissionProof.title}
                    </h4>
                  </div>

                  {/* Upload Screenshot Dropzone */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Upload Tangkapan Layar / Screenshot Bukti <span className="text-rose-700 dark:text-rose-400">*</span>
                    </label>
                    
                    <div
                      onClick={() => setProofScreenshotName('tangkapan_layar_misi_berhasil.png')}
                      className={`p-4 rounded-[10px] border-2 border-dashed transition cursor-pointer text-center space-y-2 ${
                        proofScreenshotName
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-300 dark:border-slate-700 hover:border-cobalt-500 bg-slate-50 dark:bg-slate-800/40'
                      }`}
                    >
                      {proofScreenshotName ? (
                        <div className="space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto dark:text-emerald-400" />
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {proofScreenshotName}
                          </p>
                          <p className="text-caption text-slate-500 dark:text-slate-400">File berhasil dilampirkan (Klik untuk mengganti)</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto dark:text-slate-400" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Klik untuk memilih screenshot bukti pengerjaan
                          </p>
                          <p className="text-caption text-slate-500 dark:text-slate-400">Format PNG, JPG, atau WEBP (Maks 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link Bukti Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Tautan / Link Bukti Pengerjaan (Opsional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={proofLink}
                        onChange={(e) => setProofLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:outline-none pl-9"
                      />
                      <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-400" />
                    </div>
                    <p className="text-caption text-slate-500 mt-1 dark:text-slate-400">
                      Lampirkan URL postingan sosial media, URL tracker, atau link pengerjaan jika ada.
                    </p>
                  </div>

                  {/* Catatan Tambahan */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Catatan / Keterangan Tambahan
                    </label>
                    <textarea
                      rows={3}
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      placeholder="Tuliskan keterangan detail pengerjaan misi kamu..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:outline-none"
                    />
                  </div>

                  {/* Warning Info */}
                  <div className="p-3 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 dark:text-amber-400" />
                    <span>Pastikan bukti pengerjaan valid dan asli. Pengiriman bukti palsu dapat menyebabkan akun dibekukan.</span>
                  </div>

                  {/* Sticky Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSubmittingMissionProof(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Kirim Bukti Misi</span>
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
