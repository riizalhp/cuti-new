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
} from 'lucide-react';

interface MissionItem {
  id: string;
  title: string;
  desc: string;
  rewardCoins: number;
  rewardXp: number;
  category: 'Harian' | 'Mingguan' | 'Spesial';
  progressCurrent: number;
  progressTarget: number;
  claimed: boolean;
  detailedSteps?: string[];
  tips?: string;
  terms?: string;
}

export const MisiCuanView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'misi' | 'tukar' | 'badge' | 'leaderboard' | 'riwayat'>('misi');
  const [missionFilter, setMissionFilter] = useState<'Semua' | 'Harian' | 'Mingguan' | 'Spesial'>('Semua');

  // Selected Mission for Detail Modal
  const [selectedMissionDetail, setSelectedMissionDetail] = useState<MissionItem | null>(null);

  // Gamification Balance State
  const [userCoins, setUserCoins] = useState(48500);
  const [userXp, setUserXp] = useState(2400);
  const userLevel = 5;
  const xpNextLevel = 3000;
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  // Redemption Drawer State
  const [selectedRedeemItem, setSelectedRedeemItem] = useState<{
    id: string;
    title: string;
    category: string;
    cost: number;
    icon: React.ElementType;
    badge: string | null;
  } | null>(null);
  const [payoutDestination, setPayoutDestination] = useState('081234567890');
  const [payoutProvider, setPayoutProvider] = useState('GoPay');
  const [isRedeemSuccess, setIsRedeemSuccess] = useState(false);

  // Missions List
  const [missions, setMissions] = useState<MissionItem[]>([
    {
      id: 'm1',
      title: 'Check-In Harian CUTI',
      desc: 'Buka aplikasi dan dapatkan koin harian gratis.',
      rewardCoins: 500,
      rewardXp: 50,
      category: 'Harian',
      progressCurrent: 1,
      progressTarget: 1,
      claimed: false,
      detailedSteps: [
        'Login ke aplikasi CUTI setiap hari.',
        'Buka tab Misi & Cuan pada menu navigasi.',
        'Klik tombol "Klaim Check-In" untuk mendapatkan 500 Koin & 50 XP.',
      ],
      tips: 'Check-in 7 hari berturut-turut untuk mendapatkan multiplier bonus Koin hingga 2x!',
      terms: 'Check-in direset setiap hari pukul 00:00 WIB.',
    },
    {
      id: 'm2',
      title: 'Update Status Tracker Lamaran',
      desc: 'Perbarui status minimal 1 lamaran kerja aktif di Tracker.',
      rewardCoins: 1500,
      rewardXp: 100,
      category: 'Harian',
      progressCurrent: 1,
      progressTarget: 1,
      claimed: false,
      detailedSteps: [
        'Masuk ke menu "Tracker Lamaran" di sidebar.',
        'Pilih salah satu posisi lamaran yang pernah kamu kirimkan.',
        'Ubah statusnya (misal: "Interview Scheduled", "HR Screening", atau "Assessment").',
      ],
      tips: 'Mengisi status secara akurat membantu AI memberikan rekomendasi langkah karir selanjutnya.',
      terms: 'Misi ini dihitung 1x per hari.',
    },
    {
      id: 'm3',
      title: 'Lamar 3 Pekerjaan Baru',
      desc: 'Kirimkan lamaran kerja melalui fitur Lowongan CUTI.',
      rewardCoins: 3000,
      rewardXp: 200,
      category: 'Harian',
      progressCurrent: 2,
      progressTarget: 3,
      claimed: false,
      detailedSteps: [
        'Buka menu "Portal Lowongan Kerja".',
        'Gunakan filter lokasi, gaji, atau kata kunci untuk menemukan pekerjaan impian.',
        'Klik "Lamar Sekarang" dan lampirkan CV AI kamu pada 3 perusahaan berbeda.',
      ],
      tips: 'Pastikan skor Match Rating CV kamu di atas 70% untuk memperbesar peluang dipanggil interview.',
      terms: 'Misi berlaku untuk lowongan yang aktif dan valid.',
    },
    {
      id: 'm4',
      title: 'Lakukan 1 Simulasi AI Interview',
      desc: 'Selesaikan 1 sesi latihan interview dengan Evaluator AI.',
      rewardCoins: 2500,
      rewardXp: 150,
      category: 'Harian',
      progressCurrent: 1,
      progressTarget: 1,
      claimed: false,
      detailedSteps: [
        'Buka menu "Simulasi Interview AI".',
        'Pilih topik interview (misal: Technical, Behavioral, atau General HR).',
        'Jawab pertanyaan simulasi sampai selesai dan dapatkan evaluasi skor dari AI.',
      ],
      tips: 'Gunakan metode STAR (Situation, Task, Action, Result) dalam jawaban kamu.',
      terms: 'Sesi harus diselesaikan hingga menerima hasil Feedback AI.',
    },
    {
      id: 'm5',
      title: 'Ajak 2 Teman Pencari Kerja (Referral)',
      desc: 'Bagikan kode referral unik kamu ke teman yang sedang mencari kerja.',
      rewardCoins: 10000,
      rewardXp: 500,
      category: 'Mingguan',
      progressCurrent: 1,
      progressTarget: 2,
      claimed: false,
      detailedSteps: [
        'Salin kode referral unik kamu: "CUTI-CUAN2026".',
        'Bagikan kode tersebut ke teman atau grup alumni kamu.',
        'Pastikan 2 teman bergabung dan membuat akun CUTI.',
      ],
      tips: 'Teman yang bergabung juga akan langsung mendapatkan bonus awal 1.000 Koin gratis!',
      terms: 'Reward diberikan otomatis saat teman pertama kali berhasil mendaftar.',
    },
    {
      id: 'm6',
      title: 'Optimasi Skor ATS CV hingga >80%',
      desc: 'Perbaiki CV menggunakan AI CV Optimizer untuk skor ATS di atas 80%.',
      rewardCoins: 5000,
      rewardXp: 300,
      category: 'Spesial',
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

    setCoinHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        date: 'Hari Ini',
        desc: 'Bonus Check-In Harian',
        amount: '+1.000',
        type: 'in',
      },
      ...prev,
    ]);
  };

  // Redeem Items Catalog
  const redeemItems = [
    {
      id: 'r1',
      title: 'Saldo E-Wallet Rp 25.000',
      category: 'E-Wallet',
      cost: 25000,
      icon: CreditCard,
      badge: 'Terpopuler',
    },
    {
      id: 'r2',
      title: 'Saldo E-Wallet Rp 50.000',
      category: 'E-Wallet',
      cost: 48000,
      icon: CreditCard,
      badge: 'Hemat Koin',
    },
    {
      id: 'r3',
      title: 'Pulsa Semua Operator Rp 20.000',
      category: 'Pulsa',
      cost: 20000,
      icon: PhoneCall,
      badge: null,
    },
    {
      id: 'r4',
      title: 'Pass Premium CUTI (1 Bulan)',
      category: 'Fitur Pro',
      cost: 30000,
      icon: Zap,
      badge: 'Rekomendasi Karir',
    },
    {
      id: 'r5',
      title: 'Review CV 1-on-1 Direct oleh HR Senior',
      category: 'Mentorship',
      cost: 60000,
      icon: ShieldCheck,
      badge: 'Exclusive',
    },
  ];

  const handleOpenRedeemDrawer = (item: typeof redeemItems[0]) => {
    setSelectedRedeemItem(item);
    setIsRedeemSuccess(false);
  };

  const handleConfirmRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRedeemItem) return;

    if (userCoins < selectedRedeemItem.cost) {
      alert('Saldo Koin Anda belum mencukupi untuk melakukan penukaran ini.');
      return;
    }

    setUserCoins((prev) => prev - selectedRedeemItem.cost);
    setCoinHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        date: 'Hari Ini',
        desc: `Penukaran: ${selectedRedeemItem.title} (${payoutProvider} - ${payoutDestination})`,
        amount: `-${selectedRedeemItem.cost.toLocaleString('id-ID')}`,
        type: 'out',
      },
      ...prev,
    ]);

    setIsRedeemSuccess(true);
  };

  // Badges
  const badgesList = [
    { title: 'Job Seeker Pemula', desc: 'Menyelesaikan onboarding pertama.', unlocked: true },
    { title: 'Master ATS CV', desc: 'Mencapai skor ATS CV di atas 80%.', unlocked: true },
    { title: 'Pejuang Interview', desc: 'Melakukan 5x simulasi interview AI.', unlocked: true },
    { title: 'Ambassador Karir', desc: 'Mengundang 3+ teman bergabung.', unlocked: false },
    { title: 'Sultan Koin', desc: 'Mengumpulkan total 100.000 Koin.', unlocked: false },
    { title: 'Lolos Offering', desc: 'Mengubah status tracker ke Offering.', unlocked: false },
  ];

  const filteredMissions = missions.filter((m) =>
    missionFilter === 'Semua' ? true : m.category === missionFilter
  );

  return (
    <div className="space-y-6">
      {/* Gamification Header Banner */}
      <div className="bg-[#0D3BD9] rounded-xl p-6 text-white border border-blue-500/50 shadow-md">
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
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[170px] space-y-1">
              <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                <span>Saldo Koin</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-300">
                {userCoins.toLocaleString('id-ID')} <span className="text-xs font-semibold text-amber-200">Koin</span>
              </div>
            </div>

            {/* Level XP Box */}
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[170px] space-y-1">
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
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
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
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'misi'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Daftar Misi Aktif</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tukar')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'tukar'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Tukar Cuan & Voucher</span>
          </button>

          <button
            onClick={() => setActiveSubTab('badge')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'badge'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Pencapaian & Badge</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard Top Jobseeker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('riwayat')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'riwayat'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Koin</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DAFTAR MISI AKTIF */}
      {activeSubTab === 'misi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Misi Karir Hari Ini
              </h3>
            </div>

            {/* Mission Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['Semua', 'Harian', 'Mingguan', 'Spesial'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMissionFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    missionFilter === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMissions.map((m) => {
              const isReadyToClaim = m.progressCurrent >= m.progressTarget && !m.claimed;

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-xl border transition-all space-y-3 bg-white dark:bg-slate-900 ${
                    m.claimed
                      ? 'border-slate-200 dark:border-slate-800 opacity-70'
                      : isReadyToClaim
                      ? 'border-violet-500 ring-2 ring-violet-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => setSelectedMissionDetail(m)}
                    className="flex items-start justify-between gap-2 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m.category}
                        </span>
                        <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold flex items-center gap-0.5 group-hover:underline">
                          <Info className="w-3 h-3" /> Klik Detail
                        </span>
                      </div>
                      <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white mt-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        {m.desc}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                        +{m.rewardCoins.toLocaleString('id-ID')} Koin
                      </span>
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                        +{m.rewardXp} XP
                      </span>
                    </div>
                  </div>

                  {/* Progress & Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Progress</span>
                        <span>{m.progressCurrent} / {m.progressTarget}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-violet-600 dark:bg-violet-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (m.progressCurrent / m.progressTarget) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedMissionDetail(m)}
                        className="px-2.5 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                        title="Lihat Detail Misi"
                      >
                        <Info className="w-3.5 h-3.5 text-violet-500" />
                        <span className="hidden sm:inline">Detail</span>
                      </button>

                      <button
                        onClick={() => {
                          if (isReadyToClaim) {
                            handleClaimReward(m.id);
                          } else {
                            setSelectedMissionDetail(m);
                          }
                        }}
                        disabled={m.claimed}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          m.claimed
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-default'
                            : isReadyToClaim
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md animate-bounce'
                            : 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900 border border-violet-200 dark:border-violet-800'
                        }`}
                      >
                        {m.claimed ? 'Selesai' : isReadyToClaim ? 'Klaim Reward' : 'Kerjakan'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PENUKARAN CUAN */}
      {activeSubTab === 'tukar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>Katalog Hadiah & Cuan Kebanggaan</span>
            </h3>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Koin Kamu: {userCoins.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {redeemItems.map((item) => {
              const Icon = item.icon;
              const canAfford = userCoins >= item.cost;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-xs hover:border-violet-400 dark:hover:border-violet-600 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white leading-snug mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Harga Penukaran</span>
                      <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                        {item.cost.toLocaleString('id-ID')} Koin
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenRedeemDrawer(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        canAfford
                          ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Tukar Sekarang' : 'Koin Kurang'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: PENCAPAIAN & BADGE */}
      {activeSubTab === 'badge' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgesList.map((b, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition space-y-3 bg-white dark:bg-slate-900 ${
                b.unlocked
                  ? 'border-violet-200 dark:border-violet-800 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    b.unlocked
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                  }`}
                >
                  {b.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    b.unlocked
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}
                >
                  {b.unlocked ? 'Tercapai' : 'Terkunci'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">{b.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 4: LEADERBOARD PEJUANG KARIR */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Top Leaderboard Pejuang Karir Minggu Ini</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pencari kerja teraktif mengumpulkan Koin dan menyelesaikan misi
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Reset Mingguan
            </span>
          </div>

          <div className="space-y-2">
            {leaderboardList.map((user) => (
              <div
                key={user.rank}
                className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                  user.rank === 5
                    ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/80 font-bold'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    #{user.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {user.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{user.title} • Level {user.level}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                    {user.coins.toLocaleString('id-ID')} Koin
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Total Terkumpul</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: RIWAYAT KOIN */}
      {activeSubTab === 'riwayat' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-violet-600" />
            <span>Riwayat Perolehan & Penukaran Koin</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {coinHistory.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{log.desc}</h4>
                  <p className="text-[11px] text-slate-400">{log.date}</p>
                </div>

                <span
                  className={`font-black text-sm ${
                    log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {log.amount} Koin
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RIGHT-HAND REDEMPTION DRAWER */}
      {selectedRedeemItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="absolute inset-0" onClick={() => setSelectedRedeemItem(null)} />

          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Penukaran Koin Cuan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Proses pencairan reward instan ke akun Anda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRedeemItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            {isRedeemSuccess ? (
              <div className="p-8 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg">
                  <CheckCheck className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Penukaran Berhasil Diajukan!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                    Pencairan **{selectedRedeemItem.title}** senilai **{selectedRedeemItem.cost.toLocaleString('id-ID')} Koin** sedang diproses otomatis ke **{payoutProvider} ({payoutDestination})**.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 w-full text-left text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Sisa Saldo Koin Anda:</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">{userCoins.toLocaleString('id-ID')} Koin</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimasi Waktu:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">1 - 5 Menit</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRedeemItem(null)}
                  className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmRedeem} className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Item Summary */}
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                      {selectedRedeemItem.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {selectedRedeemItem.title}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                      {selectedRedeemItem.cost.toLocaleString('id-ID')} Koin
                    </span>
                  </div>
                </div>

                {/* Provider Selection */}
                {selectedRedeemItem.category === 'E-Wallet' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Pilih Penyedia E-Wallet
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['GoPay', 'OVO', 'DANA'].map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setPayoutProvider(prov)}
                          className={`p-2.5 rounded-lg border text-xs font-bold text-center transition cursor-pointer ${
                            payoutProvider === prov
                              ? 'border-violet-600 bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account / Phone Number Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nomor Handphone / ID Akun Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={payoutDestination}
                      onChange={(e) => setPayoutDestination(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pastikan nomor handphone terhubung dengan akun {payoutProvider} yang aktif.
                  </p>
                </div>

                {/* Balance Check Info */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Saldo Koin Anda:</span>
                    <span className="font-bold">{userCoins.toLocaleString('id-ID')} Koin</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Biaya Penukaran:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-{selectedRedeemItem.cost.toLocaleString('id-ID')} Koin</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Sisa Saldo Setelah Transaksi:</span>
                    <span className="text-violet-600 dark:text-violet-400">{(userCoins - selectedRedeemItem.cost).toLocaleString('id-ID')} Koin</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRedeemItem(null)}
                    className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition cursor-pointer"
                  >
                    Konfirmasi &amp; Tukar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MISI MODAL */}
      {selectedMissionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity">
          <div className="absolute inset-0" onClick={() => setSelectedMissionDetail(null)} />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    {selectedMissionDetail.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    Detail Misi Karir
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedMissionDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Mission Title & Rewards */}
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedMissionDetail.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedMissionDetail.desc}
                </p>
              </div>

              {/* Reward & Progress Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <div>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold block">Reward Misi</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                        +{selectedMissionDetail.rewardCoins.toLocaleString('id-ID')} Koin &amp; +{selectedMissionDetail.rewardXp} XP
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedMissionDetail.claimed
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : selectedMissionDetail.progressCurrent >= selectedMissionDetail.progressTarget
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
                  }`}>
                    {selectedMissionDetail.claimed ? 'Telah Diklaim' : selectedMissionDetail.progressCurrent >= selectedMissionDetail.progressTarget ? 'Siap Diklaim!' : 'Dalam Proses'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    <span>Progress Misi</span>
                    <span>{selectedMissionDetail.progressCurrent} / {selectedMissionDetail.progressTarget} Selesai</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedMissionDetail.progressCurrent / selectedMissionDetail.progressTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Langkah Penyelesaian */}
              {selectedMissionDetail.detailedSteps && selectedMissionDetail.detailedSteps.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                    <span>Langkah-Langkah Penyelesaian</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedMissionDetail.detailedSteps.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
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

              {/* Tips AI */}
              {selectedMissionDetail.tips && (
                <div className="p-3.5 rounded-lg bg-violet-50/70 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span>Tips Sukses AI</span>
                  </div>
                  <p className="text-xs text-violet-900/80 dark:text-violet-200/80 leading-relaxed pl-5">
                    {selectedMissionDetail.tips}
                  </p>
                </div>
              )}

              {/* Syarat & Ketentuan */}
              {selectedMissionDetail.terms && (
                <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-bold block text-slate-500">Syarat &amp; Ketentuan:</span>
                  <p>{selectedMissionDetail.terms}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedMissionDetail(null)}
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>

              {selectedMissionDetail.claimed ? (
                <button disabled className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-default">
                  Misi Telah Diklaim
                </button>
              ) : selectedMissionDetail.progressCurrent >= selectedMissionDetail.progressTarget ? (
                <button
                  onClick={() => handleClaimReward(selectedMissionDetail.id)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  <span>Klaim +{selectedMissionDetail.rewardCoins.toLocaleString('id-ID')} Koin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleDoMissionStep(selectedMissionDetail.id);
                  }}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Kerjakan Misi Ini (+1 Progress)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
