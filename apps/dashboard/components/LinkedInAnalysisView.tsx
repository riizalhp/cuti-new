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
  const [profileUrl, setProfileUrl] = useState('https://linkedin.com/in/andipratama-dev');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');

  // UI Flow States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Extracted/Scraped Data State
  const [scrapedData, setScrapedData] = useState<ScrapedProfileData>({
    name: 'Andi Pratama',
    headline: 'Software Engineer at Tech Corp | React, TypeScript, Node.js enthusiast',
    about:
      'Software engineer berpengalaman 3 tahun dalam pengembangan aplikasi web berskala besar menggunakan React, Next.js, dan Node.js. Suka mempelajari teknologi baru dan berkolaborasi dalam tim agile.',
    location: 'Jakarta, Indonesia',
    connections: '500+ koneksi',
    experience: [
      {
        role: 'Full Stack Engineer',
        company: 'Tech Corp Indonesia',
        duration: '2022 - Sekarang (2 thn 8 bln)',
        description: 'Mengembangkan frontend Next.js dan backend microservices berbasis Node.js & PostgreSQL.',
      },
      {
        role: 'Frontend Developer',
        company: 'Digital Creative Studio',
        duration: '2021 - 2022 (1 thn)',
        description: 'Membangun UI responsive dengan React.js, Tailwind CSS, dan Redux Toolkit.',
      },
    ],
    education: [
      {
        degree: 'S1 Teknik Informatika',
        institution: 'Universitas Indonesia',
        year: '2017 - 2021',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services (AWS)',
        issueDate: 'Diterbitkan 2023',
        credentialId: 'AWS-893012938',
      },
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Coursera / Meta',
        issueDate: 'Diterbitkan 2022',
        credentialId: 'META-FE-90123',
      },
    ],
    projects: [
      {
        title: 'E-Commerce Microservices Platform',
        role: 'Lead Full Stack Engineer',
        duration: '2023 (6 bulan)',
        description: 'Membangun arsitektur microservices untuk platform e-commerce dengan Next.js 14, Node.js, Redis, dan PostgreSQL yang menangani 100k+ transaksi per bulan.',
        techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
        url: 'https://github.com/andipratama/ecommerce-microservices',
      },
      {
        title: 'Real-Time Job Analytics Dashboard',
        role: 'Frontend Specialist',
        duration: '2022 (4 bulan)',
        description: 'Pengembangan dashboard visualisasi data pasar kerja Indonesia secara real-time dengan Chart.js dan Tailwind CSS.',
        techStack: ['React.js', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
      },
    ],
    skills: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS', 'Git'],
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
        title: 'Format High-Converting HR (Disarankan)',
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

  // Handle Extraction & Assessment Call
  const handleScrapeAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl) return;

    setIsLoading(true);
    setHasAnalyzed(false);
    setLoadingStep(1);

    // Simulate loading steps for real UI feel
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2400);

    const promptText = `Lakukan ekstraksi SELURUH data profil LinkedIn (termasuk Headline, About, Pengalaman, Pendidikan, Lisensi & Sertifikasi, Proyek/Portofolio, serta Skill) dan analisis penilaian menyeluruh dari link berikut:
- Link LinkedIn URL: ${profileUrl}
- Target Posisi / Industri yang Dicari: ${targetRole || 'Sesuai Profil'}

Kembalikan data dalam format JSON persis seperti berikut:
{
  "scrapedData": {
    "name": "Nama Lengkap Kandidat",
    "headline": "Headline Profil Ter-ekstrak",
    "about": "Ringkasan / Bio About Ter-ekstrak",
    "location": "Kota, Indonesia",
    "connections": "500+ koneksi",
    "experience": [
      { "role": "Nama Jabatan", "company": "Nama Perusahaan", "duration": "Tahun - Tahun", "description": "Deskripsi singkat pekerjaan" }
    ],
    "education": [
      { "degree": "Gelar & Jurusan", "institution": "Nama Universitas / Sekolah", "year": "Tahun Masuk - Lulus" }
    ],
    "certifications": [
      { "name": "Nama Sertifikat / Lisensi", "issuer": "Penerbit Sertifikat", "issueDate": "Tahun Terbit", "credentialId": "ID Kredensial" }
    ],
    "projects": [
      { "title": "Judul Proyek", "role": "Peran Dalam Proyek", "duration": "Waktu Pengerjaan", "description": "Deskripsi proyek", "techStack": ["Tech 1", "Tech 2"], "url": "link-proyek" }
    ],
    "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
  },
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

    const systemInstruction = `Anda adalah Sistem Pengestrak Data & Konsultan Optimasi Profil LinkedIn Profesional di Indonesia.
