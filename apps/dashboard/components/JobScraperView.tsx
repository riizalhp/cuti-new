'use client';

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
  Info
} from 'lucide-react';

export interface ExtractedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  portal: 'LinkedIn' | 'Jobstreet' | 'Glints' | 'Kalibrr' | 'KitaLulus' | 'Karir.com';
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

const mockExtractedJobs: ExtractedJob[] = [
  {
    id: 'job-scrape-1',
    title: 'Frontend Web Developer (React / Next.js)',
    company: 'PT Global Digital Niaga (Blibli.com)',
    location: 'Jakarta Barat (Hybrid)',
    salary: 'Rp 9.000.000 - Rp 14.000.000',
    portal: 'Jobstreet',
    portalUrl: 'https://www.jobstreet.co.id',
    jobType: 'Full-time',
    experience: 'Junior',
    postedTime: '2 jam yang lalu',
    extractedTime: 'Baru saja',
    matchScore: 92,
    description: 'Kami mencari Frontend Web Developer yang berpengalaman dalam membangun antarmuka web modern, responsif, dan berperforma tinggi menggunakan React.js dan Next.js. Anda akan bekerja langsung dengan tim UI/UX dan backend developer.',
    requirements: [
      'Pendidikan Minimal SMA/SMK atau D3/S1 Teknik Informatika/Ilmu Komputer',
      'Pengalaman 1-2 tahun memproduksi aplikasi web dengan React.js atau Next.js',
      'Menguasai HTML5, CSS3, Tailwind CSS, TypeScript, dan Git',
      'Memahami arsitektur REST API & tRPC',
      'Memiliki portofolio proyek web yang aktif dan dapat diakses'
    ],
    skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Git', 'REST API'],
    isSaved: false,
  },
  {
    id: 'job-scrape-2',
    title: 'Junior Data & Business Analyst',
    company: 'DANA Indonesia (PT Espay Debit Indonesia)',
    location: 'Jakarta Selatan (Hybrid)',
    salary: 'Rp 8.500.000 - Rp 12.000.000',
    portal: 'LinkedIn',
    portalUrl: 'https://www.linkedin.com',
    jobType: 'Full-time',
    experience: 'Junior',
    postedTime: '4 jam yang lalu',
    extractedTime: '1 menit yang lalu',
    matchScore: 86,
    description: 'Bertanggung jawab menganalisis tren transaksi pengguna, membuat dasbor visualisasi data metrik bisnis, dan menyusun rekomendasi keputusan operasional berbasis data riil.',
    requirements: [
      'Gelar Sarjana atau D3 di bidang Statistik, Matematika, Teknik, atau Ekonomi',
      'Mahir mengolah data menggunakan SQL, Python (Pandas/NumPy), dan Excel',
      'Terbiasa membuat laporan analisis menggunakan Tableau atau PowerBI',
      'Memiliki pemikiran analitis yang tajam dan orientasi pada detail'
    ],
    skills: ['SQL', 'Python', 'Excel Advanced', 'Tableau', 'Data Visualization'],
    isSaved: true,
  },
  {
    id: 'job-scrape-3',
    title: 'UI/UX Designer & Product Specialist',
    company: 'Ruangguru (PT Ruang Raya Indonesia)',
    location: 'Jakarta Selatan (Remote)',
    salary: 'Rp 7.500.000 - Rp 11.000.000',
    portal: 'Glints',
    portalUrl: 'https://glints.com',
    jobType: 'Full-time',
    experience: 'Entry-level',
    postedTime: '5 jam yang lalu',
    extractedTime: '2 menit yang lalu',
    matchScore: 88,
    description: 'Merancang wireframe, mockup interaktif, dan Design System komponen antarmuka aplikasi seluler & web Ruangguru untuk pengalaman belajar siswa yang intuitif.',
    requirements: [
      'Terbuka untuk Fresh Graduate SMA/SMK atau Lulusan Perguruan Tinggi dengan portofolio UI/UX yang kuat',
      'Mahir menggunakan Figma, FigJam, dan tools prototyping',
      'Memahami tata letak visual, hirarki tipografi, serta prinsip keterbacaan (HIG/WCAG)',
      'Mampu melakukan testing usability singkat ke pengguna'
    ],
    skills: ['Figma', 'Prototyping', 'User Research', 'Design System', 'Wireframing'],
    isSaved: false,
  },
  {
    id: 'job-scrape-4',
    title: 'Digital Marketing & Social Media Executive',
    company: 'Astra Digital (PT Astra International Tbk)',
    location: 'Jakarta Pusat (WFO)',
    salary: 'Rp 6.500.000 - Rp 9.000.000',
    portal: 'Kalibrr',
    portalUrl: 'https://www.kalibrr.com',
    jobType: 'Full-time',
    experience: 'Entry-level',
    postedTime: '6 jam yang lalu',
    extractedTime: '3 menit yang lalu',
    matchScore: 78,
    description: 'Mengelola kampanye konten media sosial, menganalisis performa iklan digital (Meta Ads & TikTok Ads), serta menyusun strategi keterikatan audiens muda.',
    requirements: [
      'Pendidikan Minimal SMA/SMK Sederajat / D3 / S1 Komunikasi/Marketing',
      'Memahami tren media sosial (TikTok, Instagram Reels, LinkedIn)',
      'Mampu mengoperasikan tools analitik dasar dan Meta Ads Manager',
      'Kreatif, percaya diri, dan memiliki kemampuan copywrite yang komunikatif'
    ],
    skills: ['Social Media', 'Copywriting', 'Meta Ads', 'Content Strategy', 'Analytics'],
    isSaved: false,
  },
  {
    id: 'job-scrape-5',
    title: 'Customer Success & Operation Associate',
    company: 'Kopi Kenangan (PT Bumi Berkah Boga)',
    location: 'Jakarta Barat (Onsite)',
    salary: 'Rp 5.500.000 - Rp 7.500.000',
    portal: 'KitaLulus',
    portalUrl: 'https://kitalulus.com',
    jobType: 'Full-time',
    experience: 'Entry-level',
    postedTime: '8 jam yang lalu',
    extractedTime: '5 menit yang lalu',
    matchScore: 82,
    description: 'Melayani dan menangani keluhan serta masukan pelanggan melalui kanal digital, memastikan kepuasan konsumen terjaga, serta berkoordinasi dengan tim operasional toko.',
    requirements: [
      'Pendidikan Minimal SMA / SMK / D3 Semua Jurusan',
      'Memiliki kemampuan komunikasi yang ramah, sopan, dan berempati tinggi',
      'Terbiasa mengetik cepat dan menggunakan perangkat lunak CRM dasar',
      'Bersedia bekerja fleksibel'
    ],
    skills: ['Customer Service', 'CRM', 'Communication', 'Problem Solving'],
    isSaved: false,
  },
  {
    id: 'job-scrape-6',
    title: 'Junior Admin & Operations Staff',
    company: 'PT Tiki Jalur Nugraha Ekakurir (JNE)',
    location: 'Tangerang (Onsite)',
    salary: 'Rp 4.800.000 - Rp 6.200.000',
    portal: 'Karir.com',
    portalUrl: 'https://karir.com',
    jobType: 'Full-time',
    experience: 'Entry-level',
    postedTime: '12 jam yang lalu',
    extractedTime: '8 menit yang lalu',
    matchScore: 80,
    description: 'Melakukan entri data pengiriman, rekapitulasi dokumen operasional harian, dan pengarsipan surat masuk/keluar cabang distribusi.',
    requirements: [
      'Lulusan SMA/SMK Administrasi Perkantoran / Akuntansi / Umum',
      'Mahir mengoperasikan Microsoft Excel (VLOOKUP, Pivot Table) & Microsoft Word',
      'Teliti, jujur, berdedikasi, dan terbiasa dengan tenggat waktu'
    ],
    skills: ['Ms Excel', 'Administration', 'Data Entry', 'Archiving'],
    isSaved: false,
  },
];

