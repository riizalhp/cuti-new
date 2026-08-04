'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Play,
  Square,
  FileText,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Info,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Layers,
  Settings,
  History,
  Code,
  ListFilter,
  Check,
} from 'lucide-react';

interface MockCV {
  id: string;
  title: string;
  updatedAt: string;
  atsScore: number;
}

const mockCVs: MockCV[] = [
  {
    id: 'cv-1',
    title: 'CV Software Engineer (Utama)',
    updatedAt: '22 Juli 2026',
    atsScore: 88,
  },
  {
    id: 'cv-2',
    title: 'CV Data Analyst ATS version',
    updatedAt: '18 Juli 2026',
    atsScore: 82,
  },
  {
    id: 'cv-3',
    title: 'CV Product Manager (English)',
    updatedAt: '10 Juli 2026',
    atsScore: 78,
  },
];

interface JobPlatform {
  id: string;
  name: string;
  color: string;
  icon: string;
  connected: boolean;
}

const initialPlatforms: JobPlatform[] = [
  { id: 'linkedin', name: 'LinkedIn (Easy Apply)', color: 'bg-[#0077B5]/20 text-[#0077B5] border-[#0077B5]/30', icon: 'linkedin', connected: true },
  { id: 'jobstreet', name: 'Jobstreet AI Portal', color: 'bg-[#0F2D69]/20 text-[#1F53B7] border-[#1F53B7]/30', icon: 'jobstreet', connected: true },
  { id: 'glints', name: 'Glints FastApply', color: 'bg-[#017EFA]/20 text-[#017EFA] border-[#017EFA]/30', icon: 'glints', connected: false },
  { id: 'kalibrr', name: 'Kalibrr Instant Match', color: 'bg-[#00BBC6]/20 text-[#00BBC6] border-[#00BBC6]/30', icon: 'kalibrr', connected: true },
  { id: 'techinasia', name: 'Tech in Asia Jobs', color: 'bg-[#FF5A5F]/20 text-[#FF5A5F] border-[#FF5A5F]/30', icon: 'techinasia', connected: false },
];

interface ApplicationLog {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  platform: string;
  cvTitle: string;
  date: string;
  time: string;
  status: 'applied' | 'processing' | 'failed' | 'interview';
  remarks?: string;
}

const mockLogs: ApplicationLog[] = [
  {
    id: 'log-1',
    jobTitle: 'Frontend Engineer (React)',
    company: 'Tokopedia',
    location: 'Jakarta (Hybrid)',
    platform: 'LinkedIn',
    cvTitle: 'CV Software Engineer (Utama)',
    date: 'Hari ini',
    time: '09:30',
    status: 'applied',
    remarks: 'CV & Cover letter berhasil terkirim via Easy Apply',
  },
  {
    id: 'log-2',
    jobTitle: 'Software Engineer - Intern',
    company: 'GoTo Financial',
    location: 'Remote (Indonesia)',
    platform: 'Glints',
    cvTitle: 'CV Software Engineer (Utama)',
    date: 'Hari ini',
    time: '08:15',
    status: 'applied',
    remarks: 'Auto-apply terjadwal sukses',
  },
  {
    id: 'log-3',
    jobTitle: 'Junior Data Analyst',
    company: 'Traveloka',
    location: 'Jakarta Selatan',
    platform: 'Jobstreet',
    cvTitle: 'CV Data Analyst ATS version',
    date: 'Kemarin',
    time: '17:40',
    status: 'interview',
    remarks: 'Panggilan Interview - Diteruskan ke menu Tracker Lamaran',
  },
  {
    id: 'log-4',
    jobTitle: 'React Native Developer',
    company: 'Bukalapak',
    location: 'Bandung (WFO)',
    platform: 'Kalibrr',
    cvTitle: 'CV Software Engineer (Utama)',
    date: 'Kemarin',
    time: '14:20',
    status: 'failed',
    remarks: 'Gagal: Kredensial akun Kalibrr expired. Harap hubungkan ulang.',
  },
];

