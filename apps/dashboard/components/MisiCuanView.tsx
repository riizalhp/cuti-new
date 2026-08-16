'use client';

import React, { useState } from 'react';
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

  // Gamification Balance State
  const [userCoins, setUserCoins] = useState(48500);
  const [userXp, setUserXp] = useState(2400);
  const userLevel = 5;
  const xpNextLevel = 3000;
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  // History Log State
  const [historyLogs] = useState([
    {
      id: 'h1',
      title: 'Ajak 2 Teman Pencari Kerja (Program Referral)',
      organizer: 'AmbilCUTI Growth Team',
      date: '10 Agustus 2026',
      category: 'Misi Selesai',
      rewardText: '+Rp 25.000 (Saldo)',
      status: 'Disetujui & Cair',
    },
    {
      id: 'h2',
      title: 'Penukaran Saldo E-Wallet GoPay Rp 25.000',
      organizer: 'Transfer Admin Direct',
      date: '08 Agustus 2026',
      category: 'Penukaran Reward',
      rewardText: '-Rp 25.000 (GoPay)',
      status: 'Berhasil Transfer (081234567890)',
    },
    {
      id: 'h3',
      title: 'Optimasi Skor ATS CV hingga >80%',
      organizer: 'HR Expert Advisory',
      date: '05 Agustus 2026',
      category: 'Misi Selesai',
      rewardText: '+5.000 Koin',
      status: 'Disetujui & Cair',
    },
    {
      id: 'h4',
      title: 'Check-In Harian Hari ke-7',
      organizer: 'AmbilCUTI Platform',
      date: '01 Agustus 2026',
      category: 'Misi Selesai',
      rewardText: '+1.000 Koin',
      status: 'Otomatis Masuk',
    },
  ]);

  // Missions List
  const [missions, setMissions] = useState<MissionItem[]>([
    {
      id: 'm1',
      title: 'Check-In Harian CUTI',
      desc: 'Buka aplikasi dan dapatkan koin harian gratis.',
      organizer: 'AmbilCUTI Platform',
      estimatedTime: '2-5 Menit',
      participantsCount: 184,
      quotaTotal: 250,
      category: 'Harian',
      status: 'Tersedia',
      rewardCoins: 500,
      rewardXp: 50,
      progressCurrent: 1,
      progressTarget: 1,
      claimed: false,
      detailedSteps: [
        'Login ke aplikasi CUTI setiap hari.',
        'Buka tab Misi & Cuan pada menu navigasi.',
        'Lakukan verifikasi profil karier harian.',
      ],
      tips: 'Lakukan check-in setiap hari untuk menjaga produktivitas berburu kerja!',
      terms: 'Misi ini direset setiap hari pukul 00:00 WIB.',
    },
    {
      id: 'm2',
      title: 'Update Status Tracker Lamaran',
      desc: 'Perbarui status minimal 1 lamaran kerja aktif di Tracker.',
      organizer: 'AmbilCUTI Career Ops',
      estimatedTime: '3-5 Menit',
      participantsCount: 142,
      quotaTotal: 200,
      category: 'Harian',
      status: 'Sedang Ditinjau',
      rewardCoins: 1500,
      rewardXp: 100,
      progressCurrent: 1,
      progressTarget: 1,
      claimed: false,
      detailedSteps: [
        'Masuk ke menu "Tracker Lamaran" di sidebar.',
        'Pilih salah satu posisi lamaran yang pernah kamu kirimkan.',
        'Ubah statusnya (misal: "Interview Scheduled", "HR Screening", atau "Assessment").',
        'Ambil tangkapan layar (screenshot) sebagai bukti pengerjaan.',
      ],
      tips: 'Mengisi status secara akurat membantu AI memberikan rekomendasi langkah karir selanjutnya.',
      terms: 'Misi ini dihitung 1x per hari.',
      submissionProof: {
        proofLink: 'https://app.ambilcuti.id/tracker/1294',
        notes: 'Sudah mengubah status lamaran PT Tech Prima ke HR Screening',
        screenshotUrl: 'bukti_tracker_lamaran.jpg',
        submittedAt: '15 Menit yang lalu',
      },
    },
    {
      id: 'm3',
      title: 'Lamar 3 Pekerjaan Baru',
      desc: 'Kirimkan lamaran kerja melalui fitur Lowongan CUTI.',
      organizer: 'KitaLulus Partner Network',
      estimatedTime: '10-15 Menit',
      participantsCount: 95,
      quotaTotal: 150,
      category: 'Harian',
      status: 'Tersedia',
      rewardCoins: 3000,
      rewardXp: 200,
      progressCurrent: 0,
      progressTarget: 3,
      claimed: false,
      detailedSteps: [
        'Buka menu "Portal Lowongan Kerja".',
        'Gunakan filter lokasi, gaji, atau kata kunci untuk menemukan pekerjaan impian.',
        'Lamar 3 posisi lowongan yang sesuai dengan kualifikasi kamu.',
        'Lampirkan link atau screenshot bukti lamaran yang telah terikirim.',
      ],
      tips: 'Pastikan skor Match Rating CV kamu di atas 70% untuk memperbesar peluang dipanggil interview.',
      terms: 'Misi berlaku untuk lowongan yang aktif dan valid.',
    },
    {
      id: 'm4',
      title: 'Ikuti Survey Kesiapan Kerja',
      desc: 'Isi kuesioner singkat tentang ekspektasi gaji dan bidang kerja impian.',
      organizer: 'Kemnaker Talent Research',
      estimatedTime: '5-7 Menit',
      participantsCount: 310,
      quotaTotal: 500,
      category: 'Harian',
      status: 'Tersedia',
      rewardCoins: 2500,
      rewardXp: 150,
      progressCurrent: 0,
      progressTarget: 1,
      claimed: false,
      detailedSteps: [
        'Buka link survey kesiapan kerja resmi Kemnaker.',
        'Isi pertanyaan kuesioner hingga halaman konfirmasi selesai.',
        'Upload screenshot halaman konfirmasi survey selesai.',
      ],
      tips: 'Jawab dengan jujur sesuai pengalaman kamu.',
      terms: 'Setiap pengguna hanya dapat mengisi 1x survey per periode.',
    },
    {
      id: 'm5',
      title: 'Ajak 2 Teman Pencari Kerja (Referral)',
      desc: 'Bagikan kode referral unik kamu ke teman yang sedang mencari kerja.',
      organizer: 'AmbilCUTI Growth Team',
      estimatedTime: '5 Menit',
      participantsCount: 78,
      quotaTotal: 100,
      category: 'Mingguan',
      status: 'Selesai',
      rewardCoins: 10000,
      rewardXp: 500,
      progressCurrent: 2,
      progressTarget: 2,
      claimed: true,
      detailedSteps: [
        'Salin kode referral unik kamu: "CUTI-CUAN2026".',
        'Bagikan kode tersebut ke teman atau grup alumni kamu.',
        'Pastikan 2 teman bergabung dan membuat akun CUTI.',
      ],
      tips: 'Teman yang bergabung juga akan langsung mendapatkan bonus awal 1.000 Koin gratis!',
      terms: 'Reward diberikan otomatis saat teman pertama kali berhasil mendaftar.',
      submissionProof: {
        proofLink: 'https://app.ambilcuti.id/referral',
        notes: '2 Teman (Budi & Rian) sudah mendaftar via link referral.',
        submittedAt: 'Kemarin',
      },
    },
    {
      id: 'm6',
      title: 'Optimasi Skor ATS CV hingga >80%',
      desc: 'Perbaiki CV menggunakan AI CV Optimizer untuk skor ATS di atas 80%.',
      organizer: 'HR Expert Advisory',
      estimatedTime: '15-20 Menit',
      participantsCount: 420,
      quotaTotal: 500,
      category: 'Spesial',
      status: 'Selesai',
      rewardCoins: 5000,
      rewardXp: 300,
      progressCurrent: 1,
      progressTarget: 1,
      claimed: true,
      detailedSteps: [
        'Masuk ke menu "CV AI Generator".',
        'Upload atau buat CV baru, lalu jalankan analisis ATS Checker.',
        'Ikuti rekomendasi AI untuk memperbaiki kata kunci hingga skor mencapai >80%.',
      ],
      tips: 'Gunakan kata kerja aksi (action verbs) dan kuantifikasi pencapaian kerja kamu dengan angka.',
      terms: 'Misi spesial ini dapat diklaim 1x setelah target terpenuhi.',
      submissionProof: {
        proofLink: 'https://app.ambilcuti.id/cv-builder',
        notes: 'Skor ATS CV telah mencapai 88%.',
        submittedAt: '2 Hari lalu',
      },
    },
  ]);

  // History Log State
  const [coinHistory, setCoinHistory] = useState([
    { id: 'h1', date: '22 Juli 2026', desc: 'Klaim Misi: Optimasi Skor ATS CV', amount: '+5.000', type: 'in' },
    { id: 'h2', date: '21 Juli 2026', desc: 'Penukaran Voucher GoPay Rp 25.000', amount: '-25.000', type: 'out' },
    { id: 'h3', date: '21 Juli 2026', desc: 'Bonus Referral: Rian Pratama', amount: '+10.000', type: 'in' },
    { id: 'h4', date: '20 Juli 2026', desc: 'Check-In Harian Hari ke-5', amount: '+1.000', type: 'in' },
  ]);

  // Leaderboard Data
  const leaderboardList = [
    { rank: 1, name: 'Aditya Pratama', title: 'Senior Data Analyst', coins: 142000, level: 9, badge: 'Sultan Karir' },
    { rank: 2, name: 'Siti Rahma', title: 'UI/UX Designer', coins: 118500, level: 8, badge: 'Top Referral' },
    { rank: 3, name: 'Budi Santoso', title: 'Frontend Developer', coins: 95000, level: 7, badge: 'Pejuang ATS' },
    { rank: 4, name: 'Maya Indah', title: 'Product Manager', coins: 78000, level: 6, badge: 'Interview Pro' },
    { rank: 5, name: 'Rizky Febrian (Anda)', title: 'Fullstack Engineer', coins: 48500, level: 5, badge: 'Job Seeker' },
  ];

  // Handle Claim Mission
  const handleClaimReward = (id: string) => {
    const targetMission = missions.find((m) => m.id === id);
    if (!targetMission || targetMission.claimed) return;

    if (targetMission.progressCurrent < targetMission.progressTarget) {
      // If clicked from card, open detail
      setSelectedMissionDetail(targetMission);
      return;
    }

    setUserCoins((prev) => prev + targetMission.rewardCoins);
    setUserXp((prev) => prev + targetMission.rewardXp);

    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, claimed: true } : m))
    );

    if (selectedMissionDetail && selectedMissionDetail.id === id) {
      setSelectedMissionDetail((prev) => (prev ? { ...prev, claimed: true } : null));
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

  // Handle Daily Checkin
  const handleDailyCheckin = () => {
    if (isCheckedInToday) return;
    setIsCheckedInToday(true);
    setUserCoins((prev) => prev + 1000);
    setUserXp((prev) => prev + 100);
  };

  const filteredMissions = missions.filter((m) => {
    const matchCategory = missionFilter === 'Semua' ? true : m.category === missionFilter;
    const matchStatus = statusFilter === 'Semua' ? true : m.status === statusFilter;
    return matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Gamification Header Banner */}
      <div className="bg-[#0D3BD9] rounded-[10px] p-6 text-white border border-blue-500/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Program Misi & Cuan CUTI</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Kerjakan Misi Karir, Kumpulkan Cuan & Reward!
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Setiap aktivitas produktif mencari kerja memberikan Koin Karier & XP yang dapat ditukarkan dengan Saldo E-Wallet, Pulsa, atau Akses Premium Pass.
            </p>
          </div>

          {/* Balance Cards Group */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Koin Balance Box */}
            <div className="p-4 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/15 min-w-[170px] space-y-1">
              <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                <span>Saldo Koin</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-300">
                {userCoins.toLocaleString('id-ID')} <span className="text-xs font-semibold text-amber-200">Koin</span>
              </div>
            </div>

            {/* Level XP Box */}
            <div className="p-4 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/15 min-w-[170px] space-y-1">
              <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                <span>Level Karier</span>
                <Award className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-xl font-black text-white">
                Level {userLevel} <span className="text-xs font-normal text-slate-300">(Pro)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${Math.round((userXp / xpNextLevel) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Fast Action Daily Check-in */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Bonus Check-in Harian (+1.000 Koin + 100 XP)</span>
          </div>

          <button
            onClick={handleDailyCheckin}
            disabled={isCheckedInToday}
            className={`px-4 py-2 rounded-[10px] font-bold transition flex items-center justify-center gap-1.5 ${
              isCheckedInToday
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCheckedInToday ? 'Sudah Check-In Hari Ini' : 'Ambil Bonus Check-In'}</span>
          </button>
        </div>

        {/* Sub Nav Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('misi')}
            className={`px-4 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'misi'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Daftar Misi Aktif</span>
          </button>

          <button
            onClick={() => setActiveSubTab('riwayat')}
            className={`px-4 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'riwayat'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Misi Diselesaikan &amp; Penukaran</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DAFTAR MISI AKTIF */}
      {activeSubTab === 'misi' && (
        <div className="space-y-4">
          {/* Header & Filter Rows (Status & Category) */}
          <div className="flex flex-col gap-3 p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Misi Karir &amp; Pengerjaan
                </h3>
              </div>

              {/* Status Filters (Semua, Tersedia, Sedang Ditinjau, Selesai) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
                {(['Semua', 'Tersedia', 'Sedang Ditinjau', 'Selesai'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === st
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st === 'Tersedia' && <PlayCircle className="w-3 h-3 text-blue-400" />}
                    {st === 'Sedang Ditinjau' && <Hourglass className="w-3 h-3 text-amber-400" />}
                    {st === 'Selesai' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    <span>{st === 'Tersedia' ? 'Sedang Berjalan' : st}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filters (Semua, Harian, Mingguan, Spesial) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan <strong className="text-slate-900 dark:text-white">{filteredMissions.length}</strong> misi
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Kategori:</span>
                {(['Semua', 'Harian', 'Mingguan', 'Spesial'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMissionFilter(cat)}
                    className={`px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold transition cursor-pointer ${
                      missionFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Grid */}
          {filteredMissions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-2">
              <Target className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Tidak ada misi dalam kategori/status ini</h4>
              <p className="text-xs text-slate-400">Coba ubah filter di atas untuk melihat misi lainnya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMissions.map((m) => {
                const percentage = Math.min(100, Math.round((m.participantsCount / m.quotaTotal) * 100));

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMissionDetail(m)}
                    className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3.5 cursor-pointer hover:border-orange-500/70 hover:shadow-md transition group"
                  >
                    {/* Top Bar: Category + Status Badge + Estimasi Waktu */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m.category}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          m.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : m.status === 'Sedang Ditinjau'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {m.status === 'Selesai' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          {m.status === 'Sedang Ditinjau' && <Hourglass className="w-3 h-3 text-amber-500" />}
                          {m.status === 'Tersedia' && <PlayCircle className="w-3 h-3 text-blue-500" />}
                          <span>{m.status === 'Tersedia' ? 'Sedang Berjalan' : m.status}</span>
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Estimasi {m.estimatedTime}</span>
                      </span>
                    </div>

                    {/* Judul & Misi Cuan by X & Description */}
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                        {m.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-orange-500" />
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
                          Telah diikuti <span className="text-orange-600 dark:text-orange-400">{m.participantsCount}</span> orang
                        </span>
                        <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-300"
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
                <History className="w-4 h-4 text-orange-500" />
                <span>Riwayat Misi Diselesaikan &amp; Penukaran</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar log historis pengerjaan misi yang disetujui serta pencairan reward cuan kamu
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
                      ? 'bg-orange-500 text-white shadow-xs'
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
              <div className="py-8 text-center text-slate-400 space-y-1">
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
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {log.category === 'Penukaran Reward' ? <CreditCard className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            log.category === 'Penukaran Reward'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {log.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{log.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{log.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Penyelenggara: {log.organizer}</p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 space-y-1">
                      <span className={`font-black text-sm block ${
                        log.category === 'Penukaran Reward' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {log.rewardText}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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
      {selectedMissionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity">
          <div className="absolute inset-0" onClick={() => setSelectedMissionDetail(null)} />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {selectedMissionDetail.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedMissionDetail.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedMissionDetail.status === 'Sedang Ditinjau'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {selectedMissionDetail.status === 'Tersedia' ? 'Sedang Berjalan' : selectedMissionDetail.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    Detail Misi Karir
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedMissionDetail(null)}
                className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Mission Title & Organizer */}
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedMissionDetail.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
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
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimasi Waktu</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {selectedMissionDetail.estimatedTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Peserta</span>
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
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span>Langkah-Langkah Penyelesaian Misi</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedMissionDetail.detailedSteps.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
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
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Syarat &amp; Ketentuan Pengerjaan:
                  </span>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed pl-5">
                    {selectedMissionDetail.terms}
                  </p>
                </div>
              )}

              {/* Submitted Proof Info (If already submitted) */}
              {selectedMissionDetail.submissionProof && (
                <div className="p-4 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Bukti Pengerjaan yang Telah Terkirim
                    </span>
                    <span className="text-[10px] font-normal text-blue-700 dark:text-blue-400">
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
              <button
                onClick={() => setSelectedMissionDetail(null)}
                className="px-4 py-2.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>

              {selectedMissionDetail.status === 'Selesai' ? (
                <button disabled className="px-5 py-2.5 rounded-[10px] text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Misi Telah Selesai</span>
                </button>
              ) : selectedMissionDetail.status === 'Sedang Ditinjau' ? (
                <button disabled className="px-5 py-2.5 rounded-[10px] text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-default flex items-center gap-1.5">
                  <Hourglass className="w-4 h-4 text-amber-500" />
                  <span>Sedang Ditinjau oleh Tim</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const targetMission = selectedMissionDetail;
                    setSelectedMissionDetail(null);
                    setSubmittingMissionProof(targetMission);
                    setProofLink('');
                    setProofNotes('');
                    setProofScreenshotName(null);
                    setIsSubmissionSuccess(false);
                  }}
                  className="px-6 py-2.5 rounded-[10px] text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Kerjakan Misi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PENGUMPULAN BUKTI MISI DRAWER/MODAL */}
      {submittingMissionProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="absolute inset-0" onClick={() => setSubmittingMissionProof(null)} />

          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Pengumpulan Bukti Misi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px] sm:max-w-xs">
                    {submittingMissionProof.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSubmittingMissionProof(null)}
                className="p-2 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            {isSubmissionSuccess ? (
              <div className="p-8 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
                <DotLottiePlayer
                  src="/animations/coin-reward.json"
                  autoplay={true}
                  loop={false}
                  className="w-24 h-24 mx-auto"
                  fallback={
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg mx-auto">
                      <CheckCheck className="w-8 h-8" />
                    </div>
                  }
                />

                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Bukti Pengerjaan Berhasil Dikirim!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                    Status misi kamu sekarang <strong className="text-amber-600 dark:text-amber-400">Sedang Ditinjau</strong>. Tim reviewer AmbilCUTI akan mengecek bukti pengerjaan kamu.
                  </p>
                </div>

                <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 w-full text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Misi:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{submittingMissionProof.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Status Pengerjaan:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Sedang Ditinjau</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimasi Audit:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Maks. 1x24 Jam</span>
                  </div>
                </div>

                <button
                  onClick={() => setSubmittingMissionProof(null)}
                  className="w-full py-3 rounded-[10px] bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Selesai &amp; Kembali ke Misi Cuan
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!submittingMissionProof) return;
                  setMissions((prev) =>
                    prev.map((m) =>
                      m.id === submittingMissionProof.id
                        ? {
                            ...m,
                            status: 'Sedang Ditinjau',
                            submissionProof: {
                              proofLink: proofLink || 'https://app.ambilcuti.id/bukti-pengerjaan',
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
                  <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider block">
                    {submittingMissionProof.category} • Misi Cuan by {submittingMissionProof.organizer}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {submittingMissionProof.title}
                  </h4>
                </div>

                {/* Upload Screenshot Dropzone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Upload Tangkapan Layar / Screenshot Bukti <span className="text-rose-500">*</span>
                  </label>
                  
                  <div
                    onClick={() => setProofScreenshotName('tangkapan_layar_misi_berhasil.png')}
                    className={`p-4 rounded-[10px] border-2 border-dashed transition cursor-pointer text-center space-y-2 ${
                      proofScreenshotName
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-300 dark:border-slate-700 hover:border-orange-500 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    {proofScreenshotName ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {proofScreenshotName}
                        </p>
                        <p className="text-[10px] text-slate-400">File berhasil dilampirkan (Klik untuk mengganti)</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Klik untuk memilih screenshot bukti pengerjaan
                        </p>
                        <p className="text-[10px] text-slate-400">Format PNG, JPG, atau WEBP (Maks 5MB)</p>
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
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none pl-9"
                    />
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Warning Info */}
                <div className="p-3 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Pastikan bukti pengerjaan valid dan asli. Pengiriman bukti palsu dapat menyebabkan akun dibekukan.</span>
                </div>

                {/* Sticky Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSubmittingMissionProof(null)}
                    className="px-5 py-2.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-[10px] text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Kirim Bukti Misi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
