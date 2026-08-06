'use client';

import React, { useState } from 'react';
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
  UserCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Sliders,
  HelpCircle,
  MessageSquare,
  Building,
  Briefcase,
  Lightbulb,
} from 'lucide-react';

interface LinkedInAnalysisViewProps {
  isDarkMode?: boolean;
  onOpenUpgradeModal?: () => void;
}

export const LinkedInAnalysisView: React.FC<LinkedInAnalysisViewProps> = ({
  isDarkMode,
  onOpenUpgradeModal,
}) => {
  // Input States
  const [profileUrl, setProfileUrl] = useState('https://linkedin.com/in/andipratama-dev');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [currentHeadline, setCurrentHeadline] = useState(
    'Software Engineer at Tech Corp | React, TypeScript, Node.js enthusiast'
  );
  const [currentAbout, setCurrentAbout] = useState(
    'Software engineer berpengalaman 3 tahun dalam pengembangan aplikasi web berskala besar menggunakan React, Next.js, dan Node.js. Suka mempelajari teknologi baru dan berkolaborasi dalam tim agile.'
  );
  const [rawProfileText, setRawProfileText] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'headline' | 'about' | 'keywords' | 'networking'>('overview');

  // Analysis Results State
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
    overallScore: 84,
    ssiScore: 78,
    profileStatus: 'Sangat Baik (All-Star Level)',
    scoreBreakdown: {
      headline: 80,
      about: 85,
      experience: 82,
      keywords: 88,
      engagement: 86,
    },
    headlines: [
      {
        title: 'Formato High-Converting HR (Disarankan)',
        text: 'Full Stack Engineer | React.js, Next.js, Node.js & Cloud Architecture | Building Scalable Web Products | Ex-Tokopedia Tech',
        keywords: 'Full Stack, React.js, Next.js, Node.js, Cloud',
        impact: 'Meningkatkan tayangan pencarian HRD hingga +140%',
      },
      {
        title: 'Format Result-Oriented & Impact Focused',
        text: 'Software Engineer @Tech Corp | Scaled Microservices to 1M+ Users | Specialist in High-Performance Web Apps & Clean Code',
        keywords: 'Microservices, Scaled, High-Performance, Web Apps',
        impact: 'Sangat disukai oleh Tech Lead & Hiring Manager',
      },
      {
        title: 'Format Growth & Specialization',
        text: 'Senior Frontend & API Developer | Modern JavaScript Specialist | Open for Tech Lead & Senior Roles in Southeast Asia',
        keywords: 'Frontend, API Developer, Tech Lead, Remote',
        impact: 'Optimal untuk pencarian lowongan Remote & International',
      },
    ],
    optimizedAbout: `Saya adalah Full Stack Software Engineer dengan pengalaman 3+ tahun membangun sistem aplikasi web performa tinggi yang digunakan oleh lebih dari 500.000 pengguna aktif bulanan.

Spesialisasi Utama Saya:
• Frontend: React.js, Next.js, TypeScript, Tailwind CSS, Redux Toolkit
• Backend & Database: Node.js, Express, PostgreSQL, Redis, RESTful API & GraphQL
• DevOps & Cloud: Docker, GCP (Google Cloud), CI/CD Pipelines

Pencapaian Utama:
- Memimpin refactoring sistem monolitik menjadi microservices, meningkatkan kecepatan response API sebesar 45%.
- Membangun dashboard analitik real-time yang mengurangi latency pemrosesan data hingga 60%.
- Mengembangkan 10+ modul aplikasi e-commerce dengan tingkat availability 99.9%.

Tertarik berdiskusi seputar Software Architecture, Tech Innovation, atau Peluang Kolaborasi?
Email: andi.pratama@email.com
GitHub: github.com/andipratama`,
    keySkills: [
      'React.js',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Express.js',
      'PostgreSQL',
      'REST API',
      'System Architecture',
      'Docker',
      'Agile / Scrum',
    ],
    missingKeywords: [
      'Microservices',
      'Jest / Testing',
      'CI/CD Pipeline',
      'GraphQL',
      'Tailwind CSS',
      'Performance Optimization',
    ],
    experienceBulletPoints: [
      'Memimpin tim beranggota 4 developer dalam mengembangkan fitur checkout baru, meningkatkan conversion rate transaksi sebesar +18% dalam 3 bulan.',
      'Mengoptimalkan performa rendering halaman utama Next.js, berhasil menurunkan score Lighthouse LCP dari 4.2 detik menjadi 1.1 detik.',
      'Mengintegrasikan payment gateway QRIS & Credit Card untuk lebih dari 50.000 transaksi bulanan dengan rasio sukses 99.8%.',
    ],
    networkingMessages: [
      {
        type: 'Outreach ke HR/Recruiter',
        recipient: 'Tech Recruiter / Talent Acquisition',
        template:
          'Halo [Nama Recruiter], salam kenal! Saya memperhatikan [Nama Perusahaan] sedang membuka posisi [Nama Posisi]. Dengan pengalaman 3+ tahun memimpin pengembangan web berskala tinggi menggunakan React & Node.js, saya sangat tertarik untuk berkontribusi. Boleh saya mengirimkan CV lengkap untuk ditinjau? Terima kasih!',
      },
      {
        type: 'Koneksi ke Engineering Manager',
        recipient: 'Tech Lead / Engineering Manager',
        template:
          'Halo [Nama Manager], salam hangat! Saya pengagum arsitektur teknologi di [Nama Perusahaan]. Sebagai sesama Full Stack Engineer, saya senang melihat perkembangan produk kalian. Jika ada waktu, saya sangat ingin berjejaring dan bertukar pikiran seputar tech stack & engineering culture di tim Anda. Terima kasih!',
      },
      {
        type: 'Follow Up Setelah Apply',
        recipient: 'Recruiter / HR Manager',
        template:
          'Halo [Nama Recruiter], saya sudah mengajukan lamaran untuk posisi [Nama Posisi] melalui website CUTI / LinkedIn. Saya sangat antusias dengan kesempatan ini dan siap berdiskusi lebih lanjut mengenai portofolio proyek terlama saya. Selamat beraktivitas!',
      },
    ],
    auditFindings: [
      {
        category: 'Headline Profil',
        status: 'warning',
        tip: 'Headline kamu saat ini belum mencantumkan kata kunci spesifik seperti Next.js, System Architecture, & lokasi kerja yang dicari recruiter.',
      },
      {
        category: 'Bagian About / Bio',
        status: 'warning',
        tip: 'Tambahkan metrik kuantitatif (angka %, jumlah user) dan call-to-action kontak email agar recruiter bisa menghubungi secara langsung.',
      },
      {
        category: 'Pengalaman Kerja (Experience)',
        status: 'good',
        tip: 'Struktur poin pengalaman kerja sudah baik, gunakan metode STAR (Situation, Task, Action, Result) pada setiap bullet point.',
      },
      {
        category: 'Searchability & SEO Filter HR',
        status: 'critical',
        tip: 'Kamu kekurangan 6 kata kunci teknis utama yang sering disaring recruiter dalam alat LinkedIn Recruiter.',
      },
      {
        category: 'Social Selling Index (SSI)',
        status: 'good',
        tip: 'SSI Score kamu berada di top 15% profesional di industri teknologi. Pertahankan postingan mingguan.',
      },
    ],
  });

  // Handle Demo Fill
  const handleFillDemoData = () => {
    setProfileUrl('https://linkedin.com/in/andipratama-dev');
    setTargetRole('Full Stack Engineer');
    setCurrentHeadline('Software Engineer at Tech Corp | React, TypeScript, Node.js enthusiast');
    setCurrentAbout(
      'Software engineer berpengalaman 3 tahun dalam pengembangan aplikasi web berskala besar menggunakan React, Next.js, dan Node.js. Suka mempelajari teknologi baru.'
    );
  };

  // Handle Copy Text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle AI Analyze Call
  const handleAnalyzeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const promptText = `Lakukan audit dan analisis profil LinkedIn secara mendalam untuk kandidat berikut:
- Target Posisi / Karir ID: ${targetRole}
- Link LinkedIn / URL: ${profileUrl}
- Headline Saat Ini: ${currentHeadline}
- About / Summary Saat Ini: ${currentAbout}
- Detail Teks Tambahan: ${rawProfileText || 'Tidak ada teks tambahan'}

Tolong berikan respons terstruktur dalam format JSON dengan kunci berikut:
{
  "overallScore": number (1-100),
  "ssiScore": number (1-100),
  "profileStatus": string (misal: "Sangat Baik (All-Star Level)"),
  "scoreBreakdown": { "headline": number, "about": number, "experience": number, "keywords": number, "engagement": number },
  "headlines": [ { "title": string, "text": string, "keywords": string, "impact": string } ],
  "optimizedAbout": string,
  "keySkills": array of string,
  "missingKeywords": array of string,
  "experienceBulletPoints": array of string,
  "networkingMessages": [ { "type": string, "recipient": string, "template": string } ],
  "auditFindings": [ { "category": string, "status": "good" | "warning" | "critical", "tip": string } ]
}`;

    const systemInstruction = `Anda adalah Spesialis Optimasi LinkedIn & Personal Branding Konsultan Karir Senior berpengalaman di Indonesia & Global.
Tugas Anda adalah menganalisis data profil LinkedIn pengguna, memberikan skor visibilitas pencarian recruiter (LinkedIn Recruiter Search Score), serta menyusun draf Headline, About section, kata kunci SEO, dan pesan outreach HRD yang sangat persuasif.
Kembalikan HANYA format JSON valid tanpa markdown atau teks pengantar.`;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, systemInstruction }),
      });

      const data = await response.json();
      if (data.text) {
        try {
          const cleanedText = data.text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed.overallScore) {
            setAnalysisResult(parsed);
          }
        } catch {
          // Keep existing defaults if JSON parse fails
        }
      }
    } catch (err) {
      console.error('LinkedIn Analysis Error:', err);
    } finally {
      setIsLoading(false);
      setHasAnalyzed(true);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Banner Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0D3BD9] text-white border border-blue-500/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Linkedin className="w-3.5 h-3.5 text-violet-400" />
              <span>LinkedIn Profile Auditor AI</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Analisis &amp; Pengoptimasi Profil LinkedIn
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Tingkatkan daya tarik profil kamu di mata <strong className="text-amber-300">Recruiter &amp; Headhunter</strong>. Dapatkan analisis skor SEO, rekomendasi headline konversi tinggi, serta draf bio profesional otomatis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleFillDemoData}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Isi Data Demo</span>
            </button>

            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0D3BD9] hover:bg-[#0B33BD] text-white text-xs font-extrabold transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Unlimited Pass</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column (Input Profile) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Linkedin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Analisis LinkedIn
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Masukkan info profil LinkedIn kamu di bawah ini.
                </p>
              </div>
            </div>

            <form onSubmit={handleAnalyzeProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Posisi / Industri yang Dicari *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Full Stack Engineer, Product Manager, Data Analyst"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Link URL Profil LinkedIn Kamu
                </label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 absolute left-3 top-2.5 text-violet-500" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Headline LinkedIn Saat Ini
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Software Engineer at Company X | Tech Lover"
                  value={currentHeadline}
                  onChange={(e) => setCurrentHeadline(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bagian Bio / About Saat Ini
                </label>
                <textarea
                  rows={4}
                  placeholder="Salin dan tempel ringkasan tentang diri kamu dari LinkedIn..."
                  value={currentAbout}
                  onChange={(e) => setCurrentAbout(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Teks Pengalaman &amp; Skill Lainnya (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tempel riwayat kerja atau sertifikasi tambahan untuk analisis yang lebih akurat..."
                  value={rawProfileText}
                  onChange={(e) => setRawProfileText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-black transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Menganalisis Profil LinkedIn...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Mulai Analisis Profil LinkedIn AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Tips Box */}
          <div className="p-5 rounded-xl bg-violet-50/60 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 space-y-3">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Mengapa Profil LinkedIn Sangat Penting?</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Lebih dari <strong className="text-violet-600 dark:text-violet-400">87% recruiter</strong> menggunakan fitur pencarian LinkedIn Recruiter untuk mencari kandidat secara proaktif sebelum lowongan resmi dipublikasikan.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Audit & AI Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Score Overview Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ringkasan Hasil Audit LinkedIn
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>Skor Daya Tarik Recruiter</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                    {analysisResult.profileStatus}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
                    {analysisResult.overallScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Skor Utama</span>
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

            {/* Score Breakdown Bar Items */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block truncate">Headline</span>
                <span className="font-black text-slate-900 dark:text-white block">{analysisResult.scoreBreakdown.headline}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block truncate">Bio / About</span>
                <span className="font-black text-slate-900 dark:text-white block">{analysisResult.scoreBreakdown.about}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block truncate">Pengalaman</span>
                <span className="font-black text-slate-900 dark:text-white block">{analysisResult.scoreBreakdown.experience}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block truncate">Kata Kunci</span>
                <span className="font-black text-slate-900 dark:text-white block">{analysisResult.scoreBreakdown.keywords}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-medium block truncate">Interaksi</span>
                <span className="font-black text-slate-900 dark:text-white block">{analysisResult.scoreBreakdown.engagement}%</span>
              </div>
            </div>

            {/* Quick Section Jump Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500">
              <a href="#audit-findings" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                <span>Audit HR</span>
              </a>
              <a href="#headline-recommendations" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Headline</span>
              </a>
              <a href="#about-draft" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-500" />
                <span>Draf Bio</span>
              </a>
              <a href="#keywords-seo" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>SEO Skill</span>
              </a>
              <a href="#networking-outreach" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                <span>Outreach HR</span>
              </a>
            </div>

            {/* STACKED CONTENT SECTIONS (SCROLL DOWN) */}
            <div className="space-y-8 pt-2">
              {/* SECTION 1: OVERVIEW & AUDIT FINDINGS */}
              <div id="audit-findings" className="space-y-4 text-xs scroll-mt-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-500" />
                    <span>1. Temuan Audit Utama Profil LinkedIn</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Catatan Evaluasi HRD</span>
                </div>

                <div className="space-y-3">
                  {analysisResult.auditFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
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
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
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

              {/* SECTION 2: HEADLINE RECOMMENDATIONS */}
              <div id="headline-recommendations" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>2. Opsi Headline Hasil AI (Pilih salah satu)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Siap Salin &amp; Pakai</span>
                </div>

                <div className="space-y-4">
                  {analysisResult.headlines.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-violet-600 dark:text-violet-400 text-xs">
                          {item.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.text, `headline-${idx}`)}
                          className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 hover:bg-violet-100 text-violet-600 dark:text-violet-300 transition flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                        >
                          {copiedIndex === `headline-${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-white leading-relaxed text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
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

              {/* SECTION 3: OPTIMIZED ABOUT / BIO */}
              <div id="about-draft" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-500" />
                    <span>3. Draf Bio / About LinkedIn Terstruktur AI</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-text')}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px]"
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

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-line shadow-xs">
                  {analysisResult.optimizedAbout}
                </div>
              </div>

              {/* SECTION 4: KEYWORDS & SEO */}
              <div id="keywords-seo" className="space-y-5 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span>4. SEO Kata Kunci &amp; Format Pengalaman</span>
                  </h4>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Kata Kunci Utama yang Sudah Terdeteksi</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keySkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px] flex items-center gap-1"
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
                    <span>Kata Kunci Penting yang Masih Kurang (Tambahkan ke Profil)</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingKeywords.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-semibold text-[11px]"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <h5 className="font-extrabold text-slate-900 dark:text-white">
                    Format Bullet Point Pengalaman Kerja (STAR Method)
                  </h5>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-4">
                    {analysisResult.experienceBulletPoints.map((bp, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SECTION 5: NETWORKING & OUTREACH */}
              <div id="networking-outreach" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-500" />
                    <span>5. Draf Pesan InMail / Connection Request HR</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Siap Kirim via LinkedIn</span>
                </div>

                <div className="space-y-4">
                  {analysisResult.networkingMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {msg.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Target: {msg.recipient}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.template, `net-${idx}`)}
                          className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 hover:bg-violet-100 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedIndex === `net-${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Pesan</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                        {msg.template}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
