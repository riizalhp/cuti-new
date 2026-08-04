'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Copy,
  Sparkles,
  Award,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Save,
  Briefcase,
  GraduationCap,
  User,
  Wrench,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Crown,
  CreditCard,
  QrCode,
  Wallet,
  Building,
  Clock,
  UserCheck,
  Upload,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  RefreshCw,
  FileDown,
  ChevronRight,
  Info,
  Lock,
  AlertCircle,
  X,
  Send,
  LayoutGrid,
} from 'lucide-react';

export interface CVData {
  id: string;
  title: string;
  updatedAt: string;
  atsScore: number;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: {
    id: string;
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    year: string;
  }[];
}

interface PackageOption {
  id: string;
  name: string;
  badge?: string;
  price: number;
  originalPrice: number;
  popular?: boolean;
  features: string[];
}

interface OrderInfo {
  orderId: string;
  packageId: string;
  packageName: string;
  price: number;
  paymentMethod: string;
  status: 'payment_verified' | 'ai_processing' | 'hr_review' | 'completed';
  progress: number;
  createdAt: string;
  estimatedTime: string;
  dataOption: 'existing' | 'new';
  hrName: string;
  hrRole: string;
}

const initialCVs: CVData[] = [
  {
    id: 'cv-1',
    title: 'CV Software Engineer (ATS Optimized)',
    updatedAt: '22 Juli 2026',
    atsScore: 92,
    fullName: 'Budi Santoso',
    headline: 'Senior Full Stack Developer | React & Node.js',
    email: 'budi.santoso@email.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    summary:
      'Full Stack Software Engineer berpengalaman 4+ tahun dalam membangun aplikasi web skala besar menggunakan React, TypeScript, dan Next.js dengan fokus pada performa dan UI/UX yang responsif.',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    experience: [
      {
        id: 'exp-1',
        company: 'PT Tech Inovasi Indonesia',
        role: 'Senior Frontend Developer',
        period: '2023 - Sekarang',
        description: 'Memimpin tim frontend dalam migrasi aplikasi monolith ke arsitektur micro-frontend, meningkatkan kecepatan render halaman hingga 40%.',
      },
      {
        id: 'exp-2',
        company: 'Solusi Digital Nusantara',
        role: 'Full Stack Developer',
        period: '2021 - 2023',
        description: 'Mengembangkan sistem pembayaran internal dan mengintegrasikan payment gateway pihak ketiga untuk 50.000+ pengguna harian.',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Universitas Indonesia',
        degree: 'S1 Ilmu Komputer (GPA 3.82/4.00)',
        year: '2017 - 2021',
      },
    ],
  },
  {
    id: 'cv-2',
    title: 'CV UI/UX Designer & Product Strategy',
    updatedAt: '15 Juli 2026',
    atsScore: 88,
    fullName: 'Budi Santoso',
    headline: 'Product Designer | UI/UX Specialist',
    email: 'budi.santoso@email.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    summary:
      'Product Designer dengan keahlian dalam User Research, Wireframing, Prototyping, dan Design Systems.',
    skills: ['Figma', 'User Research', 'Design System', 'Prototyping', 'Design Thinking', 'Usability Testing'],
    experience: [
      {
        id: 'exp-1',
        company: 'PT Digital Creative House',
        role: 'UI/UX Designer',
        period: '2022 - 2024',
        description: 'Merancang design system lengkap untuk aplikasi fintech seluler dan meningkatkan angka konversi checkout hingga 25%.',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Universitas Indonesia',
        degree: 'S1 Ilmu Komputer',
        year: '2017 - 2021',
      },
    ],
  },
];

const packages: PackageOption[] = [
  {
    id: 'starter',
    name: 'Paket Starter ATS AI',
    badge: 'Cepat & Hemat',
    price: 29000,
    originalPrice: 50000,
    features: [
      'Auto-Format ATS Friendly 90+ Score',
      'Ekstraksi Kata Kunci Industri Otomatis',
      'Layout Standar A4 Multinasional',
      'Ekspor Format PDF & Word DOCX',
      'Proses AI Instant (5-10 Menit)',
    ],
  },
  {
    id: 'pro',
    name: 'Paket Pro AI & Expert HR',
    badge: 'Paling Populer',
    popular: true,
    price: 59000,
    originalPrice: 120000,
    features: [
      'Semua Fitur Paket Starter ATS AI',
      'Ditinjau & Disempurnakan Tim HR Specialist',
      'Garansi Lolos Screening ATS 95%+',
      'Bonus Draf Surat Lamaran (Cover Letter)',
      'Garansi Gratis Revisi 2x',
      'Selesai dalam 30-60 Menit',
    ],
  },
  {
    id: 'executive',
    name: 'Paket Executive VIP',
    badge: 'Garansi Garis Depan',
    price: 99000,
    originalPrice: 200000,
    features: [
      'Semua Fitur Paket Pro AI & Expert',
      'Pengerjaan Prioritas Kilat (1x24 Jam SLA)',
      'Optimasi Profil LinkedIn & Ringkasan Bio',
      'Konsultasi Karir & Review Portofolio via Chat',
      'Akses Templat CV VIP Premium Selamanya',
      'Garansi Revisi Tanpa Batas (7 Hari)',
    ],
  },
];

