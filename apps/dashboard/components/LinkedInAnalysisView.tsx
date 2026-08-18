'use client';

import React, { useState, useEffect } from 'react';
import {
  Linkedin,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Award,
  Share2,
  FileText,
  Target,
  ShieldCheck,
  Zap,
  Briefcase,
  Lightbulb,
  User,
  MapPin,
  Users,
  GraduationCap,
  Code2,
  ArrowRight,
  ChevronRight,
  Database,
  CheckCircle,
  FolderGit2,
  ExternalLink,
  BadgeCheck,
  Download,
} from 'lucide-react';

interface LinkedInAnalysisViewProps {
  isDarkMode?: boolean;
  onOpenUpgradeModal?: () => void;
}

export interface ScrapedProfileData {
  name: string;
  headline: string;
  about: string;
  location: string;
  connections: string;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    title: string;
    role?: string;
    duration?: string;
    description: string;
    techStack?: string[];
    url?: string;
  }>;
  skills: string[];
}

export const LinkedInAnalysisView: React.FC<LinkedInAnalysisViewProps> = ({
  onOpenUpgradeModal,
}) => {
  // Input State (Primary: Profile Link URL)
  const [profileUrl, setProfileUrl] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // UI Flow States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // LinkedIn Auth (semi-otomatis: sesi login pengguna sendiri)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Extracted/Scraped Data State
  const [scrapedData, setScrapedData] = useState<ScrapedProfileData>({
    name: '',
    headline: '',
    about: '',
    location: '',
    connections: '',
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    skills: [],
  });

  // Assessment & Recommendations Results State
  const [analysisResult, setAnalysisResult] = useState<{
    overallScore: number;
    ssiScore: number;
    profileStatus: string;
    scoreBreakdown: {
      headline: number;
      about: number;
      experience: number;
      keywords: number;
      engagement: number;
    };
    headlines: Array<{ title: string; text: string; keywords: string; impact: string }>;
    optimizedAbout: string;
    keySkills: string[];
    missingKeywords: string[];
    experienceBulletPoints: string[];
    networkingMessages: Array<{ type: string; recipient: string; template: string }>;
    auditFindings: Array<{ category: string; status: 'good' | 'warning' | 'critical'; tip: string }>;
  }>({
    overallScore: 0,
    ssiScore: 0,
    profileStatus: '',
    scoreBreakdown: {
      headline: 0,
      about: 0,
      experience: 0,
      keywords: 0,
      engagement: 0,
    },
    headlines: [],
    optimizedAbout: '',
    keySkills: [],
    missingKeywords: [],
    experienceBulletPoints: [],
    networkingMessages: [],
    auditFindings: [],
  });

  // Handle Fill Demo Link
  const handleFillDemoLink = (url: string, role: string) => {
    setProfileUrl(url);
    setTargetRole(role);
  };

  // Handle Copy Text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle Login LinkedIn (semi-otomatis: user login manual di browser)
  const handleLoginLinkedIn = async () => {
    setIsLoginLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/linkedin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || 'Login gagal.');
      } else {
        setIsLoggedIn(true);
      }
    } catch {
      setAuthError('Gagal membuka browser login. Silakan coba lagi.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle Logout LinkedIn
  const handleLogoutLinkedIn = async () => {
    await fetch('/api/linkedin/logout', { method: 'POST' }).catch(() => null);
    setIsLoggedIn(false);
    setAuthError(null);
  };

  // Cek status sesi saat halaman dimuat
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/linkedin/auth-status');
        const data = await res.json();
        setIsLoggedIn(!!data.loggedIn);
      } catch {
        setIsLoggedIn(false);
      }
    })();
  }, []);

  // Handle Unduh Data Profil (JSON)
  const handleDownloadProfile = () => {
    const blob = new Blob([JSON.stringify(scrapedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-profile-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Extraction (scraping ASLI via Playwright + sesi login pengguna)
  const handleScrapeAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl) return;

    setIsLoading(true);
    setHasAnalyzed(false);
    setScrapeError(null);
    setLoadingStep(1);

    try {
      // Step 1: Pastikan sesi login LinkedIn tersedia
      const authRes = await fetch('/api/linkedin/auth-status');
      const authData = await authRes.json();
      if (!authData.loggedIn) {
        setScrapeError('Belum ada sesi login LinkedIn. Klik tombol "Login LinkedIn" untuk membuka browser login, lalu coba lagi.');
        setIsLoading(false);
        return;
      }
      setLoadingStep(2);

      // Step 2: Ekstraksi data profil ASLI dari link (pakai sesi login user)
      const scrapeRes = await fetch('/api/linkedin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: profileUrl }),
      });
      const scrapeData = await scrapeRes.json();
      if (!scrapeData.success) {
        setScrapeError(scrapeData.error || 'Gagal mengekstrak profil LinkedIn.');
        setIsLoading(false);
        return;
      }

      // Data asli hasil scraping langsung ditampilkan (bukan tebakan AI)
      setScrapedData(scrapeData.data);
      setLoadingStep(3);
      setHasAnalyzed(true);

      // Step 3 (opsional): AI hanya menganalisis data yang SUDAH ter-scrape
      const analysisPrompt = `Analisis data profil LinkedIn berikut yang telah berhasil diekstrak:
${JSON.stringify(scrapeData.data)}

Target posisi: ${targetRole || 'Sesuai Profil'}

Kembalikan HANYA JSON valid:
{
  "analysisResult": {
    "overallScore": 85,
    "ssiScore": 79,
    "profileStatus": "Sangat Baik (All-Star Level)",
    "scoreBreakdown": { "headline": 82, "about": 85, "experience": 80, "keywords": 88, "engagement": 84 },
    "headlines": [
      { "title": "Format High-Converting HR (Disarankan)", "text": "...", "keywords": "...", "impact": "..." },
      { "title": "Format Result-Oriented & Impact Focused", "text": "...", "keywords": "...", "impact": "..." },
      { "title": "Format Growth & Specialization", "text": "...", "keywords": "...", "impact": "..." }
    ],
    "optimizedAbout": "Teks bio yang dioptimalkan...",
    "keySkills": ["Skill 1", "Skill 2"],
    "missingKeywords": ["Missing Skill 1", "Missing Skill 2"],
    "experienceBulletPoints": ["Point 1 STAR", "Point 2 STAR"],
    "networkingMessages": [
      { "type": "Outreach ke HR/Recruiter", "recipient": "Tech Recruiter", "template": "..." }
    ],
    "auditFindings": [
      { "category": "Headline Profil", "status": "warning", "tip": "..." }
    ]
  }
}`;

      try {
        const aiRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: analysisPrompt,
            systemInstruction: 'Anda adalah Konsultan Optimasi Profil LinkedIn Profesional di Indonesia. Kembalikan HANYA format JSON valid tanpa markdown.',
          }),
        });
        const aiData = await aiRes.json();
        if (aiData.text) {
          const cleaned = aiData.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.analysisResult) setAnalysisResult(parsed.analysisResult);
        }
      } catch {
        // Analisis AI gagal — data scraping tetap tampil
      }
    } catch (err: any) {
      console.error('LinkedIn Extraction Error:', err);
      const raw = err?.message || '';
      if (/browser has been closed|target page|has been closed/i.test(raw)) {
        setScrapeError('Jendela browser tertutup sebelum proses selesai. Biarkan jendela browser tetap terbuka saat ekstraksi berjalan, lalu coba lagi.');
      } else if (/timeout|timed out/i.test(raw)) {
        setScrapeError('Proses ekstraksi terlalu lama. Periksa koneksi internet lalu coba lagi.');
      } else if (/failed to fetch|network|net::err/i.test(raw)) {
        setScrapeError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.');
      } else {
        setScrapeError('Gagal memproses profil LinkedIn. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[10px] bg-navy-700 text-white border border-navy-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1738D1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-navy-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] text-xs font-bold bg-[#1738D1]/20 text-orange-300 border border-[#1738D1]/30 uppercase tracking-wider">
              <Linkedin className="w-3.5 h-3.5 text-orange-400" />
              <span>Ekstraktor &amp; Auditor LinkedIn</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Ekstraksi Data &amp; Audit Profil LinkedIn
            </h1>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Cukup tempelkan <strong className="text-orange-300">Link URL LinkedIn</strong> kamu. Sistem akan mengekstrak seluruh data profil (termasuk Sertifikasi &amp; Proyek Portofolio), menampilkan rincian data ter-ekstrak, serta memberikan penilaian skor SEO Recruiter &amp; draf rekomendasi optimasi.
            </p>
          </div>

          {onOpenUpgradeModal && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-extrabold transition shadow-lg shadow-[#1738D1]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 border-0"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>Pilih Paket Access</span>
            </button>
          )}
        </div>
      </div>

      {/* SINGLE MAIN INPUT CARD: LINK URL LINKEDIN */}
      <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Masukkan Link URL Profil LinkedIn
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tempel link profil publik LinkedIn kamu untuk langsung diproses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Contoh Demo:</span>
            <button
              type="button"
              onClick={() => handleFillDemoLink('https://linkedin.com/in/andipratama-dev', 'Full Stack Engineer')}
              className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              Full Stack
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoLink('https://linkedin.com/in/siti-rahma-uiux', 'UI/UX Designer')}
              className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              UI/UX Designer
            </button>
          </div>
        </div>

        {/* STATUS LOGIN LINKEDIN (semi-otomatis) */}
        <div className={`p-4 rounded-[10px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLoggedIn
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${isLoggedIn
              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'}`}>
              {isLoggedIn ? <BadgeCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5">
              <p className={`font-extrabold text-xs ${isLoggedIn ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {isLoggedIn === null
                  ? 'Memeriksa sesi LinkedIn...'
                  : isLoggedIn
                  ? 'Sesi LinkedIn Aktif'
                  : 'Perlu Login LinkedIn'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLoggedIn
                  ? 'Sesi tersimpan lokal. Bot akan membuka profil dengan sesi login Anda.'
                  : 'Login sekali di browser yang terbuka (password tidak disimpan). Bot memakai sesi ini untuk menarik data profil.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogoutLinkedIn}
                className="px-3.5 py-2 rounded-[10px] border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-bold text-xs transition hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
              >
                Hapus Sesi
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLoginLinkedIn}
                disabled={isLoginLoading}
                className="px-4 py-2 rounded-[10px] bg-[#0A66C2] hover:bg-[#004182] text-white font-extrabold text-xs transition shadow-md shadow-[#0A66C2]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isLoginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Linkedin className="w-3.5 h-3.5" />}
                <span>{isLoginLoading ? 'Menunggu Login...' : 'Login LinkedIn'}</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {scrapeError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scrapeError}</span>
          </div>
        )}

        <form onSubmit={handleScrapeAndAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1.5">
              <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                Link URL LinkedIn Kamu *
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-500" />
                <input
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/username-kamu"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                Target Posisi / Karir (Opsional)
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Contoh: Full Stack Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !profileUrl}
            className="w-full py-3.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-black text-sm transition shadow-lg shadow-[#1738D1]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Memproses Data Profil LinkedIn...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white" />
                <span>Ekstrak &amp; Analisis Seluruh Profil LinkedIn</span>
              </>
            )}
          </button>
        </form>

        {/* LOADING STEP ANIMATION INDICATOR */}
        {isLoading && (
          <div className="p-5 rounded-[10px] bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-extrabold text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
              <span>Proses Ekstraksi &amp; Penilaian Sedang Berjalan...</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                {loadingStep >= 1 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span className={loadingStep >= 1 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'}>
                  1. Menghubungkan &amp; mengestrak data dari link LinkedIn
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {loadingStep >= 2 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span className={loadingStep >= 2 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'}>
                  2. Membaca Headline, Bio, Pengalaman, Sertifikasi, Proyek, &amp; Skill
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {loadingStep >= 3 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span className={loadingStep >= 3 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'}>
                  3. Menghitung Skor Recruiter &amp; Menyusun Draf Rekomendasi
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {hasAnalyzed && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* PHASE 1 OUTPUT: HASIL SCRAPING / EKSTRAKSI DATA LINKEDIN */}
          <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Hasil Ekstraksi Data Profil LinkedIn
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Ter-ekstrak Lengkap
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Data mentah profil (bio, pengalaman, pendidikan, sertifikasi, proyek, &amp; skill) yang berhasil dibaca.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info Header Badge */}
            <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-navy-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  {scrapedData.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {scrapedData.name}
                  </h3>
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {scrapedData.headline}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scrapedData.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scrapedData.connections}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadProfile}
                  className="px-3.5 py-2 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Data (JSON)</span>
                </button>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buka Link LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Extracted Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* About / Summary Ter-ekstrak */}
              <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Bio / About Ter-ekstrak</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {scrapedData.about}
                </p>
              </div>

              {/* Skill Utama Ter-ekstrak */}
              <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  <span>Skill Utama Ter-ekstrak</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scrapedData.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-[10px] bg-navy-50 dark:bg-navy-950/60 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800 font-semibold text-[11px]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pengalaman Kerja Ter-ekstrak */}
              <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>Riwayat Pengalaman Kerja Ter-ekstrak</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scrapedData.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {exp.role}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {exp.duration}
                        </span>
                      </div>
                      <span className="text-orange-600 dark:text-orange-400 font-bold block text-[11px]">
                        {exp.company}
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sertifikasi & Lisensi Ter-ekstrak */}
              {scrapedData.certifications && scrapedData.certifications.length > 0 && (
                <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span>Sertifikasi &amp; Lisensi Ter-ekstrak</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scrapedData.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <BadgeCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>{cert.name}</span>
                          </span>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium block text-[11px]">
                          {cert.issuer} • <span className="text-slate-400">{cert.issueDate}</span>
                        </span>
                        {cert.credentialId && (
                          <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                            Credential ID: {cert.credentialId}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proyek & Portofolio Ter-ekstrak */}
              {scrapedData.projects && scrapedData.projects.length > 0 && (
                <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                    <FolderGit2 className="w-4 h-4 text-blue-500" />
                    <span>Proyek &amp; Portofolio Ter-ekstrak</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scrapedData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {proj.title}
                          </span>
                          {proj.duration && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {proj.duration}
                            </span>
                          )}
                        </div>

                        {proj.role && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold block text-[11px]">
                            {proj.role}
                          </span>
                        )}

                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          {proj.description}
                        </p>

                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.techStack.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-[10px] text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat Proyek</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pendidikan Ter-ekstrak */}
              {scrapedData.education && scrapedData.education.length > 0 && (
                <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                    <GraduationCap className="w-4 h-4 text-navy-500" />
                    <span>Pendidikan Ter-ekstrak</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {scrapedData.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex-1 min-w-[200px]"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {edu.degree}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                          {edu.institution} ({edu.year})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PHASE 2 OUTPUT: HASIL PENILAIAN & REKOMENDASI OPTIMASI */}
          <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            {/* Header Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    2. Hasil Penilaian &amp; Rekomendasi Optimasi
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {analysisResult.profileStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analisis daya tarik profil di mata HRD &amp; rekomendasi draf siap pakai.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                    {analysisResult.overallScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Skor SEO Recruiter</span>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="text-center">
                  <div className="text-2xl font-black text-amber-500">
                    {analysisResult.ssiScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">SSI Rating</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Headline</span>
                <span className="font-black text-slate-900 dark:text-white block text-base">{analysisResult.scoreBreakdown.headline}%</span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Bio / About</span>
                <span className="font-black text-slate-900 dark:text-white block text-base">{analysisResult.scoreBreakdown.about}%</span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Pengalaman</span>
                <span className="font-black text-slate-900 dark:text-white block text-base">{analysisResult.scoreBreakdown.experience}%</span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Kata Kunci</span>
                <span className="font-black text-slate-900 dark:text-white block text-base">{analysisResult.scoreBreakdown.keywords}%</span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Interaksi</span>
                <span className="font-black text-slate-900 dark:text-white block text-base">{analysisResult.scoreBreakdown.engagement}%</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500">
              <a href="#audit-findings" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 hover:text-orange-600 dark:hover:text-orange-300 transition shrink-0 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>Audit HR</span>
              </a>
              <a href="#headline-recommendations" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 hover:text-orange-600 dark:hover:text-orange-300 transition shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Headline</span>
              </a>
              <a href="#about-draft" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 hover:text-orange-600 dark:hover:text-orange-300 transition shrink-0 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-500" />
                <span>Draf Bio</span>
              </a>
              <a href="#keywords-seo" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 hover:text-orange-600 dark:hover:text-orange-300 transition shrink-0 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>SEO Skill</span>
              </a>
            </div>

            {/* STACKED DETAILED ASSESSMENT CONTENT */}
            <div className="space-y-8 pt-2">
              {/* SECTION 1: TEMUAN AUDIT UTAMA */}
              <div id="audit-findings" className="space-y-4 text-xs scroll-mt-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    <span>Temuan Audit Utama Profil LinkedIn</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Evaluasi Kualitas</span>
                </div>

                <div className="space-y-3">
                  {analysisResult.auditFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
                    >
                      {finding.status === 'good' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {finding.status === 'warning' && (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      {finding.status === 'critical' && (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {finding.category}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-[10px] text-[9px] font-black uppercase ${
                              finding.status === 'good'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : finding.status === 'warning'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {finding.status === 'good'
                              ? 'Optimal'
                              : finding.status === 'warning'
                              ? 'Perlu Perbaikan'
                              : 'Kritis'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {finding.tip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: OPSI HEADLINE REKOMENDASI */}
              <div id="headline-recommendations" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Opsi Headline Direkomendasikan (Siap Pakai)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Salin Ke LinkedIn</span>
                </div>

                <div className="space-y-4">
                  {analysisResult.headlines.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-xs">
                          {item.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.text, `headline-${idx}`)}
                          className="p-1.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 hover:bg-orange-100 text-orange-600 dark:text-orange-300 transition flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                        >
                          {copiedIndex === `headline-${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Headline</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-white leading-relaxed text-xs bg-white dark:bg-slate-900 p-3 rounded-[10px] border border-slate-200 dark:border-slate-800 font-mono">
                        {item.text}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                        <span><strong>Keywords:</strong> {item.keywords}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{item.impact}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: DRAF BIO / ABOUT TERSTRUKTUR */}
              <div id="about-draft" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span>Draf Bio / About LinkedIn Terstruktur</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-text')}
                    className="px-3 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px] border-0 shadow-xs"
                  >
                    {copiedIndex === 'about-text' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Seluruh Bio</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-line shadow-xs">
                  {analysisResult.optimizedAbout}
                </div>
              </div>

              {/* SECTION 4: SEO KATA KUNCI & SKILL GAP */}
              <div id="keywords-seo" className="space-y-5 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span>SEO Kata Kunci &amp; Format Bullet Point</span>
                  </h4>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Kata Kunci Utama yang Terdeteksi</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keySkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="font-extrabold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Kata Kunci Penting yang Masih Kurang (Disarankan Ditambahkan)</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingKeywords.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-semibold text-[11px]"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
