'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CvPromoModal } from '@/components/CvPromoModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { INDONESIAN_CITIES } from '@/lib/indonesianCities';
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
  SlidersHorizontal,
  GripVertical,
  MapPin,
} from 'lucide-react';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const YEARS = Array.from({ length: 45 }, (_, i) => String(2026 - i));

const CitySearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return INDONESIAN_CITIES.slice(0, 50);
    const q = query.toLowerCase().trim();
    return INDONESIAN_CITIES.filter((city) =>
      city.toLowerCase().includes(q)
    ).slice(0, 60);
  }, [query]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari Kota / Kabupaten di Indonesia (misal: Bandung, Jakarta, Surabaya)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              setIsOpen(true);
            }}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && filteredCities.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-xs py-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setQuery(city);
                onChange(city);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-200 font-medium transition cursor-pointer flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0" />
                <span>{city}</span>
              </span>
              {query.trim() && city.toLowerCase() === query.toLowerCase().trim() && (
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
      {isOpen && filteredCities.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-xs text-slate-500 text-center">
          Kota tidak ditemukan. Kamu tetap bisa menggunakan kata kunci ini.
        </div>
      )}
    </div>
  );
};

const CVSectionCard = ({
  title,
  index,
  totalSections,
  isOpen,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragged,
  children,
}: {
  sectionKey: string;
  title: string;
  accordionKey: string;
  index: number;
  totalSections: number;
  isOpen: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragged: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`border rounded-xl bg-white dark:bg-slate-900 shadow-2xs transition-all ${
        isDragged
          ? 'opacity-30 border-2 border-dashed border-orange-500 scale-[0.99] bg-orange-50/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition border-b border-slate-100 dark:border-slate-800 rounded-t-xl">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded transition shrink-0"
            title="Tarik untuk mengatur posisi section di CV"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="font-bold text-sm text-slate-800 dark:text-white truncate hover:text-orange-500 transition cursor-pointer text-left"
          >
            {title}
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Pindahkan ke atas"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalSections - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Pindahkan ke bawah"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-1 text-teal-600 dark:text-teal-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ml-1"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3.5 bg-white dark:bg-slate-900">
          {children}
        </div>
      )}
    </div>
  );
};

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  website?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  period: string;
  description: string;
  achievements?: string;
}

export interface InternshipItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  website?: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  link?: string;
  date?: string;
  description: string;
}

export interface OrganizationItem {
  id: string;
  role: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  gpa?: string;
  startDate?: string;
  endDate?: string;
  year: string;
  description?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  link?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
}

export interface LanguageItem {
  id: string;
  language: string;
  level: 'Native' | 'Professional' | 'Conversational' | 'Basic';
}

export interface CourseItem {
  id: string;
  courseName: string;
  institution: string;
  month?: string;
  year?: string;
  description?: string;
}

export interface ScholarshipItem {
  id: string;
  name: string;
  provider: string;
  month?: string;
  year?: string;
  description?: string;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface ReferenceItem {
  id: string;
  fullName: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface CVData {
  id: string;
  title: string;
  updatedAt: string;
  atsScore: number;
  sectionOrder?: string[];

  // 1. Informasi Pribadi
  firstName?: string;
  lastName?: string;
  fullName: string;
  headline: string;
  photoUrl?: string;

  // 2. Informasi Kontak
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;

  // 3. Lokasi
  city?: string;
  province?: string;
  country?: string;
  location: string;

  // 4. Ringkasan Profesional
  summary: string;

  // 5. Pengalaman Kerja
  experience: ExperienceItem[];

  // 6. Pengalaman Magang
  internships?: InternshipItem[];

  // 7. Proyek
  projects?: ProjectItem[];

  // 8. Pengalaman Organisasi
  organizations?: OrganizationItem[];

  // 9. Pendidikan
  education: EducationItem[];

  // 10. Sertifikat
  certifications?: CertificationItem[];

  // 11. Keahlian
  skillsList?: SkillItem[];
  skills: string[];

  // 12. Bahasa
  languages?: LanguageItem[];

  // 13-16. Course, Scholarship, Volunteer, Reference
  courses?: CourseItem[];
  scholarships?: ScholarshipItem[];
  volunteers?: VolunteerItem[];
  references?: ReferenceItem[];

  templateId?: string;
}

export const DEFAULT_SECTION_ORDER = [
  'summary',
  'experience',
  'internships',
  'projects',
  'organizations',
  'education',
  'certifications',
  'skills',
  'languages',
  'courses',
  'scholarships',
  'volunteers',
  'references',
];

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
  description: string;
  features: string[];
  iconColor: string;
  hidden?: boolean;
}

const cvTemplates: TemplateOption[] = [
  {
    id: 'ats-modern',
    name: 'ATS Modern Standard',
    badge: '1 Column ATS',
    description: 'Format tunggal paling optimal untuk sistem ATS HRD BUMN & Multinasional. Memaksimalkan pembacaan kata kunci.',
    iconColor: 'bg-blue-600 text-white',
    features: ['100% Parsing ATS Friendly', 'Font Standar Internasional', 'Hierarki Pengalaman Jelas'],
  },
  {
    id: 'ketat-serif',
    name: 'Ketat Ruled Serif',
    badge: 'Classic Serif',
    description: 'Format serif ringkas dengan garis pemisah (ruled heading). Sangat disukai industri Perbankan, Hukum, & BUMN.',
    iconColor: 'bg-slate-800 text-white',
    features: ['Garis Pemisah Ruled Heading', 'Font Serif Formal', 'Tata Letak Padat & Rapi'],
  },
  {
    id: 'luasa-minimal',
    name: 'Luasa Airy Minimalist',
    badge: 'Minimalist',
    description: 'Tampilan bersih dengan spasi antar elemen yang lega dan letterspaced heading. Cocok untuk Profesional & Manager.',
    iconColor: 'bg-sky-600 text-white',
    features: ['Spasi Elemen Lega', 'Letterspaced Headings', 'Desain Modern & Clean'],
  },
  {
    id: 'tebal-bold',
    name: 'Tebal Bold Statement',
    badge: 'Bold ATS',
    description: 'Template tegas dengan nama besar & blok judul uppercase hitam. Sangat eyecatching tanpa mengorbankan parser ATS.',
    iconColor: 'bg-slate-900 text-white',
    features: ['Header Nama Ekstra Besar', 'Blok Judul Uppercase', 'Visual Strong & Clear'],
  },
  {
    id: 'harvard-modern',
    name: 'Harvard Modern Black',
    badge: '2 Column ATS',
    description: 'Layout 2 kolom dengan grid date-content yang rapi. Inspired by Harvard Business School resume format.',
    iconColor: 'bg-slate-900 text-white',
    features: ['Grid Layout Professional', 'Date di Kolom Kiri', 'Minimal & Clean'],
  },
  {
    id: 'rezi-classic',
    name: 'Rezi Classic Serif',
    badge: 'Classic',
    description: 'Font serif klasik dengan layout tradisional. Sangat cocok untuk posisi akademis, legal, dan consulting.',
    iconColor: 'bg-blue-800 text-white',
    features: ['Font Serif Klasik', 'Traditional Layout', 'Formal & Authoritative'],
  },
  {
    id: 'minimalist-executive',
    name: 'Minimalist Executive',
    badge: 'Executive',
    description: 'Desain bersih dengan tata letak ringkas & elegan. Sangat cocok untuk posisi Manajerial, Finansial, & Konsultan.',
    iconColor: 'bg-slate-800 text-white',
    features: ['Ringkasan Eksekutif Dominan', 'Garis Pemisah Minimalis', 'Tampilan Rapi & Formal'],
  },
  {
    id: 'creative-tech',
    name: 'Creative Tech & Digital',
    badge: 'Tech & Product',
    description: 'Menonjolkan daftar Tech Stack, sertifikasi profesional, dan portofolio. Sangat ideal untuk Developer & Designer.',
    iconColor: 'bg-emerald-600 text-white',
    features: ['Sorotan Skill Pill Badges', 'Kategori Proyek & Portofolio', 'Tata Letak Modern'],
  },
];

export interface CVViewProps {
  cvId?: string;
}

export const CVView: React.FC<CVViewProps> = ({ cvId }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const [cvList, setCvList] = useState<CVData[]>(initialCVs);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'preview' | 'ai-wizard' | 'ai-progress'>(() => {
    if (!cvId) return 'list';
    if (cvId === 'create') return 'create';
    return 'preview';
  });

  const [selectedCV, setSelectedCV] = useState<CVData | null>(() => {
    if (!cvId || cvId === 'create') return null;
    const found = initialCVs.find((c) => c.id === cvId);
    if (found) return found;
    return {
      id: cvId,
      title: `CV Senior Frontend Engineer - John Doe`,
      updatedAt: 'Hari ini',
      atsScore: 95,
      fullName: 'John Doe',
      headline: 'Senior Frontend Engineer',
      email: 'john.doe@example.com',
      phone: '+1 555 010 1234',
      location: 'San Francisco, California, United States',
      summary:
        'Senior frontend engineer with 8+ years building accessible, high-performance web applications for fintech and SaaS. Deep experience with React, Next.js, and design systems, with a focus on developer experience and shipping measurable outcomes. Comfortable leading projects end to end and mentoring teams.',
      skills: [
        'TypeScript (Expert)',
        'JavaScript (ES2023) (Expert)',
        'React & Next.js (Expert)',
        'Node.js (Advanced)',
        'GraphQL & REST APIs (Advanced)',
        'Tailwind CSS (Advanced)',
        'Testing (Playwright, Vitest) (Advanced)',
        'State (Zustand, React Query) (Advanced)',
        'Web Accessibility (WCAG) (Advanced)',
        'CI/CD & Docker (Intermediate)',
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'Acme Corp',
          role: 'Senior Frontend Engineer',
          period: 'San Francisco, CA • acme.example.com',
          description:
            '• Led migration of a 200k-line codebase to a typed component library, cutting UI defects by 40%.\n• Architected the design-system accessibility program, reaching WCAG 2.1 AA across every shipped component.\n• Cut initial bundle size 55% with code-splitting and dependency audits, improving LCP from 3.1s to 1.4s.\n• Built a real-time analytics dashboard over WebSockets, adopted by 12k weekly active users.\n• Maintain react-a11y-kit, an open-source accessibility toolkit with 2k+ stars.\n• Mentored four engineers and set the team\'s code-review, testing, and release standards.',
        },
        {
          id: 'exp-2',
          company: 'Globex',
          role: 'Frontend Engineer',
          period: 'Remote • globex.example.com',
          description:
            '• Delivered the customer-facing analytics dashboard used by 12k weekly active users.\n• Introduced a shared component library and Storybook, cutting feature delivery time by ~30%.\n• Integrated analytics and A/B testing (Mixpanel, GrowthBook) to drive data-informed UI decisions.\n• Moved all marketing sites to Good Core Web Vitals through image, font, and caching optimizations.',
        },
        {
          id: 'exp-3',
          company: 'Initech',
          role: 'Junior Frontend Developer',
          period: 'Austin, TX • initech.example.com',
          description:
            '• Built responsive, cross-browser interfaces from Figma designs for enterprise clients.\n• Automated form-heavy QA workflows, reducing manual testing time by 20%.\n• Shipped a reusable form-validation library still used across three internal apps.',
        },
        {
          id: 'exp-4',
          company: 'Hooli (Magang)',
          role: 'Frontend Engineering Intern',
          period: 'Palo Alto, CA • hooli.example.com',
          description:
            '• Shipped a customer-facing settings page in React, used by the full beta cohort by the end of the summer.\n• Wrote the team\'s first component unit tests, lifting coverage on the shared UI package to 70%.',
        },
        {
          id: 'exp-5',
          company: 'react-a11y-kit (Proyek)',
          role: 'Creator & Maintainer',
          period: 'github.com/johndoe/react-a11y-kit',
          description:
            'Open-source accessibility toolkit for React with 2k+ stars and 40+ contributors. Ships audited, WCAG-compliant primitives adopted across several production design systems.',
        },
        {
          id: 'exp-6',
          company: 'React SF Meetup & Web Dev Club (Organisasi)',
          role: 'Organizer & President',
          period: 'Community & University',
          description:
            '• Curate monthly talks for a 1,800-member community and coordinate speakers, venues, and sponsors.\n• Launched a lightning-talk track that has given 30+ first-time speakers a stage.\n• Grew the campus Web Dev Club from 30 to 120 members and ran weekly hands-on workshops.',
        },
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'Recurse Center',
          degree: 'Software Residency (New York, NY)',
          year: 'Residency',
        },
        {
          id: 'edu-2',
          institution: 'State University',
          degree: 'B.Sc. Computer Science (Boston, MA - Honors GPA 3.8)',
          year: '2012 - 2016',
        },
        {
          id: 'edu-3',
          institution: 'Sertifikat Profesional',
          degree: 'AWS Solutions Architect | Meta Front-End Developer | CPACC Web Accessibility',
          year: '2021 - 2024',
        },
        {
          id: 'edu-4',
          institution: 'Bahasa',
          degree: 'English (Native) • Spanish (Professional) • French (Conversational)',
          year: 'Bahasa',
        },
      ],
    };
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(true);
  const lastSavedSnapshotRef = useRef<string>('');
  const prevCvIdRef = useRef<string | undefined | null>(undefined);

  // Set isMounted on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load cvList from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cuti_cv_list');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCvList(parsed);
        } catch (e) {
          console.error(e);
        }
      } else {
        localStorage.setItem('cuti_cv_list', JSON.stringify(initialCVs));
      }
    }
  }, []);

  // Sync with cvId prop
  useEffect(() => {
    if (prevCvIdRef.current === cvId) return;
    prevCvIdRef.current = cvId;

    lastSavedSnapshotRef.current = '';
    if (!cvId) {
      setViewMode('list');
      setSelectedCV(null);
      return;
    }

    if (cvId === 'create') {
      setViewMode('create');
      resetForm();
      setIsFormDrawerOpen(true);
      return;
    }

    let activeCvList = cvList;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cuti_cv_list');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeCvList = parsed;
            setCvList(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const cv = activeCvList.find((c) => c.id === cvId);
    if (cv) {
      setSelectedCV(cv);
      setTitleInput(cv.title);
      setFormData({
        fullName: cv.fullName || '',
        headline: cv.headline || '',
        email: cv.email || '',
        phone: cv.phone || '',
        location: cv.location || '',
        summary: cv.summary || '',
        skills: cv.skills ? [...cv.skills] : [],
        experience: cv.experience ? [...cv.experience] : [],
        education: cv.education ? [...cv.education] : [],
        courses: cv.courses ? [...cv.courses] : [],
        scholarships: cv.scholarships ? [...cv.scholarships] : [],
        volunteers: cv.volunteers ? [...cv.volunteers] : [],
        references: cv.references ? [...cv.references] : [],
        internships: cv.internships ? [...cv.internships] : [],
        projects: cv.projects ? [...cv.projects] : [],
        organizations: cv.organizations ? [...cv.organizations] : [],
        certifications: cv.certifications ? [...cv.certifications] : [],
        languages: cv.languages ? [...cv.languages] : [],
      });
      if (cv.templateId) {
        setSelectedTemplateId(cv.templateId);
      }
    } else {
      const fallbackCv: CVData = {
        id: cvId,
        title: `CV Senior Frontend Engineer - John Doe`,
        updatedAt: 'Hari ini',
        atsScore: 95,
        fullName: 'John Doe',
        headline: 'Senior Frontend Engineer',
        email: 'john.doe@example.com',
        phone: '+1 555 010 1234',
        location: 'San Francisco, California, United States',
        summary: 'Senior frontend engineer.',
        skills: ['TypeScript'],
        experience: [
          {
            id: 'exp-1',
            company: 'Acme Corp',
            role: 'Senior Frontend Engineer',
            period: '2021 - Sekarang',
            description: 'Leading frontend architecture for multi-tenant SaaS.',
          },
          {
            id: 'exp-2',
            company: 'Globex',
            role: 'Frontend Engineer',
            period: 'Remote • globex.example.com',
            description:
              '• Delivered the customer-facing analytics dashboard used by 12k weekly active users.\n• Introduced a shared component library and Storybook, cutting feature delivery time by ~30%.\n• Integrated analytics and A/B testing (Mixpanel, GrowthBook) to drive data-informed UI decisions.\n• Moved all marketing sites to Good Core Web Vitals through image, font, and caching optimizations.',
          },
          {
            id: 'exp-3',
            company: 'Initech',
            role: 'Junior Frontend Developer',
            period: 'Austin, TX • initech.example.com',
            description:
              '• Built responsive, cross-browser interfaces from Figma designs for enterprise clients.\n• Automated form-heavy QA workflows, reducing manual testing time by 20%.\n• Shipped a reusable form-validation library still used across three internal apps.',
          },
          {
            id: 'exp-4',
            company: 'Hooli (Magang)',
            role: 'Frontend Engineering Intern',
            period: 'Palo Alto, CA • hooli.example.com',
            description:
              '• Shipped a customer-facing settings page in React, used by the full beta cohort by the end of the summer.\n• Wrote the team\'s first component unit tests, lifting coverage on the shared UI package to 70%.',
          },
          {
            id: 'exp-5',
            company: 'react-a11y-kit (Proyek)',
            role: 'Creator & Maintainer',
            period: 'github.com/johndoe/react-a11y-kit',
            description:
              'Open-source accessibility toolkit for React with 2k+ stars and 40+ contributors. Ships audited, WCAG-compliant primitives adopted across several production design systems.',
          },
          {
            id: 'exp-6',
            company: 'React SF Meetup & Web Dev Club (Organisasi)',
            role: 'Organizer & President',
            period: 'Community & University',
            description:
              '• Curate monthly talks for a 1,800-member community and coordinate speakers, venues, and sponsors.\n• Launched a lightning-talk track that has given 30+ first-time speakers a stage.\n• Grew the campus Web Dev Club from 30 to 120 members and ran weekly hands-on workshops.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Recurse Center',
            degree: 'Software Residency (New York, NY)',
            year: 'Residency',
          },
          {
            id: 'edu-2',
            institution: 'State University',
            degree: 'B.Sc. Computer Science (Boston, MA - Honors GPA 3.8)',
            year: '2012 - 2016',
          },
          {
            id: 'edu-3',
            institution: 'Sertifikat Profesional',
            degree: 'AWS Solutions Architect | Meta Front-End Developer | CPACC Web Accessibility',
            year: '2021 - 2024',
          },
          {
            id: 'edu-4',
            institution: 'Bahasa',
            degree: 'English (Native) • Spanish (Professional) • French (Conversational)',
            year: 'Bahasa',
          },
        ],
      };
      setSelectedCV(fallbackCv);
      setTitleInput(fallbackCv.title);
      setFormData({
        fullName: fallbackCv.fullName,
        headline: fallbackCv.headline,
        email: fallbackCv.email,
        phone: fallbackCv.phone,
        location: fallbackCv.location,
        summary: fallbackCv.summary,
        skills: [...fallbackCv.skills],
        experience: [...fallbackCv.experience],
        education: [...fallbackCv.education],
      });
    }
    setViewMode('preview');
    setIsFormDrawerOpen(true);
  }, [cvId, cvList]);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ats-modern');
  const [templateModalStep, setTemplateModalStep] = useState<number>(1);
  const [newCvTitle, setNewCvTitle] = useState<string>('');
  const [newCvJobTitle, setNewCvJobTitle] = useState<string>('');
  const [newCvStartMode, setNewCvStartMode] = useState<'example' | 'empty' | 'import'>('example');
  const [newCvFile, setNewCvFile] = useState<File | null>(null);

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
    packageName: 'Paket Pro & Expert HR',
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

  // Promo Modal State & Auto-Open check
  const [showCvPromoModal, setShowCvPromoModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('cuti_cv_promo_dismissed');
      if (!dismissed) {
        setShowCvPromoModal(true);
      }
    }
  }, []);

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

  // Accordion State for Manual CV Form (10 sections)
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    sec1: true,
    sec2: false,
    sec3: false,
    sec4: false,
    sec5: false,
    sec6: false,
    sec7: false,
    sec8: false,
    sec9: false,
    sec10: false,
  });

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => {
      const nextState = !prev[section];
      if (nextState) {
        if (section === 'sec3') {
          // Pengalaman Kerja
          setFormData((curr) => {
            if (!curr.experience || curr.experience.length === 0) {
              return {
                ...curr,
                experience: [
                  {
                    id: `exp-${Date.now()}`,
                    role: '',
                    company: '',
                    period: '',
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec4') {
          // Pengalaman Magang
          setFormData((curr) => {
            if (!curr.internships || curr.internships.length === 0) {
              return {
                ...curr,
                internships: [
                  {
                    id: `int-${Date.now()}`,
                    role: '',
                    company: '',
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec5') {
          // Proyek
          setFormData((curr) => {
            if (!curr.projects || curr.projects.length === 0) {
              return {
                ...curr,
                projects: [
                  {
                    id: `proj-${Date.now()}`,
                    name: '',
                    role: '',
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec6') {
          // Pengalaman Organisasi
          setFormData((curr) => {
            if (!curr.organizations || curr.organizations.length === 0) {
              return {
                ...curr,
                organizations: [
                  {
                    id: `org-${Date.now()}`,
                    role: '',
                    name: '',
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec7') {
          // Pendidikan
          setFormData((curr) => {
            if (!curr.education || curr.education.length === 0) {
              return {
                ...curr,
                education: [
                  {
                    id: `edu-${Date.now()}`,
                    institution: '',
                    degree: '',
                    year: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec8') {
          // Sertifikat
          setFormData((curr) => {
            if (!curr.certifications || curr.certifications.length === 0) {
              return {
                ...curr,
                certifications: [
                  {
                    id: `cert-${Date.now()}`,
                    name: '',
                    issuer: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec9') {
          // Keahlian
          setFormData((curr) => {
            if (!curr.skillsList || curr.skillsList.length === 0) {
              return {
                ...curr,
                skillsList: [
                  {
                    id: `sk-${Date.now()}`,
                    name: '',
                    level: 'Advanced',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec10') {
          // Bahasa
          setFormData((curr) => {
            if (!curr.languages || curr.languages.length === 0) {
              return {
                ...curr,
                languages: [
                  {
                    id: `lang-${Date.now()}`,
                    language: '',
                    level: 'Professional',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec11') {
          // Course
          setFormData((curr) => {
            if (!curr.courses || curr.courses.length === 0) {
              return {
                ...curr,
                courses: [
                  {
                    id: `crs-${Date.now()}`,
                    courseName: '',
                    institution: '',
                    month: '',
                    year: '',
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec12') {
          // Scholarship
          setFormData((curr) => {
            if (!curr.scholarships || curr.scholarships.length === 0) {
              return {
                ...curr,
                scholarships: [
                  {
                    id: `sch-${Date.now()}`,
                    name: '',
                    provider: '',
                    month: '',
                    year: '',
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec13') {
          // Volunteer
          setFormData((curr) => {
            if (!curr.volunteers || curr.volunteers.length === 0) {
              return {
                ...curr,
                volunteers: [
                  {
                    id: `vol-${Date.now()}`,
                    organization: '',
                    role: '',
                    location: '',
                    startMonth: '',
                    startYear: '',
                    endMonth: '',
                    endYear: '',
                    isCurrent: false,
                    description: '',
                  },
                ],
              };
            }
            return curr;
          });
        } else if (section === 'sec14') {
          // Reference
          setFormData((curr) => {
            if (!curr.references || curr.references.length === 0) {
              return {
                ...curr,
                references: [
                  {
                    id: `ref-${Date.now()}`,
                    fullName: '',
                    title: '',
                    company: '',
                    email: '',
                    phone: '',
                  },
                ],
              };
            }
            return curr;
          });
        }
      }
      return {
        ...prev,
        [section]: nextState,
      };
    });
  };

  // Form State for Manual CV & Wizard
  const [formData, setFormData] = useState<Omit<CVData, 'id' | 'updatedAt' | 'atsScore' | 'title'>>({
    sectionOrder: DEFAULT_SECTION_ORDER,
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    headline: 'Senior Frontend Engineer',
    photoUrl: '',
    email: 'john.doe@example.com',
    phone: '+1 555 010 1234',
    website: 'johndoe.dev',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'johndoe',
    instagram: '',
    city: 'San Francisco',
    province: 'California',
    country: 'United States',
    location: 'San Francisco, California, United States',
    summary:
      'Senior frontend engineer with 8+ years building accessible, high-performance web applications for fintech and SaaS. Deep experience with React, Next.js, and design systems, with a focus on developer experience and shipping measurable outcomes. Comfortable leading projects end to end and mentoring teams.',
    experience: [
      {
        id: 'exp-1',
        company: 'Acme Corp',
        role: 'Senior Frontend Engineer',
        location: 'San Francisco, CA',
        website: 'acme.example.com',
        startDate: '2020',
        endDate: 'Sekarang',
        isCurrent: true,
        period: 'San Francisco, CA • acme.example.com',
        description:
          '• Led migration of a 200k-line codebase to a typed component library, cutting UI defects by 40%.\n• Architected the design-system accessibility program, reaching WCAG 2.1 AA across every shipped component.\n• Cut initial bundle size 55% with code-splitting and dependency audits, improving LCP from 3.1s to 1.4s.\n• Built a real-time analytics dashboard over WebSockets, adopted by 12k weekly active users.\n• Maintain react-a11y-kit, an open-source accessibility toolkit with 2k+ stars.\n• Mentored four engineers and set the team\'s code-review, testing, and release standards.',
        achievements: 'Cutting UI defects by 40%, LCP improved from 3.1s to 1.4s.',
      },
      {
        id: 'exp-2',
        company: 'Globex',
        role: 'Frontend Engineer',
        location: 'Remote',
        website: 'globex.example.com',
        startDate: '2018',
        endDate: '2020',
        period: 'Remote • globex.example.com',
        description:
          '• Delivered the customer-facing analytics dashboard used by 12k weekly active users.\n• Introduced a shared component library and Storybook, cutting feature delivery time by ~30%.\n• Integrated analytics and A/B testing (Mixpanel, GrowthBook) to drive data-informed UI decisions.\n• Moved all marketing sites to Good Core Web Vitals through image, font, and caching optimizations.',
      },
      {
        id: 'exp-3',
        company: 'Initech',
        role: 'Junior Frontend Developer',
        location: 'Austin, TX',
        website: 'initech.example.com',
        startDate: '2016',
        endDate: '2018',
        period: 'Austin, TX • initech.example.com',
        description:
          '• Built responsive, cross-browser interfaces from Figma designs for enterprise clients.\n• Automated form-heavy QA workflows, reducing manual testing time by 20%.\n• Shipped a reusable form-validation library still used across three internal apps.',
      },
    ],
    internships: [
      {
        id: 'int-1',
        company: 'Hooli',
        role: 'Frontend Engineering Intern',
        location: 'Palo Alto, CA',
        website: 'hooli.example.com',
        startDate: '2015',
        endDate: '2016',
        description:
          '• Shipped a customer-facing settings page in React, used by the full beta cohort by the end of the summer.\n• Wrote the team\'s first component unit tests, lifting coverage on the shared UI package to 70%.',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'react-a11y-kit',
        role: 'Creator & Maintainer',
        link: 'github.com/johndoe/react-a11y-kit',
        date: '2021 - Sekarang',
        description:
          'Open-source accessibility toolkit for React with 2k+ stars and 40+ contributors. Ships audited, WCAG-compliant primitives adopted across several production design systems.',
      },
    ],
    organizations: [
      {
        id: 'org-1',
        name: 'React SF Meetup',
        role: 'Organizer',
        startDate: '2021',
        endDate: 'Sekarang',
        description:
          'Curate monthly talks for a 1,800-member community and coordinate speakers, venues, and sponsors.',
      },
      {
        id: 'org-2',
        name: 'Web Development Club, State University',
        role: 'President',
        startDate: '2014',
        endDate: '2016',
        description:
          'Grew the club from 30 to 120 members and ran weekly hands-on workshops.',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Recurse Center',
        degree: 'Software Residency',
        location: 'New York, NY',
        year: '2020',
      },
      {
        id: 'edu-2',
        institution: 'State University',
        degree: 'B.Sc. Computer Science',
        location: 'Boston, MA',
        gpa: '3.8 / 4.0',
        startDate: '2012',
        endDate: '2016',
        year: '2012 - 2016',
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2023',
        link: 'aws.amazon.com/verification',
      },
      {
        id: 'cert-2',
        name: 'Meta Front-End Developer',
        issuer: 'Coursera / Meta',
        issueDate: '2022',
        link: 'coursera.org/verify/meta-frontend',
      },
      {
        id: 'cert-3',
        name: 'Certified Professional in Web Accessibility (CPACC)',
        issuer: 'IAAP',
        issueDate: '2021',
        link: 'accessibilityassociation.org',
      },
    ],
    skillsList: [
      { id: 'sk-1', name: 'TypeScript', level: 'Expert' },
      { id: 'sk-2', name: 'JavaScript (ES2023)', level: 'Expert' },
      { id: 'sk-3', name: 'React & Next.js', level: 'Expert' },
      { id: 'sk-4', name: 'Node.js', level: 'Advanced' },
      { id: 'sk-5', name: 'GraphQL & REST APIs', level: 'Advanced' },
      { id: 'sk-6', name: 'Tailwind CSS', level: 'Advanced' },
      { id: 'sk-7', name: 'Testing (Playwright, Vitest)', level: 'Advanced' },
      { id: 'sk-8', name: 'State (Zustand, React Query)', level: 'Advanced' },
      { id: 'sk-9', name: 'Web Accessibility (WCAG)', level: 'Advanced' },
      { id: 'sk-10', name: 'CI/CD & Docker', level: 'Intermediate' },
    ],
    skills: [
      'TypeScript (Expert)',
      'JavaScript (ES2023) (Expert)',
      'React & Next.js (Expert)',
      'Node.js (Advanced)',
      'GraphQL & REST APIs (Advanced)',
      'Tailwind CSS (Advanced)',
      'Testing (Playwright, Vitest) (Advanced)',
      'State (Zustand, React Query) (Advanced)',
      'Web Accessibility (WCAG) (Advanced)',
      'CI/CD & Docker (Intermediate)',
    ],
    languages: [
      { id: 'lang-1', language: 'English', level: 'Native' },
      { id: 'lang-2', language: 'Spanish', level: 'Professional' },
      { id: 'lang-3', language: 'French', level: 'Conversational' },
    ],
    courses: [
      { id: 'crs-1', courseName: 'Machine Learning Specialization', institution: 'Coursera / Stanford University', month: 'Agustus', year: '2024', description: 'Deep neural networks, supervised & unsupervised learning algorithms.' },
    ],
    scholarships: [
      { id: 'sch-1', name: 'Merit Scholarship for Academic Excellence', provider: 'University of California', month: 'September', year: '2023', description: 'Awarded for maintaining top 5% GPA across all engineering departments.' },
    ],
    volunteers: [
      { id: 'vol-1', organization: 'Red Cross International', role: 'First Aid & Emergency Response Volunteer', location: 'San Francisco, CA', startMonth: 'Januari', startYear: '2023', endMonth: '', endYear: '', isCurrent: true, description: 'Coordinated disaster response drills and community first-aid workshops.' },
    ],
    references: [
      { id: 'ref-1', fullName: 'Sarah Smith', title: 'Engineering Director', company: 'Acme Corp', email: 'sarah.smith@example.com', phone: '+1 555 019 2831' },
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

  // Drag & Drop Section Reordering State & Handlers
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  const activeSectionOrder = formData.sectionOrder && formData.sectionOrder.length > 0
    ? formData.sectionOrder
    : DEFAULT_SECTION_ORDER;

  const handleSectionDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSectionIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSectionDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === index) return;
    const newOrder = [...activeSectionOrder];
    const [dragged] = newOrder.splice(draggedSectionIndex, 1);
    newOrder.splice(index, 0, dragged);
    setFormData((prev) => ({ ...prev, sectionOrder: newOrder }));
    setDraggedSectionIndex(null);
  };

  const moveSectionUpDown = (index: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeSectionOrder.length) return;
    const newOrder = [...activeSectionOrder];
    const [item] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, item);
    setFormData((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  // Auto-save CV data to local storage ONLY when data changes AND after 1.5s idle inactivity (selesai mengisi)
  useEffect(() => {
    if (!isMounted || (viewMode !== 'create' && !cvId)) return;

    const currentSnapshot = JSON.stringify({ formData, titleInput, selectedTemplateId });

    // Set initial snapshot on first load without saving
    if (!lastSavedSnapshotRef.current) {
      lastSavedSnapshotRef.current = currentSnapshot;
      return;
    }

    // Skip auto-save if no data changed
    if (currentSnapshot === lastSavedSnapshotRef.current) return;

    // Debounce timer: wait 1500ms (1.5s) without any activity before saving
    const timer = setTimeout(() => {
      const targetId = cvId && cvId !== 'create' ? cvId : 'cv-draft-local';

      const updatedCV: CVData = {
        ...(selectedCV || {}),
        ...formData,
        id: targetId,
        title: titleInput || 'CV Saya',
        updatedAt: 'Hari ini',
        atsScore: selectedCV ? selectedCV.atsScore : 88,
        templateId: selectedTemplateId,
      } as CVData;

      setCvList((prevList) => {
        let updatedList = [...prevList];
        if (cvId && cvId !== 'create') {
          updatedList = prevList.map((cv) => (cv.id === cvId ? updatedCV : cv));
        } else {
          const existingIdx = prevList.findIndex((cv) => cv.id === 'cv-draft-local');
          if (existingIdx >= 0) {
            updatedList[existingIdx] = updatedCV;
          } else {
            updatedList = [updatedCV, ...prevList];
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
          localStorage.setItem('cuti_cv_active_draft', JSON.stringify(updatedCV));
        }
        return updatedList;
      });

      lastSavedSnapshotRef.current = currentSnapshot;
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, titleInput, selectedTemplateId, cvId, viewMode, isMounted, selectedCV]);

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

  const handleRemoveExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateEducation = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleSaveCV = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList = [...cvList];
    
    if (cvId && cvId !== 'create') {
      const calculatedScore = selectedCV ? selectedCV.atsScore : 85;
      const updatedCV: CVData = {
        id: cvId,
        title: titleInput || 'CV Tanpa Judul',
        updatedAt: 'Hari ini',
        atsScore: calculatedScore,
        fullName: formData.fullName,
        headline: formData.headline,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        summary: formData.summary,
        skills: [...formData.skills],
        experience: [...formData.experience],
        education: [...formData.education],
        templateId: selectedTemplateId,
      } as CVData;
      updatedList = cvList.map((cv) => (cv.id === cvId ? updatedCV : cv));
    } else {
      const newId = `cv-${Date.now()}`;
      const calculatedScore = 85 + (cvList.length % 8);
      const newCV: CVData = {
        id: newId,
        title: titleInput || 'CV Tanpa Judul',
        updatedAt: 'Hari ini',
        atsScore: calculatedScore,
        ...formData,
        templateId: selectedTemplateId,
      };
      updatedList = [newCV, ...cvList];
    }

    setCvList(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
    }
    router.push('/cv');
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
      experience: [
        { id: `exp-${Date.now()}`, role: '', company: '', period: '', description: '' },
      ],
      education: [
        { id: `edu-${Date.now()}`, institution: '', degree: '', year: '' },
      ],
      courses: [
        { id: `crs-${Date.now()}`, courseName: '', institution: '', month: '', year: '', description: '' },
      ],
      scholarships: [
        { id: `sch-${Date.now()}`, name: '', provider: '', month: '', year: '', description: '' },
      ],
      volunteers: [
        { id: `vol-${Date.now()}`, organization: '', role: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false, description: '' },
      ],
      references: [
        { id: `ref-${Date.now()}`, fullName: '', title: '', company: '', email: '', phone: '' },
      ],
      languages: [
        { id: `lang-${Date.now()}`, language: '', level: 'Professional' },
      ],
    });
  };

  const handleDeleteCV = (id: string) => {
    const updated = cvList.filter((cv) => cv.id !== id);
    setCvList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuti_cv_list', JSON.stringify(updated));
    }
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
    <div className="space-y-6" suppressHydrationWarning>
      {/* Header Banner - hanya tampil saat di Daftar CV (list view) */}
      {viewMode === 'list' && (
        <div className="bg-[#0D3BD9] rounded-xl p-6 text-white border border-blue-500/50 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 font-semibold text-xs mb-1">
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


            <button
              onClick={() => {
                setAiWizardStep(1);
                setViewMode('ai-wizard');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Buatkan CV oleh AI &amp; Tim</span>
            </button>

            <button
              onClick={() => {
                setShowTemplateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat CV Mandiri</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: DAFTAR CV */}
      {viewMode === 'list' && (
        <div className="space-y-6">




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
            {/* Card Order Active (Sedang Ditinjau) */}
            {activeOrder && (
              <div className="bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 border-2 border-amber-400/80 dark:border-amber-500/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                          Paket Pro &amp; Expert HR
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          ID: {activeOrder.orderId}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shrink-0 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                      <span>Sedang Ditinjau</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white/80 dark:bg-slate-800/60 border border-amber-200/70 dark:border-slate-800 space-y-2 mb-4 shadow-xs">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Proses Penyempurnaan HR</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{activeOrder.progress}%</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Pesanan sedang ditinjau &amp; disempurnakan oleh <strong className="text-[#1F3578] dark:text-amber-300 font-bold">{activeOrder.hrName}</strong> ({activeOrder.hrRole})
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${activeOrder.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-200/50 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Estimasi: <span className="font-bold text-slate-700 dark:text-slate-200">{activeOrder.estimatedTime}</span>
                  </div>

                  <button
                    onClick={() => setViewMode('ai-progress')}
                    className="px-4 py-2 rounded-lg text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lihat Progress</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

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
                        router.push(`/cv/${cv.id}`);
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Headline / Posisi yang Dilamar *</label>
                          <input
                            type="text"
                            placeholder="Contoh: Senior Full Stack Engineer"
                            value={formData.headline}
                            onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Email Aktif *</label>
                          <input
                            type="email"
                            placeholder="budi@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">No HP / WhatsApp *</label>
                          <input
                            type="text"
                            placeholder="+62 812-3456-7890"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
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
                          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 resize-none"
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
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
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
                        <label className="font-semibold block">Skill Utama</label>
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
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 resize-none"
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
                          className="px-6 py-3 rounded-lg bg-[#0D3BD9] hover:bg-[#0B33BD] text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
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
                  className="px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-[#0D3BD9] dark:text-blue-300 hover:bg-blue-100 font-bold text-xs border border-blue-200 dark:border-blue-800/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Pratinjau Draf CV</span>
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-[#0D3BD9] hover:bg-[#0B33BD] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                <span className="text-[#0D3BD9] dark:text-blue-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Estimasi Selesai: {activeOrder.estimatedTime}</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#0D3BD9] h-full transition-all duration-700"
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
        <div className="flex flex-col space-y-4 max-w-7xl mx-auto w-full">
          {/* TOP BAR ABOVE PREVIEW & EDITOR */}
          <div className="w-full bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 font-bold text-xs border border-orange-200">
                Pratinjau Kertas A4 (Real-time)
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                210 x 297 mm
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Template:
                </span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const newTpl = e.target.value;
                    setSelectedTemplateId(newTpl);
                    if (selectedCV) {
                      const updatedCV = { ...selectedCV, templateId: newTpl };
                      setSelectedCV(updatedCV);
                      setCvList((prevList) => {
                        const nextList = prevList.map((item) => (item.id === selectedCV.id ? updatedCV : item));
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('cuti_cv_list', JSON.stringify(nextList));
                        }
                        return nextList;
                      });
                    }
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer focus:outline-none"
                >
                  {cvTemplates
                    .filter((t) => !t.hidden)
                    .map((tpl) => (
                      <option key={tpl.id} value={tpl.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {tpl.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF A4</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT: SPLIT SCREEN ON DESKTOP (LEFT: A4 CANVAS, RIGHT: INLINE FORM EDITOR) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: CENTERED A4 CANVAS PREVIEW */}
            <div className="lg:col-span-7 xl:col-span-7 w-full overflow-x-auto no-scrollbar pb-4 flex justify-center bg-slate-200/60 dark:bg-slate-950/80 p-4 md:p-6 rounded-xl border border-slate-300/60 dark:border-slate-800 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <A4PaperlikeCanvas templateId={selectedTemplateId} customData={formData} />
            </div>

            {/* RIGHT COLUMN: INLINE FORM CONTROLS DIRECTLY NEXT TO CV (Clean, Frameless Container) */}
            <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col space-y-3">
              {/* Header Panel (Frameless, Direct Page Title & Auto-Save Badge) */}
              <div className="px-1 py-1 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate">
                    {viewMode === 'create' ? 'Input Data CV Saya' : 'Edit Keterangan CV'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Isi data di panel kanan ini untuk memperbarui lembar A4 secara langsung
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tersimpan Otomatis</span>
                </div>
              </div>

              {/* Content Body (10 Vertical Accordions - Natural Page Flow) */}
              <div className="w-full space-y-3">
                <form id="cv-drawer-form" onSubmit={handleSaveCV} className="space-y-3.5 text-xs pb-12">
                  {/* Section 1: Informasi Pribadi & Kontak (Merged) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec1')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Informasi Pribadi &amp; Kontak</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec1'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec1'] && (
                      <div className="p-4 space-y-3.5 bg-white dark:bg-slate-900">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Depan</label>
                            <input
                              type="text"
                              placeholder="e.g., John"
                              value={formData.firstName || ''}
                              onChange={(e) => {
                                const newFirst = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  firstName: newFirst,
                                  fullName: `${newFirst} ${prev.lastName || ''}`.trim(),
                                }));
                              }}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Belakang</label>
                            <input
                              type="text"
                              placeholder="e.g., Doe"
                              value={formData.lastName || ''}
                              onChange={(e) => {
                                const newLast = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  lastName: newLast,
                                  fullName: `${prev.firstName || ''} ${newLast}`.trim(),
                                }));
                              }}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Posisi yang Dilamar / Jabatan Profesional</label>
                          <input
                            type="text"
                            placeholder="e.g., Senior Frontend Engineer"
                            value={formData.headline}
                            onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Kota Domisili</label>
                          <CitySearchInput
                            value={formData.city || formData.location || ''}
                            onChange={(val) => {
                              setFormData((prev) => ({
                                ...prev,
                                city: val,
                                location: val,
                              }));
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Email *</label>
                            <input
                              type="email"
                              required
                              placeholder="e.g., john.doe@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nomor HP *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., +62 812 3456 7890"
                              value={formData.phone}
                              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Website / Portofolio</label>
                            <input
                              type="text"
                              placeholder="e.g., johndoe.dev"
                              value={formData.website || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">LinkedIn</label>
                            <input
                              type="text"
                              placeholder="e.g., linkedin.com/in/johndoe"
                              value={formData.linkedin || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">GitHub</label>
                            <input
                              type="text"
                              placeholder="e.g., github.com/johndoe"
                              value={formData.github || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Foto Profil</label>
                            <input
                              type="text"
                              placeholder="e.g., https://example.com/foto-profil.jpg"
                              value={formData.photoUrl || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, photoUrl: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>


                  {/* Dynamic Reorderable Accordion Sections (2 to 14) */}
                  {activeSectionOrder.map((secKey, idx) => {
                    let title = '';
                    let accordionKey = '';
                    let content: React.ReactNode = null;

                    if (secKey === 'summary') {
                      title = 'Ringkasan Profesional';
                      accordionKey = 'sec2';
                      content = (
                        <textarea
                          rows={4}
                          placeholder="e.g., Senior frontend engineer dengan 8+ tahun pengalaman..."
                          value={formData.summary}
                          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition leading-relaxed shadow-2xs resize-none"
                        />
                      );
                    } else if (secKey === 'experience') {
                      title = 'Pengalaman Kerja';
                      accordionKey = 'sec3';
                      content = (
                        <div className="space-y-4">
                          {formData.experience.map((exp, expIdx) => {
                            const startMonth = exp.startDate?.split(' ')[0] || '';
                            const startYear = exp.startDate?.split(' ')[1] || exp.startDate || '';
                            const endMonth = exp.endDate?.split(' ')[0] || '';
                            const endYear = exp.endDate?.split(' ')[1] || exp.endDate || '';

                            return (
                              <div
                                key={exp.id || expIdx}
                                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <span className="font-bold text-xs text-slate-800 dark:text-white">
                                    Pengalaman Kerja #{expIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        experience: prev.experience.filter((_, i) => i !== expIdx),
                                      }))
                                    }
                                    className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Perusahaan *</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., Acme Corp"
                                      value={exp.company}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...prev.experience];
                                          arr[expIdx] = { ...arr[expIdx], company: val };
                                          return { ...prev, experience: arr };
                                        });
                                      }}
                                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Jabatan *</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., Senior Frontend Engineer"
                                      value={exp.role}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...prev.experience];
                                          arr[expIdx] = { ...arr[expIdx], role: val };
                                          return { ...prev, experience: arr };
                                        });
                                      }}
                                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Lokasi</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., San Francisco, CA"
                                      value={exp.location || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...prev.experience];
                                          arr[expIdx] = { ...arr[expIdx], location: val };
                                          return { ...prev, experience: arr };
                                        });
                                      }}
                                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Website Perusahaan</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., acmecorp.com"
                                      value={exp.website || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...prev.experience];
                                          arr[expIdx] = { ...arr[expIdx], website: val };
                                          return { ...prev, experience: arr };
                                        });
                                      }}
                                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Mulai Bekerja</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <select
                                        value={startMonth}
                                        onChange={(e) => {
                                          const m = e.target.value;
                                          setFormData((prev) => {
                                            const arr = [...prev.experience];
                                            arr[expIdx] = {
                                              ...arr[expIdx],
                                              startDate: `${m} ${startYear}`.trim(),
                                            };
                                            return { ...prev, experience: arr };
                                          });
                                        }}
                                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                                      >
                                        <option value="">Bulan</option>
                                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                                          <option key={m} value={m}>{m}</option>
                                        ))}
                                      </select>
                                      <select
                                        value={startYear}
                                        onChange={(e) => {
                                          const y = e.target.value;
                                          setFormData((prev) => {
                                            const arr = [...prev.experience];
                                            arr[expIdx] = {
                                              ...arr[expIdx],
                                              startDate: `${startMonth} ${y}`.trim(),
                                            };
                                            return { ...prev, experience: arr };
                                          });
                                        }}
                                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                                      >
                                        <option value="">Tahun</option>
                                        {Array.from({ length: 40 }, (_, i) => String(2026 - i)).map((y) => (
                                          <option key={y} value={y}>{y}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Selesai Bekerja</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <select
                                        disabled={exp.isCurrent}
                                        value={endMonth}
                                        onChange={(e) => {
                                          const m = e.target.value;
                                          setFormData((prev) => {
                                            const arr = [...prev.experience];
                                            arr[expIdx] = {
                                              ...arr[expIdx],
                                              endDate: `${m} ${endYear}`.trim(),
                                            };
                                            return { ...prev, experience: arr };
                                          });
                                        }}
                                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 disabled:opacity-50 shadow-2xs cursor-pointer"
                                      >
                                        <option value="">Bulan</option>
                                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                                          <option key={m} value={m}>{m}</option>
                                        ))}
                                      </select>
                                      <select
                                        disabled={exp.isCurrent}
                                        value={endYear}
                                        onChange={(e) => {
                                          const y = e.target.value;
                                          setFormData((prev) => {
                                            const arr = [...prev.experience];
                                            arr[expIdx] = {
                                              ...arr[expIdx],
                                              endDate: `${endMonth} ${y}`.trim(),
                                            };
                                            return { ...prev, experience: arr };
                                          });
                                        }}
                                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 disabled:opacity-50 shadow-2xs cursor-pointer"
                                      >
                                        <option value="">Tahun</option>
                                        {Array.from({ length: 40 }, (_, i) => String(2026 - i)).map((y) => (
                                          <option key={y} value={y}>{y}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="checkbox"
                                    id={`exp-current-${expIdx}`}
                                    checked={exp.isCurrent || false}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[expIdx] = {
                                          ...arr[expIdx],
                                          isCurrent: checked,
                                          endDate: checked ? 'Present' : '',
                                        };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                  />
                                  <label htmlFor={`exp-current-${expIdx}`} className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                    Saya masih bekerja di sini saat ini
                                  </label>
                                </div>

                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Tugas &amp; Pencapaian</label>
                                  <textarea
                                    rows={3}
                                    placeholder="e.g., Memimpin tim frontend 5 orang, mengoptimalkan waktu muat aplikasi hingga 40%..."
                                    value={exp.description}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[expIdx] = { ...arr[expIdx], description: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition leading-relaxed shadow-2xs resize-none"
                                  />
                                </div>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                experience: [
                                  ...prev.experience,
                                  {
                                    id: `exp-${Date.now()}`,
                                    company: '',
                                    role: '',
                                    location: '',
                                    website: '',
                                    startDate: '',
                                    endDate: '',
                                    isCurrent: false,
                                    period: '',
                                    description: '',
                                  },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pengalaman Kerja</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'internships') {
                      title = 'Pengalaman Magang';
                      accordionKey = 'sec4';
                      content = (
                        <div className="space-y-4">
                          {(formData.internships || []).map((item, itemIdx) => (
                            <div
                              key={item.id || itemIdx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Magang #{itemIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      internships: (prev.internships || []).filter((_, i) => i !== itemIdx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Perusahaan *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Tech Startup"
                                    value={item.company}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.internships || [])];
                                        arr[itemIdx] = { ...arr[itemIdx], company: val };
                                        return { ...prev, internships: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Posisi Magang *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., UI/UX Design Intern"
                                    value={item.role}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.internships || [])];
                                        arr[itemIdx] = { ...arr[itemIdx], role: val };
                                        return { ...prev, internships: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Mulai</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Jan 2023"
                                    value={item.startDate || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.internships || [])];
                                        arr[itemIdx] = { ...arr[itemIdx], startDate: val };
                                        return { ...prev, internships: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Selesai</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Jun 2023"
                                    value={item.endDate || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.internships || [])];
                                        arr[itemIdx] = { ...arr[itemIdx], endDate: val };
                                        return { ...prev, internships: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Tugas Magang</label>
                                <textarea
                                  rows={3}
                                  placeholder="e.g., Membantu tim merancang wireframe dan mendesain 10+ komponen UI..."
                                  value={item.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.internships || [])];
                                      arr[itemIdx] = { ...arr[itemIdx], description: val };
                                      return { ...prev, internships: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs resize-none"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                internships: [
                                  ...(prev.internships || []),
                                  {
                                    id: `intern-${Date.now()}`,
                                    company: '',
                                    role: '',
                                    location: '',
                                    startDate: '',
                                    endDate: '',
                                    description: '',
                                  },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pengalaman Magang</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'projects') {
                      title = 'Proyek';
                      accordionKey = 'sec5';
                      content = (
                        <div className="space-y-4">
                          {(formData.projects || []).map((proj, projIdx) => (
                            <div
                              key={proj.id || projIdx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Proyek #{projIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      projects: (prev.projects || []).filter((_, i) => i !== projIdx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Proyek *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., E-Commerce Platform"
                                    value={proj.name}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.projects || [])];
                                        arr[projIdx] = { ...arr[projIdx], name: val };
                                        return { ...prev, projects: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Peran / Posisi</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Lead Developer"
                                    value={proj.role}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.projects || [])];
                                        arr[projIdx] = { ...arr[projIdx], role: val };
                                        return { ...prev, projects: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Teknologi / URL Proyek</label>
                                <input
                                  type="text"
                                  placeholder="e.g., React, Node.js, TailwindCSS • https://project.com"
                                  value={proj.link || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.projects || [])];
                                      arr[projIdx] = { ...arr[projIdx], link: val };
                                      return { ...prev, projects: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Proyek</label>
                                <textarea
                                  rows={3}
                                  placeholder="e.g., Membangun aplikasi toko online dengan fitur payment gateway..."
                                  value={proj.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.projects || [])];
                                      arr[projIdx] = { ...arr[projIdx], description: val };
                                      return { ...prev, projects: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs resize-none"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                projects: [
                                  ...(prev.projects || []),
                                  {
                                    id: `proj-${Date.now()}`,
                                    name: '',
                                    role: '',
                                    link: '',
                                    description: '',
                                  },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Proyek</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'organizations') {
                      title = 'Pengalaman Organisasi';
                      accordionKey = 'sec6';
                      content = (
                        <div className="space-y-4">
                          {(formData.organizations || []).map((org, orgIdx) => (
                            <div
                              key={org.id || orgIdx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Organisasi #{orgIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      organizations: (prev.organizations || []).filter((_, i) => i !== orgIdx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Organisasi *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Himpunan Mahasiswa Informatika"
                                    value={org.name}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.organizations || [])];
                                        arr[orgIdx] = { ...arr[orgIdx], name: val };
                                        return { ...prev, organizations: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Jabatan / Peran *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Ketua Divisi Acara"
                                    value={org.role}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.organizations || [])];
                                        arr[orgIdx] = { ...arr[orgIdx], role: val };
                                        return { ...prev, organizations: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Mulai</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., 2022"
                                    value={org.startDate || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.organizations || [])];
                                        arr[orgIdx] = { ...arr[orgIdx], startDate: val };
                                        return { ...prev, organizations: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Selesai</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., 2023"
                                    value={org.endDate || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.organizations || [])];
                                        arr[orgIdx] = { ...arr[orgIdx], endDate: val };
                                        return { ...prev, organizations: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Kegiatan</label>
                                <textarea
                                  rows={3}
                                  placeholder="e.g., Mengkoordinasikan seminar teknologi nasional dengan 500+ peserta..."
                                  value={org.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.organizations || [])];
                                      arr[orgIdx] = { ...arr[orgIdx], description: val };
                                      return { ...prev, organizations: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs resize-none"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                organizations: [
                                  ...(prev.organizations || []),
                                  {
                                    id: `org-${Date.now()}`,
                                    name: '',
                                    role: '',
                                    startDate: '',
                                    endDate: '',
                                    description: '',
                                  },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pengalaman Organisasi</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'education') {
                      title = 'Pendidikan';
                      accordionKey = 'sec7';
                      content = (
                        <div className="space-y-4">
                          {formData.education.map((edu, eduIdx) => (
                            <div
                              key={edu.id || eduIdx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Pendidikan #{eduIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      education: prev.education.filter((_, i) => i !== eduIdx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Institusi / Sekolah *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Universitas Indonesia"
                                    value={edu.institution}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[eduIdx] = { ...arr[eduIdx], institution: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Gelar / Jurusan *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., S1 Teknik Informatika"
                                    value={edu.degree}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[eduIdx] = { ...arr[eduIdx], degree: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tahun Lulus / Periode</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., 2020 - 2024"
                                    value={edu.year}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[eduIdx] = { ...arr[eduIdx], year: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">IPK / Nilai (GPA)</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., 3.85 / 4.00"
                                    value={edu.gpa || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[eduIdx] = { ...arr[eduIdx], gpa: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                education: [
                                  ...prev.education,
                                  {
                                    id: `edu-${Date.now()}`,
                                    institution: '',
                                    degree: '',
                                    year: '',
                                    gpa: '',
                                  },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pendidikan</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'certifications') {
                      title = 'Sertifikat';
                      accordionKey = 'sec8';
                      content = (
                        <div className="space-y-4">
                          {(formData.certifications || []).map((cert, certIdx) => (
                            <div
                              key={cert.id || certIdx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Sertifikat #{certIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      certifications: (prev.certifications || []).filter((_, i) => i !== certIdx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Sertifikat *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., AWS Certified Solutions Architect"
                                    value={cert.name}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.certifications || [])];
                                        arr[certIdx] = { ...arr[certIdx], name: val };
                                        return { ...prev, certifications: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Penerbit *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Amazon Web Services"
                                    value={cert.issuer}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.certifications || [])];
                                        arr[certIdx] = { ...arr[certIdx], issuer: val };
                                        return { ...prev, certifications: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Terbit</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Nov 2023"
                                  value={cert.issueDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[certIdx] = { ...arr[certIdx], issueDate: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                certifications: [
                                  ...(prev.certifications || []),
                                  {
                                    id: `cert-${Date.now()}`,
                                    name: '',
                                    issuer: '',
                                    issueDate: '',
                                  },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Sertifikat</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'skills') {
                      title = 'Keahlian';
                      accordionKey = 'sec9';
                      content = (
                        <div className="space-y-3.5">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Skill Utama</label>
                            <input
                              type="text"
                              placeholder="e.g., React, TypeScript, Node.js, Next.js"
                              value={formData.skills.join(', ')}
                              onChange={(e) => {
                                const arr = e.target.value.split(',').map((s) => s.trim());
                                setFormData((prev) => ({ ...prev, skills: arr }));
                              }}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                            />
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {formData.skills.filter(Boolean).map((sk, skIdx) => (
                              <span
                                key={skIdx}
                                className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold flex items-center gap-1.5"
                              >
                                {sk}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      skills: prev.skills.filter((_, i) => i !== skIdx),
                                    }))
                                  }
                                  className="text-teal-500 hover:text-rose-500 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (secKey === 'languages') {
                      title = 'Bahasa';
                      accordionKey = 'sec10';
                      content = (
                        <div className="space-y-3.5">
                          {(formData.languages || []).map((lang, langIdx) => (
                            <div key={lang.id || langIdx} className="grid grid-cols-2 gap-3 items-center">
                              <input
                                type="text"
                                placeholder="e.g., Bahasa Indonesia"
                                value={lang.language}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.languages || [])];
                                    arr[langIdx] = { ...arr[langIdx], language: val };
                                    return { ...prev, languages: arr };
                                  });
                                }}
                                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                              />
                              <div className="flex items-center gap-2">
                                <select
                                  value={lang.level}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    setFormData((prev) => {
                                      const arr = [...(prev.languages || [])];
                                      arr[langIdx] = { ...arr[langIdx], level: val };
                                      return { ...prev, languages: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                                >
                                  <option value="Native">Native (Penutur Asli)</option>
                                  <option value="Professional">Professional (Lancar)</option>
                                  <option value="Conversational">Conversational (Menengah)</option>
                                  <option value="Basic">Basic (Dasar)</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      languages: (prev.languages || []).filter((_, i) => i !== langIdx),
                                    }))
                                  }
                                  className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                languages: [
                                  ...(prev.languages || []),
                                  { id: `lang-${Date.now()}`, language: '', level: 'Professional' },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Bahasa</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'courses') {
                      title = 'Pelatihan & Kursus';
                      accordionKey = 'sec11';
                      content = (
                        <div className="space-y-4">
                          {(formData.courses || []).map((crs, crsIdx) => (
                            <div key={crs.id || crsIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Kursus #{crsIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      courses: (prev.courses || []).filter((_, i) => i !== crsIdx),
                                    }))
                                  }
                                  className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Kursus / Pelatihan</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Digital Marketing Mastery"
                                    value={crs.courseName}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.courses || [])];
                                        arr[crsIdx] = { ...arr[crsIdx], courseName: val };
                                        return { ...prev, courses: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Penyelenggara</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., RevoU / Google Academy"
                                    value={crs.institution}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.courses || [])];
                                        arr[crsIdx] = { ...arr[crsIdx], institution: val };
                                        return { ...prev, courses: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                courses: [
                                  ...(prev.courses || []),
                                  { id: `crs-${Date.now()}`, courseName: '', institution: '', month: '', year: '', description: '' },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pelatihan</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'scholarships') {
                      title = 'Beasiswa';
                      accordionKey = 'sec12';
                      content = (
                        <div className="space-y-4">
                          {(formData.scholarships || []).map((sch, schIdx) => (
                            <div key={sch.id || schIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Beasiswa #{schIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      scholarships: (prev.scholarships || []).filter((_, i) => i !== schIdx),
                                    }))
                                  }
                                  className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Beasiswa</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Beasiswa Djarum Beasiswa Plus"
                                    value={sch.name}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.scholarships || [])];
                                        arr[schIdx] = { ...arr[schIdx], name: val };
                                        return { ...prev, scholarships: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pemberi Beasiswa</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Djarum Foundation"
                                    value={sch.provider}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.scholarships || [])];
                                        arr[schIdx] = { ...arr[schIdx], provider: val };
                                        return { ...prev, scholarships: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                scholarships: [
                                  ...(prev.scholarships || []),
                                  { id: `sch-${Date.now()}`, name: '', provider: '', month: '', year: '', description: '' },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Beasiswa</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'volunteers') {
                      title = 'Pengalaman Relawan';
                      accordionKey = 'sec13';
                      content = (
                        <div className="space-y-4">
                          {(formData.volunteers || []).map((vol, volIdx) => (
                            <div key={vol.id || volIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Volunteer #{volIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      volunteers: (prev.volunteers || []).filter((_, i) => i !== volIdx),
                                    }))
                                  }
                                  className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Organisasi</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Palang Merah Indonesia"
                                    value={vol.organization}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[volIdx] = { ...arr[volIdx], organization: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Peran / Peran Relawan</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Tim Tanggap Bencana"
                                    value={vol.role}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[volIdx] = { ...arr[volIdx], role: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                volunteers: [
                                  ...(prev.volunteers || []),
                                  { id: `vol-${Date.now()}`, organization: '', role: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false, description: '' },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Volunteer</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'references') {
                      title = 'Referensi';
                      accordionKey = 'sec14';
                      content = (
                        <div className="space-y-4">
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs italic leading-relaxed">
                            Note: Disarankan menulis &quot;Referensi tersedia atas permintaan&quot; pada CV Anda dan memberikan informasi ini secara terpisah saat diminta.
                          </div>

                          {(formData.references || []).map((ref, refIdx) => (
                            <div key={ref.id || refIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Referensi #{refIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      references: (prev.references || []).filter((_, i) => i !== refIdx),
                                    }))
                                  }
                                  className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., John Smith"
                                    value={ref.fullName}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.references || [])];
                                        arr[refIdx] = { ...arr[refIdx], fullName: val };
                                        return { ...prev, references: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jabatan</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Engineering Director"
                                    value={ref.title || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.references || [])];
                                        arr[refIdx] = { ...arr[refIdx], title: val };
                                        return { ...prev, references: arr };
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                references: [
                                  ...(prev.references || []),
                                  { id: `ref-${Date.now()}`, fullName: '', title: '', company: '', email: '', phone: '' },
                                ],
                              }))
                            }
                            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Referensi</span>
                          </button>
                        </div>
                      );
                    }

                    if (!content) return null;

                    return (
                      <CVSectionCard
                        key={secKey}
                        sectionKey={secKey}
                        title={title}
                        accordionKey={accordionKey}
                        index={idx}
                        totalSections={activeSectionOrder.length}
                        isOpen={!!openAccordion[accordionKey]}
                        onToggle={() => toggleAccordion(accordionKey)}
                        onMoveUp={() => moveSectionUpDown(idx, 'up')}
                        onMoveDown={() => moveSectionUpDown(idx, 'down')}
                        onDragStart={(e) => handleSectionDragStart(e, idx)}
                        onDragOver={(e) => handleSectionDragOver(e, idx)}
                        onDrop={(e) => handleSectionDrop(e, idx)}
                        isDragged={draggedSectionIndex === idx}
                      >
                        {content}
                      </CVSectionCard>
                    );
                  })}

                  {/* Section 3: Pengalaman Kerja */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec3')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Pengalaman Kerja</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec3'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec3'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {formData.experience.map((exp, idx) => {
                          const startMonth = exp.startDate?.split(' ')[0] || '';
                          const startYear = exp.startDate?.split(' ')[1] || exp.startDate || '';
                          const endMonth = exp.endDate?.split(' ')[0] || '';
                          const endYear = exp.endDate?.split(' ')[1] || exp.endDate || '';

                          return (
                            <div
                              key={exp.id || idx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                  <span className="font-bold text-xs text-slate-800 dark:text-white">
                                    Pengalaman Kerja #{idx + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        experience: prev.experience.filter((_, i) => i !== idx),
                                      }))
                                    }
                                    className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Perusahaan *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Acme Corp"
                                    value={exp.company}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[idx] = { ...arr[idx], company: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Jabatan *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Senior Frontend Engineer"
                                    value={exp.role}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[idx] = { ...arr[idx], role: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Lokasi</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., San Francisco, CA"
                                    value={exp.location || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[idx] = { ...arr[idx], location: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Website Perusahaan</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., acme.example.com"
                                    value={exp.website || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[idx] = { ...arr[idx], website: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Start Date</label>
                                  <CustomDatePicker
                                    value={exp.startDate || ''}
                                    placeholder="Pilih Bulan &amp; Tahun Masuk..."
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[idx] = { ...arr[idx], startDate: val, period: `${val} - ${arr[idx].endDate || ''}` };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                  />
                                </div>

                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">End Date</label>
                                  <CustomDatePicker
                                    disabled={exp.isCurrent}
                                    value={exp.isCurrent ? 'Sekarang' : (exp.endDate || '')}
                                    placeholder="Pilih Bulan &amp; Tahun Keluar..."
                                    allowPresent
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        const isCurr = val === 'Sekarang';
                                        arr[idx] = {
                                          ...arr[idx],
                                          endDate: val,
                                          isCurrent: isCurr,
                                          period: `${arr[idx].startDate || ''} - ${val}`,
                                        };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                  />
                                </div>
                              </div>

                              <label className="flex items-center gap-2 font-medium text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={exp.isCurrent || false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFormData((prev) => {
                                      const arr = [...prev.experience];
                                      arr[idx] = {
                                        ...arr[idx],
                                        isCurrent: checked,
                                        endDate: checked ? 'Sekarang' : '',
                                        period: `${arr[idx].startDate || ''} - ${checked ? 'Sekarang' : ''}`,
                                      };
                                      return { ...prev, experience: arr };
                                    });
                                  }}
                                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                                />
                                <span>Masih Bekerja</span>
                              </label>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Pekerjaan</label>
                                <textarea
                                  rows={2}
                                  placeholder="Deskripsi tugas dan tanggung jawab..."
                                  value={exp.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...prev.experience];
                                      arr[idx] = { ...arr[idx], description: val };
                                      return { ...prev, experience: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs resize-none"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Pencapaian Utama</label>
                                <textarea
                                  rows={1}
                                  placeholder="Hasil atau pencapaian terukur yang diraih..."
                                  value={exp.achievements || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...prev.experience];
                                      arr[idx] = { ...arr[idx], achievements: val };
                                      return { ...prev, experience: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs resize-none"
                                />
                              </div>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              experience: [
                                ...prev.experience,
                                {
                                  id: `exp-${Date.now()}`,
                                  role: '',
                                  company: '',
                                  period: '',
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Pengalaman Kerja</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Pengalaman Magang */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec4')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Pengalaman Magang</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec4'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec4'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.internships || []).map((int, idx) => (
                          <div
                            key={int.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Pengalaman Magang #{idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      internships: (prev.internships || []).filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Perusahaan *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Tech Internship Inc"
                                  value={int.company}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.internships || [])];
                                      arr[idx] = { ...arr[idx], company: val };
                                      return { ...prev, internships: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Posisi Magang *</label>
                                <input
                                  placeholder="e.g., Frontend Developer Intern"
                                  value={int.role}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.internships || [])];
                                      arr[idx] = { ...arr[idx], role: val };
                                      return { ...prev, internships: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Mulai</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Jun 2021"
                                  value={int.startDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.internships || [])];
                                      arr[idx] = { ...arr[idx], startDate: val };
                                      return { ...prev, internships: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Selesai</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Sep 2021"
                                  value={int.endDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.internships || [])];
                                      arr[idx] = { ...arr[idx], endDate: val };
                                      return { ...prev, internships: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Magang</label>
                              <textarea
                                rows={2}
                                placeholder="Deskripsi aktivitas magang..."
                                value={int.description}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.internships || [])];
                                    arr[idx] = { ...arr[idx], description: val };
                                    return { ...prev, internships: arr };
                                  });
                                }}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              internships: [
                                ...(prev.internships || []),
                                {
                                  id: `int-${Date.now()}`,
                                  role: '',
                                  company: '',
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Pengalaman Magang</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 5: Proyek */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec5')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Proyek</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec5'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec5'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.projects || []).map((proj, idx) => (
                          <div
                            key={proj.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Proyek #{idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      projects: (prev.projects || []).filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Proyek *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., E-Commerce Platform"
                                  value={proj.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.projects || [])];
                                      arr[idx] = { ...arr[idx], name: val };
                                      return { ...prev, projects: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Peran dalam Proyek *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Lead Developer"
                                  value={proj.role}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.projects || [])];
                                      arr[idx] = { ...arr[idx], role: val };
                                      return { ...prev, projects: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Link Proyek / GitHub</label>
                                <input
                                  type="text"
                                  placeholder="e.g., github.com/johndoe/project"
                                  value={proj.link || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.projects || [])];
                                      arr[idx] = { ...arr[idx], link: val };
                                      return { ...prev, projects: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Pengerjaan</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 2023"
                                  value={proj.date || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.projects || [])];
                                      arr[idx] = { ...arr[idx], date: val };
                                      return { ...prev, projects: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Proyek</label>
                              <textarea
                                rows={2}
                                placeholder="Deskripsi fitur dan kontribusi proyek..."
                                value={proj.description}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.projects || [])];
                                    arr[idx] = { ...arr[idx], description: val };
                                    return { ...prev, projects: arr };
                                  });
                                }}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              projects: [
                                ...(prev.projects || []),
                                {
                                  id: `proj-${Date.now()}`,
                                  name: '',
                                  role: '',
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Proyek</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 6: Pengalaman Organisasi */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec6')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Pengalaman Organisasi</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec6'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec6'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.organizations || []).map((org, idx) => (
                          <div
                            key={org.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Organisasi #{idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      organizations: (prev.organizations || []).filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Organisasi *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Himpunan Mahasiswa"
                                  value={org.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.organizations || [])];
                                      arr[idx] = { ...arr[idx], name: val };
                                      return { ...prev, organizations: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Jabatan *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Ketua Divisi IT"
                                  value={org.role}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.organizations || [])];
                                      arr[idx] = { ...arr[idx], role: val };
                                      return { ...prev, organizations: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Mulai</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 2021"
                                  value={org.startDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.organizations || [])];
                                      arr[idx] = { ...arr[idx], startDate: val };
                                      return { ...prev, organizations: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Selesai</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 2022"
                                  value={org.endDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.organizations || [])];
                                      arr[idx] = { ...arr[idx], endDate: val };
                                      return { ...prev, organizations: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Deskripsi Organisasi</label>
                              <textarea
                                rows={2}
                                placeholder="Deskripsi peranan dan kegiatan..."
                                value={org.description}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.organizations || [])];
                                    arr[idx] = { ...arr[idx], description: val };
                                    return { ...prev, organizations: arr };
                                  });
                                }}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              organizations: [
                                ...(prev.organizations || []),
                                {
                                  id: `org-${Date.now()}`,
                                  role: '',
                                  name: '',
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Organisasi</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 7: Pendidikan (Education) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec7')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Pendidikan</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec7'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec7'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {formData.education.map((edu, idx) => {
                          const startMonth = edu.startDate?.split(' ')[0] || '';
                          const startYear = edu.startDate?.split(' ')[1] || edu.startDate || '';
                          const endMonth = edu.endDate?.split(' ')[0] || '';
                          const endYear = edu.endDate?.split(' ')[1] || edu.endDate || '';

                          return (
                            <div
                              key={edu.id || idx}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                  <span className="font-bold text-xs text-slate-800 dark:text-white">
                                    Education #{idx + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        education: prev.education.filter((_, i) => i !== idx),
                                      }))
                                    }
                                    className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Institution</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., University of California, Berkeley"
                                    value={edu.institution}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[idx] = { ...arr[idx], institution: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Degree</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Bachelor of Science"
                                    value={edu.degree}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[idx] = { ...arr[idx], degree: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Field of Study</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Computer Science"
                                    value={edu.location || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                      const arr = [...prev.education];
                                        arr[idx] = { ...arr[idx], location: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Start Date</label>
                                    <CustomDatePicker
                                      value={edu.startDate || ''}
                                      placeholder="Pilih Bulan & Tahun Masuk..."
                                      onChange={(val) => {
                                        setFormData((prev) => {
                                          const arr = [...prev.education];
                                          arr[idx] = { ...arr[idx], startDate: val, year: `${val} - ${arr[idx].endDate || ''}` };
                                          return { ...prev, education: arr };
                                        });
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">End Date</label>
                                    <CustomDatePicker
                                      value={edu.endDate || ''}
                                      placeholder="Pilih Bulan & Tahun Lulus..."
                                      allowPresent
                                      onChange={(val) => {
                                        setFormData((prev) => {
                                          const arr = [...prev.education];
                                          arr[idx] = { ...arr[idx], endDate: val, year: `${arr[idx].startDate || ''} - ${val}` };
                                          return { ...prev, education: arr };
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                                <div className="pt-4">
                                  <label className="flex items-center gap-2 font-medium text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                                    />
                                    <span>Currently studying</span>
                                  </label>
                                </div>
                              </div>

                              <div className="max-w-xs">
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">GPA</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 3.9 / 4.0"
                                  value={edu.gpa || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...prev.education];
                                      arr[idx] = { ...arr[idx], gpa: val };
                                      return { ...prev, education: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              education: [
                                ...prev.education,
                                {
                                  id: `edu-${Date.now()}`,
                                  institution: '',
                                  degree: '',
                                  year: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Pendidikan</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 8: Sertifikat */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec8')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Sertifikat</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec8'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec8'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.certifications || []).map((cert, idx) => (
                          <div
                            key={cert.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                  Sertifikat #{idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      certifications: (prev.certifications || []).filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Nama Sertifikat *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., AWS Certified Developer"
                                  value={cert.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[idx] = { ...arr[idx], name: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Penerbit *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Amazon Web Services"
                                  value={cert.issuer}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[idx] = { ...arr[idx], issuer: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Terbit</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 2023"
                                  value={cert.issueDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[idx] = { ...arr[idx], issueDate: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Kedaluwarsa</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 2026"
                                  value={cert.expiryDate || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[idx] = { ...arr[idx], expiryDate: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Link Verifikasi</label>
                                <input
                                  type="text"
                                  placeholder="e.g., aws.amazon.com/verify"
                                  value={cert.link || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[idx] = { ...arr[idx], link: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              certifications: [
                                ...(prev.certifications || []),
                                {
                                  id: `cert-${Date.now()}`,
                                  name: '',
                                  issuer: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Sertifikat</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 9: Keahlian */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec9')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Keahlian</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec9'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec9'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.skillsList || []).map((sk, idx) => (
                          <div
                            key={sk.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 flex items-center gap-2.5 shadow-2xs"
                          >
                            <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                            <input
                              type="text"
                              placeholder="e.g., React.js / TypeScript"
                              value={sk.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const arr = [...(prev.skillsList || [])];
                                  arr[idx] = { ...arr[idx], name: val };
                                  const legacySkills = arr.map((s) => `${s.name} (${s.level})`).filter(Boolean);
                                  return { ...prev, skillsList: arr, skills: legacySkills };
                                });
                              }}
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                            />
                             <CustomSelect
                               value={sk.level}
                               options={['Expert', 'Advanced', 'Intermediate', 'Beginner']}
                               onChange={(val) => {
                                 setFormData((prev) => {
                                   const arr = [...(prev.skillsList || [])];
                                   arr[idx] = { ...arr[idx], level: val as any };
                                   const legacySkills = arr.map((s) => `${s.name} (${s.level})`).filter(Boolean);
                                   return { ...prev, skillsList: arr, skills: legacySkills };
                                 });
                               }}
                               className="w-32"
                             />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => {
                                  const arr = (prev.skillsList || []).filter((_, i) => i !== idx);
                                  const legacySkills = arr.map((s) => `${s.name} (${s.level})`).filter(Boolean);
                                  return { ...prev, skillsList: arr, skills: legacySkills };
                                })
                              }
                              className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              skillsList: [
                                ...(prev.skillsList || []),
                                {
                                  id: `sk-${Date.now()}`,
                                  name: '',
                                  level: 'Advanced',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Skill</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 10: Bahasa */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec10')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Bahasa</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec10'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec10'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.languages || []).map((lang, idx) => (
                          <div
                            key={lang.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 flex items-center gap-2.5 shadow-2xs"
                          >
                            <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                            <input
                              type="text"
                              placeholder="e.g., Bahasa Indonesia / English"
                              value={lang.language}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const arr = [...(prev.languages || [])];
                                  arr[idx] = { ...arr[idx], language: val };
                                  return { ...prev, languages: arr };
                                });
                              }}
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                            />
                            <CustomSelect
                               value={lang.level}
                               options={['Native', 'Professional', 'Conversational', 'Basic']}
                               onChange={(val) => {
                                 setFormData((prev) => {
                                   const arr = [...(prev.languages || [])];
                                   arr[idx] = { ...arr[idx], level: val as any };
                                   return { ...prev, languages: arr };
                                 });
                               }}
                               className="w-36"
                             />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  languages: (prev.languages || []).filter((_, i) => i !== idx),
                                }))
                              }
                              className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              languages: [
                                ...(prev.languages || []),
                                {
                                  id: `lang-${Date.now()}`,
                                  language: '',
                                  level: 'Professional',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Bahasa</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 11: Pelatihan & Kursus (Course) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec11')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800 rounded-t-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Pelatihan &amp; Kursus</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec11'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec11'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.courses || []).map((crs, idx) => (
                          <div
                            key={crs.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Course #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    courses: (prev.courses || []).filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Course Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Machine Learning"
                                value={crs.courseName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.courses || [])];
                                    arr[idx] = { ...arr[idx], courseName: val };
                                    return { ...prev, courses: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Institution / Platform</label>
                              <input
                                type="text"
                                placeholder="e.g., Coursera"
                                value={crs.institution}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.courses || [])];
                                    arr[idx] = { ...arr[idx], institution: val };
                                    return { ...prev, courses: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Completion Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <CustomSelect
                                  value={crs.month || ''}
                                  options={['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
                                  onChange={(val) => {
                                    setFormData((prev) => {
                                      const arr = [...(prev.courses || [])];
                                      arr[idx] = { ...arr[idx], month: val };
                                      return { ...prev, courses: arr };
                                    });
                                  }}
                                  placeholder="Month"
                                />
                                <input
                                  type="text"
                                  placeholder="Year"
                                  value={crs.year || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.courses || [])];
                                      arr[idx] = { ...arr[idx], year: val };
                                      return { ...prev, courses: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Describe what you learned</label>
                              <textarea
                                rows={3}
                                placeholder="Describe what you learned..."
                                value={crs.description || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.courses || [])];
                                    arr[idx] = { ...arr[idx], description: val };
                                    return { ...prev, courses: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              courses: [
                                ...(prev.courses || []),
                                {
                                  id: `crs-${Date.now()}`,
                                  courseName: '',
                                  institution: '',
                                  month: '',
                                  year: '',
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Course</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 12: Beasiswa (Scholarship) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec12')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800 rounded-t-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Beasiswa</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec12'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec12'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.scholarships || []).map((sch, idx) => (
                          <div
                            key={sch.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Scholarship #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scholarships: (prev.scholarships || []).filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Scholarship Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Merit Scholarship for Academic Excellence"
                                value={sch.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.scholarships || [])];
                                    arr[idx] = { ...arr[idx], name: val };
                                    return { ...prev, scholarships: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Provider / Institution</label>
                              <input
                                type="text"
                                placeholder="e.g., University of California"
                                value={sch.provider}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.scholarships || [])];
                                    arr[idx] = { ...arr[idx], provider: val };
                                    return { ...prev, scholarships: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Awarded</label>
                              <div className="grid grid-cols-2 gap-2">
                                <CustomSelect
                                  value={sch.month || ''}
                                  options={['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
                                  onChange={(val) => {
                                    setFormData((prev) => {
                                      const arr = [...(prev.scholarships || [])];
                                      arr[idx] = { ...arr[idx], month: val };
                                      return { ...prev, scholarships: arr };
                                    });
                                  }}
                                  placeholder="Month"
                                />
                                <input
                                  type="text"
                                  placeholder="Year"
                                  value={sch.year || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.scholarships || [])];
                                      arr[idx] = { ...arr[idx], year: val };
                                      return { ...prev, scholarships: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi</label>
                              <textarea
                                rows={3}
                                placeholder="Description (Optional)..."
                                value={sch.description || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.scholarships || [])];
                                    arr[idx] = { ...arr[idx], description: val };
                                    return { ...prev, scholarships: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              scholarships: [
                                ...(prev.scholarships || []),
                                {
                                  id: `sch-${Date.now()}`,
                                  name: '',
                                  provider: '',
                                  month: '',
                                  year: '',
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Scholarship</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 13: Pengalaman Relawan (Volunteer) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec13')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800 rounded-t-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Pengalaman Relawan</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec13'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec13'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {(formData.volunteers || []).map((vol, idx) => (
                          <div
                            key={vol.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Volunteer #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    volunteers: (prev.volunteers || []).filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Organization</label>
                              <input
                                type="text"
                                placeholder="e.g., Red Cross"
                                value={vol.organization}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.volunteers || [])];
                                    arr[idx] = { ...arr[idx], organization: val };
                                    return { ...prev, volunteers: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role</label>
                              <input
                                type="text"
                                placeholder="e.g., First Aid Volunteer"
                                value={vol.role}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.volunteers || [])];
                                    arr[idx] = { ...arr[idx], role: val };
                                    return { ...prev, volunteers: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location</label>
                              <input
                                type="text"
                                placeholder="e.g., San Francisco, CA"
                                value={vol.location || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.volunteers || [])];
                                    arr[idx] = { ...arr[idx], location: val };
                                    return { ...prev, volunteers: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <CustomSelect
                                    value={vol.startMonth || ''}
                                    options={['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[idx] = { ...arr[idx], startMonth: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    placeholder="Month"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Year"
                                    value={vol.startYear || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[idx] = { ...arr[idx], startYear: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <CustomSelect
                                    value={vol.endMonth || ''}
                                    options={['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[idx] = { ...arr[idx], endMonth: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    placeholder="Month"
                                    disabled={vol.isCurrent}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Year"
                                    value={vol.endYear || ''}
                                    disabled={vol.isCurrent}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[idx] = { ...arr[idx], endYear: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 disabled:opacity-50"
                                  />
                                </div>
                              </div>
                            </div>
                            <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={vol.isCurrent || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFormData((prev) => {
                                    const arr = [...(prev.volunteers || [])];
                                    arr[idx] = { ...arr[idx], isCurrent: checked };
                                    return { ...prev, volunteers: arr };
                                  });
                                }}
                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span>I currently volunteer here</span>
                            </label>
                            <div className="space-y-1 pt-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Describe your role and contributions</label>
                              <textarea
                                rows={3}
                                placeholder="Describe your role and contributions..."
                                value={vol.description || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.volunteers || [])];
                                    arr[idx] = { ...arr[idx], description: val };
                                    return { ...prev, volunteers: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              volunteers: [
                                ...(prev.volunteers || []),
                                {
                                  id: `vol-${Date.now()}`,
                                  organization: '',
                                  role: '',
                                  location: '',
                                  startMonth: '',
                                  startYear: '',
                                  endMonth: '',
                                  endYear: '',
                                  isCurrent: false,
                                  description: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Volunteer</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 14: Referensi (Reference) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('sec14')}
                      className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800 rounded-t-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Referensi</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {openAccordion['sec14'] ? (
                          <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openAccordion['sec14'] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs italic leading-relaxed">
                          Note: It&apos;s often best practice to write &quot;References available upon request&quot; on your CV and provide this information separately when asked.
                        </div>

                        {(formData.references || []).map((ref, idx) => (
                          <div
                            key={ref.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Reference #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    references: (prev.references || []).filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                              <input
                                type="text"
                                placeholder="e.g., John Smith"
                                value={ref.fullName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const arr = [...(prev.references || [])];
                                    arr[idx] = { ...arr[idx], fullName: val };
                                    return { ...prev, references: arr };
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Project Manager"
                                  value={ref.title || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.references || [])];
                                      arr[idx] = { ...arr[idx], title: val };
                                      return { ...prev, references: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Innovate Co."
                                  value={ref.company || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.references || [])];
                                      arr[idx] = { ...arr[idx], company: val };
                                      return { ...prev, references: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                <input
                                  type="email"
                                  placeholder="e.g., john.smith@email.com"
                                  value={ref.email || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.references || [])];
                                      arr[idx] = { ...arr[idx], email: val };
                                      return { ...prev, references: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                                <input
                                  type="tel"
                                  placeholder="e.g., +62 812 3456 7890"
                                  value={ref.phone || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.references || [])];
                                      arr[idx] = { ...arr[idx], phone: val };
                                      return { ...prev, references: arr };
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              references: [
                                ...(prev.references || []),
                                {
                                  id: `ref-${Date.now()}`,
                                  fullName: '',
                                  title: '',
                                  company: '',
                                  email: '',
                                  phone: '',
                                },
                              ],
                            }))
                          }
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Reference</span>
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
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

      {/* MODAL 3: PILIH TEMPLATE CV MANDIRI & KONFIGURASI */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header - Unified Blue Theme */}
            <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span>Koleksi Templat CV ATS CUTI</span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white">
                  {templateModalStep === 1 ? 'Pilih Template CV Mandiri' : 'Konfigurasi CV Baru'}
                </h3>
                <p className="text-xs text-blue-100/90">
                  {templateModalStep === 1
                    ? 'Klik template untuk melihat preview A4 dengan data contoh. Pilih yang paling sesuai dengan target pekerjaan kamu.'
                    : `Template terpilih: ${cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'ATS Standard'}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateModalStep(1);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {templateModalStep === 1 ? (
              <>
                {/* STEP 1: Modal Body - 2 Column: Template List + A4 Preview */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left: Template List */}
                  <div className="w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
                    {cvTemplates
                      .filter((tpl) => !tpl.hidden)
                      .map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedTemplateId(tpl.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-2 ring-blue-600/30 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {tpl.badge}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 pt-1">
                                <div className={`p-2 rounded-lg ${tpl.iconColor} shrink-0`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                                  {tpl.name}
                                </h4>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Right: A4 Preview with Dummy Data */}
                  <div className="flex-1 overflow-y-auto bg-slate-200/80 dark:bg-slate-950 p-4 md:p-6 flex justify-center items-start">
                    <div className="relative w-[105mm] h-[148.5mm] shadow-2xl rounded-sm border border-slate-300 dark:border-slate-800 bg-white overflow-hidden shrink-0 my-auto">
                      <div
                        className="w-[210mm] min-h-[297mm] bg-white origin-top-left scale-50 pointer-events-none"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        <CVTemplatePreview templateId={selectedTemplateId} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Step 1 */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Preview dengan data contoh. Semua templat 100% kompatibel dengan sistem ATS.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowTemplateModal(false);
                        setTemplateModalStep(1);
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        const templateName = cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'ATS';
                        setNewCvTitle(`CV ATS - ${templateName}`);
                        setNewCvJobTitle('');
                        setNewCvStartMode('example');
                        setNewCvFile(null);
                        setTemplateModalStep(2);
                      }}
                      className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Gunakan Template Ini</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* STEP 2: Modal Body - 2 Column Layout (Left: Title & Job Target, Right: Start Mode) */}
                <div className="p-6 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-6 flex-1">
                  <div className="w-full bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Sisi Kiri: Template Info + Nama & Lowongan Target */}
                      <div className="space-y-5">
                        {/* Info Template Terpilih */}
                        {(() => {
                          const tpl = cvTemplates.find((t) => t.id === selectedTemplateId) || cvTemplates[0];
                          return (
                            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                  Template Terpilih
                                </span>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{tpl.name}</span>
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => setTemplateModalStep(1)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                Ubah
                              </button>
                            </div>
                          );
                        })()}

                        {/* Input Nama CV */}
                        <div>
                          <label className="block text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                            Nama / Judul CV <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newCvTitle}
                            onChange={(e) => setNewCvTitle(e.target.value)}
                            placeholder="Contoh: CV Loker Software Engineer 2026"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
                          />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Nama untuk memudahkan kamu membedakan file CV di dashboard.
                          </p>
                        </div>

                        {/* Input Lowongan / Target Posisi */}
                        <div>
                          <label className="block text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                            Lowongan / Target Posisi <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newCvJobTitle}
                            onChange={(e) => setNewCvJobTitle(e.target.value)}
                            placeholder="Contoh: Senior Frontend Developer / Staff Administrasi"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
                          />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Posisi pekerjaan spesifik yang menjadi target lamaran kamu.
                          </p>
                        </div>
                      </div>

                      {/* Sisi Kanan: Pilihan Cara Memulai CV */}
                      <div className="space-y-4 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-8">
                        <label className="block text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                          Pilih Cara Memulai Isi CV <span className="text-rose-500">*</span>
                        </label>
                        <div className="space-y-3">
                          {/* Option 1: Mulai dari contoh */}
                          <div
                            onClick={() => setNewCvStartMode('example')}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              newCvStartMode === 'example'
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  Mulai dari Contoh
                                </h5>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                                  Data profil &amp; riwayat contoh yang siap kamu sesuaikan.
                                </p>
                              </div>
                            </div>
                            {newCvStartMode === 'example' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                          </div>

                          {/* Option 2: Kosongkan */}
                          <div
                            onClick={() => setNewCvStartMode('empty')}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              newCvStartMode === 'empty'
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 shrink-0">
                                <Plus className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  Kosongkan (Nol)
                                </h5>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                                  Form CV bersih tanpa isi untuk mengetik manual.
                                </p>
                              </div>
                            </div>
                            {newCvStartMode === 'empty' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                          </div>

                          {/* Option 3: Impor file */}
                          <div
                            onClick={() => setNewCvStartMode('import')}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                              newCvStartMode === 'import'
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 shrink-0">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                    Impor File CV
                                  </h5>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                                    Unggah dokumen CV lama (PDF/DOCX/TXT).
                                  </p>
                                </div>
                              </div>
                              {newCvStartMode === 'import' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                            </div>

                            {/* Extra file input if Impor File selected */}
                            {newCvStartMode === 'import' && (
                              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-center space-y-2">
                                <input
                                  type="file"
                                  id="cv-import-file"
                                  accept=".pdf,.doc,.docx,.txt"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setNewCvFile(e.target.files[0]);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="cv-import-file"
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition shadow-xs"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>{newCvFile ? 'Ganti File' : 'Pilih File CV'}</span>
                                </label>
                                {newCvFile ? (
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    File terpilih: {newCvFile.name} ({(newCvFile.size / 1024).toFixed(1)} KB)
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Format didukung: PDF, DOCX, DOC, TXT (Maks. 5MB)
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Step 2 */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setTemplateModalStep(1)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Templat</span>
                  </button>
                  <button
                    onClick={() => {
                      const newId = `cv-${Date.now()}`;
                      const templateName = cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'ATS';

                      let initialData: Partial<CVData> = {};
                      if (newCvStartMode === 'example') {
                        initialData = {
                          fullName: 'John Doe',
                          headline: newCvJobTitle || 'Software Engineer',
                          email: 'john.doe@example.com',
                          phone: '+62 812-3456-7890',
                          location: 'Jakarta, Indonesia',
                          summary: 'Senior Software Engineer berpengalaman dalam membangun aplikasi web berkinerja tinggi, scalable, dan ATS friendly.',
                          skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST API'],
                          experience: [
                            {
                              id: 'exp-1',
                              company: 'PT Inovasi Teknologi',
                              role: newCvJobTitle || 'Senior Software Engineer',
                              period: '2023 - Sekarang',
                              description: 'Memimpin pengembangan fitur frontend & backend, mengoptimalkan kecepatan load hingga 45%, dan mengimplementasikan CI/CD.',
                            },
                            {
                              id: 'exp-2',
                              company: 'Solusi Digital Indonesia',
                              role: 'Software Engineer',
                              period: '2021 - 2023',
                              description: 'Mengembangkan API mikroservis dan sistem otentikasi aman untuk 100.000+ pengguna aktif bulanan.',
                            },
                          ],
                          education: [
                            {
                              id: 'edu-1',
                              institution: 'Universitas Indonesia',
                              degree: 'S1 Teknik Informatika / Ilmu Komputer (IPK 3.75)',
                              year: '2017 - 2021',
                            },
                          ],
                        };
                      } else if (newCvStartMode === 'import') {
                        initialData = {
                          fullName: '',
                          headline: newCvJobTitle || '',
                          email: '',
                          phone: '',
                          location: '',
                          summary: newCvFile ? `Hasil impor dari dokumen: ${newCvFile.name}` : 'Dokumen CV diimpor.',
                          skills: ['Dokumen Diimpor'],
                          experience: [],
                          education: [],
                        };
                      } else {
                        // empty
                        initialData = {
                          fullName: '',
                          headline: newCvJobTitle || '',
                          email: '',
                          phone: '',
                          location: '',
                          summary: '',
                          skills: [],
                          experience: [],
                          education: [],
                        };
                      }

                      const newCV: CVData = {
                        id: newId,
                        title: newCvTitle || `CV ATS - ${templateName}`,
                        updatedAt: 'Hari ini',
                        atsScore: 85,
                        fullName: '',
                        headline: newCvJobTitle || '',
                        email: '',
                        phone: '',
                        location: '',
                        summary: '',
                        skills: [],
                        experience: [],
                        education: [],
                        templateId: selectedTemplateId,
                        ...initialData,
                      };

                      const updatedList = [newCV, ...cvList];
                      setCvList(updatedList);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
                      }
                      setShowTemplateModal(false);
                      setTemplateModalStep(1);
                      router.push(`/cv/${newId}`);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <span>Buat &amp; Edit CV</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: CV PROMO POPUP MODAL */}
      <CvPromoModal
        isOpen={showCvPromoModal}
        onClose={() => setShowCvPromoModal(false)}
        onStartService={() => {
          setAiWizardStep(1);
          setViewMode('ai-wizard');
        }}
      />
    </div>
  );
};

// A4 Paperlike Canvas Component: Maintains exact A4 proportions per sheet, handles multi-page (Page 2+) flow with top/bottom/left/right padding
const A4PaperlikeCanvas: React.FC<{
  templateId: string;
  customData?: Partial<CVData>;
  showPageNumbers?: boolean;
}> = ({ templateId, customData, showPageNumbers = true }) => {
  const hiddenMeasureRef = useRef<HTMLDivElement>(null);
  const [contentHeightPx, setContentHeightPx] = useState<number>(0);

  useEffect(() => {
    const measure = () => {
      if (hiddenMeasureRef.current) {
        setContentHeightPx(hiddenMeasureRef.current.scrollHeight);
      }
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    if (hiddenMeasureRef.current) {
      observer.observe(hiddenMeasureRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [templateId, customData]);

  // Standard A4 dimensions: 210mm x 297mm
  // Printable content height per page: 273mm (assuming 12mm top and 12mm bottom padding per page)
  const A4_HEIGHT_MM = 297;
  const PADDING_TOP_MM = 12;
  const PADDING_BOTTOM_MM = 12;
  const PRINTABLE_HEIGHT_MM = A4_HEIGHT_MM - (PADDING_TOP_MM + PADDING_BOTTOM_MM); // 273mm

  // Convert px to mm (1px ≈ 0.26458333mm at 96 DPI)
  const measuredHeightMM = contentHeightPx ? contentHeightPx * 0.26458333 : 250;

  // Calculate total required pages (minimum 1 page)
  const totalPages = Math.max(1, Math.ceil(measuredHeightMM / PRINTABLE_HEIGHT_MM));

  return (
    <div className="w-full flex flex-col items-center gap-6 py-2">
      {/* Hidden DOM measurement container */}
      <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <div ref={hiddenMeasureRef} style={{ width: '210mm', background: '#ffffff' }}>
          <CVTemplatePreview templateId={templateId} customData={customData} />
        </div>
      </div>

      {/* Render Paginated A4 Paper Sheets */}
      {Array.from({ length: totalPages }, (_, index) => {
        const pageNum = index + 1;
        const translateYMM = index * PRINTABLE_HEIGHT_MM;

        return (
          <div key={pageNum} className="flex flex-col items-center w-full max-w-[210mm]">
            {/* Page Indicator Badge */}
            {showPageNumbers && (
              <div className="w-full flex items-center justify-between px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Halaman {pageNum} dari {totalPages}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Standard A4 Paper • 210 × 297 mm</span>
              </div>
            )}

            {/* A4 Paperlike Sheet Card */}
            <div
              className="a4-paper-sheet relative bg-white text-slate-900 shadow-2xl shadow-slate-900/15 border border-slate-300/80 dark:border-slate-700/80 rounded-[2px] overflow-hidden transition-all duration-300 hover:shadow-slate-900/25"
              style={{
                width: '210mm',
                height: '297mm',
                boxSizing: 'border-box',
              }}
            >
              {/* Paper Texture Micro-Grain Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-multiply"
                style={{
                  backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Printable Page Inner Layout */}
              <div className="w-full h-full flex flex-col justify-between box-border">
                {/* Top Padding Spacer for Page 2+ */}
                {index > 0 ? (
                  <div style={{ height: `${PADDING_TOP_MM}mm`, flexShrink: 0 }} />
                ) : null}

                {/* Printable Content Slice Viewport */}
                <div
                  className="w-full overflow-hidden flex-1 relative"
                  style={{
                    height: `${PRINTABLE_HEIGHT_MM}mm`,
                    maxHeight: `${PRINTABLE_HEIGHT_MM}mm`,
                  }}
                >
                  <div
                    className="w-full transition-transform duration-200"
                    style={{
                      transform: `translateY(-${translateYMM}mm)`,
                    }}
                  >
                    <CVTemplatePreview templateId={templateId} customData={customData} />
                  </div>
                </div>

                {/* Bottom Padding Spacer for Page 2+ */}
                {index > 0 ? (
                  <div style={{ height: `${PADDING_BOTTOM_MM}mm`, flexShrink: 0 }} />
                ) : null}
              </div>

              {/* Page Break Separation Indicator Line */}
              {totalPages > 1 && pageNum < totalPages && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400/30 via-orange-500/50 to-orange-400/30 border-t border-orange-300/40" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// CV Template Preview Component with Full Data Support
const CVTemplatePreview: React.FC<{ templateId: string; customData?: Partial<CVData> }> = ({ templateId, customData }) => {
  // Data (merges customData with fallback dummy data)
  const dummyData = {
    fullName: customData?.fullName || 'John Doe',
    jobTitle: customData?.headline || 'Senior Frontend Engineer',
    email: customData?.email || 'john.doe@example.com',
    phone: customData?.phone || '+1 555 010 1234',
    location: customData?.location || 'San Francisco, California, United States',
    linkedin: 'johndoe.dev • github.com/johndoe',
    summary:
      customData?.summary ||
      'Senior frontend engineer with 8+ years building accessible, high-performance web applications for fintech and SaaS. Deep experience with React, Next.js, and design systems, with a focus on developer experience and shipping measurable outcomes. Comfortable leading projects end to end and mentoring teams.',
    skills:
      customData?.skills && customData.skills.length > 0
        ? customData.skills
        : [
            'TypeScript (Expert)',
            'JavaScript (ES2023) (Expert)',
            'React & Next.js (Expert)',
            'Node.js (Advanced)',
            'GraphQL & REST APIs (Advanced)',
            'Tailwind CSS (Advanced)',
            'Testing (Playwright, Vitest) (Advanced)',
            'State (Zustand, React Query) (Advanced)',
            'Web Accessibility (WCAG) (Advanced)',
            'CI/CD & Docker (Intermediate)',
          ],
    experience:
      customData?.experience && customData.experience.length > 0
        ? customData.experience.map((exp) => ({
            company: exp.company,
            role: exp.role,
            period: exp.period,
            description: exp.description,
          }))
        : [
            {
              company: 'PT Tech Inovasi Indonesia',
              role: 'Senior Full Stack Developer',
              period: 'Jan 2023 - Sekarang',
              description:
                '• Memimpin migrasi aplikasi monolith ke microservices architecture, meningkatkan scalability 3x lipat\n• Mengembangkan dashboard analytics real-time dengan React & Node.js yang digunakan oleh 50,000+ pengguna\n• Mentoring 4 junior developers dan melakukan code review untuk memastikan best practices\n• Implementasi CI/CD pipeline menggunakan GitHub Actions, mengurangi deployment time 70%',
            },
            {
              company: 'Startup Digital Solutions',
              role: 'Frontend Developer',
              period: 'Mar 2021 - Des 2022',
              description:
                '• Membangun aplikasi e-commerce dengan Next.js & TypeScript, mencapai 95+ Lighthouse score\n• Kolaborasi dengan tim backend untuk integrasi RESTful API dan GraphQL\n• Optimasi Web Vitals dan SEO, meningkatkan organic traffic 40%\n• Implementasi state management dengan Zustand dan caching strategy',
            },
          ],
    education:
      customData?.education && customData.education.length > 0
        ? customData.education.map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            year: edu.year,
            gpa: 'GPA: 3.82/4.00',
          }))
        : [
            {
              institution: 'Universitas Indonesia',
              degree: 'S1 Ilmu Komputer',
              year: '2017 - 2021',
              gpa: 'GPA: 3.82/4.00',
            },
          ],
    projects: [
      {
        name: 'SaaS Dashboard Platform',
        tech: 'React, Next.js, TypeScript, Tailwind CSS, Supabase',
        description:
          'Platform dashboard analytics B2B dengan real-time data visualization dan role-based access control. Digunakan oleh 100+ perusahaan.',
      },
    ],
    courses: customData?.courses || [],
    scholarships: customData?.scholarships || [],
    volunteers: customData?.volunteers || [],
    references: customData?.references || [],
  };

  // Template Renderers
  const renderATSModern = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0
      ? customData.sectionOrder
      : DEFAULT_SECTION_ORDER;

    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            RINGKASAN PROFESIONAL
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            KEAHLIAN TEKNIS
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.skills.join('  •  ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENGALAMAN KERJA
          </h2>
          <div className="space-y-4">
            {dummyData.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                  <p className="text-xs text-slate-600">{exp.period}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-2">{exp.company}</p>
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      internships: (customData?.internships && customData.internships.length > 0) ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENGALAMAN MAGANG
          </h2>
          <div className="space-y-3">
            {customData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-slate-600">{item.startDate} - {item.endDate}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{item.company}</p>
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENDIDIKAN
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-600">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-700">{edu.degree}</p>
              <p className="text-xs text-slate-600">{edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      projects: (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PROYEK UNGGULAN
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx}>
              <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
              <p className="text-xs italic text-slate-600 mb-2">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">{proj.description}</p>
            </div>
          ))}
        </div>
      ),
      organizations: (customData?.organizations && customData.organizations.length > 0) ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENGALAMAN ORGANISASI
          </h2>
          <div className="space-y-3">
            {customData.organizations.map((org, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{org.role}</p>
                  <p className="text-xs text-slate-600">{org.startDate} - {org.endDate}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{org.name}</p>
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{org.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      certifications: (customData?.certifications && customData.certifications.length > 0) ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            SERTIFIKAT
          </h2>
          <div className="space-y-3">
            {customData.certifications.map((cert, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{cert.name}</p>
                  <p className="text-xs text-slate-600">{cert.issueDate}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: (customData?.languages && customData.languages.length > 0) ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            BAHASA
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">
            {customData.languages.map(l => `${l.language} (${l.level})`).join('  •  ')}
          </p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PELATIHAN &amp; KURSUS
          </h2>
          <div className="space-y-3">
            {dummyData.courses.map((crs, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{crs.courseName}</p>
                  <p className="text-xs text-slate-600">
                    {crs.month && crs.year ? `${crs.month} ${crs.year}` : crs.month || crs.year || ''}
                  </p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{crs.institution}</p>
                {crs.description && (
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{crs.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            BEASISWA
          </h2>
          <div className="space-y-3">
            {dummyData.scholarships.map((sch, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{sch.name}</p>
                  <p className="text-xs text-slate-600">
                    {sch.month && sch.year ? `${sch.month} ${sch.year}` : sch.month || sch.year || ''}
                  </p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{sch.provider}</p>
                {sch.description && (
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{sch.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENGALAMAN RELAWAN
          </h2>
          <div className="space-y-3">
            {dummyData.volunteers.map((vol, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{vol.role}</p>
                  <p className="text-xs text-slate-600">
                    {vol.startMonth || vol.startYear ? `${vol.startMonth || ''} ${vol.startYear || ''}` : ''}
                    {' - '}
                    {vol.isCurrent ? 'Sekarang' : (vol.endMonth || vol.endYear ? `${vol.endMonth || ''} ${vol.endYear || ''}` : '')}
                  </p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">
                  {vol.organization}{vol.location ? ` • ${vol.location}` : ''}
                </p>
                {vol.description && (
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{vol.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            REFERENSI
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {dummyData.references.map((ref, idx) => (
              <div key={idx} className="text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm">{ref.fullName}</p>
                {ref.title && <p className="font-semibold text-slate-800">{ref.title}</p>}
                {ref.company && <p className="italic text-slate-600">{ref.company}</p>}
                {ref.email && <p className="text-slate-600">{ref.email}</p>}
                {ref.phone && <p className="text-slate-600">{ref.phone}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-base font-semibold text-slate-700 mb-3">{dummyData.jobTitle}</p>
          <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>{dummyData.email}</span>
            <span>•</span>
            <span>{dummyData.phone}</span>
            <span>•</span>
            <span>{dummyData.location}</span>
            <span>•</span>
            <span className="text-blue-600">{dummyData.linkedin}</span>
          </div>
        </div>

        {/* Dynamic Reordered Sections */}
        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderMinimalistExecutive = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header - Centered */}
      <div className="text-center border-b-2 border-slate-300 pb-4 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
          {dummyData.fullName}
        </h1>
        <p className="text-base font-semibold text-slate-600 mb-3">{dummyData.jobTitle}</p>
        <div className="text-xs text-slate-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>{dummyData.email}</span>
          <span>•</span>
          <span>{dummyData.phone}</span>
          <span>•</span>
          <span>{dummyData.location}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Ringkasan Eksekutif</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>
        <p className="text-xs leading-relaxed text-slate-700 text-center px-8">{dummyData.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Pengalaman Profesional</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>
        <div className="space-y-4 px-4">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-slate-500">{exp.period}</p>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Education Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">Keahlian</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-center">{dummyData.skills.join(' • ')}</p>
        </div>
        <div>
          <div className="flex items-center justify-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">Pendidikan</span>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-900">{dummyData.education[0].institution}</p>
            <p className="text-xs text-slate-700">{dummyData.education[0].degree}</p>
            <p className="text-xs text-slate-600">{dummyData.education[0].year} • {dummyData.education[0].gpa}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativeTech = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header with accent */}
      <div className="border-l-8 border-emerald-500 pl-4 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">
          {dummyData.fullName}
        </h1>
        <p className="text-base font-bold text-emerald-600 mb-2">{dummyData.jobTitle}</p>
        <div className="text-xs text-slate-600 space-y-0.5">
          <p>{dummyData.email} • {dummyData.phone}</p>
          <p>{dummyData.location} • <span className="text-emerald-600">{dummyData.linkedin}</span></p>
        </div>
      </div>

      {/* Skills with Pills */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500"></span>
          TECH STACK & SKILLS
        </h2>
        <div className="flex flex-wrap gap-2">
          {dummyData.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500"></span>
          ABOUT ME
        </h2>
        <p className="text-xs leading-relaxed text-slate-700 text-justify">{dummyData.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500"></span>
          WORK EXPERIENCE
        </h2>
        <div className="space-y-4">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-emerald-200">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-slate-600">{exp.period}</p>
              </div>
              <p className="text-xs font-semibold text-emerald-600 mb-2">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500"></span>
          FEATURED PROJECTS
        </h2>
        {dummyData.projects.map((proj, idx) => (
          <div key={idx} className="pl-4 border-l-2 border-emerald-200">
            <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
            <p className="text-xs text-emerald-600 mb-2">{proj.tech}</p>
            <p className="text-xs leading-relaxed text-slate-700 text-justify">{proj.description}</p>
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500"></span>
          EDUCATION
        </h2>
        <div className="pl-4 border-l-2 border-emerald-200">
          <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs text-slate-700">{dummyData.education[0].degree} • {dummyData.education[0].gpa}</p>
          <p className="text-xs text-slate-600">{dummyData.education[0].year}</p>
        </div>
      </div>
    </div>
  );

  const renderFreshGraduate = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
          {dummyData.fullName}
        </h1>
        <p className="text-base font-semibold text-amber-600 mb-3">{dummyData.jobTitle}</p>
        <div className="text-xs text-slate-600">
          <p>{dummyData.email} • {dummyData.phone}</p>
          <p className="mt-1">{dummyData.location} • {dummyData.linkedin}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-amber-800 mb-2">
          OBJECTIVE
        </h2>
        <p className="text-xs leading-relaxed text-slate-700 text-justify">{dummyData.summary}</p>
      </div>

      {/* Education - Prominent */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
          PENDIDIKAN
        </h2>
        {dummyData.education.map((edu, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-base font-bold text-slate-900">{edu.institution}</p>
              <p className="text-xs text-slate-600">{edu.year}</p>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">{edu.degree}</p>
            <p className="text-xs text-amber-600 font-bold">{edu.gpa}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
          KEAHLIAN TEKNIS
        </h2>
        <div className="flex flex-wrap gap-2">
          {dummyData.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
          PROYEK & PORTOFOLIO
        </h2>
        <div className="space-y-3">
          {dummyData.projects.map((proj, idx) => (
            <div key={idx}>
              <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
              <p className="text-xs text-amber-600 mb-2">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
          PENGALAMAN MAGANG & KERJA
        </h2>
        <div className="space-y-4">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-slate-600">{exp.period}</p>
              </div>
              <p className="text-xs italic text-slate-700 mb-2">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHarvardModern = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="border-b-4 border-slate-900 pb-3 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
          {dummyData.fullName}
        </h1>
        <p className="text-base font-bold text-slate-700 mt-1">{dummyData.jobTitle}</p>
        <p className="text-xs text-slate-600 mt-2">{dummyData.email} | {dummyData.phone} | {dummyData.location}</p>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">SUMMARY</h2>
        <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">EXPERIENCE</h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-3">
            <div className="text-xs font-bold text-slate-600 uppercase">{exp.period}</div>
            <div>
              <p className="text-sm font-bold text-slate-900">{exp.role}</p>
              <p className="text-xs font-semibold text-slate-700">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 mt-1 whitespace-pre-line">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-4 mb-6">
        <div className="text-xs font-bold text-slate-600 uppercase">Education</div>
        <div>
          <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs text-slate-700">{dummyData.education[0].degree} • {dummyData.education[0].gpa}</p>
        </div>
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-4">
        <div className="text-xs font-bold text-slate-600 uppercase">Skills</div>
        <p className="text-xs text-slate-700">{dummyData.skills.join(' • ')}</p>
      </div>
    </div>
  );

  const renderBlueAccent = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <div className="border-b-3 border-blue-600 pb-4 mb-6">
        <h1 className="text-3xl font-black uppercase text-blue-900">{dummyData.fullName}</h1>
        <p className="text-base font-semibold text-blue-600 mt-1">{dummyData.jobTitle}</p>
        <p className="text-xs text-slate-600 mt-2">{dummyData.email} • {dummyData.phone} • {dummyData.location}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">PROFESSIONAL SUMMARY</h2>
        <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">WORK EXPERIENCE</h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-sm font-bold text-slate-900">{exp.role}</p>
              <p className="text-xs text-slate-600">{exp.period}</p>
            </div>
            <p className="text-xs italic text-blue-700 mb-2">{exp.company}</p>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">EDUCATION</h2>
        <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
        <p className="text-xs text-slate-700">{dummyData.education[0].degree} • {dummyData.education[0].gpa}</p>
      </div>

      <div>
        <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">SKILLS</h2>
        <p className="text-xs text-slate-700">{dummyData.skills.join(' • ')}</p>
      </div>
    </div>
  );

  const renderElegantPhoto = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <div className="flex items-start gap-6 border-b-2 border-purple-600 pb-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase text-slate-900">{dummyData.fullName}</h1>
          <p className="text-base font-semibold text-purple-600 mt-1">{dummyData.jobTitle}</p>
          <div className="text-xs text-slate-600 mt-2 space-y-0.5">
            <p>{dummyData.email} • {dummyData.phone}</p>
            <p>{dummyData.location}</p>
          </div>
        </div>
        <div className="w-24 h-24 border-2 border-purple-600 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
          Photo
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">SUMMARY</h2>
        <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">EXPERIENCE</h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-bold text-slate-900">{exp.role}</p>
              <p className="text-xs text-slate-600">{exp.period}</p>
            </div>
            <p className="text-xs italic text-slate-700 mb-2">{exp.company}</p>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">EDUCATION</h2>
          <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs text-slate-700">{dummyData.education[0].degree}</p>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">SKILLS</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{dummyData.skills.slice(0, 8).join(' • ')}</p>
        </div>
      </div>
    </div>
  );

  const renderReziClassic = () => (
    <div className="p-12" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="text-center border-b border-slate-400 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{dummyData.fullName}</h1>
        <p className="text-base text-slate-700 mt-2">{dummyData.jobTitle}</p>
        <p className="text-xs text-slate-600 mt-2">{dummyData.email} | {dummyData.phone} | {dummyData.location}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Professional Summary</h2>
        <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Experience</h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-bold text-slate-900">{exp.role}</p>
              <p className="text-xs text-slate-600 italic">{exp.period}</p>
            </div>
            <p className="text-xs italic text-slate-700 mb-2">{exp.company}</p>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Education</h2>
        <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
        <p className="text-xs text-slate-700">{dummyData.education[0].degree} • {dummyData.education[0].gpa}</p>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Skills</h2>
        <p className="text-xs text-slate-700">{dummyData.skills.join(', ')}</p>
      </div>
    </div>
  );

  const renderModernOrange = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header with Orange Accent */}
      <div className="border-l-8 border-orange-500 pl-6 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">
          {dummyData.fullName}
        </h1>
        <p className="text-lg font-bold text-orange-600 mb-2">{dummyData.jobTitle}</p>
        <div className="text-xs text-slate-600 flex items-center gap-3">
          <span>{dummyData.email}</span>
          <span className="text-orange-500">•</span>
          <span>{dummyData.phone}</span>
          <span className="text-orange-500">•</span>
          <span>{dummyData.location}</span>
        </div>
      </div>

      {/* Professional Summary with Orange Background */}
      <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
        <h2 className="text-sm font-black uppercase text-orange-800 mb-2">ABOUT ME</h2>
        <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
      </div>

      {/* Skills with Orange Pills */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          CORE COMPETENCIES
        </h2>
        <div className="flex flex-wrap gap-2">
          {dummyData.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 text-orange-700 rounded-full text-xs font-bold">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          PROFESSIONAL EXPERIENCE
        </h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4 pl-4 border-l-2 border-orange-300">
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-sm font-bold text-slate-900">{exp.role}</p>
              <p className="text-xs text-orange-600 font-semibold">{exp.period}</p>
            </div>
            <p className="text-xs font-bold text-orange-600 mb-2">{exp.company}</p>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      {/* Education & Projects Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            EDUCATION
          </h2>
          <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs text-slate-700">{dummyData.education[0].degree}</p>
          <p className="text-xs text-orange-600 font-semibold">{dummyData.education[0].gpa}</p>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            PROJECTS
          </h2>
          <p className="text-sm font-bold text-slate-900">{dummyData.projects[0].name}</p>
          <p className="text-xs text-orange-600 mb-1">{dummyData.projects[0].tech}</p>
          <p className="text-xs text-slate-700">{dummyData.projects[0].description}</p>
        </div>
      </div>
    </div>
  );

  const renderExecutiveNavy = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Navy Header Block */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 mb-6 -mx-12 -mt-12 shadow-lg">
        <h1 className="text-3xl font-black uppercase tracking-wide mb-2">
          {dummyData.fullName}
        </h1>
        <p className="text-lg font-semibold text-blue-200 mb-3">{dummyData.jobTitle}</p>
        <div className="text-xs text-blue-100 flex items-center gap-3">
          <span>{dummyData.email}</span>
          <span>|</span>
          <span>{dummyData.phone}</span>
          <span>|</span>
          <span>{dummyData.location}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-6 mt-6">
        <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
          EXECUTIVE PROFILE
        </h2>
        <p className="text-xs leading-relaxed text-slate-700 font-medium">{dummyData.summary}</p>
      </div>

      {/* Core Competencies */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
          CORE COMPETENCIES
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {dummyData.skills.slice(0, 9).map((skill, idx) => (
            <div key={idx} className="text-xs text-slate-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
          LEADERSHIP EXPERIENCE
        </h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-sm font-bold text-blue-900">{exp.role}</p>
              <p className="text-xs text-slate-600 font-semibold">{exp.period}</p>
            </div>
            <p className="text-xs font-bold text-slate-800 mb-2">{exp.company}</p>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
          EDUCATION
        </h2>
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
            <p className="text-xs text-slate-700">{dummyData.education[0].degree}</p>
          </div>
          <p className="text-xs text-slate-600">{dummyData.education[0].gpa}</p>
        </div>
      </div>
    </div>
  );

  const renderTechSidebar = () => (
    <div className="flex" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Left Sidebar - Tech Stack */}
      <div className="w-64 bg-cyan-900 text-white p-6">
        <div className="mb-6">
          <h1 className="text-xl font-black uppercase tracking-tight mb-1">
            {dummyData.fullName.split(' ')[0]}
          </h1>
          <h1 className="text-xl font-black uppercase tracking-tight mb-3">
            {dummyData.fullName.split(' ').slice(1).join(' ')}
          </h1>
          <p className="text-sm font-semibold text-cyan-300">{dummyData.jobTitle}</p>
        </div>

        <div className="mb-6 text-xs space-y-1 text-cyan-100">
          <p>{dummyData.email}</p>
          <p>{dummyData.phone}</p>
          <p>{dummyData.location}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-black uppercase text-cyan-300 mb-3 border-b border-cyan-700 pb-1">
            TECH STACK
          </h2>
          <div className="space-y-2">
            {dummyData.skills.map((skill, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white">{skill}</span>
                </div>
                <div className="w-full bg-cyan-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${90 - idx * 3}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase text-cyan-300 mb-2 border-b border-cyan-700 pb-1">
            LINKS
          </h2>
          <div className="text-xs space-y-1 text-cyan-200">
            <p className="break-all">github.com/rizkypratama</p>
            <p className="break-all">{dummyData.linkedin}</p>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-10">
        <div className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            ABOUT
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            EXPERIENCE
          </h2>
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-slate-600">{exp.period}</p>
              </div>
              <p className="text-xs font-semibold text-cyan-700 mb-2">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            EDUCATION
          </h2>
          <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs text-slate-700">{dummyData.education[0].degree} • {dummyData.education[0].gpa}</p>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            PROJECTS
          </h2>
          <p className="text-sm font-bold text-slate-900">{dummyData.projects[0].name}</p>
          <p className="text-xs text-cyan-700 mb-2">{dummyData.projects[0].tech}</p>
          <p className="text-xs text-slate-700">{dummyData.projects[0].description}</p>
        </div>
      </div>
    </div>
  );

  const renderCharcoalWhite = () => (
    <div className="p-12 bg-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Minimal Header */}
      <div className="text-center border-b border-slate-300 pb-6 mb-6">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-3">
          {dummyData.fullName}
        </h1>
        <p className="text-sm font-medium text-slate-600 mb-3">{dummyData.jobTitle}</p>
        <div className="text-xs text-slate-500 flex items-center justify-center gap-4">
          <span>{dummyData.email}</span>
          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
          <span>{dummyData.phone}</span>
          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
          <span>{dummyData.location}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <p className="text-xs leading-relaxed text-slate-700 text-center max-w-3xl mx-auto">
          {dummyData.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-6">
          Experience
        </h2>
        <div className="space-y-6">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="text-center">
              <p className="text-sm font-bold text-slate-900 mb-1">{exp.role}</p>
              <p className="text-xs font-semibold text-slate-600 mb-1">{exp.company}</p>
              <p className="text-xs text-slate-500 mb-2">{exp.period}</p>
              <p className="text-xs leading-relaxed text-slate-700 max-w-2xl mx-auto whitespace-pre-line">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-4">
          Skills
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {dummyData.skills.map((skill, idx) => (
            <span key={idx} className="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="text-center">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
          Education
        </h2>
        <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
        <p className="text-xs text-slate-700">{dummyData.education[0].degree}</p>
        <p className="text-xs text-slate-600">{dummyData.education[0].gpa}</p>
      </div>
    </div>
  );

  const renderGreenEco = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header with Green Accent */}
      <div className="mb-6 pb-4 border-b-4 border-green-600">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
          {dummyData.fullName}
        </h1>
        <p className="text-base font-bold text-green-600 mb-2">{dummyData.jobTitle}</p>
        <div className="text-xs text-slate-600 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            {dummyData.email}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            {dummyData.phone}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            {dummyData.location}
          </span>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-0.5 bg-green-600"></div>
          <h2 className="text-sm font-black uppercase text-green-800">PROFESSIONAL SUMMARY</h2>
        </div>
        <p className="text-xs leading-relaxed text-slate-700 pl-10">{dummyData.summary}</p>
      </div>

      {/* Skills as Green Tags */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-0.5 bg-green-600"></div>
          <h2 className="text-sm font-black uppercase text-green-800">KEY SKILLS</h2>
        </div>
        <div className="flex flex-wrap gap-2 pl-10">
          {dummyData.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-green-50 border-2 border-green-500 text-green-700 rounded-md text-xs font-bold">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-0.5 bg-green-600"></div>
          <h2 className="text-sm font-black uppercase text-green-800">WORK EXPERIENCE</h2>
        </div>
        <div className="space-y-4 pl-10">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-green-600 font-semibold">{exp.period}</p>
              </div>
              <p className="text-xs font-semibold text-green-700 mb-2">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Projects */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">EDUCATION</h2>
          </div>
          <div className="pl-10">
            <p className="text-sm font-bold text-slate-900">{dummyData.education[0].institution}</p>
            <p className="text-xs text-slate-700">{dummyData.education[0].degree}</p>
            <p className="text-xs text-green-600 font-semibold">{dummyData.education[0].gpa}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">PROJECTS</h2>
          </div>
          <div className="pl-10">
            <p className="text-sm font-bold text-slate-900">{dummyData.projects[0].name}</p>
            <p className="text-xs text-green-700 mb-1">{dummyData.projects[0].tech}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResearchAcademic = () => (
    <div className="p-12" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Academic Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-indigo-700">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
          {dummyData.fullName}
        </h1>
        <p className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
          {dummyData.jobTitle}
        </p>
        <div className="text-xs text-slate-600">
          <p>{dummyData.email} | {dummyData.phone} | {dummyData.location}</p>
          <p className="mt-1 text-indigo-600">{dummyData.linkedin}</p>
        </div>
      </div>

      {/* Research Interests */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-indigo-900 mb-2 text-center">
          Research Interests
        </h2>
        <p className="text-xs leading-relaxed text-slate-700 text-center">{dummyData.summary}</p>
      </div>

      {/* Education - Prominent for Academic */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
          EDUCATION
        </h2>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-base font-bold text-slate-900">{dummyData.education[0].institution}</p>
            <p className="text-xs text-slate-600">{dummyData.education[0].year}</p>
          </div>
          <p className="text-sm font-semibold text-indigo-700 mb-1">{dummyData.education[0].degree}</p>
          <p className="text-xs text-slate-700">{dummyData.education[0].gpa}</p>
          <p className="text-xs text-slate-600 mt-2 italic">
            Thesis: "Machine Learning Applications in Web Performance Optimization"
          </p>
        </div>
      </div>

      {/* Research Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
          RESEARCH & PROFESSIONAL EXPERIENCE
        </h2>
        {dummyData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-sm font-bold text-slate-900">{exp.role}</p>
              <p className="text-xs text-slate-600">{exp.period}</p>
            </div>
            <p className="text-xs font-semibold text-indigo-700 mb-2">{exp.company}</p>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      {/* Publications (Mock) */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
          SELECTED PUBLICATIONS
        </h2>
        <div className="space-y-2 text-xs text-slate-700">
          <p><span className="font-bold">Pratama, R.A.</span> (2025). "Optimizing React Performance with Advanced Caching Strategies." <em>Journal of Web Engineering</em>, 24(3), 112-128.</p>
          <p><span className="font-bold">Pratama, R.A.</span> & Smith, J. (2024). "TypeScript Design Patterns for Scalable Applications." <em>Software Engineering Quarterly</em>, 18(2), 45-62.</p>
        </div>
      </div>

      {/* Skills & Technologies */}
      <div>
        <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
          TECHNICAL SKILLS
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {dummyData.skills.map((skill, idx) => (
            <div key={idx} className="text-xs text-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-700 rounded-full"></span>
              {skill}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- ATM Templates Inspired by rimzzlabs/lanjut ---
  const renderKetikMonospace = () => (
    <div className="p-10 text-slate-800 bg-white font-mono" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
      {/* Typewriter Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
          {dummyData.fullName}
        </h1>
        <p className="text-xs font-semibold text-slate-700 mb-2">
          {`[role: "${dummyData.jobTitle}"]`}
        </p>
        <div className="text-[11px] text-slate-600 space-x-2">
          <span>{dummyData.email}</span> | <span>{dummyData.phone}</span> | <span>{dummyData.location}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
          // SUMMARY
        </h2>
        <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
      </div>

      {/* Skills */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
          // TECH STACK & SKILLS
        </h2>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {dummyData.skills.map((skill, idx) => (
            <span key={idx} className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px]">
              [{skill}]
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-3">
          // EXPERIENCE
        </h2>
        <div className="space-y-4">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-xs font-bold text-slate-900">{exp.role} @ {exp.company}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{exp.period}</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line pl-3 border-l-2 border-slate-300">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
          // EDUCATION
        </h2>
        <div>
          <div className="flex justify-between items-baseline">
            <p className="text-xs font-bold text-slate-900">{dummyData.education[0].institution}</p>
            <p className="text-[11px] text-slate-500">{dummyData.education[0].year}</p>
          </div>
          <p className="text-xs text-slate-700">{dummyData.education[0].degree} — {dummyData.education[0].gpa}</p>
        </div>
      </div>
    </div>
  );

  const renderKetatSerif = () => (
    <div className="p-10 text-slate-900 bg-white font-serif" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
          {dummyData.fullName}
        </h1>
        <p className="text-xs font-medium text-slate-700 italic mb-2">
          {dummyData.jobTitle}
        </p>
        <div className="text-xs text-slate-600 border-b-2 border-slate-900 pb-3">
          {dummyData.location} • {dummyData.phone} • {dummyData.email} • {dummyData.linkedin}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
          SUMMARY
        </h2>
        <p className="text-xs leading-relaxed text-slate-800">{dummyData.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-3">
          EXPERIENCE
        </h2>
        <div className="space-y-4">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="text-xs font-bold text-slate-900">{exp.company} — <span className="font-normal italic">{exp.role}</span></p>
                <p className="text-[11px] italic text-slate-600">{exp.period}</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
          EDUCATION
        </h2>
        <div>
          <div className="flex justify-between items-baseline">
            <p className="text-xs font-bold text-slate-900">{dummyData.education[0].institution}</p>
            <p className="text-[11px] italic text-slate-600">{dummyData.education[0].year}</p>
          </div>
          <p className="text-xs text-slate-800">{dummyData.education[0].degree} ({dummyData.education[0].gpa})</p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
          SKILLS
        </h2>
        <p className="text-xs text-slate-800 leading-relaxed">{dummyData.skills.join(' • ')}</p>
      </div>
    </div>
  );

  const renderLuasaMinimal = () => (
    <div className="p-12 font-sans bg-white text-slate-800">
      {/* Header with generous spacing */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-light tracking-wide text-slate-900 mb-2">
          {dummyData.fullName}
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">
          {dummyData.jobTitle}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span>{dummyData.email}</span>
          <span>{dummyData.phone}</span>
          <span>{dummyData.location}</span>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          PROFILE
        </h2>
        <p className="text-xs leading-loose text-slate-600 font-normal">{dummyData.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          EXPERIENCE
        </h2>
        <div className="space-y-6">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-xs font-semibold text-slate-900">{exp.role}</h3>
                <span className="text-[11px] text-slate-400">{exp.period}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-2">{exp.company}</p>
              <p className="text-xs leading-loose text-slate-600 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Skills */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            EDUCATION
          </h2>
          <p className="text-xs font-semibold text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs text-slate-500">{dummyData.education[0].degree}</p>
          <span className="text-[11px] text-slate-400">{dummyData.education[0].year}</span>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {dummyData.skills.map((skill, idx) => (
              <span key={idx} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTebalBold = () => (
    <div className="p-10 font-sans bg-white text-slate-900">
      {/* Oversized Name Header */}
      <div className="mb-6 pb-4 border-b-4 border-slate-900">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">
          {dummyData.fullName}
        </h1>
        <p className="text-sm font-bold uppercase text-slate-700 mb-3">
          {dummyData.jobTitle}
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
          <span>📍 {dummyData.location}</span>
          <span>📞 {dummyData.phone}</span>
          <span>✉️ {dummyData.email}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
          ABOUT ME
        </h2>
        <p className="text-xs font-medium leading-relaxed text-slate-800">{dummyData.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-4">
          WORK EXPERIENCE
        </h2>
        <div className="space-y-4">
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-xs font-black uppercase text-slate-900">{exp.role}</h3>
                <span className="text-[11px] font-bold text-slate-600">{exp.period}</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mb-1">{exp.company}</p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Education */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {dummyData.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-900 text-white px-2 py-0.5 text-xs font-bold">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            EDUCATION
          </h2>
          <p className="text-xs font-black text-slate-900">{dummyData.education[0].institution}</p>
          <p className="text-xs font-semibold text-slate-700">{dummyData.education[0].degree}</p>
          <p className="text-[11px] text-slate-600">{dummyData.education[0].year} — {dummyData.education[0].gpa}</p>
        </div>
      </div>
    </div>
  );

  // Template Router
  switch (templateId) {
    case 'ketik-monospace':
      return renderKetikMonospace();
    case 'ketat-serif':
      return renderKetatSerif();
    case 'luasa-minimal':
      return renderLuasaMinimal();
    case 'tebal-bold':
      return renderTebalBold();
    case 'minimalist-executive':
      return renderMinimalistExecutive();
    case 'creative-tech':
      return renderCreativeTech();
    case 'fresh-graduate':
      return renderFreshGraduate();
    case 'harvard-modern':
      return renderHarvardModern();
    case 'blue-accent':
      return renderBlueAccent();
    case 'elegant-photo':
      return renderElegantPhoto();
    case 'rezi-classic':
      return renderReziClassic();
    case 'modern-orange':
      return renderModernOrange();
    case 'executive-navy':
      return renderExecutiveNavy();
    case 'tech-sidebar':
      return renderTechSidebar();
    case 'charcoal-white':
      return renderCharcoalWhite();
    case 'green-eco':
      return renderGreenEco();
    case 'research-academic':
      return renderResearchAcademic();
    case 'ats-modern':
    default:
      return renderATSModern();
  }
};