interface TemplateOption {
  id: string;
  name: string;
  badge: string;
  score: string;
  description: string;
  features: string[];
  iconColor: string;
}

const cvTemplates: TemplateOption[] = [
  {
    id: 'ats-modern',
    name: 'ATS Modern Standard',
    badge: '1 Column ATS',
    score: '98%',
    description: 'Format tunggal paling optimal untuk sistem ATS HRD BUMN & Multinasional. Memaksimalkan pembacaan kata kunci.',
    iconColor: 'bg-violet-600 text-white',
    features: ['100% Parsing ATS Friendly', 'Font Standar Internasional', 'Hierarki Pengalaman Jelas'],
  },
  {
    id: 'minimalist-executive',
    name: 'Minimalist Executive',
    badge: 'Executive',
    score: '95%',
    description: 'Desain bersih dengan tata letak ringkas & elegan. Sangat cocok untuk posisi Manajerial, Finansial, & Konsultan.',
    iconColor: 'bg-slate-800 text-white',
    features: ['Ringkasan Eksekutif Dominan', 'Garis Pemisah Minimalis', 'Tampilan Rapi & Formal'],
  },
  {
    id: 'creative-tech',
    name: 'Creative Tech & Digital',
    badge: 'Tech & Product',
    score: '92%',
    description: 'Menonjolkan daftar Tech Stack, sertifikasi profesional, dan portofolio. Sangat ideal untuk Developer & Designer.',
    iconColor: 'bg-emerald-600 text-white',
    features: ['Sorotan Skill Pill Badges', 'Kategori Proyek & Portofolio', 'Tata Letak Modern'],
  },
  {
    id: 'fresh-graduate',
    name: 'Academic & Fresh Graduate',
    badge: 'Fresh Graduate',
    score: '94%',
    description: 'Didesain khusus untuk lulusan baru. Menonjolkan IPK, organisasi kampus, tugas akhir, serta sertifikasi.',
    iconColor: 'bg-amber-500 text-slate-950',
    features: ['Porsi Pendidikan Lebih Luas', 'Pengalaman Organisasi & Event', 'Sertifikasi & Kursus'],
  },
];