export const AutoApplyView: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Frontend Developer');
  const [location, setLocation] = useState('Jakarta (Hybrid/Remote)');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [selectedCv, setSelectedCv] = useState('cv-1');
  const [platforms, setPlatforms] = useState<JobPlatform[]>(initialPlatforms);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'jobstreet']);
  const [isAutoApplyActive, setIsAutoApplyActive] = useState(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [dailyAppliedCount, setDailyAppliedCount] = useState(12);
  const [dailyLimit, setDailyLimit] = useState(25);
  const [logs, setLogs] = useState<ApplicationLog[]>(mockLogs);

  // Bot simulator logging effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoApplyActive) {
      setBotLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🚀 Memulai Engine AI Auto Apply...`,
        `[${new Date().toLocaleTimeString()}] 🤖 Mengambil lowongan terbaru untuk posisi "${jobTitle}" di "${location}"...`,
        ...prev,
      ]);

      let step = 0;
      interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        if (step === 0) {
          setBotLogs((prev) => [
            `[${timestamp}] 🔍 Menemukan 14 lowongan yang cocok di LinkedIn & Jobstreet.`,
            `[${timestamp}] 📄 Membandingkan keyword CV "${mockCVs.find(c => c.id === selectedCv)?.title}" dengan deskripsi kerja...`,
            ...prev,
          ]);
          step++;
        } else if (step === 1) {
          setBotLogs((prev) => [
            `[${timestamp}] ✅ Match Rate: 84% untuk pos "Frontend Web Dev" di Blibli.com.`,
            `[${timestamp}] ✍️ Mengenerate Cover Letter kustom berbasis deskripsi lowongan...`,
            ...prev,
          ]);
          step++;
        } else if (step === 2) {
          // Add new application to list
          const newApp: ApplicationLog = {
            id: `log-${Date.now()}`,
            jobTitle: `${jobTitle} (${['React', 'Next.js', 'Web'].sort(() => 0.5 - Math.random())[0]})`,
            company: ['Blibli.com', 'Dana Indonesia', 'Ruangguru', 'Astra International'].sort(() => 0.5 - Math.random())[0],
            location: location,
            platform: selectedPlatforms[Math.floor(Math.random() * selectedPlatforms.length)] === 'linkedin' ? 'LinkedIn' : 'Jobstreet',
            cvTitle: mockCVs.find(c => c.id === selectedCv)?.title || 'CV Saya',
            date: 'Hari ini',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'applied',
            remarks: 'AI Auto-Apply sukses: Terkirim dengan kustomisasi cover letter.',
          };

          setLogs((prev) => [newApp, ...prev]);
          setDailyAppliedCount((prev) => prev + 1);

          setBotLogs((prev) => [
            `[${timestamp}] 🎉 SUKSES! Melamar ke "${newApp.jobTitle}" di "${newApp.company}"`,
            `[${timestamp}] 📊 Memperbarui dashboard status lamaran...`,
            `[${timestamp}] ⏳ Menunggu jeda delay keamanan robot (3 menit) untuk menghindari limitasi deteksi...`,
            ...prev,
          ]);
          step = 0; // Loop simulation
        }
      }, 5000);
    } else {
      setBotLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⏹️ Engine AI Auto Apply dihentikan.`,
        ...prev,
      ]);
    }

    return () => clearInterval(interval);
  }, [isAutoApplyActive, jobTitle, location, selectedCv, selectedPlatforms]);

  const handleTogglePlatform = (id: string, isConnected: boolean) => {
    if (!isConnected) {
      alert(`Harap sambungkan kredensial akun platform terlebih dahulu di menu Pengaturan / Integrasi.`);
      return;
    }
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleStartStop = () => {
    if (selectedPlatforms.length === 0) {
      alert('Harap pilih minimal 1 platform target auto apply.');
      return;
    }
    setIsAutoApplyActive(!isAutoApplyActive);
  };

  return (
    <div className="space-y-8 p-1">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-violet-500 animate-pulse" />
            <span>AI Auto Apply Jobs</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Teknologi automasi pencari & pelamar kerja AI. Melamar lowongan terkurasi yang sesuai dengan skor kepantasan CV-mu secara otomatis 24/7.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 px-4 shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
            Engine Status: {isAutoApplyActive ? 'Mengirim Lamaran...' : 'Siaga'}
          </span>
        </div>
      </div>

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Control Panel Container (7-cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-violet-500" />
                <span>Konfigurasi Robot AI</span>
              </h3>
              <span className="text-[10px] bg-violet-500/20 text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded-md">
                PRO FEATURE
              </span>
            </div>

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Nama Posisi Pekerjaan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Contoh: Frontend React, Node Developer"
                    disabled={isAutoApplyActive}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Lokasi / Preferensi Kerja
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jakarta (Hybrid), Remote"
                  disabled={isAutoApplyActive}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Pilih CV yang Digunakan
                </label>
                <div className="relative">
                  <select
                    value={selectedCv}
                    onChange={(e) => setSelectedCv(e.target.value)}
                    disabled={isAutoApplyActive}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 appearance-none"
                  >
                    {mockCVs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title} (ATS Score: {cv.atsScore})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Level Pengalaman Target
                </label>
                <div className="relative">
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    disabled={isAutoApplyActive}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 appearance-none"
                  >
                    <option value="entry">Entry-Level / Magang / Freshgrad</option>
                    <option value="junior">Junior (1-2 tahun)</option>
                    <option value="mid">Mid-Senior (2-5 tahun)</option>
                    <option value="senior">Senior / Lead (5+ tahun)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Target Platform Pekerjaan (Hubungkan Kredensial)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      disabled={isAutoApplyActive}
                      onClick={() => handleTogglePlatform(platform.id, platform.connected)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                        isSelected
                          ? 'border-violet-500 bg-violet-500/10 text-slate-900 dark:text-white ring-1 ring-violet-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                      } ${!platform.connected && 'opacity-60 grayscale'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black">{platform.name}</span>
                        {isSelected && platform.connected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-violet-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between w-full mt-auto">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          platform.connected
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-400/20 text-slate-500'
                        }`}>
                          {platform.connected ? 'Tersambung' : 'Belum Konek'}
                        </span>

                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {platform.id}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application Limit Settings and Toggle */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Batas Harian AI
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(Number(e.target.value))}
                      disabled={isAutoApplyActive}
                      className="w-16 px-2 py-1 text-xs text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-500">Lamaran per hari</span>
                  </div>
                </div>

                <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Berhasil Hari Ini
                  </span>
                  <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                    {dailyAppliedCount} / {dailyLimit}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartStop}
                  className={`px-6 py-3.5 rounded-xl font-black text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 shrink-0 ${
                    isAutoApplyActive
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                      : 'bg-gradient-to-r from-violet-600 to-amber-500 hover:opacity-90 text-white shadow-violet-600/20'
                  }`}
                >
                  {isAutoApplyActive ? (
                    <>
                      <Square className="w-4 h-4 fill-white" />
                      <span>Hentikan AI Robot</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Mulai Auto Apply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Console Logs (5-cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="glass-card bg-slate-950 text-slate-200 border border-slate-800 p-6 rounded-2xl h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Console AI Log (Real-time)</span>
              </h3>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md text-[10px]">
                <Clock className="w-3 h-3 animate-spin" />
                <span>LIVE</span>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] max-h-[330px] font-mono text-[10px] leading-relaxed overflow-y-auto mt-4 space-y-2 p-3 bg-slate-900/60 border border-slate-900 rounded-xl no-scrollbar flex flex-col-reverse">
              {botLogs.length === 0 ? (
                <div className="text-slate-500 italic py-8 text-center flex flex-col items-center justify-center gap-2">
                  <Info className="w-6 h-6 text-slate-500" />
                  <span>Tekan tombol &quot;Mulai Auto Apply&quot; untuk menjalankan robot pencari kerja AI.</span>
                </div>
              ) : (
                botLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`border-l-2 pl-2 transition-all ${
                      log.includes('🎉')
                        ? 'border-emerald-500 text-emerald-400 font-bold'
                        : log.includes('🚨') || log.includes('Gagal')
                        ? 'border-rose-500 text-rose-400'
                        : log.includes('🔍')
                        ? 'border-amber-500 text-amber-300'
                        : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/85 mt-4 space-y-2.5 text-[11px] text-slate-400">
              <p className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>AI secara otomatis mencocokkan CV-mu dengan kriteria lowongan (Min. Match Rate 75%).</span>
              </p>
              <p className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Algoritma anti-spam disematkan untuk menjamin keamanan akun &amp; menghindari limitasi platform kerja.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History log title */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-violet-500" />
            <span>Riwayat Auto Apply</span>
          </h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Filter Platform</span>
          </button>
        </div>

        {/* History Tables */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Perusahaan & Posisi</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dokumen CV</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lokasi</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Platform</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Waktu</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/55 dark:hover:bg-slate-900/35 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                            {log.jobTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {log.company}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">{log.cvTitle}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.location}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md">
                        {log.platform}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <span>{log.date}</span>
                        <span className="block text-[9px] text-slate-400 mt-0.5">{log.time}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'applied'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : log.status === 'interview'
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : log.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {log.status === 'applied' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'interview' && <Sparkles className="w-3 h-3" />}
                        {log.status === 'failed' && <XCircle className="w-3 h-3" />}
                        {log.status === 'processing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                        <span>
                          {log.status === 'applied' && 'Terkirim'}
                          {log.status === 'interview' && 'Interview'}
                          {log.status === 'failed' && 'Gagal'}
                          {log.status === 'processing' && 'Memproses'}
                        </span>
                      </span>
                      {log.remarks && (
                        <span className="block text-[9px] text-slate-400 mt-1 max-w-[200px] truncate" title={log.remarks}>
                          {log.remarks}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <a
                        href="/tracker"
                        className="p-2 inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition"
                      >
                        <span>Lihat Detail</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/25 flex items-center justify-between text-xs text-slate-500">
            <span>Menampilkan 4 dari 4 total lamaran terautomasi</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-[10px] font-bold">Sebelumnya</button>
              <button disabled className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-[10px] font-bold">Berikutnya</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