Tugas Anda adalah mengambil/menyusun data profil LinkedIn LENGKAP dari URL yang diberikan (nama, headline, bio, pengalaman, pendidikan, sertifikasi/lisensi, proyek/portofolio, skill) serta memberikan penilaian skor SEO Recruiter, kelemahan profil, dan draf perbaikan lengkap.
Kembalikan HANYA format JSON valid tanpa markdown atau kata pembuka.`;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, systemInstruction }),
      });

      const data = await response.json();
      if (data.text) {
        const cleanedText = data.text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(cleanedText);
        if (parsed.scrapedData) {
          setScrapedData(parsed.scrapedData);
        }
        if (parsed.analysisResult) {
          setAnalysisResult(parsed.analysisResult);
        }
      }
    } catch (err) {
      console.error('LinkedIn Extraction Error:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setHasAnalyzed(true);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[10px] bg-[#0D3BD9] text-white border border-blue-500/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Linkedin className="w-3.5 h-3.5 text-violet-400" />
              <span>Ekstraktor &amp; Auditor LinkedIn</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Ekstraksi Data &amp; Audit Profil LinkedIn
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Cukup tempelkan <strong className="text-amber-300">Link URL LinkedIn</strong> kamu. Sistem akan mengekstrak seluruh data profil (termasuk Sertifikasi &amp; Proyek Portofolio), menampilkan rincian data ter-ekstrak, serta memberikan penilaian skor SEO Recruiter &amp; draf rekomendasi optimasi.
            </p>
          </div>

          {onOpenUpgradeModal && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="px-4 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 text-amber-200" />
              <span>Pilih Paket Access</span>
            </button>
          )}
        </div>
      </div>

      {/* SINGLE MAIN INPUT CARD: LINK URL LINKEDIN */}
      <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
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
              className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              Full Stack
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoLink('https://linkedin.com/in/siti-rahma-uiux', 'UI/UX Designer')}
              className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              UI/UX Designer
            </button>
          </div>
        </div>

        <form onSubmit={handleScrapeAndAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1.5">
              <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                Link URL LinkedIn Kamu *
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3.5 top-3.5 text-violet-500" />
                <input
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/username-kamu"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
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
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !profileUrl}
            className="w-full py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Memproses Data Profil LinkedIn...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-200" />
                <span>Ekstrak &amp; Analisis Seluruh Profil LinkedIn</span>
              </>
            )}
          </button>
        </form>

        {/* LOADING STEP ANIMATION INDICATOR */}
        {isLoading && (
          <div className="p-5 rounded-[10px] bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-extrabold text-xs">
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
                <div className="w-14 h-14 rounded-full bg-violet-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  {scrapedData.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {scrapedData.name}
                  </h3>
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
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

              <div className="shrink-0">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-violet-600 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Linkedin className="w-3.5 h-3.5 text-violet-600" />
                  <span>Buka Link LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Extracted Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* About / Summary Ter-ekstrak */}
              <div className="p-4 rounded-[10px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                  <FileText className="w-4 h-4 text-violet-500" />
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
                      className="px-2.5 py-1 rounded-[10px] bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-semibold text-[11px]"
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
                      <span className="text-violet-600 dark:text-violet-400 font-bold block text-[11px]">
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
                    <Award className="w-4 h-4 text-purple-500" />
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
                            <BadgeCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
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
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
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
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline pt-1"
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
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
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
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                    {analysisResult.profileStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analisis daya tarik profil di mata HRD &amp; rekomendasi draf siap pakai.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
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
              <a href="#audit-findings" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                <span>Audit HR</span>
              </a>
              <a href="#headline-recommendations" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Headline</span>
              </a>
              <a href="#about-draft" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-500" />
                <span>Draf Bio</span>
              </a>
              <a href="#keywords-seo" className="px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition shrink-0 flex items-center gap-1.5">
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
                    <ShieldCheck className="w-4 h-4 text-violet-500" />
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
                        <span className="font-bold text-violet-600 dark:text-violet-400 text-xs">
                          {item.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.text, `headline-${idx}`)}
                          className="p-1.5 rounded-[10px] bg-violet-50 dark:bg-violet-950/80 hover:bg-violet-100 text-violet-600 dark:text-violet-300 transition flex items-center gap-1 font-bold text-[10px] cursor-pointer"
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
                    <FileText className="w-4 h-4 text-violet-500" />
                    <span>Draf Bio / About LinkedIn Terstruktur</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-text')}
                    className="px-3 py-1.5 rounded-[10px] bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px]"
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