interface PortalOption {
  id: 'LinkedIn' | 'Jobstreet' | 'Glints' | 'Kalibrr' | 'KitaLulus' | 'Karir.com';
  name: string;
  activeCount: number;
  status: 'Aktif' | 'Tersedia';
}

const portalsList: PortalOption[] = [
  { id: 'Jobstreet', name: 'JobStreet', activeCount: 1420, status: 'Aktif' },
  { id: 'LinkedIn', name: 'LinkedIn', activeCount: 980, status: 'Aktif' },
  { id: 'Glints', name: 'Glints', activeCount: 750, status: 'Aktif' },
  { id: 'Kalibrr', name: 'Kalibrr', activeCount: 430, status: 'Aktif' },
  { id: 'KitaLulus', name: 'KitaLulus', activeCount: 620, status: 'Aktif' },
  { id: 'Karir.com', name: 'Karir.com', activeCount: 310, status: 'Aktif' },
];

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
  const [selectedPortals, setSelectedPortals] = useState<string[]>(['Jobstreet', 'LinkedIn', 'Glints']);
  
  // Extraction State & Log Simulation
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<ExtractedJob[]>(mockExtractedJobs);
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

  // Simulation Log Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [
        `[${now}] 🌐 Menginisialisasi sistem ekstraksi data lowongan...`,
        `[${now}] 🔍 Menghubungkan ke ${selectedPortals.length} portal penyedia loker (${selectedPortals.join(', ')})...`,
        ...prev,
      ]);

      let step = 0;
      interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        if (step === 0) {
          setLogs((prev) => [
            `[${timestamp}] 📡 Mengirim permintaan pemindaian posisi "${keyword}" wilayah "${location}"...`,
            `[${timestamp}] ⚡ Menerima payload data dari JobStreet & LinkedIn (HTTP Status 200 OK)...`,
            ...prev,
          ]);
          step++;
        } else if (step === 1) {
          setLogs((prev) => [
            `[${timestamp}] 🛠️ Mengekstraksi struktur kualifikasi, deskripsi, dan estimasi rentang gaji...`,
            `[${timestamp}] 🛡️ Menjalankan deduplikasi data otomatis (2 loker duplikat berhasil disaring)...`,
            ...prev,
          ]);
          step++;
        } else if (step === 2) {
          // Generate new mock job entry
          const newScrapedJob: ExtractedJob = {
            id: `job-scrape-${Date.now()}`,
            title: `${keyword} (${['React', 'Web', 'Fullstack', 'Frontend'].sort(() => 0.5 - Math.random())[0]})`,
            company: ['Tokopedia', 'Gojek', 'Traveloka', 'Bukalapak', 'Bank Mandiri'].sort(() => 0.5 - Math.random())[0],
            location: location,
            salary: 'Rp 8.000.000 - Rp 13.000.000',
            portal: (selectedPortals[Math.floor(Math.random() * selectedPortals.length)] as any) || 'Jobstreet',
            portalUrl: 'https://jobstreet.co.id',
            jobType: 'Full-time',
            experience: 'Junior',
            postedTime: 'Baru saja',
            extractedTime: 'Baru saja',
            matchScore: Math.floor(Math.random() * 18) + 80,
            description: `Lowongan ${keyword} baru ditemukan via pemindaian real-time. Membutuhkan kualifikasi relevan dan keahlian koding modern.`,
            requirements: [
              'Pendidikan Minimal SMA/SMK atau S1',
              'Memahami dasar pengembangan antarmuka web modern',
              'Memiliki komunikasi yang baik dan mampu bekerja dalam tim'
            ],
            skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Problem Solving'],
            isSaved: false,
          };

          setJobs((prev) => [newScrapedJob, ...prev]);
          setLogs((prev) => [
            `[${timestamp}] ✅ EKSTRAKSI SUKSES: Lowongan "${newScrapedJob.title}" di ${newScrapedJob.company} terdaftar (Match Score: ${newScrapedJob.matchScore}%).`,
            `[${timestamp}] 📊 Memperbarui daftar hasil pemindaian di dasbor...`,
            ...prev,
          ]);
          step = 0;
        }
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [isScanning, keyword, location, selectedPortals]);

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

  const handleToggleScan = () => {
    if (!isScanning) {
      if (!keyword.trim()) {
        showToast('Masukkan posisi atau kata kunci pekerjaan.');
        return;
      }
      setIsScanning(true);
      showToast('Pemindaian lowongan kerja dimulai secara real-time.');
    } else {
      setIsScanning(false);
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [`[${timestamp}] ⏹️ Sesi pemindaian lowongan dihentikan.`, ...prev]);
      showToast('Sesi pemindaian dihentikan.');
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
      <div className="relative overflow-hidden rounded-[10px] bg-[#0D3BD9] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-[10px] text-[11px] font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
              <Globe className="w-3.5 h-3.5" /> Scraper Lowongan Pekerjaan
            </span>
            <span className="px-3 py-1 rounded-[10px] text-[11px] font-semibold bg-white/10 text-white backdrop-blur-xs border border-white/15 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              {isScanning ? 'Memindai Real-time' : 'Siaga'}
            </span>
            <span className="px-3 py-1 rounded-[10px] text-[11px] font-semibold bg-white/10 text-white backdrop-blur-xs border border-white/15 hidden sm:flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-300" /> 6 Portal Loker Terkonek
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
            Pemindai &amp; Ekstraktor Lowongan Kerja
          </h1>
          <p className="text-xs md:text-sm text-blue-100/90 max-w-3xl leading-relaxed">
            Dapatkan informasi lowongan kerja aktif terpercaya dari berbagai portal karir Indonesia secara otomatis. Sistem mencocokkan kualifikasi dengan skor kepantasan CV-mu.
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-36 h-36 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
      </div>

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
                  return (
                    <button
                      key={portal.id}
                      type="button"
                      disabled={isScanning}
                      onClick={() => handleTogglePortal(portal.id)}
                      className={`p-3 rounded-[10px] border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-500/10 text-slate-900 dark:text-white ring-1 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black">{portal.name}</span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full mt-2 text-[9px]">
                        <span className="text-slate-400 font-medium">{portal.activeCount}+ loker</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                          {portal.status}
                        </span>
                      </div>
                    </button>
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
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
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
            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
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
                className="glass-card p-5 rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
              >
                <div className="space-y-3">
                  {/* Top Badges (Portal & Match Score) */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase ${
                      job.portal === 'LinkedIn'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : job.portal === 'Jobstreet'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : job.portal === 'Glints'
                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {job.portal}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
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
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
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
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform"
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
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                    {selectedJobForDetail.portal}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
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
                  <Tag className="w-4 h-4 text-purple-500" /> Keahlian &amp; Keyword Kunci
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobForDetail.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-[10px] text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
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
                className="px-5 py-2.5 rounded-[10px] font-extrabold text-xs bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition flex items-center gap-1.5"
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
                      <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
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