export const CVView: React.FC = () => {
  const [cvList, setCvList] = useState<CVData[]>(initialCVs);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'preview' | 'ai-wizard' | 'ai-progress'>('list');
  const [selectedCV, setSelectedCV] = useState<CVData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ats-modern');

  // AI CV Creation Wizard State
  const [aiWizardStep, setAiWizardStep] = useState<number>(1); // 1: Package, 2: Payment, 3: Data Option/Form, 4: Progress
  const [selectedPackage, setSelectedPackage] = useState<PackageOption>(packages[1]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('qris');
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [dataSelectionOption, setDataSelectionOption] = useState<'existing' | 'new' | null>(null);
  const [wizardFormStep, setWizardFormStep] = useState<number>(1);

  // Active Order State
  const [activeOrder, setActiveOrder] = useState<OrderInfo | null>({
    orderId: 'ORD-AICV-2026-8819',
    packageId: 'pro',
    packageName: 'Paket Pro AI & Expert HR',
    price: 59000,
    paymentMethod: 'QRIS Instant',
    status: 'hr_review',
    progress: 75,
    createdAt: '23 Juli 2026, 14:20 WIB',
    estimatedTime: '15-20 Menit Lagi',
    dataOption: 'existing',
    hrName: 'Sarah Melati, S.Psi',
    hrRole: 'Senior Tech Recruiter CUTI',
  });

  // Modal States
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'hr' | 'user'; text: string; time: string }[]>([
    {
      sender: 'hr',
      text: 'Halo Budi! Saya Sarah Melati yang sedang merevisi CV kamu. Tata letak ATS dan kata kunci React/TypeScript sudah disesuaikan. Apakah ada pencapaian spesifik yang ingin kamu tambahkan?',
      time: '14:22 WIB',
    },
  ]);

  // Accordion State for Manual CV Form
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    title: true,
    personal: true,
    skills: true,
    experience: false,
    education: false,
  });

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Form State for Manual CV & Wizard
  const [formData, setFormData] = useState<Omit<CVData, 'id' | 'updatedAt' | 'atsScore' | 'title'>>({
    fullName: 'Budi Santoso',
    headline: 'Senior Full Stack Developer | React & Node.js',
    email: 'budi.santoso@email.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    summary:
      'Full Stack Software Engineer berpengalaman 4+ tahun dalam membangun aplikasi web skala besar menggunakan React, TypeScript, dan Next.js dengan fokus pada performa dan UI/UX yang responsif.',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    experience: [
      {
        id: 'exp-1',
        company: 'PT Tech Inovasi Indonesia',
        role: 'Senior Frontend Developer',
        period: '2023 - Sekarang',
        description: 'Memimpin tim frontend dalam migrasi aplikasi monolith ke arsitektur micro-frontend, meningkatkan kecepatan render halaman hingga 40%.',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Universitas Indonesia',
        degree: 'S1 Ilmu Komputer (GPA 3.82/4.00)',
        year: '2017 - 2021',
      },
    ],
  });

  const [aiNote, setAiNote] = useState<string>('');
  const [titleInput, setTitleInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expPeriod, setExpPeriod] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [eduInst, setEduInst] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduYear, setEduYear] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleAddExperience = () => {
    if (expCompany && expRole) {
      const expId = `exp-${formData.experience.length + 1}`;
      setFormData((prev) => ({
        ...prev,
        experience: [
          ...prev.experience,
          {
            id: expId,
            company: expCompany,
            role: expRole,
            period: expPeriod,
            description: expDesc,
          },
        ],
      }));
      setExpCompany('');
      setExpRole('');
      setExpPeriod('');
      setExpDesc('');
    }
  };

  const handleAddEducation = () => {
    if (eduInst && eduDegree) {
      const eduId = `edu-${formData.education.length + 1}`;
      setFormData((prev) => ({
        ...prev,
        education: [
          ...prev.education,
          {
            id: eduId,
            institution: eduInst,
            degree: eduDegree,
            year: eduYear,
          },
        ],
      }));
      setEduInst('');
      setEduDegree('');
      setEduYear('');
    }
  };

  const handleSaveCV = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `cv-${cvList.length + 1}`;
    const calculatedScore = 85 + (cvList.length % 8);
    const newCV: CVData = {
      id: newId,
      title: titleInput || 'CV Tanpa Judul',
      updatedAt: 'Hari ini',
      atsScore: calculatedScore,
      ...formData,
    };
    setCvList([newCV, ...cvList]);
    setViewMode('list');
    resetForm();
  };

  const resetForm = () => {
    setTitleInput('');
    setFormData({
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
    });
  };

  const handleDeleteCV = (id: string) => {
    setCvList((prev) => prev.filter((cv) => cv.id !== id));
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'CUTIAI10') {
      setAppliedDiscount(10000);
    } else {
      alert('Kode voucher tidak valid. Coba gunakan CUTIAI10');
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setAiWizardStep(3); // Go to Data Selection
    }, 1500);
  };

  const handleCompleteOrder = (dataOption: 'existing' | 'new') => {
    const newOrder: OrderInfo = {
      orderId: `ORD-AICV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      price: Math.max(0, selectedPackage.price - appliedDiscount),
      paymentMethod:
        selectedPaymentMethod === 'qris'
          ? 'QRIS Instant'
          : selectedPaymentMethod === 'bca'
          ? 'Transfer BCA'
          : 'Transfer Mandiri',
      status: 'hr_review',
      progress: 75,
      createdAt: 'Baru saja',
      estimatedTime: '15-30 Menit',
      dataOption,
      hrName: 'Sarah Melati, S.Psi',
      hrRole: 'Senior Tech Recruiter CUTI',
    };
    setActiveOrder(newOrder);

    // Also inject a new generated CV entry into cvList
    const newGeneratedCV: CVData = {
      id: `cv-${cvList.length + 1}`,
      title: `CV AI Revamp - ${selectedPackage.name}`,
      updatedAt: 'Sedang Diproses Tim',
      atsScore: 96,
      fullName: formData.fullName || 'Budi Santoso',
      headline: formData.headline || 'Senior Full Stack Developer',
      email: formData.email || 'budi.santoso@email.com',
      phone: formData.phone || '+62 812-3456-7890',
      location: formData.location || 'Jakarta, Indonesia',
      summary: formData.summary || 'Profil profesional yang dioptimasi AI & HR Specialist.',
      skills: formData.skills.length > 0 ? formData.skills : ['React.js', 'Next.js', 'TypeScript', 'Node.js'],
      experience: formData.experience,
      education: formData.education,
    };
    setCvList([newGeneratedCV, ...cvList]);

    setViewMode('ai-progress');
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: 'user' as const,
      text: chatInput.trim(),
      time: 'Baru Saja',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Simulated HR reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'hr',
          text: 'Terima kasih informasinya, Budi! Tim kami sudah mencatat masukan ini dan langsung memperbarui draf CV kamu.',
          time: 'Baru Saja',
        },
      ]);
    }, 1200);
  };

  const filteredCVs = cvList.filter(
    (cv) =>
      cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.headline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-slate-900 to-violet-950 rounded-xl p-6 text-white border border-violet-800/50 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs mb-1">
            <FileText className="w-4 h-4" />
            <span>Manajemen &amp; Service CV ATS CUTI</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Daftar &amp; Pembuat CV Profesional
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Kelola CV mandiri kamu atau gunakan <span className="text-amber-400 font-bold">Jasa Pembuatan CV oleh AI &amp; Tim HR</span> untuk hasil 100% lolos screening ATS perusahaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeOrder && (
            <button
              onClick={() => setViewMode('ai-progress')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-violet-950/80 hover:bg-violet-900 border border-violet-700/60 text-violet-200 font-bold text-xs transition"
            >
              <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
              <span>Status Order AI ({activeOrder.progress}%)</span>
            </button>
          )}

          <button
            onClick={() => {
              setAiWizardStep(1);
              setViewMode('ai-wizard');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Buatkan CV oleh AI &amp; Tim</span>
          </button>

          {viewMode === 'list' ? (
            <button
              onClick={() => {
                setShowTemplateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat CV Mandiri</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: DAFTAR CV */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Active Order Banner if Available */}
          {activeOrder && (
            <div className="p-4 md:p-5 rounded-xl bg-gradient-to-r from-violet-900/90 via-slate-900 to-slate-900 border border-violet-700/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <div className="p-3 rounded-lg bg-violet-600/30 text-violet-400 border border-violet-500/40 shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{activeOrder.packageName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      ID: {activeOrder.orderId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pesanan sedang ditinjau &amp; disempurnakan oleh <strong className="text-amber-300">{activeOrder.hrName}</strong> ({activeOrder.hrRole})
                  </p>
                  <div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-gradient-to-r from-amber-500 to-violet-500 h-full transition-all duration-500" style={{ width: `${activeOrder.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewMode('ai-progress')}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <span>Lihat Progress Tim</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Service Promo Hero Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-violet-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/40 border border-violet-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Layanan Otomasi CV AI &amp; Garansi HR Review</span>
              </span>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                Bingung Bikin CV ATS-Friendly yang Benar-Benar Lolos Screening HR?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Biarkan AI Pintar CUTI menyusun tata letak, mengekstrak kata kunci SEO pekerjaan, dan disempurnakan langsung oleh Tim Specialist Recruiter kami dalam waktu 15-30 menit.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Skor ATS 95%+ Guaranteed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Ditinjau Praktisi HR Rekrutmen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Siap Pakai Melamar di Job Portal</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAiWizardStep(1);
                setViewMode('ai-wizard');
              }}
              className="px-6 py-3.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Mulai Buatkan CV AI (Rp 29rb)</span>
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari CV berdasarkan judul atau kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan <span className="font-bold text-slate-900 dark:text-white">{filteredCVs.length}</span> dokumen CV
            </div>
          </div>

          {/* Grid Daftar CV */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCVs.map((cv) => (
              <div
                key={cv.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-violet-300 dark:hover:border-violet-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {cv.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Diperbarui: {cv.updatedAt}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 shrink-0">
                      <Award className="w-3.5 h-3.5" />
                      <span>ATS {cv.atsScore}%</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {cv.fullName} - <span className="text-violet-600 dark:text-violet-400">{cv.headline}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {cv.summary}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cv.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {cv.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          +{cv.skills.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedCV(cv);
                        setTitleInput(cv.title);
                        setFormData({
                          fullName: cv.fullName,
                          headline: cv.headline,
                          email: cv.email,
                          phone: cv.phone,
                          location: cv.location,
                          summary: cv.summary,
                          skills: [...cv.skills],
                          experience: [...cv.experience],
                          education: [...cv.education],
                        });
                        setViewMode('preview');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat / Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCV(cv.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      title="Hapus CV"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Mengunduh versi PDF dari ${cv.title}...`);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: AI CV CREATION WIZARD (STEP-BY-STEP ORDER & DATA WIZARD) */}
      {viewMode === 'ai-wizard' && (
        <div className="space-y-6">
          {/* Stepper Header */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <span>Wizard Layanan Pembuatan CV AI &amp; Tim</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Proses mudah 3 langkah untuk mendapatkan CV ATS berstandar multinasional.
                </p>
              </div>
              <button
                onClick={() => setViewMode('list')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Batal</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div
                className={`p-2.5 rounded-lg border text-center transition ${
                  aiWizardStep === 1
                    ? 'bg-violet-50 dark:bg-violet-950/80 border-violet-500 text-violet-700 dark:text-violet-300 font-bold'
                    : aiWizardStep > 1
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold">Langkah 1</div>
                <div className="text-xs truncate">Pilih Paket</div>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-center transition ${
                  aiWizardStep === 2
                    ? 'bg-violet-50 dark:bg-violet-950/80 border-violet-500 text-violet-700 dark:text-violet-300 font-bold'
                    : aiWizardStep > 2
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold">Langkah 2</div>
                <div className="text-xs truncate">Pembayaran</div>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-center transition ${
                  aiWizardStep === 3
                    ? 'bg-violet-50 dark:bg-violet-950/80 border-violet-500 text-violet-700 dark:text-violet-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold">Langkah 3</div>
                <div className="text-xs truncate">Isi / Pilih Data</div>
              </div>
            </div>
          </div>

          {/* STEP 1: PILIH PAKET */}
          {aiWizardStep === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Pilih Paket Layanan Pembuatan CV
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Setiap paket sudah dilengkapi dengan optimasi kata kunci ATS dan garansi hasil rapi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-violet-50/50 dark:bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/20 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <Crown className="w-3 h-3" />
                          <span>{pkg.badge}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {pkg.name}
                            </span>
                            {!pkg.popular && pkg.badge && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              Rp {pkg.price.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              Rp {pkg.originalPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {pkg.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setAiWizardStep(2);
                          }}
                          className={`w-full py-2.5 rounded-lg font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span>Pilih {pkg.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PEMBAYARAN */}
          {aiWizardStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Metode Pembayaran */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-violet-500" />
                    <span>Pilih Metode Pembayaran</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pembayaran diproses secara instan dan aman.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* QRIS */}
                  <label
                    onClick={() => setSelectedPaymentMethod('qris')}
                    className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      selectedPaymentMethod === 'qris'
                        ? 'bg-violet-50/60 dark:bg-violet-950/50 border-violet-500 ring-2 ring-violet-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <span>QRIS Instant (Rekomendasi)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Auto Verifikasi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          GoPay, OVO, ShopeePay, Dana, LinkAja, &amp; All Mobile Banking
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === 'qris'}
                      onChange={() => setSelectedPaymentMethod('qris')}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                  </label>

                  {/* BCA */}
                  <label
                    onClick={() => setSelectedPaymentMethod('bca')}
                    className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      selectedPaymentMethod === 'bca'
                        ? 'bg-violet-50/60 dark:bg-violet-950/50 border-violet-500 ring-2 ring-violet-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Transfer Bank BCA
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          No. Rek 827-104-9281 a.n PT CUTI Indonesia
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === 'bca'}
                      onChange={() => setSelectedPaymentMethod('bca')}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                  </label>

                  {/* Mandiri */}
                  <label
                    onClick={() => setSelectedPaymentMethod('mandiri')}
                    className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      selectedPaymentMethod === 'mandiri'
                        ? 'bg-violet-50/60 dark:bg-violet-950/50 border-violet-500 ring-2 ring-violet-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Transfer Bank Mandiri
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          No. Rek 137-002-8192 a.n PT CUTI Indonesia
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === 'mandiri'}
                      onChange={() => setSelectedPaymentMethod('mandiri')}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                </div>

                {/* Promo Voucher Code */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Punya Kode Voucher Diskon?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode (Coba: CUTIAI10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Gunakan
                    </button>
                  </div>
                  {appliedDiscount > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Voucher CUTIAI10 berhasil dipasang! Potongan Rp 10.000</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Ringkasan Rincian Order */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Ringkasan Pesanan
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Periksa kembali rincian paket sebelum konfirmasi.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Paket Layanan:</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">{selectedPackage.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Harga Paket Normal:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Rp {selectedPackage.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Diskon Voucher Promo:</span>
                      <span>- Rp {appliedDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 font-black text-sm text-slate-900 dark:text-white">
                    <span>Total Pembayaran:</span>
                    <span className="text-violet-600 dark:text-violet-400 text-base">
                      Rp {Math.max(0, selectedPackage.price - appliedDiscount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-violet-50/50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-500" />
                    <span>Garansi Keamanan &amp; Kualitas CUTI</span>
                  </div>
                  <p>
                    Setiap pengerjaan garansi lolos screening sistem ATS dan bisa berkonsultasi langsung dengan Tim HR.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Bayar Sekarang &amp; Lanjutkan (Langkah 3)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiWizardStep(1)}
                    className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Kembali Pilih Paket
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OPTION SELECTION OR WIZARD FORM */}
          {aiWizardStep === 3 && (
            <div className="space-y-6">
              {dataSelectionOption === null ? (
                /* CHOICE SCREEN: EXISTING DATA VS NEW FORM */
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-3xl mx-auto">
                  <div className="text-center space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 inline-block">
                      Langkah 3: Pengisian &amp; Sumber Data CV
                    </span>
                    <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      Bagaimana Anda Ingin Mengisi Data Diri &amp; Pengalaman?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sistem kami mendeteksi Anda sudah memiliki profil dan CV tersimpan di akun CUTI.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OPTION A: USE EXISTING DATA */}
                    <div
                      onClick={() => {
                        setDataSelectionOption('existing');
                        handleCompleteOrder('existing');
                      }}
                      className="p-5 rounded-xl border-2 border-violet-500 bg-violet-50/40 dark:bg-violet-950/30 hover:bg-violet-50 dark:hover:bg-violet-950/60 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-violet-600 text-white w-fit">
                          <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>Gunakan Data Lama Saya</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">
                              Praktis &amp; Cepat
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            Otomatis mengambil data dari Profil &amp; CV tersimpan kamu tanpa perlu mengetik ulang.
                          </p>
                        </div>

                        {/* Existing Data Summary Preview */}
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800/60 text-xs space-y-1.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {formData.fullName || 'Budi Santoso'}
                          </div>
                          <div className="text-violet-600 dark:text-violet-400 text-[11px]">
                            {formData.headline || 'Senior Full Stack Developer'}
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            Email: {formData.email || 'budi.santoso@email.com'}
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            {formData.experience.length} Pengalaman Kerja &bull; {formData.skills.length} Skills Tersimpan
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Pakai Data Ini &amp; Kirim ke Tim AI</span>
                      </button>
                    </div>

                    {/* OPTION B: FILL NEW FORM */}
                    <div
                      onClick={() => setDataSelectionOption('new')}
                      className="p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-fit">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Isi Form Baru / Impordata Baru
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            Isi informasi baru secara bertahap melalui form wizard atau unggah file CV lama kamu.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                          <div>&bull; Form terstruktur (Data Diri, Edu, Pengalaman)</div>
                          <div>&bull; Catatan Khusus untuk Tim HR</div>
                          <div>&bull; Unggah Berkas Pelengkap (.PDF / .DOCX)</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Mulai Isi Form Baru</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* NEW FORM WIZARD STEPS */
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-3xl mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        Form Wizard Data CV Baru (Langkah {wizardFormStep} dari 3)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Isikan data berikut untuk diproses oleh Tim AI &amp; HR CUTI.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDataSelectionOption(null)}
                      className="text-xs font-bold text-violet-600 hover:underline"
                    >
                      Pilih Opsi Lain
                    </button>
                  </div>

                  {/* Wizard Form Step 1: Data Diri */}
                  {wizardFormStep === 1 && (
                    <div className="space-y-4 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        1. Data Diri &amp; Target Karir
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1">Nama Lengkap *</label>
                          <input
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Headline / Posisi yang Dilamar *</label>
                          <input
                            type="text"
                            placeholder="Contoh: Senior Full Stack Engineer"
                            value={formData.headline}
                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Email Aktif *</label>
                          <input
                            type="email"
                            placeholder="budi@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">No HP / WhatsApp *</label>
                          <input
                            type="text"
                            placeholder="+62 812-3456-7890"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold block mb-1">Ringkasan Profil Singkat</label>
                        <textarea
                          rows={3}
                          placeholder="Jelaskan secara singkat latar belakang profesional kamu..."
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setWizardFormStep(2)}
                          className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Lanjut ke Pengalaman</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Wizard Form Step 2: Pengalaman & Pendidikan */}
                  {wizardFormStep === 2 && (
                    <div className="space-y-4 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        2. Pengalaman Kerja &amp; Pendidikan
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200">Tambah Pengalaman Kerja Utama</div>
                        <input
                          type="text"
                          placeholder="Nama Perusahaan (e.g. PT Tech Inovasi)"
                          value={expCompany}
                          onChange={(e) => setExpCompany(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Posisi / Jabatan"
                            value={expRole}
                            onChange={(e) => setExpRole(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                          <input
                            type="text"
                            placeholder="Periode (e.g. 2022 - Sekarang)"
                            value={expPeriod}
                            onChange={(e) => setExpPeriod(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Deskripsi tugas &amp; pencapaian..."
                          value={expDesc}
                          onChange={(e) => setExpDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold transition cursor-pointer"
                        >
                          + Simpan Item Pengalaman
                        </button>
                      </div>

                      {/* Display added experience items */}
                      {formData.experience.map((exp, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{exp.role} @ {exp.company}</div>
                            <div className="text-[10px] text-slate-500">{exp.period}</div>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold">Tersimpan</span>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardFormStep(1)}
                          className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        >
                          Kembali
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardFormStep(3)}
                          className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Lanjut ke Skill &amp; Catatan</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Wizard Form Step 3: Skills & Catatan Khusus */}
                  {wizardFormStep === 3 && (
                    <div className="space-y-4 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        3. Skill Utama &amp; Catatan Khusus untuk Tim AI/HR
                      </div>

                      <div className="space-y-2">
                        <label className="font-semibold block">Skill Utama (Tekan Enter)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Contoh: React.js, Python, UI/UX"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold"
                          >
                            Tambah
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData.skills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold block">Catatan Khusus untuk Tim HR CUTI</label>
                        <textarea
                          rows={3}
                          placeholder="Contoh: Mohon tekankan skill kepemimpinan dan pengalaman di e-commerce..."
                          value={aiNote}
                          onChange={(e) => setAiNote(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setWizardFormStep(2)}
                          className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        >
                          Kembali
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompleteOrder('new')}
                          className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Kirim Data &amp; Mulai Pengerjaan AI</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: PROGRESS STATUS TIM & ORDER TRACKER */}
      {viewMode === 'ai-progress' && activeOrder && (
        <div className="space-y-6">
          {/* Main Order Tracker Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Dalam Proses Pengerjaan Tim</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {activeOrder.orderId}</span>
                </div>
                <h3 className="font-extrabold text-lg md:text-xl text-slate-900 dark:text-white">
                  Status Progress Pesanan {activeOrder.packageName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dibuat pada: {activeOrder.createdAt} &bull; Metode: {activeOrder.paymentMethod}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 hover:bg-violet-100 font-bold text-xs border border-violet-200 dark:border-violet-800/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Pratinjau Draf CV</span>
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Tim HR</span>
                </button>
              </div>
            </div>

            {/* Overall Progress Meter */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Progress Pengerjaan Kualitas CV: {activeOrder.progress}%</span>
                <span className="text-violet-600 dark:text-violet-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Estimasi Selesai: {activeOrder.estimatedTime}</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 via-violet-600 to-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${activeOrder.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4 pt-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-500" />
                <span>Tahapan Kerja Tim HR &amp; Sistem AI CUTI</span>
              </h4>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {/* Step 1 */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 rounded-full bg-emerald-500 text-white shrink-0 shadow-2xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>1. Pembayaran Dikonfirmasi</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Selesai</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sistem verifikasi otomatis menerima pembayaran Rp {activeOrder.price.toLocaleString('id-ID')} via {activeOrder.paymentMethod}.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 rounded-full bg-emerald-500 text-white shrink-0 shadow-2xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>2. Analisis &amp; Penataan Format ATS oleh Engine AI</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Selesai</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sistem AI mengekstrak data diri, menyusun bullet point STAR method, dan memilih kata kunci SEO industri target.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 rounded-full bg-violet-600 text-white shrink-0 shadow-md ring-4 ring-violet-100 dark:ring-violet-950">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>3. Review &amp; Penyempurnaan Kualitas oleh Tim HR</span>
                      <span className="text-[10px] text-violet-600 font-bold bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded">Sedang Berlangsung</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Ditinjau oleh <strong className="text-violet-600 dark:text-violet-400">{activeOrder.hrName}</strong> ({activeOrder.hrRole}) untuk memastikan standar multinasional.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 relative z-10 opacity-50">
                  <div className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      4. CV Final Siap Diunduh (PDF &amp; DOCX)
                    </div>
                    <p className="text-xs text-slate-500">
                      Dokumen final beserta laporan skor ATS akan dikirimkan langsung ke halaman ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HR Specialist Info Card */}
            <div className="p-4 rounded-lg bg-violet-50/60 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  SM
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {activeOrder.hrName}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {activeOrder.hrRole} &bull; Online
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowChatModal(true)}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-violet-600 dark:text-violet-300 font-bold text-xs border border-violet-200 dark:border-violet-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Pesan ke HR</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Kembali ke Daftar CV Saya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: MANUAL CREATION & EDIT VIEW */}
      {(viewMode === 'create' || viewMode === 'preview') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: LIVE A4 PAPERLIKE DOCUMENT CANVAS */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs border border-violet-200 dark:border-violet-800">
                  Pratinjau Kertas A4 (Real-time)
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  210 x 297 mm
                </span>
              </div>

              <button
                onClick={() => alert('Mengunduh dokumen CV A4...')}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF A4</span>
              </button>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar pb-4 flex justify-center bg-slate-200/60 dark:bg-slate-950/80 p-4 md:p-8 rounded-xl border border-slate-300/60 dark:border-slate-800">
              <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl shadow-slate-900/15 border border-slate-300 p-8 md:p-12 font-sans flex flex-col justify-between transition-all">
                <div className="space-y-6">
                  {/* Paper Header */}
                  <div className="border-b-2 border-slate-900 pb-4">
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
                      {formData.fullName || 'NAMA LENGKAP KAMU'}
                    </h1>
                    <p className="text-sm font-bold text-violet-700 uppercase tracking-wide mt-1">
                      {formData.headline || 'Target Posisi / Professional Title'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium mt-3">
                      {formData.email && <span>{formData.email}</span>}
                      {formData.phone && <span>• {formData.phone}</span>}
                      {formData.location && <span>• {formData.location}</span>}
                    </div>
                  </div>

                  {/* Summary Section */}
                  {(formData.summary || viewMode === 'create') && (
                    <div className="space-y-1.5">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        RINGKASAN PROFIL
                      </h2>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {formData.summary ||
                          'Ringkasan profesional kamu akan tampil secara otomatis di area ini saat kamu mengisi form di samping...'}
                      </p>
                    </div>
                  )}

                  {/* Skills Section */}
                  {formData.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        KEAHLIAN UTAMA &amp; KOMPETENSI
                      </h2>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Section */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      PENGALAMAN KERJA
                    </h2>
                    {formData.experience.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada pengalaman ditambahkan. Isikan melalui sidebar di kanan.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {formData.experience.map((exp) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                              <span>
                                {exp.role} - <span className="text-violet-700">{exp.company}</span>
                              </span>
                              <span className="text-slate-500 font-normal">{exp.period}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education Section */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      PENDIDIKAN
                    </h2>
                    {formData.education.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada riwayat pendidikan.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {formData.education.map((edu) => (
                          <div key={edu.id} className="flex items-center justify-between text-xs text-slate-800">
                            <div>
                              <span className="font-bold">{edu.degree}</span>
                              <span className="text-slate-600"> - {edu.institution}</span>
                            </div>
                            <span className="text-slate-500">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Dibuat dengan CUTI ATS CV Builder</span>
                  <span>Standar Format A4 Multinasional</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR FORM CONTROLS */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {viewMode === 'create' ? 'Input Data CV Saya' : 'Edit Keterangan CV'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Isi data di sidebar ini untuk memperbarui lembar A4 secara langsung
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveCV}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>

            <form onSubmit={handleSaveCV} className="space-y-4">
              {/* Accordion 1: Judul CV */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion('title')}
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white transition"
                >
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Judul &amp; Versi Dokumen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {titleInput && (
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                        {titleInput}
                      </span>
                    )}
                    {openAccordion['title'] ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {openAccordion['title'] && (
                  <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Judul CV / Versi Dokumen *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: CV Full Stack Engineer - React"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                )}
              </div>

              {/* Accordion 2: Data Diri */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion('personal')}
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white transition"
                >
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>1. Data Diri &amp; Kontak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.fullName && (
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                        {formData.fullName}
                      </span>
                    )}
                    {openAccordion['personal'] ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {openAccordion['personal'] && (
                  <div className="p-4 space-y-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap *"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Headline / Target Posisi *"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Email Aktif *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="No HP (+62...)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Lokasi (Kota, Negara)"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                    />
                    <textarea
                      rows={3}
                      placeholder="Ringkasan profil singkat (2-3 kalimat)..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Accordion 3: Keahlian */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion('skills')}
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white transition"
                >
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    <Wrench className="w-4 h-4" />
                    <span>2. Keahlian &amp; Skills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                      {formData.skills.length} Skill
                    </span>
                    {openAccordion['skills'] ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {openAccordion['skills'] && (
                  <div className="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tambah Skill (e.g. React, Docker)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-3 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-700 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(index)}
                            className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan &amp; Terbitkan CV A4</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: PRATINJAU DRAF CV AI (DRAFT MODAL) */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  Draf Sementara
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Pratinjau Hasil AI (Menunggu Final Review HR)
                </h4>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar space-y-4 bg-slate-100 dark:bg-slate-950">
              <div className="p-6 bg-white text-slate-900 border border-slate-300 rounded-lg space-y-4 shadow-sm text-xs">
                <div className="border-b border-slate-900 pb-2">
                  <h2 className="text-xl font-black uppercase text-slate-900">{formData.fullName || 'BUDI SANTOSO'}</h2>
                  <p className="font-bold text-violet-700 uppercase mt-0.5">{formData.headline || 'Senior Full Stack Engineer'}</p>
                </div>
                <div>
                  <h3 className="font-bold uppercase text-[10px] text-slate-500 tracking-wider">Ringkasan Profil</h3>
                  <p className="mt-1 leading-relaxed text-slate-700">{formData.summary || 'Senior Engineer berpengalaman dalam React, Next.js, dan arsitektur micro-frontend.'}</p>
                </div>
                <div>
                  <h3 className="font-bold uppercase text-[10px] text-slate-500 tracking-wider">Keahlian Utama ATS</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border text-[10px] font-bold text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-white dark:bg-slate-900">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHAT WITH HR SPECIALIST */}
      {showChatModal && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-md h-[500px] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-violet-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-violet-600 font-bold flex items-center justify-center text-xs">
                  SM
                </div>
                <div>
                  <div className="font-bold text-xs">{activeOrder.hrName}</div>
                  <div className="text-[10px] text-violet-300">Live Chat HR Specialist</div>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="p-1 hover:text-slate-300 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3 bg-slate-50 dark:bg-slate-950/60">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
              <input
                type="text"
                placeholder="Tulis pesan ke Sarah..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleSendChatMessage}
                className="p-2.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PILIH TEMPLATE CV MANDIRI */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-violet-900 via-slate-900 to-violet-950 text-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-violet-300 text-xs font-bold">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span>Koleksi Templat CV ATS CUTI</span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white">
                  Pilih Template CV Mandiri
                </h3>
                <p className="text-xs text-slate-300">
                  Pilih format layout yang paling sesuai dengan target bidang pekerjaan dan tingkat pengalaman kamu.
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Template Cards Grid */}
            <div className="p-5 md:p-6 overflow-y-auto no-scrollbar space-y-4 bg-slate-50 dark:bg-slate-950/60 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cvTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-violet-50/80 dark:bg-violet-950/70 border-violet-500 ring-2 ring-violet-500/30 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                            {tpl.badge}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ATS {tpl.score}</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-3 pt-1">
                          <div className={`p-2.5 rounded-lg ${tpl.iconColor} shrink-0`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {tpl.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
                              {tpl.description}
                            </p>
                          </div>
                        </div>

                        {/* Feature bullets */}
                        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {tpl.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplateId(tpl.id);
                          resetForm();
                          setTitleInput(`CV ATS - ${tpl.name}`);
                          setShowTemplateModal(false);
                          setViewMode('create');
                        }}
                        className={`w-full py-2.5 rounded-lg font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>Gunakan Template Ini</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Semua templat dijamin 100% kompatibel dengan sistem ATS.
              </span>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
